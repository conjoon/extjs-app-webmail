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
Ext.define("conjoon.cn_mail.text.QueryStringParser", {

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
    parse: function (text) {

        text = text + "";

        var regex  = /(\?|&)([^=]+)=([^&|^#]+)/g,
            result = null,
            parts  = {};

        if (!Ext.String.startsWith(text, "?")) {
            Ext.raise({
                text: text,
                msg: "\"text\" must start with a \"?\""
            });
        }

        while ((result = regex.exec(text)) !== null) {
            parts[result[2]] = result[3];
        }

        return parts;
    }


});