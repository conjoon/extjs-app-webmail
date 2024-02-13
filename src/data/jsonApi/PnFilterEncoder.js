/**
 * This file is part of the conjoon/extjs-app-webmail project.
 *
 * (c) 2022-2024 Thorsten Suckow-Homberg <thorsten@suckow-homberg.de>
 *
 * For full copyright and license information, please consult the LICENSE-file distributed
 * with this source code.
 */


/**
 * Provides serializer and encoder for filters according to
 * https://www.conjoon.org/docs/api/rest-api/@conjoon/rest-api-description/rest-api-email
 */
Ext.define("conjoon.cn_mail.data.jsonApi.PnFilterEncoder", {

    requires: [
        "Ext.util.FilterCollection"
    ],


    /**
     * Serializes the specified Ext.util.Filter.
     *
     * @param {Ext.util.Filter} filter
     * @returns {Object}
     */
    serialize (filter) {

        const
            transformed = Object.create(null),
            operator = filter.getOperator() || "=";

        transformed[operator] = {};
        transformed[operator][filter.getProperty()] = filter.getValue();

        return transformed;

    },


    /**
     * Returns the transformed filters to be used with the filter query
     * parameter.
     * Logical operators supported are only "AND", since Ext JS filters use this
     * by default.
     *
     * @param {Ext.util.FilterCollection} filters
     *
     * @returns {string}
     */
    encode (filters) {
        const
            me = this,
            serialized = [],
            items = (filters instanceof Ext.util.FilterCollection) ? filters.items : filters;

        items.map(filter => serialized.push(me.serialize(filter)));

        if (serialized.length > 1) {
            return JSON.stringify({"AND": serialized});
        }

        return JSON.stringify(serialized[0]);
    }


});