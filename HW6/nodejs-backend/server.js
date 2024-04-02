const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const username = encodeURIComponent("ishitausc");
const password = encodeURIComponent("Mithil@2006");
const uri = `mongodb+srv://${username}:${password}@stocksearch.gzaclnd.mongodb.net/?retryWrites=true&w=majority&appName=StockSearch`;

const client = new MongoClient(uri);

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection');
  await client.close();
  process.exit();
});

const app = express();
app.use(cors());

const finhub_api_url = "https://finnhub.io/api/v1/"
const finhub_api_key = "cn092npr01qkcvkfsgm0cn092npr01qkcvkfsgmg"
const polygonio_api_key = "6FUPI6O67nSi_0JTVJp_G5vNsV1F7wDF"

const date = new Date();
const TODAY = date.toISOString().slice(0, 10);
const Before_1D = new Date(date.setDate(date.getDate() - 1)).toISOString().slice(0, 10);
const Before_7D = new Date(date.setDate(date.getDate() - 7)).toISOString().slice(0, 10);
const Before_2Y = new Date(date.setMonth(date.getMonth() - 24)).toISOString().slice(0, 10);


app.get('/search/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `${finhub_api_url}search?q=${req.params.ticker}&token=${finhub_api_key}`,
    })
        .then(function (response) {
            res.send(response.data.result);
        });
});

app.get('/profile/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `${finhub_api_url}stock/profile2?symbol=${req.params.ticker}&token=${finhub_api_key}`,
    })
        .then(function (response) {
            res.send(response.data);
        });
});

app.get('/quote/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `${finhub_api_url}quote?symbol=${req.params.ticker}&token=${finhub_api_key}`,
    })
        .then(function (response) {
            res.send(response.data);
        });
});

app.get('/recommendation/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `${finhub_api_url}stock/recommendation?symbol=${req.params.ticker}&token=${finhub_api_key}`,
    })
        .then(function (response) {
            res.send(response.data);
        });
});

app.get('/news/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `${finhub_api_url}company-news?symbol=${req.params.ticker}&from=${Before_7D}&to=${TODAY}&token=${finhub_api_key}`,
    })
        .then(function (response) {
            res.send(response.data);
        });
});

app.get('/sentiment/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `${finhub_api_url}stock/insider-sentiment?symbol=${req.params.ticker}&from=2022-01-01&token=${finhub_api_key}`,
    })
        .then(function (response) {
            res.send(response.data.data);
        });
});

app.get('/peers/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `${finhub_api_url}stock/peers?symbol=${req.params.ticker}&token=${finhub_api_key}`,
    })
        .then(function (response) {
            res.send(response.data);
        });
});

app.get('/earnings/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `${finhub_api_url}stock/earnings?symbol=${req.params.ticker}&token=${finhub_api_key}`,
    })
        .then(function (response) {
            res.send(response.data);
        });
});

app.get('/charts/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `https://api.polygon.io/v2/aggs/ticker/${req.params.ticker}/range/1/day/${Before_2Y}/${TODAY}?adjusted=true&sort=asc&apiKey=${polygonio_api_key}`,
    })
        .then(function (response) {
            res.send(response.data.results);
        })
        .catch(function (error) {
            console.error(error);
            res.status(500).send('An error occurred while fetching data from the API');
        });
});

app.get('/dailyCharts/:ticker', (req, res) => {
    axios({
        method: 'get',
        url: `https://api.polygon.io/v2/aggs/ticker/${req.params.ticker}/range/1/hour/${Before_1D}/${TODAY}?adjusted=true&sort=asc&apiKey=${polygonio_api_key}`,
    })
        .then(function (response) {
            res.send(response.data.results);
        })
        .catch(function (error) {
            console.error(error);
            res.status(500).send('An error occurred while fetching data from the API');
        });
});


app.get('/fetch', async (req, res) => {
    try {
        const database = client.db('Wallet');
        const collection = database.collection('stocks');
        const documents = await collection.find({}).toArray();
        res.json(documents[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching data from MongoDB' });
    }
});


app.put('/update', async (req, res) => {
    try {
        const database = client.db('Wallet');
        const collection = database.collection('stocks');
        const newValues = { $set: { amount: req.query.amount } };
        const result = await collection.updateOne({}, newValues, {upsert: true});
        res.json({ message: 'Document updated successfully', modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating data in MongoDB' });
    }
});

app.get('/fetchstock/:ticker', async (req, res) => {
    try {
        const database = client.db('Wallet');
        const collection = database.collection('stock1');
        const ticker = req.params.ticker;
        const document = await collection.findOne({ stock: ticker });
        if (document) {
            res.json(document);
        } else {
            console.log( 'No document matches the provided parameter' );
            res.json({ stock: ticker, quantity: 0, price: 0, name: ''});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching data from MongoDB' });
    }
});


app.put('/updatestock', async (req, res) => {
    if(isNaN(req.query.quantity) || isNaN(req.query.price)){
        res.status(400).json({ error: 'Quantity and Price must be numbers' });
        return;
    }
    try {
        const database = client.db('Wallet');
        const collection = database.collection('stock1');
        const ticker = req.query.ticker;
        const newValues = { $set: { stock: ticker, quantity: req.query.quantity, price: req.query.price, name: req.query.name } };
        const result = await collection.updateOne({ stock: ticker }, newValues, { upsert: true });
        if(result.upsertedCount > 0){
            res.json({ message: 'Stock created successfully', upsertedCount: result.upsertedCount});
        } else if(result.modifiedCount > 0){
            res.json({ message: 'Stock Updated successfully', modifiedCount: result.modifiedCount });
        } else {
            res.json({ message: 'No changes made', modifiedCount: result.modifiedCount });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating data in MongoDB' });
    } 
});

app.get('/fetchstocks', async (req, res) => {
    try {
        const database = client.db('Wallet');
        const collection = database.collection('stock1');
        const stocks = await collection.find().toArray();
        res.json(stocks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching data from MongoDB' });
    }
});

app.get('/fetchWatchlist', async (req, res) => {
    try {
        const database = client.db('Wallet');
        const collection = database.collection('watchlist');
        const documents = await collection.find({}).toArray();
        res.json(documents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching data from MongoDB' });
    }
});

// API to add an item to the watchlist
app.post('/addToWatchlist', async (req, res) => {
    try {
        const database = client.db('Wallet');
        const collection = database.collection('watchlist');
        const { ticker, name } = req.query;
        const result = await collection.insertOne({ ticker, name });
        res.json({ message: 'Item added to watchlist', insertedId: result.insertedId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while adding item to MongoDB' });
    }
});

// API to delete an item from the watchlist
app.delete('/deleteFromWatchlist/:ticker', async (req, res) => {
    try {
        const database = client.db('Wallet');
        const collection = database.collection('watchlist');
        const ticker = req.params.ticker;
        const result = await collection.deleteOne({ ticker: ticker });
        if (result.deletedCount === 1) {
            res.json({ message: 'Item deleted from watchlist' });
        } else {
            res.status(404).json({ message: 'Item not found in watchlist' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while deleting item from MongoDB' });
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});


