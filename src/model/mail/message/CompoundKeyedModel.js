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
 * differ from the id provided by the backend, to make sure IMAP message entities
 * can be identified safely across carious accounts existing in the ui.
 *
 * When any part of the compound key (e.g. mailAccountId, mailFolderId or id)
 * is updated, the associated side gets also updated since these relations
 * (MessageDraft/MessageBody and vice versa) are strongly coupled and represent
 * one and teh same entity by provding different views on the data.
 *
 * Client models assume that the backend takes care of updating ALL associated
 * data once one side of the association changes, so client-changed associations
 * (by the herein found automatism) does NOT TRIGGER an update.
 *
 * For making sure batched operations properly do not send multiple POST in a batch
 * (since ONE operation might have allready created the main data), associated
 * proxies/interfaces should make sure that based upon the data in a record
 * available a PUT/PATCH is being send to the server instead of a CREATE.
 *
 * @abstract
 */
Ext.define('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {

    extend : 'conjoon.cn_mail.model.mail.AbstractCompoundKeyedModel',

    requires : [
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey'
    ],


    fields : [{
        name : 'mailFolderId',
        type : 'cn_core-datafieldcompoundkey'
    }],


    /**
     * @private
     */
    compoundKeyFields : ['mailAccountId', 'mailFolderId', 'id'],

    /**
     * @private
     */
    foreignKeyFields : ['mailAccountId', 'mailFolderId', 'id'],


    /**
     * @inheritdoc
     *
     * @returns {conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey}
     */
    getRepresentingCompoundKeyClass : function() {
        return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;
    }


});