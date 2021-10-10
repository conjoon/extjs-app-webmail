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
 * This is the view controller for {@link conjoon.cn_mail.view.mail.MailDesktopView}.
 * It mainly provides and delegates event handling between the embedded views.
 *
 * The routes configuration used here can be found in the PackageController.
 */
Ext.define("conjoon.cn_mail.view.mail.MailDesktopViewController", {

    extend: "Ext.app.ViewController",

    requires: [
        // @define
        "l8",
        "conjoon.cn_mail.view.mail.message.reader.MessageView",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditor",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel",
        "conjoon.cn_mail.text.QueryStringParser",
        "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig",
        "conjoon.cn_mail.data.mail.message.EditingModes",
        "conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest",
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes",
        "conjoon.cn_mail.data.mail.message.CompoundKey"
    ],

    alias: "controller.cn_mail-maildesktopviewcontroller",


    control: {

        "cn_mail-maildesktopview": {
            "tabchange": "onTabChange"
        },
        "cn_mail-maildesktopview > cn_mail-mailmessagereadermessageview": {
            "cn_mail-mailmessageitemread": "onMessageItemRead"
        },
        "cn_mail-mailmessagegrid": {
            "rowdblclick": "onMailMessageGridDoubleClick"
        },
        "cn_mail-mailmessagegrid #cn_mail-mailmessagegrid-refresh": {
            "click": "onMailMessageGridRefreshClick"
        },
        "cn_mail-mailmessageeditor": {
            "cn_mail-mailmessagesavecomplete": "onMailMessageSaveComplete",
            "cn_mail-mailmessagesendcomplete": "onMailMessageSendComplete"
        },
        "cn_mail-maildesktopview > cn_mail-mailinboxview": {
            "cn_mail-beforemessageitemdelete": "onBeforeMessageItemDelete",
            "cn_mail-messageitemmove": "onMessageItemMove"
        },
        "cn_mail-mailinboxview #btn-replyall": {
            "click": "onInboxViewReplyAllClick"
        },
        "cn_mail-mailinboxview #btn-reply": {
            "click": "onInboxViewReplyClick"
        },
        "cn_mail-mailinboxview #btn-forward": {
            "click": "onInboxViewForwardClick"
        },
        "cn_mail-mailinboxview #btn-editdraft": {
            "click": "onInboxViewEditDraftClick"
        }

    },

    /**
     * @private
     */
    mailInboxView: null,

    /**
     * Used to map itemIds to localIds of MessageItems/Drafts represented in editors/
     * views; localIds may change during the lifespan of a view, itemIds must alsways stay
     * the same.
     * @private
     */
    messageViewIdMap: null,

    /**
     * @type {conjoon.cn_mail.text.QueryStringParser}
     * @private
     */
    parser: null,

    /**
     * @private
     */
    starvingEditors: null,

    /**
     * @private
     */
    defaultAccountInformations: null,


    /**
     * Constructor.
     */
    constructor: function () {
        const me = this;

        me.messageViewIdMap = {};

        me.callParent(arguments);
    },


    init () {
        "use strict";

        const
            me      = this,
            view    = me.getView(),
            msgGrid = view.down("cn_mail-mailmessagegrid");

        me.mon(msgGrid.view.getScrollable(), "scroll", me.onMessageGridScroll, me, {buffer: 500});
    },


    /**
     * Callback for the embedded InboxView's cn_mail-beforemessageitemdelete event.
     * Checks if there are currently any opened editors and vetoes removal
     * should this be the case.
     *
     * @param {conjoon.cn_mail.view.mail.inbox.InboxView} inboxView
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} messageItem
     * @param {Ext.Panel} requestingView if specified, any opened tab that is this
     * requestingView will not cancel the delete process
     *
     * @return {Boolean}
     *
     * @see MailDesktopView#showMessageCannotBeDeletedWarning
     */
    onBeforeMessageItemDelete: function (inboxView, messageItem, requestingView = null) {

        const me          = this,
            view        = me.getView(),
            compoundKey = messageItem.isCompoundKeyConfigured()
                ? messageItem.getCompoundKey()
                : null;

        if (!compoundKey) {
            return true;
        }

        let coll = me.getMessageItemsFromOpenedViews(compoundKey, true);

        for (let i = 0, len = coll.length; i < len; i++) {
            let openedView = coll[i].view;

            if (openedView && openedView !== requestingView) {
                view.showMessageCannotBeDeletedWarning(messageItem);
                view.setActiveTab(openedView);
                return false;
            }
        }

        return true;
    },


    /**
     * Callback for the cn_mail-messageitemmove event. Delegates to #showMessageMovedInfo
     * of this controller's view if the requestingView ist not the embedded InboxView.
     * Will also update all opened views representing this messageItem as an item
     * or draft with the new mailFolderId.
     *
     * @param {conjoon.cn_mail.view.mail.inbox.InboxView} view
     * @param {conjoon.cn_mail.modelw.mail.message.AbstractMessageItem} messageItem
     * @param {Ext.Panel}requestingView
     * @param {conjoon.cn_mail.modelw.mail.folder.MailFolder} sourceFolder
     * @param {conjoon.cn_mail.modelw.mail.folder.MailFolder} targetFolder
     *
     * @see MailDesktopView#showMessageMovedInfo
     * @see updateMessageItemsFromOpenedViews
     * @see updateHistoryForMessageRelatedView
     */
    onMessageItemMove: function (view, messageItem, requestingView, sourceFolder, targetFolder) {

        const me = this;

        if (requestingView !== view) {
            me.getView().showMessageMovedInfo(messageItem, sourceFolder, targetFolder);
        }

        me.updateMessageItemsFromOpenedViews(
            messageItem.getPreviousCompoundKey(), {
                "mailFolderId": targetFolder.get("id"),
                "id": messageItem.get("id")
            });

        // we have an updated compound key now
        let collection = me.getMessageItemsFromOpenedViews(messageItem.getCompoundKey(), true),
            i, len, panel;


        for (i = 0, len = collection.length; i < len; i++) {
            panel = collection[i].view;

            me.updateHistoryForMessageRelatedView(panel, messageItem);
        }
    },


    /**
     * Creates a new mail editor for writing an email message, adding a
     * cn_href-property  to the tab.
     * This controller method distinguishes between to datatypes specified with
     * id:< Number and String. If id is a number, it is assumed that a regular,
     * blank composer instance should be opened. If id is a string, it is assumed
     * that the passed id is part of the value of the mailto: protocol, and the
     * created MessageEitor will be adjusted to hold the information as specified
     * in the string.
     *
     * @param {Number/String/conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey} key
     * an id to be able to track this MessageEditor later on
     * when routing is triggered. if id is a string, it is assumed to be a
     * syntax of the mailto scheme (including protocol), and mights still be uri encoded.
     * A compound key is used when te editor is opened in a context other than
     * compose
     *
     * @param {String} type The context in which the mail editor was opened in
     * (edit/compose)

     * @return conjoon.cn_mail.view.mail.message.editor.MessageEditor
     *
     * @throws if no valid id was specified (bubbles exceptions from
     * #getItemIdForMessageRelatedView and #buildCnHref)
     */
    showMailEditor: function (key, type) {

        const me = this,
            view = me.getView(),
            EditingModes = conjoon.cn_mail.data.mail.message.EditingModes,
            CopyRequest  = "conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest",
            defInfo = me.defaultAccountInformations;

        let newView,
            initialConfig = {
                messageDraft: null
            },
            itemId  = me.getItemIdForMessageRelatedView(key, type),
            cn_href = me.buildCnHref(key, type),
            defaults = {};

        if (me.defaultAccountInformations) {
            defaults.defaultMailAccountId = defInfo.mailAccountId;
            defaults.defaultMailFolderId  = defInfo.mailFolderId;
        }

        // MessageDraft === MessageDraftCopyRequest
        // MessageDraft === key
        // MessageDraft === MessageDraftConfig
        switch (type) {
        case "edit":
            initialConfig.messageDraft = key;
            break;
        case "replyTo":
            initialConfig.messageDraft = Ext.create(CopyRequest, Ext.apply({
                compoundKey: key, editMode: EditingModes.REPLY_TO
            },  defaults));
            break;
        case "replyAll":
            initialConfig.messageDraft = Ext.create(CopyRequest, Ext.apply({
                compoundKey: key, editMode: EditingModes.REPLY_ALL
            },  defaults));
            break;
        case "forward":
            initialConfig.messageDraft = Ext.create(CopyRequest, Ext.apply({
                compoundKey: key, editMode: EditingModes.FORWARD
            }, defaults));
            break;
        default:
            initialConfig.messageDraft = me.createMessageDraftConfig(
                key, defInfo ? defInfo : {}
            );
            break;
        }

        newView = view.down("#" + itemId);

        if (!newView) {
            newView = view.add(Ext.apply(initialConfig, {
                xtype: "cn_mail-mailmessageeditor",
                margin: "12 5 5 0",
                itemId: itemId,
                cn_href: cn_href
            }));

            if (!defInfo && type !== "edit") {
                if (!me.starvingEditors) {
                    me.starvingEditors = [];
                }

                me.starvingEditors.push(itemId);
            }
        }

        view.setActiveTab(newView);

        return newView;
    },


    /**
     * Shwows the conjoon.cn_mail.view.mail.account.MailAccountView for the MailAccount
     * specified by the mailAccountId.
     *
     * @param {String} mailAccountId
     *
     * @return {conjoon.cn_mail.view.mail.account.MailAccountView}
     */
    showMailAccountFor: function (mailAccountId) {

        const me          = this,
            view        = me.getView(),
            inboxView   = view.down("cn_mail-mailinboxview"),
            accountView = inboxView.down("cn_mail-mailaccountview"),
            tree        = inboxView.down("cn_mail-mailfoldertree"),
            store       = tree.getStore();

        if (store.isLoading() || store.getProxy().type === "memory") {
            inboxView.mon(tree, "load",
                Ext.Function.bind(
                    me.processMailFolderSelectionForRouting, me, [mailAccountId, null, true]
                ),
                me, {single: true});
        } else {
            me.processMailFolderSelectionForRouting(mailAccountId, null, true);
        }

        view.setActiveTab(inboxView);
        return accountView;

    },


    /**
     * Shows the InboxView and selects the specified mailFolderId for the
     * specified mailAccountId.
     * Delegates to #processMailFolderSelectionForRouting. If the store of the
     * MailFolderTree is not yet bound by the MVVM or currently being loaded,
     * the processMailFolderSelectionForRouting-method is invoked as soon as
     * loading of the MailFolderTree's store finished.
     *
     * @param {String} mailAccountId
     * @param {String} mailFolderId
     *
     * @return conjoon.cn_mail.view.mail.inbox.InboxView
     *
     * @see #processMailFolderSelectionForRouting
     */
    showInboxViewFor: function (mailAccountId, mailFolderId) {

        const me        = this,
            view      = me.getView(),
            inboxView = view.down("cn_mail-mailinboxview"),
            tree      = inboxView.down("cn_mail-mailfoldertree"),
            store     = tree.getStore();

        if (store.isLoading() || store.getProxy().type === "memory") {
            inboxView.mon(tree, "load",
                Ext.Function.bind(
                    me.processMailFolderSelectionForRouting, me, [mailAccountId, mailFolderId]
                ),
                me);
        } else {
            me.processMailFolderSelectionForRouting(mailAccountId, mailFolderId);
        }

        return view.setActiveTab(inboxView);
    },


    /**
     * Selects the MailFolder represented by the mailFolderId for the
     * mailAccountId and makes sure that the "cn_href" attribute of the
     * InboxView-tab is being changed to the "toUrl()"-return value
     * of the selected MailFolder to make the tabchange-listener
     * working with the deeplinking into ONE panel.
     *
     * @param {String} mailAccountId
     * @param {String} mailFolderId
     * @param {Boolean} shouldSelectMailFolder advises the method to select the
     * folder specified by mailAccountId if,  and only if mailFolderId equals to null
     *
     * @return {Boolean} false if the specified MailFolder was not found
     *
     * @private
     */
    processMailFolderSelectionForRouting: function (mailAccountId, mailFolderId, shouldSelectMailFolder = false) {

        const me        = this,
            view      = me.getView(),
            inboxView = view.down("cn_mail-mailinboxview"),
            tree      = inboxView.down("cn_mail-mailfoldertree");

        let rec,
            accountNode = tree.getStore().getRoot().findChild(
                "id", mailAccountId, false
            );

        if (!accountNode) {
            return false;
        } else if (shouldSelectMailFolder === true && mailFolderId === null) {
            rec = accountNode;
        } else {
            rec = accountNode.findChild("id", mailFolderId, true);

            if (!rec) {
                return false;
            }
        }

        inboxView.cn_href = rec.toUrl();
        tree.getSelectionModel().select(rec);
        Ext.History.add(inboxView.cn_href);

        let pn = rec.parentNode;
        while (pn) {
            pn.expand();
            pn = pn.parentNode;
        }

        return true;
    },


    /**
     * Tries to find an existing MessageView opened in the view and focus it,
     * or create a new one by adding it to the view.
     * The associated messageItem record will be queried in the MessageGrid and
     * reused for the new view if possible.
     *
     * @param {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} compoundKey
     *
     * @return {conjoon.cn_mail.view.mail.message.reader.MessageView}
     *
     * @throws id compoundKey is not an instance of
     */
    showMailMessageViewFor: function (compoundKey) {

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey)) {
            Ext.raise({
                msg: "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                compoundKey: compoundKey
            });
        }

        var me      = this,
            view    = me.getView(),
            itemId  = me.getItemIdForMessageRelatedView(compoundKey, "read"),
            newView = view.down("#" + itemId),
            msgGrid = view.down("cn_mail-mailmessagegrid"),
            store   = msgGrid ? msgGrid.getStore(): null,
            recInd  = store && !store.isEmptyStore ? store.findByCompoundKey(compoundKey) : -1;

        if (!newView) {

            newView = view.add({
                xtype: "cn_mail-mailmessagereadermessageview",
                itemId: itemId,
                cn_href: me.buildCnHref(compoundKey, "read"),
                margin: "12 5 5 0"
            });

            if (recInd > -1) {
                newView.setMessageItem(store.getAt(recInd));
            } else {
                // most likely opened via deeplinking
                newView.loadMessageItem(compoundKey);
            }
        }

        me.getView().setActiveTab(newView);

        return newView;
    },


    /**
     * Callback for the cn_mail-mailmessagesendcomplete event.
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @see conjoon.cn_mail.view.mail.inbox.InboxView#updateViewForSentDraft
     */
    onMailMessageSendComplete: function (editor, messageDraft) {

        const me = this;

        me.getView().down("cn_mail-mailinboxview").updateViewForSentDraft(
            messageDraft
        );
    },


    /**
     * Callback for the MessageEditor's  cn_mail-mailmessagesavecomplete event that gets
     * triggered from editor instances.
     * Looks up any referencing view of the currently saved draft and will update
     * its data with the newly committed data.
     * Grid actions will only be triggered if the grid is currently representing
     * the contents of a DRAFT-inbox.
     *
     * @param {conjoon.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param operation
     * @param {Boolean} isSend
     * @param {Boolean} isCreated
     */
    onMailMessageSaveComplete: function (editor, messageDraft, operation, isSend, isCreated) {

        const me               = this,
            view             = me.getView(),
            messageGrid      = view.down("cn_mail-mailmessagegrid"),
            itemStore        = messageGrid ? messageGrid.getStore() : null,
            inboxView        = view.down("cn_mail-mailinboxview"),
            inboxMessageView = inboxView ? inboxView.down("cn_mail-mailmessagereadermessageview") : null;

        let inboxMessageViewId, messageItem, recInd, messageView, prevItemId, preBatchCompoundKey;

        preBatchCompoundKey = messageDraft.getPreBatchCompoundKey();

        // use the PREVIOUS itemId that was available before saving completed;
        // this is the same behavior as in the onMessageItemMove
        if (preBatchCompoundKey) {
            prevItemId = me.getItemIdForMessageRelatedView(preBatchCompoundKey, "read");
            messageView = view.down("#" + prevItemId);
        }

        me.updateHistoryForMessageRelatedView(editor, messageDraft);

        if (isCreated) {
            inboxView.updateViewForCreatedDraft(messageDraft);
            return;
        }

        // we will add a key later on - the id of the MessageDraft,
        // if the MessageDraft is currently shown in the MessageView of the InboxPanel
        let keysToConsider = [];
        if (preBatchCompoundKey) {
            keysToConsider.push(preBatchCompoundKey);
        }

        // this is two-way-data bound and should only be queried by us if the
        // selected folder / opened grid is DRAFT related
        if (inboxMessageView && preBatchCompoundKey) {

            inboxMessageViewId = inboxMessageView.getViewModel().get("messageItem.localId");

            if (inboxMessageViewId === preBatchCompoundKey.toLocalId()) { //previousLocalId) {
                // Due to the two way-data binding between the grid and the message
                // view, we do not need to update the associated item in the
                // grid. Just update the MessageView, changes should be reflected
                // in the grid
                // however, if the binding got lost due to a reload of the grid or similiar,
                // we have to take care of updating the grid again
                inboxMessageView.updateMessageItem(messageDraft);
                keysToConsider.push(messageDraft.getCompoundKey());
            }
        }

        if (messageGrid && keysToConsider.length) {

            // loop through the keys and start with the last index as this
            // will hold the CompoundKey of the MessageDraft in the MessageView
            // if we find the item in the grid with this key, we do not have to
            // query further. Otherwise, we will look up the record with the PreBatchCompoundKey,
            // as most likely the binding between MessageGrid and MessageView was destroyed
            // due to reloading the grid or similiar
            for (let i = keysToConsider.length - 1; i >= 0; i--) {
                recInd = itemStore.findExact("localId", keysToConsider[i].toLocalId());
                if (recInd > -1) {
                    break;
                }
            }

            if (recInd > -1) {
                messageItem = itemStore.getAt(recInd);
                // selection is ut of sync. Recompute and reselect if record was previously selected
                let currentSelection = messageGrid.getSelectionModel().getSelected().getAt(0);
                if (currentSelection && currentSelection.getId() === messageDraft.getId()) {
                    messageGrid.getSelectionModel().clearSelections();
                    messageGrid.getSelectionModel().select(recInd);
                }
                conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater.updateItemWithDraft(
                    messageItem, messageDraft
                );
            }
        }

        if (messageView) {
            messageView.updateMessageItem(messageDraft);
            me.updateHistoryForMessageRelatedView(messageView, messageDraft);
        }

    },

    /**
     * Callback for MessageViews' cn_mail-mailmessageitemread events.
     * Events get forwarded to this view's embedded InboxView's controller.
     *
     * @param {Array|conjoon.cn_mail.model.mail.message.MessageItem} messageItemRecords
     *
     * @see {conjoon.cn_mail.view.mail.inbox.InboxViewController#onMessageItemRead}
     */
    onMessageItemRead: function (messageItemRecords) {

        var me = this;

        if (!me.mailInboxView) {
            me.mailInboxView = me.getView().down("cn_mail-mailinboxview");
        }

        me.mailInboxView.getController().onMessageItemRead(messageItemRecords);
    },

    /**
     * Callback for the embedded MessageGrid's doubleclick event.
     * Redirects to this PackageController's cn_mail/message/read/:mailAccountId/:mailFolderId/:id route.
     *
     * @param {conjoon.cn_mail.view.mail.message.MessageGrid} grid
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} record
     */
    onMailMessageGridDoubleClick: function (grid, record) {

        var me = this;

        me.redirectTo(
            ["cn_mail/message/read",
                conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
                    .fromRecord(record).toArray().join("/")
            ].join("/")

        );
    },

    /**
     * Callback for the tabchange event of this controller's view.
     * Will make sure to properly update the hash of the location for
     * browsing through the history of this package views.
     *
     * @param tabPanel
     * @param newCard
     * @param oldCard
     * @param eOpts
     */
    onTabChange: function (tabPanel, newCard, oldCard, eOpts) {

        const me     = this,
            itemId = newCard.getItemId();

        if (!newCard.cn_href) {
            return;
        }

        let replace = false;

        // look up an existing one, e.g. if the newCard has a previous entry in the messageItemIds
        for (let i in me.messageViewIdMap) {
            let entry = me.messageViewIdMap[i];
            if (entry.itemId === itemId && entry.deprecated === true) {
                replace = true;
                break;
            }
        }

        if (replace === true) {
            Ext.History.replace(newCard.cn_href);
        } else {
            Ext.History.add(newCard.cn_href);
        }
    },


    /**
     * Computes a valid itemId to use with an MessageEditor or MessageView instance,
     * depending on the type. This is needed since ids might be string containing
     * special chars, and to map itemIds to localIds which change during the lifespan
     * of a message, and to refer to always one and the same editor/view instance.
     * This method is guaranteed to return one and the same id for one and the same specified
     * string/compoundKey during the lifetime of "this" instance.
     *
     * @param {String|conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} id
     * @param {String} type the context in which the mail editor was opened in
     *
     * @return {String}
     *
     * @private
     *
     * @throws if id or type is not valid, or if the context is not compose and
     * id is not a compound key
     */
    getItemIdForMessageRelatedView: function (id, type) {

        const me = this;

        let newId,
            isInstance = me.checkArgumentsForEditorOrView(id, type);

        newId = "cn_mail-" + type + "-" + Ext.id();

        id = (isInstance ? id.toLocalId() : id);
        id = me.computeIdForMessageViewMap(id, type);

        if (!me.messageViewIdMap[id]) {
            me.messageViewIdMap[id] = {itemId: newId};
        }

        return  me.messageViewIdMap[id].itemId;
    },


    /**
     * Builds a cn_href value to use with a MessageEditor or a MessageView that
     * represents the route used to activate the specific view.
     *
     * @param {{String|conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} id
     * @param {String} type the context in which the mail editor was opened in
     *
     * @return {String}
     *
     * @private
     *
     * @throws from #checkArgumentsForEditorOrView
     *
     * @see checkArgumentsForEditor
     */
    buildCnHref: function (id, type) {

        const me = this;

        let isInstance = me.checkArgumentsForEditorOrView(id, type);

        id = isInstance ? id.toArray().join("/") : id;

        switch (type) {
        case "read":
            return "cn_mail/message/read/" + id;

        case "edit":
            return "cn_mail/message/edit/" + id;

        case "replyTo":
            return "cn_mail/message/replyTo/" + id;

        case "replyAll":
            return "cn_mail/message/replyAll/" + id;

        case "forward":
            return "cn_mail/message/forward/" + id;

        default:
            return "cn_mail/message/compose/" + id;
        }
    },


    /**
     * Helper function to make sure that the id of the cn_mail/message/compose/mailto...
     * fragment is parsed properly and returned as a MessageDraftConfig object.
     * If "mailto" was not found at the start of the passed argument, the argument is
     * returned.
     * If the mailto contains a body-param, this body param will be saved
     * under textHtml in the resulting MessageDraftConfig object.
     *
     * @param {String} id
     * @param {Object} defaultConfig
     *
     * @return {conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig/Mixed}
     *
     * @private
     *
     * @throws if id is not set or if it is not a string or not a number
     */
    createMessageDraftConfig: function (id, defaultConfig = {}) {

        const me = this;

        if (!id || (!Ext.isString(id) && !Ext.isNumber(id))) {
            Ext.raise({
                key: id,
                msg: "\"id\" is not a valid value"
            });
        }

        let pos,
            addresses,
            res,
            tmpId,
            encodedId = decodeURIComponent(id + "");


        if (Ext.String.startsWith(encodedId, "mailto:", true)) {
            encodedId = encodedId.substring(7);
        } else {
            return Ext.create(
                "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig",
                defaultConfig
            );
        }

        addresses = "";

        if ((pos = encodedId.indexOf("?")) !== -1) {
            addresses = encodedId.substring(0, pos).split(",");
            encodedId = encodedId.substring(pos);
        } else {
            addresses = encodedId ? encodedId.split(",") : [];
            encodedId = "";
        }

        if (!encodedId) {
            if (addresses && addresses.length) {
                return Ext.create(
                    "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", Ext.apply({
                        to: addresses
                    }, defaultConfig));
            }
            return Ext.create(
                "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig",
                defaultConfig
            );
        }

        if (!me.parser) {
            me.parser = Ext.create("conjoon.cn_mail.text.QueryStringParser");
        }
        res = me.parser.parse(encodedId);

        for (var i in res) {
            if (!Object.prototype.hasOwnProperty.call(res, i)) {
                continue;
            }
            tmpId = true;
            while (tmpId) {
                tmpId = decodeURIComponent(res[i]);
                if (!tmpId || (tmpId === res[i])) {
                    break;
                }
                res[i] = tmpId;
            }
        }

        if (Object.prototype.hasOwnProperty.call(res, "body")) {
            res.textHtml = res.body;
            delete res.body;
        }

        return Ext.create(
            "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig",
            Ext.apply(Ext.apply({
                to: addresses
            }, res), defaultConfig)
        );
    },


    /**
     * Method gets called as soon as the saving of a newly composed message
     * finishes, or if a message was moved to a new folder. It takes care of the
     * following:
     *  - remapping messageViewIdMap so that a new mapping between the editor/view
     *  in its new context is successfull and deeplinking targets the correct view.
     *  - compute and assign a new token for the view's cn_href-attribute (which
     *  is also returned by this method)
     *  - call window.location.replace with the newly generated cn_href. This
     *  will only happen if the current active tab of the MailDesktopView
     *  is the editor passed to this method.
     *  (Ext.History-events are suspended and resumed after a timeout of 500 ms,
     *  since the Ext.History queries the changes to the window hash in a
     *  frequent interval (ExtJS6.2: 50ms))
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @oaram {conjoon.cn_mail.model.mail.message.AbstractMessageItem} messageItem The
     * newly created message draft
     *
     * @return {String} the newly computed cn_href attribute of the editor, or NULL
     * if no new cn_href value was assigned
     *
     * @throws if the editMode of the specified editor is not
     * conjoon.cn_mail.data.mail.message.EditingModes#CREATE
     *
     * @private
     */
    updateHistoryForMessageRelatedView: function (panel, messageItem) {

        const me   = this,
            view = me.getView();

        let type = null;

        if (panel) {
            type = panel.isCnMessageEditor ? "edit" : "read";
        }

        if (!(messageItem instanceof conjoon.cn_mail.model.mail.message.AbstractMessageItem)) {
            Ext.raise({
                msg: "\"messageItem\" must be an instance of conjoon.cn_mail.model.mail.message.AbstractMessageItem",
                messageItem: messageItem
            });
        }

        let compoundKey = messageItem.getCompoundKey(),
            newToken    = me.buildCnHref(compoundKey, type);

        if (newToken === panel.cn_href) {
            return null;
        }

        me.updateMessageViewIdMapForMessage(panel, messageItem, type);

        panel.cn_href = newToken;

        if (view.getActiveTab() === panel) {
            Ext.History.suspendEvents();
            window.location.replace("#" + newToken);
            Ext.Function.defer(function () {
                Ext.History.resumeEvents();
            }, 500);
        }

        return newToken;
    },


    /**
     * Remaps itemIds to localIds. This method is needed to make sure views with
     * specific itemIds always return to one and the same localId, and vice versa.
     *
     * @param {conjoon.cn_mail.view.mail.message.reader.MessageView|conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @param {conjoon.cn_mail.modelw.mail.message.AbstractMessageItem} messageItem
     * @param {String} type The context the view is shown for (read, edit, compose)
     *
     * @private
     */
    updateMessageViewIdMapForMessage: function (panel, messageItem, type) {

        const me           = this,
            EditingModes = conjoon.cn_mail.data.mail.message.EditingModes;

        if (!panel || (!panel.isCnMessageEditor && !panel.isCnMessageView)) {
            Ext.raise({
                msg: Ext.String.format("\"panel\" does not seem to be a MessageEditor or MessageView"),
                panel: panel
            });
        }

        let validModes = [EditingModes.CREATE, EditingModes.EDIT, EditingModes.REPLY_TO,
            EditingModes.REPLY_ALL, EditingModes.FORWARD];

        if (panel.isCnMessageEditor && validModes.indexOf(panel.editMode) === -1) {
            Ext.raise({
                msg: Ext.String.format("'editMode' of Editor must be any of {0}", validModes.join(", ")),
                editor: panel
            });
        }

        let compoundKey = messageItem.getCompoundKey(),
            panelItemId = panel.getItemId(),
            mapId       = me.computeIdForMessageViewMap(compoundKey.toLocalId(), type);

        // add the new itemId so we can keep track of relations between
        // changed compound keys and previous entries in the history,
        // but mark previous entries as deprecated
        for (let i in me.messageViewIdMap) {
            let entry = me.messageViewIdMap[i];
            if (entry.itemId === panelItemId) {
                entry.deprecated = true;
            }
        }
        me.messageViewIdMap[mapId] = {itemId: panelItemId};
    },


    /**
     * Callback for the reply all button of the InboxView's MessageView. Will
     * open the editor for replying to the message.
     *
     * @return {conjoon.cn_mail.view.mail.message.editor.MessageEditor}
     *
     * @see #redirectToEditorFromInboxMessageView
     */
    onInboxViewReplyClick: function () {
        this.redirectToEditorFromInboxMessageView("replyTo");
    },


    /**
     * Callback for the reply all button of the InboxView's MessageView. Will
     * open the editor for forwarding the message.
     *
     * @return {conjoon.cn_mail.view.mail.message.editor.MessageEditor}
     *
     * @see #redirectToEditorFromInboxMessageView
     */
    onInboxViewForwardClick: function () {
        this.redirectToEditorFromInboxMessageView("forward");
    },


    /**
     * Callback for the reply all button of the InboxView's MessageView. Will
     * open the editor for replying to the message.
     *
     * @return {conjoon.cn_mail.view.mail.message.editor.MessageEditor}
     *
     * @see #redirectToEditorFromInboxMessageView
     */
    onInboxViewReplyAllClick: function () {
        this.redirectToEditorFromInboxMessageView("replyAll");
    },


    /**
     * Callback for the edit draft button of the InboxView's MessageView. Will
     * open the editor for editing the draft.
     *
     * @return {conjoon.cn_mail.view.mail.message.editor.MessageEditor}
     *
     * @see #redirectToEditorFromInboxMessageView
     */
    onInboxViewEditDraftClick: function () {
        this.redirectToEditorFromInboxMessageView("edit");
    },


    /**
     * Helper method for bulding the url for redirecting to the editor using the
     * specified type.
     *
     * @param {String} type
     *
     * @private
     */
    redirectToEditorFromInboxMessageView: function (type) {

        const me  = this,
            ck  = me.getCompoundKeyFromInboxMessageView(),
            uri = ["cn_mail/message/" + type, ck.toArray().join("/")].join("/");

        me.redirectTo(uri);

        return uri;
    },


    /**
     * Returns the compound key of the MessageItem currently loaded into the MessageView
     * of the InboxView.
     *
     * @return {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey}
     *
     * @private
     */
    getCompoundKeyFromInboxMessageView: function () {

        let m = this.getView()
            .down("cn_mail-mailinboxview")
            .down("cn_mail-mailmessagereadermessageview")
            .getViewModel().get("messageItem");

        return m.getCompoundKey();
    },


    /**
     * Returns an array keyed with view and messageItem with all messageItems
     * available from representing views currently in the MailDesktopView.
     * Will also consider the MessageView embedded in this MailDesktopView's
     * InboxView.
     *
     * @param {conjoon.cn_mail.data.mail.message.CompoundKey} compoundKey optional,
     * will return only those items with the specified compoundKey, otherwise all
     * items currently opened will be returned
     *
     * @return {Array}
     *
     * @private
     */
    getMessageItemsFromOpenedViews: function (compoundKey = null, skipInbox = false) {

        const me           = this,
            view         = me.getView(),
            inboxMsgView = skipInbox !== true
                ? view.down("cn_mail-mailinboxview")
                    .down("cn_mail-mailmessagereadermessageview")
                : null;

        let collection = [],
            add        = function (view, messageItem) {
                collection.push({
                    view: view,
                    messageItem: messageItem
                });
            },
            msgItem = inboxMsgView
                ? inboxMsgView.getMessageItem()
                : null;

        if (inboxMsgView && msgItem) {
            if (compoundKey === null) {
                add(inboxMsgView, msgItem);
            } else if (msgItem.getCompoundKey().equalTo(compoundKey)) {
                add(inboxMsgView, msgItem);
            }
        }

        let items = view.items, messageItem;

        items.each(function (item) {
            messageItem = null;

            if (item.isCnMessageView === true) {
                messageItem = item.getMessageItem();
            } else if (item.isCnMessageEditor === true) {
                messageItem = item.getMessageDraft();
            }

            if (!messageItem ||
                (compoundKey !== null &&
                    (!messageItem.isCompoundKeyConfigured() ||
                    !messageItem.getCompoundKey().equalTo(compoundKey)))) {
                return;
            }

            add(item, messageItem);
        });


        return collection;
    },


    /**
     * Updates all items with the specified compound key in the currently opened
     * views in the MailDesktopView.
     *
     * Note: Compound Keys and id may change depending on the field tat was updated.
     *
     * @param {conjoon.cn_mail.data.mail.message.CompoundKey} compoundKey
     * @param {String|Object} field
     * @param {Mixed} value
     *
     * @throws if field is not a defined field in the model.
     *
     * @private
     */
    updateMessageItemsFromOpenedViews: function (compoundKey, field, value) {

        const me         = this,
            collection = me.getMessageItemsFromOpenedViews(compoundKey);

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey)) {
            Ext.raise({
                msg: "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                compoundKey: compoundKey
            });
        }

        if (!Ext.isObject(field)) {
            let tmp    = field;
            field      = {};
            field[tmp] = value;
        }

        let i, messageItem, len;
        for (i = 0, len = collection.length; i < len; i++) {
            messageItem = collection[i].messageItem;
            for (let fieldToSet in field) {
                if (!messageItem.getField(fieldToSet)) {
                    Ext.raise({
                        msg: "cannot set field \"" + fieldToSet + "\" since it was not defined in the Model",
                        field: fieldToSet,
                        messageItem: messageItem
                    });
                }
                messageItem.set(fieldToSet, field[fieldToSet]);
            }

            messageItem.commit();
        }

    },


    /**
     * Helper function for checking arguments related to cn_href
     * building/ itemId retrieving.
     *
     * @param {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey|String} id
     * @param {String} type
     *
     * @returns {boolean} true if is an an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
     *
     * @throws if id or type is not valid, or if the context is not compose and
     * id is not a compound key
     */
    checkArgumentsForEditorOrView: function (id, type) {

        if (!id || (!Ext.isString(id) && !Ext.isNumber(id) && !(
            id instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
        ))) {
            Ext.raise({
                id: id,
                msg: "\"id\" is not a valid value"
            });
        }

        if (["edit", "compose", "replyTo", "replyAll", "forward", "read"].indexOf(type) === -1) {
            Ext.raise({
                type: type,
                msg: "\"type\" is not a valid value"
            });
        }

        let isInstance = id instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

        if (type !== "compose" && !isInstance) {
            Ext.raise({
                msg: "anything but \"compose\" expects an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                id: id,
                type: type
            });
        }

        return isInstance;
    },


    /**
     * Registered by this view's ViewModel to make sure the controller is notified
     * of the  load of the MailFolderTreeStore to seed mailAccountId and
     * mailFolderId amongst the editors when composing a message.
     *
     * @param {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} store
     * @param {Array} records
     *
     * @return null if the node being loaded was of type ACCOUNT,
     * otherwise the defaultAccountInformations fetched by this operation.
     *
     * @throws if no suitable draftNode was found
     */
    onMailFolderTreeStoreLoad: function (store, records, success, operation) {

        const me           = this,
            view         = me.getView(),
            TYPES        = conjoon.cn_mail.data.mail.folder.MailFolderTypes;

        if (!success || (records && records[0].get("folderType") === TYPES.ACCOUNT)) {
            return null;
        }

        if (!me.defaultAccountInformations) {
            let accountNode = records[0].parentNode,
                draftNode   = accountNode.findChild("folderType", TYPES.DRAFT, false);

            if (!draftNode) {
                Ext.raise({
                    msg: "No suitable node found for saving drafts"
                });
            }

            me.defaultAccountInformations = {
                mailAccountId: accountNode.get("id"),
                mailFolderId: draftNode.get("id")
            };
        }

        if (me.starvingEditors) {
            let md, vm, editor,
                defInfo = me.defaultAccountInformations;

            for (let i = me.starvingEditors.length - 1; i > -1; i --) {
                editor = view.down("#" + me.starvingEditors.pop());
                vm     = editor.getViewModel();

                // trigger copyrequest
                if (vm.hasPendingCopyRequest()) {
                    // a pending copy request should be created in this case
                    // for anything that is being replied to, or forwarded
                    // editors for edited messages should not even be available
                    // in starvin editors. We will check this down below.
                    // problem would be otehrwise changing of compoundKey during
                    // load process which would return false or null entities
                    vm.processPendingCopyRequest(
                        defInfo.mailAccountId, defInfo.mailFolderId
                    );
                } else {
                    // messages are composed
                    md = vm.get("messageDraft");
                    if (editor.editMode !== "CREATE") {
                        Ext.raise({
                            msg: "Unexpected editMode for starving editor: " + editor.editMode
                        });
                    }

                    md.set("mailAccountId", defInfo.mailAccountId);
                    md.set("mailFolderId",  defInfo.mailFolderId);
                }
            }
        }

        return me.defaultAccountInformations;
    },

    /**
     * @private
     */
    computeIdForMessageViewMap: function (id, type) {
        return type + "-" + id;
    },


    /**
     * Callback for the MessageGrid's "refresh"-tool click event.
     *
     */
    onMailMessageGridRefreshClick: function () {
        const me      = this,
            view    = me.getView(),
            msgGrid = view.down("cn_mail-mailmessagegrid"),
            store   = msgGrid ? msgGrid.getStore(): null;

        if (store) {
            store.reload();
        }
    },

    pendingLazies: null,
    onMessageGridScroll () {
        "use strict";

        const
            me = this,
            grid = me.getView().down("cn_mail-mailmessagegrid"),
            livegrid = grid.view.getFeature("cn_mail-mailMessageFeature-livegrid"),
            proxy = grid.getStore().getProxy(),
            pageMap = livegrid.getPageMap(),
            pageSize = pageMap.getPageSize(),
            range = livegrid.getCurrentViewRange(),
            pages = l8.createRange(range.getStart().getPage(), range.getEnd().getPage()),
            startIndex = range.getStart().getIndex(),
            endIndex = range.getEnd().getIndex(),
            PageMapUtil = coon.core.data.pageMap.PageMapUtil,
            RecordPosition = coon.core.data.pageMap.RecordPosition,
            browse = [],
            urls = Object.create(null),
            requestTemplate = Ext.create("Ext.data.Request", {
                action: "read"
            });

        if (!me.pendingLazies) {
            me.pendingLazies = {};
        }

        pages.forEach ((page, index, pages) => {
            browse.push([
                page,
                index === 0 ? startIndex : 0,
                index === pages.length - 1 ? endIndex : pageSize - 1
            ]);
        });

        let rec, url, ck, groups = Object.create(null);
        browse.forEach(pageConf => {
            for (let i = pageConf[1], len = pageConf[2]; i <= len; i++) {
                rec = PageMapUtil.getRecordAt(
                    RecordPosition.create(pageConf[0], i),
                    pageMap
                );

                if (rec.data.previewText === undefined) {
                    ck = rec.getCompoundKey().toArray();
                    if (!groups[ck[0]]) {
                        groups[ck[0]] = {};
                    }
                    if (!groups[ck[0]][ck[1]]) {
                        groups[ck[0]][ck[1]] = [];
                    }
                    groups[ck[0]][ck[1]].push(ck[2]);
                }
            }
        });


        // returns all ids that are unique.
        // [1, 3, 4, 2, 1, 4, 5] -> [2, 5]
        const removeDuplicateIds = (ids) => ids.filter(
                (item, index, arr) => arr.indexOf(item) === arr.lastIndexOf(item)
            ), toLoad = {};
        let idsToLoad;

        Object.keys(groups).forEach(mailAccountId => {
            Object.keys(groups[mailAccountId]).forEach(mailFolderId => {
                requestTemplate.setParams({
                    mailAccountId,
                    mailFolderId
                });
                url = proxy.assembleUrl(requestTemplate);

                urls[url] = groups[mailAccountId][mailFolderId];
            });
        });

        Object.keys(urls).forEach(url => {
            me.pendingLazies[url] = me.pendingLazies[url] ? me.pendingLazies[url] :  [];

            idsToLoad = removeDuplicateIds(me.pendingLazies[url].concat(urls[url]));
            me.pendingLazies[url] = me.pendingLazies[url].concat(idsToLoad);
            toLoad[url] = idsToLoad;

            if (!idsToLoad.length) {
                return;
            }
            Ext.Ajax.request({
                method: "get",
                url,
                headers: proxy.headers,
                params: {
                    fields: "previewText",
                    previewTextLength: 200,
                    target: "MessageItem",
                    messageItemIds: idsToLoad.join(",")
                }
            }).then(response => {

                const
                    url = response.request.url,
                    loadedIds = response.request.params.messageItemIds.split(",");

                removeDuplicateIds(me.pendingLazies[url].concat(loadedIds));

                let data = JSON.parse(response.responseText);

                data.forEach(item => {
                    let rec = livegrid.getRecordByCompoundKey(conjoon.cn_mail.data.mail.message.CompoundKey.createFor(
                        item.mailAccountId, item.mailFolderId, item.id
                    ));

                    rec.set("previewText", item.previewText);
                });
            });
        });

    }


});