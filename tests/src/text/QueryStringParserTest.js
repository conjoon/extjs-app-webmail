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

describe('conjoon.cn_mail.text.QueryStringParserTest', function(t) {

    t.it("parse()", function(t) {

        var exc, e, tests = [{
            text     : '?subject=testsubject&body=testbody',
            expected : {
                subject : 'testsubject',
                body    : 'testbody'
            }
        }, {
            text     : "?subject=registerProtocolHandler()%20FTW!&body=Check%20out%20what%20I%20learned%20at%20http%3A%2F%2Fupdates.html5rocks.com%2F2012%2F02%2FGetting-Gmail-to-handle-all-mailto-links-with-registerProtocolHandler%0A%0APlus%2C%20flawless%20handling%20of%20the%20subject%20and%20body%20parameters.%20Bonus%20from%20RFC%202368!",
            expected :  {
                subject : "registerProtocolHandler()%20FTW!",
                body    : "Check%20out%20what%20I%20learned%20at%20http%3A%2F%2Fupdates.html5rocks.com%2F2012%2F02%2FGetting-Gmail-to-handle-all-mailto-links-with-registerProtocolHandler%0A%0APlus%2C%20flawless%20handling%20of%20the%20subject%20and%20body%20parameters.%20Bonus%20from%20RFC%202368!"
            }
        }, {
            text     : 'http://www.test.com/?param1=test1&param2=test2&param3=test3#',
            expected : 'Exception'
        }, {
            text : '?param1=test1&param2=test2&param3=test3#',
            expected :  {
                param1 : "test1",
                param2 : "test2",
                param3 : "test3"
            }
        }, {
            text     : 'subject=test&parts=2',
            expected : 'Exception'
        }];

        var parser = Ext.create('conjoon.cn_mail.text.QueryStringParser');

        for (var i = 0, len = tests.length; i < len; i++) {
            exc = e = undefined;

            if (tests[i].expected == 'Exception') {
                try {parser.parse(tests[i].text);} catch(e) {exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain("must start with a");
            } else {
                t.expect(parser.parse(tests[i].text)).toEqual(tests[i].expected);
            }

        }


    });

});
