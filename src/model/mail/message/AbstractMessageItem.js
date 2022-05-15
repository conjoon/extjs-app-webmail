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
 * Abstract base model for extjs-app-webmail message items.
 *
 * The schema used by this model is {@link conjoon.cn_mail.data.mail.BaseSchema}
 *
 * Note:
 * Also the foreign key information for the MessageBody would usually be stored
 * in the MessageBody itself (MessageBody.messageItemId), we set the key of
 * the MessageBody directly into the MessageItem, since the linkTo()-method
 * only accepts a primary key when referencing a model, which needs to be the id
 * of the referenced model, not of the associated model.
 * Any loading of the referenced model while adjusting keys server side (i.e.
 * treating the "id" as the "messageItemId") will lead to errors when the model
 * gets loaded.
 *
 */
Ext.define("conjoon.cn_mail.model.mail.message.AbstractMessageItem", {

    extend: "conjoon.cn_mail.model.mail.message.CompoundKeyedModel",

    requires: [
        "conjoon.cn_mail.model.mail.message.MessageBody",
        "coon.core.data.field.EmailAddress"
    ],


    fields: [{
        name: "subject",
        type: "string"
    }, {
        name: "date",
        type: "date",
        dateReadFormat: "Y-m-d H:i:s O"
    }, {
        name: "from",
        type: "cn_core-datafieldemailaddress"
    }, {
        persist: false,
        name: "messageBodyId",
        type: "string",
        reference: {
            child: "MessageBody"
        },
        unique: true,
        validators: "presence"
    }, {
        name: "seen",
        type: "bool"
    }, {
        name: "answered",
        type: "bool",
        persist: false
    }, {
        name: "flagged",
        type: "bool"
    }, {
        name: "draft",
        type: "bool"
    }, {
        name: "recent",
        type: "bool",
        persist: false
    }],


    /**
     * Implemented to make sure filters for mailAccountId, mailFolderId and
     * parentMessageItemId are properly set.
     *
     * @param {Object} options options-object to be passed to load()
     *
     * @return {Ext.data.Store}
     */
    loadAttachments: function (options) {

        const me = this;

        me.attachments().clearFilter(true);

        me.attachments().addFilter([{
            property: "mailAccountId",
            value: me.get("mailAccountId")
        }, {
            property: "mailFolderId",
            value: me.get("mailFolderId")
        }, {
            property: "parentMessageItemId",
            value: me.get("id")
        }], true);

        return  me.attachments().load(options);
    },


    /**
     * Wrapper for getMessageBody to make sure params mailFolderId and
     * mailAccountId are submitted when loading.
     *
     * @param {Object} options options-object to be passed to getMessageBody()
     *
     * @returns {conjoon.cn_mail.model.mail.message.MessageBody}
     */
    loadMessageBody: function (options) {

        const me = this;

        options = options || {};

        options.params = options.params || {};

        if (!me.get("mailFolderId") || !me.get("mailAccountId") || !me.get("id")) {
            Ext.raise({
                msg: "Cannot load MessageBody, compound keys missing",
                data: me.data
            });
        }

        Ext.applyIf(options.params, {
            mailFolderId: me.get("mailFolderId"),
            mailAccountId: me.get("mailAccountId"),
            id: me.get("id")
        });

        return me.getMessageBody(options);
    },


    /**
     * @inheritdoc
     */
    getAssociatedCompoundKeyedData: function () {
        const me = this;

        let data = me._messageBody ? [me._messageBody] : [];

        return data.concat(me.attachments().getRange());
    },


    privates: {

        /**
         * Overridden to make sure message items are aware of MessageBodys being set
         * and comparing their compound keys can be done.
         *
         * @inheritdoc
         *
         * @see processRecordAssociation
         */
        onAssociatedRecordSet: function (record, role) {
            const me = this;

            me.processRecordAssociation(record);

            return me.callParent(arguments);
        }
    },


    /**
     * @inheritdoc
     */
    processRecordAssociation: function (record) {

        const me = this;

        if (record.entityName === "MessageBody") {
            me.compareAndApplyCompoundKeys(record, true);
        }
    }


});