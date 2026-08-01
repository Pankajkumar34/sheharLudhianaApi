const jwt = require("jsonwebtoken");


exports.generateAccessToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "356d",
        }
    );
};

exports.generateRefreshToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "30d",
        }
    );
};