const jwt=require("jsonwebtoken")
const {errorhandler}=require("./error")
const secretKey = "lkhhfalshflk";

 const verifyToken=(req,res,next)=>{
    const token=req.cookies.access_token
    if(!token){
        return next(errorhandler(401,"UnAuthorized"))

    }
    jwt.verify(token,secretKey,(err,user)=>{
        if(err){
          return  next(errorhandler(401,"UnAuthorized"))
        }
        req.user=user
        next()
    })
 }

module.exports={verifyToken}

