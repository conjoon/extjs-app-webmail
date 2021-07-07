/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Entity for representing mailbox operations, providing information about the
 * request, and, if finished, the result.
 *
 */
Ext.define("conjoon.cn_mail.data.mail.service.mailbox.Operation", {


    statics: {
        /**
         * @type {Number} MOVE_OR_DELETE
         */
        MOVE_OR_DELETE: 1,

        /**
         * @type {Number} DELETE
         */
        DELETE: 2,

        /**
         * @type {Number} MOVE
         */
        MOVE: 3,

        /**
         * @type {Number} NOOP
         */
        NOOP: 4,

        /**
         * @type {Number} CANCELED
         */
        CANCELED: 5,

        /**
         * @type {Number} INVALID_TARGET
         */
        INVALID_TARGET: 6
    },


    config: {
        /**
         * @cfg {Object} request
         */
        request: undefined,

        /**
         * @cfg {Object} result
         */
        result: undefined
    },


    /**
     * Creates a new instance for this class. "request" property is expected.
     *
     * @param {Object} cfg
     * @param {Object} cfg.request
     * @param {Object} cfg.result
     *
     * @throws if no request-object is specified for the constructor
     */
    constructor: function (cfg) {
        cfg = cfg || {};

        const me = this;

        if (!cfg.request) {
            Ext.raise({
                msg: "'request' must be set",
                request: cfg.request
            });
        }

        me.initConfig(cfg);
    },


    /**
     * Sets the result for this operation.
     *
     * @param {Object} result
     *
     * @throws if result was already set
     */
    applyResult: function (result) {

        const me = this;

        if (me.getResult() !== undefined) {
            Ext.raise({
                msg: "'result' was already set",
                result: me.getResult()
            });
        }

        return result;
    },


    /**
     * Sets the request for this operation.
     *
     * @param {Object} request
     *
     * @throws if request was already set
     */
    applyRequest: function (request) {

        const me = this;

        if (me.getRequest() !== undefined) {
            Ext.raise({
                msg: "'request' was already set",
                request: me.getRequest()
            });
        }

        return request;
    }


});