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
 * Base model for app-cn_mail representing an attachment associated with a
 * MessageDraft.
 * this model uses a proxy of the type {@link conjoon.cn_mail.data.mail.proxy.AttachmentUploadProxy}
 * to make sure that attachments can be uploaded to the server when saving.
 * See {@link conjoon.cn_mail.view.mail.message.AttachmentList} for
 * an implementation.
 */
Ext.define('conjoon.cn_mail.model.mail.message.DraftAttachment', {

    extend : 'conjoon.cn_mail.model.mail.message.AbstractAttachment',

    requires : [
        'conjoon.cn_core.data.proxy.RestForm',
        'conjoon.cn_core.data.field.Blob',
        'conjoon.cn_mail.store.mail.message.MessageAttachmentStore'
    ],

    entityName : 'DraftAttachment',

    fields : [{
        name      : 'messageItemId',
        type      : 'string',
        reference : {
            parent: 'MessageDraft',
            inverse: {
                role : 'attachments',
                storeConfig: {
                    type: 'cn_mail-mailmessageattachmentstore'
                }
            }
        }
    }, {
        name : 'file',
        type : 'cn_core-datafieldblob'
    }]


});