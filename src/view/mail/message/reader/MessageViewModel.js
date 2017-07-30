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
 * The default viewModel for {@link conjoon.cn_mail.view.mail.message.reader.MessageView}.
 * This default implementation is configured to be used with
 * {@link conjoon.cn_mail.view.mail.message.reader.MessageView}.
 *
 * This viewModel provides data bindings for
 * messageItem {@link conjoon.cn_mail.model.mail.message.MessageItem}
 * and
 * messageBody {@link conjoon.cn_mail.model.mail.message.MessageBody}
 */
Ext.define('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {

    extend : 'Ext.app.ViewModel',

    requires : [
        'conjoon.cn_mail.model.mail.message.ItemAttachment',
        'conjoon.cn_mail.model.mail.message.MessageDraft'
    ],

    alias : 'viewmodel.cn_mail-mailmessagereadermessageviewmodel',

    /**
     * The current load operation of the {@link conjoon.cn_mail.model.mail.message.MessageBody},
     * if any.
     * @type {Ext.data.operation.Read}
     * @private
     */
    bodyLoadOperation : null,

    /**
     * The current load operation of the {@link conjoon.cn_mail.model.mail.message.ItemAttachment},
     * if any.
     * @type {Ext.data.operation.Read}
     * @private
     */
    attachmentsLoadOperation : null,

    /**
     * A map of messageBodyIds which were loaded but where the load process was
     * cancelled. This is so the loader knows when it has to set the "reload"
     * options to force reloading the association.
     * Once successfully loaded, the loaded id will be removed from the map.
     * @private
     */
    abortedRequestMap : null,

    data : {

        /**
         * Should be set to true whenever a MessageItem is currently loaded
         * before assigning it to this vm's nessageItem property.
         */
        isLoading : false,

        messageItem : null
    },

    stores : {
        attachmentStore : {
            model : 'conjoon.cn_mail.model.mail.message.ItemAttachment',
            data  : '{attachments}'
        }
    },

    formulas : {

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
        getIndicatorText : function(get) {

            return !get('messageBody') && !get('messageItem')
                   ? 'Select a message for reading.'
                   : get('messageItem') && !get('messageBody')
                     ? 'Loading message...'
                     : ''

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
        getIndicatorIcon : function(get) {

            return !get('messageBody') && !get('messageItem')
                ? 'fa-envelope-o'
                : get('messageItem') && !get('messageBody')
                ? 'fa-spin fa-spinner'
                : ''
        }

    },


    /**
     * Updates this view models data with the data found in the passed
     * MessageDraft.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @throws if messageDraft is not an instance of {conjoon.cn_mail.model.mail.message.MessageDraft},
     * or if there is currently not a messageItem available, or if the id of the
     * MessageDraft does not equal to the id of the messageItem.
     */
    updateMessageItem : function(messageDraft) {

        var me             = this,
            messageItem    = me.get('messageItem'),
            newAttachments = [],
            messageBody, attachments;

        if (!messageItem) {
            Ext.raise({
                msg         : 'There is currently no messageItem available.',
                cls         : Ext.getClassName(me),
                messageItem : me.get('messageItem')
            });
        }
        if (!(messageDraft instanceof conjoon.cn_mail.model.mail.message.MessageDraft)) {
            Ext.raise({
                msg          : 'messageDraft must be an instance of \'conjoon.cn_mail.model.mail.message.MessageDraft\'',
                cls          : Ext.getClassName(me),
                messageDraft : messageDraft
            });
        }
        if (messageDraft.getId() !== messageItem.getId()) {
            Ext.raise({
                msg          : 'The id of the messageDraft is not the id of the messageItem',
                cls          : Ext.getClassName(me),
                messageDraft : messageDraft,
                messageItem  : messageItem
            });
        }

        attachments = messageDraft.attachments().getRange();
        messageBody = messageDraft.getMessageBody().copy();

        // clone attachments to make sure no references are passed
        for (var i = 0, len = attachments.length; i < len; i++) {
            newAttachments.push(attachments[i].copy());
        }

        messageItem.set({
            date           : messageDraft.get('date'),
            subject        : messageDraft.get('subject'),
            hasAttachments : attachments.length > 0,
            previewText    : messageBody.get('textPlain')
        });
        messageItem.commit();

        me.set('attachments', newAttachments);
        me.set('messageBody', messageBody);

    },


    /**
     * Sets the message item for this view, or null to clear the view.
     * Once the message was loaded into the view, the associated messageItem's
     * 'isRead' field will be set to "true".
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
    setMessageItem : function(messageItem) {

        var me = this,
            clonedItem;

        // manually set the messageBody and attachments-data to null/ empty array
        // to make sure the view is updated if needed
        me.set('messageBody', null);
        me.set('attachments', []);

        if (messageItem &&
            !(messageItem instanceof conjoon.cn_mail.model.mail.message.MessageItem)) {
            Ext.raise({
                sourceClass : Ext.getClassName(this),
                msg         : "messageItem needs to be instance of conjoon.cn_mail.model.mail.message.MessageItem"
            });
        }

        me.set('messageItem', messageItem);

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
    loadMessageBodyFor : function(messageItem) {

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
        ret = messageItem.getMessageBody({
            reload  : me.abortedRequestMap[messageItem.get('messageBodyId')] === true,
            success : function(record, operation){
                me.messageBodyLoaded(record, operation);
            }
        });

        if (!ret) {
            me.messageBodyLoaded(null, null);
            return;
        }

        if (ret.loadOperation) {
            me.bodyLoadOperation = {
                messageBodyId   : messageItem.get('messageBodyId'),
                loadOperation   : ret.loadOperation
            }
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
    loadAttachmentsFor : function(messageItem) {

        var me = this;

        if (me.attachmentsLoadOperation) {
            me.abortMessageAttachmentsLoad();
        }

        if (messageItem.get('hasAttachments')) {
            messageItem.attachments().on(
                'beforeload', me.onBeforeAttachmentsLoad, me, {single : true}
            );
            messageItem.attachments().load({
                callback : me.messageAttachmentsLoaded,
                scope    : me
            });
        }
    },


    privates : {

        /**
         * Aborts any currently active attachment-store load operation.
         * @private
         */
        abortMessageAttachmentsLoad : function() {

            var me = this;

            if (me.attachmentsLoadOperation) {
                me.attachmentsLoadOperation.abort();
                me.attachmentsLoadOperation = null;
            }

        },


        /**
         * Callback for the attachments-store load operation.
         * @private
         */
        messageAttachmentsLoaded : function(records, operation, success) {

            var me = this;

            me.attachmentsLoadOperation = null;

            if (success !== true) {
                return;
            }

            me.set('attachments', records);
        },


        /**
         * Callback for the attachments-store beforeload event. Makes sure the
         * associated operation is available for aborting it, if necessary.
         * @private
         */
        onBeforeAttachmentsLoad : function(store, operation) {

            var me = this;

            me.attachmentsLoadOperation = operation;

        },


        /**
         * Aborts the current actove loading of the MessageBody.
         * @private
         */
        abortMessageBodyLoad : function() {

            var me                   = this,
                bodyLoadOperation = me.bodyLoadOperation;

            if (bodyLoadOperation.loadOperation && bodyLoadOperation.loadOperation.isRunning()) {
                bodyLoadOperation.loadOperation.abort();
                me.abortedRequestMap[bodyLoadOperation.messageBodyId] = true;
            }

            me.bodyLoadOperation = null;
        },


        /**
         * Callback for the MessageBody's load event.
         * @private
         */
        messageBodyLoaded : function(record, operation) {
            var me   = this,
                item = me.get('messageItem');

            me.bodyLoadOperation = null;

            if (!record) {
                // set to null or any, mark messageBody empty in view
                me.set('messageBody', null);
                return;
            }

            if (!item) {
                //message item might be unloaded
                return;
            }

            // everything okay, mark item as read and set messageBody
            delete  me.abortedRequestMap[record.get('id')];
            me.set('messageBody', record);

            if (item.get('isRead') != true) {
                item.set('isRead', true);
                item.save({
                    callback : me.triggerMessageItemRead,
                    scope   : me
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
        triggerMessageItemRead : function(record, operation) {

            var me   = this,
                view = me.getView();

            view.fireEvent(
                'cn_mail-mailmessageitemread', [record]
            );
        }

    }

});