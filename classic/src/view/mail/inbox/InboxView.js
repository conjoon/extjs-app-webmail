/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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

    mixins : [
        'conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog'
    ],

    requires : [
        'conjoon.cn_mail.view.mail.inbox.InboxViewModel',
        'conjoon.cn_mail.view.mail.inbox.InboxViewController',
        'conjoon.cn_mail.view.mail.folder.MailFolderTree',
        'conjoon.cn_mail.view.mail.message.MessageGrid',
        'conjoon.cn_mail.view.mail.message.reader.MessageView',
        'conjoon.cn_mail.view.mail.account.MailAccountView'
    ],

    /**
     * @event cn_mail-beforemessageitemdelete
     * @param this
     * @param {conjoon.cn_mail.model.mail.message.AbstractMessageItem}
     * Gets fired before a MessageItem should be deleted.
     * Return "false" in any listener to prevent the deleting of the specified
     * MessageItem.
     * @param {Ext.Component} Any component that "owns" this item that is about to
     * get deleted and which should be involved in this delete-process. Can also be
     * a container that owns a child component displaying the record which is
     * about to get deleted
     */

    /**
     * Event gets fired when an item was successfully moved.
     * @event cn_mail-messageitemmove
     * @param this
     * @param {conjoon.cn_mail.modelw.mail.message.AbstractMessageItem} messageItem
     * @param {Ext.Panel}requestingView
     * @param {conjoon.cn_mail.modelw.mail.folder.MailFolder} sourceFolder
     * @param {conjoon.cn_mail.modelw.mail.folder.MailFolder} targetFolder
     */

    layout  : {
        type  : 'hbox',
        align : 'stretch'
    },

    viewModel : 'cn_mail-mailinboxviewmodel',

    controller : 'cn_mail-mailinboxviewcontroller',

    bodyCls : 'cn_mail-panel-body',

    iconCls : 'fa fa-paper-plane',

    title   : 'Emails',


    /**
     * @private
     */
    canCloseAfterDelete : false,


    /**
     * @type {conjoon.cn_comp.component.MessageMask}
     * @private
     */
    deleteMask : null,

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
                cls    : 'cn-lightestBox',
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
                xtype     : 'cn_mail-mailaccountview',
                bind      : {
                    mailAccount : '{cn_mail_ref_mailfoldertree.selection.cn_folderType === "ACCOUNT" && cn_mail_ref_mailfoldertree.selection}',
                    hidden : '{!cn_mail_ref_mailfoldertree.selection || cn_mail_ref_mailfoldertree.selection.cn_folderType !== "ACCOUNT"}'
                }
            }, {
                flex      : 1,
                hidden    : true,
                xtype     : 'cn_mail-mailmessagegrid',
                reference : 'cn_mail_ref_mailmessagegrid',
                bind      : {
                    representedFolderType : '{cn_mail_ref_mailfoldertree.selection.cn_folderType}',
                    title                 : '{cn_mail_ref_mailfoldertree.selection.text}',
                    hidden                : '{!cn_mail_ref_mailfoldertree.selection || cn_mail_ref_mailfoldertree.selection.cn_folderType === "ACCOUNT"}',
                    store                 : '{cn_mail-mailmessageitemstore}'
                }
        }]}, {
            dockedItems : [{
                xtype  : 'toolbar',
                hidden : true,
                bind   : {
                    hidden: '{!cn_mail_ref_mailmessagegrid.selection}'
                },
                items  : ['->', {
                    xtype     : 'button',
                    scale     : 'small',
                    ui        : 'cn-btn-medium-base-color',
                    iconCls   : 'x-fa fa-edit',
                    tooltip  : {
                        text  : "Edit this draft"
                    },
                    itemId    : 'btn-editdraft',
                    hidden    : true,
                    bind      : {
                        hidden : '{!messageItem.draft}'
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
                    hidden    : true,
                    bind      : {
                        hidden : '{!messageItem.draft}'
                    }
                }, {
                    hidden    : true,
                    bind      : {
                        hidden : '{messageItem.draft}'
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
            }],
            flex      : 1,
            xtype     : 'cn_mail-mailmessagereadermessageview',
            margin    : '0 5 5 0',
            header    : false,
            hidden    : true,
            bind      : {
                hidden      : '{!cn_mail_ref_mailfoldertree.selection || cn_mail_ref_mailfoldertree.selection.cn_folderType === "ACCOUNT"}',
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
    },


    /**
     * Advises the the InboxView to update it's child components regarding the
     * creating of a MessageDraft.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageeDraft} messageDraft
     *
     * @see conjoon.cn_mail.view.mail.inbox.InboxViewController#updateViewForCreatedDraft
     */
    updateViewForCreatedDraft : function(messageDraft) {
        const me = this

        me.getController().updateViewForCreatedDraft(messageDraft);
    },


    /**
     * Advises the the InboxView to update it's child components regarding the
     * sending of a MessageDraft.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageeDraft} messageDraft
     *
     * @see conjoon.cn_mail.view.mail.inbox.InboxViewController#updateViewForSentDraft
     */
    updateViewForSentDraft : function(messageDraft) {

        const me = this

        me.getController().updateViewForSentDraft(messageDraft);
    },


    /**
     * Shows a message that saving the current message failed.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param {Ext.data.operation.Operation} operation The operation that failed
     * @param {Function} callback Optional callback that gets called in the
     * scope of this view. Allows further user interaction by specifying logic
     * to handle the failed process
     *
     * @return {conjoon.cn_comp.component.MessageMask}
     */
    showMailAccountIsBeingEditedNotice : function(node) {
        /**
         * @i18n
         */
        var me              = this,
            iconCls         = me.getIconCls(),
            tree            = me.down('cn_mail-mailfoldertree'),
            mailAccountView = me.down('cn_mail-mailaccountview'),
            myMask;

        myMask = Ext.create('conjoon.cn_comp.component.MessageMask', {
            title    : "Pending Changes",
            message  : "The changes to the Email-Account have not been saved yet. Do you want to discard the changes?",
            target   : me,
            buttons  : conjoon.cn_comp.component.MessageMask.YESNO,
            icon     : conjoon.cn_comp.component.MessageMask.QUESTION,
            callback : function(btnAction) {

                const me = this;

                me.setIconCls(iconCls);

                if (btnAction === 'yesButton') {
                    mailAccountView.rejectPendingChanges();
                    tree.getSelectionModel().select(node);
                    return;
                }

            },
            scope : me
        });

        me.setIconCls('fa fa-question-circle');
        me.setClosable(false);

        myMask.show();

        return myMask;
    },

});
