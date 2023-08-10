import { useEffect, useState } from "react";
import {
  Datagrid,
  ListView,
  useListContext,
} from "react-admin";
import GDVAction from "../../GDVAction/GDVAction";
import GenericField from "../../../representationProvider/GenericField";

/**
 *
 * @returns custom ListViewer as defined by react-admin
 */
function GDVListViewer(props) {
  const { data } = useListContext(props);
  const [values, setValues] = useState(undefined);
  useEffect(() => {
    if (data && data.length > 0) {
      const setData = reduceDataToObject(data);
      delete setData.id;
      setValues(setData);
    }
  }, [data]);

  return (
    <ListView actions={<GDVAction />} {...props}>
      {values && (
        <Datagrid>
          {Object.keys(values).map((key) => {
            return (
              <GenericField key={key} source={key} label={key.split("_")[0]} />
            );
          })}
        </Datagrid>
      )}
    </ListView>
  );
}

/**
 *
 * @param {List<Object>} data
 * @returns {Object} an object with the keys of the data and the values as an array of the values of the data
 */
function reduceDataToObject(data) {
  const dataObject = {};
  data.forEach((record) => {
    Object.keys(record).forEach((variable) => {
      if (!dataObject[variable]) {
        dataObject[variable] = [];
      }
      dataObject[variable] = dataObject[variable].concat(record[variable]);
    });
  });
  return dataObject;
}


export default GDVListViewer;
