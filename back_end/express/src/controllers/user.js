const UserSchema = require("../models/User");
const ErrorResponse = require('../utils/errResponse.js');
const asyncHandler = require('../middlewares/async.js');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail")

/**
 * @desc   注册
 * @route  POST /api/user/register
 * @access public
 */
exports.register = asyncHandler(async (req, res, next) => {
    // 获取body内容
    const {nickname, password, email, avatar} = req.body;

    // 查找有没有重复邮箱
    let users = await UserSchema.find({email});
    if (users.length) {
        return next(new ErrorResponse('该邮箱已被注册过了', 500));
    }

    // 注册用户
    const user = await UserSchema.create({
        nickname, password, email, avatar
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
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse("请输入正确的邮箱或密码", 401));
    }

    // 生成token
    sendTokenResponse(user, 200, res);
})

/**
 * @desc   获取用户信息
 * @route  GET /api/user
 * @access private
 */
exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = req.user;  // 用户鉴权的时候，已经获取user保存到req中

    res.status(200).json({
        ...userResponseHandle(user)
    });
})

/**
 * @desc   更新用户信息
 * @route  PUT /api/user
 * @access private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
    // 获取更新信息
    const fieldsToUpdate = {
        nickname: req.body.nickname || req.user.nickname,
        avatar: req.body.avatar || req.user.avatar,
    }
    const user = await UserSchema.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
        new: true,
        runValidators: true  // 校验
    });
    res.status(200).json({
        ...userResponseHandle(user)
    });
})

/**
 * @desc   更新用户密码
 * @route  PUT /api/user/password
 * @access private
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const {newPassword, currentPassword} = req.body;
    // 判断旧密码是否匹配
    const user = await UserSchema.findById(req.user._id).select("+password");
    if (!await user.matchPassword(currentPassword)) {
        return next(new ErrorResponse("密码错误", 401));
    }
    // 更新密码
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
})

/**
 * @desc   忘记密码
 * @route  POST /api/user/reset-password
 * @access public
 */
exports.forgetPassword = asyncHandler(async (req, res, next) => {
    const {email} = req.body;
    const user = await UserSchema.findOne({email}).select("+password");
    // 校验用户
    if (!user) {
        return next(new ErrorResponse("未找到该用户", 404));
    }
    // 生成token
    const resetToken = await user.getResetPasswordToken();
    await user.save();

    // 发送邮件 包含重置密码的网址
    const resetUrl = `${req.protocol}://${req.get("host")}/todo-list/reset-password/${resetToken}`;
    const html = resetPasswordEmail(resetUrl);

    try {
        await sendEmail({
            email: email,
            subject: "TodoList重置密码",
            html
        })
    } catch (e) {
        // 发送失败
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});
        return next(new ErrorResponse("邮件发送失败"), 500);
    }
    res.status(200).json({success: true});
})

/**
 * @desc   忘记密码
 * @route  PUT /api/user/reset-password
 * @access public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const {resetToken, password} = req.body;
    // 获取token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    // 查找用户
    const user = await UserSchema.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if (!user) {
        return next(new ErrorResponse("Token无效，请重新操作", 400));
    }

    // 重置密码
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({success: true});
})

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
        ...userResponseHandle(user),
        token
    });
}

/**
 * 处理返回数据
 * @param user
 * @returns {{uid: String, nickname: String, avatar: String, email: String}}
 */
const userResponseHandle = (user) => {
    return {
        uid: user._id,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar
    }
}

/**
 * 邮件模板
 * @param resetUrl
 * @returns {string}
 */
const resetPasswordEmail = (resetUrl) => {
    return `
        <div style="
            margin: 0;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            padding: 20px;
            width: 100vw;
            height: 100vh;
            background: #fff">
            <div style="color: #333;font-size: 24px;line-height: 1.5; font-weight: lighter">
                您在TodoList网站想要重置密码
            </div>
            <div style="color: #333;font-size: 24px;;line-height: 1.5;margin-bottom: 30px;; font-weight: lighter">
                现在需要您在邮箱进行验证操作
            </div>
            <a style="
                box-sizing:border-box;
                padding: 16px 50px;
                height: 50px; 
                border-radius: 25px; 
                font-size: 18px;
                line-height: 1; 
                background: #222; 
                color: #fff;
                border: none;
                text-decoration: none;
                cursor: pointer;
                user-select: none; 
                font-weight: lighter" 
            href="${resetUrl}">
                点击重置您的密码
            </a>
        </div>`
}
