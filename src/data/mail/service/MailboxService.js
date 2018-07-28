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
 * Service class for mailbox related tasks.
 *
 */
Ext.define("conjoon.cn_mail.data.mail.service.MailboxService", {


    requires : [
        'conjoon.cn_mail.model.mail.message.MessageItem',
        'conjoon.cn_mail.data.mail.service.mailbox.Operation'
    ],


    /**
     * @cfg {conjoon.cn_mail.data.mail.service.MailFolderHelper} mailFolderHelper
     * @private
     */

    /**
     * Constructor
     * Expects a mailFolderHelper property representing an instance of
     * {conjoon.cn_mail.data.mail.service.MailFolderHelper} this service should use
     *
     * @throws if cfg.mailFolderHelper is not set or not an instance of
     * conjoon.cn_mail.data.mail.service.MailFolderHelper
     */
    constructor : function(cfg) {

        cfg = cfg || {};

        const me = this;

        if (!cfg.mailFolderHelper || !(cfg.mailFolderHelper instanceof conjoon.cn_mail.data.mail.service.MailFolderHelper)) {
            Ext.raise({
                msg              : "'mailFolderHelper' must be an instance of conjoon.cn_mail.data.mail.service.MailFolderHelper",
                mailFolderHelper : cfg.mailFolderHelper
            })
        }

        me.initConfig(cfg);
    },

    /**
     * Moves the requested MessageItem to the trash folder or deletes it,
     * depending on the parent folder of the messageItem.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * triggered by this action
     *
     * @see deleteMessage
     * @see moveMessage
     */
    moveToTrashOrDeleteMessage : function(messageItem) {

        const me               = this,
              mailFolderHelper = me.getMailFolderHelper(),
              trashFolderId    = mailFolderHelper.getMailFolderIdForType(
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.TRASH);

        messageItem = me.filterMessageItemValue(messageItem);

        if (trashFolderId === null) {
            return Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                request : {
                    type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE_OR_DELETE,
                    record : messageItem
                },
                result : {
                    success : false,
                    reason  : "Could not find TRASH folder."
                }
            });
        }

        // check whether we are already in the trashbin
        let sourceMailFolderId = messageItem.get('mailFolderId');
        if (trashFolderId === sourceMailFolderId) {
            return me.deleteMessage(messageItem);
        }

        return me.moveMessage(messageItem, trashFolderId);
    },


    /**
     * Deletes the specified MessageItem from it's parent folder.
     * Deleting is asynchron. Once finished, the "result" of teh returned operation
     * will be set.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * triggered by this action
     */
    deleteMessage : function(messageItem) {

        const me = this;

        messageItem = me.filterMessageItemValue(messageItem);

        let op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
            request : {
                type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                record : messageItem
            }
        });
        messageItem.erase({
            success : function() {
                op.setResult({success : true});
            },
            failure : function() {
                op.setResult({success : false});
            }
        });

        return op;
    },


    /**
     * Moves the specified MessageItem from it's parent folder to the specified
     * target folder.
     * Moving is asynchron. Once finished, the "result" of the returned operation
     * will be set.
     * If the MessageItem has the same mailFolderId as specified, a NOOP operation
     * will be returned.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
     * @param {String} mailFolderId
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * triggered by this action
     *
     * @throws if mailFolderId is not a string
     */
    moveMessage : function(messageItem, mailFolderId) {

        const me = this;

        messageItem = me.filterMessageItemValue(messageItem);

        if (!Ext.isString(mailFolderId)) {
            Ext.raise({
                msg          : "'mailFolderId' must be a string",
                mailFolderId : mailFolderId
            });
        }


        if (messageItem.get('mailFolderId') === mailFolderId) {
            return Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                request : {
                    type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.NOOP,
                    record : messageItem
                },
                result : {success : true}
            });
        }

        let op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
            request : {
                type           : conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                record         : messageItem,
                targetFolderId : mailFolderId
            }
        });

        messageItem.set('mailFolderId', mailFolderId);
        messageItem.save({
            success : function() {
                op.setResult({success : true});
            },
            failure : function() {
                op.setResult({success : false});
            }
        });

        return op;

    },


    /**
     * Returns the MailFolderHelper this service is using.
     *
     * @return {conjoon.cn_mail.data.mail.service.MailFolderHelper}
     *
     * @see #mailFolderHelper
     */
    getMailFolderHelper : function() {
        const me = this;

        return me.mailFolderHelper;
    },


    /**
     * Checks if the specified argument is a MessageItem.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
     *
     * @return {conjoon.cn_mail.model.mail.message.MessageItem}
     *
     * @private
     *
     * @throws if messageItem is not an instance of conjoon.cn_mail.model.mail.message.MessageItem.
     */
    filterMessageItemValue : function(messageItem) {
        if (!(messageItem instanceof conjoon.cn_mail.model.mail.message.MessageItem)) {
            Ext.raise({
                msg         : "'messageItem' must be an instance of conjoon.cn_mail.model.mail.message.MessageItem",
                messageItem : messageItem
            });
        }

        return messageItem;
    }


});