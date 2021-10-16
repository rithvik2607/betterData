const mongoose = require('mongoose');
const { ObjectId } = require('bson');

// Build schema for synthetic data. User ID and ML Model ID
// are used for verify whether user is allowed to alter 
// the synthetic data object or not
const SyntheticDataSchema = new mongoose.Schema({
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
    mlmodelId: {
        type: ObjectId,
        required: true
    },
    url: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('SyntheticData', SyntheticDataSchema);