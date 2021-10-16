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
        // Check whether the email and password are valid, if not return error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        // Collect email and password from body
        const { email, password } = req.body;
        try {
            // Check if user already exists
            let user = await UserSchema.findOne({ email: email });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }

            // Create new user object
            user = new UserSchema({
                email,
                password
            });

            // Create salt and hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            user._id = mongoose.Types.ObjectId();

            // Save user object
            await user.save();

            // Create JWT and return to user in JSON response
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
            // On failure log the error message and return status 500
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
        // Check whether the email and password are valid, if not return error
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        // Collect email and password from body
        const { email, password } = req.body;
        try {
            // Find user in DB, if not found return error
            let user = await UserSchema.findOne({ email: email });
            if(!user) {
                return res.status(404).json({
                    message: "User does not exist"
                });
            }

            // Compare account password and user password
            const isMatch = await bcrypt.compare(password, user.password);
            // If they do not match return error
            if(!isMatch) {
                return res.status(400).json({
                    message: "Incorrect Password"
                });
            }
            
            // Create JWT and return to user in JSON response
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
            // On failure log the error message and return status 500
            console.log(err.message);
            return res.status(500).json({
                message: "Server Error"
            });
        }
    }
);

/**
 * POST method to add projects
 */
router.post("/project", auth, async (req, res) => {
    const { name } = req.body;
    try {
        // Find projects of user and check if any of them have the same name as provided
        let project = await ProjectSchema.findOne({ name: name, user_id: req.user.id });
        if(project) {
            return res.status(400).json({
                msg: "Project Already Exists"
            });
        }

        // Create new project object
        project = new ProjectSchema({
            user_id: req.user.id,
            name: name,
        });
        
        project._id = mongoose.Types.ObjectId();

        // Retrieve user object from DB
        let user = await UserSchema.findOne({ _id: req.user.id });
        
        // Add project to projects array of user
        user.projects.push(project);

        // Save the project
        await project.save();
        
        // Save user
        await user.save();

        // Send project as JSON response
        res.json(project);
    } catch(err) {
        // On failure log the error message and return status 500
        console.log(err.message);
        res.status(500).json({ message: "Unable to find projects of user" });
    }
})

/**
 * GET method to get info of user
 */
router.get("/me", auth, async (req, res) => {
    try {
        // Find projects of user and return them
        const projects = await ProjectSchema.find({user_id: req.user.id});
        res.json(projects);
    } catch(err) {
        // On failure log the error message and return status 500
        console.log(err.message);
        res.status(500).json({ message: "Unable to find user" });
    }
});

module.exports = router;