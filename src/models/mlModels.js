const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const SyntheticDataSchema = require('../models/syntheticData').schema;

// Build schema for ML model, include synthetic data schema
// as synthetic datasets are related to that specific model
// project ID and user ID are included as they can used to verify
// whether user can alter the model or not
const MlModelSchema = mongoose.Schema({
    _id: {
        type: ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    user_id: {
        type: ObjectId,
        required: true
    },
    project_id: {
        type: ObjectId,
        required: true,
    },
    parameters: {
        batch_size: {
            type: Number,
            required: true,
        },
        training_cycles: {
            type: Number,
            required: true,
        }
    },
    synthetic_data: [SyntheticDataSchema]
});

module.exports = mongoose.model('MlModels', MlModelSchema);
