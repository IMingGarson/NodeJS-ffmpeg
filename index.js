require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const api = require('./src/Routes/api.js');
const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: [
        'http://localhost:3000',
    ],
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(api);

app.get('/', (req, res) => {
    res.send('Hello world');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})