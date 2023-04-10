/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2019-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * The default MessageEditor for editing/creating messages. By default, this
 * view is configured with a {@link conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel}
 * and a {@link conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController}.
 * The view model takes care of initializing the needed {@link conjoon.cn_mail.model.mail.message.MessageDraft}
 * which will either be loaded into this view or created as a phantom for
 * initial saving.
 *
 *
 * editMode Context:
 * =================
 * When creating an instance of this class, the editMode will be determined by the
 * "messageDraft" configuration passed to teh constructor.
 * The editMode will default to any of conjoon.cn_mail.data.mail.message.EditingModes.
 *
 *
 * Session:
 * ==============
 * This view uses a MessageDraftSession with the {@link conjoon.cn_mail.data.mail.BaseSchema}
 * to be able to handle the associations of the used data models properly.
 * The constructor overrides any specified session by creating an individual
 * session of the type {@link conjoon.cn_mail.data.mail.message.session.MessageDraftSession} with a
 * {@link conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor} to make sure multiple
 * attachments are uploaded in single requests, and id-changes (coming from an IMAP server
 * are considered among loaded associations).
 *
 *
 * Note:
 * ==============
 * When extending this class, it is mandatory for the extended class to have
 * a {@link conjoon.cn_mail.view.mail.message.editor.AttachmentList} embedded.
 *
 *
 * Different initial model options:
 * ==================================
 * Instances of this class can be initially configured with various options for
 * the MessageDraft that should be used.
 * A "messageDraft" config must be available at any time, and can be any of the following:
 *
 *  - instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey:
 *  ------------------------------------------------------------------------------------
 *  Treated as the compound key of the MessageDraft to load. The Editor will then be in
 *  editMode "EDIT"
 *
 *  - instanceof conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig:
 *  --------------------------------------------------------------------------
 *  Treated as composing a new message with data defaulting to the data of the
 *  MessageDraftConfig. editMode will then be CREATE
 *
 *  - instanceof conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest:
 *  ------------------------------------------------------------------------------
 *  Treated as composing a new message, referencing the message as specified
 *  in the request. editMode will be any of FORWARD, REPLY_TO, REPLY_ALL
 *
 *
 * @see conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel
 */
