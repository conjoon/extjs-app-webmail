/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
