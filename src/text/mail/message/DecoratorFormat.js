/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * Format helper for decorator instances.
 *
 * @see private
 */
Ext.define("conjoon.cn_mail.text.mail.message.DecoratorFormat", {

    singleton: true,

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
    stringifyEmailAddress: function (addresses) {

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