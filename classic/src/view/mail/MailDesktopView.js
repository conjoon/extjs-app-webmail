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
        'conjoon.cn_mail.data.mail.BaseSchema'
    ],

    controller : 'cn_mail-maildesktopviewcontroller',

    layout : 'fit',

    cls     : 'cn_mail-tab-panel',

    bodyCls : 'cn_mail-tab-body',

    flex : 1,

    margin: '20 20 20 20',

    maxTabWidth : 240,

    items : [{
        xtype   : 'cn_mail-mailinboxview',
        cn_href : 'cn_mail/home'
    }],

    /**
     * Tries to find an existing MessageView opened in the view and focus it,
     * or create a new one by adding it to the view.
     *
     * @param {String} messageId The id of the message that should be shown
     * in a MessageView.
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopViewController#showMailMessageViewFor}
     */
    showMailMessageViewFor : function(messageId) {
        var me = this;

        me.getController().showMailMessageViewFor(messageId);
    },

    /**
     * Creates and shows a new mail editor instance for writing an email message.
     *
     * @param {String} id an id to be able to track this MessageEditor later on
     * when routing is triggered
     *
     * @return conjoon.cn_mail.view.mail.message.MessageEditor
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopViewController#showMailEditor}
     */
    showMailEditor : function(id) {
        var me = this;

        return me.getController().showMailEditor(id);
    }





});
