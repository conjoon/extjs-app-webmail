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
 * The default MessageView, giving a visual representation of an Email Message.
 * This class uses a viewModel to apply bindings to "messageBody" and "messageItem".
 * Basically, a call to {@link #setMessageItem} should be used to provide
 * a {@link conjoon.cn_mail.model.mail.message.MessageItem} for this view directly.
 */
Ext.define('conjoon.cn_mail.view.mail.message.reader.MessageView', {

    extend: 'Ext.Panel',

    mixins : [
        'conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog',
        'conjoon.cn_mail.view.mail.mixin.LoadingFailedDialog'
    ],

    requires : [
        'conjoon.cn_mail.model.mail.message.MessageItem',
        'conjoon.cn_mail.view.mail.message.reader.MessageViewModel',
        'conjoon.cn_mail.view.mail.message.reader.AttachmentList',
        'conjoon.cn_mail.model.mail.message.MessageItem',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey',
        'conjoon.cn_mail.view.mail.message.reader.MessageViewIframe',
        'conjoon.cn_mail.view.mail.message.reader.MessageViewController'
    ],

    alias : 'widget.cn_mail-mailmessagereadermessageview',

    /**
     * @event cn_mail-messageitemread
     * Fires when a MessageItem seen property was changed and successfully saved,
     * most likely due to loading into this view.
     * @param {Array|conjoon.cn_mail.model.mail.message.MessageItem} item
     */

    /**
     * @event cn_mail-messageitemload
     * Fires when a MessageItem has been loaded into the view.
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} item
     */

    config : {
        /**
         * Whether the buttons in this MessageView (reply all, edit / delete draft)
         * should be enabled. Defaults to false.
         *
         * @cfg {Boolean}
         */
        contextButtonsEnabled : false
    },


    /**
     * @private
     */
    isCnMessageView : true,

    layout : {
        type : 'vbox',
        align : 'stretch'
    },

    controller : 'cn_mail-mailmessagereadermessageviewcontroller',

    viewModel : {
        type : 'cn_mail-mailmessagereadermessageviewmodel'
    },

    // needed to make sure embedded iframe can calculate its sizing
    // when messageview is hidden and message gets loaded
    hideMode : 'offsets',

    split  : true,
    cls    : 'cn_mail-mailmessagereadermessageview shadow-panel',
    flex   : 1,

    /**
     * @i18n
     */
    title : 'Loading...',

    iconCls : 'fa fa-spin fa-spinner',

    bind : {
        title   : '{isLoading ? "Loading..." : getSubject}',
        iconCls : '{isLoading ? "fa fa-spin fa-spinner" : "fa fa-envelope-o"}'
    },

    closable : true,


    /**
     * @type {conjoon.cn_mail.model.mail.message.MessageItem} loadingItem
     * If any item was requested via #loadMessageItem, this holds the reference
     * to the current record being loaded to be able to abort load operations
     * when needed.
     */
    loadingItem : null,

    /**
     * @type {Ext.LoadMask}
     * @private
     */
    loadingMask : null,

    items : [{
        xtype  : 'container',
        itemId : 'msgHeaderContainer',
        cls    : 'cn_mail-header',
        height : 96,
        layout : {
            type  : 'hbox'
        },
        hidden : true,
        bind   : {
            hidden : '{!messageItem}'
        },
        items: [{
            xtype  : 'box',
            cls    : 'sender-img x-fa fa-user',
            height : 80,
            width  : 80
        }, {
           xtype : 'container',
           flex : 1,
           layout : { type : 'vbox', align : 'stretch'},
           items : [{
               xtype  : 'container',
               margin : '5 5 0 0',
               layout : { type : 'hbox'},
               items  : [{
                   xtype : 'component',
                   flex  : 1,
                   cls   : 'message-subject',
                   bind  : {
                       data : {
                           date               : '{getFormattedDate}',
                           displayToAddress   : '{getDisplayToAddress}',
                           displayFromAddress : '{getDisplayFromAddress}'
                       }
                   },
                   tpl: [
                       '<div class="from">{displayFromAddress}</div>',
                       '<div class="to">to {displayToAddress} on {date}</div>',
                   ]

               }, {
                   xtype     : 'button',
                   scale     : 'small',
                   ui        : 'cn-btn-medium-base-color',
                   iconCls   : 'x-fa fa-edit',
                   tooltip  : {
                       text  : "Edit this draft"
                   },
                   itemId    : 'btn-editdraft',
                   visible    : false,
                   bind      : {
                       visible : '{messageItem.draft && contextButtonsEnabled}'
                   }
               }, {
                   xtype     : 'button',
                   scale     : 'small',
                   ui        : 'cn-btn-medium-base-color',
                   iconCls   : 'x-fa fa-trash',
                   itemId    : 'btn-deletedraft',
                   tooltip  : {
                       text  : "Delete this draft"
                   },
                   visible   : false,
                   bind      : {
                       visible : '{messageItem.draft && contextButtonsEnabled}'
                   }
               }, {
                   visible   : false,
                   bind      : {
                       visible : '{!messageItem.draft && contextButtonsEnabled}'
                   },
                   xtype     : 'splitbutton',
                   scale     : 'small',
                   ui        : 'cn-btn-medium-base-color',
                   iconCls   : 'x-fa fa-mail-reply-all',
                   text      : 'Reply all',
                   itemId    : 'btn-replyall',
                   menuAlign : 'tr-br',
                   menu    : {
                       items : [{
                           text    : 'Reply',
                           iconCls : 'x-fa fa-mail-reply',
                           itemId  : 'btn-reply',
                       }, {
                           text    : 'Forward',
                           iconCls : 'x-fa fa-mail-forward',
                           itemId  : 'btn-forward'
                       }, '-', {
                           text    : 'Delete',
                           iconCls : 'x-fa fa-trash',
                           itemId  : 'btn-delete'
                       }]
                   }
               }]
           }, {
               xtype : 'component',
               flex  : 1,
               cls   : 'message-subject',
               bind  : {
                   data : {
                       subject            : '{getSubject}',
                       hasAttachments     : '{messageItem.hasAttachments}',
                       isDraft            : '{messageItem.draft}'
                   }
               },
               tpl: [
                   '<div class="subject">' +
                   '<tpl if="isDraft"><span class="draft">[Draft]</span></tpl>' +
                   '<tpl if="hasAttachments"><span class="fa fa-paperclip"></span></tpl>' +
                   '{subject}',
                   '</div>'
               ]

           }]
        }]
    }, {
        flex   : 1,
        xtype  : 'box',
        hidden : false,
        bind : {
            hidden : '{messageItem && messageBody}',
            data   : {
                indicatorText : '{getIndicatorText}',
                indicatorIcon : '{getIndicatorIcon}'
            }
        },
        itemId : 'msgIndicatorBox',
        tpl: [
            '<div class="messageIndicator">',
            '<div class="fa {indicatorIcon} icon"></div>',
            '<div>{indicatorText}</div>',
            '</div>'
        ]
    }, {
        xtype  : 'container',
        flex   : 1,
        cls   : 'cn_mail-body',
        hidden : true,
        bind   : {
            hidden : '{!messageBody}'
        },
        itemId     : 'msgBodyContainer',
        scrollable : true,
        layout : 'auto',

        items :[{
            xtype  : 'cn_mail-mailmessagereaderattachmentlist',
            hidden : true,
            bind : {
                store  : '{attachmentStore}',
                hidden : '{!messageItem.hasAttachments}'
            }
        }, {
            cls   : 'cn_mail-mailmessagereadermessageviewiframe',
            xtype : 'cn_mail-mailmessagereadermessageviewiframe',
            scrolling : "no",
            sandbox : Ext.isGecko
                      ? "allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                      : "allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation",
            src : "",
            bind : {
                srcDoc : '{messageBody.textHtml}',
            }
        }]
    }],


    /**
     * @inheritdoc
     */
    initComponent : function() {

        var me = this;

        me.on('afterrender', function() {
            var me = this;

            me.loadingMask = Ext.create('Ext.LoadMask', {
                target : me,
                bind   : {
                    hidden : '{!isLoading}'
                },
                listeners : {
                    hide : function(mask) {
                        mask.destroy();
                        me.loadingMask = null;
                    }
                }
            });

            me.loadingMask.show();
        }, me, {single : true});

        me.on('beforedestroy', function() {
            var me = this,
                vm = me.getViewModel();

            if (me.loadingMask) {
                me.loadingMask.destroy();
                me.loadingMask = null;
            }

            if (me.loadingFailedMask) {
                me.loadingFailedMask.destroy();
                me.loadingFailedMask = null;
            }

            if (me.loadingItem) {
                me.loadingItem.abort();
                me.loadingItem = null;
            }

            vm.abortMessageBodyLoad();
            vm.abortMessageAttachmentsLoad();

        }, me);

        me.callParent(arguments);
    },


// -------- API

    /**
     * Returns the "messageItem" of this view's ViewModel.
     *
     * @return {null|conjoon.cn_mail.model.mail.message.MessageItem}
     */
    getMessageItem : function() {
        const me = this;

        return me.getViewModel().get('messageItem');
    },


    /**
     * Sets the message item for this view, or null to clear the view.
     *
     * @throws exception if messageItem is neither null and not of type
     * {@link conjoon.cn_mail.model.mail.message.MessageItem}
     *
     * @see {conjoon.cn_amil.view.mail.message.reader.MessageViewModel}
     */
    setMessageItem : function(messageItem) {

        var me = this;

        if (me.loadingFailedMask) {
            me.loadingFailedMask.close();
            me.loadingFailedMask = null;
        }

        me.getViewModel().setMessageItem(
            messageItem ? messageItem : null
        );
    },


    /**
     * Loads the MessageItem with the specified compoundKey into this view.
     *
     * @param {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} compoundKey
     *
     * @see onMessageItemLoad
     *
     * @throws if compoundKey is not an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
     */
    loadMessageItem : function(compoundKey) {

        var me = this,
            vm = me.getViewModel();

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey)) {
            Ext.raise({
               msg          : "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                compoundKey : compoundKey
            });
        }

        vm.set('isLoading', true);

        if (me.loadingItem) {
            me.loadingItem.abort();
        }

        me.loadingItem = conjoon.cn_mail.model.mail.message.MessageItem.loadEntity(compoundKey, {
            success : me.onMessageItemLoaded,
            failure : me.onMessageItemLoadFailure,
            scope   : me
        });
    },


    /**
     * Updates this message item with teh data from the specified MessageDraft.
     * This method should be called whenever a MessageDraft was updated to ma
     * ke
     * sure the changes are reflected in this view.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @throws if the specified argument is not an instance of
     * {conjoon.cn_mail.model.mail.message.MessageDraft}, or if there is currently
     * not a messageItem available, or if the id of the
     * MessageDraft does not equal to the id of the messageItem.
     */
    updateMessageItem : function(messageDraft) {
        var me = this;

        me.getViewModel().updateMessageItem(messageDraft);
    },


    privates : {

        /**
         * Callback for the failed attempt to load a MessageItem, registered
         * by #loadMessageItem.
         *
         * @param {"conjoon.cn_mail.model.mail.message.MessageItem"} messageItem
         * @param {Ext.data.operation.Read} operation
         *
         * @return {coon.comp.component.MessageMask}
         */
        onMessageItemLoadFailure : function(messageItem, operation) {

            const me               = this,
                  vm               = me.getViewModel();

            vm.set('isLoading', false);
            vm.notify();

            // do not show dialog if status of error is -1, which
            // hints to a cancelled request
            if (operation.error && operation.error.status === -1) {
                return;
            }

            let isParentTabPanel = (me.ownerCt instanceof Ext.tab.Panel);

            return me.showLoadingFailedDialog(isParentTabPanel);
        },


        /**
         * Callback for the load-event of a MessageItem, registered by #loadMessageItem
         * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
         */
        onMessageItemLoaded : function(messageItem) {

            const me = this,
                  vm = me.getViewModel();

            me.setMessageItem(messageItem);
            vm.set('isLoading', false);
            me.loadingItem = null;
            me.fireEvent('cn_mail-messageitemload', me, messageItem);
        }

    },


    /**
     * Delegates to this ViewModel and sets its contextButtonsEnabled
     * property to the specified value.
     *
     * @param {Boolean} value
     *
     * @private
     */
    updateContextButtonsEnabled : function(value) {

        const me = this;

        me.getViewModel().set('contextButtonsEnabled', value);

    }


});
