const express = require('express');
const { validationResult, check } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const mongoose = require("mongoose");

const UserSchema = require("../models/user");
const ProjectSchema = require("../models/projects");
const auth = require('../middlewares/auth');

/**
 * POST method to signup to the service
 */
router.post("/signup",
    [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        try {
            let user = await UserSchema.findOne({ email });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }

            user = new UserSchema({
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            user._id = mongoose.Types.ObjectId;

            await user.save();

            const payload = {
                user: {
                    id: user._id
                }
            };

            jwt.sign(payload, "randomString", { expiresIn: 10000 }, (err, token) => {
                if(err) throw err;
                res.status(200).json({
                    token
                });
            });
        } catch(err) {
            console.log(err.message);
            res.status(500).json({
                message: "Error in saving"
            });
        }
    }
);

/**
 * POST method to login to the service
 */
router.post("/login", 
    [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({
                errors: error.array()
            });
        }

        const { email, password } = req.body;
        try {
            let user = await UserSchema.findOne({ email });
            if(!user)
                return res.status(404).json({
                    message: "User does not exist"
                });

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password"
                });
            
            const payload = {
                user: {
                    id: user._id
                }
            };

            jwt.sign(payload, "randomString", { expiresIn: 3600 }, (err, token) => {
                    if(err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch(err) {
            console.log(err.message);
            return res.status(500).json({
                message: "Server Error"
            });
        }
    }
);

/**
 * GET method to get info of user
 */
router.get("/me", auth, async (req, res) => {
    try {
        const projects = await ProjectSchema.find({user_id: req.user.id});
        res.json(projects);
    } catch(err) {
        console.log(err.message);
        res.status(500).json({ message: "Unable to find user" });
    }
});

module.exports(router);