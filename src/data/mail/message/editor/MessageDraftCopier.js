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
 * The MessageDraftCopier loads data based on the specified MessageDraftCopyRequest
 * and provides loaded data as a MessageDraftConfig to interested objects.
 * The data in the MessageDraftConfig will be decorated based upon the "decorators"
 * that where specified for an instance of this class, and default to the ones
 * used by #createMessageDraftConfig.
 *
 * @example
 *      var copier = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier');
 *
 *      copier.loadMessageDraftCopy(
 *          '1', conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO,
 *          function(copier, messageDraftConfig, success) {
 *              if (success) {
 *                  console.log(messageDraftConfig.toObject());
 *                  return;
 *              }
 *
 *              console.log("Copying failed.");
 *          }
 *      )
 *
 */
Ext.define('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier', {


    requires : [
        'conjoon.cn_mail.model.mail.message.MessageDraft',
        'conjoon.cn_mail.data.mail.message.EditingModes',
        'conjoon.cn_mail.text.mail.message.ForwardMessageDecorator',
        'conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator',
        'conjoon.cn_mail.text.mail.message.ReplyAllMessageDecorator',
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest'
    ],


    /**
     * Loads a copy of the MessageDraft with the specified compound key and
     * creates a copy of its data, so it can be saved with a new id.
     *
     * @param {conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest} messageDraftCopyRequest
     * @param {Function} callback for the loadoperation of the MessageDraft and
     * all its associations. The passed arguments are
     *  - this - the copier instance
     *  - MessagedraftConfig - the created MessageDraftConfig instance, or null
     *  if loading failed.
     *  - success: true or false
     * @param {object} scope optional scope for callback
     *
     *
     * @private
     *
     * @throws if messageDraftCopyRequest is not an instance of conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest
     */
    loadMessageDraftCopy : function(messageDraftCopyRequest, callback, scope) {
        var me = this,
            key, editMode;

        if (!(messageDraftCopyRequest instanceof conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest)) {
            Ext.raise({
                messageDraftCopyRequest : messageDraftCopyRequest,
                msg                     : "\"messageDraftCopyRequest\" must be an instance of conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest"
            });
        }

        if (!Ext.isFunction(callback)) {
            Ext.raise({
                callback : callback,
                msg      : "\"callback\" must be a valid callback"
            });
        }

        key       = messageDraftCopyRequest.getCompoundKey();
        editMode = messageDraftCopyRequest.getEditMode();

        conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
            key, {
            success : Ext.Function.bind(
                me.onMessageDraftLoad, me, [editMode, callback, scope], true
            ),
            scope : me
        });
    },


    privates : {


        /**
         * Callback for a successful load operation of a MessageDraft requested
         * via loadMessageDraftCopy. Will trigger loading the MessageBody.
         *
         * @param {conjoon.cn_mail.model.mail.message.MessageDraft} record
         * @param {Ext.data.operation.OPeratiom} operation
         * @param {String} editMode
         * @param {Function} callback
         * @param {Object} scope
         *
         * @see onMessageBodyLoad
         * @private
         */
        onMessageDraftLoad : function(record, operation, editMode, callback, scope) {

            var me = this;

            record.loadMessageBody({
                success : Ext.Function.bind(
                    me.onMessageBodyLoad, me, [record, editMode, callback, scope], true
                ),
                scope : me
            });

        },


        /**
         * Callback for a successful load operation of a MessageBody requested
         * via loadMessageDraftCopy.
         * The messageDraft submitted to this method is the original messageDraft
         * from which the messageBody was loaded. This method will trigger loading
         * the attachments of the specified messgeDraft.
         *
         * @param {conjoon.cn_mail.model.mail.message.MessageBody}  record
         * @param {Ext.data.operation.Operatiom} operation
         * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
         * @param {String} editMode
         * @param {Function} callback
         * @param {Object} scope
         *
         * @see onAttachmentsLoad
         * @private
         */
        onMessageBodyLoad : function(record, operation, messageDraft, editMode, callback, scope) {

            var me = this;

            messageDraft.loadAttachments({
                callback : Ext.Function.bind(
                    me.onAttachmentsLoad, me, [messageDraft, editMode, callback, scope], true
                ),
                scope : me
            });
        },


        /**
         * Callback for a successfull load operation of a Attachmnets requested
         * via loadMessageDraftCopy.
         *
         * @param {conjoon.cn_mail.model.mail.message.SraftAttachment} record
         * @param {Ext.data.operation.Operation} operation
         * @param {Boolean} success
         * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
         * @param {String} editMode
         */
        onAttachmentsLoad : function(records, operation, success, messageDraft, editMode, callback, scope) {

            var me = this,
                attachments = [];

            if (success) {
                for (var i = 0, len = records.length; i < len; i++) {
                    attachments.push(records[i].copy(null));
                }
            }

            callback.apply(scope || null, [
                me,
                success ? me.createMessageDraftConfig(messageDraft, editMode) : null,
                success
            ]);
        },


        /**
         * Creates a MessageDraftConfig based on the editMode and the associated
         * decorators.
         * By default, the following associations are available:
         * - conjoon.cn_mail.data.mail.message.EditingModes.
         *  REPLY_TO: conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator
         *  REPLY_ALL: conjoon.cn_mail.text.mail.message.ReplyAllMessageDecorator
         *  FORWARD: conjoon.cn_mail.text.mail.message.ForwardMessageTextDecorator

         *
         * @param {conjoon.cn_mail.model.mail.message.SraftAttachment} messageDraft
         * @param {String} editMode
         *
         * @return {conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig}
         *
         * @private
         */
        createMessageDraftConfig : function(messageDraft, editMode) {

            var me        = this,
                decorator = null;

            switch (editMode) {
                case conjoon.cn_mail.data.mail.message.EditingModes.FORWARD:
                    decorator = Ext.create(
                        'conjoon.cn_mail.text.mail.message.ForwardMessageDecorator', messageDraft);
                    break;

                case conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO:
                    decorator = Ext.create(
                        'conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator', messageDraft);
                    break;

                case conjoon.cn_mail.data.mail.message.EditingModes.REPLY_ALL:
                    decorator = Ext.create(
                        'conjoon.cn_mail.text.mail.message.ReplyAllMessageDecorator', messageDraft);
                    break;

            }

            return decorator.toMessageDraftConfig();
        }
    }

});