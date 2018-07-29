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
 * Base model for app-cn_mail representing a message item.
 * Message items should be used whenever contents of MailFolders should be inspected.
 * The data structure used for MessageItems does only need necessary (meta) data
 * for providing information about a message. Further data can be requested
 * by loading MessageBody-models.
 *
 * Note:
 * =====
 * When setting the previewText-field, it's length is automatically adjusted by
 * previewText-field's "convert()"-method.
 *
 */
Ext.define('conjoon.cn_mail.model.mail.message.MessageItem', {

    extend : 'conjoon.cn_mail.model.mail.message.AbstractMessageItem',

    requires : [
        'conjoon.cn_mail.model.mail.message.ItemAttachment',
        'conjoon.cn_core.data.field.EmailAddressCollection',
        'conjoon.cn_core.data.field.FileSize'
    ],

    entityName : 'MessageItem',

    fields : [{
        // field is required to indicate that attachments are available
        // ~before~ attachment associations are loaded
        name : 'hasAttachments',
        type : 'bool'
    }, {
        name : 'isRead',
        type : 'bool'
    }, {
        name : 'to',
        type : 'cn_core-datafieldemailaddresscollection'
    }, {
        name    : 'previewText',
        type    : 'string',
        persist : false,
        /**
         * Makes sure the previewText is not longer than 200 characters.
         * @param {Mixed} v
         * @param {conjoon.cn_mail.model.mail.message.MessageItem} record
         * @return {string}
         */
        convert : function(v, record) {
            return (typeof v == 'string')
                   ? v.substring(0, 200)
                   : '';

        }
    }, {
        name    : 'size',
        type    : 'int',
        persist : false
    }, {
        name    : 'cn_deleted',
        type    : 'bool',
        persist : false
    }, {
        name    : 'cn_moved',
        type    : 'bool',
        persist : false
    }]



});