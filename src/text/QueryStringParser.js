/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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
 * Simple parser for parsing Query Strings.
 *
 *      @example
 *      var parser = Ext.create('conjoon.cn_mail.text.QueryStringParser');
 *
 *      var queryString = '?subject=testsubject&body=testbody'
 *
 *      var result = parser.parse(queryString);
 *
 *      console.log(result); // output:
 *      // {subject : "testsubject", body : "testbody"}
 *
 *
 */
Ext.define('conjoon.cn_mail.text.QueryStringParser', {

    /**
     * Parses a string and returns an object containing the query parameters
     * as key value pairs.
     *
     * @param {String} text
     *
     * @return {Object}
     *
     * @throws if text does not start with a "?"
     */
    parse : function(text) {

        var regex  = /(\?|\&)([^=]+)\=([^&|^#]+)/g;
            text   = text + '',
            result = null,
            parts = {};

        if (!Ext.String.startsWith(text, '?')) {
            Ext.raise({
                text : text,
                msg  : "\"text\" must start with a \"?\""
            });
        }

        while ((result = regex.exec(text)) !== null) {
            parts[result[2]] = result[3];
        }

        return parts;
    }


});