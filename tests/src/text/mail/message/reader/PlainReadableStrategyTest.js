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

StartTest(t => {

    
    t.it("constructor()", t => {

        let strategy = Ext.create("conjoon.cn_mail.text.mail.message.reader.PlainReadableStrategy");

        t.isInstanceOf(strategy, "Ext.Base");
    });


    t.it("process()", t => {
        let strategy = Ext.create("conjoon.cn_mail.text.mail.message.reader.PlainReadableStrategy");

        let text = "> We will send \n to \n info@conjoon.com \n(https://conjoon.org)\n>> suddenly, a quoted text appears\n> a message";

        t.expect(strategy.process(text)).toBe(
            "<blockquote> We will send</blockquote> to <br />" +
            " <a href=\"mailto:info@conjoon.com\">info@conjoon.com</a> <br />" +
            "(<a href=\"https://conjoon.org\">https://conjoon.org</a>)<blockquote><blockquote> " +
            "suddenly, a quoted text appears</blockquote> a message</blockquote>"
        );


    });

});
