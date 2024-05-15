import {v2 as cloudinary} from "cloudinary"
import fs from "fs";
import {v2 as cloudinary} from 'cloudinary';

const uploadOnCloudinary=async(localFilePath)=>{
  try{
    if(!localPath) return null
    const response=await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
        //file has been uploaded successfully

    })
    console.log("file has been uploaded successfully",response.url);
    return response;
  }catch(error){
   fs.unlinkSync(localFilePath)
   return null;
  }
}

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
    });

})()

export {uploadOnCloudinary} //uploadOnCloudinary