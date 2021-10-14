const mongoose = require('mongoose');
const MlModelSchema = require('./mlModels');
const RealDataSchema = require('./realData');
const { ObjectId } = require('bson');

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
    mlModels: MlModelSchema,
    data: RealDataSchema,
});

module.exports = mongoose.model("Projects", ProjectsSchema);
