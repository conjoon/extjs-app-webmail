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
    await helper.setupSimlets().mockUpMailTemplates().andRun((t) => {


        const createKey = function (id1, id2, id3) {
                return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
            },
            getMessageItemAt = function (messageIndex) {
                return conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(messageIndex);
            },
            createKeyForExistingMessage = function (messageIndex){
                let item = getMessageItemAt(messageIndex);

                let key = createKey(
                    item.mailAccountId, item.mailFolderId, item.id
                );

                return key;
            };

        var view,
            viewConfig = {
                renderTo: document.body,
                height: 400,
                width: 400
            };

        t.afterEach(function () {
            Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
            Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");

            if (view) {
                view.destroy();
                view = null;
            }

        });


        t.it("Should create and show the view along with default config checks", t => {
            view = Ext.create(
                "conjoon.cn_mail.view.mail.MailDesktopView", viewConfig);

            t.isInstanceOf(view, "Ext.tab.Panel");
            t.expect(view.alias).toContain("widget.cn_mail-maildesktopview");

            t.isInstanceOf(view.getViewModel(), "conjoon.cn_mail.view.mail.MailDesktopViewModel");
        });


        t.it("showMailEditor() (1)", t => {
            var exc;

            view = Ext.create(
                "conjoon.cn_mail.view.mail.MailDesktopView", viewConfig);

            t.waitForMs(t.parent.TIMEOUT, () => {
                try{view.showMailEditor(1);}catch(e){exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain("is not a valid value");

                t.waitForMs(t.parent.TIMEOUT, () => {

                });

            });

        });


        t.it("showMailEditor() (2)", t => {
            var editor1, editor2;

            view = Ext.create(
                "conjoon.cn_mail.view.mail.MailDesktopView", viewConfig);

            t.isCalledNTimes("showMailEditor", view.getController(), 4);

            editor1 = view.showMailEditor(createKeyForExistingMessage(1), "edit");
            t.isInstanceOf(editor1, "conjoon.cn_mail.view.mail.message.editor.MessageEditor");

            editor2 = view.showMailEditor(createKeyForExistingMessage(2), "edit");
            t.expect(editor1).not.toBe(editor2);

            editor2 = view.showMailEditor(createKeyForExistingMessage(1), "edit");
            t.expect(editor1).toBe(editor2);

            t.expect(view.showMailEditor(1, "compose")).not.toBe(editor1);

            t.waitForMs(t.parent.TIMEOUT, () => {

            });
        });


        t.it("showInboxViewFor()", t => {

            let inb1, inb2;

            view = Ext.create(
                "conjoon.cn_mail.view.mail.MailDesktopView", viewConfig);

            t.isCalledNTimes("showInboxViewFor", view.getController(), 2);

            inb1 = view.showInboxViewFor("foo", "1");
            t.isInstanceOf(inb1, "conjoon.cn_mail.view.mail.inbox.InboxView");

            inb2 = view.showInboxViewFor("foo", "2");

            t.expect(inb1).toBe(inb2);
        });


        t.it("showMessageCannotBeDeletedWarning()", t => {

            view = Ext.create(
                "conjoon.cn_mail.view.mail.MailDesktopView", viewConfig);

            let toast = view.showMessageCannotBeDeletedWarning();

            t.isInstanceOf(toast, "coon.comp.window.Toast");

            t.expect(toast.context).toBe("warning");

        });


        t.it("showMessageMovedInfo()", t => {

            /**
         * test for extjs-app-webmail#102
         */

            view = Ext.create(
                "conjoon.cn_mail.view.mail.MailDesktopView", viewConfig);

            let myId = "____" + Ext.id() + Ext.id() + "____";

            let toast = view.showMessageMovedInfo(
                null, null, {get: function (field) {return field === "name" ? myId : null;}}
            );

            t.expect(toast.body.dom.innerHTML).toContain(myId);
            t.isInstanceOf(toast, "coon.comp.window.Toast");

            t.expect(toast.context).toBe("info");

        });


        t.it("showMailAccountFor()", t => {


            view = Ext.create(
                "conjoon.cn_mail.view.mail.MailDesktopView", viewConfig);

            let ctrl = view.getController();

            t.isCalled("showMailAccountFor", ctrl);

            let accountView = view.showMailAccountFor("dev_sys_conjoon_org");
            t.isInstanceOf(accountView, "conjoon.cn_mail.view.mail.account.MailAccountView");

            t.waitForMs(t.parent.TIMEOUT, () => {

            });

        });


    });});
