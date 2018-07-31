/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Entity for representing mailbox operations, providing information about the
 * request, and, if finished, the result.
 *
 */
Ext.define("conjoon.cn_mail.data.mail.service.mailbox.Operation", {


    statics : {
        /**
         * @type {Number} MOVE_OR_DELETE
         */
        MOVE_OR_DELETE : 1,

        /**
         * @type {Number} DELETE
         */
        DELETE : 2,

        /**
         * @type {Number} MOVE
         */
        MOVE : 3,

        /**
         * @type {Number} NOOP
         */
        NOOP : 4,

        /**
         * @type {Number} CANCELED
         */
        CANCELED : 5
    },


    config : {
        /**
         * @cfg {Object} request
         */
        request : undefined,

        /**
         * @cfg {Object} result
         */
        result : undefined
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
    constructor : function(cfg) {
        cfg = cfg || {};

        const me = this;

        if (!cfg.request) {
            Ext.raise({
                msg     : "'request' must be set",
                request : cfg.request
            })
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
    applyResult : function(result) {

        const me = this;

        if (me.getResult() !== undefined) {
            Ext.raise({
                msg    : "'result' was already set",
                result : me.getResult()
            })
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
    applyRequest : function(request) {

        const me = this;

        if (me.getRequest() !== undefined) {
            Ext.raise({
                msg    : "'request' was already set",
                request : me.getRequest()
            })
        }

        return request;
    },



});