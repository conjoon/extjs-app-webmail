/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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
 * This is the view controller for {@link conjoon.cn_mail.view.mail.inbox.InboxView}.
 * It mainly provides and delegates event handling between the embedded views.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.inbox.InboxViewController', {

    extend : 'Ext.app.ViewController',

    alias : 'controller.cn_mail-mailinboxviewcontroller',

    control : {
        'cn_mail-mailmessagereadermessageview' : {
            'cn_mail-mailmessageitemread' : 'onMessageItemRead'
        }
    },

    /**
     *  Callback for any {@link conjoon.cn_mail.view.mail.message.reader.MessageView}
     *  embedded in this controller's view. Makes sure the associated folder
     *  get notified of the message items and their current isRead state by calling
     *  {@link conjoon.cn_mail.view.mail.inbox.InboxViewModel#updateUnreadMessageCount}.
     *  The updateUnreadMessageCount will only be called if the computed number
     *  of read/unread messages is anything but 0.
     *
     * @param {Array|conjoon.cn_mail.model.mail.message.reader.MessageItem} messageItemRecords
     *
     * @see {conjoon.cn_mail.view.mail.inbox.InboxViewModel#updateUnreadMessageCount}
     */
    onMessageItemRead : function(messageItemRecords) {

        var me          = this,
            view        = me.getView(),
            mailFolders = {},
            tmpId,
            rec,
            isRead;

        for (var i = 0, len = messageItemRecords.length; i <len; i++) {
            rec    = messageItemRecords[i];
            tmpId  = rec.get('mailFolderId');
            isRead = rec.get('isRead');

            if (!mailFolders[tmpId]) {
                mailFolders[tmpId] = 0;
            }

            mailFolders[tmpId] += isRead ? -1 : 1;
        }

        for (var mailFolderId in mailFolders) {
            if (!mailFolders.hasOwnProperty(mailFolderId)) {
                continue;
            }

            if (mailFolders[mailFolderId] == 0) {
                continue;
            }

            view.getViewModel().updateUnreadMessageCount(
                mailFolderId, mailFolders[mailFolderId]
            )
        }


    }

});
