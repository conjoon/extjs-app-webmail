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

describe('conjoon.cn_mail.text.mail.message.DecoratorFormatTest', function(t) {


    t.it("stringifyEmailAddress()", function(t) {

        Ext.require('conjoon.cn_mail.text.mail.message.DecoratorFormat');

        t.waitForMs(500,  function() {

            var DecoratorFormat = conjoon.cn_mail.text.mail.message.DecoratorFormat;

            var tests = [{
                args     : [{name : 'name', address : 'address'}],
                expected : "&lt;address&gt; name"
            }, {
                args     : [[
                    {name : 'name',  address : 'address'},
                    {name : 'name1', address : 'address1'}
                ]],
                expected : "&lt;address&gt; name, &lt;address1&gt; name1"
            }];

            for (var i = 0, len = tests.length; i < len; i++) {

                t.expect(DecoratorFormat.stringifyEmailAddress.apply(null, tests[i].args)).toBe(tests[i].expected);

            }


        });



    });
});
