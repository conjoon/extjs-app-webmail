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
 * Abstract text decorator for Email Messages.
 * A Decorator of this class provides the following interface for getting data:
 *
 * - getTextHtml
 * - getTextPlain
 * - getSubject
 * - getCc
 * - getBcc
 * - getTo
 * - getFrom
 * - getReplyTo
 *
 * @abstract
 *
 * @see
 */
Ext.define('conjoon.cn_mail.text.mail.message.CopyDecorator', {


    requires : [
        'conjoon.cn_mail.model.mail.message.MessageDraft'
    ],

    /**
     * @type {conjoon.cn_mail.model.mail.message.MessageDraft}
     * @private messageDraft
     */
    messageDraft : null,

    /**
     * Creates a new instance of this class.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @throws if MessageDraft is not of the proper type, or if MessageBody is not available
     */
    constructor : function(messageDraft) {

        var me = this;

        if (!(messageDraft instanceof conjoon.cn_mail.model.mail.message.MessageDraft)) {
            Ext.raise({
                messageDraft : messageDraft,
                msg          : "\"messageDraft\" must be an instance of conjoon.cn_mail.model.mail.message.MessageDraft",
                cls          : Ext.getClassName(me)
            });
        }

        if (!messageDraft.getMessageBody() || messageDraft.getMessageBody().loadOperation) {
            Ext.raise({
                messageDraft : messageDraft,
                msg          : "\"MessageBody\" of messageDraft is not available",
                cls          : Ext.getClassName(me)
            });
        }

        me.messageDraft = messageDraft;
    },


    /**
     * Decorates the MessageBody's textPlain.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {String}
     */
    getTextPlain : function() {
        var me = this;

        return me.messageDraft.getMessageBody().get('textPlain');
    },


    /**
     * Decorates the MessageBody's textHtml.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {String}
     */
    getTextHtml : function() {

        var me = this;

        return me.messageDraft.getMessageBody().get('textHtml');

    },


    /**
     * Decorates the MessageDraft's subject.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {String}
     */
    getSubject : function() {

        var me = this;

        return me.messageDraft.get('subject')

    },


    /**
     * Decorates the MessageDraft's from-address.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {Object}
     */
    getFrom : function() {

        var me = this,
            from = me.messageDraft.get('from');

        return Ext.copy({}, from, 'name,address');
    },


    /**
     * Decorates the MessageDraft's replyTo-address. Will return a copy of the
     * "from" address if replyTo is not specified.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {Object}
     *
     * @see getFrom()
     */
    getReplyTo : function() {

        var me      = this,
            replyTo = me.messageDraft.get('replyTo');

        return replyTo
               ? Ext.copy({}, replyTo, 'name,address')
               : me.getFrom()
    },


    /**
     * Decorates the MessageDraft's to-addresses.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {Array}
     *
     * @see copyAddresses
     */
    getTo : function() {
        return this.copyAddresses('to');
    },


    /**
     * Decorates the MessageDraft's cc-addresses.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {Array}
     *
     * @see copyAddresses
     */
    getCc : function() {
        return this.copyAddresses('cc');
    },


    /**
     * Decorates the MessageDraft's cc-addresses.
     *
     * @param {conjoon.cn_mail.model.mail.message.MessageDraft} messageDraft
     *
     * @return {Array}
     *
     * @see copyAddresses
     */
    getBcc : function() {
        return this.copyAddresses('bcc');
    },


    privates : {


        /**
         * Copies the addresses of the specified type into a new Array and returns
         * it.
         *
         * @param {String} type
         * @returns {Array}
         *
         * @throws if type does not equal to "to", "cc" or "bcc"
         *
         * @private
         */
        copyAddresses : function(type) {

            var me         = this,
                types      = ['to', 'cc', 'bcc'],
                recipients = me.messageDraft.get(type),
                addresses  = [];

            if (types.indexOf(type) === -1) {
                Ext.raise({
                    type : type,
                    msg  : Ext.String.format("\"type\" is not in list of {0}", types.join(", ")),
                    cls  : Ext.getClassName(me)
                })
            }

            for (var i = 0, len = recipients.length; i < len; i++) {
                addresses.push(Ext.copy({}, recipients[i], 'name,address'))
            }

            return addresses;
        }
    }


});