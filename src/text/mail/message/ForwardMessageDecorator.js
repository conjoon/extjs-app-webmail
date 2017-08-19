/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Text Decorator for Email Messages that get forwarded.
 */
Ext.define('conjoon.cn_mail.text.mail.message.ForwardMessageDecorator', {

    extend : 'conjoon.cn_mail.text.mail.message.CopyDecorator',

    /**
     * @inheritdoc
     */
    getTo : function() {
        return [];
    },


    /**
     * @inheritdoc
     */
    getCc : function() {
        return [];
    },


    /**
     * @inheritdoc
     */
    getBcc : function() {
        return [];
    },


    /**
     * @inheritdoc
     */
    getTextHtml : function() {

        var me           = this,
            textHtml     = "",
            messageDraft = me.messageDraft;

        return [
            "<br /><br />",
            me.getMessageBodyIntroText(messageDraft),
            "<br/>",
            "<blockquote style=\"margin-left:4px;padding-left:10px;border-left:4px solid #bee9fc\">",
            me.getMessageBodyIntroHeaderFields(messageDraft),
            "<br /><br />",
            messageDraft.getMessageBody().get('textHtml'),
            "</blockquote>"
        ].join("");

    },


    /**
     *@private
     */
    getMessageBodyIntroText : function(messageDraft) {
        /**
         * @i18n
         */
        return "--- Begin of the forwarded message:";
    },


    /**
     * @private
     */
    getMessageBodyIntroHeaderFields : function(messageDraft) {

        var me   = this,
            from = messageDraft.get('from'),
            result;

        result = [
            Ext.String.format("<b>From:</b> {0}", me.stringifyEmailAddress(from)),
            Ext.String.format("<b>Date:</b> {0}", Ext.util.Format.date(messageDraft.get('date'), "d.m.Y H:i")),
            Ext.String.format("<b>To:</b> {0}", me.stringifyEmailAddress(messageDraft.get('to'))),
            Ext.String.format("<b>Subject:</b> {0}", messageDraft.get('subject')),
            Ext.String.format("<b>Reply to:</b> {0}", messageDraft.get('replyTo')
                ? me.stringifyEmailAddress(messageDraft.get('replyTo'))
                : me.stringifyEmailAddress(from))
        ].join("<br />");

        return result;
    },


    /**
     * @private
     */
    stringifyEmailAddress : function(addresses) {

        var add    = [].concat(addresses),
            result = [];

        for (var i = 0, len = add.length; i < len; i++) {
            if (!add[i]) {
                continue;
            }
            result.push(
                Ext.String.format(
                    "&lt;{0}&gt; {1}",
                    add[i].address, add[i].name
                )
            );
        }

        return result.join(",");
    }


});