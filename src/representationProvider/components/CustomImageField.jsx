import { getRawData } from "./processFunction";
import { ImageField } from "react-admin";
import PropTypes from "prop-types";

function CustomImageField({ source, record }) {
  record[source] = getRawData(record, source);

  return <ImageField record={record} source={source} />;
}

CustomImageField.propTypes = {
  source: PropTypes.string,
  record: PropTypes.object,
};

export default CustomImageField;