require('dotenv').config()
const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000

const corsOptions = {
    origin: [
        'http://localhost:3000',
    ],
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})