/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
        'conjoon.cn_mail.data.mail.service.MailFolderHelper',
        'conjoon.cn_mail.data.mail.folder.MailFolderTypes',
        'conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater',
        'conjoon.cn_mail.model.mail.message.MessageDraft'
    ],

    control : {
        'cn_mail-mailmessagereadermessageview' : {
            'cn_mail-mailmessageitemread' : 'onMessageItemRead'
        },

        'cn_mail-mailmessagereadermessageview #btn-deletedraft' : {
            'click' : 'onDeleteClick'
        },

        'cn_mail-mailmessagereadermessageview #btn-delete' : {
            'click' : 'onDeleteClick'
        },

        'cn_mail-mailfoldertree' : {
            'beforeselect' : 'onMailFolderTreeBeforeSelect',
            'select'       : 'onMailFolderTreeSelect'
        },

        'cn_mail-mailmessagegrid' : {
            'cn_comp-rowflymenu-itemclick'      : 'onRowFlyMenuItemClick',
            'cn_comp-rowflymenu-beforemenushow' : 'onRowFlyMenuBeforeShow'
        }
    },

    /**
     * @private
     */
    mailboxService : null,

    /**
     * @private
     */
    messageGrid : null,

    /**
     * @private
     */
    mailFolderTree : null,

    /**
     * Delegates to the mailmessagegrid's #updateRowFlyMenu method.
     * Will not show the menu if the record is currently marked as cn_deleted
     * or cn_moved by returning false.
     *
     * @param {coon.comp.grid.feature.RowFlyMenu} feature
     * @param {HtmlElement} row
     * @param {Ext.data.Model} record
     *
     * @see conjoon.cn_mail.view.mail.message.MessageGrid#updateRowFlyMenu
     */
    onRowFlyMenuBeforeShow : function(feature, row, record) {

        const me = this;

        if (record.get('cn_deleted') || record.get('cn_moved')) {
            return false;
        }

        me.getMessageGrid().updateRowFlyMenu(record);
    },


    /**
     * Callback for the RowFlyMenu's itemclick event. Checks for the action
     * specified and invokes appropriate measures.
     * Valid actions are:
     *  - markunread: Marks the record as either read or unread, depending
     *    on it's state.
     *
     * @param {coon.comp.grid.feature.RowFlyMenu} feature
     * @param {HtmlElement} item
     * @param {Strng} action
     * @param {Ext.data.Model} record
     */
    onRowFlyMenuItemClick : function(feature, item, action, record) {

        const me = this;

        switch (action) {
            case 'markunread':
                record.set('seen', !record.get('seen'));
                record.save({
                    callback : me.onMessageItemRead,
                    scope    : me
                });
                break;
            case 'flag':
                record.set('flagged', !record.get('flagged'));
                record.save();
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
     *  notified of their current seen state by calling
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
            tmpMailAccountId,
            tmpMailFolderId,
            seen;

        messageItemRecords = [].concat(messageItemRecords);

        for (var i = 0, len = messageItemRecords.length; i <len; i++) {
            rec    = messageItemRecords[i];
            tmpMailAccountId = rec.get('mailAccountId');
            tmpMailFolderId  = rec.get('mailFolderId');
            seen = rec.get('seen');

            if (!mailFolders[tmpMailAccountId]) {
                mailFolders[tmpMailAccountId] = {};
            }

            if (!mailFolders[tmpMailAccountId][tmpMailFolderId]) {
                mailFolders[tmpMailAccountId][tmpMailFolderId] = 0;
            }

            mailFolders[tmpMailAccountId][tmpMailFolderId] += seen ? -1 : 1;
        }

        let mfObj = null;
        for (var mailAccountId in mailFolders) {

            mfObj = mailFolders[mailAccountId];

            for (var mailFolderId in mfObj) {

                if (!mfObj.hasOwnProperty(mailFolderId)) {
                    continue;
                }

                if (mfObj[mailFolderId] == 0) {
                    continue;
                }

                view.getViewModel().updateUnreadMessageCount(
                    mailAccountId, mailFolderId, mfObj[mailFolderId]
                )

            }
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
     * Callback for the beforeselect event of the embedded MailFolderTree.
     * Will return false if the embedded cn_mail-mailacountview has
     * pending changes that need user interaction.
     *
     * @param {Ext.selection.Model} selModel
     * @param {Ext.data.TreeModel} node
     *
     * @param {Boolean} true if the event can pass, otherwise false
     */
    onMailFolderTreeBeforeSelect : function(selModel, node) {

        const me              = this,
              view            = me.getView(),
              mailAccountView = view.down('cn_mail-mailaccountview');

        if (mailAccountView.hasPendingChanges()) {

            view.showMailAccountIsBeingEditedNotice(node);

            return false;
        }

        return true;
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
                    store : me.getMailFolderTree().getStore()
                })
            });
        }

        return me.mailboxService;
    },


    /**
     * Moves or deletes the specified messageItem. Delegates to
     * #mailboxService.moveToTrashOrDeleteMessage.
     *
     * @param {conjoon.cn_mail.model.mail.message.AbstractMessageItem} messageItem
     * @param {Boolean} hideConfirmWindow true to make sure the InboxView does
     * not show its confirm window, otherwise false.
     * @param {Ext.Panel} requestingView a view that currently displays the
     * message item to delete and which implements the {conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog}
     * mixin to show a confirm-dialog before deleting. If omitted, defaults to this
     * controller's view
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * created by the MailboxService for the requested action.
     *
     * @see onBeforeMessageMoveOrDelete
     * @see onMessageMovedOrDeleted
     * @see onMessageMovedOrDeletedFailure
     */
    moveOrDeleteMessage : function(messageItem, hideConfirmWindow = false, requestingView = null) {

        const me   = this;

        if (!requestingView) {
            requestingView = me.getView();
        }


        return me.getMailboxService().moveToTrashOrDeleteMessage(messageItem, {
            before  : Ext.Function.bind(me.onBeforeMessageMoveOrDelete, me, [hideConfirmWindow, requestingView], true),
            success : Ext.Function.bind(me.onMessageMovedOrDeleted, me, [requestingView], true),
            failure : me.onMessageMovedOrDeletedFailure,
            scope   : me
        });
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
     * @param {Boolean} hideConfirmWindow true to make sure the InboxView does
     * not show its confirm window, otherwise false.
     * @param {Ext.Panel} requestingView
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation}
     */
    onBeforeMessageMoveOrDelete : function(operation, hideConfirmWindow, requestingView) {

        const me           = this,
              view         = me.getView(),
              messageItem  = operation.getRequest().record,
              type         = operation.getRequest().type,
              Operation    = conjoon.cn_mail.data.mail.service.mailbox.Operation,
              messageGrid  = me.getMessageGrid(),
              isDraftClass = messageItem.entityName === 'MessageDraft',
              gridReady    = me.getLivegrid().isConfigured();

        let field, gridItem;

        switch (type) {
            case Operation.MOVE:
                field = "cn_moved";
                break;

            case Operation.DELETE:

                // fire global event and let other components veto
                if (view.fireEvent('cn_mail-beforemessageitemdelete', view, messageItem, requestingView) === false) {
                    return false;
                }

                // if no veto, confirm by InboxView
                if (hideConfirmWindow !== true) {
                    requestingView.showMessageDeleteConfirmDialog(messageItem,
                        function(btnAction, value) {
                            const me = this;
                            if (btnAction == 'yesButton') {
                                me.moveOrDeleteMessage(messageItem, true, requestingView);
                            }
                        },
                    me);

                    return false;
                }

                field = "cn_deleted";
                break;
            default:
                Ext.raise({
                    msg  : "Unexpected operation type for before-callback",
                    type : type
                });
                break;
        }

        if (gridReady) {
            if (isDraftClass || messageItem.store !== me.getMessageGrid().getStore()) {
                gridItem = me.getLivegrid().getRecordById(messageItem.getId());
            } else {
                gridItem = messageItem;
            }

            if (gridItem) {
                // set the field property
                gridItem.set(field, true, {dirty : false});
            }

        }

        // this is needed since messageGrid has a BufferedStore.
        // not unjoining beforehand means the default impl. tries to look
        // up and call getAssociatedEntitity on the BufferedStore. This
        // method does not exist.
        operation.getRequest().owningStore = messageItem.store;
        messageItem.unjoin(messageItem.store);

        if (type === Operation.DELETE) {
            // drop MessageDrafts and dont cascade,
            // otherwise errors will be thrown when calling erase on the
            // MessageDraft later on if it has associations
            messageItem.drop(false);
        }


        if (gridReady) {
            // deselect messageItem
            messageGrid.getSelectionModel().deselect(gridItem);

            // hide RowFylMenu
            me.getRowFlyMenu().detachMenuAndUnset();

        }

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

        const me           = this,
              request      = operation.getRequest(),
              messageItem  = request.record,
              type         = request.type,
              Operation    = conjoon.cn_mail.data.mail.service.mailbox.Operation,
              owningStore  = request.owningStore,
              isDraftClass = messageItem.entityName === 'MessageDraft';

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
        owningStore && messageItem.join(owningStore);

        // set the field property
        if (!isDraftClass && owningStore === me.getMessageGrid().getStore()) {
            messageItem.set(field, false, {dirty : false});
        }

        return operation;
    },


    /**
     * Callback for successfull move/delete operation. Moves the record out of
     * the currently shown MessageGrid if applicable, or adds it to the MessageGrid,
     * depending on the MailFolder currentls selected and the operation's type.
     * Also removes any cn_deleted/cn_moved flag.
     *
     * @param {conjoon.cn_mail.data.mail.service.mailbox.Operation} operation
     * @pram {Ext.Panel} requestingView
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation}
     */
    onMessageMovedOrDeleted : function(operation, requestingView) {

        const me               = this,
              request          = operation.getRequest(),
              view             = me.getView(),
              messageItem      = request.record,
              type             = request.type,
              Operation        = conjoon.cn_mail.data.mail.service.mailbox.Operation,
              messageGrid      = me.getMessageGrid(),
              owningStore      = request.owningStore,
              gridReady        = me.getLivegrid().isConfigured(),
              isDraftClass     = messageItem.entityName === 'MessageDraft',
              mailFolderHelper = me.getMailboxService().getMailFolderHelper();

        let field;

        switch (type) {
            case Operation.MOVE:
                field = "cn_moved";
                break;

            case Operation.DELETE:
                field = "cn_deleted";
                break;
            default:
                // there is an edge case where drafts are part of the send-folder.
                // sending them will create a NOOP since they are NOT moved to
                // the send-folder, they already belong to it. This will throw
                // an exception. This will be accepted for now
                Ext.raise({
                    msg  : "Unexpected operation type for failure-callback",
                    type : type
                });
                break;
        }

        if (!isDraftClass && owningStore === me.getMessageGrid().getStore()) {
            messageItem.set(field, false, {dirty : false});
        }

        let selectedFolder      = me.getSelectedMailFolder(),
            targetFolderId      = type === Operation.MOVE
                                  ? request.targetFolderId
                                  : messageItem.get('mailFolderId'),
            isNotTargetSelected = targetFolderId && selectedFolder &&
                                  selectedFolder.get('id') !== targetFolderId,
            isTargetSelected    = targetFolderId && selectedFolder &&
                                  selectedFolder.get('id') === targetFolderId;

        // remove the item if possible out of the grid
        if (messageItem.isCompoundKeyConfigured() && gridReady &&
            (isNotTargetSelected || type === Operation.DELETE)) {

            // when we are working on a draft, we are assuming that the messageItem
            // represents another entity which has not yet been updated, thus,
            // we have to use the previous CompoundKey of the draft to look up
            // the according item.
            // When the Operation is of type DELETE, we assume that all CKs are set
            // properly
            let CK = null, gridItem;

            if (type === Operation.DELETE) {
                CK = messageItem.getCompoundKey();
            } else {
                CK = isDraftClass
                     ? messageItem.getPreviousCompoundKey()
                     : messageItem.getCompoundKey();
            }

            gridItem = me.getLivegrid().getRecordByCompoundKey(CK);
            if (gridItem) {
                me.getLivegrid().remove(gridItem);
            }
        }

        switch (type) {
            case (Operation.MOVE):

                if (gridReady && isTargetSelected) {
                    if (isDraftClass) {
                        let gridItem = conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater.createItemFromDraft(
                            messageItem
                        );
                        gridItem.join(messageGrid.getStore());
                        me.getLivegrid().add(gridItem);
                    } else {
                        if (owningStore) {
                            messageItem.join(owningStore);
                        } else {
                            // make sure rcord is registered with MessageGrid Store since
                            // it gets added here
                            // owning store was unoined, but in this case it
                            // is not available, so we make sure we do not add the store
                            // twice by unjoining beforehand
                            messageItem.unjoin(messageGrid.getStore());
                            messageItem.join(messageGrid.getStore());
                        }
                        me.getLivegrid().add(messageItem);
                    }
                } else if (!isDraftClass) {
                    owningStore && messageItem.join(owningStore);
                }

                let accountId = messageItem.get('mailAccountId');

                view.fireEvent(
                    'cn_mail-messageitemmove', view, messageItem, requestingView,
                    mailFolderHelper.getMailFolder(accountId, request.sourceFolderId),
                    mailFolderHelper.getMailFolder(accountId, request.targetFolderId)
                );

                break;

            case (Operation.DELETE):
                if (requestingView) {
                     requestingView.closeAfterDelete();
                 }
                 break;
         }

        return operation;
    },


    /**
     * Advises this view's child components to update themselves regarding the
     * creating of a MessageDraft.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageeDraft} messageDraft
     *
     * @return
     */
    updateViewForCreatedDraft : function(messageDraft) {

        const me       = this,
              selected = me.getSelectedMailFolder();

        if (!selected ||
            selected.get('folderType') !== conjoon.cn_mail.data.mail.folder.MailFolderTypes.DRAFT ||
            selected.get('mailAccountId') !== messageDraft.get('mailAccountId')) {
            return;
        }

        let addItem = conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater.createItemFromDraft(
                messageDraft
            ),
            messageGrid = me.getMessageGrid();

        addItem.join(messageGrid.getStore());
        me.getLivegrid().add(addItem);
    },


    /**
     * Advises this view's child components to update themselves regarding the
     * sending of a MessageDraft.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageeDraft} messageDraft
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * for moving a MessageItem triggered by this action. Returns null if no
     * move operation could be triggered
     *
     */
    updateViewForSentDraft : function(messageDraft) {

        const me        = this,
              selected  = me.getSelectedMailFolder(),
              ck        = messageDraft.getCompoundKey(),
              livegrid  = me.getLivegrid();

        let mailFolderId = me.getMailboxService()
            .getMailFolderHelper().getMailFolderIdForType(
                messageDraft.get('mailAccountId'),
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.SENT
            ),
            newRec;

        // mailfolder selected, livegrid should be available
        if (selected) {

            // check if we get the references message and update its answered flag
            let draftInfo = messageDraft.get('xCnDraftInfo');
            if (draftInfo) {
                let [sendAccountId, sendFolderId, sendId] = Ext.decode(atob(draftInfo)),
                    referencedRec = livegrid.getRecordByCompoundKey(
                        conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                            sendAccountId, sendFolderId, sendId
                        )
                    );

                if (referencedRec) {
                    referencedRec.set('answered', true, {dirty : false})
                }
            }



            let selectedId = selected.get('id');

            // check if the selected folder shows the grid where the original
            // messageDraft is represented as a MessageItem
            if (selectedId === messageDraft.get('mailFolderId')) {
                // remove the record, return. Nothing more to do here
                newRec = livegrid.getRecordByCompoundKey(ck);
            }
        }

        if (!newRec) {
            newRec = conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater.createItemFromDraft(
                messageDraft
            );
        }

        // make sure we set "draft" to false. Will be rejected if moving fails
        newRec.set('draft', false);
        return me.getMailboxService().moveMessage(newRec, mailFolderId, {
            before  : me.onBeforeMessageMoveOrDelete,
            success : me.onMessageMovedOrDeleted,
            failure : me.onMessageMovedOrDeletedFailure,
            scope   : me
        });

    },


    /**
     * @private
     */
    getMessageView : function() {
        return this.getView().down('cn_mail-mailmessagereadermessageview');
    },


    /**
     * @private
     *
     * @return {coon.comp.grid.feature.Livegrid}
     */
    getLivegrid : function() {
        return this.getMessageGrid().view
            .getFeature('cn_mail-mailMessageFeature-livegrid');
    },


    /**
     * @private
     */
    getRowFlyMenu : function() {
        return this.getMessageGrid().view
                   .getFeature('cn_mail-mailMessageFeature-rowFlyMenu');
    },


    /**
     * @private
     */
    getSelectedMailFolder : function() {
        let sel = this.getMailFolderTree().getSelection();

        if (sel && sel.length) {
            return sel[0];
        }

        return null;
    },


    /**
     * @private
     */
    getMessageGrid : function() {

        const me = this;

        if (!me.messageGrid) {
            me.messageGrid = me.getView().down('cn_mail-mailmessagegrid');
        }
        return me.messageGrid;
    },


    /**
     * @private
     */
    getMailFolderTree : function() {

        const me = this;

        if (!me.mailFolderTree) {
            me.mailFolderTree = me.getView().down('cn_mail-mailfoldertree');
        }
        return me.mailFolderTree;
    }


});
