var buildTags = function(links) {
    var tags = "";
    for (var i in links) {
        var link = links[i];
        var platform = link.platform;
        // delete link.platform;
        tags += '\n<meta property="al:' + platform + '">\n';
        var keys = Object.keys(link);
        for (var j in keys) {
            var key = keys[j];
            if (key !== "platform") {
                tags += '<meta property="al:' + platform + ":" + key + '" content="' + link[key] + '">\n';
            }
        }
        return tags;
    }
};

var injectMetaOptions = function(str, options) {
    return str.replace(/<head>((?:.|\n|\r)+?)<\/head>/i, "<head>$1" + buildTags(options)+"</head>");
};

var _ = require("underscore");

module.exports = function(platforms) {
    return function(req, res, next) {
        if (_.isFunction(platforms)) {
            platforms = platforms(req, res);
        }
        if (!_.isArray(platforms)) {
            platforms = [ platforms ];
        }
        var htmlMetaHeaders = req.headers["prefer-html-meta-tags"] || "";
        var preferAppLinks = _.some(htmlMetaHeaders.split(","), function(value) {
            return value.trim() === "al";
        });
        if (preferAppLinks) {
            // Always returns html
            res.set("Content-Type", "text/html");
        }
        // Only modify the render function once in case app links
        // is defined multiple times
        if (!res._appLinks) {
            var render = res.render;
            res.render = function(view, options, finishCallback) {
                options = options || {};
                // Support callback function as second arg
                if (_.isFunction(options)) {
                    finishCallback = options, options = {};
                }
                var self = this;
                var defaultCallback = function(err, str) {
                    if (err) {
                        return req.next(err);
                    }
                    self.send(str);
                };
                if (!_.isFunction(finishCallback)) {
                    finishCallback = defaultCallback;
                }
                if (res._appLinks.preferAppLinks) {
                    // If we prefer App Links, let's render simple HTML
                    str = "<html><head></head><body></body><html>";
                    str = injectMetaOptions(str, res._appLinks.meta);
                    res.send(str);
                } else {
                    render.call(res, view, options, function(err, str) {
                        str = injectMetaOptions(str, res._appLinks.meta);
                        // remove _appLinks object from response
                        delete res._appLinks;
                        finishCallback(err, str);
                    });
                }
            };
        }
        // Inject app links meta to response object
        res._appLinks = res._appLinks || {};
        res._appLinks.meta = res._appLinks.meta || [];
        // Render more specific meta tag first
        res._appLinks.meta = platforms.concat(res._appLinks.meta);
        res._appLinks.preferAppLinks = preferAppLinks;
        next();
    };
};