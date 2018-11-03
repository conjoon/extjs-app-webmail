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
 * Specialized version of a JSON Reader used by MessageItem child entities, such as
 * attachments.
 */
Ext.define('conjoon.cn_mail.data.mail.message.reader.MessageItemChildJsonReader', {

    extend : 'conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader',

    requires : [
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey'
    ],

    alias : 'reader.cn_mail-mailmessageitemchildjsonreader',

    /**
     * Computes the localId and the associated messageItemId with the appropriate
     * data mailAccountId, mailFolderId and parentMessageItemId. id is only used
     * for the local id along with the other keys.
     * For the messageItemId, the id is ignored and instead the parentMessageItemId is used.
     *
     * Does not call parent implementation!
     *
     * @inheritdoc
     */
    applyCompoundKey : function(data) {

        const me = this,
              ck = conjoon.cn_mail.data.mail.message.compoundKey,
              MessageEntityCompoundKey    = ck.MessageEntityCompoundKey,
              MessageItemChildCompoundKey = ck.MessageItemChildCompoundKey;

        if (Ext.isObject(data)) {
            if (Ext.isArray(data.data)) {

                let records = data.data,
                    len = records.length, rec, i;



                for (i = 0; i < len; i++) {
                    rec = records[i];

                    if (!rec.localId) {
                        rec.localId = MessageItemChildCompoundKey.createFor(
                            rec.mailAccountId, rec.mailFolderId, rec.parentMessageItemId, rec.id
                        ).toLocalId();
                    }

                    if (!rec.messageItemId) {
                        rec.messageItemId = MessageEntityCompoundKey.createFor(
                            rec.mailAccountId, rec.mailFolderId, rec.parentMessageItemId
                        ).toLocalId();
                    }

                }

                return data;

            } else if (Ext.isObject(data.data)) {

                // POST / PUT
                let dt = data.data;

                dt.localId = MessageItemChildCompoundKey.createFor(
                    dt.mailAccountId, dt.mailFolderId, dt.parentMessageItemId, dt.id
                ).toLocalId();

                dt.messageItemId = MessageEntityCompoundKey.createFor(
                    dt.mailAccountId, dt.mailFolderId, dt.parentMessageItemId
                ).toLocalId();

                return data;
            }
        }

        Ext.raise({
            msg  : "The \"data\" property was malformed and could not be processed by this Reader",
            data : data
        });
    }


});
