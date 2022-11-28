const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.MH_FASHION_USER}:${process.env.MH_FASHION_PASS}@cluster0.lezxbrx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access')
  }

  const token = authHeader.split(' ')[1];
  console.log('inside', token)

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' })
    }

    req.decoded = decoded;
    next()
  })

}


async function run() {
  try {
    const categoryCollections = client.db('mhFashion').collection('categories');
    const userCollections = client.db('mhFashion').collection('users');
    const productCollections = client.db('mhFashion').collection('products');
    const advertismentCollections = client.db('mhFashion').collection('advertisments');
    const bookingCollections = client.db('mhFashion').collection('bookings');

    app.get('/categories', async (req, res) => {
      const query = {};
      const categories = await categoryCollections.find(query).toArray();
      res.send(categories)
    })

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const user = await userCollections.findOne(query)
      console.log(user)
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '10h' })
        return res.send({ accessToken: token })
      }
      res.status(403).send({ accessToken: '' })
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollections.insertOne(user);
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      const query = {}
      const users = await userCollections.find(query).toArray();
      res.send(users)
    })

    // app.get('user/:email', async(req, res)=>{
    //   const email = req.params.email;
    //   const query = {email : email};
    //   const user = await userCollections.findOne(query);
    //   res.send(user)
    // })

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollections.findOne(query);
      // console.log(user)
      res.send({ isAdmin: user?.account === 'admin' })
    })

    app.get('/users/seller/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollections.findOne(query);
      // console.log(user)
      res.send({ isSeller: user?.account === 'seller' })
    })

    app.get('/users/verifySeller/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollections.findOne(query);
      // console.log(user)
      res.send({ user, isVerifiedSeller: user?.status === 'verified' })
    })



    app.get('/sellers', async (req, res) => {
      const query = { account: 'seller' };
      const sellers = await userCollections.find(query).toArray();
      res.send(sellers)
    })

    app.put('/sellers/verify/:id', verifyJWT, async (req, res) => {

      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollections.findOne(query);

      if (user?.account !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' })
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: 'verified',
          symbol: '✔'
        }
      }
      const result = await userCollections.updateOne(filter, updatedDoc, options)
      res.send(result)
    })

    app.delete('/sellers/delete/:id', verifyJWT, async (req, res) => {


      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollections.findOne(query);

      if (user?.account !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' })
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await userCollections.deleteOne(filter);
      res.send(result);
    })

    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productCollections.insertOne(product);
      res.send(result)
    })

    app.post('/advertisment', async (req, res) => {
      const advertisment = req.body;
      const result = await advertismentCollections.insertOne(advertisment);
      res.send(result)
    })

    app.get('/products/:name', async (req, res) => {
      const categoryName = req.params.name;
      // console.log(categoryName)
      const query = { category: categoryName };
      // console.log(query)
      const products = await productCollections.find(query).toArray();
      res.send(products)
    })

    app.get('/myproducts/:email', verifyJWT, async (req, res) => {
      const userEmail = req.params.email;
      const decodedEmail = req.decoded.email;

      if (userEmail !== decodedEmail) {
        return res.status(403).send({ message: 'forbidden access' })
      }

      const query = { sellerEmail: userEmail }
      // console.log(userEmail)

      const products = await productCollections.find(query).toArray();
      res.send(products)
    })

    app.get('/advertisement', async (req, res) => {
      const query = {};
      const advertisement = await advertismentCollections.find(query).toArray();
      res.send(advertisement)
    })

    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollections.insertOne(booking);
      res.send(result)
    })


    app.get('/bookings/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const booking = await bookingCollections.find(query).toArray();
      res.send(booking)
    })

    app.get('/booking/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: ObjectId(id) };
      const booking = await bookingCollections.findOne(query);
      res.send(booking)
    })


    app.post('/create-payment-intent', async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: amount,
        "payment_method_types": [
          "card"
        ]
      });
      console.log(paymentIntent)
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

  }
  finally {

  }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
  res.send('mh fashion server is running');
})

app.listen(port, () => console.log(`mh fashion running on ${port}`))