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
        'conjoon.cn_mail.view.mail.message.reader.AttachmentList'
    ],

    alias : 'widget.cn_mail-mailmessagereadermessageview',

    /**
     * @event cn_mail-messageitemread
     * Fires when a MessageItem isRead property was changed and successfully saved,
     * most likely due to loading into this view..
     * @param {Array|conjoon.cn_mail.model.mail.message.MessageItem} item
     */

    layout : {
        type : 'vbox',
        align : 'stretch'
    },

    viewModel : {
        type : 'cn_mail-mailmessagereadermessageviewmodel'
    },

    margin : '0 5 14 0',
    split  : true,
    cls    : 'cn_mail-mailmessagereadermessageview shadow-panel',
    flex   : 1,

    bind : {
        title : '{messageItem.subject}'
    },

    iconCls  : 'fa fa-envelope-o',

    closable : true,

    items : [{
        flex   : 1,
        xtype  : 'box',
        hidden : false,
        bind : {
            hidden : '{messageItem}'
        },
        itemId : 'emptyMsgBox',
        autoEl : {
            tag : 'div',
            children : [{
                tag  : 'div',
                cls  : 'emptyMessage',
                children : [{
                    tag : 'div',
                    cls : 'fa fa-envelope-o icon'
                }, {
                    tag  : 'div',
                    html : 'Select a message to read it.'
                }]
            }]
        }
    }, {
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
            padding: 10,
            tpl: [
                '<div class="from">{from}</div>',
                '<div class="subject"><tpl if="hasAttachments"><span class="fa fa-paperclip"></span></tpl> {subject}</div>',
                '<div class="date">{date}</div>'
            ]

        }]
    }, {
        xtype  : 'container',
        flex   : 1,
        hidden : true,
        bind   : {
            hidden : '{!messageItem}'
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
                store  : '{messageItem.attachments}',
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

        me.getViewModel().setMessageItem(messageItem);
    }




});
