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
 * The default viewModel for {@link conjoon.cn_mail.view.mail.inbox.InboxView}.
 * This default implementation is configured to be used with {@link conjoon.cn_mail.view.mail.inbox.InboxView},
 * which binds the stores "cn_mail-mailfolderstore" and
 * "cn_mail-mailmessageitemstore" to its MailFolderTree and MessageGrid.
 * Additionally, the filter of the "cn_mail-mailmessageitemstore" is bound to the
 * id of the selection in the MailFolderTree.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.inbox.InboxViewModel', {

    extend : 'Ext.app.ViewModel',

    requires : [
        'conjoon.cn_mail.store.mail.message.MessageItemStore',
        'conjoon.cn_mail.store.mail.folder.MailFolderTreeStore'
    ],

    alias : 'viewmodel.cn_mail-mailinboxviewmodel',

    stores : {
        'cn_mail-mailfoldertreestore' : {
            type     : 'cn_mail-mailfoldertreestore',
            autoLoad : true
        },
        'cn_mail-mailmessageitemstore' : {
            type     : 'cn_mail-mailmessageitemstore',
            autoLoad : true,
            filters  : [{
                property : 'mailFolderId',
                value    : '{cn_mail_ref_mailfoldertree.selection.id}'
            }]
        }
    },

    formulas : {

        /**
         * Returns true if the currently selected MessageItem in the store of the
         * MessageGrid is laoded from a Draft folder.
         *
         * @param get
         *
         * @returns {boolean}
         */
        isDraftLoaded : function(get) {
            const me           = this,
                  view         = me.getView(),
                  store        = view.down('cn_mail-mailfoldertree').getStore(),
                  mailFolderId = get('cn_mail_ref_mailmessagegrid.selection.mailFolderId');


            let ind = store.findExact('id', mailFolderId);

            if (ind === -1) {
                return false;
            }

            return store.getAt(ind).get('type') === 'DRAFT';
        }

    },

    /**
     * Updates the unreadCount of the aasociated {@link conjoon.cn_mail.model.mail.folder.MailFolder}
     * found under the given mailFolderId by the number specified in unreadCount.
     * A positive value will increase the unread count, a negative value
     * decrease it.
     *
     * @param {String} mailFolderId
     * @param {Number} unreadCount
     */
    updateUnreadMessageCount : function(mailFolderId, unreadCount) {

        var me    = this,
            store = me.getStore('cn_mail-mailfoldertreestore'),
            folder;

        folder = store.findExact('id', mailFolderId);

        if (folder === -1) {
            return;
        }

        folder = store.getAt(folder);

        folder.set('unreadCount', folder.get('unreadCount') + unreadCount);
    }


});