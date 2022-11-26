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
      const productCollections = client.db('mhFashion').collection('products');
      const advertismentCollections = client.db('mhFashion').collection('advertisments');

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
   
      app.post('/products', async(req, res)=>{
        const product = req.body;
        const result = await productCollections.insertOne(product);
        res.send(result)
      })

      app.post('/advertisment', async(req, res)=>{
        const advertisment = req.body;
        const result = await advertismentCollections.insertOne(advertisment);
        res.send(result)
      })

      app.get('/products/:name', async(req, res)=>{
        const categoryName = req.params.name;
        // console.log(categoryName)
        const query = {category:categoryName};
        console.log(query)
        const products = await productCollections.find(query).toArray();
        res.send(products)
      })

      app.get('/myproducts/:email', async(req, res)=>{
        const userEmail = req.params.email;
        const query = { sellerEmail : userEmail}
        console.log(userEmail)

        const products = await productCollections.find(query).toArray();
        res.send(products) 
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