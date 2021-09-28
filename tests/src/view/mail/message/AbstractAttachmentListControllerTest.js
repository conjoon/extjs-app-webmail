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

    t.it("Should make sure setting up controller works", t => {

        var controller = Ext.create(
            "conjoon.cn_mail.view.mail.message.AbstractAttachmentListController", {
            });

        t.expect(controller instanceof Ext.app.ViewController).toBe(true);
        t.expect(controller.onAttachmentItemClick).toBe(Ext.emptyFn);
    });


    t.it("Should register and catch the events properly", t => {

        var clicked = 0;

        var controller = Ext.create(
            "conjoon.cn_mail.view.mail.message.AbstractAttachmentListController", {
            });

        controller.onAttachmentItemClick = function () {
            clicked++;
        };

        Ext.define("MockAttachmentList", {
            extend: "conjoon.cn_mail.view.mail.message.AbstractAttachmentList",
            alias: "widget.mockattachmentlist"
        });

        t.waitForMs(t.parent.TIMEOUT, () => {
            var view = Ext.create(
                "conjoon.cn_mail.view.mail.message.AbstractAttachmentList", {
                    controller: controller,
                    renderTo: document.body,
                    store: {
                        data: [{
                            text: "filename",
                            size: 100000
                        }],
                        proxy: {
                            type: "memory"
                        }
                    }
                });

            // clicked
            t.expect(clicked).toBe(0);
            t.click(view.el.selectNode("div.attachment"), function () {
                t.expect(clicked).toBe(1);
                t.click(view.el.selectNode("div.attachment"), function () {
                    t.expect(clicked).toBe(2);
                });

            });

        });

    });

});
