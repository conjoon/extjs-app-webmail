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
     * Fires when a MessageItem isRead property was changed and successfully saved,
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

    bind : {
        title   : '{getTitle}',
        iconCls : '{isLoading ? "fa fa-spin fa-spinner" : "fa fa-envelope-o"}'
    },

    closable : true,

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
                    from           : '{messageItem.from}',
                    subject        : '{messageItem.subject}',
                    date           : '{messageItem.date}',
                    hasAttachments : '{messageItem.hasAttachments}'
                }
            },
            tpl: [
                '<div class="from">{from}</div>',
                '<div class="subject"><tpl if="hasAttachments"><span class="fa fa-paperclip"></span></tpl> {subject}</div>',
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

        conjoon.cn_mail.model.mail.message.MessageItem.load(messageId, {
            success : me.onMessageItemLoaded,
            scope   : me
        });
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
