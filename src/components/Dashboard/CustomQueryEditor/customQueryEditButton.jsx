import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import IconProvider from '../../../IconProvider/IconProvider';
import configManager from '../../../configManager/configManager';

import TextField from '@mui/material/TextField';

export default function CustomQueryEditButton({ queryID, submitted }) {

    const customQuery = configManager.getQueryById(queryID);
    const navigate = useNavigate();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [saveOpen, setSaveOpen] = useState(false);

    const [copyURL, setCopyUrl] = useState('');
    const [feedback, setFeedback] = useState('');


    const handleEditClick = () => {
        navigate(`/${queryID}/editCustom`)
    }

    const handleDelete = () => {
        setDeleteOpen(false)
        navigate(`/`)
        configManager.deleteQueryById(queryID)
    }

    const handleSave = () => {

        const url = new URL(window.location.href);
        const serverURL = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;

        const savedUrl = `${serverURL}/#/customQuery?${customQuery.searchParams.toString()}`;
        setCopyUrl(savedUrl);
    }

    const handleSaveClose = () => {
        setSaveOpen(false)
        setFeedback('')
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(copyURL);
            setFeedback('Text successfully copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            setFeedback('Failed to copy text.');
        }
    };

    return (
        <React.Fragment>
            <Box display="flex" justifyContent="space-between" width={submitted ? '80%' : '100%'} >
                <Box>
                    <Button variant="contained" startIcon={<IconProvider.ModeEditIcon />} onClick={
                        () => {
                            handleEditClick()
                        }}
                        sx={{ margin: '10px' }}>
                        Edit Query
                    </Button>
                </Box>

                <Box>
                    <Button variant="outlined" color="success" startIcon={<IconProvider.SaveIcon />} onClick={
                        () => {
                            handleSave()
                            setSaveOpen(true)
                        }}
                        sx={{ margin: '10px' }}>
                        Save Query Link
                    </Button>

                    <Button variant="outlined" color="error" startIcon={<IconProvider.DeleteIcon />} onClick={
                        () => {
                            setDeleteOpen(true)
                        }}
                        sx={{ margin: '10px' }}>
                        Delete Query
                    </Button>
                </Box>
            </Box>

            <Dialog
                open={deleteOpen}
                onClose={() => { setDeleteOpen(false) }}
            >
                <DialogTitle>
                    Delete custom query
                </DialogTitle>
                <DialogContent>
                    <DialogContentText >
                        Are you sure you want to delete this query?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="text" onClick={() => { setDeleteOpen(false) }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={saveOpen}
                onClose={() => { setSaveOpen(false) }}

            >
                <DialogTitle>
                    Save custom query link
                </DialogTitle>

                <DialogContent>
                    <DialogContentText >
                        Use this link ro recreate this custom query later.
                    </DialogContentText>

                    <DialogContentText style={{ color: feedback.includes('successfully') ? 'green' : 'red' }} >
                        {feedback}
                    </DialogContentText>

                    <Box width={500}>
                        <TextField
                            label='Query URL'
                            name='queryURL'
                            fullWidth
                            multiline
                            minRows={5}
                            value={copyURL}
                            variant="filled"
                        />
                    </Box>
                </DialogContent>

                <DialogActions >
                    <Button variant="text" onClick={handleSaveClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleCopy} autoFocus startIcon={<IconProvider.ContentCopyIcon />}>
                        Copy to clipboard
                    </Button>
                </DialogActions>
            </Dialog>

        </React.Fragment>
    )
}