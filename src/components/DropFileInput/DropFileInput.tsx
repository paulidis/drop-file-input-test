import React from 'react';
import { uploadFile } from '../../services/FileUploadService';
import ProgressBar from '../ProgressBar/ProgressBar';
import uploadImg from '../../assets/cloud-upload-regular-240.png';
import { FaRegCheckCircle, FaRegTimesCircle } from 'react-icons/fa';
import './DropFileInput.css';

interface IFile {
  name: string;
  file: File;
  uploadProgress: number;
  uploadSuccess: boolean;
  uploadFailure: boolean;
}

interface IFileBatch {
  name: string;
  files: IFile[];
}

// drag drop file component
const DropFileInput = (): JSX.Element => {
  // drag state
  const [isDragActive, setIsDragActive] = React.useState(false);
  // selecting file state - otherwise we are naming custodian
  const [isSelectFilesActive, setIsSelectFilesActive] = React.useState(true);
  // ref
  const inputRef = React.useRef<HTMLInputElement>(null);
  // batches of files
  const [fileBatches, setFileBatches] = React.useState<IFileBatch[]>([]);
  // batch input text state
  const [batchInputText, setBatchInputText] = React.useState<string>('');

  // used to resolve a 'stale-closure' issue
  const latestFileBatches = React.useRef(fileBatches);
  latestFileBatches.current = fileBatches;

  const onDragEnterHandler = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragActive(true);
  };

  const onDragOverHandler = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeaveHandler = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragActive(false);
  };

  const onDropHandler = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleChangeFiles(e.dataTransfer.files);
    }
  };

  // triggers when file is selected with click
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();

    if (e.target.files) {
      handleChangeFiles(e.target.files);
    }
  };

  const uploadFileCallback =
    (fileBatchIndex: number): any =>
    (currentFile: File, index: number): void => {
      uploadFile(currentFile, (event) => {
        const newFileBatches = [...latestFileBatches.current];
        newFileBatches[fileBatchIndex].files[index].uploadProgress =
          (event.loaded / event.total) * 100;
        setFileBatches(newFileBatches);
      })
        .then((response) => {
          const newFileBatches = [...latestFileBatches.current];
          newFileBatches[fileBatchIndex].files[index].uploadSuccess = true;
          setFileBatches(newFileBatches);
        })
        .catch(() => {
          const newFileBatches = [...latestFileBatches.current];
          newFileBatches[fileBatchIndex].files[index].uploadFailure = true;
          setFileBatches(newFileBatches);
        });
    };

  const buildNewFileBatchFromFileList = (fileList: FileList): IFileBatch => {
    return {
      name: '',
      files: Array.from(fileList).map((file: File) => {
        return {
          name: file.name,
          file,
          uploadProgress: 0,
          uploadSuccess: false,
          uploadFailure: false
        };
      })
    };
  };

  const handleChangeFiles = (fileList: FileList): void => {
    setFileBatches([...fileBatches, buildNewFileBatchFromFileList(fileList)]);

    setIsSelectFilesActive(false);
  };

  // triggers the input when the button is clicked
  const onUploadButtonClick = (): void => {
    inputRef.current?.click();
  };

  const onTextInputChange = (e: React.FormEvent<HTMLInputElement>): void => {
    e.preventDefault();

    setBatchInputText(e.currentTarget.value);
  };

  const onFormSubmit = (event: React.FormEvent): void => {
    event.preventDefault();

    const newFileBatches = [...latestFileBatches.current];
    newFileBatches[newFileBatches.length - 1].name = batchInputText;
    setFileBatches(newFileBatches);

    setIsSelectFilesActive(true);
    setBatchInputText('');

    const fileBatchIndexToUpdate = fileBatches.length - 1;

    fileBatches[fileBatchIndexToUpdate].files.forEach(uploadFileCallback(fileBatchIndexToUpdate));
  };

  const renderSelectFiles = (): JSX.Element => (
    <>
      <div className="select-files-container" onDragEnter={onDragEnterHandler}>
        <input
          ref={inputRef}
          type="file"
          id="input-file-upload"
          multiple={false}
          accept="text/csv"
          onChange={handleChange}
          hidden
        />
        <label
          className={`drop-file-label ${isDragActive ? 'drag-active' : ''}`}
          htmlFor="input-file-upload"
        >
          <div>
            <img src={uploadImg} alt="Drag and Drop files here" />
            <button className="upload-button" onClick={onUploadButtonClick}>
              <p className="upload-button-text">Select files</p>
            </button>
          </div>
        </label>
        {isDragActive && (
          <div
            className="drop-file-placeholder"
            onDragEnter={onDragEnterHandler}
            onDragLeave={onDragLeaveHandler}
            onDragOver={onDragOverHandler}
            onDrop={onDropHandler}
          ></div>
        )}
      </div>
    </>
  );

  const renderSetCustodian = (): JSX.Element => (
    <div className="importing-container">
      <label>Name this batch</label>
      <form onSubmit={onFormSubmit}>
        <input type="text" id="batch-name" value={batchInputText} onChange={onTextInputChange} />
        <button type="submit" disabled={!batchInputText.length}>
          Submit
        </button>
      </form>
    </div>
  );

  return (
    <>
      <div className="drop-file-container">
        {isSelectFilesActive ? renderSelectFiles() : renderSetCustodian()}
      </div>
      {fileBatches.length > 0 && (
        <div>
          {fileBatches.map((fileBatch: IFileBatch, fileBatchIndex: number) => (
            <div key={'file-batch-' + fileBatchIndex}>
              {fileBatch.name && (
                <div className="batch-progress-container">
                  <div className="batch-name">Batch: {fileBatch.name}</div>
                  {fileBatch.files.map((file: IFile, fileIndex: number) => (
                    <div key={'file-index-' + fileIndex}>
                      <div className="file-name-container">
                        <div>{file.name}</div>
                        <div hidden={!file.uploadSuccess} className="icon-success">
                          <FaRegCheckCircle />
                        </div>
                        <div hidden={!file.uploadFailure} className="icon-failure">
                          <FaRegTimesCircle />
                        </div>
                      </div>
                      {!(file.uploadSuccess || file.uploadFailure) && (
                        <ProgressBar percent={file.uploadProgress} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

DropFileInput.propTypes = {};

export default DropFileInput;
