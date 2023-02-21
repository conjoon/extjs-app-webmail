/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * This is the package controller of the extjs-app-webmail package to be used with
 * {@link coon.comp.app.Application}.
 *
 * This controller will hook into the launch-process of {@link coon.comp.app.Application#launch},
 * and expose it's navigation info along with the view's class name to the application.
 *
 *      @example
 *      Ext.define('conjoon.Application', {
 *
 *          extend : 'coon.comp.app.Application',
 *
 *          mainView : 'Ext.Panel',
 *
 *          // If specifying the PackageController in the requires-property of the app.json of the
 *          // application which uses this package, you can omit the this.
 *          controllers : [
 *              'conjoon.cn_mail.app.PackageController'
 *          ]
 *
 *      });
 *
 * Additionally, this app controller will create and register a singleton instance of
 *  {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} to make sure MailAccount-information
 *  can be accessed given one uniquely identifyable data source.
 *
 */
Ext.define("conjoon.cn_mail.app.PackageController", {

    extend: "coon.core.app.PackageController",

    requires: [
        // @define
        "l8",
        "conjoon.cn_mail.view.mail.MailDesktopView",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditor",
        "conjoon.cn_mail.view.mail.message.reader.MessageView",
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes",
        "conjoon.cn_mail.data.mail.BaseSchema",
        "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore"
    ],


    statics: {
        required: {
            mailAccountHandler: "conjoon.cn_mail.view.mail.account.MailAccountHandler"
        }
    },

    routes: {

        // route for generic compser instances
        "cn_mail/message/compose/:id": {
            action: "onComposeMessageRoute",
            conditions: {
                ":id": "([0-9]+$)"
            },
            before: "onBeforePackageRoute"
        },

        // route for "mailto"
        "cn_mail/message/compose/mailto%3A:id": {
            action: "onComposeMailtoMessageRoute",
            conditions: {
                ":id": "(.+)"
            },
            before: "onBeforePackageRoute"
        },
        "cn_mail/message/edit/:mailAccountId/:mailFolderId/:id": {
            conditions: {
                ":mailAccountId": "(.+)",
                ":mailFolderId": "(.+)",
                ":id": "(.+)"

            } ,
            action: "onEditMessageRoute",
            before: "onBeforePackageRoute"
        },
        "cn_mail/message/replyTo/:mailAccountId/:mailFolderId/:id": {
            conditions: {
                ":mailAccountId": "(.+)",
                ":mailFolderId": "(.+)",
                ":id": "(.+)"

            } ,
            action: "onReplyToRoute",
            before: "onBeforePackageRoute"
        },
        "cn_mail/message/replyAll/:mailAccountId/:mailFolderId/:id": {
            conditions: {
                ":mailAccountId": "(.+)",
                ":mailFolderId": "(.+)",
                ":id": "(.+)"

            } ,
            action: "onReplyAllRoute",
            before: "onBeforePackageRoute"
        },
        "cn_mail/message/forward/:mailAccountId/:mailFolderId/:id": {
            conditions: {
                ":mailAccountId": "(.+)",
                ":mailFolderId": "(.+)",
                ":id": "(.+)"

            } ,
            action: "onForwardRoute",
            before: "onBeforePackageRoute"
        },
        "cn_mail/message/read/:mailAccountId/:mailFolderId/:id": {
            conditions: {
                ":mailAccountId": "(.+)",
                ":mailFolderId": "(.+)",
                ":id": "(.+)"

            } ,
            action: "onReadMessageRoute",
            before: "onBeforePackageRoute"
        },
        "cn_mail/folder/:mailAccountId/:id": {
            action: "onMailFolderRoute",
            conditions: {
                ":mailAccountId": "(.+)",
                ":id": "(.+)"
            },
            before: "onBeforePackageRoute"
        },
        "cn_mail/account/:mailAccountId": {
            action: "onMailAccountRoute",
            conditions: {
                ":mailAccountId": "(.+)"
            },
            before: "onBeforePackageRoute"
        },
        "cn_mail/home": {
            action: "onHomeTabRoute",
            before: "onBeforePackageRoute"
        }
    },

    control: {
        "cn_mail-mailaccountwizard": {
            "show": "onMailAccountWizardShownOrClosed"
        },
        "cn_mail-maildesktopview": {
            tabchange: "onMailDesktopViewTabChange"
        },
        "cn_mail-maildesktopview > cn_mail-mailinboxview > cn_mail-mailfoldertree": {
            selectionchange: "onMailFolderTreeSelectionChange"
        },
        "cn_mail-maildesktopview > cn_mail-mailinboxview": {
            activate: "onMailInboxViewActivate",
            deactivate: "onMailInboxViewDeactivate"
        },
        "cn_mail-maildesktopview > cn_mail-mailinboxview > panel > container > cn_mail-mailmessagegrid": {
            deselect: "onMailMessageGridDeselect",
            select: "onMailMessageGridSelect",
            "cn_mail-mailmessagegridbeforeload": "onMailMessageGridBeforeLoad",
            "cn_mail-mailmessagegridload": "onMailMessageGridLoad"
        },
        "cn_mail-maildesktopview > cn_mail-mailinboxview cn_mail-mailmessagereadermessageview": {
            "cn_mail-messageviewitemchange": "onMailMessageViewItemChange"
        },
        "cn_navport-tbar > #cn_mail-nodeNavCreateMessage": {
            click: "onMessageComposeButtonClick"
        },
        "cn_navport-tbar > #cn_mail-nodeNavEditMessage": {
            click: "onMessageEditButtonClick"
        },
        "cn_navport-tbar > #cn_mail-nodeNavDeleteMessage": {
            click: "onMessageDeleteButtonClick"
        },
        "cn_navport-tbar > #cn_mail-nodeNavReplyTo": {
            click: "onReplyToButtonClick"
        },
        "cn_navport-tbar > #cn_mail-nodeNavReplyAll": {
            click: "onReplyAllButtonClick"
        },
        "cn_navport-tbar > #cn_mail-nodeNavForward": {
            click: "onForwardButtonClick"
        },
        "cn_navport-tbar > #cn_mail-nodeNavReadingPane > menu > menucheckitem": {
            checkchange: "onReadingPaneCheckChange"
        },
        "cn_navport-tbar > #cn_mail-nodeNavToggleList": {
            toggle: "onToggleListViewButtonClick"
        },
        "cn_navport-tbar > #cn_mail-nodeNavToggleFolder": {
            toggle: "onToggleFolderViewButtonClick"
        },
        "cn_navport-tbar > #cn_mail-addMailAccountBtn": {
            click: "onAddMailAccountBtnClick"
        }
    },

    refs: [{
        ref: "mailDesktopView",
        selector: "cn_mail-maildesktopview"
    }, {
        ref: "mailInboxView",
        selector: "cn_mail-maildesktopview > cn_mail-mailinboxview"
    }, {
        ref: "mailInboxMessageView",
        selector: "cn_mail-maildesktopview > cn_mail-mailinboxview cn_mail-mailmessagereadermessageview"
    }, {
        ref: "mailMessageGrid",
        selector: "cn_mail-maildesktopview > cn_mail-mailinboxview > panel > container > cn_mail-mailmessagegrid"
    }, {
        ref: "gridContainer",
        selector: "cn_mail-maildesktopview > cn_mail-mailinboxview > panel > container > cn_mail-mailmessagegridcontainer"
    }, {
        ref: "mailFolderTree",
        selector: "cn_mail-maildesktopview > cn_mail-mailinboxview > cn_mail-mailfoldertree"
    }, {
        ref: "navigationToolbar",
        selector: "cn_navport-tbar"
    }, {
        ref: "toggleGridListButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavToggleList"
    }, {
        ref: "toggleMailFolderButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavToggleFolder"
    }, {
        ref: "switchReadingPaneButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavReadingPane"
    }, {
        ref: "createMessageButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavCreateMessage"
    }, {
        ref: "replyToButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavReplyTo"
    }, {
        ref: "replyAllButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavReplyAll"
    }, {
        ref: "forwardButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavForward"
    }, {
        ref: "editButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavEditMessage"
    }, {
        ref: "deleteButton",
        selector: "cn_navport-tbar > #cn_mail-nodeNavDeleteMessage"
    }, {
        ref: "addMailAccountButton",
        selector: "cn_navport-tbar > #cn_mail-addMailAccountBtn"
    }],


    /**
     * @private
     */
    observedMessageView: null,

    /**
     * @private
     */
    observedMessageEditor: null,

    /**
     * @private
     * @type bool mailAccountWizardShown
     */


    /**
     * Configures the urlPrefix from the base-address found in the package-configuration.
     *
     * @throws if no config for the baseAddress was found.
     */
    init (app) {

        "use strict";

        const
            me = this,
            baseAddress = app.getPackageConfig(me, "service.rest-api-email.base");

        if (!l8.isString(baseAddress)) {
            throw("no configured \"base\"-address found in the Package Configuration for \"conjoon.cn_mail.data.mail.BaseSchema\"");
        }

        Ext.data.schema.Schema.get("cn_mail-mailbaseschema").setUrlPrefix(l8.unify(baseAddress, "/", "://"));
    },


    /**
     * Callback for the MailDesktopView's tabchange event. Makes sure the
     * buttons in the navigation Toolbar are properly activated/deactivated,
     * based on the activated panel.
     *
     * @param {conjoon.cn_mail.view.mail.MailDesktopView} panel
     * @param {Ext.Panel} activatedPanel
     *
     * @return false if no action was initiated and the activatedPanel is the
     * MailInboxView, otherwise true
     */
    onMailDesktopViewTabChange (panel, activatedPanel) {

        const me = this;

        if (me.observedMessageView) {
            me.observedMessageView.un(
                "cn_mail-messageitemload",
                me.onMailMessageItemLoadForActivatedView,
                me
            );
        }

        if (me.observedMessageEditor) {
            me.observedMessageEditor.un(
                "cn_mail-messagedraftload",
                me.messageEditorIsActivatedTab,
                me
            );
        }

        if (activatedPanel === me.getMailInboxView()) {
            return false;
        }

        // we have not an inbox view. By default, disable all buttons.
        // they will either be re-activated instantly or once any of the
        // view's or editor's item/draft was loaded
        me.disableMessageItemContextButtons(true);

        if (activatedPanel.isCnMessageEditor) {

            if (activatedPanel.isDraftLoading()) {
                me.observedMessageEditor = activatedPanel.on("cn_mail-messagedraftload",
                    me.messageEditorIsActivatedTab,
                    me, {single: true});
            } else if (activatedPanel.hasLoadingFailed() !== true) {
                me.messageEditorIsActivatedTab();
            }


        } else if  (activatedPanel.isCnMessageView) {

            if (activatedPanel.loadingItem) {
                me.observedMessageView = activatedPanel.on("cn_mail-messageitemload",
                    me.onMailMessageItemLoadForActivatedView,
                    me, {single: true});
            } else {
                me.onMailMessageItemLoadForActivatedView(activatedPanel);
            }

        }

        return true;
    },


    /**
     * Disables / enables the edit/delete button in the Navigation Toolbar, based
     * on the specified arguments. The first argument represents the disabled-state
     * of the edit-button, the second of the delete-button. If only one argument
     * is specified, this will be used for both buttons.
     *
     * @param {Boolean} editDis true to disable the edit-button, false to enable
     * it. Omit the second argument and this coolean value will also be used for
     * the delete-button
     * @param {Boolean} deleteDis, optional. True to disable the delete-button,
     * false to enable it.
     */
    disableEmailEditButtons (editDis, deleteDis) {

        const me        = this,
            editBtn   = me.getEditButton(),
            deleteBtn = me.getDeleteButton();

        if (arguments.length === 1) {
            deleteDis = editDis;
        }

        editBtn.setDisabled(editDis);
        deleteBtn.setDisabled(deleteDis);
    },


    /**
     * Enables or disables the forward, reply to, reply all buttons based on
     * disable.
     *
     * @param {Boolean} disable true to disable the buttons, false to enable them.
     */
    disableEmailActionButtons (disable) {
        const me          = this,
            replyToBtn  = me.getReplyToButton(),
            replyAllBtn = me.getReplyAllButton(),
            forwardBtn  = me.getForwardButton();

        replyToBtn.setDisabled(disable);
        replyAllBtn.setDisabled(disable);
        forwardBtn.setDisabled(disable);
    },


    /**
     * Enables or disables toolbar buttons depending on the selection of the
     * MessageGrid.
     *
     * @see activateButtonsForMessageItem
     * @see disableEmailActionButtons
     * @see disableEmailEditButtons
     */
    activateButtonsForMessageGrid () {
        const me        = this,
            selection = me.getMailMessageGrid().getSelection();

        if (selection.length) {
            me.activateButtonsForMessageItem(selection[0]);
        } else {
            me.disableMessageItemContextButtons(true);
        }
    },


    /**
     * Disables/enables the action/edit buttons for the specified MessageItem.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} record
     *
     * @see disableEmailActionButtons
     * @see disableEmailEditButtons
     */
    activateButtonsForMessageItem (record) {

        const me      = this,
            isDraft = record.get("draft");

        switch (isDraft) {
        case true:
            me.disableEmailActionButtons(true);
            me.disableEmailEditButtons(false, false);
            break;

        default:
            me.disableEmailActionButtons(false);
            me.disableEmailEditButtons(true, false);
            break;
        }

    },


    /**
     * Callback for the InboxView's activate event. Toggles grid-/inbox-view
     * related buttons.
     *
     * @param {conjoon.cn_mail.view.mail.inbox.InboxView} view
     */
    onMailInboxViewActivate (view) {

        const me      = this,
            ACCOUNT = conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT;

        let paneDisabled    = false,
            toggleDisabled  = false,
            sel             = me.getMailFolderTree().getSelection(),
            type            = sel.length && sel[0].get("folderType"),
            accountSelected = type === ACCOUNT;

        if (sel.length === 0 || accountSelected) {
            paneDisabled   = true;
            toggleDisabled = true;

            if (accountSelected) {
                me.disableMessageItemContextButtons(true);
            }
        } else if (me.getMailMessageGrid().getStore().isLoading()) {
            toggleDisabled = true;
        }

        if (!accountSelected) {
            me.activateButtonsForMessageGrid();
        }

        me.getToggleGridListButton().setDisabled(toggleDisabled);
        me.getSwitchReadingPaneButton().setDisabled(paneDisabled);
    },


    /**
     * Callback for the InboxView's activate event. Toggles grid-/inbox-view
     * related buttons.
     *
     * @param {conjoon.cn_mail.view.mail.inbox.InboxView} view
     */
    onMailInboxViewDeactivate (inboxView) {
        var me = this;

        me.getToggleGridListButton().setDisabled(true);
        me.getSwitchReadingPaneButton().setDisabled(true);
    },


    /**
     * Callback for the MessageGrid's cn_mail-mailmessagegridbeforeload event.
     * Sets the button for toggling the row preview disabled.
     *
     * @param {conjoon.cn_mail.store.mail.message.MessageItemStore} store
     */
    onMailMessageGridBeforeLoad (store) {
        var me = this;

        me.getToggleGridListButton().setDisabled(true);
    },


    /**
     * Callback for the MessageGrid's cn_mail-mailmessagegridbeforeload event.
     * Sets the button for toggling the row preview enabled.
     *
     * @param {conjoon.cn_mail.store.mail.message.MessageItemStore} store
     */
    onMailMessageGridLoad () {
        var me = this;

        if (me.getMailDesktopView().getLayout().getActiveItem() !== me.getMailInboxView()) {
            return;
        }

        if (!me.mailAccountWizardShown) {
            me.getToggleGridListButton().setDisabled(false);
        }
    },


    /**
     * Callback for the toggle event of the cn_mail-nodeNavToggleFolder button.
     * Will show/hide the mailFolderTree.
     *
     * @param {Ext.Button} btn
     * @param {Boolean}    pressed
     */
    onToggleFolderViewButtonClick (btn, pressed) {

        var me         = this,
            mailFolder = me.getMailFolderTree();

        if (pressed) {
            mailFolder.show();
        } else {
            mailFolder.hide();
        }

    },


    /**
     * Callback for the toggle event of the cn_mail-nodeNavToggleList button.
     * Will delegate to {conjoon.cn_mail.view.mail.message.MessageGrid#toggleGridView}
     *
     * @param {Ext.Button} btn
     * @param {Boolean}    pressed
     */
    onToggleListViewButtonClick (btn, pressed) {

        var me          = this,
            messageGrid = me.getMailMessageGrid();

        messageGrid.enableRowPreview(!pressed);
    },


    /**
     * Callback for the reading-pane menu's menuitems' checkchange event.
     * Will delegate to {conjoon.cn_mail.view.mail.inbox.InboxView#toggleReadingPane}
     *
     * @param {Ext.menu.CheckItem} menuItem
     * @param {boolean}            checked
     */
    onReadingPaneCheckChange (menuItem, checked) {

        // exit if checked is set to false. There will
        // follow an immediate call to this method with the
        // menuItem that was set to true instead
        if (!checked) {
            return;
        }

        var me            = this,
            mailInboxView = me.getMailInboxView();

        menuItem = menuItem.getItemId();


        switch (menuItem) {
        case "right":
            return mailInboxView.toggleReadingPane("right");
        case "bottom":
            return mailInboxView.toggleReadingPane("bottom");
        case "hide":
            return mailInboxView.toggleReadingPane();
        }

    },


    /**
     * Callback for the MailFolderTree#s selectionchange event.
     * Disables or enables toolbar buttons depending on the current selection
     * in the MailFolderTree.
     *
     * @param {conjoon.cn_mail.view.mail.folder.MailFolderTree} treeListe
     * @param {conjoon.cn_mail.model.mail.folder.MailFolder[]} records
     *
     * @throws if this method was called with more than one record available
     * in records
     */
    onMailFolderTreeSelectionChange (treeList, records) {

        const me = this;

        if (records.length > 1) {
            Ext.raise({
                records: records,
                msg: "unexpected multiple records"
            });
        }

        let accountSelected = records.length <= 0 ||
            records[0].get("folderType") === conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT;

        if (!me.mailAccountWizardShown) {
            me.getSwitchReadingPaneButton().setDisabled(accountSelected);
        }

        me.getToggleGridListButton().setDisabled(accountSelected);

        if (accountSelected) {
            me.disableMessageItemContextButtons(true);
        } else {
            me.activateButtonsForMessageGrid();
        }
    },


    /**
     * Callback for the MessageGrid's deselect event. Makes sure that editor-
     * related controls are disabled if the currently active view is the InboxView
     *
     * @param selectionModel
     * @param record
     */
    onMailMessageGridDeselect (selectionModel, record) {

        const me = this;

        if (me.getMailDesktopView().getActiveTab() !== me.getMailInboxView()) {
            return;
        }

        me.disableMessageItemContextButtons(true);
    },


    onMailMessageViewItemChange (messageView, messageItem) {
        const me = this;
        // unloaded. disable context buttons, since this most likely means the
        // selection in the sibling grid is lost
        // (The vm of the MessageView is bound to the selection of the grid)
        if (!messageItem) {
            me.disableMessageItemContextButtons(true);
        }
    } ,

    disableMessageItemContextButtons (disable) {
        const me = this;
        me.disableEmailActionButtons(disable);
        me.disableEmailEditButtons(disable);
    },


    /**
     * Callback for the MessageGrid's select event. Makes sure that editor-
     * related controls are enabled.
     *
     * @param selectionModel
     * @param record
     */
    onMailMessageGridSelect (selectionModel, record) {

        const me = this;

        me.activateButtonsForMessageItem(record);

    },


    /**
     * Action for cn_mail/home.
     */
    onHomeTabRoute () {
        var me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.setActiveTab(mailDesktopView.down("cn_mail-mailinboxview"));
    },


    /**
     * Action for the cn_mail/message/read/mailAccountId/mailFolderId:id route.
     *
     * @param {String} mailAccountId
     * @param {String} mailFolderId
     * @param {String} id
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopView#showMailMessageViewFor}
     */
    onReadMessageRoute (mailAccountId, mailFolderId, id) {

        const
            me              = this,
            mailDesktopView = me.getMainPackageView(),
            compoundKey     = me.createCompoundKeyFromUrlFragments(mailAccountId, mailFolderId, id);

        mailDesktopView.showMailMessageViewFor(compoundKey);
    },


    /**
     * Action for the cn_mail/account/:mailAccountId route.
     *
     * @param {String} mailAccountId
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopView#showMailAccountFor}
     */
    onMailAccountRoute (mailAccountId) {
        const me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.showMailAccountFor(decodeURI(mailAccountId));
    },


    /**
     * Action for the cn_mail/folder/:mailAccountId/:id route.
     *
     * @param {String} mailAccountId
     * @param {String} mailFolderId
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopView#showMailFolderFor}
     */
    onMailFolderRoute (mailAccountId, mailFolderId) {
        const me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.showInboxViewFor(
            decodeURI(mailAccountId), decodeURI(mailFolderId)
        );
    },


    /**
     * Action for cn_mail/message/compose.
     *
     * @param {String} id the id to be able to track this MessageEditor instance
     */
    onComposeMessageRoute (id) {
        this.showMailEditor(id, "compose");
    },


    /**
     * Action for cn_mail/message/compose/mailto%3A[id].
     *
     * @param {String} id the id to be able to track this MessageEditor instance
     */
    onComposeMailtoMessageRoute (id) {
        id = "mailto%3A"  + id;
        this.showMailEditor(id, "compose");
    },


    /**
     * Callback for the node navigation's "create new message button".
     *
     * @param {Ext.Button} btn
     */
    onMessageComposeButtonClick (btn) {
        this.showMailEditor(Date.now(), "compose");
    },


    /**
     * Action for cn_mail/message/edit.
     *
     * @param {String} id the id of the message to edit
     */
    onEditMessageRoute (mailAccountId, mailFolderId, id) {
        const me = this;

        me.showMailEditor(
            me.createCompoundKeyFromUrlFragments(mailAccountId, mailFolderId, id),
            "edit"
        );
    },


    /**
     * Action for cn_mail/message/replyTo.
     *
     * @param {String} id the id of the message to edit
     */
    onReplyToRoute (mailAccountId, mailFolderId, id) {
        const me = this;

        me.showMailEditor(
            me.createCompoundKeyFromUrlFragments(mailAccountId, mailFolderId, id),
            "replyTo"
        );
    },


    /**
     * Action for cn_mail/message/replyAll.
     *
     * @param {String} id the id of the message to edit
     */
    onReplyAllRoute (mailAccountId, mailFolderId, id) {
        const me = this;

        me.showMailEditor(
            me.createCompoundKeyFromUrlFragments(mailAccountId, mailFolderId, id),
            "replyAll"
        );
    },


    /**
     * Action for cn_mail/message/forward.
     *
     * @param {String} id the id of the message to edit
     */
    onForwardRoute (mailAccountId, mailFolderId, id) {
        const me = this;

        me.showMailEditor(
            me.createCompoundKeyFromUrlFragments(mailAccountId, mailFolderId, id),
            "forward"
        );
    },


    /**
     * Callback for the node navigation's "edit message button".
     *
     * @param {Ext.Button} btn
     */
    onMessageEditButtonClick (btn) {
        const me  = this,
            key = me.getCompoundKeyFromGridOrMessageView();

        me.showMailEditor(key, "edit");
    },


    /**
     * Callback for the node navigation's "delete message" button.
     *
     * @param {Ext.Button} btn
     */
    onMessageDeleteButtonClick (btn) {
        const me   = this,
            item = me.getDraftOrItemFromActiveView();

        if (!item) {
            console.error ("no item found that could be referenced");
            return;
        }

        me.moveOrDeleteMessage(item);

        return true;
    },

    moveOrDeleteMessage (item) {
        const me = this;

        me.getMailInboxView().getController().moveOrDeleteMessage(
            item,
            false,
            me.getMailDesktopView().getActiveTab()
        );
    },

    /**
     * Callback for the node navigation's "replyTo message button".
     *
     * @param {Ext.Button} btn
     */
    onReplyToButtonClick (btn) {
        const me  = this,
            key = me.getCompoundKeyFromGridOrMessageView();

        me.showMailEditor(key, "replyTo");
    },


    /**
     * Callback for the node navigation's "replyAll message button".
     *
     * @param {Ext.Button} btn
     */
    onReplyAllButtonClick (btn) {
        const me  = this,
            key = me.getCompoundKeyFromGridOrMessageView();

        me.showMailEditor(key, "replyAll");
    },


    /**
     * Callback for the node navigation's "forward message button".
     *
     * @param {Ext.Button} btn
     */
    onForwardButtonClick (btn) {
        const me  = this,
            key = me.getCompoundKeyFromGridOrMessageView();

        me.showMailEditor(key, "forward");
    },


    /**
     * Callback for the node navigation's "add mail account"-button.
     *
     * @return {Boolean}
     */
    onAddMailAccountBtnClick () {
        const me = this;
        me.getMainPackageView().showMailAccountWizard();
    },


    /**
     * Callback for the show/close event of the MailAccountWizard.
     * Will enable/disable toolbar buttons based on the visibiliyt state and the state
     * of available MailAccounts.
     *
     * @param {conjoon.cn_mail.view.mail.account.MailAccountWizard} wizard
     */
    onMailAccountWizardShownOrClosed (wizard) {
        const
            me = this,
            btn = me.getAddMailAccountButton(),
            isVisible = wizard.isVisible(),
            activeAccount = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance().findFirstActiveMailAccount();

        if (isVisible) {
            wizard.on("close", me.onMailAccountWizardShownOrClosed, me, {single: true});
        }

        if (btn) {
            btn.setDisabled(isVisible);
        }
        me.disableUiControlButtons(isVisible);

        me.getCreateMessageButton().setDisabled(
            isVisible || !activeAccount
        );

        me.mailAccountWizardShown = isVisible;
        if (isVisible) {
            me.disableMessageItemContextButtons(true);
        } else {
            me.activateButtonsForMessageGrid();
        }
    },


    disableUiControlButtons (disable) {
        const me = this;

        me.getSwitchReadingPaneButton().setDisabled(disable);
        me.getToggleGridListButton().setDisabled(disable);
        me.getToggleMailFolderButton().setDisabled(disable);
    },


    /**
     * Callback for the MailAccount-Store's activemailaccountavailable event.
     * Will enable/disable the "createMessageButton" based on available.
     *
     * @param {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} store
     * @param {Boolean} available
     */
    onActiveMailAccountAvailable (store, available) {
        const me = this;

        me.getCreateMessageButton().setDisabled(!available);
    },

    /**
     * @inheritdoc
     */
    postLaunchHook () {

        const
            me = this,
            mailAccountStore = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

        mailAccountStore.on("activemailaccountavailable", me.onActiveMailAccountAvailable, me);
        mailAccountStore.loadMailAccounts();


        const data = {
            navigation: [{
                text: "Email",
                route: "cn_mail/home",
                view: "conjoon.cn_mail.view.mail.MailDesktopView",
                iconCls: "fas fa-paper-plane",
                nodeNav: [{
                    xtype: "button",
                    iconCls: "fas fa-plus",
                    itemId: "cn_mail-nodeNavCreateMessage",
                    disabled: true
                }, {
                    xtype: "tbseparator"
                }, {
                    xtype: "button",
                    iconCls: "fas fa-reply",
                    disabled: true,
                    itemId: "cn_mail-nodeNavReplyTo"
                }, {
                    xtype: "button",
                    iconCls: "fas fa-reply-all",
                    itemId: "cn_mail-nodeNavReplyAll",
                    disabled: true
                }, {
                    xtype: "button",
                    iconCls: "fas fa-share",
                    itemId: "cn_mail-nodeNavForward",
                    disabled: true
                }, {
                    xtype: "button",
                    iconCls: "fas fa-edit",
                    itemId: "cn_mail-nodeNavEditMessage",
                    disabled: true
                }, {
                    xtype: "button",
                    iconCls: "fas fa-trash",
                    itemId: "cn_mail-nodeNavDeleteMessage",
                    disabled: true
                }, {
                    xtype: "tbseparator"
                }, {
                    xtype: "button",
                    iconCls: "far fa-folder",
                    disabled: false,
                    cls: "toggleFolderViewBtn",
                    itemId: "cn_mail-nodeNavToggleFolder",
                    enableToggle: true,
                    pressed: true,
                    stateId: "cn_mail-nodeNavToggleFolder",
                    stateEvents: ["click"],
                    stateful: {
                        pressed: true
                    }
                }, {
                    xtype: "button",
                    iconCls: "fas fa-list",
                    disabled: true,
                    cls: "toggleGridViewBtn",
                    itemId: "cn_mail-nodeNavToggleList",
                    enableToggle: true
                }, {
                    xtype: "button",
                    disabled: true,
                    iconCls: "fas fa-columns",
                    itemId: "cn_mail-nodeNavReadingPane",
                    menu: [{
                        iconCls: "fas fa-toggle-right",
                        text: "Right",
                        itemId: "right",
                        checked: true,
                        xtype: "menucheckitem",
                        group: "cn_mail-nodeNavReadingPaneRGroup"
                    }, {
                        iconCls: "fas fa-toggle-down",
                        text: "Bottom",
                        itemId: "bottom",
                        xtype: "menucheckitem",
                        group: "cn_mail-nodeNavReadingPaneRGroup"
                    }, {
                        iconCls: "fas fa-close",
                        text: "Hidden",
                        itemId: "hide",
                        xtype: "menucheckitem",
                        group: "cn_mail-nodeNavReadingPaneRGroup"
                    }]
                }]
            }]
        };


        if (me.mailAccountHandler.enabled()) {
            data.navigation[0].nodeNav.push({
                xtype: "tbseparator"
            });
            data.navigation[0].nodeNav.push({
                xtype: "button",
                iconCls: "fas fa-at",
                itemId: "cn_mail-addMailAccountBtn"
            });
        }

        return data;
    },


    /**
     * Returns the main view for this package and creates it if not already
     * available.
     *
     * @return {conjoon.cn_mail.view.mail.MailDesktopView}
     */
    getMainPackageView () {
        var me  = this,
            app = me.getApplication();

        let title = app.getPackageConfig(me, "title");
        title && Ext.fireEvent("conjoon.application.TitleAvailable", me, title);

        /**
         * @type {conjoon.cn_mail.view.mail.MailDesktopView}
         */
        return app.activateViewForHash("cn_mail/home");
    },


    privates: {


        /**
         * Returns either a MessageDraft or a MessageItem from the currently
         * active view, which can be any of the following:
         *  - MessageEditor
         *  - MessageView
         *  - InboxView
         *
         *  If the InboxView is opened, the selected MessageItem in the grid
         *  will be returned.
         *
         * @return {null|conjoon.cn_mail.model.mail.message.AbstractMessageItem}
         */
        getDraftOrItemFromActiveView () {

            const me  = this,
                tab = me.getMailDesktopView().getActiveTab();

            if (tab instanceof conjoon.cn_mail.view.mail.message.editor.MessageEditor) {
                return tab.getMessageDraft();
            }

            return me.getItemFromGridOrMessageView();
        },


        getItemFromGridOrMessageView () {
            const
                me  = this,
                tab = me.getMailDesktopView().getActiveTab();

            if (tab instanceof conjoon.cn_mail.view.mail.message.reader.MessageView) {
                return  tab.getMessageItem();
            } else if (tab === me.getMailInboxView()) {
                if (me.getMailMessageGrid().getSelection()) {
                    return me.getMailMessageGrid().getSelection()[0];
                }
                return me.getMailInboxMessageView().getMessageItem();
            }
        },

        /**
         * Helper function to retrieve the compound key of the selected record in
         * the InboxView's MessageGrid, MessageView OR of the MessageItem of a MailDesktopView's MessageView,
         * depending on which tab is currently active in the MailDesktopView.
         * The method will first query the MailDesktopView, then the embedded InboxView.
         *
         * @return {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey}
         *
         * @private
         */
        getCompoundKeyFromGridOrMessageView () {

            const
                me  = this,
                item = me.getItemFromGridOrMessageView ();

            return item?.getCompoundKey();
        },


        /**
         * Internal callback for the cn_mail-messageitemload event of an activated
         * tab which has not loaded a MessageItem yet, thus cannot provide any
         * information whether the MessageItem which is about to load is a message
         * flagged as "draft".
         *
         * @param {conjoon.cn_mail.view.mail.message.reader.MessageView} messageView
         * @param {conjoon.cn_mail.model.mail.message.MessageItem}} messageItem
         *
         * @private
         */
        onMailMessageItemLoadForActivatedView (messageView, messageItem) {

            const me = this;

            if (!messageItem) {
                messageItem = messageView.getViewModel().get("messageItem");
            }

            if (messageItem?.get("draft")) {
                me.disableEmailActionButtons(true);
                me.disableEmailEditButtons(false, false);
            } else {
                me.disableEmailActionButtons(false);
                me.disableEmailEditButtons(true, false);
            }

            me.observedMessageView = null;
        },


        /**
         * Opens the MaiLEditor for the specified id and the specified action (
         * one of edit, compose, replyTo, replyAll, forward).
         *
         * @param {String|conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} key
         * @param {String} type
         *
         * @private
         *
         * @throws if type is not "compose" and key is not an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
         */
        showMailEditor (key, type) {

            var me              = this,
                mailDesktopView = me.getMainPackageView();

            if (type !== "compose" &&
                !(key instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey)) {
                console.error ({
                    msg: "anything but \"compose\" expects an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                    key: key,
                    type: type
                });
                return;
            }

            return mailDesktopView.showMailEditor(key, type);
        }

    },


    /**
     * Returns a compound key for whch all keys have been sanitized and stripped
     * from url-encoded chars.
     *
     * @param {String} mailAccountId
     * @param {String} mailFolderId
     * @param {String} id
     *
     * @return {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey}
     *
     * @private
     */
    createCompoundKeyFromUrlFragments (mailAccountId, mailFolderId, id) {

        return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
            decodeURIComponent(mailAccountId),
            decodeURIComponent(mailFolderId),
            decodeURIComponent(id)
        );

    },


    /**
     * Helper function activating/disabling buttons once a fully configured and
     * loaded MessageEditor is activated
     *
     * @private
     */
    messageEditorIsActivatedTab () {
        const me = this;

        me.disableEmailActionButtons(true);
        me.disableEmailEditButtons(true, false);
    }

});
