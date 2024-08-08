import { useNavigate } from 'react-router-dom';

import configManager from "../../configManager/configManager";
import Button from '@mui/material/Button';
import IconProvider from "../../IconProvider/IconProvider";


export default function CustomConversionButton({ id }) {

    const navigate = useNavigate();
    const config = configManager.getConfig()
    const queryToConvert = configManager.getQueryById(id);
    const newId = Date.now().toString()

    const adaptedQuery = {
        ...queryToConvert,
        id: newId,
        queryGroupId: "cstm",
    }

    // This function replaces the queryLocation with a querystring, which makes it adapted for a custom query
    async function replaceQueryLocationWithQueryString() {

        const queryString = await configManager.getQueryText(adaptedQuery)

        delete adaptedQuery.queryLocation
        adaptedQuery.queryString = queryString


    }

    // This function handles the conversion of the comunica sources and context
    function convertComunicaContextAndSources() {

        if (adaptedQuery.comunicaContext) {
            if (adaptedQuery.comunicaContext.sources) {
                adaptedQuery.source = adaptedQuery.comunicaContext.sources.join(' ; ')
            }

            const keys = Object.keys(adaptedQuery.comunicaContext);
            const otherKeys = keys.filter(key => key !== 'sources');

            const hasOtherProperties = otherKeys.length > 0;
            if (hasOtherProperties) {
                adaptedQuery.comunicaContextCheck = "on"
            }
        }
    }

    // This function handles the conversion of indirect sources
    async function convertSourcesFromSourceIndex() {
        if (adaptedQuery.sourcesIndex){

            adaptedQuery.sourceIndexCheck = "on";

            const queryString = await configManager.getQueryText(adaptedQuery.sourcesIndex)

            console.log(adaptedQuery.sourcesIndex.url)
            adaptedQuery.indexSourceUrl = adaptedQuery.sourcesIndex.url
            adaptedQuery.indexSourceQuery = queryString

            delete adaptedQuery.sourcesIndex.queryLocation
            adaptedQuery.sourcesIndex.queryString = queryString

        }
    }

    // This function handles the conversion for fixed variables
    function convertTemplatedQueriesFixedVariables() {
        if(adaptedQuery.variables){
            adaptedQuery.directVariablesCheck = "on"
        }
    }


    // This function handles the conversion for indirect variables
    async function convertTemplatedQueriesIndirectVariables() {
        let queryStringList = [];

        if(adaptedQuery.indirectVariables){
            adaptedQuery.indirectVariablesCheck = "on"

            if(adaptedQuery.indirectVariables.queryLocations){
                for (const location of adaptedQuery.indirectVariables.queryLocations) {

                    const result = await fetch(`${config.queryFolder}${location}`);
                    const queryStr = await result.text();
            
                    queryStringList.push(queryStr);
                  }
            }   
            if (adaptedQuery.indirectVariables.queryStrings) {
                queryStringList = [...queryStringList, ...adaptedQuery.indirectVariables.queryStrings];
              }

            adaptedQuery.indirectQueries = queryStringList

        }
    }

    // This function handles the conversion of an ask query
    function convertASKquery() {
        if (adaptedQuery.askQuery){
            adaptedQuery.askQueryCheck = "on"
        }
    }

    function handleSearchParams(queryToHandle) {

        const copyObject = JSON.parse(JSON.stringify(queryToHandle));

        if( copyObject.comunicaContextCheck !== "on"){
            delete copyObject.comunicaContext
        } else {
            delete copyObject.comunicaContext.sources
        }

        for (let content in copyObject) {
            if (typeof copyObject[content] === 'object') {
                copyObject[content] = JSON.stringify(copyObject[content])
            }

        }

        return new URLSearchParams(copyObject);
    }


    const convertQueryToCustom = async () => {


        // logic

        await replaceQueryLocationWithQueryString()
        await convertSourcesFromSourceIndex()
        await convertTemplatedQueriesIndirectVariables()

        convertTemplatedQueriesFixedVariables()
        convertComunicaContextAndSources()
        convertASKquery()


        

        configManager.addNewQueryGroup('cstm', 'Custom queries', 'EditNoteIcon');


        adaptedQuery.searchParams = handleSearchParams(adaptedQuery)

        // const searchParams = new URLSearchParams(adaptedQuery);

        // adaptedQuery.searchParams = searchParams

        configManager.addQuery(adaptedQuery)

        navigate("/" + newId)
    }

    return (
        <Button
            variant="outlined"
            color="warning"
            onClick={convertQueryToCustom}
            type="button"
            startIcon={<IconProvider.SettingsSuggestIcon />}
        >
            Customize
        </Button>

    )
}