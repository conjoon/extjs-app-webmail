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
 * CompoundKeyedModel for items that have relation to a mailAccountId and
 * a mailFolderId, and which carry information about the originalId which might
 * difefre from the id provided by the backend, to make sure IMAP message entities
 * can be identified safely across carious accounts existing in the ui.
 *
 * @abstract
 */
Ext.define('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {


    extend : 'conjoon.cn_mail.model.mail.BaseModel',

    requires : [
        'conjoon.cn_core.data.field.CompoundKeyField',
        'conjoon.cn_mail.data.mail.message.CompoundKey'
    ],

    idProperty : 'localId',

    fields : [{
        name : 'localId',
        type : 'string'
    }, {
        name : 'id',
        type : 'cn_core-datafieldcompoundkey'
    }, {
        name : 'mailFolderId',
        type : 'cn_core-datafieldcompoundkey'
    }, {
        name : 'mailAccountId',
        type : 'cn_core-datafieldcompoundkey'
    }],


    inheritableStatics : {

        /**
         * Replacement for "load" which will make sure that it is possible to
         * specify a conjoon.cn_mail.data.mail.message.CompoundKey for which the
         * localId is computed, and loading is processed then.
         *
         * @param {conjoon.cn_mail.data.mail.message.CompoundKey} compoundKey
         * @param {Object} options
         * @param {Ext.data.Session} session
         *
         * @return {conjoon.cn_mail.model.mail.message.CompoundKeyedModel}
         *
         * @throws if compoundKey is not an instance of conjoon.cn_mail.data.mail.message.CompoundKey
         */
        loadEntity : function(compoundKey, options, session) {

            if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.CompoundKey)) {
                Ext.raise({
                    msg         : "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.CompoundKey",
                    compoundKey : compoundKey
                });
            }

            let id = compoundKey.toLocalId();

            options = options || {};

            options.params = options.params || {};

            Ext.apply(options.params, compoundKey.toObject());

            return this.load(id, options, session);
        }

    },


    /**
     * Overrides parent implementation to make sure mailFolderId, mailAccountId,
     * id are sent with each request.
     *
     * @param {Object}  options
     *
     * @throws if mailAccountId or mailFolderId are not set for this model, or
     * if this model instance is not a phantom and does not send originalId
     *
     * @see checkForeignKeys
     */
    save : function(options) {

        const me = this;

        me.checkForeignKeysForAction(me.data, 'save');

        return me.callParent(arguments);
    },


    /**
     * Overrides parent implementation to make sure mailFolderId, mailAccountId
     * are sent with each request.
     *
     * @param {Object}  options
     */
    load : function(options) {

        const me = this;

        let params = options ? options.params : {};

        params = params || {};

        me.checkForeignKeysForAction(params, 'read');

        return me.callParent(arguments);
    },


    /**
     * Overrides parent implementation to make sure mailFolderId, mailAccountId,
     * id are sent with each request if applicable.
     *
     * @param {Object}  options
     *
     * @throws if mailAccountId or mailFolderId are not set for this model, or
     * if this model instance is not a phantom and does not send id
     *
     * @see checkForeignKeys
     */
    erase : function(options) {

        const me = this;

        me.checkForeignKeysForAction(me.data, 'erase');

        return me.callParent(arguments);
    },


    /**
     * Helper function to make sure foreign keys are available in "source".
     *
     * @param {Object} source
     * @param {String} action
     *
     * @return {Boolean}
     *
     * @throws id mailAccount or mailFolder is not set, or if id is not set and
     * record is not phantom or action is read.
     */
    checkForeignKeysForAction : function(source, action) {

        const me = this,
              phantom = me.phantom
              source = source || {};

        if (!source.mailAccountId) {
            Ext.raise({
                msg           : "\"mailAccountId\" must be set",
                action        : action,
                mailAccountId : source.mailAccountId
            });
        }

        if (!source.mailFolderId) {
            Ext.raise({
                msg           : "\"mailFolderId\" must be set",
                action        : action,
                mailAccountId : source.mailFolderId
            });
        }

        if ((action === 'read' || !phantom) && !source.id) {
            Ext.raise({
                msg    : "\"id\" must be set before",
                action : action,
                id     : source.id
            });
        }

        return true;
    }

});