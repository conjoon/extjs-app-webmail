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
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest'
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
            'cn_mail-mailmessagesavecomplete' : 'onMailMessageSaveComplete'
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
     * Creates a new mail editor for writing an email message, adding the
     * cn_href-property 'cn_mail/message/compose/[id]' to the tab.
     * This controller method distinguishes between to datatypes specified with
     * id: Number and String. If id is a number, it is assumed that a regular,
     * blank composer instance should be opened. If id is a string, it is assumed
     * that the passed id is part of the value of the mailto: protocol, and the
     * created MessageEitor will be adjusted to hold the information as specified
     * in the string.
     *
     * @param {Number/String} id an id to be able to track this MessageEditor later on
     * when routing is triggered. if id is a string, it is assumed to be either
     * a key for the message to edit or it follows the syntax of the mailto scheme
     * (including protocol), and mights still be uri encoded.
     * @param {String} type The context in which the mail editor was opened in
     * (edit/compose)
     *
     *
     * @return conjoon.cn_mail.view.mail.message.editor.MessageEditor
     *
     * @throws if no valid id was specified (bubbles exceptions from
     * #getItemIdForMessageEditor and #getCnHrefForMessageEditor)
     */
    showMailEditor : function(id, type) {
        var me      = this,
            view    = me.getView(),
            newView, cn_href, itemId,
            initialConfig = {
                messageDraft : null
            },
            EditingModes = conjoon.cn_mail.data.mail.message.EditingModes,
            CopyRequest  = 'conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest';

        itemId  = me.getItemIdForMessageEditor(id, type);
        cn_href = me.getCnHrefForMessageEditor(id, type);


        // MessageDraft === MessageDraftCopyRequest
        // MessageDraft === id
        // MessageDraft === MessageDraftConfig
        switch (type) {
            case 'edit':
                initialConfig.messageDraft = id + '';
                break;
            case 'replyTo':
                initialConfig.messageDraft = Ext.create(CopyRequest, {
                    id : id + '', editMode : EditingModes.REPLY_TO
                });
                break;
            case 'replyAll':
                initialConfig.messageDraft = Ext.create(CopyRequest, {
                    id : id + '', editMode : EditingModes.REPLY_ALL
                });
                break;
            case 'forward':
                initialConfig.messageDraft = Ext.create(CopyRequest, {
                    id : id + '', editMode : EditingModes.FORWARD
                });
                break;
            default:
                initialConfig.messageDraft = me.createMessageDraftConfig(id);
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
        }

        view.setActiveTab(newView);

        return newView;
    },


    /**
     * Shows the InboxView and selects the specified mailFolderId.
     * Delegates to #processMailFolderSelectionForRouting. If the store of the
     * MailFolderTree is not yet bound by the MVVM or currently being loaded,
     * the processMailFolderSelectionForRouting-method is invoked as soon as
     * loading of the MailFolderTree's store finished.
     *
     * @param {String} mailFolderId
     *
     * @return conjoon.cn_mail.view.mail.inbox.InboxView
     *
     * @see #processMailFolderSelectionForRouting
     */
    showInboxViewFor : function(mailFolderId) {

        const me        = this,
              view      = me.getView(),
              inboxView = view.down('cn_mail-mailinboxview'),
              tree      = inboxView.down('cn_mail-mailfoldertree'),
              store     = tree.getStore();

        if (store.isLoading() || store.getProxy().type === 'memory') {
            tree.on(
                'load',
                Ext.Function.bind(
                    me.processMailFolderSelectionForRouting, me, [mailFolderId]
                ), me, {single : true}
            );
        } else {
            me.processMailFolderSelectionForRouting(mailFolderId);
        }

        return view.setActiveTab(inboxView);
    },


    /**
     * Selects the MailFolder represented by the mailFolderId and makea sure
     * that the "cn_href" attribute of the InboxView-tab is being changed to the
     * "toUrl()"-return value of the selected MailFolder to make the
     * tabchange-listener working with the deeplinking into ONE panel.
     *
     * @param {String} mailFolderId
     *
     * @return {Boolean} false if the specified MAilFolder was not found or if
     * it was already selected, otherwise true.
     *
     * @private
     */
    processMailFolderSelectionForRouting : function(mailFolderId) {

        const me        = this,
              view      = me.getView(),
              inboxView = view.down('cn_mail-mailinboxview'),
              tree      = inboxView.down('cn_mail-mailfoldertree');

        let rec = tree.getStore().getNodeById(mailFolderId);

        if (!rec || (tree.getSelection() && tree.getSelection()[0] === rec)) {
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
     * @param {String} messageId The id of the message that should be shown
     * in a MessageView.
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopViewController#showMailMessageViewFor}
     */
    showMailMessageViewFor : function(messageId) {

        var me      = this,
            view    = me.getView(),
            itemId  = 'cn_mail-mailmessagereadermessageview-' + messageId,
            newView = view.down('#' + itemId),
            msgGrid = view.down('cn_mail-mailmessagegrid'),
            store   = msgGrid ? msgGrid.getStore(): null,
            recInd  = store ? store.findExact('id', messageId + '') : null;

        if (!newView) {

            newView = view.add({
                xtype   : 'cn_mail-mailmessagereadermessageview',
                itemId  : itemId,
                cn_href : 'cn_mail/message/read/'  + messageId,
                margin  : '12 5 5 0'
            });

            if (recInd > -1) {
                newView.setMessageItem(store.getAt(recInd));
            } else {
                // most likely opened via deeplinking
                newView.loadMessageItem(messageId);
            }
        }

        me.getView().setActiveTab(newView);
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
     */
    onMailMessageSaveComplete : function(editor, messageDraft) {

        const me               = this,
              view             = me.getView(),
              messageGrid      = view.down('cn_mail-mailmessagegrid'),
              itemStore        = messageGrid ? messageGrid.getStore() : null,
              messageView      = view.down('#cn_mail-mailmessagereadermessageview-' + messageDraft.getId()),
              inboxView        = view.down('cn_mail-mailinboxview'),
              mailFolderTree   = view.down('cn_mail-mailfoldertree'),
              EditingModes     = conjoon.cn_mail.data.mail.message.EditingModes,
              inboxMessageView = inboxView
                  ? inboxView.down('cn_mail-mailmessagereadermessageview')
                  : null;

        let inboxMessageViewId, messageItem, recInd;

        if(editor.editMode === EditingModes.CREATE) {
            me.updateHistoryForComposedMessage(editor, messageDraft.getId());
        }


        if (messageView) {
            messageView.updateMessageItem(messageDraft);
        }


        // query grid and inboxMessageView only if we are currently in a DRAFT-folder
        if (!mailFolderTree.getSelection().length
            || mailFolderTree.getSelection()[0].get('type') != 'DRAFT') {
            return;
        }

        // this is two-way-data bound and should only be queried by us if the
        // selected folder / opened grid is DRAFT related
        if (inboxMessageView) {

            inboxMessageViewId = inboxMessageView.getViewModel().get('messageItem.id');

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
            recInd = itemStore.findExact('id', messageDraft.getId());
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
     * Redirects to this PackageController's cn_mail/message/read/:id route.
     *
     * @param {conjoon.cn_mail.view.mail.message.MessageGrid} grid
     * @param {conjoon.cn_mail.model.mail.message.MessageItem} record
     */
    onMailMessageGridDoubleClick : function(grid, record) {

        var me = this;

        me.redirectTo('cn_mail/message/read/' + record.get('id'));
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
     * @throws if id or type is not valid
     */
    getItemIdForMessageEditor : function(id, type) {

        var me, newId;

        if (!id || (!Ext.isString(id) && !Ext.isNumber(id))) {
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


        me    = this;
        newId = 'cn_mail-mailmessageeditor-' + type + '-' + Ext.id();

        if (!me.editorIdMap) {
            me.editorIdMap = {};
        }

        id = type + id;


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
     * @throws if id or type is not valid
     */
    getCnHrefForMessageEditor : function(id, type) {

        if (!id || (!Ext.isString(id) && !Ext.isNumber(id))) {
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
     *
     * @return {conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig/Mixed}

     *
     * @private
     */
    createMessageDraftConfig : function(id) {

        var me        = this,
            encodedId = decodeURIComponent(id + ''),
            pos, addresses, res, tmpId;

        if (Ext.String.startsWith(encodedId, 'mailto:', true)) {
            encodedId = encodedId.substring(7);
        } else {
            return Ext.create(
                'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig');
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
                    'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
                        to : addresses
                    });
            }
            return Ext.create(
                'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig');
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
            Ext.apply({
                to : addresses
            }, res)
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
     * @oaram {String} messageDraftId the id of the newly created messageDraft
     *
     * @return {String} the newly computed cn_href attribute of the editor
     *
     * @throws if the editMode of the specified editor is not
     * conjoon.cn_mail.data.mail.message.EditingModes#CREATE
     *
     * @private
     */
    updateHistoryForComposedMessage : function(editor, messageDraftId) {

        const me           = this,
              EditingModes = conjoon.cn_mail.data.mail.message.EditingModes;

        if (!editor || (editor.editMode !== EditingModes.CREATE)) {
            Ext.raise({
                msg    : Ext.String.format("'editMode' of Editor must be '{0}'", EditingModes.CREATE),
                editor : editor
            });
        }

        for (let id in me.editorIdMap) {
            if (me.editorIdMap[id] === editor.getItemId()) {
                delete me.editorIdMap[id];
                me.editorIdMap['edit' + messageDraftId] = editor.getItemId();
                break;
            }
        }

        let newToken = me.getCnHrefForMessageEditor(messageDraftId, 'edit');

        editor.cn_href = newToken;

        Ext.History.suspendEvents();
        window.location.replace('#' + newToken);
        Ext.Function.defer(function() {
            Ext.History.resumeEvents();
        }, 500);

        return newToken;
    }
});