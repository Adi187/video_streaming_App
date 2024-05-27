import mongoose ,{Schema} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";

const subscriptionSchema=new Schema({
   subscriber:{
    type:Schema.Types.ObjectId,
    ref:"User"
   },
   channel:{
    type:Schema.Types.ObjectId,
    ref:"User"
   },


})


//
export const Subscription=mongoose.model("subscription",subscriptionSchema)
