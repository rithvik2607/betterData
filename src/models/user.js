const mongoose = require('mongoose');
const ProjectSchema = require('../models/projects').schema;

// Build user schema. Contains projects as subdocument
// to relate projects with their respective users.
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
