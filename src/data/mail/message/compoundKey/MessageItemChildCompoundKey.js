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
 * CompoundKey for mail entities which are in a child relation to MessageItems.
 *
 * @abstract
 */
Ext.define('conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey', {

    extend : 'conjoon.cn_mail.data.mail.message.CompoundKey',

    statics : {

        /**
         * Creates a new CompoundKey based on the data found in fromRecord.
         *
         * @param {conjoon.cn_mail.model.mail.message.CompoundKeyedModel} rec
         *
         * @returns {conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey}
         *
         * @throws if rec is not an instance of Ext.data.Model.
         */
        fromRecord : function(rec) {

            if (!(rec instanceof Ext.data.Model)) {
                Ext.raise({
                    msg : "\"rec\" must be an instance of Ext.data.Model",
                    rec : rec
                });
            }

            return new this({
                mailAccountId       : rec.get('mailAccountId'),
                mailFolderId        : rec.get('mailFolderId'),
                parentMessageItemId : rec.get('parentMessageItemId'),
                id                  : rec.get('id')
            });

        },


        /**
         * Creates a new CompoundKey based on the passed arguments.
         *
         * @param {String} mailAccountId
         * @param {String} mailFolderId
         * @param {String} parentMessageItemId
         * @param {String} id
         *
         * @returns {conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey}
         */
        createFor : function(mailAccountId, mailFolderId, parentMessageItemId, id) {

            return new this({
                mailAccountId       : mailAccountId,
                mailFolderId        : mailFolderId,
                parentMessageItemId : parentMessageItemId,
                id                  : id
            });

        }

    },

    config : {
        /**
         * @type {String}
         */
        parentMessageItemId : undefined

    },


    /**
     * @inheritdoc.
     *
     * @param {Object} cfg
     *
     * @throws if parentMessageItemId is not set
     */
    constructor : function(cfg) {

        const me = this;


        if (!cfg || !cfg.parentMessageItemId) {
            Ext.raise({
                msg : "\"cfg\" must be an object containing the property parentMessageItemId",
                cfg : cfg
            })
        }

        me.callParent(arguments);
    },


    /**
     * @inheritdoc
     */
    toArray : function() {

        const me = this;

        let arr = me.callParent(arguments);

        arr.splice(2, 0, me.getParentMessageItemId());

        return arr;

    },


    /**
     * @inheritdoc
     */
    toObject : function() {

        const me = this;

        let obj = me.callParent(arguments);

        obj.parentMessageItemId = me.getParentMessageItemId();

        return obj;

    },


    /**
     * @inheritdoc
     */
    toLocalId : function() {
        const me = this;

        return me.getMailAccountId()       + '-' +
               me.getMailFolderId()        + '-' +
               me.getParentMessageItemId() + '-' +
               me.getId();
    },


    /**
     * Applies parentMessageItemId.
     *
     * @param {String} parentMessageItemId
     *
     * @return {String}
     *
     * @throws exception if parentMessageItemId was already set
     */
    applyParentMessageItemId : function(parentMessageItemId) {

        const me = this;

        if (me.getParentMessageItemId() !== undefined) {
            Ext.raise({
                msg                 : "\"parentMessageItemId\" was already set",
                parentMessageItemId : me.getParentMessageItemId()
            });
        }

        return parentMessageItemId;
    }


});
