const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./utils/db.js');
const errorHandler = require('./utils/errResponse');

dotenv.config({
    path: "src/config.env"  // 相对项目路径
})

// 连接数据库
connectDB();

// 创建实例
const app = express();

// error中间件 一定要写在挂载路由节点之后
// http://expressjs.com/en/guide/error-handling.html#writing-error-handlers
app.use(errorHandler)

// 配置body解析
app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({success: true, msg: "HelloWorld"});
})

// 监听接口
const PORT = process.env.PORT || 3000;
app.listen(PORT,
    () => console.log(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`)
);
