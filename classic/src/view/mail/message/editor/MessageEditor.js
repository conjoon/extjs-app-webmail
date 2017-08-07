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
 * When creating an instance of this class, the editMode should be specified
 * based upon the context the editor is opened with. The editMode can either
 * be "CREATE" or "EDIT". Note: the editMode is only important for the initial
 * firing up of this view. Once a phantom messageDraft gets saved and has a physical
 * id, it is not needed to change the editMode from "CREATE" to "EDIT".
 *
 *
 * Session:
 * ==============
 * This view uses a session with the {@link conjoon.cn_mail.data.mail.BaseSchema}
 * to be able to handle the associations of the used data models properly.
 * The constructor overrides any specified session by creating an individual
 * session of the type {@link conjoon.cn_core.Session} with a
 * {@link conjoon.cn_core.session.SplitBatchVisitor} to make sure multiple
 * attachments are uploaded in single requests.
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
 * By specifying no options at all, an empty MessageDraft is created which gets
 * saved as a completely new Message.
 *
 *  @example
 *     // MessageEditor will be created with an empty MessageDraft.
 *     // editMode will be set to "CREATE", regardless of any editMode configuration
 *     // passed to the constructor
 *     Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditor');

 *
 * By specifying the configuration option "messageConfig", you can configure the
 * MessageDraft as follows:
 *  - none: MessageDraft will be created completely from scratch
 *  - {to: 'nam@domain.tld'} MessageDraft will be created completely from scratch,
 *  but the 'to'-address field will be set to the value of the to property
 *  - {id : [string]} The MessageDraft with the specified id will be loaded from
 *  the server, and the form fields will be set to the returned data accordingly.
 *
 *     @example
 *     // MessageEditor will be created and the MessageDraft with the specified
 *     // id "3" will be requested from the backend, editMode will be set to "EDIT",
 *     // regardless of any editMode configuration passed to the constructor
 *     Ext.create('conjoon.cn_mail.view.mail.message.MessageEditor', {
 *          messageConfig : {
 *             id   : '3'
 *          }
 *     });
 *
 *     // MessageEditor will be created with a phantom MessageDraft, and it's
 *     // to-Address will be initial set to 'name@domain.tld'
 *     // editMode will be set to CREATE
 *     Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
 *          messageConfig : {
 *              // the to property can be configured according to the specs
 *              // of conjoon.cn_mail.model.mail.message.EmailAddress or
 *              // conjoon.cn_core.data.field.EmailAddressCollection
 *              to : 'name@domain.tld'
 *          }
 *     });
 *
 * @see conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.MessageEditor', {

    extend : 'Ext.form.Panel',

    requires : [
        'conjoon.cn_comp.component.LoadMask',
        'conjoon.cn_mail.view.mail.message.editor.AttachmentList',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel',
        'conjoon.cn_mail.view.mail.message.editor.HtmlEditor',
        'conjoon.cn_mail.view.mail.message.editor.AddressField',
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
        'conjoon.cn_mail.model.mail.message.EmailAddress',
        'conjoon.cn_mail.data.mail.BaseSchema',
        'conjoon.cn_core.data.Session',
        'conjoon.cn_core.data.session.SplitBatchVisitor',
        'conjoon.cn_comp.component.MessageMask'
    ],

    alias : 'widget.cn_mail-mailmessageeditor',

    statics : {
        /**
         * @type {String} MODE_EDIT
         */
        MODE_EDIT : 'EDIT',

        /**
         * @type {String} MODE_CREATE
         */
        MODE_CREATE : 'CREATE'
    },

    controller : 'cn_mail-mailmessageeditorviewcontroller',

    viewModel : 'cn_mail-mailmessageeditorviewmodel',

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
     * @param {Ext.data.Batch} batch The save batch which can be resumed if it's
     * pauseOnEXception property was et to true
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
     * Gets fired when sending a MessageDraft caused an exxception.
     * @event cn_mail-mailmessagesendexception
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     */

    layout : {
        type  : 'vbox',
        align : 'stretch'
    },

    margin : '0 5 14 0',

    bodyPadding : '8 8 8 8',

    cls    : 'cn_mail-mailmessageeditor shadow-panel',

    /**
     * @i18n
     */
    title : 'Loading...',

    iconCls : "fa fa-spin fa-spinner",

    bind : {
        closable : '{isSaving || isSending ? false : true}',
        title    : '{getSubject}',
        iconCls  : '{getSubject && !isSaving && !isSending ? "fa fa-edit" : "fa fa-spin fa-spinner"}'
    },

    closable : true,

    buttonAlign : 'right',

    /**
     * @private {String="CREATE"} editMode any of CREATE or EDIT
     * The editMode will be passed to the embedded
     * {@link conjoon.cn_mail.view.mail.message.AttachmentList}
     */
    editMode : 'CREATE',

    /**
     * Mask to indicate that the oomponent's input is currently blocked due to
     * a user triggered save process
     * @private {conjoon.cn_comp.component.LoadMask} busyMask
     * @see setBusy
     */
    busyMask : null,

    buttons : [{
        text   : 'Save',
        width  : 108,
        itemId : 'saveButton'
    }, {
        text   : 'Send',
        itemId : 'sendButton',
        width  : 108
    }],

    items : [{
        xtype  : 'container',
        margin : '0 0 12 0',
        layout : 'hbox',
        items : [{
            flex      : 1,
            xtype     : 'cn_mail-mailmessageeditoraddressfield',
            emptyText : 'To',
            itemId    : 'toField',
            bind : {
                value : '{getTo}',
                store : '{addressStore}'
            }
        }, {
            xtype  : 'button',
            itemId : 'showCcBccButton',
            cls    : 'showCcBccButton',
            text   : 'CC / BCC',
            ui     : 'button-lightest-color',
            bind   : {
                hidden : '{isCcOrBccValueSet}'
            }
        }]}, {
        xtype       : 'cn_mail-mailmessageeditoraddressfield',
        emptyText   : 'Cc',
        itemId      : 'ccField',
        addressType : 'cc',
        bind        : {
            hidden : {
                bindTo : '{!isCcOrBccValueSet}',
                single : true
            },
            value : '{getCc}',
            store : '{addressStore}'
        }
    }, {
        xtype       : 'cn_mail-mailmessageeditoraddressfield',
        emptyText   : 'Bcc',
        addressType : 'bcc',
        itemId      : 'bccField',
        bind        : {
            hidden : {
                bindTo : '{!isCcOrBccValueSet}',
                single : true
            },
            value : '{getBcc}',
            store : '{addressStore}'
        }
    }, {
        xtype      : 'textfield',
        emptyText  : 'Subject',
        cls        : 'subjectField',
        itemId     : 'subjectField',
        bind       : {
            value : '{messageDraft.subject}'
        }
    }, {
        xtype  : 'container',
        flex   : 1,
        margin : '12 0 0 0',
        layout : {
            type : 'hbox',
            align : 'stretch'
        },
        items : [{
            flex  : 1,
            xtype : 'cn_mail-mailmessageeditorhtmleditor',
            bind  : {
                value : '{messageDraft.messageBody.textHtml}'
            }
        }, {
            xtype      : 'container',
            itemId     : 'attachmentListWrap',
            cls        : 'attachmentlist-wrap',
            layout     : 'fit',
            width      : 230,
            margin     : '0 0 0 10',
            items      : [{
                xtype  : 'box',
                autoEl : {
                    tag  : 'div',
                    cls  : 'dropzone-text',
                    html : 'Attach files by dragging and dropping them here.'
                }
            }, {
                flex : 1,
                xtype      : 'cn_mail-mailmessageeditorattachmentlist',
                reference  : 'cn_mail_ref_mailmessageeditorattachmentlist',
                margin     : '10 0 10 0',
                width      : 228,
                scrollable : 'y',
                bind       : {
                    store  : '{messageDraft.attachments}'
                }
            }]
        }]
    }],


    /**
     * @inheritdoc
     *
     * Overrides any specified session by creating an individual session of the
     * type conjoon.cn_core.Session with a conjoon.cn_core.session.BatchVisitor.
     *
     * @throws if both viewModel and messageConfig want to be configured when
     * creating an instance of this class, or if editMode was not specified.
     */
    constructor : function(config) {

        var me         = this,
            draftConfig = {
                type   : 'MessageDraft'
            },
            messageDraft;

        if ([me.statics().MODE_EDIT, me.statics().MODE_CREATE].indexOf(config.editMode) === -1) {
            Ext.raise({
                editMode : config.editMode,
                msg      : "\"editMode\" is invalid"
            });
        }

        config.session = Ext.create('conjoon.cn_core.data.Session', {
            schema                : 'cn_mail-mailbaseschema',
            batchVisitorClassName : 'conjoon.cn_core.data.session.SplitBatchVisitor'
        });

        if (config.messageDraft && config.viewModel) {
            Ext.raise({
                source : Ext.getClassName(this),
                msg    : 'Can only set messageConfig or viewModel, not both.'
            })
        }

        messageDraft = config.messageDraft;

        switch (config.editMode) {

            case me.statics().MODE_CREATE:
                messageDraft       = config.messageDraft;
                draftConfig.create = messageDraft instanceof conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig
                    ? messageDraft.toObject()
                    : true;
                break;

            case me.statics().MODE_EDIT:
                messageDraft = config.messageDraft;
                if (!messageDraft || Ext.isObject(messageDraft)) {
                    Ext.raise({
                        messageDraft : messageDraft,
                        editMode     : config.editMode,
                        msg          : "unexpected value for \"messageDraft\""
                    });
                }
                draftConfig.id = messageDraft;
                break;

            default:
                Ext.raise({
                    editMode     : config.editMode,
                    messageDraft : messageDraft,
                    msg          : "unexpected value for \"messageDraft\""
                });
        }

        config.viewModel = {
            type  : 'cn_mail-mailmessageeditorviewmodel',
            links : {
                messageDraft : draftConfig
            }
        };



        delete config.messageDraft;

        this.callParent(arguments);
    },


    /**
     * @inheritdoc
     *
     * @throws if no {@link conjoon.cn_mail.view.mail.message.AttachmentList}
     * was found.
     */
    initComponent : function() {

        var me    = this,
            item  = null,
            query = function(items) {
                Ext.each(items, function(value) {
                    if (value.xtype == 'cn_mail-mailmessageeditorattachmentlist') {
                        item = value;
                        return false;
                    }
                    if (value.items) {
                        return query(value.items);
                    }

                })
            };

        query(me.items);
        if (item) {
            item.editMode = me.editMode;
        } else {
            Ext.raise({
                sourceClass : Ext.getClassName(me),
                msg         : "MessageEditor needs to have conjoon.cn_mail.view.mail.message.AttachmentList"
            });
        }

        me.callParent(arguments);
    },


    /**
     * Shows the CC / BCC fields or hides them depending on the passed argument.
     *
     * @param {Boolean="true"} show True to show the CC and BCC field, false
     * to hide them.
     *
     * @return this
     */
    showCcBccFields : function(show) {
        var me   = this,
            show = show === undefined ? true : show;

        me.down('#ccField').setHidden(!show);
        me.down('#bccField').setHidden(!show);

        return this;
    },


    /**
     * Updates this editor's view to indicate that it is currently busy saving
     * data. The indicator is represented by a conjoon.cn_comp.component.LoadMask.
     *
     * @param {Object|Boolean} conf false to hide any currently active
     * indicator, or an object containing properties to configure the texts to
     * show for the generated conjoon.cn_comp.component.LoadMask
     *
     * @return this
     *
     * @see #busyMask
     *
     * @throws if conf is neither boolean nor an Object
     */
    setBusy : function(conf) {

        var me        = this,
            mask      = me.busyMask,
            hide      = conf === false,
            progress  = !hide ? conf.progress  : undefined,
            msg       = !hide ? conf.msg       : undefined,
            msgAction = !hide ? conf.msgAction : undefined;

        if (conf !== false && !Ext.isObject(conf)) {
            Ext.raise({
                conf : conf,
                cls  : Ext.getClassName(me),
                msg  : 'Argument "conf" must either be boolean=false or an ' +
                       'object suiting configuration options for ' +
                       'conjoon.cn_comp.component.LoadMask'
            });
        }

        if (hide && !mask) {
            return this;
        }

        if (!mask && !hide) {
            mask = Ext.create('conjoon.cn_comp.component.LoadMask', {
                msg       : msg,
                msgAction : msgAction,
                glyphCls  : 'fa fa-envelope',
                target    : me
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
    showAddressMissingNotice : function(messageDraft) {

        /**
         * @i18n
         */
        var me = this,
            myMask, iconCls;

        // notify any pending states here to flush so we can change the
        // view's state and be sure not to interfere with any vm setting
        me.getViewModel().notify();

        iconCls = me.getIconCls();

        myMask = Ext.create('conjoon.cn_comp.component.MessageMask', {
            title    : "Address Missing",
            message  : "Could not send the message. Please specify one or more recipients.",
            target   : me,
            buttons  : conjoon.cn_comp.component.MessageMask.OK,
            icon     : conjoon.cn_comp.component.MessageMask.ERROR,
            callback : function(btnAction) {
                var me = this;
                me.down('#toField').focus();
                me.setClosable(true);
                me.setIconCls(iconCls);
            },
            scope : me
        });

        me.setIconCls('fa fa-exclamation-circle');
        me.setClosable(false);

        myMask.show();
    },


    /**
     * Shows a notice that the MessageDraft being edited misses a subject field.
     * The ui shows a textfield and a ok and cancel button using a
     * conjoon.cn_comp.component.MessageMask. Clicking ok will add the specified
     * subject to the editor and reset the close- and icon-state, as clicking
     * "cancel" does, w/o setting a subject for the editor.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Function} An optional additional callback which gets called AFTER
     * the subject of the editor has been set to the specified value. The
     * callback gets called in the scope of the MessageEditor.
     */
    showSubjectMissingNotice : function(messageDraft, callback) {

        /**
         * @i18n
         */
        var me        = this,
            viewModel = me.getViewModel(),
            myMask, iconCls;

        // notify any pending states here to flush so we can change the
        // view's state and be sure not to interfere with any vm setting
        me.getViewModel().notify();

        iconCls = me.getIconCls();

        myMask = Ext.create('conjoon.cn_comp.component.MessageMask', {
            title    : "Subject Missing",
            message  : "If you wish, you can specify a subject here before leaving it empty.",
            target   : me,
            buttons  : conjoon.cn_comp.component.MessageMask.OKCANCEL,
            icon     : conjoon.cn_comp.component.MessageMask.QUESTION,
            input    : {emptyText : 'Subject'},
            callback : function(btnAction, value) {
                var me = this;
                if (btnAction == 'okButton') {
                    messageDraft.set('subject', value);
                }
                me.setClosable(true);
                me.setIconCls(iconCls);
                if (callback) {
                    callback.apply(me, [btnAction, value]);
                }
            },
            scope : me
        });

        me.setIconCls('fa fa-question-circle');
        me.setClosable(false);

        myMask.show();
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
    showMailMessageSaveFailedNotice : function(messageDraft, operation, callback) {
        /**
         * @i18n
         */
        var me        = this,
            viewModel = me.getViewModel(),
            myMask, iconCls;

        // notify any pending states here to flush so we can change the
        // view's state and be sure not to interfere with any vm setting
        me.getViewModel().notify();

        iconCls = me.getIconCls();

        myMask = Ext.create('conjoon.cn_comp.component.MessageMask', {
            title    : "Saving Failed",
            message  : "Saving the message failed. Do you want to retry to save the message?",
            target   : me,
            buttons  : conjoon.cn_comp.component.MessageMask.YESNO,
            icon     : conjoon.cn_comp.component.MessageMask.QUESTION,
            callback : function(btnAction, value) {
                var me = this;
                    me.setClosable(true);
                    me.setIconCls(iconCls);

                if (callback) {
                    callback.apply(me, arguments);
                }
            },
            scope : me
        });

        me.setIconCls('fa fa-question-circle');
        me.setClosable(false);

        myMask.show();
    }


});
