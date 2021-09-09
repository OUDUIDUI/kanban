const UserSchema = require("../models/User");
const ErrorResponse = require('../utils/errResponse.js');
const asyncHandler = require('../middlewares/async.js');
const bcrypt = require("bcryptjs");

/**
 * @desc   注册
 * @route  POST /api/v1/auth/register
 * @access public
 */
exports.register = asyncHandler(async (req, res, next) => {
    // 获取body内容
    const {nickname, password, email} = req.body;
    // 密码加密
    const newPass = await passEncrypt(password);
    // 注册用户
    const user = await UserSchema.create({
        nickname, password: newPass, email
    })
    // 生成token
    sendTokenResponse(user, 200, res);
})

/**
 * 密码加密
 * @param password<string> 密码
 * @returns {Promise<string>}
 */
const passEncrypt = async (password) => {
    const salt = await bcrypt.genSalt(10);   // 加密规则
    return await bcrypt.hash(password, salt);
}

/**
 * 生成token返回
 * @param user 用户
 * @param statusCode 状态码
 * @param res response
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),  // cookie有效期
        httpOnly: true,    // 支持http请求
    };

    // 正式环境下不支持http
    if (process.env.NODE_ENV === "production") {
        options.httpOnly = false;
    }

    res.status(statusCode).cookie("token", token, options).json({
        nickname: user.nickname,
        email: user.email,
        token
    });
}
