const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.MH_FASHION_USER}:${process.env.MH_FASHION_PASS}@cluster0.lezxbrx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
      const categoryCollections = client.db('mhFashion').collection('categories');
      const userCollections = client.db('mhFashion').collection('users');

      app.get('/categories', async(req, res)=>{
        const query = {};
        const categories = await categoryCollections.find(query).toArray();
        res.send(categories) 
      })

      app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await userCollections.insertOne(user);
        res.send(result)
      })
    } 
    finally {

    }
  }
  run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('mh fashion server is running');
})

app.listen(port, () => console.log(`mh fashion running on ${port}`))