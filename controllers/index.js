const path = require("path");

exports.index = (req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
};
