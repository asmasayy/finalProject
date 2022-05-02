const jwt = require("jsonwebtoken")
const BlogModel = require("../models/blogModel")
// const { check, validationResult } = require("express-validator");

const authentication = async function (req, res, next) {
    try {
        let token = req.headers['x-api-key'] || req.headers['X-Api-Key']

        if (!token) {
            res.status(401).send({ status: false, msg: "token must be present" })
        }

        let decodedToken = jwt.verify(token, "bloggers")
        if (!decodedToken) {
            res.status(401).send({ status: false, msg: "token is invalid" })
        }
        req["decodedToken"] = decodedToken 

        next()
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const authUser = async function (req, res, next) {
    try {
    
        let authorId= req.decodedToken.authorId
        // console.log(authorId)

        let blogId = req.params.blogId
        // console.log(blogId)

        let blog = await BlogModel.findOne( {authorId: authorId, _id:blogId})

        if (!blog) {
            return res.status(403).send({ status: false, msg: "Blog does not exist" })
        } 

        next()

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}





module.exports = { authentication, authUser }




// let authordata = blog.authorId.toString()
// if (authordata != decode) {
//     return res.send("Not Authorised!")
// }