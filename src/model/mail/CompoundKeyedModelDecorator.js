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
 *
 */
Ext.define('conjoon.cn_mail.model.mail.CompoundKeyedModelDecorator', {

    requires : [
        'coon.core.data.field.CompoundKeyField',
        'conjoon.cn_mail.data.mail.AbstractCompoundKey'
    ],


    statics : {

        decorate : function(modelClass) {

            let model = Ext.data.schema.Schema.lookupEntity(modelClass);

            model.override(this.getPrototypeBody());

            model.addFields([{
                name : 'localId',
                type : 'string'
            }, {
                name : 'id',
                type : 'cn_core-datafieldcompoundkey'
            }, {
                name : 'mailAccountId',
                type : 'cn_core-datafieldcompoundkey'
            }]);

            model.removeFields(["__id__"]);
        },


        getPrototypeBody: function() {

            return {

                idProperty : 'localId',

                /**
                 * @private
                 */
                suspendSetter : false,


                /**
                 * @private
                 */
                compoundKeyFields : [],

                /**
                 * In the order of the actual, e.g. parent-entities to child entities.
                 * @private
                 */
                foreignKeyFields : ['mailAccountId', 'id'],

                /**
                 * Saves previously compoundKey before the compound key might get changed by
                 * an update operation.
                 * @private
                 * @see #save
                 */
                previousCompoundKey : null,

                inheritableStatics : {

                    /**
                     * Replacement for "load" which will make sure that it is possible to
                     * specify a conjoon.cn_mail.data.mail.AbstractCompoundKey for which the
                     * localId is computed, and loading is processed then.
                     *
                     * @param {conjoon.cn_mail.data.mail.AbstractCompoundKey} compoundKey
                     * @param {Object} options
                     * @param {Ext.data.Session} session
                     *
                     * @return {conjoon.cn_mail.model.mail.message.CompoundKeyedModel}
                     *
                     * @throws if compoundKey is not an instance of conjoon.cn_mail.data.mail.AbstractCompoundKey
                     */
                    loadEntity : function(compoundKey, options, session) {

                        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.AbstractCompoundKey)) {
                            Ext.raise({
                                msg         : "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.AbstractCompoundKey",
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
                 * Overrides parent implementation to make sure foreignKeys are sent with
                 * each request.
                 *
                 * @param {Object}  options
                 *
                 * @throws if foreignKeys are not set for this model, or
                 * if this model instance is not a phantom and does not send originalId
                 *
                 * @see checkForeignKeys
                 */
                save : function(options) {

                    const me = this;

                    let source;

                    // step out, we are currently erasing a phantom record that does not
                    // need a check for the compound keys
                    if (me.dropped && me.phantom) {
                        return me.callParent(arguments);
                    }

                    if (me.phantom) {
                        source = me.data;
                    } else {
                        source = Ext.applyIf(Ext.apply({}, me.modified), me.data);
                    }

                    me.checkForeignKeysForAction(source, 'save');

                    return me.callParent(arguments);
                },


                /**
                 * Makes sure previousCompoundKey is saved before record is committed.
                 * Only recomputes the previousCompoundKeyField if changes to any of the
                 * foreignKeyFields are committed.
                 * @inheritdoc
                 *
                 * @see getRepresentingCompoundKeyClass
                 */
                commit : function() {

                    const me = this,
                        representingCompoundKeyClass = me.getRepresentingCompoundKeyClass();

                    let recompute = false;

                    if (!me.phantom && me.modified) {

                        for (let i = 0, len = me.foreignKeyFields.length; i < len; i++) {
                            if (me.modified.hasOwnProperty(me.foreignKeyFields[i])) {
                                recompute = true;
                                break;
                            }
                        }

                        if (recompute) {
                            let prev = Ext.applyIf(Ext.apply({}, me.modified), me.data),
                                fData = [];

                            for (let i = 0, len = me.foreignKeyFields.length; i < len;  i++) {
                                fData.push(prev[me.foreignKeyFields[i]]);
                            }

                            me.previousCompoundKey = representingCompoundKeyClass.createFor.apply(
                                representingCompoundKeyClass, fData);
                        }

                    }

                    return me.callParent(arguments);
                },


                /**
                 * Returns the class responsible for the compound key THIS model uses.
                 *
                 * @return {conjoon.cn_mail.data.mail.AbstractCompoundKey}
                 *
                 * @abstract
                 */
                getRepresentingCompoundKeyClass : function() {
                    Ext.raise("abstract method must be overwritten.")
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
                 * Helper function to make sure foreign keys are available in "source".
                 *
                 * @param {Object} source
                 * @param {String} action
                 *
                 * @return {Boolean}
                 *
                 * @throws if any foreign key except id is not set, or if id is not set and
                 * record is not phantom or action is read.
                 */
                checkForeignKeysForAction : function(source, action) {

                    const me = this,
                        phantom = me.phantom;

                    let fData = [];

                    source = source || {};


                    for (let i = 0, len = me.foreignKeyFields.length; i < len;  i++) {
                        if (me.foreignKeyFields[i] !== 'id') {
                            if (!source[me.foreignKeyFields[i]]) {
                                Ext.raise({
                                    msg            : "\"" + me.foreignKeyFields[i] + "\" must be set",
                                    action         : action,
                                    foreignKeField : source[me.foreignKeyFields[i]]
                                });
                            }
                        } else {
                            if ((action === 'read' || !phantom) && !source.id) {
                                Ext.raise({
                                    msg    : "\"id\" must be set before",
                                    action : action,
                                    id     : source.id
                                });
                            }

                        }

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
                 * Overridden to make sure changes to any of the compound key fields is
                 * reflected in the associated data. Setting those keys on _this_ side of the
                 * association will also change the data on _that_ side. Updated fields will
                 * not be marked as dirty since it is assumed that the associated data on the
                 * server was or is updated accordingly due to the relationships of the entities.
                 * (Hint: a MessageBody is in fact a MessageDraft/Item and just decoupled
                 * to ease the process of loading data into the memory.)
                 * Once foreignKey fields where updated, associated models are forced to
                 * update their primary key by calling updateLocalId(). The same goes for
                 * *this* model, where the localId will be updated if, and only if any
                 * field or foreignKeyFields were part of the set() process. The order in
                 * which the localIds are updated: First _this_, then _that_.

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

                    // key might be a refrence to modified for example,
                    // which gets erased later on in a call to the parent implementation
                    // in the worst case, leaving us with an empty object. clone here
                    let cK     = Ext.isString(key) ? key : Ext.clone(key),
                        ret    = me.callParent(arguments),
                        valids = [],
                        keys   = {}, curr, val, range, assoc, target;

                    if (Ext.isString(cK)) {
                        keys[cK] = value;
                    } else {
                        keys = cK;
                    }

                    if (me.suspendSetter !== true) {

                        range = me.getAssociatedCompoundKeyedData();

                        for (let a = 0, lena = range.length; a < lena; a++) {

                            target = null;
                            assoc  = range[a];
                            valids = Ext.isArray(me.compoundKeyFields)
                                ? me.compoundKeyFields
                                : me.compoundKeyFields[assoc.entityName];

                            assoc.suspendSetter = true;

                            for (curr in keys) {
                                target = curr;
                                if ((Ext.isArray(valids) && valids.indexOf(curr) === -1) ||
                                    (!Ext.isArray(valids) && !valids[curr])) {
                                    continue;
                                }
                                if (!Ext.isArray(valids)) {
                                    target = valids[curr];
                                }

                                val = keys[curr];

                                assoc.set(target, val, {dirty : false});
                            }

                            assoc.suspendSetter = false;
                        }
                    }


                    if (me.suspendSetter !== true) {

                        let updateLocal = false;
                        for (let i = 0, len = me.foreignKeyFields.length; i < len; i++) {
                            if (keys.hasOwnProperty(me.foreignKeyFields[i])) {
                                updateLocal = true;
                                break;
                            }
                        }

                        if (updateLocal) {
                            me.updateLocalId();

                            range = me.getAssociatedCompoundKeyedData();

                            for (let i = 0, len = range.length; i < len; i++) {
                                range[i].updateLocalId();
                            }
                        }

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
                 *
                 * @private
                 */
                updateLocalId : function() {
                    const me = this,
                        representingCompoundKeyClass = me.getRepresentingCompoundKeyClass();

                    if (!me.isCompoundKeyConfigured()) {
                        return null;
                    }

                    let fData = [], key;

                    for (let i = 0, len = me.foreignKeyFields.length; i < len;  i++) {
                        fData.push(me.get(me.foreignKeyFields[i]));
                    }

                    key = representingCompoundKeyClass.createFor.apply(
                        representingCompoundKeyClass, fData).toLocalId();

                    if (me.getId() === key) {
                        // prevent diving into setId process
                        return key;
                    }

                    me.setId(key, {dirty : false});

                    return key;
                },


                /**
                 * Returns true if all compound keys are known to this instance, i.e. every
                 * corresponding field has a value.
                 *
                 * @return {Boolean}
                 *
                 * @deprecated use isCompoundKeyConfigured
                 */
                isCompoundKeySet : function() {

                    const me = this;

                    let fData = [], key;

                    for (let i = 0, len = me.foreignKeyFields.length; i < len;  i++) {
                        if (!me.get(me.foreignKeyFields[i])) {
                            return false;
                        }
                    }

                    return true;
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
                 * Returns the compound key representing this model.
                 * The compound key is always the data found in the compound key fields
                 * before the record was committed, e.g if the fields where modified,
                 * their original value, not their modified vaues will be used until the next
                 *
                 * @return conjoon.cn_mail.data.mail.message.AbstractCompoundKey
                 */
                getCompoundKey : function() {
                    const me = this,
                        representingCompoundKeyClass = me.getRepresentingCompoundKeyClass();

                    me.checkForeignKeysModified();

                    return representingCompoundKeyClass.fromRecord(me);
                },

                /**
                 * @private
                 */
                checkForeignKeysModified : function() {
                    const me = this,
                        modified = me.modified;

                    if (!modified) {
                        return;
                    }
                    for (let i = 0, len = me.foreignKeyFields.length; i < len ; i++) {
                        if (modified.hasOwnProperty(me.foreignKeyFields[i]) && modified[me.foreignKeyFields[i]] !== undefined) {
                            Ext.raise("Field was modified, can not use current information.");
                        }
                    }
                },


                /**
                 * Returns the previous compound key for this model, or the current if the
                 * previous is not available yet.
                 *
                 * @return {conjoon.cn_mail.data.mail.AbstractCompoundKey}
                 *
                 * @see #previousCompoundKey
                 */
                getPreviousCompoundKey : function() {

                    const me = this;

                    return me.previousCompoundKey
                        ? me.previousCompoundKey
                        : me.getCompoundKey();

                },


                /**
                 * Returns true if this current instance is fully configured with values
                 * for all fields representing the foreign fields for a compound
                 * key.
                 *
                 * @return {Boolean}
                 */
                isCompoundKeyConfigured : function() {

                    const me   = this,
                        data = me.data;


                    for (let i = 0, len = me.foreignKeyFields.length; i < len ; i++) {
                        if (Ext.isEmpty(data[me.foreignKeyFields[i]])) {
                            return false;
                        }
                    }

                    return true;
                }

            }
        }

    }






});