/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
Ext.define("conjoon.cn_mail.view.mail.inbox.InboxView", {

    extend: "Ext.Panel",

    alias: "widget.cn_mail-mailinboxview",

    mixins: [
        "conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog"
    ],

    requires: [
        "conjoon.cn_mail.view.mail.inbox.InboxViewModel",
        "conjoon.cn_mail.view.mail.inbox.InboxViewController",
        "conjoon.cn_mail.view.mail.folder.MailFolderTree",
        "conjoon.cn_mail.view.mail.message.MessageGrid",
        "conjoon.cn_mail.view.mail.message.reader.MessageView",
        "conjoon.cn_mail.view.mail.account.MailAccountView"
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

    layout: {
        type: "hbox",
        align: "stretch"
    },

    viewModel: "cn_mail-mailinboxviewmodel",

    controller: "cn_mail-mailinboxviewcontroller",

    bodyCls: "cn_mail-panel-body",

    iconCls: "fa fa-paper-plane",

    title: "Emails",


    /**
     * @private
     */
    canCloseAfterDelete: false,


    /**
     * @type {coon.comp.component.MessageMask}
     * @private
     */
    deleteMask: null,

    items: [{
        xtype: "cn_mail-mailfoldertree",
        margin: "0 0 5 0",
        reference: "cn_mail_ref_mailfoldertree",
        bind: {
            store: "{cn_mail_mailfoldertreestore}"
        }
    },{
        split: true,
        xtype: "panel",
        itemId: "cn_mail-mailInboxViewPanelBody",
        flex: 1,
        bodyCls: "cn_mail-panel-body",
        layout: {
            type: "hbox",
            enableSplitters: true,
            align: "stretch"
        },
        items: [{
            xtype: "container",
            itemId: "cn_mail-mailmessagegridcontainer",
            cls: "messageGridContainer shadow-panel",
            bind: {
                margin: "{computeMessageGridMargin}"
            },
            layout: {
                type: "vbox",
                align: "stretch"
            },
            flex: 1,
            items: [{
                flex: 1,
                xtype: "box",
                margin: "0 5 5 0",
                hidden: false,
                cls: "cn-lightestBox shadow-panel",
                bind: {
                    hidden: "{cn_mail_ref_mailfoldertree.selection}"
                },
                data: {
                    indicatorIcon: "fa-folder",
                    indicatorText: "Select a folder to view its contents."
                },
                itemId: "msgIndicatorBox",
                tpl: [
                    "<div class=\"messageIndicator\">",
                    "<div class=\"far {indicatorIcon} icon\"></div>",
                    "<div>{indicatorText}</div>",
                    "</div>"
                ]
            }, {
                flex: 1,
                hidden: true,
                xtype: "cn_mail-mailaccountview",
                bind: {
                    mailAccount: "{cn_mail_ref_mailfoldertree.selection.folderType === \"ACCOUNT\" && cn_mail_ref_mailfoldertree.selection}",
                    hidden: "{!cn_mail_ref_mailfoldertree.selection || cn_mail_ref_mailfoldertree.selection.folderType !== \"ACCOUNT\"}"
                }
            }, {
                flex: 1,
                hidden: true,
                xtype: "cn_mail-mailmessagegrid",
                reference: "cn_mail_ref_mailmessagegrid",
                bind: {
                    representedFolderType: "{cn_mail_ref_mailfoldertree.selection.folderType}",
                    title: "{cn_mail_ref_mailfoldertree.selection.name}",
                    hidden: "{!cn_mail_ref_mailfoldertree.selection || cn_mail_ref_mailfoldertree.selection.folderType === \"ACCOUNT\"}",
                    store: "{cn_mail_mailmessageitemstore}"
                }
            }]}, {
            flex: 1,
            xtype: "cn_mail-mailmessagereadermessageview",
            margin: "0 5 5 0",
            header: false,
            hidden: true,
            bind: {
                contextButtonsEnabled: "{cn_mail_ref_mailmessagegrid.selection}",
                hidden: "{messageViewHidden || (!cn_mail_ref_mailfoldertree.selection || cn_mail_ref_mailfoldertree.selection.folderType === \"ACCOUNT\")}",
                messageItem: "{cn_mail_ref_mailmessagegrid.selection}"
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
    toggleReadingPane: function (position) {

        position = (position === "right" || position === "bottom") ? position : false;

        var me            = this,
            orientation   = position === "right" ? "vertical" : "horizontal",
            collapseDir   = position === "right" ? "left"     : "bottom",
            panelBody     = me.down("#cn_mail-mailInboxViewPanelBody"),
            readingPane   = panelBody.down("cn_mail-mailmessagereadermessageview"),
            gridContainer = panelBody.down("#cn_mail-mailmessagegridcontainer");

        if (!position) {
            me.getViewModel().set("messageViewHidden", true);
            return;
        }

        me.getViewModel().set("messageViewHidden", false);
        me.getViewModel().notify();

        readingPane.splitter.destroy();
        readingPane.splitter          = null;
        readingPane.collapseDirection = collapseDir;

        panelBody.getLayout().setVertical(position !== "right");
        panelBody.getLayout().insertSplitter(
            readingPane, 1, false, {collapseTarget: "next"}
        );
        readingPane.splitter.setOrientation(orientation);


        if (position === "right") {
            gridContainer.setMargin("0 0 5 0");
        } else {
            gridContainer.setMargin("0 5 0 0");
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
    updateViewForCreatedDraft: function (messageDraft) {
        const me = this;

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
    updateViewForSentDraft: function (messageDraft) {

        const me = this;

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
     * @return {coon.comp.component.MessageMask}
     */
    showMailAccountIsBeingEditedNotice: function (node) {
        /**
         * @i18n
         */
        var me              = this,
            iconCls         = me.getIconCls(),
            tree            = me.down("cn_mail-mailfoldertree"),
            mailAccountView = me.down("cn_mail-mailaccountview"),
            myMask;

        myMask = Ext.create("coon.comp.component.MessageMask", {
            title: "Pending Changes",
            message: "The changes to the Email-Account have not been saved yet. Do you want to discard the changes?",
            target: me,
            buttons: coon.comp.component.MessageMask.YESNO,
            icon: coon.comp.component.MessageMask.QUESTION,
            callback: function (btnAction) {

                const me = this;

                me.setIconCls(iconCls);

                if (btnAction === "yesButton") {
                    mailAccountView.rejectPendingChanges();
                    tree.getSelectionModel().select(node);
                    return;
                }

            },
            scope: me
        });

        me.setIconCls("fa fa-question-circle");
        me.setClosable(false);

        myMask.show();

        return myMask;
    }

});
