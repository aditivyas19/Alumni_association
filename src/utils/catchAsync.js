/**
 * Helper to catch errors in async functions and pass them to the global error handler.
 */
module.exports = (fn) => {
    return (req, req_res, next) => {
        fn(req, req_res, next).catch(next);
    };
};
