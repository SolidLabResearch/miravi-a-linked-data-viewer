import { getRawData } from "./processFunction";
import { UrlField } from "react-admin";
import PropTypes from "prop-types";

function CustomURLField({ source, record }) {
  record[source] = getRawData(record, source);

  return <UrlField record={record} source={source} />;
}

CustomURLField.propTypes = {
  source: PropTypes.string,
  record: PropTypes.object,
};

export default CustomURLField;