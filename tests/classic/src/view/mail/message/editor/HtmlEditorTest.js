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

import TestHelper from "/tests/lib/mail/TestHelper.js";

StartTest(async t => {

    const helper =  l8.liquify(TestHelper.get(t, window));
    await helper.mockUpMailTemplates().andRun((t) => {

        var view, viewConfig;


        t.afterEach(function () {
            if (view) {
                view.destroy();
                view = null;
            }
        });

        t.beforeEach(function () {
            viewConfig = {
                renderTo: document.body
            };

        });


        t.it("Should create and show the HtmlEditor along with default config checks", t => {
            view = Ext.create(
                "conjoon.cn_mail.view.mail.message.editor.HtmlEditor", viewConfig);

            t.expect(view instanceof Ext.form.field.HtmlEditor).toBeTruthy();

            t.expect(view.alias).toContain("widget.cn_mail-mailmessageeditorhtmleditor");

            t.expect(view.down("cn_comp-formfieldfilebutton")).toBeTruthy();
        });


        //@see https://github.com/conjoon/extjs-app-webmail/issues/2
        t.it("Should fix conjoon/extjs-app-webmail/issues/2", t => {
            view = Ext.create(
                "conjoon.cn_mail.view.mail.message.editor.HtmlEditor", viewConfig);

            t.expect(view.down("cn_comp-formfieldfilebutton").tooltip).toBeDefined();
        });


        t.it("extjs-app-webmail#68", t => {
            view = Ext.create(
                "conjoon.cn_mail.view.mail.message.editor.HtmlEditor", viewConfig);

            let tbar             = view.down("toolbar"),
                DEFAULTPREVENTED = 0,
                listener         = tbar.managedListeners[4],
                preventDefault   = function () {DEFAULTPREVENTED++;},
                evt              = {preventDefault: preventDefault};

            //t.click(fileButton, function() {arguments; debugger;}, null, evt);

            t.expect(listener.ename).toBe("click");

            t.expect(DEFAULTPREVENTED).toBe(0);
            listener.fn(evt, {className: "foo x-form-file-input stugg"});
            t.expect(DEFAULTPREVENTED).toBe(0);

            listener.fn(evt, {className: ""});
            t.expect(DEFAULTPREVENTED).toBe(1);
            listener.fn(evt, {className: ""});
            t.expect(DEFAULTPREVENTED).toBe(2);
            listener.fn(evt, {className: "foo x-form-file-input stugg"});
            t.expect(DEFAULTPREVENTED).toBe(2);

        });


        t.it("initFrameDoc()", async (t) => {
            view = Ext.create(
                "conjoon.cn_mail.view.mail.message.editor.HtmlEditor", viewConfig);

            await view.initFrameDoc();
            t.expect(view.editorHtmlTemplateTxt).toBeTruthy();
            t.waitForMs(t.parent.TIMEOUT, () => {
                // intentionally left empty
            });
        });


        t.it("loadMarkup()", async (t) => {
            view = Ext.create(
                "conjoon.cn_mail.view.mail.message.editor.HtmlEditor", viewConfig);


            let res = await view.loadMarkup();
            t.expect(res).toBeDefined();
            t.expect(t.TPL_SPY.calls.mostRecent().args[0].theme).toBe(coon.core.ThemeManager.getTheme());

            t.waitForMs(t.parent.TIMEOUT, () => {
                // intentionally left empty
            });
        });

    });});
