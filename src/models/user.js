const mongoose = require('mongoose');
const ProjectSchema = require('../models/projects').schema;

const UserSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('Users', UserSchema);
