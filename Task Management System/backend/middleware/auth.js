const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    // Get the Authorization header
    const token = req.header("Authorization");

    // If no token is provided
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    try {
      // Check if the token starts with 'Bearer ' and remove the prefix
      if (token.startsWith("Bearer ")) {
        const jwtToken = token.replace("Bearer ", "");

        // Verify the token
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

        // Attach the decoded user to the request object
        req.user = await User.findById(decoded.id);

        // Check if user exists
        if (!req.user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Check roles (if roles are specified)
        if (roles.length && !roles.includes(req.user.role)) {
          return res.status(403).json({ message: "Permission denied" });
        }

        next();
      } else {
        return res.status(400).json({ message: "Invalid token format" });
      }
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Token is not valid" });
    }
  };
};

module.exports = authMiddleware;
