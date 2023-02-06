import PropTypes from 'prop-types';
import './ProgressBar.css';

interface IProgressBar {
  percent: number;
}

const ProgressBar = ({ percent }: IProgressBar): JSX.Element => (
  <div className="progress-bar-container">
    <div className="progress-bar-percent" style={{ width: percent + '%' }}></div>
  </div>
);

ProgressBar.propTypes = {
  percent: PropTypes.number.isRequired
};

export default ProgressBar;
