import express from 'express'
import { readData,writeData } from './db_utils.js';
import { randomInt } from 'crypto';


const router = express.Router();
const DBNAME = 'product_table'
const USER_DBNAME = 'users_table'
const USER_CART = 'user_cart_table'



router.post('/login',(request,response)=> {
    try{

    const user_db = readData(USER_DBNAME);
    const username = request.body.username
    const password = request.body.password

    if (user_db.hasOwnProperty(username) && user_db[username].password === password) {
        return response.cookie("username",username).cookie("login_status",true).status(200).send("<h1> Users Logged in Successfully </h1>")
      } else {
        return response.status(404).send(`<h1> User not Found or password Incorrect </h1>`);
    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});

router.post('/signup',(request,response)=> {
    try{

    const user_db = readData(USER_DBNAME);
    const user_data = request.body

    if (user_db.hasOwnProperty(user_data.username) ) {
        return response.status(400).json({"error": `User with ${user_data.username} Already Exist`});
      } else {

        const user_db = readData(USER_DBNAME);
        user_db[user_data.username] = user_data
        console.log("USER DB",user_db)
        writeData(USER_DBNAME,user_db)
        return response.status(201).json({"success": `User Successfully Created`});

    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});

router.get('/user/cart/items',(request,response)=> {
    try{
        if (request.cookies.username  && request.cookies.login_status) {
            const db = readData(USER_CART);
            
            const filteredData = [];

            // Iterate over the properties of the JSON object
            for (const key in db) {
            if (db.hasOwnProperty(key) && db[key].username === request.cookies.username) {
                let entry = db[key]
                entry["order_id"] = key
                filteredData.push(entry);
            }
            }
            return response.status(200).json(filteredData);
          } else {
            return response.status(400).json({"error": `User Not Logged in`});

    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
    
});

router.post('/user/cart/items',(request,response)=> {
    try{
        const user_db = readData(USER_DBNAME);
        if (request.cookies.username && user_db.hasOwnProperty(request.cookies.username) && request.cookies.login_status ) {
            console.log("IM HERE ADSASD")
            const cart_db = readData(USER_CART)
            const products_db = readData(DBNAME)
            const product = request.body
            if(product.id  && products_db.hasOwnProperty(product.id)){
                if(products_db[product.id].quantity == 0){
                    return response.status(400).json({"error": "Product out-of-stock"});
                }
                const id = randomInt(10000000)
                cart_db[id] = products_db[product.id]
                cart_db[id].username = request.cookies.username
                console.log("CART DB",cart_db)
                writeData(USER_CART,cart_db)
                products_db[product.id] = products_db[product.id].quantity-1
                writeData(DBNAME,products_db)

                return response.status(200).json({"success": "Product Added to Cart Successfully"});
            }
            else{
                return response.status(400).json({"error": "Product with Id not found"});
            }
            
          } else {
            return response.status(400).json({"error": `User Not Logged in`});

    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
    
});

router.delete('/user/cart/items/:order_id',(request,response)=> {
    try{
        const user_db = readData(USER_DBNAME);
        if (request.cookies.username && user_db.hasOwnProperty(request.cookies.username) && request.cookies.login_status ) {
            const cart_db = readData(USER_CART)
            const products_db = readData(DBNAME)
            const order_id = request.params.order_id
            if(order_id  && cart_db.hasOwnProperty(order_id) && cart_db[order_id].username == request.cookies.username){
                const product_id = cart_db[order_id].product_id
                delete cart_db[order_id]
                console.log("pro",products_db[product_id])
                products_db[product_id].quantity += 1
                writeData(USER_CART,cart_db)
                writeData(DBNAME,products_db)

                return response.status(200).json({"success": "Product Removed from Cart Successfully"});
            }
            else{
                return response.status(400).json({"error": "Order with Order ID not found"});
            }
            
          } else {
            return response.status(400).json({"error": `User Not Logged in`});

    }
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
    
});


router.get('/products',(request,response)=> {
    try{
    const db = readData(DBNAME);
    console.log(db);
    return response.status(200).json(db);
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});


router.get('/products/:id',(request,response)=> {
    try{
    const id = parseInt(request.params.id)
    const db = readData(DBNAME);
    if (db.hasOwnProperty(id)) {
        const data =  db[id]
        return response.status(200).json({"data":data});
      } else {
        return response.status(404).json({"error":"Product Not Found"});
    }
}
catch (error) {
    // Handle the exception
    return response.status(404).json({ "error": error.message });
}
});


router.post('/products',(request,response)=> {
    try{
    const db = readData(DBNAME);
    const id = randomInt(1000);
    console.log(db)
    const data = request.body
    db[id] = data
    writeData(DBNAME,db)
    return response.status(201).json({"success":"Product Added Successfully!"});
    }
    catch (error) {
        // Handle the exception
        return response.status(404).json({ "error": error.message });
    }
});


router.put('/products/:id',(request,response)=> {
    try{
    const db = readData(DBNAME);
    const id = request.params.id
    if (db.hasOwnProperty(id)) {
        const data = request.body
        db[id] = data
        writeData(DBNAME,db)
        return response.status(200).json({"success":"Product Updated Successfully!"});
      } else {
        return response.status(404).json({"error":"Product Not Found"});
    }
}
catch (error) {
    // Handle the exception
    return response.status(404).json({ "error": error.message });
}
});


router.delete('/products/:id',(request,response)=> {
    try{
    const db = readData(DBNAME);
    const id = request.params.id
    if (db.hasOwnProperty(id)) {
        delete db[id]
        writeData(DBNAME,db);
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