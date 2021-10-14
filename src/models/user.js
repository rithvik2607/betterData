const mongoose = require('mongoose');
const { ObjectId } = require("bson");
const ProjectSchema = require('../models/projects');

const UserSchema = new mongoose.Schema({
    _id: {
        type: ObjectId,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    projects: [ProjectSchema],
})

module.exports = mongoose.model("Users", UserSchema);
