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
 * Service class for mailbox related tasks.
 *
 * @example
 *
 *      let store = Ext.create('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore', {
 *          autoLoad : mailFolderTreeStore
 *      });
 *
 *      let service = Ext.create('conjoon.cn_mail.data.mail.service.MailboxService', {
 *          mailFolderHelper : Ext.create('conjoon.cn_mail.data.mail.service.MailboxService', {
 *              store : mailFolderTreeStore
 *          )}
 *      ));
 *
 *      let messageItem = conjoon.cn_mail.model.mail.message.MessageItem.loadEntity(
 *          'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor('account', 'INBOX', 12), {
 *          success : function(record) {
 *              let op = service.moveToTrashOrDeleteMessage(record, {
 *                  success : function(operation) {
 *                      let request = operation.getRequest(),
 *                          id      = request.record.getId(),
 *                          type    = request.type;
 *
 *                          switch (type) {
 *                              case (conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE):
 *                                  console.log("message with id ", id, " was successfully moved");
 *                              break;
 *
 *                              case (conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE):
 *                                  console.log("message with id ", id, " was successfully deleted");
 *                              break;
 *                          }
 *                  },
 *                  failure : function(operation) {
 *                      let request = operation.getRequest(),
 *                          id      = request.record.getId(),
 *                          type    = request.type;
 *
 *                          switch (type) {
 *                              case (conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE_OR_DELETE):
 *                                  console.log("Moving or deleting failed. Reason: ", operation.getResult().reason);
 *                              break;
 *
 *                              case (conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE):
 *                                  console.log("message with id ", id, " could not be moved");
 *                              break;
 *
 *                              case (conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE):
 *                                  console.log("message with id ", id, " could not be deleted");
 *                              break;
 *                          }
 *                  }
 *              });
 *
 *
 *          }
 *      });
 *
 */
