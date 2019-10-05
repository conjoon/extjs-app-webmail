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
 * Specialized version of a JSON Reader used by MessageItem child entities, such as
 * attachments.
 *
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
     * The value will only be computed if the passed action is "read".
     *
     * Does not call parent implementation!
     *
     * @inheritdoc
     *
     * @throws if action is not set to "read", "destroy", "update" or "create"
     */
    applyCompoundKey : function(data, action) {

        const me = this,
              ck = conjoon.cn_mail.data.mail.message.compoundKey,
              MessageEntityCompoundKey    = ck.MessageEntityCompoundKey,
              MessageItemChildCompoundKey = ck.MessageItemChildCompoundKey,
              valChk                      = ["create", "update", "read", "destroy"];


        if (valChk.indexOf(action) === -1) {
            let exp = valChk.join(", ");
            // "unexpected value for \"action\", expected any of \"" + valChk.join(", ") + "\", "+  ")
            Ext.raise(`unexpected value for "action", expected any of "${exp}", but got "${action}"`);
        }


        if (Ext.isObject(data)) {
            if (Ext.isArray(data.data)) {

                let records = data.data,
                    len = records.length, rec, i;

                for (i = 0; i < len; i++) {
                    rec = records[i];

                    rec.localId = MessageItemChildCompoundKey.createFor(
                        rec.mailAccountId, rec.mailFolderId, rec.parentMessageItemId, rec.id
                    ).toLocalId();

                    if (action === 'read') {
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

                if (action === 'read') {
                    dt.messageItemId = MessageEntityCompoundKey.createFor(
                        dt.mailAccountId, dt.mailFolderId, dt.parentMessageItemId
                    ).toLocalId();
                }
                return data;
            }
        }

        if (Ext.isObject(data) && (data.success === false || data.success === true)) {
            return data;
        }

        Ext.raise({
            msg  : "The \"data\" property was malformed and could not be processed by this Reader",
            data : data
        });
    }


});