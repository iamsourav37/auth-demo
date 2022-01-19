require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
//! middleware related
const auth = require("./middlewares/auth");

//! model related
const User = require("./models/User");

app.use(express.json());
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("auth app");
});

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    console.log(req.body);

    if (!(firstname && lastname && email && password)) {
      return res.status(400).send("all fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("user is already exists");
    }

    const encryPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: encryPassword,
    });

    //! generate token

    const token = jwt.sign(
      { user_id: user._id, user_email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "3h" }
    );
    user.token = token;
    user.save();
    return res.status(201).send(user);
  } catch (error) {
    console.log("something is wrong.", error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).send("email & password is required");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = await jwt.sign(
        { user_id: user._id, user_email: email },
        process.env.SECRET_KEY,
        { expiresIn: "3h" }
      );
      user.token = token;
      user.password = undefined;
      // return res.status(200).json({ user });
      // if you want to send cookie

      const cookieOptions = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", token, cookieOptions).json({
        success: true,
        token: token,
        user: user,
      });
    } else {
      return res.status(404).send("Invalid credentials");
    }
  } catch (error) {
    console.log(`something is wrong in login. error : ${error}`);
  }
});

app.get("/dashboard", auth, (req, res) => {
  return res.status(200).json({
    msg: "secret information for authorized users",
    user: req.user,
  });
});

app.post("/logout", auth, (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    msg: "You logged out successfully",
    msg2: "all the token from cookies is cleared",
  });
});

module.exports = app;
