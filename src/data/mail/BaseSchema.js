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
 * Base schema for app-cn_mail.
 *
 * This schema defines a default REST proxy which is used for all models.
 * The url created is as follows: cn_mail/{model.entityName}, except for
 * the DraftAttachment- and ItemAttachment-entities. (@see #constructProxy}.
 */
Ext.define("conjoon.cn_mail.data.mail.BaseSchema", {

    extend: "coon.core.data.schema.BaseSchema",

    requires: [
        "conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy",
        "conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy",
        "conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy",
        "conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader",
        "conjoon.cn_mail.data.mail.message.reader.MessageBodyJsonReader"
    ],

    alias: "schema.cn_mail-mailbaseschema",

    namespace: "conjoon.cn_mail.model.mail",

    id: "cn_mail-baseschema",

    urlPrefix: "cn_mail",

    proxy: {
        type: "rest",
        url: "{prefix}"
    },

    privates: {

        /**
         * There seems to be no way to properly inject methods in ObjectTemplates.
         * Thus, we extend this class' constructProxy method and adjust the proxy
         * url for the DraftAttachment and the ItemAttachment, which are in fact
         * the same entities, but have to be treated differently in the Sencha
         * World due to the associations not being flexible enough.
         *
         * @param Model
         * @returns {*|Object}
         */
        constructProxy: function (Model) {

            const me = this;

            let proxy    = me.callParent(arguments),
                tmpData  = Ext.Object.chain(Model),
                entityName = tmpData.entityName;

            if (["MessageItem", "MessageDraft", "MessageBody"].indexOf(entityName) !== -1) {

                proxy.entityName = entityName;
                proxy.prefix     = me.getUrlPrefix();
                proxy.type       = "cn_mail-mailmessageentityproxy";

                if (entityName !== "MessageBody")  {
                    proxy.reader = "cn_mail-mailmessageitemjsonreader";
                } else {
                    proxy.reader = "cn_mail-mailmessagebodyjsonreader";
                }

            } else if (["DraftAttachment", "ItemAttachment"].indexOf(entityName) !==  -1) {

                proxy.entityName = entityName;
                proxy.prefix     = me.getUrlPrefix();
                proxy.type       = "cn_mail-mailmessageattachmentproxy";

            } else if (["MailAccount"].indexOf(entityName) !==  -1) {

                proxy.prefix     = me.getUrlPrefix();
                proxy.type       = "cn_mail-mailaccountproxy";

            } else {
                proxy.url = me.getUrlPrefix() + "/" + tmpData.entityName;
            }

            return proxy;
        }
    }

});
