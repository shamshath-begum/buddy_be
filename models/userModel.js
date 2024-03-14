const mongoose=require('mongoose')
const validator=require('validator')
const UserSchema=new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    
    email:{type:String,required:true ,
    validate:(value)=>validator.isEmail(value)
    },
// role:{type:String,default:"salesRep"},
    password:{type:String,required:true},
    profilePicture: {
        type: String,
        default:
          'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    // imgpath:{type:String,required:true},
},{versionKey:false},{timestamps:true})


const UserModel=mongoose.model('user',UserSchema)
module.exports={UserModel}