Ext.define("conjoon.cn_mail.data.mail.service.MailboxService", {

    alternateClassName: ["conjoon.cn_mail.MailboxService"],

    requires: [
        "conjoon.cn_mail.model.mail.message.AbstractMessageItem",
        "conjoon.cn_mail.data.mail.service.mailbox.Operation",
        "conjoon.cn_mail.data.mail.service.MailFolderHelper"
    ],


    statics: {

        /**
         * A static set to keep track of all recent message item keys that have been processed
         * during the current session of the webmail client.
         * Recent messages are messages that were either flagged as "RECENT" by the server or by the client.
         *
         * @type {Set} recentMessageItems
         */
        recentMessageItemKeys: new Set(),


        /**
         * Returns a singleton instance for this helper.
         *
         * @returns {conjoon.cn_mail.data.mail.service.MailFolderHelper}
         */
        getInstance () {

            let inst = this.__inst;
            if (!inst) {
                inst = Ext.create(this, {
                    mailFolderHelper: conjoon.cn_mail.MailFolderHelper.getInstance()
                });
                this.__inst = inst;
            }

            return inst;
        }

    },

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
    constructor: function (cfg) {

        cfg = cfg || {};

        const me = this;

        if (!cfg.mailFolderHelper || !(cfg.mailFolderHelper instanceof conjoon.cn_mail.data.mail.service.MailFolderHelper)) {
            Ext.raise({
                msg: "'mailFolderHelper' must be an instance of conjoon.cn_mail.data.mail.service.MailFolderHelper",
                mailFolderHelper: cfg.mailFolderHelper
            });
        }

        me.initConfig(cfg);
    },

    /**
     * Moves the requested MessageItem to the trash folder or deletes it,
     * depending on the parent folder of the messageItem.
     * If the messageItem is a phantom record, it will not be moved, and instead
     * delete will be called on it immediately.
     *
     * @param {conjoon.cn_mail.model.mail.message.AbstractMessageItem} messageItem
     * @param {Object} options An additional, optional argument with the following options
     * @param {Object} options.before A callback for when the operation is about to start
     * @param {Object} options.success A callback for when the operation successfully finished
     * @param {Object} options.failure A callback for when the operation failed
     * @param {Object} options.scope The object in which the specified callbacks
     * have to be called.
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * triggered by this action
     *
     * @see deleteMessage
     * @see moveMessage
     * @see filterMessageItemValue
     *
     * @throws any exception thrown by #filterMessageItemValue
     */
    moveToTrashOrDeleteMessage: function (messageItem, options) {

        const me = this;

        messageItem = me.filterMessageItemValue(messageItem);

        const mailFolderHelper = me.getMailFolderHelper(),
            trashFolderId    = mailFolderHelper.getMailFolderIdForType(
                messageItem.get("mailAccountId"),
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.TRASH
            );


        if (trashFolderId === null) {
            let op = me.createOperation({
                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE_OR_DELETE,
                record: messageItem
            }, {
                success: false,
                reason: "Could not find TRASH folder."
            });

            if (options && options.failure) {
                options.failure.apply(options.scope, [op]);
            }

            return op;
        }

        // check whether we are already in the trashbin
        let sourceMailFolderId = messageItem.get("mailFolderId");
        if (messageItem.phantom === true || trashFolderId === sourceMailFolderId) {
            return me.deleteMessage(messageItem, options);
        }

        return me.moveMessage(messageItem, trashFolderId, options);
    },


    /**
     * Deletes the specified MessageItem from it's parent folder.
     * Deleting is asynchron. Once finished, the "result" of teh returned operation
     * will be set.
     * The unreadCount of the belonging source and target mailFolder will also
     * be updated.
     *
     * @param {conjoon.cn_mail.model.mail.message.AbstractMessageItem} messageItem
     * @param {Object} options An additional, optional argument with the following options
     * @param {Object} options.before A callback for when the operation is about to start
     * @param {Object} options.success A callback for when the operation successfully finished
     * @param {Object} options.failure A callback for when the operation failed
     * @param {Object} options.scope The object in which the specified callbacks
     * have to be called.
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * triggered by this action
     */
    deleteMessage: function (messageItem, options) {

        const me = this;

        messageItem = me.filterMessageItemValue(messageItem);

        let op = me.createOperation({
            type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
            record: messageItem
        });

        if (me.callBefore(op, options) === false) {
            op.setResult({
                success: false,
                code: conjoon.cn_mail.data.mail.service.mailbox.Operation.CANCELED
            });
            return op;
        }

        messageItem.erase(me.configureOperationCallbacks(op, options));

        return op;
    },


    /**
     * Moves the specified MessageItem from it's parent folder to the specified
     * target folder.
     * Moving is asynchron. Once finished, the "result" of the returned operation
     * will be set.
     * If the MessageItem has the same mailFolderId as specified, a NOOP operation
     * will be returned.
     * The unreadCount of the belonging source and target mailFolder will also
     * be updated.
     *
     * @param {conjoon.cn_mail.model.mail.message.AbstractMessageItem} messageItem
     * @param {String} mailFolderId
     * @param {Object} options An additional, optional argument with the following options
     * @param {Object} options.before A callback for when the operation is about to start
     * @param {Object} options.success A callback for when the operation successfully finished
     * @param {Object} options.failure A callback for when the operation failed
     * @param {Object} options.scope The object in which the specified callbacks
     * have to be called.
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation} the operation
     * triggered by this action
     *
     * @throws if mailFolderId is not a string, or if mailFolderId does not represent
     * a folder belonging to the same account the messageItem belongs to
     */
    moveMessage: function (messageItem, mailFolderId, options) {

        const me               = this,
            mailFolderHelper = me.getMailFolderHelper();

        let op;

        messageItem = me.filterMessageItemValue(messageItem);

        if (!Ext.isString(mailFolderId)) {
            Ext.raise({
                msg: "'mailFolderId' must be a string",
                mailFolderId: mailFolderId
            });
        }


        if (messageItem.get("mailFolderId") === mailFolderId) {
            op =  me.createOperation({
                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.NOOP,
                record: messageItem
            }, {success: true});

            if (options && options.success) {
                options.success.apply(options.scope, [op]);
            }

            return op;
        }

        op = me.createOperation({
            type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
            record: messageItem,
            sourceFolderId: messageItem.get("mailFolderId"),
            targetFolderId: mailFolderId
        });

        if (!mailFolderHelper.doesFolderBelongToAccount(mailFolderId, messageItem.get("mailAccountId"))) {
            op.setResult({
                success: false,
                code: conjoon.cn_mail.data.mail.service.mailbox.Operation.INVALID_TARGET
            });

            return op;
        }

        me.callBefore(op, options);
        messageItem.set("mailFolderId", mailFolderId);
        messageItem.save(me.configureOperationCallbacks(op, options));

        return op;

    },


    /**
     * Returns the MailFolderHelper this service is using.
     *
     * @return {conjoon.cn_mail.data.mail.service.MailFolderHelper}
     *
     * @see #mailFolderHelper
     */
    getMailFolderHelper: function () {
        const me = this;

        return me.mailFolderHelper;
    },


    /**
     * Checks if the specified argument is an AbstractMessageItem.
     *
     * @param {conjoon.cn_mail.model.mail.message.AbstractMessageItem} messageItem
     *
     * @return {conjoon.cn_mail.model.mail.message.AbstractMessageItem}
     *
     * @private
     *
     * @throws if messageItem is not an instance of
     * conjoon.cn_mail.model.mail.message.AbstractMessageItem, or if the mailAccountId
     * is missing
     */
    filterMessageItemValue: function (messageItem) {

        if (!(messageItem instanceof conjoon.cn_mail.model.mail.message.AbstractMessageItem)) {
            Ext.raise({
                msg: "\"messageItem\" must be an instance of conjoon.cn_mail.model.mail.message.AbstractMessageItem",
                messageItem: messageItem
            });
        }

        if (!messageItem.get("mailAccountId")) {
            Ext.raise({
                msg: "\"mailAccountId\" missing in messageItem",
                messageItem: messageItem
            });
        }

        return messageItem;
    },


    /**
     * Returns an object to be used to configure as callbacks for various
     * model-related operations, and immediately calls any method configured
     * for options.success / options.failure depending on the result of op.
     *
     * @param {conjoon.cn_mail.data.mail.service.mailbox.Operation} op
     * @param {Object} options An additional, optional argument with the following options
     * @param {Object} options.success A callback for when the operation successfully finished
     * @param {Object} options.failure A callback for when the operation failed
     * @param {Object} options.scope The object in which the specified callbacks
     * have to be called.
     *
     * @returns {Object}
     *
     * @private
     *
     * @see moveCallback
     * @see deleteCallback
     */
    configureOperationCallbacks: function (op, options) {

        const me        = this,
            Operation = conjoon.cn_mail.data.mail.service.mailbox.Operation;

        options = options || {};

        return {
            success: function () {
                op.setResult({success: true});

                if (op.getRequest().type === Operation.MOVE) {
                    me.moveCallback(op);
                } else  if (op.getRequest().type === Operation.DELETE) {
                    me.deleteCallback(op);
                }

                if (options && options.success) {
                    options.success.apply(options.scope, [op]);
                }
            },
            failure: function () {
                op.setResult({success: false});

                if (op.getRequest().type === Operation.MOVE) {
                    me.moveCallback(op);
                } else  if (op.getRequest().type === Operation.DELETE) {
                    me.deleteCallback(op);
                }

                if (options && options.failure) {
                    options.failure.apply(options.scope, [op]);
                }
            },
            scope: this
        };
    },


    /**
     * Helper function to create and return an Operation-object.
     *
     * @param {Object} request
     * @param {Object} result
     *
     * @return {conjoon.cn_mail.data.mail.service.mailbox.Operation}
     *
     * @private
     */
    createOperation: function (request, result) {

        let cfg = request || result ? {} : undefined;

        if (request) {
            cfg.request = request;
        }

        if (result) {
            cfg.result = result;
        }

        return Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", cfg);
    },


    /**
     * Invokes the "before"-callback if available as function in options..
     *
     * @param {conjoon.cn_mail.data.mail.service.mailbox.Operation} op
     * @param {Object} options An additional, optional argument with the following options
     * @param {Object} options.before A callback for when the operation is about to start
     *
     * @return {Boolean} The boolean return value of the before-callback invoked,
     * if any.
     *
     * @private
     */
    callBefore: function (op, options) {

        if (options && options.before) {
            return options.before.apply(options.scope, [op]);
        }

    },


    /**
     * Internal callback for a finished move operation. Success can be determined
     * by inspecting the specified operation.
     *
     * {conjoon.cn_mail.data.mail.service.mailbox.Operation} op
     *
     * @return {Boolean} the property of the operations result success property.
     */
    moveCallback: function (op) {

        const
            me               = this,
            request          = op.getRequest(),
            sourceFolderId   = request.sourceFolderId,
            targetFolderId   = request.targetFolderId,
            record           = request.record,
            mailAccountId    = record.get("mailAccountId"),
            mailFolderHelper = me.getMailFolderHelper();

        if (op.getResult().success !== true) {
            return false;
        }

        // just like MessageItemUpdater#updateItemWithDraft, we're setting the
        // messageBodyId here
        // @see conjoon/extjs-app-webmail#116
        record.set("messageBodyId", record.getId());

        // we are not interested in tracking the changes made to the mailFolderId
        // of the MessageBody, so silently commit this here
        if (record.entityName === "MessageDraft") {
            record.getMessageBody().commit(true);
        }

        if (record.get("seen")) {
            return true;
        }

        let sourceFolder = mailFolderHelper.getMailFolder(mailAccountId, sourceFolderId),
            targetFolder = mailFolderHelper.getMailFolder(mailAccountId, targetFolderId);

        // most likely not loaded yet if null
        if (sourceFolder) {
            sourceFolder.set("unreadCount", Math.max(0, sourceFolder.get("unreadCount") - 1), {dirty: false});
        }

        // most likely not loaded yet if null
        if (targetFolder) {
            targetFolder.set("unreadCount", targetFolder.get("unreadCount") + 1, {dirty: false});
        }


        return true;

    },


    /**
     * Internal callback for a finished delete operation. Success can be determined
     * by inspecting the specified operation.
     *
     * {conjoon.cn_mail.data.mail.service.mailbox.Operation} op
     */
    deleteCallback: function (op) {

        const me             = this,
            request          = op.getRequest(),
            record           = request.record,
            mailFolderId     = record.get("mailFolderId"),
            mailAccountId    = record.get("mailAccountId"),
            mailFolderHelper = me.getMailFolderHelper();

        if (op.getResult().success !== true) {
            return false;
        }

        if (record.get("seen")) {
            return;
        }

        let mailFolder = mailFolderHelper.getMailFolder(mailAccountId, mailFolderId);

        // most likely not loaded if not available
        if (mailFolder) {
            mailFolder.set("unreadCount", Math.max(0, mailFolder.get("unreadCount") - 1), {dirty: false});
        }

        return true;
    }


});
