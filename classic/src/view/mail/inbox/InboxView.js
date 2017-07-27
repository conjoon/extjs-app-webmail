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
        margin    : '0 0 5 0',
        reference : 'cn_mail_ref_mailfoldertree',
        bind      : {
            store : '{cn_mail-mailfoldertreestore}'
        }
    },{
        split   : true,
        xtype   : 'panel',
        itemId  : 'cn_mail-mailInboxViewPanelBody',
        flex    : 1,
        bodyCls : 'cn_mail-panel-body',
        layout  : {
            type            : 'hbox',
            enableSplitters : true,
            align           : 'stretch'
        },
        items : [{
            xtype  : 'container',
            itemId : 'cn_mail-mailmessagegridcontainer',
            cls    : 'messageGridContainer shadow-panel',
            bind   : {
                margin : '{!cn_mail_ref_mailfoldertree.selection ? "0 5 5 0" : "0 0 5 0"}'
            },
            layout : {
                type  : 'vbox',
                align : 'stretch'
            },
            flex   : 1,
            items : [{
                flex   : 1,
                xtype  : 'box',
                hidden : false,
                bind      : {
                    hidden : '{cn_mail_ref_mailfoldertree.selection}'
                },
                data   : {
                    indicatorIcon : 'fa-folder-o',
                    indicatorText : 'Select a folder to view its contents.'
                },
                itemId : 'msgIndicatorBox',
                tpl: [
                    '<div class="messageIndicator">',
                    '<div class="fa {indicatorIcon} icon"></div>',
                    '<div>{indicatorText}</div>',
                    '</div>'
                ]
            }, {
                flex      : 1,
                hidden    : true,
                xtype     : 'cn_mail-mailmessagegrid',
                reference : 'cn_mail_ref_mailmessagegrid',
                bind      : {
                    title  : '{cn_mail_ref_mailfoldertree.selection.text}',
                    hidden : '{!cn_mail_ref_mailfoldertree.selection}',
                    store  : '{cn_mail-mailmessageitemstore}'
                }
        }]}, {
            flex   : 1,
            xtype  : 'cn_mail-mailmessagereadermessageview',
            margin : '0 5 5 0',
            header : false,
            bind   : {
                hidden      : '{!cn_mail_ref_mailfoldertree.selection}',
                messageItem : '{cn_mail_ref_mailmessagegrid.selection}'
            }

        }]
    }],


    /**
     * Toggles the position of the reading pane, based on the passed argument.
     * Valid arguments are 'right', 'bottom' or falsy  values.
     *
     * @param {String|Boolean} position right to display the reading pane on the
     * right, bottom for bottom position and falsy for hiding the reading pane.
     */
    toggleReadingPane : function(position) {

        var me            = this,
            position      = position === 'right' || position === 'bottom'
                            ? position
                            : false,
            orientation   = position === 'right' ? 'vertical' : 'horizontal',
            collapseDir   = position === 'right' ? 'left'     : 'bottom',
            panelBody     = me.down('#cn_mail-mailInboxViewPanelBody'),
            readingPane   = panelBody.down('cn_mail-mailmessagereadermessageview'),
            gridContainer = panelBody.down('#cn_mail-mailmessagegridcontainer');

        if (!position) {
            gridContainer.setMargin('0 5 5 0');
            readingPane.hide();
            return;
        }

        readingPane.show();

        readingPane.splitter.destroy();

        readingPane.splitter          = null;
        readingPane.collapseDirection = collapseDir;

        panelBody.getLayout().setVertical(position !== 'right');
        panelBody.getLayout().insertSplitter(
            readingPane, 1, false, {collapseTarget : 'next'}
        );
        readingPane.splitter.setOrientation(orientation);
        panelBody.updateLayout();

        if (position === 'right') {
            gridContainer.setMargin('0 0 5 0');
        } else {
            gridContainer.setMargin('0 5 0 0');
        }
    }


});
