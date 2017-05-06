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
 * Class encapsulating data needed by conjoon.cn_mail.view.mail.message.editor.MessageEditor
 * to create an editor instance with existing data. This does not replace
 * an existing MessageDraft with a specified id, since this data-objects
 * purpose is to be passed to the constructor of an MessageEditor, which
 * will in turn automatically provide a valid instance of
 * conjoon.cn_mail.model.mail.message.MessageDraft to work with.
 * The toObject() method will return a native js object with keys keys mapping
 * the structure of the conjoon.cn_mail.model.mail.message.MessageDraft:
 * - to:Array
 * - cc:Array
 * - bcc:Array
 * - subject:String
 * - messageBody:Object(textPlain:string,textHtml:string)
 *
 *      @example
 *      var c = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
 *          to        : 'name@domainname.tld',
 *          cc        : ['ccname@domainname.tld', 'ccname2@domainname.tld'],
 *          bcc       : ['bccname@domainname.tld'],
 *          subject   : 'This is the subject',
 *          textPlain : 'Text for this message',
 *          textHtml  : '<b>Text for this message</b>'
 *     });
 *
 *     console.log(c.toObject());
 *     // output:
 *     // {
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
 *     //    }
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
Ext.define('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {


    config : {
        to        : undefined,
        cc        : undefined,
        bcc       : undefined,
        subject   : undefined,
        textPlain : undefined,
        textHtml  : undefined
    },


    constructor : function(config) {
        this.initConfig(config);
    },


    /**
     * Returns a plain js object with the data hold by this class.
     *
     * @return {Object}
     */
    toObject : function() {

        var me  = this,
            obj = {};

        if (me.getTo() !== undefined) {
            obj.to = me.getTo()
        }
        if (me.getCc() !== undefined) {
            obj.cc = me.getCc()
        }
        if (me.getBcc() !== undefined) {
            obj.bcc = me.getBcc()
        }
        if (me.getSubject() !== undefined) {
            obj.subject = me.getSubject()
        };
        if (me.getTextPlain() !== undefined) {
            obj.messageBody           = obj.messageBody || {};
            obj.messageBody.textPlain = me.getTextPlain()
        };
        if (me.getTextHtml() !== undefined) {
            obj.messageBody          = obj.messageBody || {};
            obj.messageBody.textHtml = me.getTextHtml()
        };

        return obj;
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
    applyTextPlain : function(txt) {
        var me = this;

        if (me.getTextPlain() !== undefined) {
            Ext.raise({
                txt : txt,
                msg : "\"textPlain\" is immutable"
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
    applyTextHtml : function(txt) {
        var me = this;

        if (me.getTextHtml() !== undefined) {
            Ext.raise({
                txt : txt,
                msg : "\"textHtml\" is immutable"
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
    applySubject : function(subject) {
        var me = this;

        if (me.getSubject() !== undefined) {
            Ext.raise({
                txt : txt,
                msg : "\"subject\" is immutable"
            });
        }

        return subject;
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
    applyTo : function(to) {
        var me = this;
        return me.applyAddressFactory(to, 'to');
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
    applyCc : function(cc) {
        var me = this;
        return me.applyAddressFactory(cc, 'cc');
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
    applyBcc : function(bcc) {
        var me = this;
        return me.applyAddressFactory(bcc, 'bcc');
    },


    /**
     * @private
     */
    applyAddressFactory : function(value, type) {
        var me      = this,
            address = value,
            obj;

        if (me['get' + type.charAt(0).toUpperCase() + type.substring(1)]() !== undefined) {
            Ext.raise({
                value : value,
                type  : type,
                msg   : "\"" + type + "\" is immutable"
            });
        }

        if (Ext.isString(value)) {
            address = [{
                name    : value,
                address : value
            }];
        } else if (Ext.isArray(address)) {
            address = [];
            for (var i = 0, len = value.length; i < len; i++) {
                obj = value[i];
                if (Ext.isObject(obj)) {
                    if (obj.hasOwnProperty('address') && obj.hasOwnProperty('name')) {
                        address.push(obj);
                    } else {
                        Ext.raise({
                            value : value,
                            type  : type,
                            msg   : "\"" + type + "\" seems to be malformed"
                        });
                    }
                } else {
                    address.push({
                        name    : value[i],
                        address : value[i]
                    });
                }

            }
        }

        return address;

    }
});