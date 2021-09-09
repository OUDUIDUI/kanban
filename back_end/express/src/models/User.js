const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    nickname: {
        type: String,  // 类型
        required: [true, "请添加昵称"],  // 必填
    },
    email: {
        type: String,
        unique: true,  // 唯一值
        required: [true, "请填写邮箱"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "请填写正确的邮箱地址",
        ],
    },
    password: {
        type: String,
        required: [true, "请添加密码"],
        minlength: 6,
        select: false,    // 不返回
    },
})

// 生成token
UserSchema.methods.getSignedJwtToken = () => {
    return jwt.sign(
        // token包含数据
        {
            uid: this._id,
            name: this.name,
            email: this.email
        },
        process.env.JWT_SECRET,    // 秘钥
        {
            expiresIn: process.env.JWT_EXPIRE  // 过期时间
        }
    )
}

module.exports = mongoose.model("User", UserSchema)
