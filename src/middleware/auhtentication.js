const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                success: false,
                message: "Access token is required.",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        console.log(decoded, "=====decoded")

        const user = await User.findById(decoded.id)
            .select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive.",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired.",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid access token.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed.",
            error: error.message,
        });
    }
};