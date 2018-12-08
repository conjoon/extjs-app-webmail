/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.view.mail.message.reader.MessageViewControllerTest', function(t) {


    t.beforeEach(function() {

        viewConfig = {

        }
    });


    t.it("Should make sure setting up controller works", function(t) {

        var controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.reader.MessageViewController', {
            });

        t.isInstanceOf(controller, 'Ext.app.ViewController');
    });


    t.it("app-cn_mail#88 - sanitizeLinks()", function(t) {

        let tests = [{
            has : {id : 'cn_' + 1, target : '_blank'},
            expected : {id : 'cn_' + 1, href : null, target : null}
        }, {
            has: {id : 'cn_' + 2, href: '#foobar', target: '_top'},
            expected: {id : 'cn_' + 2, href : '#foobar', target: null}
        }, {
            has: {id : 'cn_' + 3, href: 'mailto:foobar@check'},
            expected: {id : 'cn_' + 3, href : '#cn_mail/message/compose/' + encodeURIComponent('mailto:foobar@check'), target: '_top'}
        }, {
            has: {id : 'cn_' + 4, href: 'safssfafs'},
            expected: {id : 'cn_' + 4, href : 'safssfafs', target: '_blank'}
        }];

        let elements = [], test;

        for (let i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            let el = document.createElement("a");
            if (test.has.href) {
                el.setAttribute('href', test.has.href);
            }
            if (test.has.target) {
                el.setAttribute('target', test.has.target);
            }

            el.setAttribute('id', test.has.id);
            elements.push(el);
        }

        let controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.reader.MessageViewController', {
            });

        controller.sanitizeLinks(elements);

        let i, len;
        for (i = 0, len = tests.length; i < len; i++) {
            test = tests[i];

            t.expect(test.expected.id).toBe(elements[i].getAttribute('id'));
            t.expect(test.expected.href).toBe(elements[i].getAttribute('href'));
            t.expect(test.expected.target).toBe(elements[i].getAttribute('target'));
        }

        t.expect(i).toBeGreaterThan(1);

    });


});
