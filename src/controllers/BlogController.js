const AuthorModel = require("../models/authorModel");
const moment = require("moment")
const BlogModel = require("../models/blogModel");
const mongoose = require("mongoose");


// 1st


const createBlogs = async function (req, res) {
    try {
        let data = req.body

        if (Object.keys(data).length != 0) {


            if (data.title === undefined || data.tags === undefined || data.category === undefined ||
                data.subcategory === undefined || data.title.length == 0 || data.tags.length == 0 || data.category.length == 0
                || data.subcategory.length == 0 || data.authorId.length == 0) {
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
        } else {
            return res.status(400).send({ status: false, msg: "BAD REQUEST" })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
};
module.exports.createBlogs = createBlogs;


// 2nd

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

// 3rd
const updateBlogs = async function (req, res) {
    try {
        let Id = req.params.blogId
        if (Id.match()) {

            let user = await BlogModel.findById(Id)
            if (!user) {
                return res.status(404).send({ staus: false, msg: "No such blog exists" });
            }
            let userData = req.body.body
            let userData1 = req.body.title
            let subcategory = req.body.subcategory;
            let addTag = req.body.tags

            let updatedBlog = await BlogModel.findByIdAndUpdate({ _id: Id },
                { $push: { "tags": addTag, "subcategory": subcategory } })
                .findOneAndUpdate({ $set: { body: userData } }, { $set: { title: userData1 } }, { new: true })
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

// 4th

const validateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId
        let validateblogId = await BlogModel.findOne({ _id: blogId, isDeleted: false })

        if (!validateblogId) {
            return res.status(404).send({ status: false, msg: "BlogId does not exist." })
        }
        let updatedBlog = await BlogModel.findByIdAndUpdate({ _id: blogId },
            { $set: { isDeleted: true } }, { deletedAt: Date.now() })
        res.status(200).send({ msg: "Successfully updated." })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }
};
module.exports.validateBlog = validateBlog;

// 5th
const deleteBlogsByQuery = async function (req, res) {
    try {
        let data = req.query;
        // add a query variable and add a default key value [ isDeleted: false ]
        let query = {
            isDeleted: false
        };

        if (Object.keys(data).length == 0) {
            //-> if data undefined
            return res.status(400).send({
                status: false,
                msg: "no query params available "
            });
        } else {
            //-> if tags defined
            if (data.tags) {
                data.tags = {
                    $in: data.tags
                };
            }

            //-> if subcategory defined
            if (data.subcategory) {
                data.subcategory = {
                    $in: data.subcategory
                };
            }

            // create a query structure in [ query.$or = ... }
            query["$or"] = [{
                authorId: data.authorId
            },
            {
                tags: data.tags
            },
            {
                category: data.category
            },
            {
                subcategory: data.subcategory
            }
            ];
        }

        // console.log(query)
        // check if the query related data exist OR not
        const available = await BlogModel.find(query).count();
        if (available == 0) {
            return res.status(404).send({
                status: false,
                msg: "query data not found"
            });
        }

        // perform delete here using update many 
        const deleteData = await BlogModel.updateMany(query, {
            $set: {
                isDeleted: true
            }
        });
        res.status(200).send({
            status: true,
            msg: deleteData
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            msg: error.message
        });
    }
};
module.exports.deleteBlogsByQuery = deleteBlogsByQuery;

