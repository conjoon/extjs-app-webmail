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
 * CompoundKey for mail entities, consisting of mailAccountId, mailFolderId and
 * the id of the entity, not to confused with the localId which should be configured
 * as the idProperty for implementing models.
 * Data must be identified by a compound key, whereas localId is a unique string
 * built from the keys in this compound.This key is then used to identify local
 * records.
 *
 * Concrete implementations can be found in the namespace
 * conjoon.cn_mail.data.mail.message.compoundKey.*
 *
 * @abstract
 */
Ext.define("conjoon.cn_mail.data.mail.message.CompoundKey", {


    extend: "conjoon.cn_mail.data.mail.AbstractCompoundKey",

    inheritableStatics: {

        /**
         * Creates a new CompoundKey based on the data found in fromRecord.
         *
         * @param {conjoon.cn_mail.model.mail.message.CompoundKeyedModel} rec
         *
         * @returns {conjoon.cn_mail.data.mail.message.CompoundKey}
         *
         * @throws if rec is not an instance of Ext.data.Model.
         */
        fromRecord: function (rec) {

            if (!(rec instanceof Ext.data.Model)) {
                Ext.raise({
                    msg: "\"rec\" must be an instance of Ext.data.Model",
                    rec: rec
                });
            }

            return new this({
                mailAccountId: rec.get("mailAccountId"),
                mailFolderId: rec.get("mailFolderId"),
                id: rec.get("id")
            });

        },


        /**
         * Creates a new CompoundKey based on the passed arguments.
         *
         * @param {String} mailAccountId
         * @param {String} mailFolderId
         * @param {String} id
         *
         * @returns {conjoon.cn_mail.data.mail.message.CompoundKey}
         */
        createFor: function (mailAccountId, mailFolderId, id) {

            return new this({
                mailAccountId: mailAccountId,
                mailFolderId: mailFolderId,
                id: id
            });

        }

    },


    config: {
        /**
         * @type {String}
         */
        mailFolderId: undefined
    },


    /**
     * Constructor.
     *
     * @param {Object} cfg
     *
     * @throws if mailAccountId, mailFolderId or id are not set
     */
    constructor: function (cfg) {

        const me = this;

        if (!cfg || !cfg.mailAccountId || !cfg.mailFolderId || !cfg.id) {
            Ext.raise({
                msg: "\"cfg\" must be an object containing the properties " +
                      "mailAccountId, mailFolderId and id",
                cfg: cfg
            });
        }

        me.callParent(arguments);
    },


    /**
     * Returns an array representation of this obejct, in the following order:
     * 0 - mailAccountId
     * 1 - mailFolderId
     * 2 - id
     *
     * @returns {Array}
     */
    toArray: function () {

        const me = this;

        return [
            me.getMailAccountId(),
            me.getMailFolderId(),
            me.getId()
        ];

    },


    /**
     * Returns an object representation of this compound key.
     *
     * @returns {{mailAccountId, mailFolderId, id}}
     */
    toObject: function () {

        const me = this;

        return {
            mailAccountId: me.getMailAccountId(),
            mailFolderId: me.getMailFolderId(),
            id: me.getId()
        };

    },


    /**
     * @inheritdoc
     */
    toLocalId: function () {
        const me = this;

        return me.getMailAccountId() + "-" + me.getMailFolderId() + "-" +  me.getId();
    },


    /**
     * Applies mailFolderId.
     *
     * @param {String} mailFolderId
     *
     * @return {String}
     *
     * @throws exception if mailFolderId was already set
     */
    applyMailFolderId: function (mailFolderId) {

        const me = this;

        if (me.getMailFolderId() !== undefined) {
            Ext.raise({
                msg: "\"mailFolderId\" was already set",
                mailFolderId: me.getMailFolderId()
            });
        }

        return mailFolderId;
    }


});