Ext.define("conjoon.cn_mail.view.mail.message.editor.MessageEditor", {

    extend: "Ext.form.Panel",

    mixins: {
        deleteConfirmDialog: "conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog",
        loadingFailedDialog: "conjoon.cn_mail.view.mail.mixin.LoadingFailedDialog"
    },

    requires: [
        "coon.comp.component.LoadMask",
        "conjoon.cn_mail.view.mail.message.editor.AttachmentList",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel",
        "conjoon.cn_mail.view.mail.message.editor.HtmlEditor",
        "conjoon.cn_mail.view.mail.message.editor.AddressField",
        "conjoon.cn_mail.model.mail.message.EmailAddress",
        "conjoon.cn_mail.data.mail.message.session.MessageDraftSession",
        "coon.comp.component.MessageMask",
        "conjoon.cn_mail.data.mail.message.EditingModes",
        "conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest",
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
        "conjoon.cn_mail.view.mail.EmailAddressTip"
    ],

    alias: "widget.cn_mail-mailmessageeditor",

    controller: "cn_mail-mailmessageeditorviewcontroller",

    viewModel: "cn_mail-mailmessageeditorviewmodel",

    /**
     * @private
     */
    isCnMessageEditor: true,

    /**
     * Gets fired when a save of the MessageDraft was initiated and the associated
     * saveBatch is about to get processed.
     * This event is canceable. Return "false" in any attached listener to cancel
     * saving the message.
     * @event cn_mail-mailmessagebeforesave
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Boolean} isSending Whether the save process is part of an ongoing
     * send-process of the message.
     * @param {Boolean} isCreated Whether the draft was newly created. If false,
     * the draft was edited
     * send-process of the message.
     * @param {Boolean} isRetry Whether the save process was paused due to an
     * exception and is now being retried
     */

    /**
     * Gets fired when a save of the MessageDraft was initiated and a single
     * operation completes.
     * @event cn_mail-mailmessagesaveoperationcomplete
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation The operation that was
     * completed
     */

    /**
     * Gets fired when a save of the MessageDraft was initiated and a single
     * operation triggered an exception.
     * @event cn_mail-mailmessagesaveoperationexception
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation The operation that caused
     * the exception
     * @param {Boolean} isSending Whether the save process is part of an ongoing
     * send-process of the message.
     * @param {Boolean} isCreated Whether the draft was newly created. If false,
     * this draft is being edited.
     * @param {Ext.data.Batch} batch The save batch which can be resumed if it's
     * pauseOnException property was et to true
     */

    /**
     * Gets fired when a save of the MessageDraft was initiated and all individual
     * operations were processed successfully.
     * @event cn_mail-mailmessagesavecomplete
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation The last operation that
     * was processed.
     * @param {Boolean} isSending Whether the save process is part of an ongoing
     * send-process of the message.
     * @param {Boolean} isCreated Whether the draft was newly created
     */

    /**
     * Gets fired when a MessageDraft is about to get sent.
     * This event is canceable. Return "false" in any attached listener to cancel
     * sending the message.
     * @event cn_mail-mailmessagebeforesend
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */

    /**
     * Gets fired when a MessageDraft was successfully sent.
     * @event cn_mail-mailmessagesendcomplete
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */

    /**
     * Gets fired when sending a MessageDraft caused an exception.
     * @event cn_mail-mailmessagesendexception
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */

    /**
     * Gets fired when this editor has finished loading a draft. This can either
     * be an existing draft for editing or a copy loaded by the MessageDraftCopyRequest.
     * @event cn_mail-messagedraftload
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft}
     */

    layout: {
        type: "vbox",
        align: "stretch"
    },

    margin: "0 5 14 0",

    bodyPadding: "8 8 8 8",

    cls: "cn_mail-mailmessageeditor shadow-panel",

    /**
     * @i18n
     */
    title: "Loading...",

    iconCls: "fa fa-spin fa-spinner",

    bind: {
        closable: "{!isMessageBodyLoading && !isSaving && !isSending}",
        title: "{!isMessageBodyLoading ? getSubject : \"Loading...\"}",
        iconCls: "{getSubject && !isSaving && !isSending && !isMessageBodyLoading ? \"fa fa-edit\" : \"fa fa-spin fa-spinner\"}"
    },

    closable: false,

    buttonAlign: "right",

    /**
     * @private {String="CREATE"} editMode any of CREATE or EDIT
     * The editMode will be passed to the embedded
     * {@link conjoon.cn_mail.view.mail.message.AttachmentList}
     */
    editMode: "CREATE",

    /**
     * Mask to indicate that the oomponent's input is currently blocked due to
     * a user triggered save process
     * @private {coon.comp.component.LoadMask} busyMask
     * @see setBusy
     */
    busyMask: null,

    /**
     * @private
     * @see showMessageDraftLoadingNotice
     */
    loadingMask: null,

    /**
     * @param addressTip
     * @type {conjoon.cn_mail.view.mail.EmailAddressTip}
     * @private
     */

    dockedItems: [{
        xtype: "toolbar",
        dock: "bottom",
        items: [{
            xtype: "combobox",
            itemId: "accountCombo",
            flex: 1,
            cls: "accountCombo",
            matchFieldWidth: false,
            hideTrigger: true,
            editable: false,
            forceSelection: true,
            queryMode: "local",
            bind: {
                disabled: "{!isPhantom}",
                store: "{mailAccountStore}",
                value: "{messageDraft.mailAccountId}"
            },
            /**
             * @i18n
             */
            labelWidth: 50,
            fieldLabel: "Account",
            displayField: "name",
            valueField: "id",
            listConfig: {
                getInnerTpl: function () {
                    return "{from.name} &lt;{from.address}&gt;";
                }
            },
            displayTpl: "<tpl for=\".\">{name}</tpl>"
        }, "->",
        {
            xtype: "button",
            iconCls: "fa fa-envelope",
            cls: "seenButton",
            enableToggle: true,
            bind: {
                pressed: "{messageDraft.seen}"
            }
        }, {
            xtype: "button",
            iconCls: "fa fa-flag",
            cls: "flagButton",
            enableToggle: true,
            bind: {
                pressed: "{messageDraft.flagged}"
            }
        }, {
            width: 213,
            xtype: "displayfield",
            cls: "lastSavedDateField",
            bind: {
                value: "{lastSavedMessage}"
            }
        }, {
            scale: "small",
            text: "Save",
            width: 108,
            itemId: "saveButton"
        }, {
            scale: "small",
            text: "Send",
            itemId: "sendButton",
            width: 108
        }]
    }],

    items: [{
        xtype: "container",
        margin: "0 0 12 0",
        layout: "hbox",
        items: [{
            flex: 1,
            xtype: "cn_mail-mailmessageeditoraddressfield",
            emptyText: "To",
            itemId: "toField",
            bind: {
                value: "{getTo}",
                store: "{addressStore}"
            }
        }, {
            xtype: "button",
            itemId: "showCcBccButton",
            cls: "showCcBccButton",
            text: "CC / BCC",
            bind: {
                hidden: "{isCcOrBccValueSet}"
            }
        }]}, {
        xtype: "cn_mail-mailmessageeditoraddressfield",
        emptyText: "Cc",
        itemId: "ccField",
        addressType: "cc",
        bind: {
            hidden: {
                bindTo: "{!isCcOrBccValueSet}",
                single: true
            },
            value: "{getCc}",
            store: "{addressStore}"
        }
    }, {
        xtype: "cn_mail-mailmessageeditoraddressfield",
        emptyText: "Bcc",
        addressType: "bcc",
        itemId: "bccField",
        bind: {
            hidden: {
                bindTo: "{!isCcOrBccValueSet}",
                single: true
            },
            value: "{getBcc}",
            store: "{addressStore}"
        }
    }, {
        xtype: "textfield",
        emptyText: "Subject",
        cls: "subjectField",
        itemId: "subjectField",
        bind: {
            value: "{messageDraft.subject}"
        }
    }, {
        xtype: "container",
        flex: 1,
        margin: "12 0 0 0",
        layout: {
            type: "hbox",
            align: "stretch"
        },
        items: [{
            flex: 1,
            xtype: "cn_mail-mailmessageeditorhtmleditor",
            bind: {
                value: "{messageDraft.messageBody.textHtml}"
            }
        }, {
            xtype: "container",
            itemId: "attachmentListWrap",
            cls: "attachmentlist-wrap",
            layout: "fit",
            width: 230,
            margin: "0 0 0 10",
            items: [{
                xtype: "box",
                autoEl: {
                    tag: "div",
                    cls: "dropzone-text",
                    html: "Attach files by dragging and dropping them here."
                }
            }, {
                flex: 1,
                xtype: "cn_mail-mailmessageeditorattachmentlist",
                reference: "cn_mail_ref_mailmessageeditorattachmentlist",
                margin: "10 0 10 0",
                width: 228,
                scrollable: "y",
                bind: {
                    store: "{messageDraft.attachments}"
                }
            }]
        }]
    }],


    /**
     * @inheritdoc
     *
     * Overrides any specified session by creating an individual session of the
     * type coon.core.Session with a coon.core.session.BatchVisitor.
     *
     * @throws if config is empty, or if viewModel is being applied using the
     * config argument.
     */
    constructor: function (config) {

        var me           = this,
            EditingModes = conjoon.cn_mail.data.mail.message.EditingModes,
            messageDraft;


        if (!config || !config.messageDraft) {
            Ext.raise({
                source: Ext.getClassName(this),
                msg: "argument \"config\" and \"config.messageDraft\" must be set."
            });
        }

        messageDraft = config.messageDraft;

        if (config.viewModel) {
            Ext.raise({
                source: Ext.getClassName(this),
                msg: "Cannot set ViewModel for MessageEditor without overriding constructor."
            });
        }

        Ext.apply(config, {
            session: Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession"),
            viewModel: {
                type: "cn_mail-mailmessageeditorviewmodel",
                messageDraft: messageDraft
            }
        });

        me.editMode =  EditingModes.CREATE;

        if (messageDraft instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey) {
            me.editMode = EditingModes.EDIT;
        } else if (messageDraft instanceof conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest) {
            me.editMode = messageDraft.getEditMode();
        }

        delete config.messageDraft;

        this.callParent(arguments);
    },


    /**
     * @inheritdoc
     *
     * @throws if no {@link conjoon.cn_mail.view.mail.message.AttachmentList}
     * was found.
     */
    initComponent: function () {

        var me           = this,
            item         = null,
            EditingModes = conjoon.cn_mail.data.mail.message.EditingModes,
            modes        = [
                EditingModes.CREATE,
                EditingModes.REPLY_TO,
                EditingModes.REPLY_ALL,
                EditingModes.FORWARD
            ],
            query = function (items) {
                Ext.each(items, function (value) {
                    if (value.xtype === "cn_mail-mailmessageeditorattachmentlist") {
                        item = value;
                        return false;
                    }
                    if (value.items) {
                        return query(value.items);
                    }

                });
            };

        query(me.items);
        if (item) {
            item.editMode = modes.indexOf(me.editMode) !== -1
                ? EditingModes.CREATE
                : EditingModes.EDIT;
        } else {
            Ext.raise({
                sourceClass: Ext.getClassName(me),
                msg: "MessageEditor needs to have conjoon.cn_mail.view.mail.message.AttachmentList"
            });
        }

        me.callParent(arguments);
    },

    initTip () {

        const
            me = this;

        me.addressTip = Ext.create("conjoon.cn_mail.view.mail.EmailAddressTip", {
            target: me.el,
            delegate: "div.cn_mail-mailmessageeditoraddressfield li.x-tagfield-item div.x-tagfield-item-text",
            queryAddress (node) {

                const li = node.parentNode;
                const ul = li.parentNode;

                let addrIndex = -1;

                [].slice.call(ul.childNodes).some((child, index) => {
                    if (child === li) {
                        addrIndex = index;
                        return true;
                    }
                });

                const comps = {"#toField": "to", "#ccField": "cc", "#bccField": "bcc"};

                let type = null;
                Object.entries(comps).some(([comp, addrType]) => {
                    if (me.down(comp)?.el.contains(node)) {
                        type = addrType;
                        return true;
                    }
                });

                if (!type) {
                    return {name: node.firstChild.textContent, address: node.firstChild.textContent};
                }

                const
                    record = me.getViewModel().get("messageDraft"),
                    address = record.get(type);

                return (address.length && address[addrIndex]) ? address[addrIndex] : address;
            }
        });
    },


    /**
     * Shows the CC / BCC fields or hides them depending on the passed argument.
     *
     * @param {Boolean="true"} show True to show the CC and BCC field, false
     * to hide them.
     *
     * @return this
     */
    showCcBccFields: function (show) {
        var me   = this;

        show = show === undefined ? true : show;

        me.down("#ccField").setHidden(!show);
        me.down("#bccField").setHidden(!show);

        return this;
    },


    /**
     * Updates this editor's view to indicate that it is currently busy saving
     * data. The indicator is represented by a coon.comp.component.LoadMask.
     *
     * @param {Object|Boolean} conf false to hide any currently active
     * indicator, or an object containing properties to configure the texts to
     * show for the generated coon.comp.component.LoadMask
     *
     * @return this
     *
     * @see #busyMask
     *
     * @throws if conf is neither boolean nor an Object
     */
    setBusy: function (conf) {

        var me        = this,
            mask      = me.busyMask,
            hide      = conf === false,
            progress  = !hide ? conf.progress  : undefined,
            msg       = !hide ? conf.msg       : undefined,
            msgAction = !hide ? conf.msgAction : undefined;

        if (conf !== false && !Ext.isObject(conf)) {
            Ext.raise({
                conf: conf,
                cls: Ext.getClassName(me),
                msg: "Argument \"conf\" must either be boolean=false or an " +
                       "object suiting configuration options for " +
                       "coon.comp.component.LoadMask"
            });
        }

        if (hide && !mask) {
            return this;
        }

        if (!mask && !hide) {
            mask = Ext.create("coon.comp.component.LoadMask", {
                msg: msg,
                msgAction: msgAction,
                glyphCls: "fa fa-envelope",
                target: me
            });
            me.busyMask = mask;
        }

        if (hide) {
            mask.hide();
            return this;
        }

        mask.show();

        if (progress === undefined) {
            mask.loopProgress();
        }

        if (progress !== undefined) {
            mask.updateProgress(progress);
        }

        if (msgAction !== undefined) {
            mask.updateActionMsg(msgAction);
        }

        if (msg !== undefined) {
            mask.updateMsg(msg);
        }

        return this;
    },


    /**
     * Shows a notice that the MessageDraft being edited misses at least one
     * recipient. Will focus the toField afterwards and change the icon of
     * the editor to signal that user interaction is necessary.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */
    showAddressMissingNotice: function (messageDraft) {

        /**
         * @i18n
         */
        var me = this,
            myMask, iconCls;

        // notify any pending states here to flush so we can change the
        // view's state and be sure not to interfere with any vm setting
        me.getViewModel().notify();

        iconCls = me.getIconCls();

        myMask = Ext.create("coon.comp.component.MessageMask", {
            title: "Address Missing",
            message: "Could not send the message. Please specify one or more recipients.",
            target: me,
            buttons: coon.comp.component.MessageMask.OK,
            icon: coon.comp.component.MessageMask.ERROR,
            callback: function (btnAction) {
                var me = this;
                me.down("#toField").focus();
                me.setClosable(true);
                me.setIconCls(iconCls);
            },
            scope: me
        });

        me.setIconCls("fa fa-exclamation-circle");
        me.setClosable(false);

        myMask.show();
    },


    /**
     * Shows a notice that the Editor is about to be closed without saving.
     * Lets the user cancel the close-process.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */
    showConfirmCloseDialog () {
        "use strict";

        const me = this;

        /**
         * @i18n
         */
        let myMask, iconCls;

        // notify any pending states here to flush so we can change the
        // view's state and be sure not to interfere with any vm setting
        me.getViewModel().notify();

        iconCls = me.getIconCls();

        myMask = Ext.create("coon.comp.component.MessageMask", {
            title: "Close without saving",
            message: "Do you want to close the editor without saving your changes?",
            target: me,
            buttons: coon.comp.component.MessageMask.YESNO,
            icon: coon.comp.component.MessageMask.QUESTION,
            callback: function (btnAction) {
                const me = this;
                if (btnAction === "noButton") {
                    me.setClosable(true);
                    me.setIconCls(iconCls);
                    return;
                }
                me.suspendEvent("beforeclose");
                me.close();
                me.resumeEvent("beforeclose");

            },
            scope: me
        });

        me.setIconCls("fa fa-question-circle");
        me.setClosable(false);

        myMask.show();
    },


    /**
     * Shows a notice that the MessageDraft being edited misses a subject field.
     * The ui shows a textfield and a ok and cancel button using a
     * coon.comp.component.MessageMask. Clicking ok will add the specified
     * subject to the editor and reset the close- and icon-state, as clicking
     * "cancel" does, w/o setting a subject for the editor.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Function} An optional additional callback which gets called AFTER
     * the subject of the editor has been set to the specified value. The
     * callback gets called in the scope of the MessageEditor.
     */
    showSubjectMissingNotice: function (messageDraft, callback) {

        /**
         * @i18n
         */
        var me = this,
            myMask, iconCls;

        // notify any pending states here to flush so we can change the
        // view's state and be sure not to interfere with any vm setting
        me.getViewModel().notify();

        iconCls = me.getIconCls();

        myMask = Ext.create("coon.comp.component.MessageMask", {
            title: "Subject Missing",
            message: "If you wish, you can specify a subject here before leaving it empty.",
            target: me,
            buttons: coon.comp.component.MessageMask.OKCANCEL,
            icon: coon.comp.component.MessageMask.QUESTION,
            input: {emptyText: "Subject"},
            callback: function (btnAction, value) {
                var me = this;
                if (btnAction === "okButton") {
                    messageDraft.set("subject", value);
                }
                me.setClosable(true);
                me.setIconCls(iconCls);
                if (callback) {
                    callback.apply(me, [btnAction, value]);
                }
            },
            scope: me
        });

        me.setIconCls("fa fa-question-circle");
        me.setClosable(false);

        myMask.show();
    },


    /**
     * Shows a notice that the either an account is missing for the message being edited,
     * or this account's state is invalid.
     *
     * @return {coon.comp.component.MessageMask}
     */
    showAccountInvalidNotice (closeEditor = false) {

        closeEditor = !!closeEditor;

        const
            me = this,
            mask = Ext.create("coon.comp.component.MessageMask", {
                /**
                 * @i18n
                 */
                title: `Valid Mail Account missing ${closeEditor ? " - Cannot open Message" : ""}`,
                message: "Please make sure an active Mail Account is used for this message.",
                buttons: coon.comp.component.MessageMask.OK,
                target: me,
                callback: function (btnAction, value) {
                    mask.close();
                    if (closeEditor === true) {
                        me.close();
                    }
                },
                icon: coon.comp.component.MessageMask.ERROR,
                dialogStyle: true
            });

        mask.show();

        return mask;
    },


    /**
     * Shows a message that savin the current message failed.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation The operation that failed
     * @param {Function} callback Optional callback that gets called in the
     * scope of this view. Allows further user interaction by specifying logic
     * to handle the failed process
     */
    showMailMessageSaveFailedNotice: function (messageDraft, operation, callback) {
        /**
         * @i18n
         */
        var me = this,
            myMask, iconCls;

        // notify any pending states here to flush so we can change the
        // view's state and be sure not to interfere with any vm setting
        me.getViewModel().notify();

        iconCls = me.getIconCls();

        myMask = Ext.create("coon.comp.component.MessageMask", {
            title: "Saving Failed",
            message: "Saving the message failed. Do you want to retry to save the message?",
            target: me,
            buttons: coon.comp.component.MessageMask.YESNO,
            icon: coon.comp.component.MessageMask.QUESTION,
            callback: function (btnAction, value) {
                var me = this;
                me.setClosable(true);
                me.setIconCls(iconCls);

                if (callback) {
                    callback.apply(me, arguments);
                }
            },
            scope: me
        });

        me.setIconCls("fa fa-question-circle");
        me.setClosable(false);

        myMask.show();
    },


    /**
     * Creates a LoadMask to indicate that there is currently a message being
     * loaded.
     * The loadMask will be set to hidden and get destroyed as soon as the
     * ViewModels {isMessageBodyLoading} returns false. All references to
     * loadingMask will be cleared
     *
     * @ param {Boolean} isComposed True if the message draft is being composed
     * and if the load mask should indicate that the mail account and corresponding
     * folder and not available yet
     *
     * @private
     */
    showMessageDraftLoadingNotice: function (isComposed) {

        var me = this;

        me.loadingMask = Ext.create("Ext.LoadMask", {
            target: me,
            bind: {
                hidden: isComposed ?
                    "{isAccountAndFolderSet}" :
                    "{!isMessageBodyLoading}"
            },
            listeners: {
                hide: function (mask) {
                    var me = this;
                    me.loadingMask = null;
                    mask.destroy();
                },
                scope: this
            }
        });

        me.loadingMask.show();
    },


    /**
     * Returns the MessageDraft of this view's ViewModel.
     *
     * @returns {conjoon.cn_mail.model.mail.message.MessageDraft}
     */
    getMessageDraft: function () {
        return this.getViewModel().get("messageDraft");
    },


    /**
     * Delegates to this view's ViewModel and checks if any loading process
     * related to a draft is currently ongoing.
     *
     * @return  {Boolean}
     */
    isDraftLoading: function () {
        const me = this,
            vm = me.getViewModel();

        return !!(vm.get("isMessageBodyLoading") ||
               vm.hasPendingCopyRequest() ||
               vm.loadingDraft);
    },


    /**
     * Returns the loadingFailed-value of this view's ViewModel.
     *
     * @return {Boolean} if the requested draft for this editor could not be
     * loaded, otherwise false
     */
    hasLoadingFailed: function () {
        const me = this,
            vm = me.getViewModel();

        return vm.loadingFailed;
    },


    /**
     * Overrridden to make sure editor is closable again once loading failed.
     *
     * @inheritdoc
     */
    showLoadingFailedDialog: function () {

        const me = this;

        me.setClosable(true);

        me.mixins.loadingFailedDialog.showLoadingFailedDialog.call(me);
    }

});
