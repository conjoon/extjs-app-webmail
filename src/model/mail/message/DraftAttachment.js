/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Base model for extjs-app-webmail representing an attachment associated with a
 * MessageDraft.
 * this model uses a proxy of the type {@link conjoon.cn_mail.data.mail.proxy.AttachmentProxy}
 * to make sure that attachments can be uploaded to the server when saving.
 * See {@link conjoon.cn_mail.view.mail.message.AttachmentList} for
 * an implementation.
 */
Ext.define("conjoon.cn_mail.model.mail.message.DraftAttachment", {

    extend: "conjoon.cn_mail.model.mail.message.AbstractAttachment",

    requires: [
        "coon.core.data.proxy.RestForm",
        "coon.core.data.field.Blob",
        "conjoon.cn_mail.store.mail.message.MessageAttachmentStore"
    ],

    entityName: "DraftAttachment",

    fields: [{
        persist: false,
        name: "messageItemId",
        type: "string",
        reference: {
            parent: "MessageDraft",
            inverse: {
                role: "attachments",
                storeConfig: {
                    type: "cn_mail-mailmessageattachmentstore"
                }
            }
        }
    }, {
        name: "file",
        type: "cn_core-datafieldblob"
    }],

    compoundKeyFields: {
        MessageDraft: {
            "mailAccountId": "mailAccountId",
            "mailFolderId": "mailFolderId",
            "parentMessageItemId": "id"
        }

    },

    /**
     * @inheritdoc
     */
    getAssociatedCompoundKeyedData: function () {
        const me = this;
        return me.getMessageItem && me.getMessageItem() ? [me.getMessageItem()] : [];
    }


});