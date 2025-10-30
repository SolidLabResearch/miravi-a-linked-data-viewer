import { Component } from "react";
import { Datagrid, List, Title, Loading, useListContext, useResourceDefinition, downloadCSV } from "react-admin";
import ActionBar from "../../ActionBar/ActionBar";
import GenericField from "../../../representationProvider/GenericField";
import TableHeader from "./TableHeader/TableHeader";
import Button from '@mui/material/Button';
import { Box, Typography } from "@mui/material";
import ErrorDisplay from "../../../components/ErrorDisplay/ErrorDisplay";
import PropTypes from "prop-types";
import CustomQueryEditButton from "../../CustomQueryEditor/customQueryEditButton";
import IconProvider from "../../../IconProvider/IconProvider";
import configManager from "../../../configManager/configManager";
import CustomConversionButton from "../../CustomQueryEditor/customConversionButton";
import jsonExport from 'jsonexport/dist';

// LOG let queryResultListCounter = 0;
// LOG let myDatagridCounter = 0;

/**
 * @param {object} props - the props passed down to the component
 * @returns {Component} custom ListViewer as defined by react-admin containing the results of the query with each variable its generic field. 
 */
function QueryResultList(props) {
  const { updateTimestamp, resource, variableValues, changeVariables, submitted } = props;
  const resourceDef = useResourceDefinition();
  const queryTitle = resourceDef?.options?.label;
  const config = configManager.getConfig();
  const query = configManager.getQueryWorkingCopyById(resource);

  // LOG console.log(`--- QueryResultList #${++queryResultListCounter}`);
  // LOG console.log(`props: ${ JSON.stringify(props, null, 2) }`);

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '10px' }}>
      <Title title={config.title} />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {submitted && <Aside changeVariables={changeVariables} />}
        {resourceDef.options.queryGroupId === 'cstm' ? <CustomQueryEditButton queryID={resourceDef.name} submitted={submitted} /> : <CustomConversionButton query={query} id={resourceDef.name}/>}
      </div>
      <Typography sx={{ fontSize: '2rem' }} > {queryTitle} </Typography>
      {variableValues && <>
        {Object.keys(variableValues).map((key) => {
          return (<Typography key={key} sx={{ fontSize: '1.5rem' }} > {key}: {variableValues[key]} </Typography>)
        })
        }
      </>
      }
      <List
        {...props}
        exporter={exporter}
        disableAuthentication={true} // needed to overrule the default, which is to force logging in
        storeKey={false} // do not remember pagination, sorting, ...
        title=" "
        actions={ <ActionBar />}
        empty={false}
        queryOptions={{
          meta: {
            variableValues,
            updateTimestamp // force the dataProvider to refetch the data when the updateTimestamp changes
          }}}>
        <MyDatagrid {...props} query={query} />
      </List>
    </div>
  );
}

QueryResultList.propTypes = {
  updateTimestamp: PropTypes.number.isRequired,
  resource: PropTypes.string.isRequired,
  variableValues: PropTypes.object.isRequired,
  changeVariables: PropTypes.func.isRequired,
  submitted: PropTypes.bool.isRequired
};

const Aside = (props) => {
  const { changeVariables } = props;
  return (
    <Box>
      <Button variant="contained" onClick={changeVariables} startIcon={<IconProvider.TuneIcon />} sx={{ margin: '10px' }}>Change Variables</Button>
    </Box>
  );
}

const NoValuesDisplay = (props) => {
  const { meta } = props;

  if (meta.errorMessage) {
    return <ErrorDisplay errorMessage={`Something went wrong... ${meta.errorMessage}`} />
  } else if (meta.noSources) {
    return <ErrorDisplay searchingMessage="The result list is empty (no sources found)." />
  } else if (meta.resultEmpty) {
    return <ErrorDisplay searchingMessage="The result list is empty." />
  }
}

const MyDatagrid = (props) => {
  const { query } = props;
  const { data, isLoading, meta } = useListContext();

  // LOG console.log(`--- MyDatagrid #${++myDatagridCounter}`);
  // LOG console.log(`props: ${ JSON.stringify(props, null, 2) }`);
  // LOG console.log(`isLoading: ${isLoading}`);
 
  if (isLoading) {
    return <Loading loadingSecondary={"The list is loading. Just a moment please."} />;
  }

  let values = {};
  if (!isLoading && data && data.length > 0) {
    data.forEach((record) => {
      Object.keys(record).forEach((variable) => {
        if (!values[variable]) {
          values[variable] = [];
        }
        values[variable] = values[variable].concat(record[variable]);
      });
    });
    delete values.id;
  }

  return (
    Object.keys(values).length ?
      <Datagrid header={<TableHeader query={query} />} bulkActionButtons={false}>
        {Object.keys(values).map((key) => {
          return (
            <GenericField
              key={key}
              source={key}
              label={key.split("_")[0]}
            />
          );
        })}
      </Datagrid> :
      <NoValuesDisplay meta={meta} />
  );
}

// https://marmelab.com/react-admin/doc/5.7/List.html#exporter
const exporter = (rows, _, __, resource) => {
  const entriesForExport = rows.map(row => strip(row));
  jsonExport(entriesForExport, (err, csv) => {
    downloadCSV(csv, resource); // download as '<resource>.csv` file
  });
};

function strip(obj, level = 0) {
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      if (level === 0 && k === 'id') {
        // skip id at top level
      } else if (level === 1 && k === 'datatype' && v && typeof v === 'object') {
        // remove x.datatype.termType
        const { termType, ...rest } = v;
        result[k] = strip(rest, level + 1);
      } else {
        result[k] = strip(v, level + 1);
      }
    }
    return result;
  }
  return obj;
}

export default QueryResultList;
