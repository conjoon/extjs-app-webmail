/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * An specific of Ext.data.writer.Json to comply with conjoon/rest-api-email
 * for MessageItem, MessageDraft and MessageBody.
 */
Ext.define("conjoon.cn_mail.data.mail.message.writer.MessageEntityWriter", {

    extend: "Ext.data.writer.Json",

    alias: "writer.cn_mail-mailmessageentitywriter",

    /**
     * Adjusts the json so that key information will be available in the property "data",
     * and values to write in the property "data.attributes".
     * Additionally, the request proxy's entityName will be made available in the property
     * "data.type"
     *
     * @example
     *      {
     *          mailAccountId: "dev",
     *          mailFolderId: "INBOX.Drafts",
     *          id: "123",
     *          subject: "Hello World",
     *          date: "123445565"
     *      }
     *      // becomes
     *     {
     *         data: {
     *             type: [proxy.entityName],
     *             mailAccountId: "dev",
     *             mailFolderId: "INBOX.Drafts",
     *             id: "123",
     *             attributes: {
     *                 subject: "Hello World",
     *                 date: "123445565"
     *             }
     *         }
     *     }
     *
     * @param {Ext.data.Request} request
     * @param {Object} data
     *
     *
     * @return {Ext.data.Request} The request containing the updated json-data
     */
    writeRecords (request, data) {

        const me = this;
        
        request = me.callParent(arguments);

        const 
            jsonData = request.getJsonData(),
            root = {},
            attributes = Object.fromEntries(
                Object.entries(jsonData).filter(entry => {
                    return !["messageBodyId", "id", "localId", "mailAccountId", "mailFolderId"].includes(entry[0]);
                })
            );

        root.data = Object.fromEntries(
            Object.entries(jsonData).filter(entry => {
                return ["id", "mailAccountId", "mailFolderId"].includes(entry[0]);
            })
        );

        root.data.type = request.getProxy().entityName;

        // if we detect a move operation, we will rewrite the mailFolderId in the root to the origin,
        // and add a mailFolderId to the data-bag
        if (request.getParams() && request.getParams().action === "move") {
            attributes.mailFolderId = root.data.mailFolderId;
            root.data.mailFolderId = request.getOperation().getRecords()[0].modified.mailFolderId;
            delete request.getParams().action;
        }

        root.data.attributes = attributes;

        request.setJsonData(root);

        return request;

    }

});
