module.exports = {
    autoCatch
}

function autoCatch(handlers) {
    const wrappedHanlers = {};

    for(const key of Object.keys(handlers)) {
        wrappedHanlers[key] = function(req, res, next) {
            try {
                const result = handlers[key](req, res, next);

                if(result && typeof result.catch === 'function') {
                    return result.catch(next);
                }

                return result;
            } catch(err) {
                next(err);
            }
        }
    }

    return wrappedHanlers;
}