/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * Specialized version of a JSON Reader used with data for MailFolders
 */
Ext.define("conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader", {

    extend: "Ext.data.reader.Json",

    requires: [
        "conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey"
    ],

    alias: "reader.cn_mail-mailfolderjsonreader",

    mailFolderModelClass: "conjoon.cn_mail.model.mail.folder.MailFolder",

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
    readRecords: function (data, readOptions, internalReadOptions) {

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
    applyCompoundKey: function (data) {

        const me = this;

        if (Ext.isObject(data)) {
            
            if (data.success !== false) {
                me.recurseChildren([].concat(data.data));
            }

            return data;
        }


        Ext.raise({
            msg: "The \"data\" property was malformed and could not be processed by this Reader",
            data: data
        });

    },


    /**
     * @private
     *
     * @throws if any record found in records has no MailAccountId or no id.
     */
    recurseChildren: function (records) {

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
                    msg: "The \"data\" property was malformed and could not be processed by this Reader",
                    data: records
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
