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
 * This is the view controller for {@link conjoon.cn_mail.view.mail.MailDesktopView}.
 * It mainly provides and delegates event handling between the embedded views.
 *
 * The routes configuration used here can be found in the PackageController.
 */
Ext.define('conjoon.cn_mail.view.mail.MailDesktopViewController', {

    extend : 'Ext.app.ViewController',

    requires : [
        'conjoon.cn_mail.view.mail.message.reader.MessageView',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditor',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel',
        'conjoon.cn_mail.text.QueryStringParser',
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
        'conjoon.cn_mail.data.mail.message.EditingModes',
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey'
    ],

    alias : 'controller.cn_mail-maildesktopviewcontroller',


    control : {

        'cn_mail-maildesktopview' : {
            'tabchange' : 'onTabChange'
        },
        'cn_mail-maildesktopview > cn_mail-mailmessagereadermessageview' : {
            'cn_mail-mailmessageitemread' : 'onMessageItemRead'
        },
        'cn_mail-mailmessagegrid' : {
            'rowdblclick' : 'onMailMessageGridDoubleClick'
        },
        'cn_mail-mailmessageeditor' : {
            'cn_mail-mailmessagesavecomplete' : 'onMailMessageSaveComplete',
            'cn_mail-mailmessagesendcomplete' : 'onMailMessageSendComplete'
        },
        'cn_mail-maildesktopview > cn_mail-mailinboxview' : {
            'cn_mail-beforemessageitemdelete' : 'onBeforeMessageItemDelete',
            'cn_mail-messageitemmove'         : 'onMessageItemMove'
        },
        'cn_mail-mailinboxview #btn-replyall' : {
            'click' : 'onInboxViewReplyAllClick'
        },
        'cn_mail-mailinboxview #btn-reply' : {
            'click' : 'onInboxViewReplyClick'
        },
        'cn_mail-mailinboxview #btn-forward' : {
            'click' : 'onInboxViewForwardClick'
        },
        'cn_mail-mailinboxview #btn-editdraft' : {
            'click' : 'onInboxViewEditDraftClick'
        }

    },

    /**
     * @private
     */
    mailInboxView : null,

    /**
     * Used to compute valid itemIds for MessageEditor tabs, which can be valid
     * in case routing ids with special characters (e.g. mailto-links) appear.
     * @private
     */
    editorIdMap : null,

    /**
     * @type {conjoon.cn_mail.text.QueryStringParser}
     * @private
     */
    parser : null,

    /**
     * @private
     */
    starvingEditors : null,

    /**
     * @private
     */
    defaultAccountInformations : null,

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
    onBeforeMessageItemDelete : function(inboxView, messageItem, requestingView = null) {

        const me          = this,
              view        = me.getView(),
              compoundKey = messageItem.getCompoundKey();

        let openedView, itemIds = [
            me.getItemIdForMessageEditor(compoundKey, 'edit'),
            me.getItemIdForMessageEditor(compoundKey, 'replyTo'),
            me.getItemIdForMessageEditor(compoundKey, 'replyAll'),
            me.getItemIdForMessageEditor(compoundKey, 'forward'),
            me.getMessageViewItemId(compoundKey)
        ];

        for (let i = 0, len = itemIds.length; i < len; i++) {
            openedView = view.down('#' + itemIds[i]);

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
     */
    onMessageItemMove : function(view, messageItem, requestingView, sourceFolder, targetFolder) {

        const me = this;

        if (requestingView !== view) {
            me.getView().showMessageMovedInfo(messageItem, sourceFolder, targetFolder);
        }

        me.updateMessageItemsFromOpenedViews(
            messageItem.getPreviousCompoundKey(), 'mailFolderId', targetFolder.getId());
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
     * #getItemIdForMessageEditor and #getCnHrefForMessageEditor)
     */
    showMailEditor : function(key, type) {
        const me = this,
              view = me.getView(),
              EditingModes = conjoon.cn_mail.data.mail.message.EditingModes,
              CopyRequest  = 'conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest',
              defInfo = me.defaultAccountInformations;

        let newView,
            initialConfig = {
                messageDraft : null
            },
            itemId  = me.getItemIdForMessageEditor(key, type),
            cn_href = me.getCnHrefForMessageEditor(key, type);
            defaults = {};

        if (me.defaultAccountInformations) {
            defaults.defaultMailAccountId = defInfo.mailAccountId;
            defaults.defaultMailFolderId  = defInfo.mailFolderId;
        }

        // MessageDraft === MessageDraftCopyRequest
        // MessageDraft === key
        // MessageDraft === MessageDraftConfig
        switch (type) {
            case 'edit':
                initialConfig.messageDraft = key;
                break;
            case 'replyTo':
                initialConfig.messageDraft = Ext.create(CopyRequest, Ext.apply({
                    compoundKey : key, editMode : EditingModes.REPLY_TO
                },  defaults));
                break;
            case 'replyAll':
                initialConfig.messageDraft = Ext.create(CopyRequest, Ext.apply({
                    compoundKey : key, editMode : EditingModes.REPLY_ALL
                },  defaults));
                break;
            case 'forward':
                initialConfig.messageDraft = Ext.create(CopyRequest, Ext.apply({
                    compoundKey : key, editMode : EditingModes.FORWARD
                }, defaults));
                break;
            default:
                initialConfig.messageDraft = me.createMessageDraftConfig(
                    key, defInfo ? defInfo : {}
                );
                break;
        }

        newView = view.down('#' + itemId);

        if (!newView) {
            newView = view.add(Ext.apply(initialConfig, {
                xtype   : 'cn_mail-mailmessageeditor',
                margin  : '12 5 5 0',
                itemId  : itemId,
                cn_href : cn_href
            }));

            if (!defInfo && type !== 'edit') {
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
    showInboxViewFor : function(mailAccountId, mailFolderId) {

        const me        = this,
              view      = me.getView(),
              inboxView = view.down('cn_mail-mailinboxview'),
              tree      = inboxView.down('cn_mail-mailfoldertree'),
              store     = tree.getStore();

        if (store.isLoading() || store.getProxy().type === 'memory') {
            tree.on(
                'load',
                Ext.Function.bind(
                    me.processMailFolderSelectionForRouting, me, [mailAccountId, mailFolderId]
                ), me, {single : true}
            );
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
     *
     * @return {Boolean} false if the specified MailFolder was not found
     *
     * @private
     */
    processMailFolderSelectionForRouting : function(mailAccountId, mailFolderId) {

        const me        = this,
              view      = me.getView(),
              inboxView = view.down('cn_mail-mailinboxview'),
              tree      = inboxView.down('cn_mail-mailfoldertree');

        let rec,
            accountNode = tree.getStore().getRoot().findChild(
                "id", mailAccountId, false
            );

        if (!accountNode) {
            return false;
        }

        rec = accountNode.findChild("id", mailFolderId, true);

        if (!rec) {
            return false;
        }

        inboxView.cn_href = rec.toUrl();
        tree.getSelectionModel().select(rec);
        Ext.History.add(inboxView.cn_href);
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
    showMailMessageViewFor : function(compoundKey) {

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey)) {
            Ext.raise({
                msg : "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                compoundKey : compoundKey
            });
        }

        var me      = this,
            view    = me.getView(),
            itemId  = me.getMessageViewItemId(compoundKey),
            newView = view.down('#' + itemId),
            msgGrid = view.down('cn_mail-mailmessagegrid'),
            store   = msgGrid ? msgGrid.getStore(): null,
            recInd  = store ? store.findByCompoundKey(compoundKey) : null;

        if (!newView) {

            newView = view.add({
                xtype   : 'cn_mail-mailmessagereadermessageview',
                itemId  : itemId,
                cn_href : [
                    'cn_mail/message/read',
                    compoundKey.toArray().join('/')
                ].join('/'),
                margin  : '12 5 5 0'
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
    onMailMessageSendComplete : function(editor, messageDraft) {

        const me = this;

        me.getView().down('cn_mail-mailinboxview').updateViewForSentDraft(
            messageDraft
        );
    },


    /**
     * Callback for the global cn_mail-mailmessagesavecomplete event that gets
     * triggered from editor instances.
     * Looks up any referencing view of the currently saved draft and will update
     * its data with the newly committed data.
     * Grid actions will only be triggered if the grid is currently representing
     * the contents of a DRAFT-inbox.
     *
     * @param {conjoon.mail.message.editor.MessageEditor} editor
     * @param {{conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     * @param operation
     * @param {Boolean} isSend
     * @param {Boolean} isCreated
     */
    onMailMessageSaveComplete : function(editor, messageDraft, operation, isSend, isCreated) {

        const me               = this,
              view             = me.getView(),
              messageGrid      = view.down('cn_mail-mailmessagegrid'),
              itemStore        = messageGrid ? messageGrid.getStore() : null,
              messageView      = view.down('#' + me.getMessageViewItemId(messageDraft.getCompoundKey())),
              inboxView        = view.down('cn_mail-mailinboxview'),
              EditingModes     = conjoon.cn_mail.data.mail.message.EditingModes,
              editMode         = editor.editMode,
              inboxMessageView = inboxView
                  ? inboxView.down('cn_mail-mailmessagereadermessageview')
                  : null;

        let inboxMessageViewId, messageItem, recInd;

        if (editMode === EditingModes.CREATE) {
            me.updateHistoryForComposedMessage(editor, messageDraft);
        }

        if ([EditingModes.CREATE, EditingModes.REPLY_TO,
            EditingModes.REPLY_ALL, EditingModes.FORWARD].indexOf(editMode) !== -1 &&
            isCreated){
            inboxView.updateViewForCreatedDraft(messageDraft);
            return;
        }


        if (messageView) {
            messageView.updateMessageItem(messageDraft);
        }


        // this is two-way-data bound and should only be queried by us if the
        // selected folder / opened grid is DRAFT related
        if (inboxMessageView) {

            inboxMessageViewId = inboxMessageView.getViewModel().get('messageItem.localId');

            if (inboxMessageViewId == messageDraft.getId()) {
                // Due to the two way-data binding between the grid and the message
                // view, we do not need to update the associated item in the
                // grid. Just update the MessageView, changes should be reflected
                // in the grid
                inboxMessageView.updateMessageItem(messageDraft);
            }
        }


        // only update the MessageItems in the view which have not been updated
        // over the MessageView above. Thus, we have to look up any item which might
        // be loaded in the grid.
        if (messageGrid && inboxMessageViewId != messageDraft.getId()) {
            recInd = itemStore.findExact('localId', messageDraft.getId());
            if (recInd > -1) {
                messageItem = itemStore.getAt(recInd);
                conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater.updateItemWithDraft(
                    messageItem, messageDraft
                );
            }
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
    onMessageItemRead : function(messageItemRecords) {

        var me = this;

        if (!me.mailInboxView) {
            me.mailInboxView = me.getView().down('cn_mail-mailinboxview');
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
    onMailMessageGridDoubleClick : function(grid, record) {

        var me = this;

        me.redirectTo(
            ['cn_mail/message/read',
            conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
                   .fromRecord(record).toArray().join('/')
            ].join('/'),

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
    onTabChange : function(tabPanel, newCard, oldCard, eOpts) {

        var me = this;

        if (newCard.cn_href){
            Ext.History.add(newCard.cn_href);
        }
    },


    /**
     * Computes a valid itemId to use with an MessageEdit instance. This is needed
     * since id might be string containing special chars.
     * This method is guaranteed one and the same id for one and the same specified
     * id during the lifetime of this instance. ids so not persist over sessions.
     *
     * @param {String} id
     * @param {String} type the context in which the mail editor was opened in
     *
     * @return {String}
     *
     * @private
     *
     * @throws if id or type is not valid, or if the context is not compose and
     * id is not a compound key
     */
    getItemIdForMessageEditor : function(id, type) {

        const me = this;

        let newId,
            isInstance = me.checkArgumentsForEditor(id, type);

        newId = 'cn_mail-mailmessageeditor-' + type + '-' + Ext.id();

        if (!me.editorIdMap) {
            me.editorIdMap = {};
        }

        id = type + (isInstance ? id.toLocalId() : id);


        if (!me.editorIdMap[id]) {
            me.editorIdMap[id] = newId;
        }

        return  me.editorIdMap[id];
    },


    /**
     * Returns a cn_href value to use with a MessageEditor for proper routing.
     *
     * @param {Mixed} id
     * @param {String} type the context in which the mail editor was opened in
     *
     * @return {String}
     *
     * @private
     *
     * @throws from #checkArgumentsForEditor
     *
     * @see checkArgumentsForEditor
     */
    getCnHrefForMessageEditor : function(id, type) {

        const me = this;

        let isInstance = me.checkArgumentsForEditor(id, type);

        id = isInstance ? id.toLocalId() : id;

        switch (type) {
            case 'edit':
                return 'cn_mail/message/edit/' + id;
            case 'replyTo':
                return 'cn_mail/message/replyTo/' + id;
            case 'replyAll':
                return 'cn_mail/message/replyAll/' + id;
            case 'forward':
                return 'cn_mail/message/forward/' + id;
            default :
                return 'cn_mail/message/compose/' + id
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
    createMessageDraftConfig : function(id, defaultConfig = {}) {

        const me = this;

        if (!id || (!Ext.isString(id) && !Ext.isNumber(id))) {
            Ext.raise({
                key  : id,
                msg : "\"id\" is not a valid value"
            })
        }

        let pos,
            addresses,
            res,
            tmpId,
            encodedId = decodeURIComponent(id + '');


        if (Ext.String.startsWith(encodedId, 'mailto:', true)) {
            encodedId = encodedId.substring(7);
        } else {
            return Ext.create(
                'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
                defaultConfig
            );
        }

        addresses = '';

        if ((pos = encodedId.indexOf('?')) !== -1) {
            addresses = encodedId.substring(0, pos).split(',');
            encodedId = encodedId.substring(pos);
        } else {
            addresses = encodedId ? encodedId.split(',') : [];
            encodedId = "";
        }

        if (encodedId == "") {
            if (addresses && addresses.length) {
                return Ext.create(
                    'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', Ext.apply({
                        to : addresses
                    }, defaultConfig));
            }
            return Ext.create(
                'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
                 defaultConfig
            );
        }

        if (!me.parser) {
            me.parser = Ext.create('conjoon.cn_mail.text.QueryStringParser');
        }
        res = me.parser.parse(encodedId);

        for (var i in res) {
            if (!res.hasOwnProperty(i)) {
                continue;
            }
            while (true) {
                tmpId = decodeURIComponent(res[i]);
                if (!tmpId || (tmpId === res[i])) {
                    break;
                }
                res[i] = tmpId;
            }
        }

        if (res.hasOwnProperty('body')) {
            res.textHtml = res.body;
            delete res.body;
        }

        return Ext.create(
            'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
            Ext.apply(Ext.apply({
                to     : addresses
            }, res), defaultConfig)
        );
    },


    /**
     * This method will effectively replace the current hashbang of an editor in
     * editMode == CREATE to the hashbang of an editor which is currently in
     * editMode === edit.
     * Method gets called as soon as the saving of a newly composed message
     * finishes, taking care of the following:
     *  - remapping editorIdMap so that a new mapping between the editor in its
     *  new context is successfull once deeplinking occures
     *  - compute and assign a new token for the editor's cn_href-attribute (which
     *  is also returned by this method)
     *  - call window.location.replace with the newl generated cn_href.
     *  Ext.History-events are suspended and resumed after a timeout of 500 ms,
     *  since the Ext.History queries the changes to the window hash in a
     *  frequent interval (ExtJS6.2: 50ms)
     *
     * @param {conjoon.cn_mail.view.mail.message.editor.MessageEditor} editor
     * @oaram {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft The
     * newly created message draft
     *
     * @return {String} the newly computed cn_href attribute of the editor
     *
     * @throws if the editMode of the specified editor is not
     * conjoon.cn_mail.data.mail.message.EditingModes#CREATE
     *
     * @private
     */
    updateHistoryForComposedMessage : function(editor, messageDraft) {

        const me           = this,
              EditingModes = conjoon.cn_mail.data.mail.message.EditingModes;

        if (!editor || (editor.editMode !== EditingModes.CREATE)) {
            Ext.raise({
                msg    : Ext.String.format("'editMode' of Editor must be '{0}'", EditingModes.CREATE),
                editor : editor
            });
        }

        let compoundKey = messageDraft.getCompoundKey(),
            localId     = compoundKey.toLocalId();

        for (let id in me.editorIdMap) {
            if (me.editorIdMap[id] === editor.getItemId()) {
                delete me.editorIdMap[id];
                me.editorIdMap['edit' + localId] =
                    editor.getItemId();
                break;
            }
        }

        let newToken = me.getCnHrefForMessageEditor(compoundKey, 'edit');

        editor.cn_href = newToken;

        Ext.History.suspendEvents();
        window.location.replace('#' + newToken);
        Ext.Function.defer(function() {
            Ext.History.resumeEvents();
        }, 500);

        return newToken;
    },


    /**
     * Callback for the reply all button of the InboxView's MessageView. Will
     * open the editor for replying to the message.
     *
     * @return {conjoon.cn_mail.view.mail.message.editor.MessageEditor}
     *
     * @see #showMaiLEditor
     */
    onInboxViewReplyClick : function() {
        const me = this;
        return me.showMailEditor(me.getCompoundKeyFromInboxMessageView(), 'replyTo');
    },


    /**
     * Callback for the reply all button of the InboxView's MessageView. Will
     * open the editor for forwarding the message.
     *
     * @return {conjoon.cn_mail.view.mail.message.editor.MessageEditor}
     *
     * @see #showMaiLEditor
     */
    onInboxViewForwardClick : function() {
        const me = this;
        return me.showMailEditor(me.getCompoundKeyFromInboxMessageView(), 'forward');
    },


    /**
     * Callback for the reply all button of the InboxView's MessageView. Will
     * open the editor for replying to the message.
     *
     * @return {conjoon.cn_mail.view.mail.message.editor.MessageEditor}
     *
     * @see #showMaiLEditor
     */
    onInboxViewReplyAllClick : function() {
        const me = this;
        return me.showMailEditor(me.getCompoundKeyFromInboxMessageView(), 'replyAll');
    },


    /**
     * Callback for the edit draft button of the InboxView's MessageView. Will
     * open the editor for editing the draft.
     *
     * @return {conjoon.cn_mail.view.mail.message.editor.MessageEditor}
     *
     * @see #showMaiLEditor
     */
    onInboxViewEditDraftClick : function() {
        const me = this;
        return me.showMailEditor(me.getCompoundKeyFromInboxMessageView(), 'edit');
    },

    /**
     * Returns the compound key of the MessageItem currently loaded into the MessageView
     * of the InboxView.
     *
     * @return {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey}
     *
     * @private
     */
    getCompoundKeyFromInboxMessageView : function() {

        let m = this.getView()
            .down('cn_mail-mailinboxview')
            .down('cn_mail-mailmessagereadermessageview')
            .getViewModel().get('messageItem')

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
    getMessageItemsFromOpenedViews : function(compoundKey = null) {

        const me           = this,
              view         = me.getView(),
              inboxMsgView = view.down('cn_mail-mailinboxview')
                                 .down('cn_mail-mailmessagereadermessageview');

        let collection = [],
            add        = function(view, messageItem) {
                collection.push({
                    view        : view,
                    messageItem : messageItem
                });
            },
            msgItem = inboxMsgView.getMessageItem();

        if (inboxMsgView && msgItem) {
            if (compoundKey === null) {
                add(inboxMsgView, msgItem);
            } else if (msgItem.getCompoundKey().equalTo(compoundKey)) {
                add(inboxMsgView, msgItem);
            }
        }

        let items = view.items, messageItem;

        items.each(function(item) {
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
     * @param {String} field
     * @param {Mixed} value
     *
     * @throws if field is not a defined field in the model.
     *
     * @private
     */
    updateMessageItemsFromOpenedViews : function(compoundKey, field, value) {

        const me         = this,
              collection = me.getMessageItemsFromOpenedViews(compoundKey);

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey)) {
            Ext.raise({
                msg : "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                compoundKey : compoundKey
            });
        }

        let i, messageItem;
        for (i = 0, len = collection.length; i < len; i++) {
            messageItem = collection[i].messageItem;
            if (!messageItem.getField(field)) {
                Ext.raise({
                    msg         : "cannot set field \"" + field + "\" since it was not defined in the Model",
                    field       : field,
                    messageItem : messageItem
                });
            }
            messageItem.set(field, value);
            messageItem.commit();
        }

    },


    /**
     * @private
     */
    getMessageViewItemId : function(compoundKey) {
        return 'cn_mail-mailmessagereadermessageview-' +
                Ext.util.Base64.encode(compoundKey.toLocalId()).replace(/[^a-zA-Z0-9]/g,'-');
    },


    /**
     * Helper function for checking arguments when creating an editor instance.
     *
     * @param {Mixed} id
     * @param {String} type
     *
     * @returns {boolean} true if is an an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
     *
     * @throws if id or type is not valid, or if the context is not compose and
     * id is not a compound key
     */
    checkArgumentsForEditor : function(id, type) {
        if (!id || (!Ext.isString(id) && !Ext.isNumber(id) && !(
            id instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
            ))) {
            Ext.raise({
                id  : id,
                msg : "\"id\" is not a valid value"
            })
        }

        if (['edit', 'compose', 'replyTo', 'replyAll', 'forward'].indexOf(type) === -1) {
            Ext.raise({
                type  : type,
                msg : "\"type\" is not a valid value"
            })
        }

        let isInstance = id instanceof conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

        if (type !== 'compose' && !isInstance) {
            Ext.raise({
                msg : "anything but \"compose\" expects an instance of conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                id : id,
                type : type
            });
        }

        return isInstance;
    },


    /**
     * Registered by this view's ViewModel to make sure the controller is notified
     * of the initial load of the MailFolderTreeStore to seed mailAccountId and
     * mailFolderId amongst the editors when composing a message.
     *
     * @param {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} store
     * @param {Array} records
     */
    onMailFolderTreeStoreLoad : function(store, records) {

        const me           = this,
              view         = me.getView(),
              EditingModes = conjoon.cn_mail.data.mail.message.EditingModes;

        me.defaultAccountInformations = {
            mailAccountId : records[0].get('id'),
            mailFolderId  : records[0].findChild("type", 'DRAFT', false).get('id')
        };

        if (me.starvingEditors) {
            let md, vm, editor,
                defInfo = me.defaultAccountInformations;

            for (let i = me.starvingEditors.length - 1; i > -1; i --) {
                editor = view.down('#' + me.starvingEditors.pop());
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
                    md = vm.get('messageDraft');
                    if (editor.editMode !== 'CREATE') {
                        Ext.raise({
                            msg : "Unexpected editMode for starving editor: " + editor.editMode
                        });
                    }

                    md.set('mailAccountId', defInfo.mailAccountId);
                    md.set('mailFolderId',  defInfo.mailFolderId);
                }
            }
        }
    }



});