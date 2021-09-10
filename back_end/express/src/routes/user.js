const express = require('express');
const {
    register,
    login,
    getProfile
} = require("../controllers/user")

// 实例化路由
const router = express.Router();

// 路由鉴权
const {protect} = require("../middlewares/auth.js");

// 创建路由
router.post("/register", register);
router.post("/login", login);
router.route('/')
    .get(protect, getProfile)

module.exports = router;
