/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Specialized version of a REST-proxy to be used with
 * MessageItem child entities, such as attachments.
 */
Ext.define("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {

    extend: "coon.core.data.proxy.RestForm",

    requires: [
        "conjoon.cn_mail.data.mail.message.reader.MessageItemChildJsonReader",
        "conjoon.cn_mail.data.mail.message.writer.AttachmentWriter",
        "conjoon.cn_mail.data.mail.message.proxy.UtilityMixin"
    ],

    statics: {
        required: {
            requestConfigurator: "coon.core.data.request.Configurator"
        }
    },

    mixins: {
        utilityMixin: "conjoon.cn_mail.data.mail.message.proxy.UtilityMixin"
    },

    alias: "proxy.cn_mail-mailmessageattachmentproxy",

    writer: {
        type: "cn_mail-mailmessageattachmentwriter"
    },


    reader: {
        type: "cn_mail-mailmessageitemchildjsonreader"
    },

    idParam: "localId",

    appendId: false,

    /**
     * The entity being used with this Proxy. Either DraftAttachment or
     * ItemAttachment.
     * @cfg {string}
     */
    entityName: null,

    /**
     * Valid entity names to be used with this proxy.
     * @private
     */
    validEntityNames: [
        "DraftAttachment",
        "ItemAttachment"
    ],

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
            params = request.getParams();

        if (me.validEntityNames.indexOf(me.entityName) === -1) {
            Ext.raise({
                msg: "The entityName (\"" + me.entityName + "\") is not allowed to be used with the url builder of this proxy.",
                entityName: me.entityName
            });
        }

        let url = me.getUrl(request),
            action = request.getAction(),
            rec = request.getRecords() ? request.getRecords()[0] : null,
            source;

        if (me.entityName !== "DraftAttachment" && ["create", "update", "destroy"].indexOf(action) !== -1) {
            Ext.raise({
                msg: "Unexpected entityName with specified action",
                entityName: me.entityName,
                action: action
            });
        }

        if (!url.match(me.slashRe)) {
            url += "/";
        }

        if (action === "read") {

            source = params;

            if (source.filter) {
                me.purgeFilter(params, ["mailAccountId", "mailFolderId", "parentMessageItemId"]);
            } else if (rec && !source.id) {
                source.id = rec.data.id;
            }
        } else if (rec.phantom) {
            source = rec.data;
        } else {
            source = Ext.applyIf(Ext.apply({}, rec.modified), rec.data);
        }

        if (!source.mailAccountId || !source.mailFolderId || !source.parentMessageItemId) {
            Ext.raise({
                msg: "Missing compound keys.",
                source: source
            });
        }

        url += "MailAccounts/" + encodeURIComponent(source.mailAccountId) + "/" +
            "MailFolders/" + encodeURIComponent(source.mailFolderId) + "/" +
            "MessageItems/" + encodeURIComponent(source.parentMessageItemId) + "/" +
            "Attachments";

        if (action !== "create") {
            if (Object.prototype.hasOwnProperty.call(source,"id")) {
                url += "/" + source.id;
            }
        }

        if (params) {
            delete params.mailFolderId;
            delete params.mailAccountId;
            delete params.parentMessageItemId;
            delete params.id;
            delete params.localId;
        }

        request.setUrl(url);

        return me.callParent([request]);
    },

    /**
     * @param request
     * @returns {*}
     */
    sendRequest (request) {

        const me = this;

        request = me.requestConfigurator.configure(request);

        return me.callParent([request]);
    },

    /**
     * Overriden to consider filter syntax according to
     * https://www.conjoon.org/docs/api/rest-api/@conjoon/rest-api-description/rest-api-email
     *
     * @return {String}
     */
    encodeFilters (filters) {

        const me = this;

        if (!me.filterEncoder) {
            me.filterEncoder = Ext.create("conjoon.cn_mail.data.jsonApi.PnFilterEncoder");
        }

        return me.filterEncoder.encode(filters);
    }

});
