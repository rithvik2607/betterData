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
        realdata = await RealDataSchema.find({ project_id: req.params.projectId });
        res.json(realdata);
    } catch(err) {
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
    const { name, real_data_url } = req.body;
    try {
        data = new RealDataSchema({
            name: name,
            project_id: req.params.projectId,
            real_data_url: real_data_url
        });

        data._id = mongoose.Types.ObjectId();

        await data.save();

        let project = await ProjectSchema.findOne({ _id: req.params.projectId })

        project.realData.push(data);

        await project.save();

        res.json(data);
    } catch(err) {
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
        const output = await RealDataSchema.deleteOne({ name: req.body.name });
        if(!output) {
            return res.status(404).json({
                message: "Dataset does not exist"
            });
        }

        let project = await ProjectSchema.findOne({ _id: req.params.projectId })

        let index = project.realData.findIndex(x => x.name === req.body.name);

        project.realData.splice(index, 1);

        await project.save();

        res.json(req.body.name + " deleted"); 
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
router.patch('/:projectId/update', auth, async (req, res) => {
    const { newName } = req.body;
    try {
        const newData = await RealDataSchema.findOneAndUpdate({ name: req.body.name }, {$set: {name: newName}});
        if(!newData) {
            return res.status(404).json({
                message: "Dataset does not exist"
            });
        }

        await newData.save();

        let project = await ProjectSchema.findOne({ _id: req.params.projectId })

        let index = project.realData.findIndex(x => x.name === req.body.name);

        project.realData[index].name = newName;

        await project.save();

        res.json("Dataset name updated"); 
    } catch(err) {
        console.log(err.message);
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

module.exports = router;