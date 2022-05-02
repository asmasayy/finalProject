const AuthorModel = require("../models/authorModel")
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const createAuthors = async function (req, res) {
    try {
        let a = req.body;
        if (Object.keys(a).length != 0) {
            // We have handled edge cases here
            if (a.firstName === undefined || a.lastName === undefined || a.title === undefined || a.password === undefined) {
                return res.status(400).send({ status: false, msg: "Mandatory field missing" })
            }
            if (a.firstName.trim().length == 0 || a.lastName.trim().length == 0 || a.title.trim().length == 0 || a.password.trim().length == 0) {
                return res.status(400).send({ status: false, msg: "input missing" })
            }
            let checkEmail = await AuthorModel.findOne({ email: a.email })
            if (checkEmail) return res.status(409).send({ msg: "Email already exist" })

            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(a.email))) {
                return res.status(400).send({ status: false, message: 'email should be a valid email address' })
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
