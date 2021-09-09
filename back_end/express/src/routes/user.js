const express = require('express');
const {
    register
} = require("../controllers/user")

// 实例化路由
const router = express.Router();

// 创建路由
router.post("/register",register);

module.exports = router;
