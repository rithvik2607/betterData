const mongoose = require('mongoose');
const { ObjectId } = require('bson');

const RealDataSchema = new mongoose.Schema({
    _id: {
        type: ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    project_id: {
        type: ObjectId
    },
    real_data_url: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("RealData", RealDataSchema);
