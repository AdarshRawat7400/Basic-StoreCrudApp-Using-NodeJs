import express from "express"
import cookieParser from 'cookie-parser';
import router from  './apis.js'
import { RequestLoggerMiddleware } from "./middleware.js"
const PORT = 5000
const app = express()
app.use(express.json());
app.use(cookieParser());
app.use(RequestLoggerMiddleware)
app.use('/store',router)

app.listen(PORT, ()=> {
    console.log(`Server is started Running on Port : ${PORT}`);
});
