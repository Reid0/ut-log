(function(define) {define(function(require) {

    /**
     * @module ut-log
     * @author UT Route Team
     * @description Logging module
     */
    // helper methods
    var lib = {
        capitalize: function(str){
            return (str && str[0].toUpperCase() + str.slice(1)) || 'unknown';
        },
        transformData : (function() {
            var chunkLength = 32;
            var maxLength = 1024;
            function bufToHex(buf) {
                return buf.toString('hex').toUpperCase();
            }
            function bufToAscii(buf) {
                for (var i = 0, n = buf.length; i < n; i += 1) {
                    if (buf[i] < 32 || buf[i] > 127) {
                        buf[i] = 32;
                    }
                }
                var str = buf.toString('ascii');
                return (str.length < chunkLength) ? (str + new Array(chunkLength - str.length + 1).join(' ')) : str;
            }
            return function transformData(data) {
                var _1; var _2; var _3; var buf;
                if (data && (_1 = data[0]) && (_2 = _1.message) && (_3 = _2.$$) && (buf = _3.frame) && (buf.constructor.name === 'Buffer')) {
                    var bufArr = [];
                    var size = (buf.length > maxLength) ? maxLength : buf.length;
                    var bufCopy = new Buffer(size);
                    buf.copy(bufCopy, 0, 0, size);
                    for (var i = 0, n = (bufCopy.length < maxLength) ? bufCopy.length : maxLength; i < n; i += chunkLength) {
                        var hex = bufToHex(bufCopy.slice(i, i + chunkLength));
                        bufArr.push(bufToAscii(bufCopy.slice(i, i + chunkLength)) + ' | ' + hex);
                    }
                    _3.frame = bufArr;
                }
            }
        })()
    };
    /**
     * @class Logger
     *
     * @tutorial wire
     * @tutorial bunyan
     * @tutorial winston
     *
     * @param {object} options logger options.
     *
     * @param {string} [options.type=winston]  The type of the logger - currently supported are 'winston' and 'bunyan'
     *
     * @param {string} [options.name=type_default_name]  The name of the logger
     *
     * @param {array} options.dependencies <b style="color: red">WINSTON ONLY!</b>
     * An array of strings representing the names of the modules that Winston depends on
     *
     * @param {object} options.transports  <b style="color: red">WINSTON ONLY!</b> An object of Winston transports.
     * For more info: [Winston transports]{@link https://github.com/flatiron/winston/blob/master/docs/transports.md}
     *
     * @param {array} options.streams <b style="color: red">BUNYAN ONLY!</b> An array of Bunyan streams
     * For more info: [Bunyan streams]{@link https://github.com/trentm/node-bunyan#user-content-streams}
     **/
    function Logger(options) {
        options.lib = lib;
        this.init(require('./modules/' + (options.type || 'winston'))(options));
    }

    Logger.prototype.init = function LoggerInit(logger) {
        this.logger = logger;
    };

    Logger.prototype.createLog = function createLog(level, params) {
        var levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
        var log = this.logger ? this.logger(params) : null;
        if (!log) {return {}}
        return levels
                .slice(levels.indexOf(level), levels.length)
                .reduce(function(levels, level) {
                    levels[level] = log[level].bind(log);
                    return levels;
                }, {});
    };

    return Logger;

});})(typeof define === 'function' && define.amd ?  define : function(factory) { module.exports = factory(require); });
