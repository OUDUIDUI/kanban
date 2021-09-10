const UserSchema = require("../models/User");
const ErrorResponse = require('../utils/errResponse.js');
const asyncHandler = require('../middlewares/async.js');
const bcrypt = require("bcryptjs");

/**
 * @desc   注册
 * @route  POST /api/user/register
 * @access public
 */
exports.register = asyncHandler(async (req, res, next) => {
    // 获取body内容
    const {nickname, password, email} = req.body;
    // 密码加密
    const newPass = await passEncrypt(password);

    // 查找有没有重复邮箱
    let users = await UserSchema.find({email});
    if (users.length) {
        return next(new ErrorResponse('该邮箱已被注册过了', 500));
    }

    // 注册用户
    const user = await UserSchema.create({
        nickname, password: newPass, email
    })
    // 生成token
    sendTokenResponse(user, 200, res);
})

/**
 * @desc   登录
 * @route  POST /api/user/login
 * @access public
 */
exports.login = asyncHandler(async (req, res, next) => {
    // 获取body内容
    const {email, password} = req.body;
    // 验证邮箱密码是否为空
    if (!email || !password) {
        return next(new ErrorResponse("请填写邮箱和密码"), 400);
    }

    // 查找用户 (返回密码匹对)
    const user = await UserSchema.findOne({email}).select("+password");
    if (!user) {
        return next(new ErrorResponse('找不到该用户', 401))
    }

    // 密码匹配
    const isMatch = await matchPassword(password, user.password);
    if (!isMatch) {
        return next(new ErrorResponse("请输入正确的邮箱或密码", 401));
    }

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

/**
 * 密码校验
 * @param enteredPassword 输入的密码
 * @param password 用户密码
 * @returns {Promise<boolean>}
 */
const matchPassword = async (enteredPassword, password) => {
    return await bcrypt.compare(enteredPassword, password);
}
