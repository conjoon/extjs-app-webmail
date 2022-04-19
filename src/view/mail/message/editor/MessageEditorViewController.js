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
 * The default ViewController for
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 *
 */
Ext.define("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {

    extend: "Ext.app.ViewController",

    requires: [
        // @define
        "l8",
        "coon.core.ConfigManager",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditorDragDropListener",
        "conjoon.cn_mail.data.mail.message.EditingModes",
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes",
        "conjoon.cn_mail.data.mail.service.MailboxService"
    ],

    alias: "controller.cn_mail-mailmessageeditorviewcontroller",

    control: {
        "cn_mail-mailmessageeditorhtmleditor > toolbar > cn_comp-formfieldfilebutton": {
            change: "onFormFileButtonChange"
        },

        "#showCcBccButton": {
            click: "onShowCcBccButtonClick"
        },

        "#sendButton": {
            click: "onSendButtonClick"
        },

        "#saveButton": {
            click: "onSaveButtonClick"
        },
        "cn_mail-mailmessageeditor": {
            "beforedestroy": "onMailMessageEditorBeforeDestroy",
            "cn_mail-mailmessagesaveoperationcomplete": "onMailMessageSaveOperationComplete",
            "cn_mail-mailmessagesaveoperationexception": "onMailMessageSaveOperationException",
            "cn_mail-mailmessagesavecomplete": "onMailMessageSaveComplete",
            "cn_mail-mailmessagebeforesave": "onMailMessageBeforeSave",
            "cn_mail-mailmessagebeforesend": "onMailMessageBeforeSend",
            "cn_mail-mailmessagesendcomplete": "onMailMessageSendComplete",
            "cn_mail-mailmessagesendexception": "onMailMessageSendException"
        }
    },

    /**
     * @private
     */
    deferTimers: null,

    /**
     * @private
     */
    ddListener: null,


    /**
     * @type {conjoon.cn_mail.data.mail.service.MailboxService}
     * @private
     */
    mailboxService: null,

    /**
     * Internal ms value for deferring call to close() after message was sent
     * @type {Number}
     * @private
     */
    closeAfterMs: 1000,

    /**
     * Makes sure
     * conjoon.cn_mail.view.mail.message.editor.MessageEditorDragDropListener#installDragDropListeners
     * is called as soon as the controller's
     * editor was rendered.
     */
    init: function () {

        var me   = this,
            view = me.getView();

        me.deferTimers = {};

        me.ddListener = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorDragDropListener", {
            view: view
        });

        view.on({
            "afterrender": {
                fn: me.onMessageEditorAfterrender,
                scope: me,
                single: true
            },
            /**
             * moved from control-config here since event and listener must be maiontained on
             * the view for later detaching if mail was sent, instead of maintaed by eventbus
             * of controller
             * @see conjoon/php-ms-imapuser#206
             */
            "beforeclose": {
                fn: me.onMailEditorBeforeClose,
                scope: me
            }
        });

        me.ddListener.init();
    },


    /**
     * Callback for the MessageEditor's afterrender event.
     * Will advise the view to show a loadmask if necessary.
     * @param editor
     */
    onMessageEditorAfterrender: function (editor) {

        var me   = this,
            view = me.getView(),
            toField, htmlEditor;

        view.showMessageDraftLoadingNotice(view.editMode === "CREATE");

        if (view.editMode === conjoon.cn_mail.data.mail.message.EditingModes.FORWARD) {
            toField = view.down("#toField");
            me.deferTimers["toFieldFocus"] = Ext.Function.defer(
                toField.focus, 100, toField);
        } else {
            htmlEditor = view.down("cn_mail-mailmessageeditorhtmleditor");
            me.deferTimers["htmlEditorFocus"] = Ext.Function.defer(
                htmlEditor.focus, 100, htmlEditor);

        }

    },


    /**
     * Callback for the "beforeclose"-event of the MessageEditor.
     * Routes to the cn_href of the editor and calls {conjoon.cn_mail.view.mail.message.editor.MessageEditor#showConfirmCloseDialog}
     * afterwards, only if the MessageDraft of the ViewModel is found to be dirty.
     *
     * @return {Boolean=false} returns false to prevent closing the dialog
     *
     * @see {conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel#isDraftDirty}
     */
    onMailEditorBeforeClose () {

        const
            me = this,
            vm = me.getViewModel(),
            editor = me.getView();

        if (!editor.getMessageDraft() ||
            !vm.isDraftDirty()
        ) {
            return true;
        }

        me.redirectTo(editor.cn_href);
        editor.showConfirmCloseDialog();

        return false;
    },


    /**
     * Callback for the MailMessageEditor's destroy event. Clears the defer timers.
     *
     */
    onMailMessageEditorBeforeDestroy: function () {
        var me   = this,
            view = me.getView();

        for (var i in me.deferTimers) {
            if (!Object.prototype.hasOwnProperty.call(me.deferTimers, i)) {
                continue;
            }

            window.clearTimeout(me.deferTimers[i]);
            delete me.deferTimers[i];
        }

        if (view.busyMask) {
            view.busyMask.destroy();
            view.busyMask = null;
        }

        if (view.loadingMask) {
            view.loadingMask.destroy();
            view.loadingMask = null;
        }

        if (me.ddListener) {
            me.ddListener.destroy();
            me.ddListener = null;
        }

    },


    /**
     * Adds the files available in fileList to the editor#s attachmentList.
     *
     * @param {FileList} fileList
     *
     * @private
     */
    addAttachmentsFromFileList: function (fileList) {
        var me             = this,
            view           = me.getView(),
            attachmentList = view.down("cn_mail-mailmessageeditorattachmentlist");

        for (var i = 0, len = fileList.length; i < len; i++) {
            attachmentList.addAttachment(fileList[i]);
        }
    },


    /**
     * Callback for the change event of this view's {@link coon.comp.form.FileButton}.
     *
     * @param {coon.comp.form.FileButton} fileButton
     * @param {Ext.event.Event} evt
     * @param {String} value
     * @param {FileList} fileList
     *
     * @see conjoon.cn_mail.view.mail.message.editor.AttachmentList#addAttachment
     */
    onFormFileButtonChange: function (fileButton, evt, value, fileList) {
        var me = this;
        me.addAttachmentsFromFileList(fileList);
    },


    /**
     * Delegates showing the CC/BCC fields to the view.
     *
     * @param {Ext.Button}
     */
    onShowCcBccButtonClick: function (btn) {

        var me   = this,
            view = me.getView();

        view.showCcBccFields(view.down("#ccField").isHidden());
    },


    /**
     * @param {Ext.Button} btn
     */
    onSendButtonClick: function (btn) {

        var me = this;

        me.configureAndStartSaveBatch(true);
    },


    /**
     * Saves the current MessageDraft.
     *
     * @param {Ext.Button} btn
     */
    onSaveButtonClick: function (btn) {
        var me = this;
        me.configureAndStartSaveBatch();
    },


    /**
     * Callback for a single operation's complete event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation
     */
    onMailMessageSaveOperationComplete: function (editor, messageDraft, operation) {

        var me = this;

        me.setViewBusy(operation);
    },


    /**
     * Callback for a single operation's exception event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation
     * @param {Boolean} isSending
     * @param {Boolean} isCreated
     * @param {Ext.data.Batch} batch
     */
    onMailMessageSaveOperationException: function (editor, messageDraft, operation, isSending, isCreated, batch) {

        var me   = this,
            view = me.getView();

        me.endBusyState("saving");

        view.showMailMessageSaveFailedNotice(messageDraft, operation, Ext.Function.bindCallback(
            function (isSending, isCreated, batch, buttonId) {
                var me   = this,
                    view = me.getView();


                if (buttonId !== "yesButton" ||
                    view.fireEvent("cn_mail-mailmessagebeforesave", view, messageDraft, isSending, isCreated, true) === false) {

                    if (buttonId !== "yesButton") {
                        // reset attachment store if the operation should not be retried.
                        // This means that even in the case of a failed message(body) operation,
                        // the attachment list's store gets reset to its last known state
                        view.getViewModel().get("messageDraft.attachments").rejectChanges();
                    }

                    // mailmessagessagebeforesave listener called which sets the
                    // busy state again - cancel it here.
                    // a better way would we to have a "start" event in the
                    // Ext.data.Batch class which gets fired upon start/retry.
                    me.endBusyState("saving");
                    return;
                }

                batch.retry();
            },
            me,
            [isSending, isCreated, batch]
        ));
        return false;

    },


    /**
     * Callback for a successfull processing of a complete batch.
     * Will trigger #sendMessage as soon as the operation completes.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation
     * @param {Boolean} isSending
     * @param {Boolean} isCreated
     */
    onMailMessageSaveComplete: function (editor, messageDraft, operation, isSending, isCreated) {

        var me = this;

        me.setViewBusy(operation, 1);

        if (isSending !== true) {
            me.deferTimers["savecomplete"] = Ext.Function.defer(
                me.endBusyState, 750, me, ["saving"]);
        } else {
            me.deferTimers["savecompletesend"] = Ext.Function.defer(function () {
                var me = this;
                me.endBusyState("saving");
                me.sendMessage();
            }, 750, me);
        }

    },


    /**
     * Callback for this view's beforesave event.
     * If the viewModel's isSubjectRequired is set to true and the subject is
     * empty, the saveing process will be cancelled and the user is prompted
     * for a subject. If it's still empty, isSubjectRequired will be set to false
     * and the process will be triggered again. The controller will not ask for a
     * subject then.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Boolean} true if the event is part of a "send" process, i.e. the
     * message is currently being saved before it gets send.
     * @param {Boolean} isCreated Whether the message draft was newly created
     *
     * @throws if the mailFolderId for the messagedraft is missing
     */
    onMailMessageBeforeSave: function (editor, messageDraft, isSending, isCreated) {
        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        if (!messageDraft.get("mailFolderId") || !messageDraft.get("mailAccountId")) {
            Ext.raise({
                msg: "compound key for message draft missing",
                mailAccountId: messageDraft.get("mailAccountId"),
                mailFolderId: messageDraft.get("mailFolderId")
            });
            return false;
        }

        if (!Ext.String.trim(messageDraft.get("subject")) &&
            vm.get("isSubjectRequired") === true) {
            view.showSubjectMissingNotice(messageDraft, Ext.Function.bindCallback(
                function (isSending, isCreated, viewModel, buttonId, value) {
                    var me = this;

                    if (buttonId !== "okButton") {
                        return;
                    }

                    if (!Ext.String.trim(value)) {
                        viewModel.set("isSubjectRequired", false);
                    }

                    me.configureAndStartSaveBatch(isSending, isCreated);
                },
                me,
                [isSending, isCreated, vm]
            ));
            return false;
        }

        // silently commits attachments where the messageItemId foreign key was
        // changed previously
        let attachments = vm.get("messageDraft.attachments").getRange(),
            attachment, keys;

        for (let a = attachments.length - 1; a >= 0; a--) {
            attachment = attachments[a];
            keys = attachment.modified ? Object.keys(attachment.modified) : null;
            if (attachment.crudState === "U" && keys && keys.length === 1 && keys[0] === "messageItemId") {
                // commit silently
                attachment.commit(true);

            }
        }


        vm.set("isSaving", true);

        /**
         * @i18n
         */
        view.setBusy({msg: "Saving Mail", msgAction: "Stand by..."});
    },


    /**
     * Callback for the view's beforesend event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {Boolean} false if the message could not validated and sending it
     * should be cancelled
     */
    onMailMessageBeforeSend: function (editor, messageDraft) {
        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        if (!messageDraft.get("to").length &&
            !messageDraft.get("cc").length &&
            !messageDraft.get("bcc").length) {

            view.showAddressMissingNotice(messageDraft);
            return false;
        }

        vm.set("isSending", true);

        /**
         * @i18n
         */
        view.setBusy({msg: "Sending Mail", msgAction: "Please wait..."});
    },


    /**
     * Callback for the view's sendcomplete event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */
    onMailMessageSendComplete (editor, messageDraft) {
        const
            me   = this,
            view = me.getView();

        /**
         * @i18n
         */
        view.setBusy({msgAction: "Message sent successfully.", progress: 1});

        /**
         * @see conjoon/extjs-app-webmail#206
         */
        view.un("beforeclose", me.onMailEditorBeforeClose, me);
        me.deferTimers.sendcomplete = Ext.Function.defer(
            view.close,
            me.closeAfterMs,
            view
        );
    },

    /**
     * Callback for the view's sendexception event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */
    onMailMessageSendException: function (editor, messageDraft) {
        var me   = this,
            view = me.getView(),
            vm   = view.getViewModel();

        vm.set("isSending", false);

        /**
         * @i18n
         */
        view.setBusy({msgAction: "Error :(", progress: 1});
        me.deferTimers["sendexception"] = Ext.Function.defer(
            me.endBusyState, 750, me, ["sending"]);
    },


    privates: {


        /**
         * Returns a configuration object to pass to the request being send to the server
         * for sending a MessageDraft.
         *
         * @param {!conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
         * @param {!String} baseAddress The base address that should be used for the SendMessage-endpoint
         *
         * @returns {Object}
         *
         * @throws if baseAddress is undefined or null
         */
        getSendMessageDraftRequestConfig: function (messageDraft, baseAddress) {

            if (!l8.isString(baseAddress)) {
                throw("\"baseAddress\" must be a string");
            }

            return {
                url: l8.unify(baseAddress + "/SendMessage", "/", "://"),
                params: messageDraft.getCompoundKey().toObject()
            };

        },


        /**
         * Sends the current MessageDraft and fires the events
         * cn_mail-mailmessagebeforesend and cn_mail-mailmessagesendcomplete (or
         * cn_mail-mailmessagesendexception if the send-process was not successfull).
         * This method is part of a callback that gets called by onMailMessageSaveComplete,
         * if the save process was part of a request to send teh MessageDraft.
         *
         * Returns {Boolean} true if sending the message was delegated to the backend,
         * false if the cn_mail-mailmessagebeforesend event cancelled the process.
         *
         * @private
         */
        sendMessage: function () {

            "use strict";

            const
                me           = this,
                view         = me.getView(),
                vm           = view.getViewModel(),
                messageDraft = vm.get("messageDraft");

            if (messageDraft.dirty || messageDraft.phantom) {
                Ext.raise({
                    msg: "Cannot send MessageDraft: Needs to get saved before.",
                    cls: Ext.getClassName(me)
                });
            }

            if (view.fireEvent("cn_mail-mailmessagebeforesend", view, messageDraft) === false) {
                return false;
            }

            const baseAddress  = coon.core.ConfigManager.get("extjs-app-webmail", "service.rest-api-email.base");

            Ext.Ajax.request(me.getSendMessageDraftRequestConfig(messageDraft, baseAddress)).then(
                function (response, opts) {
                    view.fireEvent("cn_mail-mailmessagesendcomplete", view, messageDraft);
                },
                function (response, opts) {
                    view.fireEvent("cn_mail-mailmessagesendexception", view, messageDraft);

                }
            );
        },


        /**
         * Configures and starts the save batch of the session of the MessageEditor.
         *
         * @param {Boolean} isSend true to indicate that this operation requested
         * is a "send" operation of the MessageDraft. This will additionally trigger
         * the send-process once the draft was successfully saved.
         *
         * @private
         */
        configureAndStartSaveBatch: function (isSend) {

            var me           = this,
                view         = me.getView(),
                vm           = view.getViewModel(),
                session      = view.getSession(),
                messageDraft = vm.get("messageDraft"),
                isCreated    = messageDraft.phantom === true,
                saveBatch;

            me.applyAccountInformation(messageDraft);

            if (view.fireEvent("cn_mail-mailmessagebeforesave", view, messageDraft, isSend === true, isCreated === true) === false) {
                return false;
            }

            saveBatch = session.getSaveBatch();
            saveBatch.setPauseOnException(true);

            saveBatch.on({
                operationcomplete: {
                    fn: function (batch, operation) {
                        view.fireEvent("cn_mail-mailmessagesaveoperationcomplete",
                            view, messageDraft, operation);
                    },
                    scope: view
                },
                exception: {
                    fn: function (batch, operation) {
                        //  view.down("cn_mail-mailmessageeditorattachmentlist").getStore().rejectChanges();
                        view.fireEvent("cn_mail-mailmessagesaveoperationexception",
                            view, messageDraft, operation, isSend === true, isCreated === true, batch);
                    },
                    scope: view
                },
                complete: {
                    fn: function (batch, operation) {

                        messageDraft.set("savedAt", new Date());
                        view.fireEvent(
                            "cn_mail-mailmessagesavecomplete",
                            view, messageDraft,
                            operation,
                            isSend === true,
                            isCreated === true
                        );

                    },
                    scope: view,
                    single: true
                }
            });

            saveBatch.start();
        },


        /**
         * Helper method to apply additional information to the MessageDraft
         * right before saving.
         *
         * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
         *
         * @private
         */
        applyAccountInformation: function (messageDraft) {

            const me             = this,
                view           = me.getView(),
                vm             = view.getViewModel(),
                mailboxService = me.getMailboxService(),
                mailAccountId  = messageDraft.get("mailAccountId");

            if (!messageDraft.get("mailFolderId")) {
                let mailFolderId = mailboxService.getMailFolderHelper().getMailFolderIdForType(
                    mailAccountId,  conjoon.cn_mail.data.mail.folder.MailFolderTypes.DRAFT
                );

                if (!mailFolderId) {
                    Ext.raise({
                        msg: "Unexpected error: No draft folder for mailAccountId found",
                        mailAccountId: mailAccountId
                    });
                }

                messageDraft.set("mailFolderId", mailFolderId);
            }


            let accRecord = vm.get("cn_mail_mailfoldertreestore").findRecord(
                "id", mailAccountId
            );

            messageDraft.set("from", {
                name: accRecord.get("from").name,
                address: accRecord.get("from").address
            });

            messageDraft.set("replyTo", {
                name: accRecord.get("replyTo").name,
                address: accRecord.get("replyTo").address
            });

            // will trigger a save in the case the date value changes.
            messageDraft.set("date", new Date());
        },


        /**
         * Returns the MailboxService for the cn_mail_mailfoldertreestore which
         * is part of this view's viewModel.
         *
         * @return {conjoon.cn_mail.data.mail.service.MailboxService}
         */
        getMailboxService: function () {

            const me = this;

            if (!me.mailboxService) {
                me.mailboxService = conjoon.cn_mail.MailboxService.getInstance();
            }

            return me.mailboxService;
        },


        /**
         * Helper function to finish the busy state of the MailEditor.
         *
         * @param {String} type The type of the busy-operation, i.e. 'sending'
         * or 'saving'
         *
         * @private
         *
         * @throws if type doe snot equal to 'sending' or 'saving'
         */
        endBusyState: function (type) {

            var me   = this,
                view = me.getView(),
                vm   = view.getViewModel();

            switch (type) {
            case "sending":
                vm.set("isSending", false);
                break;
            case "saving":
                vm.set("isSaving", false);
                break;
            default:
                Ext.raise({
                    msg: "Unknown busy type.",
                    type: type,
                    cls: Ext.getClassName(me)
                });
            }

            view.setBusy(false);
        },


        /**
         * Helper function to update the view's busy state.
         *
         * @param {Ext.data.operatin.Operation} operation
         * @param {Number} progress
         *
         * @private
         */
        setViewBusy: function (operation, progress) {

            var me   = this,
                view = me.getView();

            view.setBusy({
                /**
                 * @i18n
                 */
                msgAction: Ext.String.format("{1} {0}.",
                    operation.getAction() === "destroy"
                        ? "removed"
                        : "saved",
                    operation.entityType.entityName
                ),
                progress: progress
            });
        }


    }
});
