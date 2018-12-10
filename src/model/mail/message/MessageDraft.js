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
 * Base model for app-cn_mail representing a message draft.
 *
 * @see {conjoon.cn_mail.model.mail.message.EmailAddress}
 */
Ext.define('conjoon.cn_mail.model.mail.message.MessageDraft', {

    extend : 'conjoon.cn_mail.model.mail.message.AbstractMessageItem',

    requires : [
        'conjoon.cn_core.data.field.EmailAddressCollection',
        'conjoon.cn_core.data.validator.EmailAddressCollection',
        'conjoon.cn_mail.model.mail.message.DraftAttachment',
        'conjoon.cn_core.data.field.EmailAddress'
    ],

    entityName : 'MessageDraft',

    /**
     * @private
     */
    compoundKeyFields : {
        MessageBody : ['mailAccountId', 'mailFolderId', 'id'],
        DraftAttachment : {
            'mailAccountId' : 'mailAccountId',
            'mailFolderId'  : 'mailFolderId',
            'id'            :  'parentMessageItemId'
        }
    },


    fields : [{
        name      : 'replyTo',
        type      : 'cn_core-datafieldemailaddress',
        persist   : false
    }, {
        name       : 'to',
        type       : 'cn_core-datafieldemailaddresscollection',
        validators : [{
            type       : 'cn_core-datavalidatoremailaddresscollection',
            allowEmpty : true
        }]
    }, {
        name       : 'cc',
        type       : 'cn_core-datafieldemailaddresscollection',
        validators : [{
            type       : 'cn_core-datavalidatoremailaddresscollection',
            allowEmpty : true
        }]
    }, {
        name       : 'bcc',
        type       : 'cn_core-datafieldemailaddresscollection',
        validators : [{
            type       : 'cn_core-datavalidatoremailaddresscollection',
            allowEmpty : true
        }]
    }, {
        /**
         * This is by default always true for MessageDrafts
         */
        name         : 'draft',
        type         : 'bool',
        defaultValue :  true
    }, {
        /**
         * This is by default always true for MessageDrafts
         */
        name         : 'seen',
        type         : 'bool',
        defaultValue :  true
    }, {
        /**
         * This is by default always false for MessageDrafts
         */
        name         : 'flagged',
        type         : 'bool',
        defaultValue :  false
    }, {
        /**
         * This is by default always false for MessageDrafts
         */
        name         : 'answered',
        type         : 'bool',
        defaultValue :  false
    }, {
        /**
         * This is by default always false for MessageDrafts
         */
        name         : 'recent',
        type         : 'bool',
        defaultValue :  false
    }, {
        // only required by drafts for now
        // persist=false since value is set by BE
        // and not changed across FE
        name    : 'messageId',
        type    : 'string',
        persist : false
    }, {
        // only required by drafts for now
        name : 'references',
        type : 'string'
    }, {
        // only required by drafts for now
        name : 'inReplyTo',
        type : 'string'
    }, {
        // only required by drafts for now x-cn-draft-info
        name : 'xCnDraftInfo',
        type : 'string'
    }],


    /**
     *@inheritdoc
     */
    processRecordAssociation : function(record) {

        const me = this;

        me.callParent(arguments);

        if (record.entityName === 'DraftAttachment') {
            me.compareAndApplyCompoundKeys(record, false);
        }
    }



});