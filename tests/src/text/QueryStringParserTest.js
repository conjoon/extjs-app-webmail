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

describe("conjoon.cn_mail.text.QueryStringParserTest", function (t) {

    t.it("parse()", function (t) {

        var exc, tests = [{
            text: "?subject=testsubject&body=testbody",
            expected: {
                subject: "testsubject",
                body: "testbody"
            }
        }, {
            text: "?subject=registerProtocolHandler()%20FTW!&body=Check%20out%20what%20I%20learned%20at%20http%3A%2F%2Fupdates.html5rocks.com%2F2012%2F02%2FGetting-Gmail-to-handle-all-mailto-links-with-registerProtocolHandler%0A%0APlus%2C%20flawless%20handling%20of%20the%20subject%20and%20body%20parameters.%20Bonus%20from%20RFC%202368!",
            expected: {
                subject: "registerProtocolHandler()%20FTW!",
                body: "Check%20out%20what%20I%20learned%20at%20http%3A%2F%2Fupdates.html5rocks.com%2F2012%2F02%2FGetting-Gmail-to-handle-all-mailto-links-with-registerProtocolHandler%0A%0APlus%2C%20flawless%20handling%20of%20the%20subject%20and%20body%20parameters.%20Bonus%20from%20RFC%202368!"
            }
        }, {
            text: "http://www.test.com/?param1=test1&param2=test2&param3=test3#",
            expected: "Exception"
        }, {
            text: "?param1=test1&param2=test2&param3=test3#",
            expected: {
                param1: "test1",
                param2: "test2",
                param3: "test3"
            }
        }, {
            text: "subject=test&parts=2",
            expected: "Exception"
        }];

        var parser = Ext.create("conjoon.cn_mail.text.QueryStringParser");

        for (var i = 0, len = tests.length; i < len; i++) {
            exc = undefined;

            if (tests[i].expected === "Exception") {
                try {parser.parse(tests[i].text);} catch(e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain("must start with a");
            } else {
                t.expect(parser.parse(tests[i].text)).toEqual(tests[i].expected);
            }

        }


    });

});
