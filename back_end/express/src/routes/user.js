const express = require('express');
const {
    register,
    login
} = require("../controllers/user")

// 实例化路由
const router = express.Router();

// 创建路由
router.post("/register",register);
router.post("/login",login);

module.exports = router;
