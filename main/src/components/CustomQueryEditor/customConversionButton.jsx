import { useNavigate } from 'react-router-dom';
import configManager from "../../configManager/configManager";
import IconProvider from "../../IconProvider/IconProvider";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function CustomConversionButton({ id }) {

    const navigate = useNavigate();
    const config = configManager.getConfig()

    // We have to make sure we have a deep copy, and not a shallow copy of the original query
    const convertedQuery = JSON.parse(JSON.stringify(configManager.getQueryById(id)));


    const convertQueryToCustom = async () => {

        /* 
            The convertion logic is split up in apart functions to enhance its clarity.
        */

        await replaceQueryLocationWithQueryString()
        await convertSourcesFromSourceIndex()
        await convertTemplatedQueriesIndirectVariables()

        convertTemplatedQueriesFixedVariables()
        convertComunicaContextAndSources()
        convertASKquery()
        convertHttpProxies()

        // The id and group have to be deleted because a new custom query is going to be made. Name is modified.
        delete convertedQuery.id
        delete convertedQuery.queryGroupId
        convertedQuery.name = `(Cloned from) ${convertedQuery.name}`

        // Generate the search parameters so that we can create a custom query.
        const searchParams = handleSearchParams(convertedQuery)
        navigate(`/customQuery?${searchParams.toString()}`)
    }


    // Handles the objects parsing and ensure the correct comunica structure is given
    function handleSearchParams(queryToHandle) {

        const copyObject = JSON.parse(JSON.stringify(queryToHandle));

        for (let content in copyObject) {
            if (typeof copyObject[content] === 'object') {
                copyObject[content] = JSON.stringify(copyObject[content])
            }
        }
        return new URLSearchParams(copyObject);
    }


    // This function replaces the queryLocation with a querystring, which makes it adapted for a custom query
    async function replaceQueryLocationWithQueryString() {
        const queryString = await configManager.getQueryText(convertedQuery)
        convertedQuery.queryString = queryString
        delete convertedQuery.queryLocation
    }

    // This function handles the conversion of the comunica sources and context
    function convertComunicaContextAndSources() {

        if (convertedQuery.comunicaContext) {
            if (convertedQuery.comunicaContext.sources) {
                convertedQuery.source = convertedQuery.comunicaContext.sources.join(' ; ')
            }

            const keys = Object.keys(convertedQuery.comunicaContext);
            const otherKeys = keys.filter(key => key !== 'sources');
            const hasOtherProperties = otherKeys.length > 0;

            if (hasOtherProperties) {
                convertedQuery.comunicaContextCheck = "on"
                delete convertedQuery.comunicaContext.sources
            } else {
                delete convertedQuery.comunicaContext
            }

        }
    }

    // This function handles the conversion of indirect sources
    async function convertSourcesFromSourceIndex() {
        if (convertedQuery.sourcesIndex) {

            convertedQuery.sourceIndexCheck = "on";
            const queryString = await configManager.getQueryText(convertedQuery.sourcesIndex)

            convertedQuery.indexSourceUrl = convertedQuery.sourcesIndex.url
            convertedQuery.indexSourceQuery = queryString
            delete convertedQuery.sourcesIndex.queryLocation
        }
    }

    
    
    // This function handles the conversion for indirect variables
    async function convertTemplatedQueriesIndirectVariables() {
        let queryStringList = [];
        
        if (convertedQuery.indirectVariables) {
            convertedQuery.indirectVariablesCheck = "on"
            
            if (convertedQuery.indirectVariables.queryLocations) {
                for (const location of convertedQuery.indirectVariables.queryLocations) {
                    
                    const result = await fetch(`${config.queryFolder}${location}`);
                    const queryStr = await result.text();
                    
                    queryStringList.push(queryStr);
                }
            }
            if (convertedQuery.indirectVariables.queryStrings) {
                queryStringList = [...queryStringList, ...convertedQuery.indirectVariables.queryStrings];
            }
            
            convertedQuery.indirectQueries = queryStringList
            
        }
    }

    // This function handles the logic for fixed variables
    function convertTemplatedQueriesFixedVariables() {
        if (convertedQuery.variables) {
            convertedQuery.directVariablesCheck = "on"
        }
    }
    
    // This function handles the logic for the ask query
    function convertASKquery() {
        if (convertedQuery.askQuery) {
            convertedQuery.askQueryCheck = "on"
        }
    }

    // This function handles the logic for http proxies
    function convertHttpProxies() {
        if (convertedQuery.httpProxies) {
            convertedQuery.httpProxiesCheck = "on"
        }
    }


    return (
        <Box display="flex" justifyContent="flex-end" width="100%">
            <Button
                variant="outlined"
                color="warning"
                onClick={convertQueryToCustom}
                type="button"
                startIcon={<IconProvider.SettingsSuggestIcon />}
                sx={{ marginTop: '10px' , marginBottom: '10px'}}
            >
                Clone as custom query
            </Button>
        </Box>
    )
}