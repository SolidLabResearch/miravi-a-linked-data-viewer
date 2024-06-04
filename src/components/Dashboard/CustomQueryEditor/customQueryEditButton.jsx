import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { QueryEngine } from "@comunica/query-sparql";
import { useLocation, useNavigate } from 'react-router-dom';

import configManager from '../../../configManager/configManager';


const myEngine = new QueryEngine();

export default function CustomQueryEditButton({ queryID }) {

  
    // GET QUERY BY ID    -> not yet implemented
    const customQuery = configManager.getQueryById(queryID);
    const sourcesString = customQuery.comunicaContext.sources.join(' ; ');

    const [openEditor, setOpenEditor] = useState(false);

    const [showError, setShowError] = useState(false);
    const navigate = useNavigate();

    const closeEditor = () => {
        setOpenEditor(false);
        setShowError(false);
    }

    // Need a solutin to reload the new query?

    return (
        <React.Fragment>
            <Button variant="contained" onClick={
                () => { setOpenEditor(true) }}
                sx={{ margin: '10px' }}>
                Edit Query

            </Button>


            <Dialog
                open={openEditor}
                onClose={closeEditor}
                maxWidth={'md'}
                fullWidth
                PaperProps={{
                    component: 'form',
                    onSubmit: async (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const jsonData = Object.fromEntries(formData.entries());

                        // TODO: NEED A CHECK HERE TO SEE IF WE MAY SUBMIT (correct query)
                        //  const data = await executeSPARQLQuery(jsonData.query, jsonData.source, setShowError)
                
                        updateQuery(jsonData, customQuery)
                        closeEditor();
                        navigate('/#')
                    },
                }}
            >
                <DialogTitle> Edit: {customQuery.name}</DialogTitle>

                <DialogContent>
                    <DialogContentText sx={{ mb: '15px' }}>
                        {customQuery.description}
                    </DialogContentText>


                    {/* <div>
                        <TextField
                            required
                            disabled
                            fullWidth
                            name='title'
                            id="outlined-required"
                            label="Query title"
                            helperText="Edit name"
                            variant='outlined'
                            defaultValue={customQuery.name}
                        />

                        <TextField
                            required
                            disabled
                            id="outlined-multiline-flexible"
                            label="Description"
                            name='description'
                            multiline
                            fullWidth
                            minRows={2}
                            variant='outlined'
                            helperText="Edit description"
                            defaultValue={customQuery.description}
                        />
                    </div> */}

                    <div>
                        <TextField
                            required
                            fullWidth
                            name='source'
                            id="outlined-required"
                            label="Data Source "
                            defaultValue={sourcesString}
                            helperText="You can add more than one source separated with ' ; '"
                            variant='outlined'
                        />
                    </div>

                    <div>
                        <TextField
                            required
                            id="outlined-multiline-flexible"
                            label="Custom Query"
                            name='query'
                            multiline
                            fullWidth
                            minRows={5}
                            variant='outlined'
                            defaultValue={customQuery.queryString}
                        />
                    </div>
                    <DialogContentText >
                        When confirming you will be redirected to the dashboard.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeEditor}>Cancel</Button>
                    <Button variant="contained" type="submit">Confirm changes</Button>
                </DialogActions>
            </Dialog>

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
