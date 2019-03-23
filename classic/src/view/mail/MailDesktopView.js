/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * This is the main view for the app-cn_mail package.
 * The view consist of a {@link conjoon.cn_mail.view.mail.inbox.InboxView} and
 * various other helper views that provide mail editing/viewing functionality.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.MailDesktopView', {

    extend : 'Ext.tab.Panel',

    alias : 'widget.cn_mail-maildesktopview',

    requires : [
        'conjoon.cn_mail.view.mail.inbox.InboxView',
        'conjoon.cn_mail.view.mail.MailDesktopViewController',
        'conjoon.cn_mail.view.mail.MailDesktopViewModel',
        'conjoon.cn_mail.data.mail.BaseSchema',
        'coon.comp.window.Toast'
    ],

    controller : 'cn_mail-maildesktopviewcontroller',

    viewModel : 'cn_mail-maildesktopviewmodel',

    layout : 'fit',

    cls     : 'cn_mail-tab-panel',

    bodyCls : 'cn_mail-tab-body',

    flex : 1,

    margin: '20 20 20 20',

    maxTabWidth : 240,

    items : [{
        margin  : '12 0 0 0',
        xtype   : 'cn_mail-mailinboxview',
        cn_href : 'cn_mail/home'
    }],

    /**
     * Tries to find an existing MessageView opened in the view and focus it,
     * or create a new one by adding it to the view.
     *
     * @param {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} compoundKey
^    *
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopViewController#showMailMessageViewFor}
     */
    showMailMessageViewFor : function(compoundKey) {
        var me = this;

        me.getController().showMailMessageViewFor(compoundKey);
    },

    /**
     * Creates and shows a new mail editor instance for writing an email message.
     *
     * @param {Mixed} id an id to be able to track this MessageEditor later on
     * when routing is triggered, or a compoundKey, depending on the type passed to
     * this method
     * @param {String} type the context in which the MessageEditor is opened in
     * (edit, compose...)
     *
     * @return conjoon.cn_mail.view.mail.message.MessageEditor
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopViewController#showMailEditor}
     */
    showMailEditor : function(id, type) {
        var me = this;

        return me.getController().showMailEditor(id, type);
    },


    /**
     * Creates and shows the InboxView with the MailFolder represented by the
     * requested mailFolderId loaded/loading into the MessageGrid for the mailAccountId.
     * Delegates to conjoon.cn_mail.view.mail.MailDesktopViewController#showInboxViewFor.
     *
     * @param {String} mailAccountId
     * @param {String} mailFolderId
     *
     * @return conjoon.cn_mail.view.mail.inbox.InboxView
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopViewController#showInboxViewFor}
     */
    showInboxViewFor : function(mailAccountId, mailFolderId) {
        const me = this;

        return me.getController().showInboxViewFor(mailAccountId, mailFolderId);
    },


    /**
     * Shows an info that the specified messageItem was moved.
     *
     * @param {conjoon.cn_mail.modelw.mail.message,AbstractMessageItem} messageItem
     * @param {conjoon.cn_mail.modelw.mail.folder.MailFolder} sourceFolder
     * @param {conjoon.cn_mail.modelw.mail.folder.MailFolder} targetFolder
     *
     * @return {coon.comp.window.Toast}
     */
    showMessageMovedInfo : function(messageItem, sourceFolder, targetFolder) {
        const me = this;

        return coon.Toast.info(
            Ext.String.format(
                "The message was moved to the \"{0}\" folder.",
                targetFolder.get('name')
            )
        );
    },


    /**
     * Shows an information that the specified messageItem cannot be deleted.
     *
     * @param {conjoon.cn_mail.modelw.mail.message,AbstractMessageItem} messageItem
     *
     * @return {coon.comp.window.Toast}
     */
    showMessageCannotBeDeletedWarning : function(messageItem) {

        return coon.Toast.warn(
            "Please close all related tabs to this message first.");

    },


    /**
     * Creates and shows the MailAccountView for the MailAccount represented by the
     * requested mailAccountId.
     * Delegates to conjoon.cn_mail.view.mail.MailDesktopViewController#showMailAcountFor.
     *
     * @param {String} mailAccountId
     *
     * @return conjoon.cn_mail.view.mail.account.MailAccountView
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopViewController#showMailAccountFor}
     */
    showMailAccountFor : function(mailAccountId) {
        const me = this;

        return me.getController().showMailAccountFor(mailAccountId);
    }

});
