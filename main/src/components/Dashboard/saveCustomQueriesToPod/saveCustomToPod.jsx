import React, { useState, useEffect, useRef } from 'react';
import IconProvider from '../../../IconProvider/IconProvider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import configManager from '../../../configManager/configManager';
import { addResource, getResource } from './podStorageManager';
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

import { flushSync } from 'react-dom';

export default function SaveCustomToPod() {
    const session = getDefaultSession();
    const formRef = useRef(null);

    const [saveErrorMessage, setSaveErrorMessage] = useState("");
    const [loadErrorMessage, setLoadErrorMessage] = useState("");
    const [saveSuccesMessage, setSaveSuccesMessage] = useState("");
    const [loadSuccesMessage, setLoadSuccesMessage] = useState("");
    const [defaultPodRoot, setDefaultPodRoot] = useState(false);
    const [loadPodUri, setLoadPodUri] = useState("");
    const [savePodUri, setSavePodUri] = useState("");

    const placeholderString = session.info.isLoggedIn ? "" : "Log in to connect to a pod.";

    const [confirmDialog, setConfirmDialog] = useState(false);

    const [overwriteLoad, setOverwriteLoad] = useState(false);

    // Place holders for the textfields
    if (session.info.isLoggedIn) {
        if (!defaultPodRoot) {
            let podRoot = session.info.webId.replace(/profile\/card#.*$/, 'customQueries/myQueries.json');
            setDefaultPodRoot(true);
            setLoadPodUri(podRoot);
            setSavePodUri(podRoot);
        }
    } else {
        if (defaultPodRoot) {
            setDefaultPodRoot(false);
            setLoadPodUri("");
            setSavePodUri("");
        }
    }

    // Prevent double clicking the buttons
    const [isDisabled, setIsDisabled] = useState(false);

    const preventDoubleClick = () => {
        // Disable button after click
        setIsDisabled(true);
        // Simulate operation, like an API call
        setTimeout(() => { setIsDisabled(false) }, 500);
    };


    const handleLoad = async (event) => {
        event.preventDefault();
        preventDoubleClick();

        if (session.info.isLoggedIn) {
            const eventData = new FormData(event.currentTarget);
            const jsonData = Object.fromEntries(eventData.entries());
            const podUriLoad = jsonData.loadFrom;

            try {
                const queries = await getResource(podUriLoad);
                configManager.addCustomQueriesToQueryList(queries, overwriteLoad);
                setLoadErrorMessage('');
                setLoadSuccesMessage("Successfully loaded the queries from the pod!");
            } catch (e) {
                setLoadSuccesMessage("");
                setLoadErrorMessage(e.message);
            }
        }
    }

    const handleSave = async (event) => {
        event.preventDefault();
        preventDoubleClick();

        if (session.info.isLoggedIn) {
            const eventData = new FormData(event.currentTarget);
            const jsonData = Object.fromEntries(eventData.entries());
            const podUriSave = jsonData.saveTo;
            const customQueries = configManager.getCustomQueries();

            try {
                if (customQueries.length === 0) {
                    setSaveSuccesMessage('');
                    setSaveErrorMessage("You have no custom queries.");
                }
                else {
                    setSaveErrorMessage("");
                    const dataTotTransmit = JSON.stringify(customQueries);

                    await addResource(podUriSave, "application/json", dataTotTransmit);
                    setSaveSuccesMessage("Successfully saved you queries on the pod!");
                }
            } catch (e) {
                setSaveSuccesMessage('');
                setSaveErrorMessage(e.message);
            }

        }

    }

    return (
        <Card sx={{ marginTop: '16px', width: '100%' }}>
            <Typography sx={{ padding: '20px' }}>Load/save your custom queries from/to a file in a pod. Saving destroys previous file contents.</Typography>
            <Card
                component="form"
                ref={formRef}
                onSubmit={handleLoad}
                sx={{ padding: '16px', backgroundColor: 'transparent', boxShadow: 'none', width: '100%' }}
            >
                <Typography sx={{ color: 'red', fontWeight: 'bold' }}>{loadErrorMessage}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Button
                        disabled={!session.info.isLoggedIn || isDisabled}
                        variant="outlined"
                        color="warning"
                        type={configManager.localCustomQueriesPresent() ? "button" : "submit"}
                        onClick={() => {
                            if (configManager.localCustomQueriesPresent()) {
                                setConfirmDialog(true);
                            }
                        }}
                        startIcon={isDisabled ? <IconProvider.HourglassTopIcon /> : <IconProvider.CloudDownloadIcon />}
                        sx={{ margin: '10px' }}
                    >
                        {isDisabled ? "Patience..." : "Load All"}
                    </Button>

                    <Typography sx={{ width: '30px', marginRight: '10px', color: `${!session.info.isLoggedIn ? 'lightgray' : 'black'}` }}>
                        From:
                    </Typography>

                    <TextField
                        required
                        disabled={!session.info.isLoggedIn}
                        name="loadFrom"
                        placeholder={placeholderString}
                        value={loadPodUri}
                        onChange={(e) => setLoadPodUri(e.target.value)}
                        variant="outlined"
                        sx={{ flexGrow: 1, marginX: '15px' }}
                    />
                </Box>
                <Typography sx={{ color: 'green', fontWeight: 'bold' }}>{loadSuccesMessage}</Typography>

                <Dialog
                    open={confirmDialog}
                    onClose={() => { setConfirmDialog(false) }}
                >
                    <DialogTitle color={"darkorange"} sx={{ textAlign: 'center', fontWeight: 'bold', mt: '15px' }}>
                        WARNING: Loading custom queries from a pod
                    </DialogTitle>

                    <IconButton
                        aria-label="close"
                        onClick={() => { setConfirmDialog(false) }}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: "gray",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>


                    <DialogContent sx={{ mx: '15px' }}>
                        <DialogContentText >
                            You have two options: you can either <b> add new queries</b>, or <b> overwrite existing queries</b>. <br /><br />

                            If you choose to add, <b> new custom queries will be added</b> alongside the existing local custom queries.
                            Local custom queries with matching "id" properties will not be overwritten.<br /><br />

                            If you choose to overwrite, <b> all of your local custom queries will be deleted</b> and replaced with the new ones.<br /><br />

                            To save your current combination of local custom queries as is, you may want to save them to a separate file on the pod before proceeding.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ mb: '15px', mx: '15px', justifyContent: 'center', gap: '25px' }}>

                        <Button
                            variant="contained"
                            color="warning"
                            type='submit'
                            startIcon={<IconProvider.CreateNewFolderIcon />}
                            onClick={() => {
                                if (formRef.current) {
                                    // Using flushSync to be sure the state gets updated before submitting the choice.
                                    flushSync(() => setOverwriteLoad(false));
                                    setConfirmDialog(false);
                                    formRef.current.requestSubmit();
                                }
                            }}
                            autoFocus
                        >
                            Add new queries
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            type='submit'
                            startIcon={<IconProvider.FolderOffIcon />}
                            onClick={() => {
                                if (formRef.current) {
                                    // Using flushSync to be sure the state gets updated before submitting the choice.
                                    flushSync(() => setOverwriteLoad(true));
                                    setConfirmDialog(false);
                                    formRef.current.requestSubmit();
                                }
                            }}
                            autoFocus
                        >
                            Overwrite existing
                        </Button>
                    </DialogActions>
                </Dialog>

            </Card>



            <Card
                component="form"
                onSubmit={handleSave}
                sx={{ padding: '16px', backgroundColor: 'transparent', boxShadow: 'none', width: '100%' }}
            >
                <Typography sx={{ color: 'red', fontWeight: 'bold' }}>{saveErrorMessage}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Button
                        disabled={!session.info.isLoggedIn || isDisabled}
                        variant="outlined"
                        color="success"
                        type="submit"
                        startIcon={isDisabled ? <IconProvider.HourglassTopIcon /> : <IconProvider.CloudUploadIcon />}
                        sx={{ marginX: '10px' }}
                    >
                        {isDisabled ? "Patience..." : "Save All"}
                    </Button>

                    <Typography sx={{ width: '30px', marginRight: '10px', color: `${!session.info.isLoggedIn ? 'lightgray' : 'black'}` }}>
                        To:
                    </Typography>

                    <TextField
                        required
                        disabled={!session.info.isLoggedIn}
                        name="saveTo"
                        placeholder={placeholderString}
                        value={savePodUri}
                        onChange={(e) => setSavePodUri(e.target.value)}
                        variant="outlined"
                        sx={{ flexGrow: 1, marginX: '15px' }}
                    />
                </Box>
                <Typography sx={{ color: 'green', fontWeight: 'bold' }}>{saveSuccesMessage}</Typography>
            </Card>
        </Card>
    )
}
