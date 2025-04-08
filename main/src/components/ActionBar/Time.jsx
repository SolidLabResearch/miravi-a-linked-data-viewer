import PropTypes from "prop-types";
import { Component } from "react";

/**
 * @param {object} props - the props passed down to the component  
 * @returns {Component} a component that displays the time in seconds and milliseconds (if configured to do so)
 */
function Time(props) {
  if (props.showMilliseconds) {
    return <>{`${(props.elapsedMilliseconds / 1000).toFixed(3)} s`}</>;
  } else {
    return <>{`${Math.round(props.elapsedMilliseconds / 1000)} s`}</>;
  }
}

Time.propTypes = {
  elapsedMilliseconds: PropTypes.number,
  showMilliseconds: PropTypes.bool,
};

export default Time;
