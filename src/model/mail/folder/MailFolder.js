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
 * Base model for app-cn_mail representing a remote mailbox folder
 * The following fields are available:
 *
 * - text (the display text of the folder)
 * - unreadCount (the number of unread messages in this folder, if any)
 * - type (the type of the folder, any of INBOX, JUNK, TRASH, SENT, DRAFT, FOLDER)
 * - id (the id of the folder)
 */
Ext.define('conjoon.cn_mail.model.mail.folder.MailFolder', {

    extend : 'conjoon.cn_mail.model.mail.BaseTreeModel',

    entityName : 'MailFolder',

    fields : [{
        name : 'id',
        type : 'string'
    }, {
        name : 'text',
        type : 'string',
        validators : [{
            type : 'presence'
        }]
    }, {
        name    : 'unreadCount',
        type    : 'int',
        persist : false
    }, {
        name : 'type',
        type : 'string',
        validators : [{
            type : 'inclusion',
            list : ['INBOX', 'JUNK', 'TRASH', 'SENT', 'FOLDER', 'DRAFT']
        }, {
            type : 'presence'
        }]
    }]

});
