import { sendEmail } from "../utils/nodeMailer.js";
import { wrapper } from "../utils/wrapper.js";
import { OTP } from "../models/clientOTP-model.js";
import { Client } from "../models/client-model.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";


const generateOTP = () => {
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    const digit = Math.floor(Math.random() * 10); // simplified
    OTP += digit;
  }
  return OTP;
};
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex =  /^\+?[1-9]\d{1,14}$/
const sendOtpRegisterEmail = wrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const isValidEmail = emailRegex.test(email);

  if (!isValidEmail) {
    return res.status(400).json({ 
      status : 400,
      message: "Invalid email format" });
  }

  const generatedOTP = generateOTP();
  const otpSend = await sendEmail(
    email,
    "Email Verification",
    `OTP for Email Verification: ${generatedOTP}`
  );

  if (!otpSend) {
    return res.status(500).json({
      statusCode: 500,
      message: "Error occured while sending OTP",
    });
  }

  //deleting the old otps
    await OTP.deleteMany({
    email : email,
    purpose : "register"
  })
  const saveOTP = await OTP.create({
    email: email,
    otp: generatedOTP,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    purpose: "register",
  });

  const otpSaved = await OTP.findById(saveOTP._id);
  if (!otpSaved) {
    return res.status(500).json({
      statusCode: 500,
      message: "Error occured while saving OTP",
    });
  }

  


  return res.status(200).json({
    statusCode: 200,
    message: "OTP Sent Successfully!",
  });
});


const verifyOtpRegisterEmail = wrapper(async(req, res)=>{
  const{email , otp} = req.body
   if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  const isValidEmail = emailRegex.test(email);

  if (!isValidEmail) {
    return res.status(400).json({ 
      status : 400,
      message: "Invalid email format" });
  }
  if(!otp){
    return res.status(400).json({
      status : 400,
      message : "OTP is required"
    })
  }
  const savedOTP = await OTP.findOne({
    email:email
  }).sort({createdAt : -1})
  
  if(!savedOTP){
    return res.status(404).json({
      status : 404,
      message : "Not a valid Email"
    })
  }

  if(savedOTP.expiresAt < new Date()){
    return res.status(400).json({
      status : 400,
      message : "Otp has expired"
    })
  }

  if(otp.trim() === savedOTP.otp){
    await OTP.deleteMany({
    email : email,
    purpose : "register"
  })

    return res.status(200).json({
      status : 200,
      message: "Email Verified Successfully"
    })
  }

  return res.status(400).json({
    status : 400,
    message : "Invalid OTP"
  })
  

})

const registerClient = wrapper(async (req, res) => {
    const {fullName , username , password , email , phone} = req.body

    //validations
    if(!fullName || !username || !password || !email ||!phone){
      return res.status(400).json({
        status : "400",
        message : "Required Fields are empty "
      })
    }
    if(fullName?.trim()?.length < 3 || fullName?.trim()?.length >30){
      return res.status(400).json({
        status : "400",
        message : "Full Name length should be between 3 and 30 characters"
      })
    }
    if(username?.trim()?.length < 3 || username?.trim()?.length >10){
      return res.status(400).json({
        status : "400",
        message : "Username length should be between 3 and 10 characters"
      })
    }

    const validPhone = phoneRegex.test(phone.trim())
    if(!validPhone){
      return res.status(400).json({
        status : "400",
        message : "Invalid Phone Number"
      })
    }

    //checking for already existing user
    const existingUser = await Client.findOne({
      
        $or : [{username: username.trim()} , {phone: phone.trim()} , {email:email.trim()}]
      
    })

    if(existingUser){
        if(existingUser.username === username.trim()){
          return res.status(400).json({
            status : "400",
            message : "Username already taken"
          })
        }

        if(existingUser.email === email.trim() || existingUser.phone ===phone.trim()){
          return res.status(400).json({
            status : "400",
            message : "User Already exists"
          })

        }   
    }
    
    //profile Picture and gender are optional
    const profilePictureLocalPath = req.file?.path
    let upload
    if(profilePictureLocalPath){

      upload = await uploadOncloudinary(profilePictureLocalPath)

      if(!upload){
        return res.status(500).json({
            status : "500",
            message : "Error occured while uploading profile picture"
          })
      }

    } 

    //creating entry in the database

    const newClient = await Client.create({
      fullName,
      username,
      phone,
      email,
      password,
      profilePicture : upload?.url || ""
    })

    //checking if user created

    const clientCreated = await Client.findById(newClient._id).select("-password")

    if(!clientCreated){
      return res.status(500).json({
            status : "500",
            message : "Error while registering user"
          })
    }

    return res.status(200).json({
      status : "200",
      message : "User Registered successfully!",
      data : clientCreated
    })
  });


const loginClient = wrapper(async(req ,res)=>{
  const {email , password} = req.body
  if(!email?.trim() || !password?.trim()){
    return res.status(400).json({
      status : 400,
      message : "All Flieds are reuqired"
    })
  }

  const isValidEmail = emailRegex.test(email.trim())
  if(!isValidEmail){
    return res.status(400).json({
      status : 400,
      message : "Email is not valid"
    })
  }

  const  client= await Client.findOne({
    email : email.trim()
  })

  if(!client){
    return res.status(400).json({
      status : 400,
      message : "User do not exist"
    })
  }

  if(!(await client.isPasswordCorrect(password.trim()))){
     return res.status(400).json({
      status : 400,
      message : "Invalid credentials"
    })

  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  const accessToken = await client.generateAccessToken()
  const loggedInClient  = await Client.findOne({
    email : email.trim()
  }).select('_id fullName username email ')

  res.status(200).cookie("accessToken",accessToken,options).json({
    status :200,
    message :"Logged in successfull",
    data : {
      accessToken , loggedInClient
    }

  })
})

const logoutClient = wrapper(async(req , res)=>{
 const options = {
    httpOnly: true,
    secure: true,
  };
  return res.status(200).clearCookie('accessToken',options).json({
    status:200 ,
  message : "Logout succesfull"  })
})

const changeCurrentPassword = wrapper(async(req, res)=>{
  const currentUserId  =  req.verifiedClientId
  const {currentPassword , newPassword } = req.body
  if(!currentPassword || !newPassword){
    res.status(400).json({
      status: 400,
      message : "All fields are required"
    })
  }
  const currentUser = await Client.findById(currentUserId)
  if(!(await currentUser.isPasswordCorrect(currentPassword.trim()))){
    res.status(400).json({
      status: 400,
      message : "Invalid current password"
    })
  }

currentUser.password = newPassword
await currentUser.save({validateBeforeSave : false})

res.status(200).json({
  status: 200,
  message : "Password Changed Successfully"
})
})

export { sendOtpRegisterEmail ,verifyOtpRegisterEmail , registerClient ,loginClient,logoutClient};
