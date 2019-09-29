/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
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
        'conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader',
        'conjoon.cn_mail.data.mail.folder.MailFolderTypes'
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

        const me      = this,
              ACCOUNT = conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT,
              tp      = me.getTypeProperty();

        if (Ext.isObject(data)) {

            if (Ext.isArray(data.data)) {

                let records = data.data, i, len = records.length, rec;

                for (i = 0; i < len; i++) {
                    rec = records[i];

                    rec.folderType = ACCOUNT;
                    rec[tp]  = me.mailAccountModelClass;
                }

                return data;

            } else if (Ext.isObject(data.data)) {
                // POST / PUT
                let d = data.data;

                d.folderType     = ACCOUNT;
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
