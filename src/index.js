//require('dotenv').config({path:'/env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from './app.js'

dotenv.config({
    path:'./.env'
})
connectDB().then(()=>{
    app.listen(process.env.port||8000,()=>{
        console.log(`Server started on port: ${process.env.port||8000}`);
    });
}).catch((err)=>{
    console.log("MONGODB CONNECTION ERROR: ",err);
})

/*
import express from "express";
(async ()=>{
    try{
        mongoose.connect(`${process.env.MONGODB_URL}/{DB_NAME}`)
        app.on("error",()=>{
            console.log("ERR:",error);
            throw error
        })

    app.listen(process.env.PORT,()=>{
        console.log("Listening on port: ",process.env.PORT)
    })

    }catch(error){
        console.error("ERROR: ",error)
        throw error
    }
})();
*/