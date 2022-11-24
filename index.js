const express = require('express');
const cors = require('cors');

require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.send('mh fashion server is running');
})

app.listen(port, () => console.log(`mh fashion running on ${port}`))