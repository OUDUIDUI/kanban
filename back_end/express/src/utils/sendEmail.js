// https://nodemailer.com/
const nodemailer = require("nodemailer");

/**
 * 发送邮箱
 * @param option
 * @returns {Promise<void>}
 */
const sendEmail = async ({email, subject, text, html}) => {
    let transporter = nodemailer.createTransport({
        service: 'qq',
        auth: {
            user: process.env.SMTP_EMAIL, // 邮箱
            pass: process.env.SMTP_PASSWORD, // 授权码
        },
    });

    // 发送邮箱
    await transporter.sendMail({
        from: `${process.env.FROM_NAME}<${process.env.SMTP_EMAIL}>`, // 发送人
        to: email, // 收件邮箱
        subject, // 邮件主题
        text, // 文本内容
        html  // 支持html
    });
}

module.exports = sendEmail;
