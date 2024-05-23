import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js" //User from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiRes.js" //   ApiResponse from "../utils/ApiRes.js"
import {ApiError} from "../utils/ApiError.js" // ApiError from ""
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken=async(userId)=>{
 try{
   const user=await User.findById(userId)
   const accessToken=user.generateAccessToken();
   const refreshToken=user.generateRefreshToken();
  

   
   user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false})

   return {accessToken,refreshToken}

 } 

 catch(error){
 throw new ApiError(500,"Something went Wrong while generating access and refresh token")
 }
}

const registerUser=asyncHandler(async (req,res)=>{
  // get user details from frontend
  //validation-not empty
  //check-if user already exists:username,email
  //check for images,check for avatar
  //upload image to cloudinary,avatar
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const {fullName,email,username,password}=req.body
  console.log("email",email);

  if (
    [fullName,email,username,password].some((field)=>
      field?.trim()==="")
    )
  {


    throw new ApiError(400,"All fields are required")
  }

const existedUser=await User.findOne({
    $or:[{username},{email}]
})

if(existedUser){
    throw new ApiError(400,"User with email or username already exists")
}

 console.log(req.body)
const avatar_local_path=req.files?.avatar?.[0]?.path;
// const coverImage_path=req.files?.coverImage?.[0]?.path;

let coverImage_path;

if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImage_path=req.files.coverImage[0].path
}

console.log(avatar_local_path)
if(!avatar_local_path){
    throw new ApiError(400,"Avatar file is required")
}
 


 
 
 const avatar=await uploadOnCloudinary(avatar_local_path);
 
 const coverImage=await uploadOnCloudinary(coverImage_path);

if(!avatar){
    throw new ApiError(400,"Avatar file is requiredfvervrere")
}


const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase(),

})
const createdUser=await User.findById(user._id).select("-password -refreshToken")

if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user");
}

return res.status(201).json(new ApiResponse(200,createdUser,"user registered successfully"))
})



const loginUser=asyncHandler(async (req,res)=>{
  //req_body-data
  //username or email
  //find the user
  //check password of the user
  //access and refresh token
  //send cookie

  const {email,username,password}=req.body
  console.log("email")

  if(!(username || email )){
    throw new ApiError(400,"username or email are required")
  }

  const user=await User.findOne({$or:[{username},{email}]
});

 if(!user){
    throw new ApiError(400,"user does not exist")
 }

 const isPasswordValid=await user.isPasswordCorrect(password)

 if(!isPasswordValid){
    throw new ApiError(404,"invalid user")
 }
 
 const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

 const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

 const options={
    httpOnly:true,
    secure:true
 }

 return res
 .status(200) 
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
    new ApiResponse(
        200,
        {
        user:loggedInUser,accessToken,refreshToken  //

        },
        "user logged in successfully"
    )
 )
 


})


const logoutUser=asyncHandler(async(req,res)=>{
 await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:"undefined"
        }
    }
 )
 const options={
    httpOnly:true,
    secure:true
 }

 return res
 .status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new ApiResponse(200,{},"User logged out"))


})

const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized token");

   }

   try {
    const decodedToken=jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET,
    )
 
 
    const user=await User.findById(decodedToken?._id)
 
    if(!user){
     throw new ApiError(401,"Invalid refreshToken");
    }
 
    if(incomingRefreshToken!=user.refreshToken){
     throw new ApiError(401,"refreshToken is expired");
    }
 
    const options={
     httpOnly:true,
     secure:true
    }
    
    const{accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
 
    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options).json(
     new ApiResponse(200,{refreshToken:newRefreshToken,accessToken})
     
    )
   } catch (error) {
    throw new ApiError(401,"unauthorized request")
   }

})
export { registerUser,loginUser,logoutUser,refreshAccessToken }

