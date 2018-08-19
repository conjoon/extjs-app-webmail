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
     *
     * @returns {Ext.data.Store}
     */
    load : function() {

        const me          = this,
              filters     = me.getFilters(),
              propertySet = {
                  mailFolderId          : false,
                  mailAccountId         : false,
                  originalMessageItemId : false
              };

        let filter, property;

        for (property in propertySet) {

            for (let i = 0, len = filters.length; i < len; i++) {

                filter = filters.getAt(i);

                if (filter.getProperty() === property) {
                    propertySet[property] = true;
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
            if (!propertySet[property]) {
                properties.push(property);
            }
        }
        if (properties.length) {
            Ext.raise({
                msg : "filters for properties \"[" + properties.join(', ') + "]\" not set"
            });
        }

        return me.callParent(arguments);
    }


});