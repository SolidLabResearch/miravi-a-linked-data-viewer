import { useEffect, useState } from "react";
import {
  Datagrid,
  useListContext,
  ResourceContextProvider,
  ListContextProvider,
  useListController,
  ListView,
  useRecordContext,
} from "react-admin";
import {typeMapper} from "../../representationProvider/representationProvider";

function GDVResource(props) {
  const {
    debounce,
    disableAuthentication,
    disableSyncWithLocation,
    exporter,
    filter,
    filterDefaultValues,
    perPage,
    queryOptions,
    resource,
    sort,
    ...rest
  } = props;
  return (
    <ListBase
      debounce={debounce}
      disableAuthentication={disableAuthentication}
      disableSyncWithLocation={disableSyncWithLocation}
      exporter={exporter}
      filter={filter}
      filterDefaultValues={filterDefaultValues}
      perPage={perPage}
      queryOptions={{ keepPreviousData: false }}
      resource={resource}
      sort={sort}
    >
      <GDVListViewer {...rest} />
    </ListBase>
  );
}

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
    <ListView {...props}>
      {values && (
        <Datagrid>
          {Object.entries(values).map(([key, value]) => {
            return <CustomField key={key} source={key} label={key.split('_')[0]} />;
          })}
        </Datagrid>
      )}
    </ListView>
  );
}

function CustomField(props){
  const source = props.source;
  const record = useRecordContext(props);
  let Field = typeMapper[source.split("_")[1]];
  Field = Field ? Field : CustomTextField;
  return(
    <Field record={record} source={source} />
  )
}

function CustomTextField({record, source}){
  const value = record[source];
  let text = value ? value : "";
  if(value){
    text = value.value ? value.value : value.id;
  }
  return(
    <span>{text}</span>
  )
}


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

function ListBase({ children, ...props }) {
  return (
    <ResourceContextProvider value={props.resource}>
      <ListContextProvider value={useListController(props)}>
        {children}
      </ListContextProvider>
    </ResourceContextProvider>
  );
}

export default GDVResource;
