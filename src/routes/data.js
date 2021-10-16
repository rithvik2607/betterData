const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const RealDataSchema = require('../models/realData');
const auth = require('../middlewares/auth');
const ProjectSchema = require('../models/projects');

/**
 * GET method to collect all datasets in the DB
 */
 router.get('/:projectId', auth, async (req, res) => {
    try {
        // Collect datasets from DB and return them
        realdata = await RealDataSchema.find({ project_id: req.params.projectId });
        res.json(realdata);
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
router.post('/:projectId/new', auth, async (req, res) => {
    // Get name and url of dataset
    const { name, real_data_url } = req.body;
    try {
        // Collect project from DB to verify if the user owns this project
        let project = await ProjectSchema.findOne({ _id: req.params.projectId, user_id: req.user.id });

        // If not return error
        if(!project) {
            return res.status(404).json({
                message: "Incorrect Project chosen"
            });
        }

        // Make data object
        data = new RealDataSchema({
            name: name,
            user_id: req.user.id,
            project_id: req.params.projectId,
            real_data_url: real_data_url
        });

        data._id = mongoose.Types.ObjectId();

        // Save the object into DB
        await data.save();

        // Push the data object into realData array 
        project.realData.push(data);

        // Save project
        await project.save();

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

        // Find dataset with the specified name and in the same project and delete it
        const output = await RealDataSchema.deleteOne({ name: req.body.name, project_id: req.params.projectId, user_id: req.user.id });
        // If no elements were deleted, return status 404
        if(!output.deletedCount) {
            return res.status(404).json({
                message: "Dataset does not exist"
            });
        }

        // Find dataset in project and delete it
        let index = project.realData.findIndex(x => x.name === req.body.name);

        project.realData.splice(index, 1);

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
router.patch('/:projectId/update', auth, async (req, res) => {
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

        // Find dataset with the specified name and in the same project and update its name
        const newData = await RealDataSchema.findOneAndUpdate({ name: req.body.name, user_id: req.user.id }, {$set: {name: newName}});
        // If no elements were changed, return status 404
        if(!newData) {
            return res.status(404).json({
                message: "Dataset does not exist"
            });
        }

        // Save the changes to DB
        await newData.save();

        // Find the dataset in project
        let index = project.realData.findIndex(x => x.name === req.body.name);

        // Change the name
        project.realData[index].name = newName;

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