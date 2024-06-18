import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';

import { useLocation, useNavigate } from 'react-router-dom';

import configManager from '../../../configManager/configManager';



export default function CustomQueryEditButton({ queryID }) {


    const customQuery = configManager.getQueryById(queryID);
    const sourcesString = customQuery.comunicaContext.sources.join(' ; ');

    const navigate = useNavigate();
    const location = useLocation();

    const handleEditClick = () => {
        navigate(`/${queryID}/editCustom`)
    }

    const handleSave = () => {
        // const searchParams = new URLSearchParams(customQuery);

        //newSearchaparam(geconverteerd object voor form)
        //const savedUrl = `http://localhost:5173/#${location.pathname}?${searchParams.toString()}`

        // const savedUrl = `http://localhost:5173/#/customQuery?${searchParams.toString()}`
        // console.log(customQuery)
        // console.log(savedUrl)

    }

    return (
        <React.Fragment>
            <Button variant="contained" onClick={
                () => {
                    handleEditClick()
                }}
                sx={{ margin: '10px' }}>
                Edit Query

            </Button>

            <Button variant="contained" onClick={
                () => {
                    handleSave()
                }}
                sx={{ margin: '10px' }}>
                Save Query
            </Button>

        </React.Fragment>
    )
}


//Mock query
const updateQuery = (formData, customQuery) => {
    const { query, source } = formData;
    configManager.updateQuery({
        ...customQuery,
        queryString: query,
        comunicaContext: {
            sources: source.split(';').map(src => src.trim())
        },
        // queryLocation: "components.rq"  // Location for testing purposes, delete after it works with the querystring
    });
};
