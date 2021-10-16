const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("token");
    // Return error if no JWT found
    if(!token) return res.status(401).json({message: "Auth error"});

    // Verify the JWT, return user if successful
    // else return error 
    try {
        const decoded = jwt.verify(token, "randomString");
        req.user = decoded.user;
        next();
    } catch(err) {
        console.log(err.message);
        res.status(500).send({message: "Invalid Token"});
    }
};