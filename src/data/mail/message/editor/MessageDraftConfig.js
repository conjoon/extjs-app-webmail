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
 * Class encapsulating data needed by conjoon.cn_mail.view.mail.message.editor.MessageEditor
 * to create an editor instance with existing data. This does not replace
 * an existing MessageDraft with a specified id, since this data-objects
 * purpose is to be passed to the constructor of an MessageEditor, which
 * will in turn automatically provide a valid instance of
 * conjoon.cn_mail.model.mail.message.MessageDraft to work with.
 * The toObject() method will return a native js object with keys mapping
 * the structure of the conjoon.cn_mail.model.mail.message.MessageDraft:
 * - to:Array
 * - cc:Array
 * - bcc:Array
 * - subject:String
 * - messageBody:Object(textPlain:string,textHtml:string)
 * - attachments:Object(type:string,text:String,size:Number,previewImgSrc:String,downloadUrl:String,sourceId:String)[]
 * The purpose of this data object is to provide a template for an email message
 * that gets saved under a new id.
 *
 *      @example
 *      var c = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
 *          mailAccountId : 'dev@conjoon',
 *          mailFolderId  : 'INBOX',
 *          to            : 'name@domainname.tld',
 *          cc            : ['ccname@domainname.tld', 'ccname2@domainname.tld'],
 *          bcc           : ['bccname@domainname.tld'],
 *          subject       : 'This is the subject',
 *          textPlain     : 'Text for this message',
 *          textHtml      : '<b>Text for this message</b>',
 *          attachments   : [{type:'image/jpg', text:'image1.jpg', sourceId : '1'}]
 *     });
 *
 *     console.log(c.toObject());
 *     // output:
 *     // {
 *     //     mailAccountId : 'dev@conjoon',
 *     //     mailFolderId  : 'INBOX',
 *     //     to : [{
 *     //         name    : 'name@domainname.tld',
 *     //         address : 'name@domainname.tld'
 *     //     }],
 *     //     cc : [{
 *     //         name    : 'ccname@domainname.tld',
 *     //         address : 'ccname@domainname.tld'
 *     //     }, {
 *     //        name    : 'ccname2@domainname.tld',
 *     //        address : 'ccname2@domainname.tld'
 *     //    }],
 *     //    bcc : [{
 *     //        name    : 'bccname@domainname.tld',
 *     //        address : 'bccname@domainname.tld'
 *     //    }],
 *     //    subject     : 'This is the subject',
 *     //    messageBody : {
 *     //        textPlain : 'Text for this message',
 *     //        textHtml  : '<b>Text for this message</b>00',
 *     //    },
 *     //    attachments : [{
 *     //        type     : 'image/jpg',
 *     //        text     : 'image1.jpg'
 *     //    }]
 *     // }
 *     //
 *     //
 *
 * Note:
 * =====
 * Properties of this class are immutable.
 *
 * @private
 */
