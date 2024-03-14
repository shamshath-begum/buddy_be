var express = require('express');
const { verifyToken } = require('../utils/verifyUser');
const {create, getposts, deletepost} =require("../controllers/postController")
var router = express.Router();

router.post("/create",verifyToken,create)
router.get("/getposts",getposts)
router.delete("/deletepost/:postId/:userId",verifyToken,deletepost)

module.exports = router;
