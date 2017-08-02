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
 * The default ViewController for
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {

    extend : 'Ext.app.ViewController',

    alias : 'controller.cn_mail-mailmessageeditorviewcontroller',

    control : {
        'cn_mail-mailmessageeditorhtmleditor > toolbar > cn_comp-formfieldfilebutton' : {
            change : 'onFormFileButtonChange'
        },

        '#showCcBccButton' : {
            click : 'onShowCcBccButtonClick'
        },

        '#sendButton' : {
            click : 'onSendButtonClick'
        },

        '#saveButton' : {
            click : 'onSaveButtonClick'
        },
        'cn_mail-mailmessageeditor' : {
            'cn_mail-mailmessagesaveoperationcomplete'  : 'onMailMessageSaveOperationComplete',
            'cn_mail-mailmessagesaveoperationexception' : 'onMailMessageSaveOperationException',
            'cn_mail-mailmessagesavecomplete'           : 'onMailMessageSaveComplete',
            'cn_mail-mailmessagebeforesave'             : 'onMailMessageBeforeSave'
        }
    },

    /**
     * Helper to indicate the number of times the attachmentlistWrap was entered/
     * leaved during the drag/drop process to properly add/remove styles.
     * @type {Integer=0} dragEnterCount
     * @private
     */
    dragEnterCount : 0,


    /**
     * Makes sure #installDragDropListeners is called as soon as the controller's
     * editor was rendered.
     */
    init : function() {
        var me   = this,
            view = me.getView();
        view.on('afterrender', me.installDragDropListeners, me, {single : true});
    },


    /**
     * Helper method to register the drag & drop listeners to the embedded
     * container wrapping the AttachmentList.
     *
     * @private
     */
    installDragDropListeners : function() {
        var me             = this,
            view           = me.getView(),
            attachmentWrap = view.down('#attachmentListWrap').el;

        view.mon(
            attachmentWrap, 'dragenter', me.onAttachmentListWrapDragEnter, me);
        view.mon(
            attachmentWrap, 'dragleave', me.onAttachmentListWrapDragLeave, me);
        view.mon(
            attachmentWrap, 'dragend',   me.onAttachmentListWrapDragEnd,   me);
        view.mon(
            attachmentWrap, 'drop',      me.onAttachmentListWrapDrop,      me);
    },


    /**
     * Helper function to add/remove the "hover" css class of the
     * attachmentListWrap.
     *
     * @param {Boolean} isHover true to add the css class, false to remove it.
     * @param {Boolean} forceReset true to reset #dragEnterCount to 0
     */
    registerAttachmentListWrapEnter : function(isHover, forceReset) {
        var me   = this,
            view = me.getView();

        if (isHover) {
            me.dragEnterCount++;
        } else {
            me.dragEnterCount--;
        }

        me.dragEnterCount = me.dragEnterCount < 0 || forceReset === true
                            ? 0
                            : me.dragEnterCount;

        view.down('#attachmentListWrap').el[
            me.dragEnterCount ? 'addCls' : 'removeCls'
        ]('hover')
    },


    /**
     * Callback for the dragenter event of the attachmentListWrap.
     * Makes sure the hoverAttachmentListWrap is being called.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragEnter : function(e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(true);
    },


    /**
     * Callback for the dragleave event of the attachmentListWrap.
     * Makes sure the hoverAttachmentListWrap is being called if,
     * and only if dragEnterCount is equal or less than 0.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragLeave : function(e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(false);
    },


    /**
     * Callback for the attachmentListWrap's dragend event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragEnd : function(e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(false, true);
    },


    /**
     * Callback for the attachmentListWrap's drop event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDrop : function(e) {
        e.preventDefault();

        var me           = this,
            dataTransfer = e.event.dataTransfer;

        me.registerAttachmentListWrapEnter(false, true);

        if (dataTransfer && dataTransfer.files) {
            me.addAttachmentsFromFileList(dataTransfer.files);
        }
    },


    /**
     * Adds the files available in fileList to the editor#s attachmentList.
     *
     * @param {FileList} fileList
     *
     * @private
     */
    addAttachmentsFromFileList : function(fileList) {
        var me             = this,
            view           = me.getView(),
            attachmentList = view.down('cn_mail-mailmessageeditorattachmentlist');

        for (var i = 0, len = fileList.length; i < len; i++) {
            attachmentList.addAttachment(fileList[i]);
        }
    },


    /**
     * Callback for the change event of this view's {@link conjoon.cn_comp.form.FileButton}.
     *
     * @param {conjoon.cn_comp.form.FileButton} fileButton
     * @param {Ext.event.Event} evt
     * @param {String} value
     * @param {FileList} fileList
     *
     * @see conjoon.cn_mail.view.mail.message.editor.AttachmentList#addAttachment
     */
    onFormFileButtonChange : function(fileButton, evt, value, fileList) {
        var me = this;
        me.addAttachmentsFromFileList(fileList);
    },


    /**
     * Delegates showing the CC/BCC fields to the view.
     *
     * @param {Ext.Button}
     */
    onShowCcBccButtonClick : function(btn) {

        var me   = this,
            view = me.getView();

        view.showCcBccFields(view.down('#ccField').isHidden());
    },


    /**
     * @param {Ext.Button} btn
     */
    onSendButtonClick : function(btn) {
        Ext.raise({
            msg : "Not implemented yet."
        })
    },


    /**
     * Saves the current MessageDraft.
     *
     * @param {Ext.Button} btn
     */
    onSaveButtonClick : function(btn) {

        var me           = this,
            view         = me.getView(),
            vm           = view.getViewModel(),
            session      = view.getSession(),
            messageDraft = vm.get('messageDraft'),
            saveBatch    = session.getSaveBatch(),
            operations;

        if (saveBatch) {

            // set the date to the current client date
            // this might get likely converted to UTC on the backend
            // this update might not make it into the server request
            // since the savebatch was already generated. It is mandatory
            // to update the message items date whenever a change occurs in
            // // any association of the messageDraft.
            messageDraft.set('date', new Date());
            saveBatch.setPauseOnException(true);
            operations = saveBatch.getOperations();

            for (var i = 0, len = operations.length; i < len; i++) {
                if (operations[i].getAction() == 'create' &&
                    operations[i].entityType.entityName == 'DraftAttachment') {
                    // tbd
                }
            }

            saveBatch.on({
                exception : function(batch, operation) {
                    view.fireEvent('cn_mail-mailmessagesaveoperationexception', view, messageDraft, operation);
                },
                operationcomplete : function(batch, operation) {
                    view.fireEvent('cn_mail-mailmessagesaveoperationcomplete', view, messageDraft, operation);
                },
                complete : function(batch, operation) {
                    view.fireEvent('cn_mail-mailmessagesavecomplete', view, messageDraft, operation);
                },
                scope             : view,
                single            : true
            });

            view.fireEvent('cn_mail-mailmessagebeforesave', view, messageDraft);
            saveBatch.start();
        }
    },


    /**
     * Callback for a single operation's complete event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation
     */
    onMailMessageSaveOperationComplete : function(editor, messageDraft, operation) {

        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        me.setViewBusy(operation);
    },


    /**
     * Callback for a single operation's exception event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation
     */
    onMailMessageSaveOperationException : function(editor, messageDraft, operation) {
        // tbd return value is only for tests
        return false;
    },


    /**
     * Callback for a successfull processing of a complete batch.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *      * @param {Ext.data.operation.Operation} operation
     */
    onMailMessageSaveComplete : function(editor, messageDraft, operation) {

        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        me.setViewBusy(operation, 1);

        Ext.Function.defer(me.endBusyState, 750, me);
    },


    /**
     * Callback for this view's beforesave event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */
    onMailMessageBeforeSave : function(editor, messageDraft) {
        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        vm.set('isSaving', true);
        /**
         * @i18n
         */
        view.setBusy('Stand by...');
    },


    privates : {


        /**
         * Helper function to finish the busy state of the MailEditor.
         *
         * @param operation
         * @param progress
         *
         * @private
         */
        endBusyState : function() {
            var me   = this,
                view = me.getView(),
                vm   = view.getViewModel();

            vm.set('isSaving', false);
            view.setBusy(false);
        },


        /**
         * Helper function to update the view's busy state.
         *
         * @param operation
         * @param progress
         *
         * @private
         */
        setViewBusy : function(operation, progress) {

            var me   = this,
                view = me.getView();

            view.setBusy({
                /**
                 * @i18n
                 */
                msg : Ext.String.format("{1} {0}.",
                    operation.getAction() == 'destroy'
                        ? 'removed'
                        : 'saved',
                    operation.entityType.entityName
                ),
                progress : progress
            });
        }


    }
});