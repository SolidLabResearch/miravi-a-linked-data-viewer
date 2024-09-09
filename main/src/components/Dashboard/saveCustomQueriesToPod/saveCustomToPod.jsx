import React from 'react'
import IconProvider from '../../../IconProvider/IconProvider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';

import configManager from '../../../configManager/configManager';
import authenticationProvider from '../../../authenticationProvider/authenticationProvider';


export default function SaveCustomToPod() {

    const handleLoad = async (event) => {
        event.preventDefault();

        const eventData = new FormData(event.currentTarget);
        const jsonData = Object.fromEntries(eventData.entries());
        console.log(jsonData)

        // Here the logic will follow to load your queries from the pod,
        // using  `configManager.addQueriesToQueryList( listToAdd )` to add them to the config
       
    }

    const handleSave = async (event) => {
        event.preventDefault();

        const eventData = new FormData(event.currentTarget);
        const jsonData = Object.fromEntries(eventData.entries());
        console.log(jsonData)

        // Here the logic will follow to save your queries on the pod,
        // using  `configManager.getCustomQueries()` to send all the custon queries
       
    }

    return (
        <Card sx={{  marginTop: '16px', width: '100%' }}>
<Typography  sx={{ padding: '20px'}}>Load or save your custom queries to a pod</Typography>
            <Card
                component="form"
                onSubmit={handleLoad}
                sx={{ padding: '16px',backgroundColor: 'transparent', boxShadow: 'none', width: '100%' }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Button
                        variant="outlined"
                        color="warning"
                        type="submit"
                        startIcon={<IconProvider.CloudDownloadIcon />}
                        sx={{ margin: '10px' }}
                    >
                        Load All
                    </Button>

                    <Typography sx={{ width: '30px', marginRight: '10px' }}>
                        From:
                    </Typography>

                    <TextField
                        required
                        name="LoadTo"
                        placeholder="https://custompod/user/customqueries/list"
                        variant="outlined"
                        sx={{ flexGrow: 1, marginX: '15px' }}
                    />
                </Box>
            </Card>



            <Card
                component="form"
                onSubmit={handleSave}
                sx={{ padding: '16px', backgroundColor: 'transparent', boxShadow: 'none', width: '100%' }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Button
                        variant="outlined"
                        color="success"
                        type="submit"
                        startIcon={<IconProvider.CloudUploadIcon />}
                        sx={{ marginX: '10px' }}
                    >
                        Save all
                    </Button>

                    <Typography sx={{ width: '30px', marginRight: '10px' }}>
                        To:
                    </Typography>

                    <TextField
                        required
                        name="SaveTo"
                        placeholder="https://custompod/user/customqueries/list"
                        variant="outlined"
                        sx={{ flexGrow: 1, marginX: '15px' }}
                    />
                </Box>
            </Card>
        </Card>
    )
}
