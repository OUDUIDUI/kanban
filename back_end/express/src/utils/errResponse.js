class ErrorResponse extends Error{
    /**
     * @param message 错误信息
     * @param statusCode 状态码
     */
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;
