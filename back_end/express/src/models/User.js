const mongoose = require('mongoose');

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
    avatar: {
        type: String,
        default: 'https://cdn.ouduidui.cn/avatar/ouduidui.png', // 默认值
    },
    password: {
        type: String,
        required: [true, "请添加密码"],
        minlength: 6,
        select: false,    // 不返回
    },
})

module.exports = mongoose.model("User", UserSchema)
