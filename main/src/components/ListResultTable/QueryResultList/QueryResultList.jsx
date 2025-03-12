import { Component, useEffect, useState } from "react";
import { Datagrid, ListView, Title, useListContext, useResourceDefinition } from "react-admin";
import ActionBar from "../../ActionBar/ActionBar";
import GenericField from "../../../representationProvider/GenericField";
import { Term } from "sparqljs";
import TableHeader from "./TableHeader/TableHeader";
import Button from '@mui/material/Button';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { SvgIcon, Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import CustomQueryEditButton from "../../CustomQueryEditor/customQueryEditButton";
import IconProvider from "../../../IconProvider/IconProvider";
import configManager from "../../../configManager/configManager";
import CustomConversionButton from "../../CustomQueryEditor/customConversionButton";

/**
 * @param {object} props - the props passed down to the component
 * @returns {Component} custom ListViewer as defined by react-admin containing the results of the query with each variable its generic field. 
 */
function QueryResultList(props) {
  const { resource, variables, changeVariables, submitted } = props;
  const resourceDef = useResourceDefinition();

  const queryTitle = resourceDef.options.label;
  const { data } = useListContext(props);
  const [values, setValues] = useState(undefined);
  useEffect(() => {
    if (data && data.length > 0) {
      const setData = reduceDataToObject(data);
      delete setData.id;
      setValues(setData);
    }
  }, [data]);

  const config = configManager.getConfig();
  const query = configManager.getQueryWorkingCopyById(resource);

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '10px' }}>
      <Title title={config.title} />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {submitted && <Aside changeVariables={changeVariables} />}
        {resourceDef.options.queryGroupId === 'cstm' ? <CustomQueryEditButton queryID={resourceDef.name} submitted={submitted} /> : <CustomConversionButton query={query} id={resourceDef.name}/>}
      </div>
      <Typography sx={{ fontSize: '2rem' }} > {queryTitle} </Typography>
      {variables && <>
        {Object.keys(variables).map((key) => {
          return (<Typography sx={{ fontSize: '1.5rem' }} > {key}: {variables[key]} </Typography>)
        })
        }
      </>
      }
      {values ? (
        <ListView title=" " actions={<ActionBar />} {...props} >
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
        </ListView>
      ) :
        <NoValuesDisplay />
      }
    </div>
  );
}

QueryResultList.propTypes = {
  resource: PropTypes.string.isRequired,
  changeVariables: PropTypes.func.isRequired,
  submitted: PropTypes.bool.isRequired
};

/**
 *
 * @param {Array<Term>} data - a list of data objects
 * @returns {Term} an object with the keys of the data and the values as an array of the values of the data
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
