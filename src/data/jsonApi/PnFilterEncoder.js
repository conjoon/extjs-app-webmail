/**
 * coon.js
 * extjs-lib-core
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/coon-js/extjs-lib-core
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

        return JSON.stringify({"AND": serialized});
    }


});
