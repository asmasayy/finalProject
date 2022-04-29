const express = require("express");
const router = express.Router();
const allControllers = require("../controllers/controller");
const middleware=require("../Middleware/middleware")

router.get("/test-me", function(req , res){
    res.send("Let's start!!!")
});

router.post("/createAuthor",allControllers.createAuthors);

router.post("/createBlog",allControllers.createBlogs);

router.get("/blogs",middleware.authentication,middleware.authUser,allControllers.getBlogs);

router.put("/Blogs/:blogId",middleware.authentication,middleware.authUser,allControllers.updateBlogs);

router.delete("/blogs/:blogId",middleware.authentication,middleware.authUser,allControllers.validateBlog);

router.delete("/Blogs",middleware.authentication,middleware.authUser,allControllers.deleteBlog);

router.post("/login",allControllers.login);






module.exports = router;