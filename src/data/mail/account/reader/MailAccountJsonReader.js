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
 * Specialized version of a JSON Reader used by MailAccountProxy.
 *
 * This class uses internally a mailFolderJsonReader if THIS reader detects the
 * data to be a MailFolder (see peekFolder).
 */
Ext.define('conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader', {

    extend : 'Ext.data.reader.Json',

    requires : [
        'conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader'
    ],

    alias : 'reader.cn_mail-mailaccountjsonreader',

    rootProperty : 'data',

    typeProperty : 'modelType',

    mailAccountModelClass : 'conjoon.cn_mail.model.mail.account.MailAccount',


    /**
     * @inheritdoc
     *
     * @return {Object}
     *
     * @throws if data is is not an object, or if the embedded property "data" is
     * neither an array nor an object
     *
     * @see processHybridData
     */
    readRecords : function(data, readOptions, internalReadOptions) {

        const me = this;

        data = me.processHybridData(data);

        return me.callParent([data, readOptions, internalReadOptions]);
    },


    /**
     * Applies the needed model information to the raw data.
     *
     * @param {Object} data
     *
     * @return {Boolean|Object}
     */
    applyModelTypes : function(data) {

        const me = this;

        if (Ext.isObject(data)) {

            if (Ext.isArray(data.data)) {

                let records = data.data, i, len = records.length, rec;

                for (i = 0; i < len; i++) {
                    rec = records[i];

                    rec[me.getTypeProperty()] = me.mailAccountModelClass;
                }

                return data;

            } else if (Ext.isObject(data.data)) {
                // POST / PUT
                let d = data.data;

                d[me.getTypeProperty()] = me.mailAccountModelClass;

                return data;
            }
        }

        if (Ext.isObject(data) && data.success === false) {
            return data;
        }

        Ext.raise({
            msg  : "The \"data\" property was malformed and could not be processed by this Reader",
            data : data
        });

    },


    /**
     * @private
     */
    processHybridData : function(data) {
        const me = this;

        if (me.peekFolder(data)) {

            if (!me.mailFolderReader) {
                me.mailFolderReader = Ext.create('conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader');
            }
            data = me.mailFolderReader.applyCompoundKey(data);
        } else {
            data = me.applyModelTypes(data);
        }

        return data;
    },


    /**
     * Peeks the specified object for any signs of being an entity representing
     * a MailFolder
     *
     * @param {Object} data
     *
     * @returns {Boolean} true if the specified object represents a MailFolder,
     * otherwise false.
     *
     * @private
     */
    peekFolder : function(data) {

        if (Ext.isObject(data)) {

            let t = [].concat(data.data);

            if (t[0] && t[0].hasOwnProperty('mailAccountId')) {
                return true;
            }

        }

        return false;

    }



});
