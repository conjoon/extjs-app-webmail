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
 * MessageItemChildModel for making sure child models for MessageItems have
 * required information configured.
 *
 * @abstract
 */
Ext.define('conjoon.cn_mail.model.mail.message.MessageItemChildModel', {


    extend : 'conjoon.cn_mail.model.mail.message.CompoundKeyedModel',

    requires : [
        'conjoon.cn_core.data.field.CompoundKeyField',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey'
    ],

    fields : [{
        name : 'parentMessageItemId',
        type : 'cn_core-datafieldcompoundkey'
    }],

    /**
     * Overrides parent implementation to make sure originalMessageItemId is set.
     *
     * @param {Object}  options
     *
     * @throws if originalMessageItemId is not available
     */
    save : function(options) {

        const me      = this;

        if (!me.get('parentMessageItemId')) {
            Ext.raise({
                msg                 : "\"parentMessageItemId\" must be set before save()",
                parentMessageItemId : me.get('parentMessageItemId')
            });
        }

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

        if (!params['parentMessageItemId']) {
            Ext.raise({
                msg    : "\"parentMessageItemId\" must be set in params for load()",
                params : params
            });
        }

        return me.callParent(arguments);
    },

    /**
     * @inheritdoc
     */
    updateLocalId : function() {
        const me = this;

        if (!(me.get('mailAccountId') && me.get('mailFolderId') &&
            me.get('parentMessageItemId') && me.get('id'))) {
            return null;
        }

        let key = conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey.createFor(
            me.get('mailAccountId'),
            me.get('mailFolderId'),
            me.get('parentMessageItemId'),
            me.get('id')
        ).toLocalId();


        me.setId(key, {dirty : false});

        return key;
    },


    /**
     * @inheritdoc
     */
    getCompoundKey : function() {
        return conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey.fromRecord(this);
    }



});