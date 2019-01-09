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
        'cn_mail-mailmessageitemstore' : {
            type     : 'cn_mail-mailmessageitemstore',
            autoLoad : true,
            filters  : [{
                property : 'mailFolderId',
                value    : '{cn_mail_ref_mailfoldertree.selection.id}'
            }, {
                property : 'mailAccountId',
                value    : '{cn_mail_ref_mailfoldertree.selection.mailAccountId}'
            }]
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
    updateUnreadMessageCount : function(mailAccountId, mailFolderId, unreadCount) {

        var me    = this,
            store = me.get('cn_mail-mailfoldertreestore'),
            folder;

        folder = store.findExact('mailAccountId', mailAccountId);

        if (folder === -1) {
            return;
        }
        folder = store.getAt(folder);
        folder = folder.findChild("id", mailFolderId, true);

        if (!folder) {
            return;
        }
        folder.set('unreadCount', folder.get('unreadCount') + unreadCount);
    }


});