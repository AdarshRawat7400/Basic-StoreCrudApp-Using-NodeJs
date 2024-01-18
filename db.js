import { MongoClient } from "mongodb";
// const ConnectionURI = 'mongodb+srv://arawat1:<yotadota>@storefront.gsefmcd.mongodb.net/?retryWrites=true&w=majority'
const ConnectionURI = 'mongodb+srv://adarsh:rawat@storefront.k0jnt7x.mongodb.net/?retryWrites=true&w=majority'
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
