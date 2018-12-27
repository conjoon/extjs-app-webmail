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
 * Specialized version of a JSON Reader used with data for MailFolders
 */
Ext.define('conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader', {

    extend : 'Ext.data.reader.Json',

    requires : [
        'conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey'
    ],

    alias : 'reader.cn_mail-mailfolderjsonreader',

    mailFolderModelClass : 'conjoon.cn_mail.model.mail.folder.MailFolder',

    /**
     * @inheritdoc
     *
     * @return {Object}
     *
     * @throws if data is is not an object, or if the embedded property "data" is
     * neither an array nor an object
     *
     * @see applyCompoundKey
     */
    readRecords : function(data, readOptions, internalReadOptions) {

        const me = this;

        data = me.applyCompoundKey(data);

        return me.callParent([data, readOptions, internalReadOptions]);
    },


    /**
     * Computes the localId which is treated as the primary key for MailFolders
     * by utilizing conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey
     *
     * @param {Object} data
     *
     * @return {Boolean|Object}
     *
     * @see recurseChildren
     */
    applyCompoundKey : function(data) {

        const me = this;

        if (Ext.isObject(data)) {
            
            if (data.success !== false) {
                me.recurseChildren([].concat(data.data));
            }

            return data;
        }



        Ext.raise({
            msg  : "The \"data\" property was malformed and could not be processed by this Reader",
            data : data
        });

    },


    /**
     * @private
     *
     * @throws if any record found in records has no MailAccountId or no id.
     */
    recurseChildren : function(records) {

        if (!Ext.isArray(records)) {
            return;
        }

        const me = this,
              MailFolderCompoundKey = conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey;

        let rec;

        for (let i = 0, len = records.length; i < len; i++) {

            rec = records[i];

            if (!rec || !rec.mailAccountId || !rec.id) {
                Ext.raise({
                    msg  : "The \"data\" property was malformed and could not be processed by this Reader",
                    data : records
                });
            }

            rec.modelType = me.mailFolderModelClass;
            rec.localId   = MailFolderCompoundKey.createFor(
                rec.mailAccountId, rec.id
            ).toLocalId();

            me.recurseChildren(rec.data);

        }
    }



});
