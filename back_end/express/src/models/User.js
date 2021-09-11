const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    // 昵称
    nickname: {
        type: String,  // 类型
        required: [true, "请添加昵称"],  // 必填
    },
    // 邮箱
    email: {
        type: String,
        unique: true,  // 唯一值
        required: [true, "请填写邮箱"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "请填写正确的邮箱地址",
        ],
    },
    // 邮箱
    avatar: {
        type: String,
        default: 'https://cdn.ouduidui.cn/avatar/ouduidui.png', // 默认值
    },
    // 密码
    password: {
        type: String,
        required: [true, "请添加密码"],
        minlength: 6,
        select: false,    // 不返回
    },
    // 创建时间
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // 重置密码Token
    resetPasswordToken: String,
    // 重置密码Token有效期
    resetPasswordExpire: Date
})

// 前置钩子，在某个生命周期触发
// 回调函数可通过this访问内容，切记不能使用箭头函数
UserSchema.pre('save',
    // 创建新用户的时候密码加密
    async function (next) {
        const salt = await bcrypt.genSalt(10);   // 加密规则
        this.password = await bcrypt.hash(this.password, salt); // 加密赋值
    }
)

/**
 * 内置方法：生成token
 * @returns {*}
 */
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        // token包含数据
        {
            uid: this._id,
            name: this.name,
            email: this.email
        },
        process.env.JWT_SECRET,  // 秘钥
        {
            expiresIn: process.env.JWT_EXPIRE  // 过期时间
        }
    )
}

/**
 * 内置方法：密码匹配
 * @param enteredPassword 输入的密码
 * @returns {Promise<*>}
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password);
}

/**
 * 生成忘记密码Token
 * @returns {Promise<string>}
 */
UserSchema.methods.getResetPasswordToken = async function(){
    // 随机生成一串十六进制数值
    const resetToken = crypto.randomBytes(20).toString("hex");
    // 加密
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    // 设置过期时间
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10分钟过期

    return resetToken;
}

module.exports = mongoose.model("User", UserSchema, "users")
