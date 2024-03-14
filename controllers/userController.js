
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRound = 10;
const secretKey = "lkhhfalshflk";
const { dbUrl } = require("../config/dbConfig");
const { UserModel } = require("../models/userModel");
const { errorhandler } = require("../utils/error");
mongoose.connect(dbUrl);

 const signup=async(req,res)=>{
const {username,email,password}=req.body

if(!username || !email || !password || username === "" || email ==="" ||password === ""){
return res.status(400).send({
    message:"All the fields are required"})}

const hashedPassword=bcrypt.hashSync(password,10)

const newUser=new UserModel({username,email,password:hashedPassword})

try {
    await newUser.save()
    res.status(201).send({
        message: "User Created successfully",
        
      });
} catch (error) {
    console.log(error);
        res.status(500).send({ message: "Internal Server Error", error }); 
}

// try {
   
    
//     let user = await UserModel.findOne({ email: req.body.email });
//     console.log(user)
//     if (!user) {
//       req.body.password = await hashPassword(req.body.password);
//       // let doc=new UserModel(req.body)
//       let doc = new UserModel({name:req.body.name,email:req.body.email,password:req.body.password,cpassword:req.body.cpassword,role:req.body.role,imgpath:req.file.filename,date:date});
//       console.log(doc)
//       let userdata=await doc.save();
//       res.status(201).send({
//         message: "User Created successfully",
//         userdata
//       });
//     } else {
//       res.status(400).send({ message: "User already exists" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ message: "Internal Server Error", error });
//   }
}

const signin=async(req,res,next)=>{
    const{email,password}=req.body

    if(!email || !password || email==="" || password===""){
        return res.status(400).send({
            message:"All the fields are required"})
    }

    try {
        const validUser=await UserModel.findOne({email})
        if(!validUser){
            res.status(404).send({message:"User Not Found"})
        }
        const validPassword=bcrypt.compareSync(password,validUser.password)
        if(!validPassword){
           return res.status(400).send({message:"Invalid password"})
        }

       const token= jwt.sign({id:validUser._id,isAdmin:validUser.isAdmin},secretKey)

       const {password:pass, ...rest}=validUser._doc
       res.status(200).cookie("access_token",token,{httpOnly:true}).send({rest})

    } catch (error) {
        console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
    }

}

const google = async (req, res, next) => {
    const { email, name, googlePhotoUrl } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user) {
        const token = jwt.sign(
          { id: user._id, isAdmin: user.isAdmin },
          secretKey
        );
        const { password, ...rest } = user._doc;
        res
          .status(200)
          .cookie('access_token', token, {
            httpOnly: true,
          })
          .json(rest);
      } else {
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
        const newUser = new User({
          username:
            name.toLowerCase().split(' ').join('') +
            Math.random().toString(9).slice(-4),
          email,
          password: hashedPassword,
          profilePicture: googlePhotoUrl,
        });
        await newUser.save();
        const token = jwt.sign(
          { id: newUser._id, isAdmin: newUser.isAdmin },
          secretKey
        );
        const { password, ...rest } = newUser._doc;
        res
          .status(200)
          .cookie('access_token', token, {
            httpOnly: true,
          })
          .json(rest);
      }
    } catch (error) {
      next(error);
    }
  };

const updateUser=async(req,res,next)=>{
    console.log(req.user.id)
    console.log(req.params.userId)
if(req.user.id !==req.params.userId){
    return next(errorhandler(403,"Your not allowed to update the user"))
}
if(req.body.password){
    if(req.body.password.length<6){
        return next(errorhandler(400,"Password must be at least 6 characters"))
    }
req.body.password=bcrypt.hashSync(req.body.password,10)
}

if(req.body.username){
    if(req.body.username.length<7 || req.body.username.length>20){
        return next(errorhandler(400,"UserName must be between 7 and 20 characters"))
    }
if(req.body.username.includes("")){
    return next(errorhandler(400,"User cannot contain spaces"))
}

if (req.body.username !==req.body.username.toLoweCase()){
    return next(errorhandler(400,"User must be lowerCase"))
}

if(!req.body.username.match(/^[a-zA-Z0-9]+$/)){
   return next(errorhandler(400,"User can only contain letters"))
}

try {
    const updatedUser=await UserModel.findByIdAndUpdate(req.params.userId,{$set:{
        
        username:req.body.username,
    email:req.body.email,
    profilePicture:req.body.profilePicture,
    password:req.body.password,

    },
},{new:true})
const {password,...rest}=updatedUser._doc
res.status(200).json(rest)
} catch (error) {
    res.status(500).send({ message: "Internal Server Error", error });
    // next(error)
}

}

}

 const signout = (req, res, next) => {
    try {
      res
        .clearCookie('access_token')
        .status(200)
        .json('User has been signed out');
    } catch (error) {
      next(error);
    }
  };
  
   const getUsers = async (req, res, next) => {
    if (!req.user.isAdmin) {
      return next(errorhandler(403, 'You are not allowed to see all users'));
    }
    try {
      const startIndex = parseInt(req.query.startIndex) || 0;
      const limit = parseInt(req.query.limit) || 9;
      const sortDirection = req.query.sort === 'asc' ? 1 : -1;
  
      const users = await UserModel.find()
        .sort({ createdAt: sortDirection })
        .skip(startIndex)
        .limit(limit);
  
      const usersWithoutPassword = users.map((user) => {
        const { password, ...rest } = user._doc;
        return rest;
      });
  
      const totalUsers = await UserModel.countDocuments();
  
      const now = new Date();
  
      const oneMonthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      const lastMonthUsers = await UserModel.countDocuments({
        createdAt: { $gte: oneMonthAgo },
      });
  
      res.status(200).json({
        users: usersWithoutPassword,
        totalUsers,
        lastMonthUsers,
      });
    } catch (error) {
      next(error);
    }
  };
  
   const getUser = async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.params.userId);
      if (!user) {
        return next(errorhandler(404, 'User not found'));
      }
      const { password, ...rest } = user._doc;
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
  };


const deleteUser = async (req, res, next) => {
    if ( req.user.id !== req.params.userId) {
      return next(errorhandler(403, 'You are not allowed to delete this user'));
    }
    try {
      await UserModel.findByIdAndDelete(req.params.userId);
      res.status(200).send('User has been deleted');
    } catch (error) {
      next(error);
    }
  };




module.exports={signup,signin,updateUser,deleteUser,google,signout,getUsers,getUser}