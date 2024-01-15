import express from 'express';
import cors from 'cors';

const app = express();

const corsOptions = {
    allowedHeaders: []
};

app.get('/example/:id', cors(corsOptions), (request, response) => {
    response.redirect(`http://localhost:8080/example/${request.params.id}`);
})

app.listen(8001, () => {
    console.log('Bad Cors server Running');
})