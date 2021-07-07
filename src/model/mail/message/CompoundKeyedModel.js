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
 * CompoundKeyedModel for items that have relation to a mailAccountId and
 * a mailFolderId, and which carry information about the originalId which might
 * differ from the id provided by the backend, to make sure IMAP message entities
 * can be identified safely across carious accounts existing in the ui.
 *
 * When any part of the compound key (e.g. mailAccountId, mailFolderId or id)
 * is updated, the associated side gets also updated since these relations
 * (MessageDraft/MessageBody and vice versa) are strongly coupled and represent
 * one and teh same entity by provding different views on the data.
 *
 * Client models assume that the backend takes care of updating ALL associated
 * data once one side of the association changes, so client-changed associations
 * (by the herein found automatism) does NOT TRIGGER an update.
 *
 * For making sure batched operations properly do not send multiple POST in a batch
 * (since ONE operation might have allready created the main data), associated
 * proxies/interfaces should make sure that based upon the data in a record
 * available a PUT/PATCH is being send to the server instead of a CREATE.
 *
 * @abstract
 */
Ext.define("conjoon.cn_mail.model.mail.message.CompoundKeyedModel", {

    extend: "conjoon.cn_mail.model.mail.AbstractCompoundKeyedModel",

    requires: [
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey"
    ],


    fields: [{
        name: "mailFolderId",
        type: "cn_core-datafieldcompoundkey"
    }],


    /**
     * @private
     */
    compoundKeyFields: ["mailAccountId", "mailFolderId", "id"],

    /**
     * @private
     */
    foreignKeyFields: ["mailAccountId", "mailFolderId", "id"],


    /**
     * @inheritdoc
     *
     * @returns {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey}
     */
    getRepresentingCompoundKeyClass: function () {
        return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;
    }


});