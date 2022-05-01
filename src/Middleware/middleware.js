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
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }


    next()
}

const authUser = async function (req, res, next) {
    try {
        let token = req.headers['x-api-key'] || req.headers['X-Api-Key']

        let decodedToken = jwt.verify(token, "bloggers")
        console.log(decodedToken.authorId)
        let decode= decodedToken.authorId

        let blogId = req.params.blogId
        

        let blog = await BlogModel.findById( blogId )

        if (!blogId) {
            return res.send({ status: false, msg: "Blog does not exist" })
        }
        let authordata = blog.authorId.toString()
        if (authordata != decode) {
            return res.send("Not Authorised!")
        }
        next()
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}





module.exports = { authentication, authUser }