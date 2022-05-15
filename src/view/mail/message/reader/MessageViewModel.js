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
 * The default viewModel for {@link conjoon.cn_mail.view.mail.message.reader.MessageView}.
 * This default implementation is configured to be used with
 * {@link conjoon.cn_mail.view.mail.message.reader.MessageView}.
 *
 * This viewModel provides data bindings for
 * messageItem {@link conjoon.cn_mail.model.mail.message.MessageItem}
 * and
 * messageBody {@link conjoon.cn_mail.model.mail.message.MessageBody}
 */
Ext.define("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {

    extend: "Ext.app.ViewModel",

    requires: [
        // @define l8
        "l8",
        "conjoon.cn_mail.model.mail.message.ItemAttachment",
        "conjoon.cn_mail.model.mail.message.MessageDraft",
        "conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater",
        "conjoon.cn_mail.text.mail.message.reader.PlainReadableStrategy",
        "coon.core.util.Date",
        "coon.core.ServiceLocator"
    ],

    alias: "viewmodel.cn_mail-mailmessagereadermessageviewmodel",

    /**
     * The current load operation of the {@link conjoon.cn_mail.model.mail.message.MessageBody},
     * if any.
     * @type {Ext.data.operation.Read}
     * @private
     */
    bodyLoadOperation: null,

    /**
     * The current load operation of the {@link conjoon.cn_mail.model.mail.message.ItemAttachment},
     * if any.
     * @type {Ext.data.operation.Read}
     * @private
     */
    attachmentsLoadOperation: null,

    /**
     * A map of messageBodyIds which were loaded but where the load process was
     * cancelled. This is so the loader knows when it has to set the "reload"
     * options to force reloading the association.
     * Once successfully loaded, the loaded id will be removed from the map.
     * @private
     */
    abortedRequestMap: null,

    /**
     * Default empty subject text for MessageItems.
     * @i18n
     * @private
     */
    emptySubjectText: "(No subject)",

    /**
     * UserImageService as registered with the ServiceLocator
     * @type {coon.core.service.UserImageService} userImageService
     */

    constructor () {

        const me = this;

        me.userImageService = coon.core.ServiceLocator.resolve("coon.core.service.UserImageService");

        me.callParent(arguments);
    },

    data: {

        /**
         * Should be set to true whenever a loaded message contains remote images,
         * otherwise to false.
         */
        hasImages: false,

        /**
         * Should be set to true whenever the MessageViewIframe's srcdoc is fully loaded,
         * indicated by it's load event.
         */
        iframeLoaded: false,

        /**
         * Should be set to true whenever a MessageItem is currently loaded
         * before assigning it to this vm's nessageItem property.
         */
        isLoading: false,

        /**
         * @type {conjoon.cn_mail.model.mail.message.MessageItem}
         */
        messageItem: null,

        /**
         * view sets this to notifiy its interest of rendering the reply All,
         * edit/delete draft buttons.
         */
        contextButtonsEnabled: false
    },

    stores: {
        attachmentStore: {
            model: "conjoon.cn_mail.model.mail.message.ItemAttachment",
            data: "{attachments}"
        }
    },

    formulas: {

        /**
         * Formula responsible for transforming text/plain portion
         * of a message into a readable HTML-structure.
         *
         * @see {conjoon.cn_mail.text.mail.message.reader.PlainReadableStrategy}
         */
        textPlainToHtml: {

            bind: {
                textPlain: "{messageBody.textPlain}"
            },

            get: function (data) {

                if (!data.textPlain) {
                    return "";
                }

                const me = this;
                if (!me.plainReadableStrategy) {
                    me.plainReadableStrategy = Ext.create("conjoon.cn_mail.text.mail.message.reader.PlainReadableStrategy");
                }

                return me.plainReadableStrategy.process(data.textPlain);
            }

        },


        getSenderImage: {
            bind: {
                address: "{messageItem.from.address}"
            },

            get (data) {
                return this.userImageService.getImageSrc(data.address);
            }
        },

        /**
         * This formula computes the subject to display and returns #emptySubjectText
         * if the MessageDraft's subject is empty. If the value set via this formula
         * is empty, the #emptySubjectText will be used instead.
         *
         */
        getSubject: {

            bind: {
                subject: "{messageItem.subject}"
            },

            get: function (data) {
                return data.subject || this.emptySubjectText;
            }
        },


        /**
         * Returns the to-address of the current MessageItem the view should
         * display.
         *
         * @param {Function} get
         *
         * @return {String}
         */
        getDisplayToAddress: function (get) {
            const messageItem = get("messageItem"),
                to          = get("messageItem.to");

            if (!messageItem) {
                return "";
            }

            let res = [];
            for (let i = 0, len = to.length; i < len; i++) {
                res.push(to[i].name);
            }

            return res.join(", ");
        },


        /**
         * Returns the from-address of the current MessageItem the view should
         * display.
         *
         * @param {Function}  get
         *
         * @return {String}
         */
        getDisplayFromAddress: function (get) {

            const messageItem = get("messageItem"),
                from        = get("messageItem.from");

            if (!messageItem) {
                return "";
            }

            return from ? from.name : "";
        },


        /**
         * Returns the date of the message item as formatted by
         * coon.core.util.Date#getHumanReadableDate
         *
         * @param {Function} get
         *
         * @returns {String}
         *
         * @see coon.core.util.Date#getHumanReadableDate
         */
        getFormattedDate: function (get) {
            return coon.core.util.Date.getHumanReadableDate(get("messageItem.date"));
        },

        /**
         * Returns the text to display in the MessageView depending on the
         * availability of a MessageItem and a MessageBody. If a MessageItem
         * is available but no MessageBody, this formula assumes that a
         * MessageBody is currently being loaded.
         *
         * @param {Function} get
         *
         * @return {String}
         *
         * @see getIndicatorIcon
         */
        getIndicatorText: function (get) {
            /**
             * @i18n
             */
            return !get("messageBody") && !get("messageItem")
                ? "Select a message for reading."
                : get("messageItem") && (!get("messageBody") || !get("iframeLoaded"))
                    ? "Loading message body..."
                    : "";

        },


        /**
         * Returns the icon to display in the MessageView depending on the
         * availability of a MessageItem and a MessageBody. If a MessageItem
         * is available but no MessageBody, this formula assumes that a
         * MessageBody is currently being loaded.
         *
         * @param {Function} get
         *
         * @return {String}
         *
         * @see getIndicatorText
         */
        getIndicatorIcon: function (get) {

            return !get("messageBody") && !get("messageItem")
                ? "far fa-envelope"
                : get("messageItem") && (!get("messageBody") || !get("iframeLoaded"))
                    ? "fas fa-spin fa-spinner"
                    : "";
        }

    },


    /**
     * Updates this view models data with the data found in the passed
     * MessageDraft.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @throws if messageDraft is not an instance of {conjoon.cn_mail.model.mail.message.MessageDraft},
     * or if there is currently not a messageItem available, or if the accountId of the compoundKey
     * is not equal in bot items
     */
    updateMessageItem: function (messageDraft) {

        var me             = this,
            messageItem    = me.get("messageItem"),
            newAttachments = [],
            messageBody, attachments;

        if (!messageItem) {
            Ext.raise({
                msg: "There is currently no messageItem available.",
                cls: Ext.getClassName(me),
                messageItem: me.get("messageItem")
            });
        }
        if (!(messageDraft instanceof conjoon.cn_mail.model.mail.message.MessageDraft)) {
            Ext.raise({
                msg: "messageDraft must be an instance of 'conjoon.cn_mail.model.mail.message.MessageDraft'",
                cls: Ext.getClassName(me),
                messageDraft: messageDraft
            });
        }

        if (messageDraft.getCompoundKey().getMailAccountId() !== messageItem.getCompoundKey().getMailAccountId()) {
            Ext.raise({
                msg: "The accountId of the compoundKey of the messageDraft does not equal to the accountId of the compoundKey of the messageItem",
                cls: Ext.getClassName(me),
                messageDraft: messageDraft,
                messageItem: messageItem
            });
        }

        attachments = messageDraft.attachments().getRange();
        messageBody = messageDraft.getMessageBody().copy();

        // clone attachments to make sure no references are passed
        for (var i = 0, len = attachments.length; i < len; i++) {
            newAttachments.push(attachments[i].copy());
        }

        conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater.updateItemWithDraft(
            messageItem, messageDraft
        );

        me.set("attachments", newAttachments);
        me.set("messageBody", messageBody);

    },


    /**
     * Sets the message item for this view, or null to clear the view.
     * Once the message was loaded into the view, the associated messageItem's
     * 'seen' field will be set to "true".
     * Due to the nature of the asynchronous process involved with loading any
     * associated {@link conjoon.cn_mail.model.mail.message.MessageBody},
     * this method will also take care of cancelling any undergoing load-process
     * if another call to this method was made while a message body is currently
     * being loaded.
     * If no messageBody was associated with the messageItem, the ViewModel's
     * messageBody will be set to an empty object {}.
     *
     * @param {@conjoon.cn_mail.model.mail.message.MessageItem/null} messageItem
     *
     * @throws exception if messageItem is neither null and not of type
     * {@link conjoon.cn_mail.model.mail.message.MessageItem}
     */
    setMessageItem: function (messageItem) {
        var me = this,
            clonedItem;

        // manually set the messageBody and attachments-data to null/ empty array
        // to make sure the view is updated if needed
        me.set("messageBody", null);
        me.set("attachments", []);

        if (messageItem &&
            !(messageItem instanceof conjoon.cn_mail.model.mail.message.MessageItem)) {
            Ext.raise({
                sourceClass: Ext.getClassName(this),
                msg: "messageItem needs to be instance of conjoon.cn_mail.model.mail.message.MessageItem"
            });
        }

        me.set("messageItem", messageItem);

        if (messageItem) {
            // we are working on a copy of the messageItem record to make sure
            // the passed messageiItem does not get its body and attachments loaded
            // to keep memory footprint low
            clonedItem = messageItem.clone();
            me.loadMessageBodyFor(clonedItem);
            me.loadAttachmentsFor(clonedItem);
        } else {
            me.messageBodyLoaded(null, null);
        }

    },


    /**
     * Loads the messageBody for the specified MessageItem.
     * Makes sure any ongoing current load operation for the MessageBody is aborted.
     * Forces to reload the MessageBody if necessary.
     * Note: The MessageItem passed to this method must not necessarily be the
     * exact same instance of the MessageItem the ViewModel uses for its binding.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
     *
     * @private
     */
    loadMessageBodyFor: function (messageItem) {

        var me = this,
            ret;

        if (!me.abortedRequestMap) {
            me.abortedRequestMap = {};
        }

        if (me.bodyLoadOperation) {
            me.abortMessageBodyLoad();
        }

        /**
         * @bug
         * @see https://www.sencha.com/forum/showthread.php?336578-6-2-1-Ext-data-Model-load-scope-parameters-not-considered-iterating-extra-callbacks&p=1174274#post1174274
         */
        ret = messageItem.loadMessageBody({
            reload: me.abortedRequestMap[messageItem.get("messageBodyId")] === true,
            success: me.messageBodyLoaded,
            failure: me.onMessageBodyLoadFailure,
            scope: me
        });

        if (!ret) {
            me.messageBodyLoaded(null, null);
            return;
        }

        if (ret.loadOperation) {
            me.bodyLoadOperation = {
                messageBodyId: messageItem.get("messageBodyId"),
                loadOperation: ret.loadOperation
            };
        }
    },


    /**
     * Loads the attachments for the specified MessageItem.
     * Makes sure any ongoing current load operation for the Attachments is aborted.
     * Note: The MessageItem passed to this method must not necessarily be the
     * exact same instance of the MessageItem the ViewModel uses for its binding.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
     *
     * @private
     */
    loadAttachmentsFor: function (messageItem) {

        var me = this;

        if (me.attachmentsLoadOperation) {
            me.abortMessageAttachmentsLoad();
        }

        if (messageItem.get("hasAttachments")) {
            messageItem.attachments().on(
                "beforeload", me.onBeforeAttachmentsLoad, me, {single: true}
            );
            messageItem.loadAttachments({
                callback: me.messageAttachmentsLoaded,
                scope: me
            });
        }
    },


    /**
     * Aborts any currently active attachment-store load operation.
     * @protected
     */
    abortMessageAttachmentsLoad: function () {

        var me = this;

        if (me.attachmentsLoadOperation) {
            me.attachmentsLoadOperation.abort();
            me.attachmentsLoadOperation = null;
        }
    },


    /**
     * Aborts the current actove loading of the MessageBody.
     * @protected
     */
    abortMessageBodyLoad: function () {

        var me                = this,
            bodyLoadOperation = me.bodyLoadOperation;

        if (bodyLoadOperation && bodyLoadOperation.loadOperation &&
            bodyLoadOperation.loadOperation.isRunning()) {
            bodyLoadOperation.loadOperation.abort();
            me.abortedRequestMap[bodyLoadOperation.messageBodyId] = true;
        }

        me.bodyLoadOperation = null;
    },


    privates: {

        /**
         * Callback for the attachments-store load operation.
         * @private
         */
        messageAttachmentsLoaded: function (records, operation, success) {

            var me = this;

            me.attachmentsLoadOperation = null;

            if (success !== true) {
                return;
            }

            me.set("attachments", records);
        },


        /**
         * Callback for the attachments-store beforeload event. Makes sure the
         * associated operation is available for aborting it, if necessary.
         * @private
         */
        onBeforeAttachmentsLoad: function (store, operation) {

            var me = this;

            me.attachmentsLoadOperation = operation;

        },


        /**
         * Delegates to this view's onMessageItemLoadFailure
         *
         * @param {conjoon.cn_mail.model.mail.message.MessageBody} record
         * @param {Ext.data.operation.Read} operation
         * @private
         */
        onMessageBodyLoadFailure: function (record, operation) {
            const me   = this,
                view = me.getView();

            if (operation.error && operation.error.status === -1) {
                // -1 should be the status coce for aborted
                // requests - most likely the user switched to another
                // message during the loading of this record
                return;
            }
            view.onMessageItemLoadFailure(record, operation);
        },


        /**
         * Callback for the MessageBody's load event.
         * @private
         */
        messageBodyLoaded: function (record, operation) {
            var me   = this,
                item = me.get("messageItem");

            me.bodyLoadOperation = null;

            if (!record) {
                // set to null or any, mark messageBody empty in view
                me.set("messageBody", null);
                return;
            }

            if (!item) {
                //message item might be unloaded
                return;
            }

            // everything okay, mark item as read and set messageBody
            delete  me.abortedRequestMap[record.getId()];
            me.set("messageBody", record);

            item.set("recent", false);

            if (item.get("seen") !== true) {
                item.set("seen", true);
                item.save({
                    callback: me.triggerMessageItemRead,
                    scope: me
                });
            }

        },


        /**
         * Delegates to the view and advises to fire the cn_mail-mailmessageitemread
         * event.
         * @param record
         * @param operation
         *
         * @private
         */
        triggerMessageItemRead: function (record, operation) {

            var me   = this,
                view = me.getView();

            view.fireEvent(
                "cn_mail-mailmessageitemread", [record]
            );
        }

    }

});