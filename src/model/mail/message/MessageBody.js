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
 * Base model for app-cn_mail representing the body of a message that gets
 * loaded upon request. This is usually the case if a MessageItem is selected
 * for inspecting its contents. Instead of sending large chunks of message bodies
 * with a message item, this data is encapsulated in a separate model.
 *
 * - text (raw text of the message)
 * - textHtml (textHtml of the message)
 */
Ext.define('conjoon.cn_mail.model.mail.message.MessageBody', {

    extend : 'conjoon.cn_mail.model.mail.message.MessageItemChildModel',

    requires : [
        'conjoon.cn_core.data.field.CompoundKeyField'
    ],

    entityName : 'MessageBody',

    fields : [{
        name : 'textPlain',
        type : 'string'
    }, {
        name : 'textHtml',
        type : 'string'
    }]


});