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
 * Abstract base model for app-cn_mail message items.
 *
 * The schema used by this model is {@link conjoon.cn_mail.data.mail.BaseSchema}
 *
 * Note:
 * Also the foreign key information for the MessageBody would usually be stored
 * in the MessageBody itself (MessageBody.messageItemId), we set the key of
 * the MessageBody directly into the MessageItem, since the linkTo()-method
 * only accepts a primary key when referencing a model, which needs to be the id
 * of the referenced model, not of the associated model.
 * Any loading of the referenced model while adjusting keys server side (i.e.
 * treating the "id" as the "messageItemId") will lead to errors when the model
 * gets loaded.
 *
 */
Ext.define('conjoon.cn_mail.model.mail.message.AbstractMessageItem', {

    extend : 'conjoon.cn_mail.model.mail.message.CompoundKeyedModel',

    requires : [
        'conjoon.cn_mail.model.mail.message.MessageBody',
        'conjoon.cn_core.data.field.EmailAddress'
    ],


    fields : [{
        name : 'subject',
        type : 'string'
    }, {
        name : 'date',
        type : 'date'
    }, {
        name : 'from',
        type : 'cn_core-datafieldemailaddress'
    }, {
        name        : 'messageBodyId',
        type        : 'string',
        reference   : {
            child : 'MessageBody',
            unique : true
        },
        validators : 'presence'
    }, {
        name : 'seen',
        type : 'bool'
    }, {
        name : 'answered',
        type : 'bool'
    }, {
        name : 'flagged',
        type : 'bool'
    }, {
        name : 'draft',
        type : 'bool'
    }, {
        name    : 'recent',
        type    : 'bool',
        persist : false
    }],


    /**
     * Implemented to make sure filters for mailAccountId, mailFolderId and
     * parentMessageItemId are properly set.
     *
     * @param {Object} options options-object to be passed to load()
     *
     * @return {Ext.data.Store}
     */
    loadAttachments : function(options) {

        const me = this;

        me.attachments().clearFilter(true);

        me.attachments().addFilter([{
            property : 'mailAccountId',
            value    : me.get('mailAccountId')
        }, {
            property : 'mailFolderId',
            value    : me.get('mailFolderId')
        }, {
            property : 'parentMessageItemId',
            value    : me.get('id')
        }], true);

        return  me.attachments().load(options);
    },


    /**
     * Wrapper for getMessageBody to make sure params mailFolderId and
     * mailAccountId are submitted when loading.
     *
     * @param {Object} options options-object to be passed to getMessageBody()
     *
     * @returns {conjoon.cn_mail.model.mail.message.MessageBody}
     */
    loadMessageBody : function(options) {

        const me = this;

        options = options || {};

        if (!me.get('mailFolderId') || !me.get('mailAccountId') || !me.get('id')) {
            Ext.raise({
                msg : "Cannot load MessageBody, compound keys missing",
                data : me.data
            });
        }

        return me.getMessageBody(Ext.applyIf(options, {
            params : {
                mailFolderId        : me.get('mailFolderId'),
                mailAccountId       : me.get('mailAccountId'),
                id                  : me.get('id')
            }
        }))
    },


    /**
     * @inheritdoc
     */
    getAssociatedCompoundKeyedData : function() {
        const me = this;

        return me._messageBody ? [me._messageBody] : [];
    },


    privates : {

        /**
         * Overridden to make sure message items are aware of MessageBodys being set
         * and comparing their compound keys can be done.
         *
         * @inheritdoc
         *
         * @see compareAndApplyCompoundKeys
         */
        onAssociatedRecordSet : function(record, role) {
            const me = this;

            if (record.entityName === 'MessageBody') {
                me.compareAndApplyCompoundKeys(record, true);
            }

            return me.callParent(arguments);
        }


    }


});