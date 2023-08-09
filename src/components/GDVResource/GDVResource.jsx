import { useEffect, useState } from "react";
import {
  Datagrid,
  useListContext,
  ResourceContextProvider,
  ListContextProvider,
  useListController,
  ListView,
  useRecordContext,
  Loading,
} from "react-admin";
import { typeMapper } from "../../representationProvider/representationProvider";
import PropTypes from "prop-types";
import GDVAction from "../GDVAction/GDVAction";

function GDVResource(props) {
  const {
    debounce,
    disableAuthentication,
    disableSyncWithLocation,
    exporter,
    filter,
    filterDefaultValues,
    perPage,
    resource,
    sort,
    ...rest
  } = props;
  const { isLoading } = useListController();
  console.log(rest.actions);
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
      {isLoading && <Loading />}
      {!isLoading && <GDVListViewer {...rest} />}
    </ListBase>
  );
}

GDVResource.propTypes = {
  debounce: PropTypes.number,
  disableAuthentication: PropTypes.bool,
  disableSyncWithLocation: PropTypes.bool,
  exporter: PropTypes.func,
  filter: PropTypes.object,
  filterDefaultValues: PropTypes.object,
  perPage: PropTypes.number,
  queryOptions: PropTypes.object,
  resource: PropTypes.string,
  sort: PropTypes.object,
};

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
    <ListView actions={<GDVAction/>} {...props}>
      {values && (
        <Datagrid>
          {Object.keys(values).map((key) => {
            return (
              <CustomField key={key} source={key} label={key.split("_")[0]} />
            );
          })}
        </Datagrid>
      )}
    </ListView>
  );
}

function CustomField(props) {
  const source = props.source;
  const record = useRecordContext(props);
  let Field = typeMapper[source.split("_")[1]];
  Field = Field ? Field : CustomTextField;
  return <Field record={record} source={source} />;
}

CustomField.propTypes = {
  source: PropTypes.string,
};

function CustomTextField({ record, source }) {
  const value = record[source];
  let text = value ? value : "";
  if (value) {
    text = value.value ? value.value : value.id;
  }
  return <span>{text}</span>;
}

CustomTextField.propTypes = {
  record: PropTypes.object,
  source: PropTypes.string,
};

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

ListBase.propTypes = {
  children: PropTypes.node,
  resource: PropTypes.string,
  filter: PropTypes.object,
  sort: PropTypes.object,
  perPage: PropTypes.number,
  debounce: PropTypes.number,
  exporter: PropTypes.func,
  disableAuthentication: PropTypes.bool,
  disableSyncWithLocation: PropTypes.bool,
  filterDefaultValues: PropTypes.object,
  queryOptions: PropTypes.object,
};

export default GDVResource;
