import PropTypes from "prop-types";
import { Component } from "react";

/**
 * @param {object} props the props passed down to the component  
 * @returns {Component} a component that displays the time in seconds and milliseconds (if configured to do so)
 */
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
