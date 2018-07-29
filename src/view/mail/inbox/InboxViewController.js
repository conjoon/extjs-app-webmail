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
        'conjoon.cn_mail.data.mail.service.MailboxService',
        'conjoon.cn_mail.data.mail.service.mailbox.Operation',
        'conjoon.cn_mail.data.mail.service.MailFolderHelper'
    ],

    control : {
        'cn_mail-mailmessagereadermessageview' : {
            'cn_mail-mailmessageitemread' : 'onMessageItemRead'
        },

        'cn_mail-mailmessagereadermessageview toolbar #btn-deletedraft' : {
            'click' : 'onDeleteClick'
        },

        'cn_mail-mailmessagereadermessageview toolbar #btn-delete' : {
            'click' : 'onDeleteClick'
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
     * Will not show the menu if the record is currently marked as cn_deleted
     * or cn_moved by returning false.
     *
     * @param {conjoon.cn_comp.grid.feature.RowFlyMenu} feature
     * @param {HtmlElement} row
     * @para, {Ext.data.Model} record
     *
     * @see conjoon.cn_mail.view.mail.message.MessageGrid#updateRowFlyMenu
     */
    onRowFlyMenuBeforeShow : function(feature, row, record) {

        const me = this;

        if (record.get('cn_deleted') || record.get('cn_moved')) {
            return false;
        }

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
                me.moveOrDeleteMessage(record);
                break;
        }

    },


    /**
     * Callback for InboxView's embedded buttons/controls that request to
     * delete a MessageItem.
     *
     * @param {Ext.Button/Ext.menu.Item} btn
     *
     * @see moveOrDeleteMessage
     */
    onDeleteClick : function(btn) {

        const me          = this;
              messageView = me.getMessageView(),
              messageItem = messageView.getViewModel().get('messageItem');
              
        me.moveOrDeleteMessage(messageItem);
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
    },


    /**
     * Moves or deletes the specified messageItem. Delegates to
     * #mailboxService.moveToTrashOrDeleteMessage.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * created by the MailboxService for the requested action.
     *
     * @see onBeforeMessageMoveOrDelete
     * @see onMessageMovedOrDeleted
     * @see onMessageMovedOrDeletedFailure
     */
    moveOrDeleteMessage : function(messageItem) {

        const me   = this;

        return me.getMailboxService().moveToTrashOrDeleteMessage(messageItem, {
            before  : me.onBeforeMessageMoveOrDelete,
            success : me.onMessageMovedOrDeleted,
            failure : me.onMessageMovedOrDeletedFailure,
            scope   : me
        });
        // must update read items!
        // must update message views!
        // must removed opened tabs (editors, views)

    },


    /**
     * Gets called before the MailboxService removes or deletes a MessageItem.
     * Sets the record's cn_deleted or cn_moved field to true depending
     * on the type of the operation.
     * Deselects the mesageItem if it was part of the selection and hides the
     * RowFlyMenu currently shown.
     * Will also unjoin the record from it's store to prevent issues with
     * BufferedStore and remove-operations (looking up child-associations and
     * trying to delete them etc.)
     *
     * @param {conjoon.cn_mail.data.mail.service.mailbox.Operation} operation
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation}
     */
    onBeforeMessageMoveOrDelete : function(operation) {

        const me          = this,
              messageItem = operation.getRequest().record,
              type        = operation.getRequest().type,
              Operation   = conjoon.cn_mail.data.mail.service.mailbox.Operation,
              messageGrid = me.getView().down('cn_mail-mailmessagegrid');

        let field;

        switch (type) {
            case Operation.MOVE:
                field = "cn_moved";
                break;

            case Operation.DELETE:
                field = "cn_deleted";
                break;
            default:
                Ext.raise({
                    msg  : "Unexpected operation type for before-callback",
                    type : type
                });
                break;
        }

        // set the field property
        messageItem.set(field, true);
        messageItem.commit();

        // this is needed since messageGrid has a BufferedStore.
        // not unjoining beforehand means the default impl. tries to look
        // up and call getAssociatedEntitity on the BufferedStore. This
        // method does not exist.
        messageItem.unjoin(messageItem.store);

        // deselect messageItem
        messageGrid.getSelectionModel().deselect(messageItem);

        // hide RowFylMenu
        me.getRowFlyMenu().detachMenuAndUnset();

        return operation;
    },


    /**
     * Gets called when the MailboxService fails to remove or move a messageItems
     *
     * @param {conjoon.cn_mail.data.mail.service.mailbox.Operation} operation
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation}
     */
    onMessageMovedOrDeletedFailure : function(operation) {

        const me          = this,
              messageItem = operation.getRequest().record,
              type        = operation.getRequest().type,
              Operation   = conjoon.cn_mail.data.mail.service.mailbox.Operation,
              messageGrid = me.getView().down('cn_mail-mailmessagegrid');

        let field;

        switch (type) {
            case Operation.MOVE:
                field = "cn_moved";
                break;

            case Operation.DELETE:
                field = "cn_deleted";
                break;
            default:
                Ext.raise({
                    msg  : "Unexpected operation type for failure-callback",
                    type : type
                });
                break;
        }

        messageItem.reject();

        // unjoined in before, join again.
        messageItem.join(messageGrid.getStore());

        // set the field property
        messageItem.set(field, false);
        messageItem.commit();

        return operation;
    },


    /**
     * Callback for successfull move/delete operation. Moves the record out of
     * the currently shown MessageGrid if applicable, or adds it to the MessageGrid,
     * depending on the MailFolder currentls selected and the operation's type.
     * Also removes any cn_deleted/cn_moved flag.
     *
     * @param {conjoon.cn_mail.data.mail.service.mailbox.Operation} operation
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation}
     */
    onMessageMovedOrDeleted : function(operation) {

        const me          = this,
              view        = me.getView(),
              messageItem = operation.getRequest().record,
              request     = operation.getRequest(),
              type        = operation.getRequest().type,
              Operation   = conjoon.cn_mail.data.mail.service.mailbox.Operation,
              messageGrid = me.getView().down('cn_mail-mailmessagegrid');

        let field;

        switch (type) {
            case Operation.MOVE:
                field = "cn_moved";
                break;

            case Operation.DELETE:
                field = "cn_deleted";
                break;
            default:
                Ext.raise({
                    msg  : "Unexpected operation type for failure-callback",
                    type : type
                });
                break;
        }

        messageItem.set(field, false);
        messageItem.commit();

        let selectedFolder      = me.getSelectedMailFolder(),
            targetFolderId      = type === Operation.MOVE
                                  ? request.targetFolderId
                                  : messageItem.get('mailFolderId'),
            isNotTargetSelected = targetFolderId && selectedFolder &&
                                  selectedFolder.getId() !== targetFolderId,
            isTargetSelected    = targetFolderId && selectedFolder &&
                                  selectedFolder.getId() === targetFolderId;

        switch (type) {
            case (Operation.MOVE):

                messageItem.join(messageGrid.getStore());

                if (isNotTargetSelected) {
                    me.getLivegrid().remove(messageItem);
                } else if (isTargetSelected) {
                    me.getLivegrid().add(messageItem);
                }
                break;

            case (Operation.DELETE):
                if (isTargetSelected) {
                    me.getLivegrid().remove(messageItem);
                }
                break;

        }

        return operation;
    },


    /**
     * @private
     */
    getMessageView : function() {
        return this.getView().down('cn_mail-mailmessagereadermessageview');
    },


    /**
     * @private
     */
    getLivegrid : function() {
        return this.getView().down('cn_mail-mailmessagegrid').view
            .getFeature('cn_mail-mailMessageFeature-livegrid');
    },


    /**
     * @private
     */
    getRowFlyMenu : function() {
        return this.getView().down('cn_mail-mailmessagegrid').view
                   .getFeature('cn_mail-mailMessageFeature-rowFlyMenu');
    },


    /**
     * @private
     */
    getSelectedMailFolder : function() {
        let sel = this.getView().down('cn_mail-mailfoldertree').getSelection();

        if (sel && sel.length) {
            return sel[0];
        }

        return null;
    }


});
