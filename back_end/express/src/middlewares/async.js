/**
 * 异步处理器
 * @param fn
 * @returns {(function(req, res, next): void)|*}
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