Ext.define("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {


    config: {
        to: undefined,
        cc: undefined,
        bcc: undefined,
        subject: undefined,
        seen: true,
        textPlain: undefined,
        textHtml: undefined,
        attachments: undefined,
        answered: false,
        recent: false,
        draft: true,
        flagged: false,
        mailAccountId: undefined,
        mailFolderId: undefined,
        references: undefined,
        inReplyTo: undefined,
        xCnDraftInfo: undefined
    },


    constructor: function (config) {
        this.initConfig(config);
    },


    /**
     * Returns a plain js object with the data hold by this class.
     *
     * @return {Object}
     */
    toObject: function () {

        var me  = this,
            obj = {};

        if (me.getTo() !== undefined) {
            obj.to = me.getTo();
        }
        if (me.getCc() !== undefined) {
            obj.cc = me.getCc();
        }
        if (me.getBcc() !== undefined) {
            obj.bcc = me.getBcc();
        }
        if (me.getSubject() !== undefined) {
            obj.subject = me.getSubject();
        }
        if (me.getTextPlain() !== undefined) {
            obj.messageBody           = obj.messageBody || {};
            obj.messageBody.textPlain = me.getTextPlain();
        }
        if (me.getTextHtml() !== undefined) {
            obj.messageBody          = obj.messageBody || {};
            obj.messageBody.textHtml = me.getTextHtml();
        }
        if (me.getAttachments() !== undefined) {
            obj.attachments = me.getAttachments();
        }
        if (me.getSeen() !== undefined) {
            obj.seen = me.getSeen();
        }
        if (me.getAnswered() !== undefined) {
            obj.answered = me.getAnswered();
        }
        if (me.getDraft() !== undefined) {
            obj.draft = me.getDraft();
        }
        if (me.getFlagged() !== undefined) {
            obj.flagged = me.getFlagged();
        }
        if (me.getRecent() !== undefined) {
            obj.recent = me.getRecent();
        }
        if (me.getMailFolderId() !== undefined) {
            obj.mailFolderId = me.getMailFolderId();
        }
        if (me.getMailAccountId() !== undefined) {
            obj.mailAccountId = me.getMailAccountId();
        }

        if (me.getReferences() !== undefined) {
            obj.references = me.getReferences();
        }
        if (me.getInReplyTo() !== undefined) {
            obj.inReplyTo  = me.getInReplyTo();
        }
        if (me.getXCnDraftInfo() !== undefined) {
            obj.xCnDraftInfo = me.getXCnDraftInfo();
        }


        return obj;
    },


    /**
     * Sets flagged
     *
     * @param {Boolean} flagged
     *
     * @return {Boolean}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyFlagged: function (flagged) {
        var me = this;

        if (me.getFlagged() !== undefined) {
            Ext.raise({
                flagged: me.getFlagged(),
                msg: "\"flagged\" is immutable"
            });
        }

        return flagged;
    },


    /**
     * Sets seen
     *
     * @param {Boolean} seen
     *
     * @return {Boolean}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applySeen: function (seen) {
        var me = this;

        if (me.getSeen() !== undefined) {
            Ext.raise({
                seen: me.getSeen(),
                msg: "\"seen\" is immutable"
            });
        }

        return seen;
    },


    /**
     * Sets recent
     *
     * @param {Boolean} recent
     *
     * @return {Boolean}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyRecent: function (recent) {
        var me = this;

        if (me.getRecent() !== undefined) {
            Ext.raise({
                recent: me.getRecent(),
                msg: "\"recent\" is immutable"
            });
        }

        return recent;
    },


    /**
     * Sets draft
     *
     * @param {Boolean} draft
     *
     * @return {Boolean}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyDraft: function (draft) {
        var me = this;

        if (me.getDraft() !== undefined) {
            Ext.raise({
                draft: me.getDraft(),
                msg: "\"draft\" is immutable"
            });
        }

        return draft;
    },


    /**
     * Sets answered
     *
     * @param {Boolean} answered
     *
     * @return {Boolean}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyAnswered: function (answered) {
        var me = this;

        if (me.getAnswered() !== undefined) {
            Ext.raise({
                answered: me.getAnswered(),
                msg: "\"answered\" is immutable"
            });
        }

        return answered;
    },

    /**
     * Sets textPlain
     *
     * @param {String} txt
     *
     * @return {String}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyTextPlain: function (txt) {
        var me = this;

        if (me.getTextPlain() !== undefined) {
            Ext.raise({
                textPlain: me.getTextPlain(),
                msg: "\"textPlain\" is immutable"
            });
        }

        return txt;
    },


    /**
     * Sets textHtml
     *
     * @param {String} txt
     *
     * @return {String}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyTextHtml: function (txt) {
        var me = this;

        if (me.getTextHtml() !== undefined) {
            Ext.raise({
                textHtml: me.getTextHtml(),
                msg: "\"textHtml\" is immutable"
            });
        }

        return txt;
    },


    /**
     * Sets subject
     *
     * @param {String} subject
     *
     * @return {String}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applySubject: function (subject) {
        var me = this;

        if (me.getSubject() !== undefined) {
            Ext.raise({
                subject: me.getSubject(),
                msg: "\"subject\" is immutable"
            });
        }

        return subject;
    },


    /**
     * Sets mailFolderId
     *
     * @param {String} mailFolderId
     *
     * @return {String}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyMailFolderId: function (mailFolderId) {
        var me = this;

        if (me.getMailFolderId() !== undefined) {
            Ext.raise({
                mailFolderId: me.getMailFolderId(),
                msg: "\"mailFolderId\" is immutable"
            });
        }

        return mailFolderId;
    },


    /**
     * Sets mailAccountId
     *
     * @param {String} mailAccountId
     *
     * @return {String}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyMailAccountId: function (mailAccountId) {
        var me = this;

        if (me.getMailAccountId() !== undefined) {
            Ext.raise({
                mailAccountId: me.getMailAccountId(),
                msg: "\"mailAccountId\" is immutable"
            });
        }

        return mailAccountId;
    },


    /**
     * Sets attachments. The method makes sure that no references are being
     * copied.
     *
     * @param {Object[]} attachments
     *
     * @return {Object[]}
     *
     * @private
     *
     * @throws if the value was already set, or if it is not an array
     */
    applyAttachments: function (attachments) {
        var me     = this,
            copied = [];

        if (attachments === undefined) {
            return;
        }

        if (me.getAttachments() !== undefined) {
            Ext.raise({
                attachments: me.getAttachments(),
                msg: "\"attachments\" is immutable"
            });
        }

        if (!Ext.isArray(attachments)) {
            Ext.raise({
                attachments: attachments,
                msg: "\"attachments\" must be an array"
            });
        }

        for (var i = 0, len = attachments.length; i < len; i++) {
            copied.push(Ext.copy(
                {},
                attachments[i],
                "type,text,size,previewImgSrc,downloadImgUrl,sourceId"
            ));
        }

        return copied;
    },


    /**
     * Sets to
     *
     * @param {String/String[]} to
     *
     * @return {Array}
     *
     * @private
     *
     * @trows if the value was already set or if it is malformed
     */
    applyTo: function (to) {
        var me = this;
        return me.applyAddressFactory(to, "to");
    },


    /**
     * Sets cc
     *
     * @param {String/String[]} cc
     *
     * @return {Array}
     *
     * @private
     *
     * @trows if the value was already set or if it is malformed
     */
    applyCc: function (cc) {
        var me = this;
        return me.applyAddressFactory(cc, "cc");
    },


    /**
     * Sets bcc
     *
     * @param {String/String[]} bcc
     *
     * @return {Array}
     *
     * @private
     *
     * @trows if the value was already set or if it is malformed
     */
    applyBcc: function (bcc) {
        var me = this;
        return me.applyAddressFactory(bcc, "bcc");
    },


    /**
     * @private
     */
    applyAddressFactory: function (value, type) {
        var me      = this,
            address = value,
            obj;

        if (me["get" + type.charAt(0).toUpperCase() + type.substring(1)]() !== undefined) {
            Ext.raise({
                value: value,
                type: type,
                msg: "\"" + type + "\" is immutable"
            });
        }

        if (Ext.isString(value) && value !== "") {
            address = [{
                name: value,
                address: value
            }];
        } else if (Ext.isArray(address)) {
            address = [];
            for (var i = 0, len = value.length; i < len; i++) {
                obj = value[i];
                if (Ext.isObject(obj)) {
                    if (Object.prototype.hasOwnProperty.call(obj,"address") && Object.prototype.hasOwnProperty.call(obj,"name")) {
                        address.push(obj);
                    } else {
                        Ext.raise({
                            value: value,
                            type: type,
                            msg: "\"" + type + "\" seems to be malformed"
                        });
                    }
                } else if (value[i] !== "") {
                    address.push({
                        name: value[i],
                        address: value[i]
                    });
                }

            }
        }

        return address;

    },


    /**
     * Sets referencesc
     *
     * @param {String} referencesc
     *
     * @return {String}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyReferences: function (referencesc) {
        var me = this;

        if (me.getReferences() !== undefined) {
            Ext.raise({
                references: me.getReferences(),
                msg: "\"references\" is immutable"
            });
        }

        return referencesc;
    },


    /**
     * Sets inReplyTo
     *
     * @param {String} inReplyTo
     *
     * @return {String}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyInReplyTo: function (inReplyTo) {
        var me = this;

        if (me.getInReplyTo() !== undefined) {
            Ext.raise({
                inReplyTo: me.getInReplyTo(),
                msg: "\"inReplyTo\" is immutable"
            });
        }

        return inReplyTo;
    },


    /**
     * Sets xCnDraftInfo
     *
     * @param {String} xCnDraftInfo
     *
     * @return {String}
     *
     * @private
     *
     * @throws if the value was already set
     */
    applyXCnDraftInfo: function (xCnDraftInfo) {
        var me = this;

        if (me.getXCnDraftInfo() !== undefined) {
            Ext.raise({
                xCnDraftInfo: me.getXCnDraftInfo(),
                msg: "\"xCnDraftInfo\" is immutable"
            });
        }

        return xCnDraftInfo;
    }

});