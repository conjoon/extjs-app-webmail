/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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
