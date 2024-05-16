import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';


export default function TableData(data) {
    const keys = []
    if (data.data === null || data.data === undefined || data.data.length === 0) {
        return (
            <Typography variant="body1" component="div" sx={{ margin: '10px' }}>
                There are no results for this custom query.
            </Typography>
        )
    }
    Object.keys(data.data[0]).forEach((k) => { keys.push(k) })
    return (
        <TableContainer sx={{ marginBottom: '20px', marginTop: '10px' }} component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {keys.map((label) => {
                            return (
                                <TableCell key={label} align="left">{label}</TableCell>
                            )
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.data.map((row, i) => (
                        <TableRow
                            key={i}
                        >
                            {keys.map((cat) => (
                                <TableCell key={cat + i} >
                                    {row[cat]}
                                </TableCell>
                            ))}
                        </TableRow>
                    )
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
