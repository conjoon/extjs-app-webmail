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
 * Base model for app-cn_mail representing a message draft.
 *
 * @see {conjoon.cn_mail.model.mail.message.EmailAddress}
 */
Ext.define('conjoon.cn_mail.model.mail.message.MessageDraft', {

    extend : 'conjoon.cn_mail.model.mail.message.AbstractMessageItem',

    requires : [
        'conjoon.cn_core.data.field.EmailAddressCollection',
        'conjoon.cn_core.data.validator.EmailAddressCollection',
        'conjoon.cn_mail.model.mail.message.DraftAttachment',
        'conjoon.cn_core.data.field.EmailAddress'
    ],

    entityName : 'MessageDraft',

    fields : [{
        name      : 'replyTo',
        type      : 'cn_core-datafieldemailaddress',
        persist   : false
    }, {
        name       : 'to',
        type       : 'cn_core-datafieldemailaddresscollection',
        validators : [{
            type       : 'cn_core-datavalidatoremailaddresscollection',
            allowEmpty : true
        }]
    }, {
        name       : 'cc',
        type       : 'cn_core-datafieldemailaddresscollection',
        validators : [{
            type       : 'cn_core-datavalidatoremailaddresscollection',
            allowEmpty : true
        }]
    }, {
        name       : 'bcc',
        type       : 'cn_core-datafieldemailaddresscollection',
        validators : [{
            type       : 'cn_core-datavalidatoremailaddresscollection',
            allowEmpty : true
        }]
    }, ]


});