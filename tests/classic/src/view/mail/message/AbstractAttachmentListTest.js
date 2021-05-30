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

describe("conjoon.cn_mail.view.mail.message.AbstractAttachmentListTest", function (t) {

    var view,
        viewConfig;

    t.afterEach(function () {
        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function () {

        viewConfig = {

        };
    });


    t.it("Should create and show the attachment list along with default config checks", function (t) {
        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.AbstractAttachmentList", viewConfig);

        t.expect(view instanceof Ext.view.View).toBeTruthy();

        t.expect(view.cls).toContain("cn_mail-attachment-list");
        t.expect(view.overItemCls).toContain("over");
        t.expect(view.selectedItemCls).toContain("selected");
        t.expect(view.itemSelector).toContain("div.attachment");
        t.expect(view.displayButtonType).toBe(Ext.emptyFn);
    });


    t.it("Should test getPreviewCssClass properly", function (t) {
        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.AbstractAttachmentList", viewConfig);

        var tests = [{
            type: "image/png",
            src: "somesting",
            expect: true
        }, {
            type: "image/png",
            src: "",
            expect: false
        }, {
            type: "image/jpg",
            src: "somesting",
            expect: true
        }, {
            type: "IMAGE/GIF",
            src: "somesting",
            expect: true
        }, {
            type: "file/pdf",
            src: "somesting",
            expect: false
        },{
            type: "application/json",
            src: "",
            expect: false
        }];

        for (var i = 0, len = tests.length; i < len; i++) {

            if (tests[i]["expect"] === true) {
                t.expect(
                    view.getPreviewCssClass(tests[i]["type"], tests[i]["src"])
                ).toBe("preview");
            } else {
                t.expect(
                    view.getPreviewCssClass(tests[i]["type"], tests[i]["src"])
                ).toBe("");
            }
        }
    });

    t.it("Should test getMimeTypeIcon properly", function (t) {

        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.AbstractAttachmentList", viewConfig);

        t.expect(typeof(view.getMimeTypeIcon("foo"))).toBe("string");
        t.expect(typeof(view.getMimeTypeIcon())).toBe("string");
        t.expect(typeof(view.getMimeTypeIcon(null))).toBe("string");
        t.expect(typeof(view.getMimeTypeIcon(1))).toBe("string");

    });


});
