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
        'conjoon.cn_mail.model.mail.message.MessageItem',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel'
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
        }
    },

    /**
     * @private
     */
    mailInboxView : null,

    /**
     * Creates a new mail editor for writing an email message, adding the
     * cn_href-property 'cn_mail/message/compose' to the tab.
     *
     * @return conjoon.cn_mail.view.mail.message.editor.MessageEditor
     */
    showMailEditor : function() {
        var me      = this,
            view    = me.getView(),
            newView;

        newView = view.add({
            xtype   : 'cn_mail-mailmessageeditor',
            cn_href : 'cn_mail/message/compose'
        });

        view.setActiveTab(newView);

        return newView;
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
                cn_href : 'cn_mail/message/read/'  + messageId
            });

           if (recInd > -1) {
                newView.setMessageItem(store.getAt(recInd));
           } else {
                // most likely opened via deeplinking
                conjoon.cn_mail.model.mail.message.MessageItem.load(messageId, {
                    success : function(record) {
                        newView.setMessageItem(record);
                    }
                });
            }
        }

        me.getView().setActiveTab(newView);
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

    }

});
