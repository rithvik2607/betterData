const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const MlModelSchema = require('../models/mlModels');
const auth = require('../middlewares/auth');
const ProjectSchema = require('../models/projects');

/**
 * GET method to collect all models in the DB
 */
router.get('/:projectId', auth, async (req, res) => {
    try {
        models = await MlModelSchema.find({ project_id: req.params.projectId });
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
router.post('/:projectId/new', auth, async (req, res) => {
    const { name, parameters } = req.body;
    try {
        mlmodel = new MlModelSchema({
            name: name,
            project_id: req.params.projectId,
            parameters: {
                batch_size: parameters.batch_size,
                training_cycles: parameters.training_cycles,
            }
        });

        mlmodel._id = mongoose.Types.ObjectId();

        await mlmodel.save();

        let project = await ProjectSchema.findOne({ _id: req.params.projectId })

        project.mlModels.push(mlmodel);

        await project.save();

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
router.delete('/:projectId/remove', auth, async (req, res) => {
    try {
        const output = await MlModelSchema.deleteOne({ name: req.body.name });
        if(!output) {
            return res.status(404).json({
                message: "Model does not exist"
            });
        }

        let project = await ProjectSchema.findOne({ _id: req.params.projectId })

        let index = project.mlModels.findIndex(x => x.name === req.body.name);

        project.mlModels.splice(index, 1);

        await project.save();

        res.json(req.body.name + " model deleted"); 
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
router.patch('/:projectId/update', auth, async(req, res) => {
    const { newName } = req.body;
    try {
        const newModel = await MlModelSchema.findOneAndUpdate({ name: req.body.name }, {$set: {name: newName}});
        if(!newModel) {
            return res.status(404).json({
                message: "Model does not exist"
            });
        }

        await newModel.save();

        let project = await ProjectSchema.findOne({ _id: req.params.projectId })

        let index = project.mlModels.findIndex(x => x.name === req.body.name);

        project.mlModels[index].name = newName;

        await project.save();

        res.json("Model name updated"); 
    } catch(err) {
        console.log(err.message);
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

module.exports = router;