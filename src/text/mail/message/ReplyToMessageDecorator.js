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
 * Text Decorator for Email Messages which are used in "reply to" context.
 * Instances of this class will return an empty set of attachments.
 */
Ext.define('conjoon.cn_mail.text.mail.message.ReplyToMessageDecorator', {

    extend : 'conjoon.cn_mail.text.mail.message.CopyDecorator',

    requires : [
        'conjoon.cn_mail.text.mail.message.DecoratorFormat'
    ],

    /**
     * @inheritdoc
     */
    getTo : function() {

        var me = this;

        return [
            me.getReplyTo()
        ];
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
            messageDraft = me.messageDraft;

        return [
            "<br /><br/>",
            "<blockquote style=\"margin-left:4px;padding-left:10px;border-left:4px solid #bee9fc\">",
            me.getMessageBodyIntroHeaderFields(messageDraft),
            "<br /><br />",
            messageDraft.getMessageBody().get('textHtml'),
            "</blockquote>"
        ].join("");

    },


    /**
     * @private
     */
    getMessageBodyIntroHeaderFields : function(messageDraft) {

        var me              = this,
            from            = messageDraft.get('from'),
            DecoratorFormat = conjoon.cn_mail.text.mail.message.DecoratorFormat,
            result;

        result = [
            Ext.String.format("<b>On {0} at {1}, {2} wrote:</b>",
                Ext.util.Format.date(messageDraft.get('date'), "d.m.Y"),
                Ext.util.Format.date(messageDraft.get('date'), "H:i"),
                DecoratorFormat.stringifyEmailAddress(from)
            )
        ].join("<br />");

        return result;
    },

    /**
     * @inehritdoc
     */
    getAttachments : function() {
        return [];
    }

});