const mongoose = require("mongoose");

const { MONGODB_URL } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGODB_URL)
    .then(() => {
      console.log("DB connected successfully");
    })
    .catch((err) => {
      console.log(`Can't connect to db. error : ${err}`);
      process.exit();
    });
};
