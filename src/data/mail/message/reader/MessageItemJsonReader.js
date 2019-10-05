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
 * Specialized version of a JSON Reader used by Message Items, makes sure messageBodyId
 * gets computed if the action passed to #applyCompoundKey is "read"
 */
Ext.define('conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader', {

    extend : 'conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader',

    requires : [
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey'
    ],

    alias : 'reader.cn_mail-mailmessageitemjsonreader',

    foreignKeyProp : 'messageBodyId',

    /**
     * @inheritdoc
     */
    applyCompoundKey : function(data, action) {

        const me = this,
              MessageEntityCompoundKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

        data = me.callParent(arguments);

        if (Ext.isObject(data)) {
            if (Ext.isArray(data.data)) {

                let records = data.data,
                    len = records.length, rec, i

                for (i = 0; i < len; i++) {
                    rec = records[i];

                    if (action === 'read') {
                         rec[me.foreignKeyProp] = MessageEntityCompoundKey.createFor(
                             rec.mailAccountId, rec.mailFolderId, rec.id
                         ).toLocalId();
                    }

                }

                return data;

            } else if (Ext.isObject(data.data)) {
                // POST / PUT
                if (action === 'read') {
                    data.data[me.foreignKeyProp] = MessageEntityCompoundKey.createFor(
                       data.data.mailAccountId, data.data.mailFolderId, data.data.id
                    ).toLocalId();
                }
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
