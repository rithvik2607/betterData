const mongoose = require('mongoose');
const { ObjectId } = require('bson');

const SyntheticDataSchema = new mongoose.Schema({
    _id: {
        type: ObjectId,
        required: true
    },
    name: {
        type: String,
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