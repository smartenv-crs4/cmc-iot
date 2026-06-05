module.exports.asCallback = function (promise, callback) {
    if (typeof callback === 'function') {
        promise.then(function (result) {
            callback(null, result);
        }).catch(function (err) {
            callback(err);
        });
        return;
    }

    return promise;
};

module.exports.execAsCallback = function (query, callback) {
    return module.exports.asCallback(query.exec(), callback);
};

module.exports.normalizeProjectionOptionsCallback = function (projection, options, callback) {
    if (typeof projection === 'function') {
        return {
            projection: null,
            options: null,
            callback: projection
        };
    }

    if (typeof options === 'function') {
        return {
            projection: projection,
            options: null,
            callback: options
        };
    }

    return {
        projection: projection,
        options: options,
        callback: callback
    };
};

module.exports.normalizeFieldsOptionsCallback = function (fields, options, callback) {
    if (typeof fields === 'function') {
        return {
            fields: null,
            options: null,
            callback: fields
        };
    }

    if (typeof options === 'function') {
        return {
            fields: fields,
            options: null,
            callback: options
        };
    }

    return {
        fields: fields,
        options: options,
        callback: callback
    };
};