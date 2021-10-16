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
        // Collect models from DB and return them
        models = await MlModelSchema.find({ project_id: req.params.projectId });
        res.json(models);
    } catch(err) {
        // On failure log the error message and return status 500
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
    // Collect project from DB to verify if the user owns this project
    let project = await ProjectSchema.findOne({ _id: req.params.projectId, user_id: req.user.id });

    // If not return error
    if(!project) {
        return res.status(404).json({
            message: "Incorrect Project chosen"
        });
    }

    // Get name and parameters of dataset
    const { name, parameters } = req.body;
    try {
        // Make model object
        mlmodel = new MlModelSchema({
            name: name,
            user_id: req.user.id,
            project_id: req.params.projectId,
            parameters: {
                batch_size: parameters.batch_size,
                training_cycles: parameters.training_cycles,
            }
        });

        mlmodel._id = mongoose.Types.ObjectId();

        // Save the object into DB
        await mlmodel.save();

        // Push the model object into mlModels array 
        project.mlModels.push(mlmodel);

        // Save project
        await project.save();

        // Return model object in JSON format
        res.json(mlmodel);
    } catch(err) {
        // On failure log the error message and return status 500
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
        // Collect project from DB to verify if the user owns this project
        let project = await ProjectSchema.findOne({ _id: req.params.projectId, user_id: req.user.id });

        // If not return error
        if(!project) {
            return res.status(404).json({
                message: "User not authorized"
            });
        }

        // Find ML Model with the specified name and in the same project and delete it
        const output = await MlModelSchema.deleteOne({ name: req.body.name, project_id: req.params.projectId, user_id: req.user.id });
        // If no elements were deleted, return status 404
        if(!output.deletedCount) {
            return res.status(404).json({
                message: "Model does not exist"
            });
        }

        // Find ML Model in project and delete it
        let index = project.mlModels.findIndex(x => x.name === req.body.name);

        project.mlModels.splice(index, 1);

        // Save project
        await project.save();

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

/**
 * PATCH method to update name of the model
 */
router.patch('/:projectId/update', auth, async(req, res) => {
    // Collect the new name from request body
    const { newName } = req.body;
    try {
        // Collect project from DB to verify if the user owns this project
        let project = await ProjectSchema.findOne({ _id: req.params.projectId, user_id: req.user.id });

        // If not return error
        if(!project) {
            return res.status(404).json({
                message: "User not authorized"
            });
        }

        // Find ML Model with the specified name and in the same project and update its name
        const newModel = await MlModelSchema.findOneAndUpdate({ name: req.body.name, user_id: req.user.id }, {$set: {name: newName}});
        // If no elements were changed, return status 404
        if(!newModel) {
            return res.status(404).json({
                message: "Model does not exist"
            });
        }

        // Save the changes to DB
        await newModel.save();

        // Find the Ml Model in project
        let index = project.mlModels.findIndex(x => x.name === req.body.name);

        // Change the name
        project.mlModels[index].name = newName;

        // Save the project
        await project.save();

        // Return status 200
        return res.status(200).json({
            message:  req.body.name  + " updated"
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