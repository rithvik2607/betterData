const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const MlModelSchema = require('../models/mlModels');
const auth = require('../middlewares/auth');

/**
 * GET method to collect all models in the DB
 */
router.get(`/${projectId}`, auth, async (req, res) => {
    try {
        models = await MlModelSchema.find({ project_id: projectId });
        res.json(models);
    } catch(err) {
        console.log(err.message);
        res.status(500).json({ 
            message: "Server Error"
        });
    }
});

/**
 * POST method to create new models
 */
router.post(`/${projectId}/new`, auth, async (req, res) => {
    const { name, batch_size, training_cycles, synthetic_data } = req.body;
    try {
        mlmodel = new MlModelSchema({
            name: name,
            project_id: projectId,
            parameters: {
                batch_size: batch_size,
                training_cycles: training_cycles,
            },
            // TODO: Make separate route file for synthetic data
            synthetic_data: synthetic_data,
        });

        mlmodel._id = mongoose.Types.ObjectId;

        await mlmodel.save();

        res.json(mlmodel);
    } catch(err) {
        console.log(err.message);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

/**
 * DELETE method to remove a model
 */
router.delete(`/${projectId}/remove`, auth, async (req, res) => {
    try {
        const res = await MlModelSchema.deleteOne({ name: req.name });
        if(!res) {
            return res.status(404).json({
                message: "Model does not exist"
            });
        }
    } catch(err) {
        console.log(err.message);
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

/**
 * PATCH method to update name of the model
 */
router.patch(`/${projectId}/update`, auth, async(req, res) => {
    const newName = req.body;
    try {
        const res = await MlModelSchema.findOneAndUpdate({ _id: req._id }, {$set: {name: newName}});
        if(!res) {
            return res.status(404).json({
                message: "Model does not exist"
            });
        }
    } catch(err) {
        console.log(err.message);
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

module.exports(router);