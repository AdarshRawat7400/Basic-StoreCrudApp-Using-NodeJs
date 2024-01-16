import express from 'express'
import { hashPassword, comparePassword,generateItemUniqueItemId,generateProductUniqueItemId  } from './utils.js';
import db from "./db.js";
import { isAuthenticated, generateToken} from './authentication.js';


const router = express.Router();


router.post('/login', async (request, response) => {
    try {

        const username = request.body.username
        const plainPassword = request.body.password;
        const user = await db.users.findOne({ "username": username })

        const token = await generateToken(user._id);

        if (user && await comparePassword(plainPassword, user.password)) {
            request.session.token = token;
            return response.status(200).json({"status":true,"message":" Users Logged in Successfully"})
        } else {
            return response.status(400).json({"status":false,"message":" User not Found or password Incorrect"})
        }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({"status":false, "message": error.message });
    }
});
router.get('/logout', isAuthenticated, async (request, response) => {
    try {
        // Clear the token from the session
        request.session.token = null;

        return response.status(200).send("<h1>  </h1>").json({"status":true,"message":" User Logout  Successfully"})
    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({"status":false, "message": error.message });
    }
});

router.post('/signup', async (request, response) => {
    try {

        const username = request.body.username;
        const plainPassword = request.body.password;

        const user = await db.users.findOne({ "username": username })
        if (!user) {
            const hashedPassword = await hashPassword(plainPassword);
            const user_data = request.body
            user_data.password = hashedPassword
            await db.users.insertOne(user_data)
            return response.status(201).json({ "status":true, "message": `User Successfully Created,Try Login` });

        } else {


            return response.status(400).json({"status":false, "message": `User with ${username} Already Exist` });

        }
    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({"status":false, "message": error.message });
    }
});

router.get('/user/cart/items', isAuthenticated, async (request, response) => {
    try {
        const user = request.user

        const username = user.username
        const filteredData = await db.cart.find({ 'username': username }).toArray();
        return response.status(200).json({"status":true, "data" : filteredData});
    }

    catch (error) {
        // Handle the exception
        return response.status(500).json({"status":false, "message": error.message });
    }

});

router.post('/user/cart/items', isAuthenticated, async (request, response) => {
    try {
        const user = request.user
        const product_data = request.body
        const product = await db.products.findOne({ 'product_id': product_data.id })

        if (product) {
            if (product.quantity == 0) {
                return response.status(400).json({"status":false, "message": "Product out-of-stock" });
            }
            const id = generateItemUniqueItemId()

            const item_json = product
            item_json['item_unique_id'] = id
            item_json['username'] = user.username
            delete item_json._id
            await db.cart.insertOne(item_json)
            await db.products.updateOne
            // Update the document based on its unique _id field
            await db.products.updateOne(
                { product_id: product.product_id },
                { $set: { ['quantity']: product.quantity - 1 } }
            );
            return response.status(200).json({"status":true, "message": "Product Added to Cart Successfully" });

        } else {
            return response.status(400).json({"status":false, "message": `User Not Logged in` });

        }
    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({ "status":false,"message": error.message });
    }

});

router.delete('/user/cart/items/:order_id', isAuthenticated, async (request, response) => {
    try {
        const user = request.user
        const order_id = parseInt(request.params.order_id)
        const order = await db.cart.findOne({ 'item_unique_id': order_id })
        if (order && order.username == user.username) {
            const product_id = order.product_id
            const product = await db.products.find({ "product_id": product_id })
            await db.cart.deleteOne({ "item_unique_id": order_id })
            await db.products.updateOne(
                { product_id: product_id },
                { $set: { ['quantity']: product.quantity + 1 } }
            );

            return response.status(200).json({"status":true, "message": "Product Removed from Cart Successfully" });

        } else {
            return response.status(400).json({"status":false, "message": `User Not Logged in` });

        }
    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({ "status":false,"message": error.message });
    }

});


router.get('/products', isAuthenticated, async (request, response) => {
    try {

        const user = request.user
        const products = await db.products.find().toArray();

        return response.status(200).json({"status":true,"data":products});
    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({"status":false, "message": error.message });
    }
});


router.get('/products/:id', isAuthenticated, async (request, response) => {
    try {
        const user = request.user
        const id = parseInt(request.params.id)
        const products = await db.products.findOne({ "product_id": id })

        if (products) {
            return response.status(200).json({"status":true,"data": products });
        } else {
            return response.status(404).json({ "status":false,"message": "Product Not Found" });
        }
    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({"status":false, "message": error.message });
    }
});


router.post('/products', isAuthenticated, async (request, response) => {
    try {
        const user = request.user
        if (user.role != 'admin') {
            return response.status(404).json({ "status":false, "message": "User do not have privilage to perform following action!" });

        }
        const id = generateProductUniqueItemId()
        const product_data = request.body
        product_data['product_id'] = id
        await db.products.insertOne(product_data)
        return response.status(201).json({"status":true, "message": "Product Added Successfully!" });

    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({ "status":false,"message": error.message });
    }
});


router.put('/products/:id', isAuthenticated, async (request, response) => {
    try {
        const product_id = parseInt(request.params.id)
        const product = await db.products.findOne({ "product_id": product_id })
        const user = request.user
        if (user.role != 'admin') {
            return response.status(401).json({"status":false,"message": "User do not have privilage to perform following action!" });
        }
        if (product) {
            const data = request.body;
            // Assuming 'product_id' is a unique identifier in your collection
            const result = await db.products.updateOne(
                { "product_id": product_id },
                { $set: data }
            );

            if (result.modifiedCount > 0) {
                return response.status(200).json({ "status":true,"message": "Product Updated Successfully!" });
            } else {
                return response.status(500).json({ "status":false,"message": "Failed to update product" });
            }
        } else {
            return response.status(404).json({"status":false, "message": "Product Not Found" });
        }

    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({"status":false, "message": error.message });
    }
});


router.delete('/products/:id', isAuthenticated, async (request, response) => {
    try {
        const user = request.user
        if (user.role != 'admin') {
            return response.status(401).json({ "status":false,"message": "User do not have privilage to perform following action!" });

        }
        const id = parseInt(request.params.id)
        const product = await db.products.findOne({ "product_id": id })
        if (product) {
            await db.products.deleteOne({ "product_id": id })
            return response.status(200).json({"status":true, "message": "Product Deleted Successfully!" });
        } else {
            return response.status(404).json({"status":false, "message": "Product Not Found" });
        }

    }
    catch (error) {
        // Handle the exception
        return response.status(500).json({"status":false, "message": error.message });
    }
});

//Other routes here
router.get('*', function (req, res) {
    res.status(404).send('Sorry, this is an invalid URL.');
});

export default router;