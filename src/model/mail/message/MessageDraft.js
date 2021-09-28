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
 * Base model for extjs-app-webmail representing a message draft.
 *
 * @see {conjoon.cn_mail.model.mail.message.EmailAddress}
 */
Ext.define("conjoon.cn_mail.model.mail.message.MessageDraft", {

    extend: "conjoon.cn_mail.model.mail.message.AbstractMessageItem",

    requires: [
        "coon.core.data.field.EmailAddressCollection",
        "coon.core.data.validator.EmailAddressCollection",
        "conjoon.cn_mail.model.mail.message.DraftAttachment",
        "coon.core.data.field.EmailAddress",
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey"
    ],

    entityName: "MessageDraft",

    /**
     * Before a MessageDraft gets saved in a batch operation, this
     * will store the compound key before the batch operations proceed and change
     * the id of the related message.
     */
    preBatchCompoundKey: undefined,


    /**
     * @private
     */
    compoundKeyFields: {
        MessageBody: ["mailAccountId", "mailFolderId", "id"],
        DraftAttachment: {
            "mailAccountId": "mailAccountId",
            "mailFolderId": "mailFolderId",
            "id": "parentMessageItemId"
        }
    },


    fields: [{
        name: "replyTo",
        type: "cn_core-datafieldemailaddress"
    }, {
        name: "to",
        type: "cn_core-datafieldemailaddresscollection",
        validators: [{
            type: "cn_core-datavalidatoremailaddresscollection",
            allowEmpty: true
        }]
    }, {
        name: "cc",
        type: "cn_core-datafieldemailaddresscollection",
        validators: [{
            type: "cn_core-datavalidatoremailaddresscollection",
            allowEmpty: true
        }]
    }, {
        name: "bcc",
        type: "cn_core-datafieldemailaddresscollection",
        validators: [{
            type: "cn_core-datavalidatoremailaddresscollection",
            allowEmpty: true
        }]
    }, {
        /**
         * This is by default always true for MessageDrafts
         */
        name: "draft",
        type: "bool",
        defaultValue: true
    }, {
        /**
         * This is by default always true for MessageDrafts
         */
        name: "seen",
        type: "bool",
        defaultValue: true
    }, {
        /**
         * This is by default always false for MessageDrafts
         */
        name: "flagged",
        type: "bool",
        defaultValue: false
    }, {
        /**
         * This is by default always false for MessageDrafts
         */
        name: "answered",
        type: "bool",
        defaultValue: false
    }, {
        /**
         * This is by default always false for MessageDrafts
         */
        name: "recent",
        type: "bool",
        defaultValue: false
    }, {
        // only required by drafts for now
        // persist=false since value is set by BE
        // and not changed across FE
        name: "messageId",
        type: "string",
        persist: false
    }, {
        // only required by drafts for now
        name: "references",
        type: "string",
        defaultValue: null
    }, {
        // only required by drafts for now
        name: "inReplyTo",
        type: "string",
        defaultValue: null
    }, {
        // only required by drafts for now x-cn-draft-info
        name: "xCnDraftInfo",
        type: "string",
        defaultValue: null
    }, {
        name: "savedAt",
        type: "date",
        persist: false
    }],


    /**
     *@inheritdoc
     */
    processRecordAssociation: function (record) {

        const me = this;

        me.callParent(arguments);

        if (record.entityName === "DraftAttachment") {
            me.compareAndApplyCompoundKeys(record, false);
        }
    },


    /**
     * Makes sure the curent configured CompoundKey is saved in #preBatchCompoundKey.
     *
     * This method is API only.
     *
     * @return {undefined|conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} null,
     * if the compound key is not configured for this instance (record is a phantom) or the compound
     * key instance to which the preBatchCompoundKey was set
     */
    storePreBatchCompoundKey: function () {
        const me = this;

        let key = undefined ;

        if (me.isCompoundKeyConfigured()) {
            key = me.getCompoundKey();
            me.preBatchCompoundKey = key;
        }

        return key;
    },


    /**
     * Returns the previously set preBatchCompoundKey of this instance, if
     * available.
     *
     * @return {undefined|conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey} undefined,
     * if there is no preBatchCompoundKey available, or the compoundKey.
     */
    getPreBatchCompoundKey: function () {
        const me = this;

        return me.preBatchCompoundKey;
    },


    /**
     * Overridden to make sure target-parameter is set to "MessageBodyDraft"
     *
     * @inheritdoc
     */
    loadMessageBody: function (options) {

        const me = this;

        options = options || {};

        options.params = options.params || {};

        Ext.applyIf(options.params, {
            target: "MessageBodyDraft"
        });

        return me.callParent([options]);
    }


});