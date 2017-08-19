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
 * Format helper for decorator instances.
 *
 * @see private
 */
Ext.define('conjoon.cn_mail.text.mail.message.DecoratorFormat', {

    singleton : true,

    /**
     * Formats an email address object or an array of email address objects
     * into a reaable format.
     * @example
     *
     *      conjoon.cn_mail.text.mail.message.DecoratorFormat.stringifyEmailAddress({
     *          name    : 'name',
     *          address : 'address'
     *      });
     *      // returns "&lt;address&gt; name"
     *
     *      conjoon.cn_mail.text.mail.message.DecoratorFormat.stringifyEmailAddress([{
     *          name    : 'name',
     *          address : 'address'
     *      }, {
     *          name    : 'name1',
     *          address : 'address1'
     *      }]);
     *      // returns "&lt;address&gt; name, &lt;address1&gt; name1"
     *
     * @param {Object[]} addresses
     *
     * @return {String}
     */
    stringifyEmailAddress : function(addresses) {

        var add    = [].concat(addresses),
            result = [];

        for (var i = 0, len = add.length; i < len; i++) {
            if (!add[i]) {
                continue;
            }
            result.push(
                Ext.String.format(
                    "&lt;{0}&gt; {1}",
                    add[i].address, add[i].name
                )
            );
        }

        return result.join(", ");
    }

});