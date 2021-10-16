const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const SyntheticDataSchema = require('../models/syntheticData');
const auth = require('../middlewares/auth');
const MlModelSchema = require('../models/mlModels');

/**
 * GET method to collect all datasets in the DB
 */
 router.get('/:mlmodelId', auth, async (req, res) => {
    try {
        // Collect synthetic dataset from DB and return them
        syndata = await SyntheticDataSchema.find({ mlmodelId: req.params.mlmodelId });
        res.json(syndata);
    } catch(err) {
        // On failure log the error message and return status 500
        console.log(err.message);
        res.status(500).json({ 
            message: "Server Error" 
        });
    }
});

/**
 * POST method to add dataset into DB
 */
router.post('/:mlmodelId/new', auth, async (req, res) => {
    const { name, url } = req.body;
    try {
        // Collect ML Model from DB to verify if the user owns this ML Model
        let mlModel = await MlModelSchema.findOne({ _id: req.params.mlmodelId, user_id: req.user.id });

        // If not return error
        if(!mlModel) {
            return res.status(404).json({
                message: "Incorrect Model chosen"
            });
        }

        // Get name and parameters of dataset
        data = new SyntheticDataSchema({
            name: name,
            user_id: req.user.id,
            mlmodelId: req.params.mlmodelId,
            url: url
        });

        data._id = mongoose.Types.ObjectId();

        // Save the object into DB
        await data.save();

        // Push the data object into synthetic_data array 
        mlModel.synthetic_data.push(data);

        // Save mlModel
        await mlModel.save();

        // Return data object in JSON format
        res.json(data);
    } catch(err) {
        // On failure log the error message and return status 500
        console.log(err.message);
        res.status(500).json({ 
            message: "Server Error" 
        });
    }
});

/**
 * DELETE method to remove a dataset
 */
router.delete('/:mlmodelId/remove', auth, async (req, res) => {
    try {
        // Collect ML Model from DB to verify if the user owns this ML Model
        let mlModel = await MlModelSchema.findOne({ _id: req.params.mlmodelId, user_id: req.user.id });

        // If not return error
        if(!mlModel) {
            return res.status(404).json({
                message: "Incorrect Model chosen"
            });
        }

        // Find Synthetic Dataset with the specified name and in the same Model and delete it
        const output = await SyntheticDataSchema.deleteOne({ name: req.body.name, model_id: req.params.mlmodelId, user_id: req.user.id });
        // If no elements were deleted, return status 404
        if(!output.deletedCount) {
            return res.status(404).json({
                message: "Dataset does not exist"
            });
        }

        // Find dataset in ML Model and delete it
        let index = mlModel.synthetic_data.findIndex(x => x.name === req.body.name);

        mlModel.synthetic_data.splice(index, 1);

        // Save project
        await mlModel.save();

        // Return status 200
        return res.status(200).json({
            message:  req.body.name  + " deleted"
        }); 
    } catch(err) {
        // On failure log the error message and return status 500
        console.log(err.message);
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

module.exports = router;