import { MongoClient } from "mongodb";
// const ConnectionURI = 'mongodb+srv://arawat1:<yotadota>@storefront.gsefmcd.mongodb.net/?retryWrites=true&w=majority'
const ConnectionURI = process.env.DATABASE_URL
const client = new MongoClient(ConnectionURI);
await client.connect();

const database = client.db('storefront');

// Access the 'devices' collection (it will be created if it doesn't exist)
const users = database.collection('users');
const products = database.collection('products');
const cart = database.collection('cart');



export default {
    "users" : users,
    "products" : products,
    "cart" : cart
};
