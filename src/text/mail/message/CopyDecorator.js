/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * Abstract text decorator for Email Messages.
 * The constructor expects a fully loaded MessageDraft-model, with the
 * MessageBody and Attachments available.
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
 * - getAttachments
 * - getSeen
 * - getRecent
 * - getFlagged
 * - getDraft
 * - getAnswered
 *
 * Additionally, the toMessageDraftConfig will create an instance of
 * {conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig} based on the
 * data decorated by the above mentioned methods. Sub-classes should be aware
 * of handling attachments and override the getAttachments method.
 *
 * @abstract
 *
 * @see
 */
Ext.define('conjoon.cn_mail.text.mail.message.CopyDecorator', {


    requires : [
        'conjoon.cn_mail.model.mail.message.MessageDraft',
        'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig'
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
     * @throws if MessageDraft is not of the proper type, or if MessageBody or
     * Attachments are not available
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

        if (messageDraft.attachments().getRange().length === 0 &&
            !messageDraft.attachments().isLoaded()) {
            Ext.raise({
                messageDraft : messageDraft,
                msg          : "\"Attachments\" of messageDraft are not available",
                cls          : Ext.getClassName(me)
            });
        }

        me.messageDraft = messageDraft;
    },


    /**
     * Decorates the MessageBody's textPlain.
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
     * @return {String}
     */
    getTextHtml : function() {

        var me = this;

        return me.messageDraft.getMessageBody().get('textHtml');

    },


    /**
     * Decorates the MessageDraft's subject.
     *
     * @return {String}
     */
    getSubject : function() {

        var me = this;

        return me.messageDraft.get('subject')

    },


    /**
     * Decorates the MessageDraft's seen flag.
     *
     * @return {Boolean}
     */
    getSeen : function() {

        return true;
    },


    /**
     * Decorates the MessageDraft's draft flag.
     *
     * @return {Boolean}
     */
    getDraft : function() {
        return true;
    },


    /**
     * Decorates the MessageDraft's answered flag.
     *
     * @return {Boolean}
     */
    getAnswered : function() {

        return false;
    },


    /**
     * Decorates the MessageDraft's recent flag.
     *
     * @return {Boolean}
     */
    getRecent : function() {

        return false;
    },


    /**
     * Decorates the MessageDraft's flagged flag.
     *
     * @return {Boolean}
     */
    getFlagged : function() {

       return false;
    },


    /**
     * Decorates the MessageDraft's from-address.
     *
     * @return {Object|null} returns null if the from address is not available
     */
    getFrom : function() {

        var me = this,
            from = me.messageDraft.get('from');

        return from
               ? Ext.copy({}, from, 'name,address')
               : null;
    },


    /**
     * Decorates the MessageDraft's replyTo-address. Will return a copy of the
     * "from" address if replyTo is not specified.
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
     * @return {Array}
     *
     * @see copyAddresses
     */
    getBcc : function() {
        return this.copyAddresses('bcc');
    },


    /**
     * Decorates the MessageDrafts Attachments and returns an array with its data
     * without references to the original attachment data.
     * The following data will be available for decorating:
     * - type
     * - text
     * - size
     * - previewImgSrc
     * - downloadImgUrl
     * - sourceId
     *
     * @return {Object[]}
     */
    getAttachments : function() {

        var me             = this,
            attachments    = me.messageDraft.attachments().getRange(),
            newAttachments = [];

        for (var i = 0, len = attachments.length; i < len; i++) {

            newAttachments.push(
                Ext.copy(
                    {},
                    attachments[i].data,
                    'type,text,size,previewImgSrc,downloadImgUrl,sourceId'
                )
            );
        }

        return newAttachments;
    },


    /**
     * Returns an instance of conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig
     * with the data set to the values as computed by this decorator.
     *
     * @param {Object} options Allows for passing properties which get applied
     * to the resulting MessageDraftConfig if the target properties re not already
     * existing.
     *
     *
     * @return {conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig}
     *
     */
    toMessageDraftConfig : function(options = {}) {

        const me = this;

        let config = Ext.applyIf({
            to          : me.getTo(),
            cc          : me.getCc(),
            bcc         : me.getBcc(),
            subject     : me.getSubject(),
            textPlain   : me.getTextPlain(),
            textHtml    : me.getTextHtml(),
            attachments : me.getAttachments(),
            seen        : me.getSeen(),
            flagged     : me.getFlagged(),
            answered    : me.getAnswered(),
            draft       : me.getDraft(),
            recent      : me.getRecent()
        }, options);

        return Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
            config
        );

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