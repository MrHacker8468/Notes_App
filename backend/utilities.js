const jwt = require("jsonwebtoken");

function authenticationToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // If no token is found, respond with an error
    if (!token) {
        return res.status(401).json({
            error: true,
            message: "Access token is required",
        });
    }

    // Verify the token using the correct secret key
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: true,
                message: "Invalid or expired token",
            });
        }

        // If successful, store the user information in the request
        req.user = user;
        next();
    });
}

module.exports = { 
    authenticationToken,
};
