/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.setupSimlets().mockUpMailTemplates().andRun((t) => {

        const cn_href = "#cn_href";

        let editor;

        t.beforeEach(t => {
            editor = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                renderTo: document.body,
                cn_href: cn_href,
                controller: Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController"),
                messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                    mailAccountId: "dev_sys_conjoon_org",
                    mailFolderId: "INBOX"
                })
            });
            editor.getViewModel().notify();
        });

        t.afterEach(t => {
            editor.destroy();
            editor = null;
        });

        // +-----------------------------------------
        // | Tests
        // +-----------------------------------------
        t.diag("feat: add confirm dialog before message editor is closed (conjoon/extjs-app-webmail#112)");

        t.it("onMailEditorBeforeClose()", t => {
            let redirectToSpy = t.spyOn(editor.getController(), "redirectTo").and.callFake(() => ({})),
                dialogSpy = t.spyOn(editor, "showConfirmCloseDialog").and.callFake(() => ({}));

            editor.close();
            t.expect(editor.destroyed).toBe(false);
            t.expect(redirectToSpy.calls.mostRecent().args).toEqual([cn_href]);
            t.expect(dialogSpy.calls.count()).toBe(1);

            redirectToSpy.remove();
            dialogSpy.remove();
        });


        t.it("showConfirmCloseDialog()", t => {

            const
                dom = editor.el.dom,
                iconCls = editor.getIconCls();

            editor.showConfirmCloseDialog();

            const
                yesButton = () => Ext.dom.Query.select("span[data-ref=yesButton]", dom)[0],
                noButton = () => Ext.dom.Query.select("span[data-ref=noButton]", dom)[0],
                mask = () => Ext.dom.Query.select("div[class*=cn_comp-messagemask]", dom)[0];

            t.expect(mask()).toBeDefined();
            t.expect(yesButton().parentNode.style.display).not.toBe("none");
            t.expect(noButton().parentNode.style.display).not.toBe("none");

            t.expect(editor.getIconCls()).not.toBe(iconCls);
            t.expect(editor.getClosable()).toBe(false);

            t.click(noButton(), () => {
                t.expect(mask()).toBeUndefined();

                t.expect(editor.getIconCls()).toBe(iconCls);
                t.expect(editor.getClosable()).toBe(true);
                t.expect(editor.destroyed).toBe(false);

                editor.showConfirmCloseDialog();

                t.click(yesButton(), () => {
                    t.expect(mask()).toBeUndefined();
                    t.expect(editor.destroyed).toBe(true);
                });
            });
        });


    });});
