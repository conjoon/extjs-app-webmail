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
 * Text Decorator for Email Messages that get forwarded.
 */
Ext.define("conjoon.cn_mail.text.mail.message.ForwardMessageDecorator", {

    extend: "conjoon.cn_mail.text.mail.message.CopyDecorator",

    requires: [
        "conjoon.cn_mail.text.mail.message.DecoratorFormat"
    ],

    /**
     * @inheritdoc
     */
    getTo: function () {
        return [];
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
            "<br /><br />",
            me.getMessageBodyIntroText(messageDraft),
            "<br/>",
            "<blockquote style=\"margin-left:4px;padding-left:10px;border-left:4px solid #bee9fc\">",
            me.getMessageBodyIntroHeaderFields(messageDraft),
            "<br /><br />",
            messageDraft.getMessageBody().get("textHtml"),
            "</blockquote>"
        ].join("");

    },


    /**
     *@private
     */
    getMessageBodyIntroText: function (messageDraft) {
        /**
         * @i18n
         */
        return "--- Begin of the forwarded message:";
    },


    /**
     * @private
     */
    getMessageBodyIntroHeaderFields: function (messageDraft) {

        var from            = messageDraft.get("from"),
            DecoratorFormat = conjoon.cn_mail.text.mail.message.DecoratorFormat,
            result;

        result = [
            Ext.String.format("<b>From:</b> {0}", DecoratorFormat.stringifyEmailAddress(from)),
            Ext.String.format("<b>Date:</b> {0}", Ext.util.Format.date(messageDraft.get("date"), "d.m.Y H:i")),
            Ext.String.format("<b>To:</b> {0}", DecoratorFormat.stringifyEmailAddress(messageDraft.get("to"))),
            Ext.String.format("<b>Subject:</b> {0}", messageDraft.get("subject")),
            Ext.String.format("<b>Reply to:</b> {0}", messageDraft.get("replyTo")
                ? DecoratorFormat.stringifyEmailAddress(messageDraft.get("replyTo"))
                : DecoratorFormat.stringifyEmailAddress(from))
        ].join("<br />");

        return result;
    }


});