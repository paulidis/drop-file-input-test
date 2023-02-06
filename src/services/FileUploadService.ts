// Would normally import the http module for uploading a file but we will mock it here.
// Modern solutions include using observables for http services, but we will use a promise here instead.

// Mocking Latency - 1 second
const LATENCY: number = 1000;
// Mocking the Upload Rate per latency cycle - 50kb
const UPLOAD_RATE: number = 50000;

export const uploadFile = (file: File, onUploadProgress: (event: ProgressEvent) => void) => {
  // Randomly assign the size of the file betweek 10KB and 1MB
  const totalFileSize = Math.floor(Math.random() * 990000) + 10000;

  const delay = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

  // Recursive function to process fileupload in chunks
  const pushData = async (loaded: number, totalFileSize: number) => {
    // calculate the amount of file loading left
    const fileSizeLeft = totalFileSize - loaded;
    // determine next chunk size to load
    const nextChunkSize = fileSizeLeft > UPLOAD_RATE ? UPLOAD_RATE : fileSizeLeft;
    // calculate next latency to use based on the percentage of the next chunk size to process
    const latency = Math.round(nextChunkSize / UPLOAD_RATE) * LATENCY;

    loaded += nextChunkSize;

    await delay(latency);

    onUploadProgress(new ProgressEvent('mock', { total: totalFileSize, loaded }));

    // Determine if we need to calls this function again
    totalFileSize - loaded && (await pushData(loaded, totalFileSize));
  };

  // Call pushData until file is fully uploaded
  return new Promise(async (resolve, reject) => {
    await pushData(0, totalFileSize);
    return resolve(true);
  });
};
