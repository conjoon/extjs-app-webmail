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
 * Base model for extjs-app-webmail representing a remote mailbox folder
 * The following fields are available:
 *
 * - text (the display text of the folder)
 * - unreadMessages (the number of unread messages in this folder, if any)
 * - totalMessages (the number of total messages in this folder, if any)
 * - type (the type of the folder, any of INBOX, JUNK, TRASH, SENT, DRAFT, FOLDER)
 * - id (the id of the folder)
 */
Ext.define("conjoon.cn_mail.model.mail.folder.MailFolder", {

    extend: "conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel",

    requires: [
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes",
        "conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey"
    ],

    entityName: "MailFolder",

    fields: [{
        name: "name",
        type: "string",
        validators: [{
            type: "presence"
        }],
        mapping: "attributes.name"
    }, {
        name: "unreadMessages",
        type: "int",
        persist: false,
        mapping: "attributes.unreadMessages"
    }, {
        name: "totalMessages",
        type: "int",
        persist: false,
        mapping: "attributes.totalMessages"
    }, {
        name: "folderType",
        type: "string",
        mapping: "attributes.folderType"
    }, {
        name: "data",
        type: "auto",
        mapping: "attributes.data",
        persist: false
    }, {
        name: "mailAccountId",
        type: "cn_core-datafieldcompoundkey",
        mapping: "relationships.MailAccount.data.id",
        persist: false
    }],


    /**
     * @private
     */
    foreignKeyFields: ["mailAccountId", "id"],


    /**
     * @inheritdoc
     *
     * @returns {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey}
     */
    getRepresentingCompoundKeyClass: function () {
        return conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey;
    },


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
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.INBOX,
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.JUNK,
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.TRASH,
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.SENT,
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.FOLDER,
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.DRAFT
            ]
        }]);

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
            prefix = "cn_mail/folder/";

        return prefix +
               me.get("mailAccountId") +
               "/" +
               me.get("id").replace("/", "%2F");
    }

});
