/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Specialized version of a JSON Reader used by MessageEntityProxy.
 */
Ext.define("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader", {

    extend: "Ext.data.reader.Json",

    requires: [
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey"
    ],

    alias: "reader.cn_mail-mailmessageentityjsonreader",

    rootProperty: "data",


    /**
     * Overrides parent implementation by injecting a "cn_action" property into
     * the metaData section of the parsed response. The metaData-section will be created
     * if it does not already exist.
     *
     * @param {Object} response
     *
     * @retrurn {Object}
     */
    getResponseData: function (response) {

        const me     = this,
            action = response.request.action,
            result = me.callParent(arguments);

        if (!result.metaData) {
            result.metaData = {};
        }

        result.metaData.cn_action = action;

        return result;
    },


    /**
     * @inheritdoc
     *
     * @return {Object}
     *
     * @throws if data is is not an object, or if the embedded property "data" is
     * neither an array nor an object
     *
     * @see applyCompoundKey
     */
    readRecords: function (data, readOptions, internalReadOptions) {

        const me     = this,
            action = data && data.metaData ? data.metaData.cn_action : "";

        if (action !== "destroy") {
            data = me.applyCompoundKey(data, action);
        }

        return me.callParent([data, readOptions, internalReadOptions]);
    },


    /**
     * Computes the localId which is treated as the primary key for MessageItems
     * by utilizing conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
     *
     * @param {Object} data
     * @param {String} action The type of action of the request that lead to the response
     *
     * @return {Boolean|Object}
     *
     * @throws if action is not set to "read", "destroy", "update" or "create"
     */
    applyCompoundKey: function (data, action) {

        const
            me = this,
            MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey,
            valChk                   = ["create", "update", "read", "destroy"];

        if (valChk.indexOf(action) === -1) {
            let exp = valChk.join(", ");
            // "unexpected value for \"action\", expected any of \"" + valChk.join(", ") + "\", "+  ")
            Ext.raise(`unexpected value for "action", expected any of "${exp}", but got "${action}"`);
        }


        if (Ext.isObject(data)) {

            let keys = me.extractRelationships(data);

            if (Ext.isArray(data.data)) {

                let records = data.data, i, len = records.length, rec;

                for (i = 0; i < len; i++) {
                    rec = Object.assign(records[i], {
                        mailAccountId: keys.mailAccountId,
                        mailFolderId: keys.mailFolderId
                    });
                    rec.localId = MessageEntityCompoundKey.createFor(
                        rec.mailAccountId, rec.mailFolderId, rec.id
                    ).toLocalId();
                }

                return data;

            } else if (Ext.isObject(data.data)) {
                // POST / PUT
                let d = data.data;
                data.data = Object.assign(d, {
                    mailAccountId: keys.mailAccountId,
                    mailFolderId: keys.mailFolderId,
                    localId: MessageEntityCompoundKey.createFor(
                        keys.mailAccountId, keys.mailFolderId, d.id
                    ).toLocalId()
                });

                return data;
            }
        }

        Ext.raise({
            msg: "The \"data\" property was malformed and could not be processed by this Reader",
            data: data
        });

    },


    /**
     * Returns the keys for the retaionships available with the data response object.
     *
     * @returns {{mailFolderId, mailAccountId}}
     */
    extractRelationships (data) {
        "use strict";

        let mailFolderId, mailAccountId;

        try {
            mailFolderId = data.included[0].id;
        } catch (e) {
            Ext.raise("malformed data: missing \"MailFolder\" in \"included\" property");
        }

        if (data.included[0].type !== "MailFolder") {
            Ext.raise("malformed data: missing \"MailFolder\" in \"included\" property");
        }

        try {
            mailAccountId = data.included[0].relationships.MailAccount.data.id;
        } catch (e) {
            Ext.raise("malformed data: missing \"MailAccount\" relationship");
        }


        return {
            mailAccountId: mailAccountId,
            mailFolderId: mailFolderId
        };

    }

});
