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
        syndata = await SyntheticDataSchema.find({ mlmodelId: req.params.projectId });
        res.json(syndata);
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
router.post('/:mlmodelId/new', auth, async (req, res) => {
    const { name, url } = req.body;
    try {
        data = new SyntheticDataSchema({
            name: name,
            mlmodelId: req.params.mlmodelId,
            url: url
        });

        data._id = mongoose.Types.ObjectId();

        await data.save();

        let mlModel = await MlModelSchema.findOne({ _id: req.params.mlmodelId })

        mlModel.synthetic_data.push(data);

        await mlModel.save();

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
router.delete('/:mlmodelId/remove', auth, async (req, res) => {
    try {
        const output = await SyntheticDataSchema.deleteOne({ name: req.body.name });
        if(!output) {
            return res.status(404).json({
                message: "Dataset does not exist"
            });
        }

        let mlModel = await MlModelSchema.findOne({ _id: req.params.mlmodelId })

        let index = mlModel.synthetic_data.findIndex(x => x.name === req.body.name);

        mlModel.synthetic_data.splice(index, 1);

        await mlModel.save();

        res.json(req.body.name + " deleted"); 
    } catch(err) {
        console.log(err.message);
        return res.status(500).json({
            message: "Server Error"
        });
    }
});

module.exports = router;