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
 * This is the main view for an email inbox, providing components for convenient
 * access to email messages and email folders. By default, this view
 * consists of a {@link conjoon.cn_mail.view.mail.folder.MailFolderTree}, a
 * {@link conjoon.cn_mail.view.mail.message.MessageGrid} and a
 * {@link conjoon.cn_mail.view.mail.message.MessageView} to provide a detailed
 * view of any selected message in the MessageGrid.
 *
 * The {@link conjoon.cn_mail.view.mail.inbox.InboxViewModel} is used to provide
 * bindings between the components, such als filtering the MessageGrid based upon
 * the selected node in the FolderTree, and providing information about the
 * selected message in the MessageGrid for the MessageView.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.inbox.InboxView', {

    extend : 'Ext.Panel',

    alias : 'widget.cn_mail-mailinboxview',

    requires : [
        'conjoon.cn_mail.view.mail.inbox.InboxViewModel',
        'conjoon.cn_mail.view.mail.inbox.InboxViewController',
        'conjoon.cn_mail.view.mail.folder.MailFolderTree',
        'conjoon.cn_mail.view.mail.message.MessageGrid',
        'conjoon.cn_mail.view.mail.message.reader.MessageView'
    ],

    layout  : {
        type  : 'hbox',
        align : 'stretch'
    },

    viewModel : 'cn_mail-mailinboxviewmodel',

    controller : 'cn_mail-mailinboxviewcontroller',

    bodyCls : 'cn_mail-panel-body',

    iconCls : 'fa fa-paper-plane',

    title   : 'Emails',

    items: [{
        xtype     : 'cn_mail-mailfoldertree',
        reference : 'cn_mail_ref_mailfoldertree',
        bind      : {
            store : '{cn_mail-mailfoldertreestore}'
        }
    },{
        split   : true,
        xtype   : 'panel',
        flex    : 1,
        bodyCls : 'cn_mail-panel-body',
        layout  : {
            type            : 'vbox',
            enableSplitters : true,
            align           : 'stretch'
        },
        items : [{
            xtype     : 'cn_mail-mailmessagegrid',
            reference : 'cn_mail_ref_mailmessagegrid',
            bind      : {
                store : '{cn_mail-mailmessageitemstore}'
            }
        }, {
            xtype  : 'cn_mail-mailmessagereadermessageview',
            header : false,
            bind   : {
               messageItem : '{cn_mail_ref_mailmessagegrid.selection}'
            }

        }]
    }]


});
