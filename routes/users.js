
var express = require('express');
const { signup, signin, updateUser, signout,deleteUser, google ,getUser,getUsers} = require('../controllers/userController');
const { verifyToken } = require('../utils/verifyUser');



var router = express.Router();



router.post("/signup",signup)
router.post("/signin",signin)

router.post("/google",google)
router.put("/update/:userId",verifyToken, updateUser)
router.delete("/delete/:userId",verifyToken,deleteUser)
router.post("/signout",signout)
router.get("/getusers",verifyToken,getUsers)
router.get('/:userId', getUser);

module.exports = router;
