const asyncHandler = require('./async.js');
const ErrorResponse = require('../utils/errResponse.js');
const UserSchema = require("../models/User.js");
const jwt = require("jsonwebtoken");

exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    // 判断该请求是否拥有token
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookie && req.cookie.token) {
        token = req.cookie.token;
    }

    // 检验token是否存在
    if (!token) {
        return next(new ErrorResponse("无权限访问该路由", 401));
    }

    try {
        // 验证token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await UserSchema.findById(decoded.uid);
        next();
    } catch (e) {
        return next(new ErrorResponse("无权限访问该路由", 401));
    }
})
