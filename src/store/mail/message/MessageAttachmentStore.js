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

        const me = this,
              recs = [].concat(record),
              ret = me.callParent(arguments);

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
     *
     * @private
     *
     * @throws if any compound key information is missing
     */
    checkAndBuildCompoundKeyFilters : function() {

        const me          = this,
            filters     = me.getFilters(),
            propertySet = {
                mailFolderId        : false,
                mailAccountId       : false,
                parentMessageItemId : false
            },
            assocEntity = me.getAssociatedEntity() && me.getAssociatedEntity().entityName === 'MessageDraft'
                ? me.getAssociatedEntity()
                : null;

        let filter, property;

        for (property in propertySet) {

            for (let i = 0, len = filters.length; i < len; i++) {

                filter = filters.getAt(i);

                if (filter.getProperty() === property) {
                    propertySet[property] = i;
                    if (!filter.getValue()) {
                        Ext.raise({
                            msg          : "no valid value set for filter \"" + property + "\"",
                            mailFolderId : filter.getValue()
                        });
                    }
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
                    me.removeFilter(filters[propertySet[i]], true);
                }

                for (let i in propertySet) {
                    me.addFilter({
                        property : i,
                        value    : i === 'parentMessageItemId'
                            ? assocEntity.get('id')
                            : assocEntity.get(i)
                    }, true);
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