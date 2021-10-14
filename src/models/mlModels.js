const { ObjectId } = require('bson');
const mongoose = require('mongoose');

const MlModelSchema = mongoose.Schema({
    _id: {
        type: ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true,
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
    synthetic_data_url: {
        type: String,
    }
});

module.exports = mongoose.model("MlModels", MlModelSchema);
