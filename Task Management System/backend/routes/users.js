const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });

  try {
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(400).json({ message: "Error registering user", error });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token, role: user.role });
});

// Assign Role (Admin Only)
router.put("/role/:id", authMiddleware(["admin"]), async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Error updating role", error });
  }
});

module.exports = router;
