import mongoose ,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema=new Schema({
  username:{
    required:true,
    type:String,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
  },
  email:{
    required:true,
    type:String,
    unique:true,
    lowercase:true,
    trim:true,
  
  },
  fullName:{
    type:String,
    required,
    trim:true
  },
  avatar:{
    type:String, //cloudinary url,
    required:true
  },
coverImage:{
    type:String
},
watchHistory:[{
  type:Schema.Types.ObjectId,
  ref:"Video"
}],
  password:{
    type:String,  //challenge:how do we compare encrypted password and the normal one
    required:[true,'password is required'] 
  },
  refreshToken:{
    type:String,

  },
},{
  timestamps:true
})

userSchema.pre("save",async function(next){  // next is a signal that indicates middleware finished its execution
if (!this.isModified("password")) return next() //and document can be saved
  this.password=bcrypt.hash(this.password,10)
  next()
})                                                               
userSchema.methods.isPasswordCorrect=async function(password){  //check if the password is correct
  return await bcrypt.compare(password,this.password) 
}

userSchema.methods.generateAccessToken=function(){
  return jwt.sign(
    {
      _id:this._id,
      username:this.username,
      email:this.email,
      fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken=function(){
  return jwt.sign(
    {
      _id:this._id,
      username:this.username,
      email:this.email,
      fullName:this.fullName
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User=mongoose.model("User",userSchema)
