import PropTypes from "prop-types";

function Time(props) {
  const time = props.time;
  const minutes =
    Math.floor((time % 360000) / 6000) + 60 * Math.floor(time / 360000);
  const seconds = Math.floor((time % 6000) / 100) + 60 * minutes;
  const milliseconds = time % 100;

  let display = seconds.toString();
  if (props.showMilliseconds) {
    display = `${display}.${milliseconds}`;
  }

  display += "s";

  return <>{display}</>;
}

Time.propTypes = {
  time: PropTypes.number,
  showMilliseconds: PropTypes.bool,
};

export default Time;
