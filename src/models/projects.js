const mongoose = require('mongoose');
const  MlModelSchema = require('./mlModels').schema;
const  RealDataSchema = require('./realData').schema;
const { ObjectId } = require('bson');

// Build schema for Projects, include ML model schema
// and Real data schema as each project has some models 
// and datasets under it
const ProjectsSchema = new mongoose.Schema({
    _id: {
        type: ObjectId,
        required: true
    },
    user_id: {
        type: ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mlModels: [MlModelSchema],
    realData: [RealDataSchema],
});

module.exports = mongoose.model('Projects', ProjectsSchema);
