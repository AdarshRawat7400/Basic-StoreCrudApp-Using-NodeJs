import express from 'express'
import { readData,writeData } from './db_utils.js';
import { randomInt } from 'crypto';
import db from "./db.js";
import jwt from  'jsonwebtoken';
import { ObjectId } from 'mongodb';


const router = express.Router();
const isAuthenticated = async (request,response,next) => {
    try{

    if(request.cookies.token){
        console.log("TOKEN ",request.cookies.token)
    const decoded_data = jwt.verify(request.cookies.token,'SECERT')
    console.log("DECODED DATA ",decoded_data._id)
    const user = await db.users.findOne({ _id: new ObjectId(decoded_data._id) });
    console.log("USER" ,user)
    if (user){
        request.user = user
        next()
    }
    else{
        return response.status(400).json({"error": `User not Found!`});

    }
    }
    else{
        return response.status(400).json({"error": `Token is Missing!`});

    }
}
catch (error) {
    // Handle the exception
    return response.status(404).json({ "error": error.message });
}
    
};


router.post('/login', async (request,response)=> {
    try{

    const username = request.body.username
    const password = request.body.password
    const user = await db.users.findOne({"username":username})
    
    const token = jwt.sign({_id:user._id},"SECERT");

    if (user && user.password === password) {
        return response.cookie("token",token,{httpOnly:true,expire: 360000 + Date.now()}).status(200).send("<h1> Users Logged in Successfully </h1>")
      } else {
        return response.status(404).send(`<h1> User not Found or password Incorrect </h1>`);
    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});
router.get('/logout',isAuthenticated, async (request,response)=> {
    try{
        return response.clearCookie('token').status(200).send("<h1> User Logout  Successfully </h1>")
      } 
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});

router.post('/signup', async (request,response)=> {
    try{

    const user_data = request.body
    
    const user = await db.users.findOne({"username":user_data.username}) 

    if (user) {
        return response.status(400).json({"error": `User with ${user_data.username} Already Exist`});
      } else {

        await db.users.insertOne(user_data)
        
        return response.status(201).json({"success": `User Successfully Created,Try Login`});

    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});

router.get('/user/cart/items',isAuthenticated,async (request,response)=> {
    try{
        const user = request.user
        
            const username = user.username
            const filteredData = await db.cart.find({'username':username}).toArray();     
            return response.status(200).json(filteredData);
    }
    
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
    
});

router.post('/user/cart/items',isAuthenticated,async (request,response)=> {
    try{
        const user = request.user 
            const product_data = request.body
            const product = await db.products.findOne({'product_id':product_data.id})
        
            if(product){
                if(product.quantity == 0){
                    return response.status(400).json({"error": "Product out-of-stock"});
                }
                const id = randomInt(10000000000)
                
                const item_json = product
                item_json['item_unique_id']=id
                item_json['username'] = user.username
                delete item_json._id
                await db.cart.insertOne(item_json)
                await db.products.updateOne
                // Update the document based on its unique _id field
                await db.products.updateOne(
                    { product_id:product.product_id },
                    { $set: { ['quantity']: product.quantity-1 } }
                );
                return response.status(200).json({"success": "Product Added to Cart Successfully"});
            
          } else {
            return response.status(400).json({"error": `User Not Logged in`});

    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
    
});

router.delete('/user/cart/items/:order_id',isAuthenticated, async (request,response)=> {
    try{
        const user = request.user 
            const order_id = parseInt(request.params.order_id)
            const order = await db.cart.findOne({'item_unique_id':order_id})
            if(order && order.username == user.username){
                const product_id = order.product_id
                const product  = await db.products.find({"product_id":product_id})
                await db.cart.deleteOne({"item_unique_id":order_id})
                await db.products.updateOne(
                    { product_id: product_id },
                    { $set: { ['quantity']: product.quantity+1 } }
                );

                return response.status(200).json({"success": "Product Removed from Cart Successfully"});
            
          } else {
            return response.status(400).json({"error": `User Not Logged in`});

    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
    
});


router.get('/products',isAuthenticated,async (request,response)=> {
    try{
    
        const user = request.user
    const products = await db.products.find().toArray();

    return response.status(200).json(products);
}
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});


router.get('/products/:id',isAuthenticated, async (request,response)=> {
    try{
        const user = request.user
    const id = parseInt(request.params.id)
    const products = await db.products.findOne({"product_id":id})
    
    if (products) {
        return response.status(200).json({"data":products});
      } else {
        return response.status(404).json({"error":"Product Not Found"});
    }
}
catch (error) {
    // Handle the exception
    return response.status(404).json({ "error": error.message });
}
});


router.post('/products',isAuthenticated,async (request,response)=> {
    try{
        const user = request.user
        if(user.role != 'admin'){
            return response.status(404).json({"error":"User do not have privilage to perform following action!"});
    
        }
    const id = randomInt(1000000000);
    const product_data = request.body
    product_data['product_id'] = id
    await db.products.insertOne(product_data)
    return response.status(201).json({"success":"Product Added Successfully!"});

}
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});


router.put('/products/:id',isAuthenticated,async (request,response)=> {
    try{
    const product_id = parseInt(request.params.id)
    const product = await db.products.findOne({"product_id":product_id})
    const user = request.user
    if(user.role != 'admin'){
        return response.status(404).json({"error":"User do not have privilage to perform following action!"});
    }
    if (product) {
        const data = request.body;
        // Assuming 'product_id' is a unique identifier in your collection
        const result = await db.products.updateOne(
          { "product_id": product_id },
          { $set: data }
        );
  
        if (result.modifiedCount > 0) {
          return response.status(200).json({"success": "Product Updated Successfully!"});
        } else {
          return response.status(500).json({"error": "Failed to update product"});
        }
      } else {
        return response.status(404).json({"error":"Product Not Found"});
    }

}
catch (error) {
    // Handle the exception
    return response.status(404).json({ "error": error.message });
}
});


router.delete('/products/:id',isAuthenticated,async (request,response)=> {
    try{
    const user = request.user
    if(user.role != 'admin'){
        return response.status(404).json({"error":"User do not have privilage to perform following action!"});

    }
    const id = parseInt(request.params.id)
    const product = await db.products.findOne({"product_id":id})
    if (product) {
        await db.products.deleteOne({"product_id":id})
        return response.status(200).json({"success":"Product Deleted Successfully!"});
      } else {
        return response.status(404).json({"error":"Product Not Found"});
    }

}
catch (error) {
    // Handle the exception
    return response.status(404).json({ "error": error.message });
}
});

//Other routes here
router.get('*', function(req, res){
    res.send('Sorry, this is an invalid URL.');
 });

export default router;