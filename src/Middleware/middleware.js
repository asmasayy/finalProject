const jwt = require("jsonwebtoken")
const BlogModel = require("../models/blogModel")
// const { check, validationResult } = require("express-validator");

const authentication = async function (req, res, next) {
    try {
        let token = req.headers['x-api-key'] || req.headers['X-Api-Key']

        if (!token) {
            return res.status(401).send({ status: false, msg: "token must be present" })
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
            return res.status(403).send({ status: false, msg: "Not authorised" })
        } 

        next()

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}


const qauth = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["X-Api-Key"]
        if (!token) {
            return res.status(400).send({ Error: "Enter x-api-key In Header" });
        }
        let decodedToken = jwt.verify(token, "bloggers")
        let authorId = req.query.authorId;

        // if (authorId.length < 24) {
        //     return res.status(404).send({ msg: "Enter Valid Blog-Id" });
        // }
        let decoded = decodedToken.authorid
        let blog = await BlogModel.findOne({authorId:authorId});
        if (!blog) {
            return res.send("Author doesn't exist");
        }
        let author = blog.authorId.toString()
        console.log(author)
        if (author != decoded) {
            return res.status(404).send("Not Authorised!!")
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}
module.exports.qauth = qauth;





module.exports = { authentication, authUser,qauth }




// let authordata = blog.authorId.toString()
// if (authordata != decode) {
//     return res.send("Not Authorised!")
// }