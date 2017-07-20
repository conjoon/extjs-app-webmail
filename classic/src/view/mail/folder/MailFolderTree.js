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
 * The default folder panel representing a mail inbox.
 * {@link conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn} is used to provide
 * extra visual information for the nodes found within the tree.
 */
Ext.define('conjoon.cn_mail.view.mail.folder.MailFolderTree', {

    extend : 'Ext.tree.Panel',

    requires : [
        'conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn'
    ],

    alias : 'widget.cn_mail-mailfoldertree',

    width  : 240,

    cls    : 'cn_mail-mailfoldertree',

    useArrows   : true,
    rootVisible : false,

    hideHeaders : true,


    columns : [{
        xtype     : 'cn_mail-mailfoldertreecolumn',
        dataIndex : 'text',
        flex      : 1,
        renderer  : function(value, metaData, record) {
            var unreadCount = record.get('unreadCount');

            if (unreadCount > 0) {
                return value  + '<span class="badge-unreadcount">' + unreadCount + '</span>';
            }
            return value;

        }
    }]



});