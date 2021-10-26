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
 * Base model for extjs-app-webmail representing a message item.
 * Message items should be used whenever contents of MailFolders should be inspected.
 * The data structure used for MessageItems does only need necessary (meta) data
 * for providing information about a message. Further data can be requested
 * by loading MessageBody-models.
 *
 * Note:
 * =====
 * When setting the previewText-field, it's length is automatically adjusted by
 * previewText-field's "convert()"-method.
 *
 */
Ext.define("conjoon.cn_mail.model.mail.message.MessageItem", {

    extend: "conjoon.cn_mail.model.mail.message.AbstractMessageItem",

    requires: [
        // @define
        "l8",
        "conjoon.cn_mail.model.mail.message.ItemAttachment",
        "coon.core.data.field.EmailAddressCollection",
        "coon.core.data.field.FileSize"
    ],

    entityName: "MessageItem",

    fields: [{
        // field is required to indicate that attachments are available
        // ~before~ attachment associations are loaded
        name: "hasAttachments",
        type: "bool"
    }, {
        name: "to",
        type: "cn_core-datafieldemailaddresscollection"
    }, {
        name: "previewText",
        type: "string",
        persist: false,
        /**
         * Makes sure the previewText is left undefined if undefined is passed to the method.
         * Will return the value converted to string if it is an int, otherwise the string itself.
         * @param {Mixed} v
         * @param {conjoon.cn_mail.model.mail.message.MessageItem} record
         * @return {string}
         */
        convert: function (v, record) {
            return v === undefined ? undefined : (l8.isNumber(v) || l8.isString(v) ? "" + v : "");
        }
    }, {
        name: "size",
        type: "int",
        persist: false
    }, {
        name: "cn_deleted",
        type: "bool",
        persist: false
    }, {
        name: "cn_moved",
        type: "bool",
        persist: false
    }]


});
