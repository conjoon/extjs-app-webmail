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
 * MessageItems and MessageDrafts.
 */
Ext.define("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {

    extend: "conjoon.cn_mail.data.mail.BaseProxy",

    requires: [
        // @define
        "l8",
        "conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader",
        "conjoon.cn_mail.data.mail.message.proxy.UtilityMixin",
        "conjoon.cn_mail.data.mail.message.writer.MessageEntityWriter",
        "coon.core.data.jsonApi.SorterEncoder",
        "conjoon.cn_mail.data.jsonApi.PnFilterEncoder"
    ],


    alias: "proxy.cn_mail-mailmessageentityproxy",

    writer: {
        type: "cn_mail-mailmessageentitywriter"
    },

    // default reader, gets set by BaseSchema for MessageItem and MessageDraft individually
    reader: {
        type: "cn_mail-mailmessageentityjsonreader"
    },

    idParam: "localId",

    validEntityNames: [
        "MessageDraft",
        "MessageItem",
        "MessageBody"
    ],

    /**
     * Do not send the page parameter
     */
    pageParam: "",

    /**
     * @type {String}
     */
    startParam: "page[start]",

    /**
     * @type {String}
     */
    limitParam: "page[limit]",

    /**
     * @type {coon.core.data.jsonApi.SorterEncoder} sorterEncoder
     * @private
     */

    /**
     * @type {conjoon.cn_mail.data.jsonApi.FilterEncoder} filterEncoder
     * @private
     */

    /**
     * Assembles the url in preparation for #buildUrl.
     * Provides convenient access for external APIs to query resource-locations
     * based on passed arguments
     *
     * @param {Ext.data.Request} request
     *
     * @return {Object}
     *
     * @throws if #entityName is not in the list of #validEntityNames
     */
    assembleUrl: function (request) {

        if (request.getRecords() && request.getRecords().length > 1) {
            Ext.raise({
                msg: "Doesn't support batch operations with multiple records.",
                request: request
            });
        }

        const me = this,
            params = request.getParams() ||{};

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

        if (!url.match(me.slashRe)) {
            url += "/";
        }

        if (action === "read") {
            source = params;

            if (source.filter) {
                me.purgeFilter(params, ["mailAccountId", "mailFolderId"]);
            } else if (rec && !source.id) {
                source.id = rec.data.id;
            }

        } else if (rec.phantom) {
            source = rec.data;
        } else {
            source = Ext.applyIf(Ext.apply({}, rec.modified), rec.data);
        }

        if (!source.mailAccountId || !source.mailFolderId) {
            Ext.raise({
                msg: "Missing compound keys.",
                source: source
            });
        }

        url += "MailAccounts/" + encodeURIComponent(source.mailAccountId) + "/" +
            "MailFolders/" + encodeURIComponent(source.mailFolderId) + "/" +
            "MessageItems";

        // switch target parameter to MessageBodyDraft if applicable
        let target = me.entityName,
            appendUrl = "",
            finalParams = {target: target};

        switch (action) {
        case "destroy":
            delete finalParams.target;
            break;
        case "create":
            finalParams = Object.assign(
                {},
                me.getDefaultParameters("MessageItem"),
                me.getDefaultParameters("MessageDraft"),
                {"fields[MailFolder]": ""}
            );
            break;
        case "update":
            delete finalParams.target;
            appendUrl = me.entityName;
            break;
        case "read":
            if (["MessageBody", "MessageItem", "MessageDraft"].includes(target)) {
                appendUrl = (target === "MessageBody" ? "MessageBody" : "");
                finalParams = Object.assign({}, me.getDefaultParameters(target));
            }
            break;
        }


        if (target === "MessageItem" && action === "update" && source.mailFolderId !== rec.get("mailFolderId")) {
            finalParams.action = "move";
        }

        request.setParams(Object.assign(request.getParams() || {}, finalParams));

        if (action !== "create") {
            if (Object.prototype.hasOwnProperty.call(source, "id")) {
                url += "/" + source.id + (appendUrl ? "/" + appendUrl : "");
            }
        }

        if (params) {
            delete params.mailFolderId;
            delete params.mailAccountId;
            delete params.id;
            delete params.localId;
        }

        return url;
    },


    /**
     * @inheritdoc
     *
     * @param {Ext.data.Request} request
     *
     * @return {Object}
     */
    buildUrl: function (request) {

        const
            me = this,
            url = me.assembleUrl(request);

        request.setUrl(url);

        return me.callParent([request]);
    },


    /**
     * Returns default parameters to be used with requests for the specified
     * parameter type, according to conjoon/rest-api-email.
     *
     * @return {Object}
     */
    getDefaultParameters (type) {

        const defs = {
            MessageItem: {
                include: "MailFolder",
                "fields[MailFolder]": "unreadMessages,totalMessages",
                "fields[MessageItem]": "*,previewText,replyTo,cc,bcc"
            },
            MessageDraft: {
                "include": "MailFolder",
                "fields[MailFolder]": "",
                "fields[MessageItem]": "*,previewText,hasAttachments,size"
            },
            ListMessageItem: {
                options: JSON.stringify({
                    previewText: {
                        plain: {
                            precedence: true,
                            length: 200
                        },
                        html: {
                            length: 200
                        }
                    }
                }),
                limit: -1
            }
        };

        return l8.unchain(type, defs, {});
    },

    /**
     * @inheritdoc
     */
    encodeSorters (sorters, preventArray) {

        const me = this;

        if (!me.sorterEncoder) {
            me.sorterEncoder = Ext.create("coon.core.data.jsonApi.SorterEncoder");
        }

        return me.sorterEncoder.encode(sorters);
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
    },


    /**
     * Returns the base configuration for a request for sending a POST to an
     * endpoint for sending a message flagged as DRAFT.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @returns {{method: string, url: *}}
     *
     * @throws if no base address for the "send" endpoint is available
     */
    getSendMessageDraftRequestConfig (messageDraft) {

        const
            me = this,
            baseAddress = messageDraft.schema.getUrlPrefix();


        if (messageDraft.phantom === true) {
            throw("\"MessageDraft\" must be existing");
        }

        if (!l8.isString(baseAddress)) {
            throw("\"baseAddress\" must be a string");
        }

        let url = [
            baseAddress,
            "MailAccounts",
            encodeURIComponent(messageDraft.getCompoundKey().getMailAccountId()),
            "MailFolders",
            encodeURIComponent(messageDraft.getCompoundKey().getMailFolderId()),
            "MessageItems",
            encodeURIComponent(messageDraft.getCompoundKey().getId()),
            "send"
        ].join("/");

        return {
            url: l8.unify(url, "/", "://"),
            method: "POST",
            params: Object.assign(
                me.getDefaultParameters("MessageItem"),
                me.getDefaultParameters("MessageDraft")
            )
        };
    }

});
