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
 * MessageItemChildModel for making sure child models for MessageItems have
 * required information configured.
 *
 * @abstract
 */
Ext.define("conjoon.cn_mail.model.mail.message.MessageItemChildModel", {


    extend: "conjoon.cn_mail.model.mail.message.CompoundKeyedModel",

    requires: [
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey"
    ],

    fields: [{
        name: "parentMessageItemId",
        type: "cn_core-datafieldcompoundkey"
    }],

    /**
     * @private
     */
    foreignKeyFields: ["mailAccountId", "mailFolderId", "parentMessageItemId", "id"],


    /**
     * @inheritdoc
     * @returns {conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey}
     */
    getRepresentingCompoundKeyClass: function () {
        return conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey;
    }


});