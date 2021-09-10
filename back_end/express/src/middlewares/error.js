const ErrorResponse = require('../utils/errResponse')

/**
 * 错误处理
 * @param err
 * @param req
 * @param res
 */
const errorHandler = (err, req, res) => {
    // id数据源报错
    if (err.name === "CastError") {
        const message = `Resource not found with id of ${err.value}`
        err = new ErrorResponse(message, 404);
    }

    // 校验失败
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message);
        err = new ErrorResponse(message, 404);
    }

    res.status(err.statusCode || 500).json({
        code: err.code || err.statusCode,
        message: err.message || "Server Error"
    });
};

module.exports = errorHandler;
