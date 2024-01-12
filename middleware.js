const RequestLoggerMiddleware  = (req, res, next)=>{
    console.log("A new request received at " + Date.now());
    console.log("Request Details :- ")
    console.log("-----------------------")
    console.log("IP Address : ",req.ip)
    console.log("Params : ",req.params)
    console.log("Body : ",req.body)
    console.log("Cookies : ",req.cookies)
    console.log("Headers : ",req.headers)
    console.log("-----------------------")


    //This function call is very important. It tells that more processing is
    //required for the current request and is in the next middleware function route handler.

    next();
};

export {RequestLoggerMiddleware};

