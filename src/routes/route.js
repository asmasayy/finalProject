const express = require("express");
const router = express.Router();
const blogControllers = require("../controllers/BlogController");
const middleware=require("../Middleware/middleware")
const authorController=require("../controllers/authorcontroller")

router.get("/test-me", function(req , res){
    res.send("Let's start!!!")
});

// ====================Author Apis=========================//

router.post("/createAuthor",authorController.createAuthors);

router.post("/login",authorController.login);

// ===================Blog Apis=============================//

router.post("/createBlog",blogControllers.createBlogs);

router.get("/blogs",middleware.authentication,blogControllers.getBlogs);

router.put("/Blogs/:blogId",middleware.authentication,middleware.authUser,blogControllers.updateBlogs);

router.delete("/blogs/:blogId",middleware.authentication,middleware.authUser,blogControllers.validateBlog);

router.delete("/Blogs",middleware.authentication,blogControllers.deleteBlogsByQuery);



module.exports = router;