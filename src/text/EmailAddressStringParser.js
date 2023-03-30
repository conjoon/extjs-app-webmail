/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Simple parser that parses Strings for EmailAddresses.
 *
 *      @example
 *      var parser = Ext.create('conjoon.cn_mail.text.EmailAddressStringParser');
 *
 *      let str = 'foo bar <foo@bar.com>'
 *
 *      var result = parser.parse(str);
 *
 *      console.log(result); // output:
 *      // [{name : "foo bar", address : "foo@bar.com"}]
 *
 *
 */
Ext.define("conjoon.cn_mail.text.EmailAddressStringParser", {

    /**
     * Parses a string and returns an object containing the name/address as key value pairs.
     *
     * @param {String} text
     *
     * @return {Object}
     *
     * @throws if no addresses where found
     */
    parse: function (text) {

        text = decodeURIComponent(text);

        let parts = text.indexOf(">,") !== -1 ? text.split(">,") : [text.replace(">", "")];

        let addresses = parts.map(item => {

            let [name, address] = item.indexOf(" <") !== -1 ? item.split(" <") : [item, item];

            return {name, address};
        });

        if (!addresses.length) {
            throw new Error({
                text: text,
                msg: "no address found"
            });
        }

        return addresses;
    }


});