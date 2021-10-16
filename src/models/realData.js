const mongoose = require('mongoose');
const { ObjectId } = require('bson');

// Build schema for Real Datasets. Project ID and user ID are included
// to verify whether the user is allowed to modify the dataset or not
const RealDataSchema = new mongoose.Schema({
    _id: {
        type: ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    user_id: {
        type: ObjectId,
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

module.exports = mongoose.model('RealData', RealDataSchema);
