/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Strategy for transforming a textPlain-texts into text that contains HTML:
 * - URLs will be converted into hyperlinks (<a>)
 * - Email-Addresses will be converted into hyperlinks with their href-attribute's value
 *  (the Email-Address itself) prefixed with "mailto:"
 * - lines starting with quote marks (">") will be logically grouped into "<blockquotes>"
 * - line-breaks will be converted to <br />
 *
 * @example
 *
 *      let strategy = Ext.create("conjoon.cn_mail.text.mail.message.reader.PlainReadableStrategy");
 *
 *      let text = "> We will send \n to \n info@conjoon.com \n(https://conjoon.org)\n>> suddenly, a quoted text appears\n> a message";
 *
 *      strategy.process(text);
 *
 *      // Returns:
 *      // <blockquote> We will send</blockquote> to <br /> <a href="mailto:info@conjoon.com">info@conjoon.com</a> <br />(<a href="https://conjoon.org">https://conjoon.org</a>)<blockquote><blockquote> suddenly, a quoted text appears</blockquote> a message</blockquote>
 *      //
 *      //
 *      //
 *
 */
Ext.define("conjoon.cn_mail.text.mail.message.reader.PlainReadableStrategy", {

    requires: [
        // @define l8.text.toBlockquote
        "l8.text.toBlockquote",
        // @define l8.text.toHyperlink
        "l8.text.toHyperlink",
        // @define l8.text.toEmailLink
        "l8.text.toEmailLink",
        // @define l8.text.toLineBreak
        "l8.text.toLineBreak"
    ],

    /**
     * Processes the specified text and returns a text with HTML-elements representing
     * line breaks, Hyperlinks, Email-Addresses and Blockquotes.
     *
     * @param {String} text
     *
     * @returns {string}
     */
    process: function (text) {

        return l8.text.toLineBreak(
            l8.text.toHyperlink(
                l8.text.toEmailLink(
                    l8.text.toBlockquote(
                        text
                    )
                )
            )
        );
    }
});