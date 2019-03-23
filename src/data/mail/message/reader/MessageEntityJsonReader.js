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
 * Specialized version of a JSON Reader used by MessageEntityProxy.
 */
/*This has to be refactres intp MessageEntityJsonReader which takes care of the entities MessageDraft,
    MessageBody and MessageItem; additionally, compound keys for messagebody and messageitem has to be
merged into MessageEntityCompoundKey*/
Ext.define('conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader', {

    extend : 'Ext.data.reader.Json',

    requires : [
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey'
    ],

    alias : 'reader.cn_mail-mailmessageentityjsonreader',

    rootProperty : 'data',


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
     * Computes the localId which is treated as the primary key for MessageItems
     * by utilizing conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
     *
     * @param {Object} data
     *
     * @return {Boolean|Object}
     */
    applyCompoundKey : function(data) {

        const me                    = this,
            MessageEntityCompoundKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;


        if (Ext.isObject(data)) {

            if (Ext.isArray(data.data)) {

                let records = data.data, i, len = records.length, rec;

                for (i = 0; i < len; i++) {
                    rec = records[i];
                    rec.localId = MessageEntityCompoundKey.createFor(
                        rec.mailAccountId, rec.mailFolderId, rec.id
                    ).toLocalId();
                }

                return data;

            } else if (Ext.isObject(data.data)) {
                // POST / PUT
                data.data.localId = MessageEntityCompoundKey.createFor(
                    data.data.mailAccountId, data.data.mailFolderId, data.data.id
                ).toLocalId();

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

    }



});
