const AuthorModel = require("../models/authorModel");
const moment = require("moment")
const BlogModel = require("../models/blogModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// 1st

const createAuthors = async function (req, res) {
    try {
        let a = req.body;
        if (Object.keys(a).length != 0) {
            // We have handled edge cases here
            if (a.firstName === undefined || a.lastName === undefined || a.title === undefined || a.password === undefined) {
                return res.status(400).send({ status: false, msg: "Mandatory field missing" })
            }


            //  here the model is created in database
            let savedDate = await AuthorModel.create(a)
            res.status(201).send({ status: true, msg: savedDate })

        }
        else {
            return res.status(400).send({ status: false, msg: "BAD REQUEST" })
        }

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}
module.exports.createAuthors = createAuthors;

// 2nd


const createBlogs = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "BAD REQUEST" })

        if (data.title === undefined || data.tags === undefined || data.category === undefined || data.subcategory === undefined) {
            return res.status(400).send({ status: false, msg: "Mandatory field missing" })
        }

        let authorid = await AuthorModel.findById(data.authorId);
        if (!authorid) {
            return res.status(400).send({ status: false, msg: " AuthorId is required or not valid" });
        }

        if (data.isPublished == true) {
            req.body.publishedAt = Date.now();
            let createblogs = await BlogModel.create(data);

            res.status(201).send({ status: true, msg: createblogs });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};
module.exports.createBlogs = createBlogs;


// 3rd

const getBlogs = async function (req, res) {
    try {
        req.query.isDeleted = false
        req.query.isPublished = true
        // here we are checking query validation
        let filter = await BlogModel.find(req.query).populate("authorId");
        if (!filter.length)
            return res.status(404).send({ status: false, msg: "No such documents found." })
        res.status(200).send({ status: true, data: filter })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getBlogs = getBlogs;

// 4th
const updateBlogs = async function (req, res) {
    try {
        let Id = req.params.blogId
        if (Id.match()) {

            let user = await BlogModel.findById(Id)
            if (!user) {
                return res.status(404).send({ staus: false, msg: "No such blog exists" });
            }
            let userData = req.body;
            let updatedBlog = await BlogModel.findByIdAndUpdate({ _id: Id }, userData)
            if (updatedBlog.isPublished == true) {
                updatedBlog.publishedAt = new Date();
            }
            if (updatedBlog.isPublished == false) {
                updatedBlog.publishedAt = null;
            }

            return res.status(201).send({ status: true, data: updatedBlog });
        }

        else res.status(400).send({ msg: "BAD REQUEST" })
    }

    catch (err) {
        res.status(500).send({ status: false })
    }
};
module.exports.updateBlogs = updateBlogs;

// 5th

const validateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId
        let validateblogId = await BlogModel.findOne({ _id: blogId, isDeleted: false })

        if (!validateblogId) {
            return res.status(404).send({ status: false, msg: "BlogId does not exist." })
        }
        let updatedBlog = await BlogModel.findByIdAndUpdate({ _id: blogId }, { $set: { isDeleted: true } }, { deletedAt: Date.now() })
        res.status(200).send({ msg: "Successfully updated." })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
};
module.exports.validateBlog = validateBlog;


// 6th
const deleteBlog = async function (req, res) {
    try {
        let data = req.query
        if (Object.keys(data) === 0)

            return res.status(400).send({ status: false, msg: "input missing" })

        let deleted = await BlogModel.updateMany({
            $and: [data, { ispublised: false }]
        }, { isDeleted: true, deletedAt: Date.now() }, { new: true }
        );

        if (!deleted)
            return res.staus(404).send({ status: false, msg: "Blog not found" });
        return res.status(200).send({ status: true, data: deleted });


    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}
module.exports.deleteBlog = deleteBlog;


const login = async function (req, res) {

    let userName = req.body.email;
    let pass = req.body.password;

    let user = await AuthorModel.findOne({ email: userName, password: pass });
    if (!user)
        return res.send({
            status: false,
            msg: "username or the password is not correct",
        });

    let token = jwt.sign(
        {
            authorId: user._id.toString(),
            country: "India",
            organisation: "FUnctionUp",
        },
        "bloggers"
    );
    res.setHeader("x-api-key", token);
    res.send({ status: true, data: token });
};


module.exports.login = login;