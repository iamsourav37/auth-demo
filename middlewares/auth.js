const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  console.log(`cookie : ${req.cookies}`);
  console.log(`header : ${req.header("Authorization")}`);
//   if (req.header("Authorization") || req.cookies) {
//     return res.status(403).json({
//       msg: "token is missing",
//     });
//   }

  if (!req.header("Authorization")) {
    if (!req.cookies) {
      return res.status(403).json({
        msg: "token is missing",
      });
    }
  }

  const token =
    req.cookies.token ||
    req.body.token ||
    req.header("Authorization").split(" ")[1];

  console.log("token", token);

  if (!token) {
    return res.status(403).send("access denied");
  }
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode);
    req.user = decode;
    return next();
  } catch (error) {
    console.log(`error in auth middleware. ${error}`);
  }
};

module.exports = auth;
