# ExpressJS 实现TodoList接口

## 运行

### 安装依赖

```shell
yarn
```

### 配置环境变量

在`src`路径下创建`config.env`。

```dotenv
PORT=端口号
NET_MONGO_URL=MongoDB链接

JWT_SECRET=Token秘钥
JWT_EXPIRE=Token有效期
JWT_COOKIE_EXPIRE=Cookie有效期

SMTP_EMAIL=邮箱地址
SMTP_PASSWORD=邮箱授权码
FROM_NAME=发送人
```

### 开启服务

```shell
yarn server
```
