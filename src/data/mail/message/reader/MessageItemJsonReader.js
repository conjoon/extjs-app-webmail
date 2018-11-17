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
 * Specialized version of a JSON Reader used by Message Items, makes sure messageBodyId
 * gets computed
 */
Ext.define('conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader', {

    extend : 'conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader',

    requires : [
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey'
    ],

    alias : 'reader.cn_mail-mailmessageitemjsonreader',

    /**
     * @inheritdoc
     */
    applyCompoundKey : function(data) {

        const me = this,
              MessageEntityCompoundKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

        data = me.callParent(arguments);

        if (Ext.isObject(data)) {
            if (Ext.isArray(data.data)) {

                let records = data.data,
                    len = records.length, rec, i

                for (i = 0; i < len; i++) {
                    rec = records[i];

                    rec.messageBodyId = MessageEntityCompoundKey.createFor(
                        rec.mailAccountId, rec.mailFolderId, rec.id
                    ).toLocalId();

                }

                return data;

            } else if (Ext.isObject(data.data)) {
                // POST / PUT
                data.data.messageBodyId = MessageEntityCompoundKey.createFor(
                    data.data.mailAccountId, data.data.mailFolderId, data.data.id
                ).toLocalId();

                return data;
            }
        }

        // allow for processing records first,
        // then make sure we return the data object if everything else failed
        if (Ext.isObject(data) && data.success === false) {
            return data;
        }
    }



});
