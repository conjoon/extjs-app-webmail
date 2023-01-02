/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Base model for extjs-app-webmail representing a MailAccount.
 */
Ext.define("conjoon.cn_mail.model.mail.account.MailAccount", {

    extend: "conjoon.cn_mail.model.mail.BaseTreeModel",

    entityName: "MailAccount",

    idProperty: "id",

    requires: [
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes",
        "coon.core.data.field.EmailAddress"
    ],

    statics: {
        createFrom: data => Ext.create(
            "conjoon.cn_mail.model.mail.account.MailAccount",
            Object.assign(data || {}, {folderType: conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT})
        )
    },


    fields: [{
        name: "name",
        type: "string",
        validators: [{
            type: "presence"
        }]
    }, {
        name: "folderType",
        type: "string"
    }, {
        name: "from",
        type: "cn_core-datafieldemailaddress"
    }, {
        name: "replyTo",
        type: "cn_core-datafieldemailaddress"
    },

    // INBOX CONFIGURATION
    {
        name: "inbox_type",
        type: "string"
    }, {
        name: "inbox_address",
        type: "string"
    }, {
        name: "inbox_port",
        type: "int"
    }, {
        name: "inbox_user",
        type: "string"
    }, {
        name: "inbox_password",
        type: "string"
    }, {
        name: "inbox_ssl",
        type: "boolean"
    },
    // OUTBOX CONFIGURATION
    {
        name: "outbox_address",
        type: "string"
    }, {
        name: "outbox_port",
        type: "int"
    }, {
        name: "outbox_user",
        type: "string"
    }, {
        name: "outbox_password",
        type: "string"
    }, {
        name: "outbox_secure",
        type: "string"
    }, {
        name: "active",
        type: "bool",
        defaultValue: true
    }, {
        name: "subscriptions",
        type: "array"
    }],

    /**
     * Overriden to make sure we can specify class statics for values of
     * field validation for "folderType".
     *
     * @inheritdoc
     */
    constructor: function () {
        const me = this;

        me.callParent(arguments);

        me.getField("folderType").setModelValidators([{
            type: "inclusion",
            list: [
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT
            ]
        }]);
    },


    /**
     * Returns an array where the 0th index is the inbox-user and the 1st is the
     * inbox password.
     *
     * @returns {Array}
     */
    getInboxAuth () {
        const me = this;

        return [me.get("inbox_user"), me.get("inbox_password")];
    },


    /**
     * Returns an array where the 0th index is the outbox-user and the 1st is the
     * outbox password.
     *
     * @returns {Array}
     */
    getOutboxAuth (mailAccount) {
        const me = this;

        return [me.get("outbox_user"), me.get("outbox_password")];
    },


    /**
     * Returns an object containing connection information of the inbox server.
     *
     * @returns {Object}
     */
    getInboxInfo () {
        const
            me = this,
            fields =  ["inbox_address", "inbox_port", "inbox_ssl"],
            res = {};

        fields.forEach(field => res[field] = me.get(field));

        return res;
    },


    /**
     * Returns an object containing connection information of the outbox server.
     *
     * @returns {Object}
     */
    getOutboxInfo (includeCredentials) {
        const
            me = this,
            fields =  ["outbox_address", "outbox_port", "outbox_secure"],
            res = {};

        if (includeCredentials === true) {
            fields.push("outbox_user");
            fields.push("outbox_password");
        }

        fields.forEach(field => res[field] = me.get(field));

        return res;
    },


    /**
     * Returns general info for this mailbox, such as replyTo, from and subscriptions.
     *
     * @return {Object}
     */
    getGeneralInfo () {
        const
            me = this,
            fields =  ["from", "replyTo", "subscriptions"],
            res = {};

        fields.forEach(field => res[field] = me.get(field));

        return res;
    },


    /**
     * Returns the url represented by an instance of this MailFolder
     * to be used with redirectTo.
     *
     * @returns {string}
     *
     * @throws if no parentNode can be found
     */
    toUrl: function () {
        const me     = this,
            prefix = "cn_mail/account/";

        return prefix + me.get("id");
    }

});
