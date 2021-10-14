const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const RealDataSchema = require('../models/realData');
const auth = require('../middlewares/auth');

/**
 * GET method to collect all datasets in the DB
 */
 router.get(`/${projectId}`, auth, async (req, res) => {
    try {
        realdata = await RealDataSchema.find({ project_id: projectId });
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
router.post(`/${projectId}/new`, auth, async (req, res) => {
    const { name, real_data_url } = req.body;
    try {
        data = new RealDataSchema({
            name: name,
            real_data_url: real_data_url
        });

        data._id = mongoose.Types.ObjectId;

        await data.save();

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
router.delete(`/${projectId}/remove`, auth, async (req, res) => {
    try {
        const res = await RealDataSchema.deleteOne({ name: req.name });
        if(!res) {
            return res.status(404).json({
                message: "Dataset does not exist"
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
router.patch(`/${projectId}/update`, auth, async (req, res) => {
    const newName = req.body;
    try {
        const res = await RealDataSchema.findOneAndUpdate({ _id: req._id }, {$set: {name: newName}});
        if(!res) {
            return res.status(404).json({
                message: "Dataset does not exist"
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