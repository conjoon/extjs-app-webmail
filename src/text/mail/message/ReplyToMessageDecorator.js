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
 * Text Decorator for Email Messages which are used in "reply to" context.
 * Instances of this class will return an empty set of attachments.
 */
Ext.define("conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator", {

    extend: "conjoon.cn_mail.text.mail.message.CopyDecorator",

    requires: [
        "conjoon.cn_mail.text.mail.message.DecoratorFormat"
    ],

    /**
     * @inheritdoc
     */
    getTo: function () {

        var me = this;

        return [
            me.getReplyTo()
        ];
    },


    /**
     * @inheritdoc
     */
    getCc: function () {
        return [];
    },


    /**
     * @inheritdoc
     */
    getBcc: function () {
        return [];
    },


    /**
     * @inheritdoc
     */
    getTextHtml: function () {

        var me           = this,
            messageDraft = me.messageDraft;

        return [
            "<br /><br/>",
            "<blockquote style=\"margin-left:4px;padding-left:10px;border-left:4px solid #bee9fc\">",
            me.getMessageBodyIntroHeaderFields(messageDraft),
            "<br /><br />",
            messageDraft.getMessageBody().get("textHtml"),
            "</blockquote>"
        ].join("");

    },


    /**
     * @private
     */
    getMessageBodyIntroHeaderFields: function (messageDraft) {

        var from            = messageDraft.get("from"),
            DecoratorFormat = conjoon.cn_mail.text.mail.message.DecoratorFormat,
            result;

        result = [
            Ext.String.format("<b>On {0} at {1}, {2} wrote:</b>",
                Ext.util.Format.date(messageDraft.get("date"), "d.m.Y"),
                Ext.util.Format.date(messageDraft.get("date"), "H:i"),
                DecoratorFormat.stringifyEmailAddress(from)
            )
        ].join("<br />");

        return result;
    },

    /**
     * @inheritdoc
     */
    getAttachments: function () {
        return [];
    },


    /**
     * Decorates the MessageDraft's reference-value.
     * Appends this messageDraft's messageId to the already existing references
     * value.
     *
     * @return {String}
     *
     * @private
     */
    getReferences: function () {

        const me           = this,
            messageDraft = me.messageDraft,
            messageId    = messageDraft.get("messageId");

        let references = me.messageDraft.get("references");

        return references
            ? references + " " + messageId
            : messageId;
    },


    /**
     * Decorates the MessageDraft's inReplyTo-value.
     * Returns the messageId of this messageDraft.
     *
     * @return {String}
     *
     * @private
     */
    getInReplyTo: function () {

        const me           = this,
            messageDraft = me.messageDraft,
            messageId    = messageDraft.get("messageId");

        return messageId;
    },


    /**
     * Returns the x-cn-draft-info header-field value as a base64 encoded, json-
     * encoded array consisting of the mailAccountId, the mailFolderId and the id
     * of the message (compound key) for which this decorator was called.
     *
     * @returns {string}
     */
    getXCnDraftInfo: function () {

        const me           = this,
            messageDraft = me.messageDraft;

        return btoa(
            Ext.encode([
                messageDraft.get("mailAccountId"),
                messageDraft.get("mailFolderId"),
                messageDraft.get("id")
            ])
        );

    },

    /**
     * Makes sure references, inReplyTo and xCnDraftInfo are computed and assigned
     * to the MessageDraftConfig.
     *
     * @inheritdoc
     */
    toMessageDraftConfig: function (options = {}) {

        const me = this;

        options["references"]  = me.getReferences();
        options["inReplyTo"] = me.getInReplyTo();
        options["xCnDraftInfo"] = me.getXCnDraftInfo();

        return me.callParent([options]);
    }

});