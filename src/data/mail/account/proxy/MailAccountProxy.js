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
 * Specialized version of a REST-proxy to be used with MailAccounts.
 * Capable of creating the following URLs:
 *
 * READ:
 * MailAccounts
 * MailAccounts/[id]/MailFolders
 *
 * UPDATE:
 * MailAccounts/[id]
 *
 */
Ext.define("conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy", {

    extend: "Ext.data.proxy.Rest",

    requires: [
        "conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader"
    ],

    alias: "proxy.cn_mail-mailaccountproxy",

    reader: {
        type: "cn_mail-mailaccountjsonreader"
    },

    idParam: "id",

    appendId: false,

    /**
     * @private
     */
    entityName: "MailAccount",


    /**
     * @inheritdoc
     *
     * @param {Ext.data.Request} request
     *
     * @return {Object}
     *
     * @throws if #entityName is not in the list of #validEntityNames
     */
    buildUrl: function (request) {

        if (request.getRecords() && request.getRecords().length > 1) {
            Ext.raise({
                msg: "Doesn't support batch operations with multiple records.",
                request: request
            });
        }

        const me     = this,
            action = request.getAction();

        let url    = me.getUrl(request),
            rec    = request.getRecords() ? request.getRecords()[0] : null,
            params = request.getParams();

        if (!url.match(me.slashRe)) {
            url += "/";
        }

        if (action !== "read" && action !== "update") {
            Ext.raise("Unexpected error; any action other but \"read\" and \"update\" not supported.");
        }


        url += "MailAccounts";

        if (action === "read") {
            // if we are here, the mailAccountId is specified as the mail-account
            // for which the child items should get loaded
            if (params.mailAccountId && params.mailAccountId !== "root") {
                url += "/" +
                    params.mailAccountId +
                    "/MailFolders";
            }
        } else {
            url += "/" + rec.getId();
        }

        if (params) {
            delete params.mailAccountId;
        }


        request.setUrl(url);

        return me.callParent([request]);
    }

});
