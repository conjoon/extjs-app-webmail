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
 * This is the view controller for {@link conjoon.cn_mail.view.mail.inbox.InboxView}.
 * It mainly provides and delegates event handling between the embedded views.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.inbox.InboxViewController', {

    extend : 'Ext.app.ViewController',

    alias : 'controller.cn_mail-mailinboxviewcontroller',

    requires : [
        'conjoon.cn_mail.data.mail.service.MailboxService'
    ],

    control : {
        'cn_mail-mailmessagereadermessageview' : {
            'cn_mail-mailmessageitemread' : 'onMessageItemRead'
        },

        'cn_mail-mailfoldertree' : {
            'select' : 'onMailFolderTreeSelect'
        },

        'cn_mail-mailmessagegrid' : {
            'cn_comp-rowflymenu-itemclick'      : 'onRowFlyMenuItemClick',
            'cn_comp-rowflymenu-beforemenushow' : 'onRowFlyMenuBeforeShow'
        },
    },

    /**
     * @private
     */
    mailboxService : null,

    /**
     * Delegates to the mailmessagegrid's #updateRowFlyMenu method.
     *
     * @param {conjoon.cn_comp.grid.feature.RowFlyMenu} feature
     * @param {HtmlElement} row
     * @para, {Ext.data.Model} record
     *
     * @see conjoon.cn_mail.view.mail.message.MessageGrid#updateRowFlyMenu
     */
    onRowFlyMenuBeforeShow : function(feature, row, record) {

        const me = this;

        me.view.down('cn_mail-mailmessagegrid').updateRowFlyMenu(record);
    },


    /**
     * Callback for the RowFlyMenu's itemclick event. Checks for the action
     * specified and invokes appropriate measures.
     * Valid actions are:
     *  - markunread: Marks the record as either read or unread, depending
     *    on it's state.
     *
     * @param {conjoon.cn_comp.grid.feature.RowFlyMenu} feature
     * @param {HtmlElement} item
     * @param {Strng} action
     * @param {Ext.data.Model} record
     */
    onRowFlyMenuItemClick : function(feature, item, action, record) {

        const me = this;

        switch (action) {
            case 'markunread':
                record.set('isRead', !record.get('isRead'));
                record.save({
                    callback : me.onMessageItemRead,
                    scope    : me
                });
                break;
            case 'delete':
                me.getMailboxService().moveToTrashOrDeleteMessage(record);
                // must update read items!
                // must update message views!
                // must removed opened tabs (editors, views)
                break;
        }

    },


    /**
     *  Makes sure the folders associated with the specified MessageItems get
     *  notified of their current isRead state by calling
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

        messageItemRecords = [].concat(messageItemRecords);

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


    },


    /**
     * Callback for the select event of the MailFolderTree.
     * Calls #redirectTo for the selected MailFolder.
     *
     * @param {Ext.selection.Model } selModel
     * @param [Ext.data.TreeModel} node
     */
    onMailFolderTreeSelect : function(selModel, node) {

        const me = this;

        me.redirectTo(node);
    },


    /**
     * Returns the MailboxService used with ths class.
     *
     * @return {conjoon.cn_mail.data.mail.service.MailboxService}
     */
    getMailboxService : function() {
        const me = this;

        if (!me.mailboxService) {
            me.mailboxService = Ext.create('conjoon.cn_mail.data.mail.service.MailboxService', {
                mailFolderHelper : Ext.create('conjoon.cn_mail.data.mail.service.MailFolderHelper', {
                    store : me.getView().down('cn_mail-mailfoldertree').getStore()
                })
            });
        }

        return me.mailboxService;
    }

});
