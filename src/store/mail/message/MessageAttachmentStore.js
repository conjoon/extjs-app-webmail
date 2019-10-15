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
 * Special implementation for attachment-stores used as association-stores.
 * Tries to make sure that loading attachments requires mailFolderId/mailAccountId
 * filters.
 *
 * @private
 */
Ext.define('conjoon.cn_mail.store.mail.message.MessageAttachmentStore', {

    extend : 'Ext.data.Store',

    alias : 'store.cn_mail-mailmessageattachmentstore',


    /**
     * Overriden to make sure check for filters is processed.
     * If no filter is set or if any is missing, the data from the associatedEntity
     * will be used, if this associated entity is a MessageDraft.
     *
     * @returns {Ext.data.Store}
     *
     * @throws if compound keys are not available in the filter
     *
     * @see checkAndBuildCompoundKeyFilters
     */
    load : function() {

        const me = this;

        me.checkAndBuildCompoundKeyFilters();

        return me.callParent(arguments);
    },


    /**
     * Overriden to make sure the associated entities with this store processes
     * the record's association.
     *
     * @inheritdoc
     *
     * @param {Array|Ext.data.Model} record
     *
     * @returns {*|Object}
     */
    add : function(record) {

        const me = this;

        if (Ext.isArray(record)) {
            let inRet = [];
            for (let i = 0, len = record.length; i < len; i++) {
                inRet.push(me.add(record[i]));
            }
            return inRet;
        }


        const recs = [].concat(record);

        if ((record instanceof Ext.data.Model) && this.findExact("localId", record.getId()) > -1) {
            return record;
        }
        const ret = me.callParent(arguments);

        let assoc = me.getAssociatedEntity();

        if (assoc && assoc.entityName === 'MessageDraft') {
            for (let i = 0, len = recs.length; i < len; i++) {
                assoc.processRecordAssociation(recs[i]);
            }
        }

        return ret;
    },


    /**
     * Helper function to be called before any load-operation to make sure
     * compound key filters are set. Will be build out of information available
     * in #associatedEntity if available and needed.
     * This method will also remove any "messageItemId" filter from the list of
     * filters, if found.
     *
     * @private
     *
     * @throws if any compound key information is missing
     */
    checkAndBuildCompoundKeyFilters : function() {

        const me            = this,
            filters         = me.getFilters(),
            obsoleteFilters = [],
            propertySet     = {
                mailFolderId        : false,
                mailAccountId       : false,
                parentMessageItemId : false
            },
            assocEntity = me.getAssociatedEntity() && me.getAssociatedEntity().entityName === 'MessageDraft'
                          ? me.getAssociatedEntity()
                          : null;

        let filter, property, currProp, newValue;

        for (property in propertySet) {

            for (let i = filters.length - 1; i >= 0; i--) {

                filter   = filters.getAt(i);
                currProp = filter.getProperty();

                if (currProp === property) {
                    delete propertySet[property];

                    if (!assocEntity && !filter.getValue()) {
                        Ext.raise({
                            msg          : "no valid value set for filter \"" + property + "\"",
                            mailFolderId : filter.getValue()
                        });
                    }

                    if (assocEntity) {
                        newValue = property === 'parentMessageItemId'
                                   ? assocEntity.get('id')
                                   : assocEntity.get(property);

                        filter.setValue(newValue);
                    }

                } else if (currProp === 'messageItemId') {
                    me.removeFilter(filters.getAt(i), true);
                }
            }
        }

        let properties = [];
        for (property in propertySet) {
            // test for false since index 0 might be set
            if (propertySet[property] === false) {
                properties.push(property);
            }
        }

        if (properties.length) {

            if (assocEntity) {

                for (let i in propertySet) {

                    newValue = i === 'parentMessageItemId'
                               ? assocEntity.get('id')
                               : assocEntity.get(i);

                    me.addFilter({property : i, value : newValue}, true);
                }

            } else {
                Ext.raise({
                    msg : "filters for properties \"[" + properties.join(', ') + "]\" not set"
                });
            }
        }

        return true;
    }
});