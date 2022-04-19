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
 * The default viewModel for {@link conjoon.cn_mail.view.mail.inbox.InboxView}.
 * This default implementation is configured to be used with {@link conjoon.cn_mail.view.mail.inbox.InboxView},
 * which binds the stores "cn_mail_mailfolderstore" and
 * "cn_mail_mailmessageitemstore" to its MailFolderTree and MessageGrid.
 * Additionally, the filter of the "cn_mail_mailmessageitemstore" is bound to the
 * id of the selection in the MailFolderTree.
 *
 */
Ext.define("conjoon.cn_mail.view.mail.inbox.InboxViewModel", {

    extend: "Ext.app.ViewModel",

    requires: [
        "conjoon.cn_mail.store.mail.message.MessageItemStore"
    ],

    alias: "viewmodel.cn_mail-mailinboxviewmodel",

    stores: {
        "cn_mail_mailmessageitemstore": {
            type: "cn_mail-mailmessageitemstore",
            autoLoad: true,
            listeners: {
                /**
                 * Makes sure we prevent loading of the store if any of the filter is
                 * disabled, which is the case if any of the MailAccount nodes in the
                 * MailFolderTree gets selected
                 */
                beforeload: function (store) {
                    let filters = store.getFilters();

                    for (let i = 0, len = filters.length; i < len; i++) {
                        if (filters.getAt(i).getDisabled() === true) {
                            return false;
                        }
                    }

                }
            },
            filters: [{
                disabled: "{cn_mail_ref_mailfoldertree.selection.folderType === \"ACCOUNT\"}",
                property: "mailFolderId",
                value: "{cn_mail_ref_mailfoldertree.selection.id}"
            }, {
                disabled: "{cn_mail_ref_mailfoldertree.selection.folderType === \"ACCOUNT\"}",
                property: "mailAccountId",
                value: "{cn_mail_ref_mailfoldertree.selection.mailAccountId}"
            }]
        }
    },

    data: {
        /**
         * Controls visibility of the MessageView.
         * True to hide the view and expand the MessageGrid.
         */
        messageViewHidden: false
    },

    formulas: {

        /**
         * Computes the margin of the MessageGrid-Container to make sure its shadow
         * is given the space it needs
         *
         * @param get
         * @returns {string}
         */
        computeMessageGridMargin: function (get) {

            const me          = this,
                folderType  = get("cn_mail_ref_mailfoldertree.selection.folderType"),
                readingPane = me.getView().down("cn_mail-mailmessagereadermessageview"),
                orientation = readingPane.splitter.orientation;

            let margin = folderType === "ACCOUNT"
                ? "0 0 0 0"
                : get("messageViewHidden")
                    ? "0 5 5 0"
                    : orientation === "vertical" ? "0 0 5 0" : "0 5 0 0";

            return margin;
        }

    },

    /**
     * Updates the unreadCount of the associated {@link conjoon.cn_mail.model.mail.folder.MailFolder}
     * found under the given mailFolderId and the given mailAccountId by the number
     * specified in unreadCount.
     * A positive value will increase the unread count, a negative value
     * decrease it.
     *
     * @param {String} mailFolderId
     * @param {Number} unreadCount
     */
    updateUnreadMessageCount: function (mailAccountId, mailFolderId, unreadCount) {

        var me    = this,
            store = me.get("cn_mail_mailfoldertreestore"),
            folder;

        folder = store.getRoot().findChild("id", mailAccountId, false);

        if (!folder) {
            return;
        }
        folder = folder.findChild("id", mailFolderId, true);

        if (!folder) {
            return;
        }
        folder.set("unreadCount", folder.get("unreadCount") + unreadCount);
    }


});
