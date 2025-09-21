const errorController = {};

errorController.triggerError = (req, res, next) => {
  try {
    throw new Error("Error 500: Internal Server Error");
  } catch (err) {
    next(err); // Pass to error handler middleware
  }
};

module.exports = errorController;
