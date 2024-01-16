import db from "./db.js";
import jwt from  'jsonwebtoken';
import { ObjectId } from 'mongodb';

const isAuthenticated = async (request,response,next) => {
    try{

    if(request.session.token){
        console.log("TOKEN ",request.session.token)
    const decoded_data = jwt.verify(request.session.token,'SECERT')
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


const generateToken = (user_id) => {
    const token = jwt.sign({_id:user_id},"SECERT",{ expiresIn: '1h' });
    return token;
}

export {isAuthenticated,generateToken};