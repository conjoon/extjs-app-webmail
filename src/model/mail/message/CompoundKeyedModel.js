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
 * This implementation from a Model also uses the Observable mixin to make sure
 * events can be fired.
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

    extend : 'conjoon.cn_mail.model.mail.BaseModel',

    requires : [
        'conjoon.cn_core.data.field.CompoundKeyField',
        'conjoon.cn_mail.data.mail.message.CompoundKey',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey'
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


    /**
     * @private
     */
    suspendSetter : false,


    /**
     * @private
     */
    compoundKeyFields : ['mailAccountId', 'mailFolderId', 'id'],


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
    },


    /**
     * Returns all data with which this model is currently associated, i.e.
     * which is currently laoded into memory. Returns an empty array by default.
     *
     * @return {Array}
     */
    getAssociatedCompoundKeyedData : function() {
        return [];
    },


    /**
     * Overridden to make sure changes to any of the compund key fields is
     * reflected in the associated data. Setting those keys on _this_ side of the
     * association will also change the data on _that_ side. Updated fields will
     * not be marked as dirty since it is assumed that the associated data on the
     * server was or is updated accordingly due to the relationships of the entities.
     * (Hint: a MessageBody is in fact a MessageDraft/Item and just decoupled
     * to ease the process of loading data into the memory.)
     * Once foreignKey fields where updated, associated models are forced to
     * update their primary key by calling updateLocalId().

     * @param {String|Object} key
     * @param {Mixed} value
     *
     * @return {*|Object}
     *
     * @see getAssociatedCompoundKeyedData
     * @see updateLocalId
     */
    set : function(key, value) {

        const me = this;

        let ret    = me.callParent(arguments),
            valids = [],
            keys = {}, curr, val, range, assoc;

        if (me.suspendSetter === true) {
            return ret;
        }

        if (Ext.isString(key)) {
            keys[key] = value;
        } else {
            keys = key;
        }

        range = me.getAssociatedCompoundKeyedData();

        for (let a = 0, lena = range.length; a < lena; a++) {
            let target;
            assoc = range[a];
            valids = Ext.isArray(me.compoundKeyFields)
                     ? me.compoundKeyFields
                     : me.compoundKeyFields[assoc.entityName];
            assoc.suspendSetter = true;

            for (curr in keys) {
                target = curr;
                if ((Ext.isArray(valids) && valids.indexOf(curr) === -1) ||
                    (!Ext.isArray(valids) & !valids[curr])) {
                    continue;
                }
                if (!Ext.isArray(valids)) {
                     target = valids[curr];
                }

                val = keys[curr];

                assoc.set(target, val, {dirty : false});
            }

            assoc.updateLocalId();
            assoc.suspendSetter = false;
        }

        return ret;
    },


    /**
     * Checks whether the specified addedRecord has the same compound key values
     * and applies its values
     *
     * @param {Ext.data.Model} addedRecord
     * @param {Boolean=true} presedence wether to weight the addedRecord more than
     * this record, i.e. if the addedRecord has more information regarding the
     * compound keys, its information should be used accordingly.
     *
     * @return {Boolean}
     *
     * @throws if any of the compound keys are set and differe from in between
     * the models.
     */
    compareAndApplyCompoundKeys : function(addedRecord, givePresedence = true) {

        const me = this;

        let fields = Ext.isArray(me.compoundKeyFields)
                     ? me.compoundKeyFields
                     : me.compoundKeyFields[addedRecord.entityName],
            field, i, len, myVal, addedVal, values, targetField, tmp = {};

        if (Ext.isArray(fields)) {
            for (let i = 0, len = fields.length; i < len; i++) {
                tmp[fields[i]] = fields[i];
            }

            fields = tmp;
        }

        for (let i in fields) {
            field  = i;
            targetField = fields[i];

            myVal = me.get(field);
            addedVal = addedRecord.get(targetField);

            if (myVal && addedVal && myVal !== addedVal && field !== me.getIdProperty()
                && targetField !== addedRecord.getIdProperty()) {

                Ext.raise({
                    msg : "Added record's compound key differs from this key.",
                    field : field,
                    targetField : targetField,
                    leftVal : myVal,
                    rightVal : addedVal
                });
            }
        }


        let left = 0, right = 0, target, source;

        for (let i in fields) {
            field  = i;
            targetField = fields[i];

            if (me.get(field)) {
                left++;
            }
            if (addedRecord.get(targetField)){
                right++;
            }
        }



        // give right record presedence if more info is available than in left
        let swapped = false;
        if (right >= left && givePresedence === true) {
            target = me;
            source = addedRecord;
            swapped = true;
        } else {
            target = addedRecord;
            source = me;
        }

        for (let i in fields) {

            field  =  swapped ? fields[i] : i;
            targetField = swapped ? i : fields[i];

            // we're not setting the id property of any record
            if (field === me.getIdProperty() ||
                targetField === addedRecord.getIdProperty()) {
                continue;
            }
            if (source.get(field)) {
                target.set(targetField, source.get(field), {dirty : false});
            }
        }

        return true;
    },


    /**
     * Gets called by set() of an association if the foreign key was updated.
     * Forces this record to update its localId, which is the primary.
     *
     *
     * @return null if ay compound key information was missing, and thus the
     * localId could not be computed and wasn't changed, otherwise the newly
     * created localId
     */
    updateLocalId : function() {
        const me = this;

        if (!(me.get('mailAccountId') && me.get('mailFolderId') && me.get('id'))) {
            return null;
        }

        let key = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                me.get('mailAccountId'),
                me.get('mailFolderId'),
                me.get('id')
            ).toLocalId();


        me.setId(key, {dirty : false});

        return key;
    },


    /**
     * Returns true if all compound keys are known to this instance, i.e. every
     * corresponding field has a value.
     *
     * @return {Boolean}
     */
    isCompoundKeySet : function() {

        const me = this;

        // loosely check for truthy values
        return !!(me.get('mailAccountId') &&
               me.get('mailFolderId') &&
               me.get('id'));
    },


    /**
     * Processes the association for this model. Implementing classes should
     * take care of assigning compound keys once the association was set.
     *
     * @param {Ext.data.Model} record
     *
     * @see compareAndApplyCompoundKeys
     */
    processRecordAssociation : Ext.emptyFn,


    /**
     * Returns the compound key representing this model
     *
     * @return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
     */
    getCompoundKey : function() {
        return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(this);
    }


});