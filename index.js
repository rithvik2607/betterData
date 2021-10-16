const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const user = require("./src/routes/users");
const model = require("./src/routes/models");
const data = require("./src/routes/data");
const syntheticData = require("./src/routes/syntheticData");

// Connecting to DB
const uri = process.env.MONGODB_TOKEN;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology:true
})
.then(() => {
    console.log("MongoDB connected");
})
.catch(err => console.log(err));

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/user", user);
app.use("/model", model);
app.use("/data", data);
app.use("/syndata", syntheticData);

// Server listens at port 3000
app.listen(port, () => console.log("Server is running on port " + port));