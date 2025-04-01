import { Component } from "react";
import { Loading, Datagrid, List, Title, useListContext, useResourceDefinition } from "react-admin";
import ActionBar from "../../ActionBar/ActionBar";
import GenericField from "../../../representationProvider/GenericField";
import TableHeader from "./TableHeader/TableHeader";
import Button from '@mui/material/Button';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { SvgIcon, Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import CustomQueryEditButton from "../../CustomQueryEditor/customQueryEditButton";
import IconProvider from "../../../IconProvider/IconProvider";
import configManager from "../../../configManager/configManager";
import CustomConversionButton from "../../CustomQueryEditor/customConversionButton";


// LOG let queryResultListCounter = 0;

/**
 * @param {object} props - the props passed down to the component
 * @returns {Component} custom ListViewer as defined by react-admin containing the results of the query with each variable its generic field. 
 */
function QueryResultList(props) {
  const { resource, variableValues, changeVariables, submitted } = props;
  const resourceDef = useResourceDefinition();
  const queryTitle = resourceDef?.options?.label;
  const { data, isLoading } = useListContext(props);
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

  const config = configManager.getConfig();
  const query = configManager.getQueryWorkingCopyById(resource);

  // LOG console.log(`--- QueryResultList #${++queryResultListCounter}`);
  // LOG console.log(`props: ${ JSON.stringify(props, null, 2) }`);
  // LOG console.log(`isLoading: ${isLoading}`);

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
          return (<Typography sx={{ fontSize: '1.5rem' }} > {key}: {variableValues[key]} </Typography>)
        })
        }
      </>
      }
      <List
        {...props}
        disableAuthentication={true} // needed to overrule the default, which is to force logging in
        title=" "
        actions={ <ActionBar />}
        empty={<NoValuesDisplay />}
        queryOptions={{
          keepPreviousData: false,
          meta: {
            variableValues: variableValues
          }}}>
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
        </Datagrid>
      </List>
    </div>
  );
}

QueryResultList.propTypes = {
  resource: PropTypes.string.isRequired,
  variableValues: PropTypes.object.isRequired,
  changeVariables: PropTypes.func.isRequired,
  submitted: PropTypes.bool.isRequired
};

const Aside = (props) => {
  const { changeVariables } = props;
  return (
    <Box>
      <Button variant="contained" onClick={changeVariables} startIcon={<IconProvider.TuneIcon/>} sx={{ margin: '10px' }}>Change Variables</Button>
    </Box>
    
  )
}

const NoValuesDisplay = () => {
  return (
<div>
    <Box display="flex" alignItems="center" sx={{ m: 3 }}>
      <SvgIcon component={SearchOffIcon} />
      <span>The result list is empty.</span>
    </Box>
    </div>

  )
}

export default QueryResultList;
