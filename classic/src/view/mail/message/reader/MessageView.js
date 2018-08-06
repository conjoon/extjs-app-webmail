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
 * The default MessageView, giving a visual representation of an Email Message.
 * This class uses a viewModel to apply bindings to "messageBody" and "messageItem".
 * Basically, a call to {@link #setMessageItem} should be used to provide
 * a {@link conjoon.cn_mail.model.mail.message.MessageItem} for this view directly.
 */
Ext.define('conjoon.cn_mail.view.mail.message.reader.MessageView', {

    extend: 'Ext.Panel',

    requires : [
        'conjoon.cn_mail.model.mail.message.MessageItem',
        'conjoon.cn_mail.view.mail.message.reader.MessageViewModel',
        'conjoon.cn_mail.view.mail.message.reader.AttachmentList',
        'conjoon.cn_mail.model.mail.message.MessageItem'
    ],

    alias : 'widget.cn_mail-mailmessagereadermessageview',

    /**
     * @event cn_mail-messageitemread
     * Fires when a MessageItem seen property was changed and successfully saved,
     * most likely due to loading into this view.
     * @param {Array|conjoon.cn_mail.model.mail.message.MessageItem} item
     */

    layout : {
        type : 'vbox',
        align : 'stretch'
    },

    viewModel : {
        type : 'cn_mail-mailmessagereadermessageviewmodel'
    },

    split  : true,
    cls    : 'cn_mail-mailmessagereadermessageview shadow-panel',
    flex   : 1,

    /**
     * @i18n
     */
    title : 'Loading...',

    iconCls : 'fa fa-spin fa-spinner',

    bind : {
        title   : '{isLoading ? "Loading..." : messageItem.subject}',
        iconCls : '{isLoading ? "fa fa-spin fa-spinner" : "fa fa-envelope-o"}'
    },

    closable : true,

    /**
     * @type {conjoon.cn_mail.model.mail.message.MessageItem} loadingItem
     * If any item was requested via #loadMessageItem, this olds the reference
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
            xtype : 'component',
            flex  : 1,
            cls   : 'message-subject',
            bind  : {
                data : {
                    displayAddress : '{getDisplayAddress}',
                    subject        : '{messageItem.subject}',
                    date           : '{getFormattedDate}',
                    hasAttachments : '{messageItem.hasAttachments}',
                    isDraft        : '{messageItem.draft}'
                }
            },
            tpl: [
                '<div class="displayAddress">{displayAddress}</div>',
                '<div class="subject">' +
                   '<tpl if="isDraft"><span class="draft">[Draft]</span></tpl>' +
                   '<tpl if="hasAttachments"><span class="fa fa-paperclip"></span></tpl>' +
                    '{subject}</div>',
                '<div class="date">{date}</div>'
            ]

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
        hidden : true,
        bind   : {
            hidden : '{!messageBody}'
        },
        itemId     : 'msgBodyContainer',
        scrollable : 'y',
        layout : {
            type  : 'hbox',
            align : 'stretchmax'
        },
        items :[{
            xtype      : 'box',
            flex       : 1,
            cls        : 'cn_mail-body',
            bind : {
                html : '{messageBody.textHtml}'
            }
        }, {
            xtype  : 'cn_mail-mailmessagereaderattachmentlist',
            width  : 248,
            hidden : true,
            bind : {
                store  : '{attachmentStore}',
                hidden : '{!messageItem.hasAttachments}'
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
     * Sets the message item for this view, or null to clear the view.
     *
     * @throws exception if messageItem is neither null and not of type
     * {@link conjoon.cn_mail.model.mail.message.MessageItem}
     *
     * @see {conjoon.cn_amil.view.mail.message.reader.MessageViewModel}
     */
    setMessageItem : function(messageItem) {

        var me = this;

        me.getViewModel().setMessageItem(
            messageItem ? messageItem : null
        );
    },


    /**
     * Loads the MessageItem with the specified id into this view.
     *
     * @param {String} messageId
     *
     * @see onMessageItemLoad
     */
    loadMessageItem : function(messageId) {

        var me = this,
            vm = me.getViewModel();

        vm.set('isLoading', true);

        if (me.loadingItem) {
            me.loadingItem.abort();
        }

        me.loadingItem = conjoon.cn_mail.model.mail.message.MessageItem.load(messageId, {
            success : me.onMessageItemLoaded,
            scope   : me
        });
    },


    /**
     * Updates this message item with teh data from the specified MessageDraft.
     * This method should be called whenever a MessageDraft was updated to make
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
         * Callback for the load-event of a MessageItem, registered by #loadMessageItem
         * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
         */
        onMessageItemLoaded : function(messageItem) {

            var me = this,
                vm = me.getViewModel();

            me.setMessageItem(messageItem);
            vm.set('isLoading', false);

        }

    }




});
