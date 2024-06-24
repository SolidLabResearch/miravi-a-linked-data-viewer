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

export default function CustomQueryEditButton({ queryID }) {

    const [open, setOpen] = useState(false);

    const customQuery = configManager.getQueryById(queryID);
    // const sourcesString = customQuery.comunicaContext.sources.join(' ; ');

    const navigate = useNavigate();
    //  const location = useLocation();

    const handleEditClick = () => {
        navigate(`/${queryID}/editCustom`)
    }

    const handleDelete = () => {
        setOpen(false)
        navigate(`/`)
        configManager.deleteQueryById(queryID)
    }

    const handleSave = () => {

        const url = new URL(window.location.href);
        const serverURL = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;

        const savedUrl = `${serverURL}/#/customQuery?${customQuery.searchParams.toString()}`
        console.log(savedUrl)

    }

    return (
        <React.Fragment>
            <Box display="flex" justifyContent="space-between" width="80%" >
                <Box>
                    <Button variant="contained" startIcon={<IconProvider.ModeEditIcon />} onClick={
                        () => {
                            handleEditClick()
                        }}
                        sx={{ margin: '10px' }}>
                        Edit Query
                    </Button>
                </Box>

                {/* // TODO NOW PROVIDE  AN OPTION TO SAVE  BY COPYING TO CLIP BOARD !! */}
                <Box>

                    <Button variant="outlined" color="success" startIcon={<IconProvider.SaveIcon />} onClick={
                        () => {
                            handleSave()
                        }}
                        sx={{ margin: '10px' }}>
                        Save Query
                    </Button>

                    <Button variant="outlined" color="error" startIcon={<IconProvider.DeleteIcon />} onClick={
                        () => {
                            setOpen(true)
                        }}
                        sx={{ margin: '10px' }}>
                        Delete Query
                    </Button>
                </Box>
            </Box>

            <Dialog
                open={open}
                onClose={() => { setOpen(false) }}

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
                    <Button variant="outlined" onClick={() => { setOpen(false) }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </React.Fragment>
    )
}
