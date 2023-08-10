import { useRecordContext } from "react-admin";
import CustomTextField from "./components/CustomTextField";
import { typeMapper } from "./representationProvider";
import PropTypes from "prop-types";

/**
 *
 * @returns {React.Component} a field that returns a field based on the type of the source or a custom text field if there is no typeMapper defined for the type of the source
 */
function GenericField(props) {
  const source = props.source;
  const record = useRecordContext(props);
  let Field = typeMapper[source.split("_")[1]];
  Field = Field ? Field : CustomTextField;
  return <Field record={record} source={source} />;
}

GenericField.propTypes = {
  source: PropTypes.string,
};

export default GenericField;