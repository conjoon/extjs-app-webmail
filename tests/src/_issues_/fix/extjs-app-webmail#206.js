/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

        let view,
            controller,
            createEditorForController = function (controller) {

                let messageDraft = Ext.create(
                        "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                            mailAccountId: "dev_sys_conjoon_org",
                            mailFolderId: "INBOX"
                        }),
                    store = Ext.create(
                        "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore"
                    ),
                    ed = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                            controller: controller,
                            messageDraft: messageDraft
                        }),
                    vm = ed.getViewModel();

                vm.set("cn_mail_mailfoldertreestore", store);
                store.load();

                return ed;
            };

        t.afterEach(function () {
            if (view) {
                view.destroy();
                view = null;
            }

            if (controller) {
                controller.destroy();
                controller = null;
            }


        });


        t.requireOk("conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", () => {

            Ext.ux.ajax.SimManager.init({
                delay: 1
            });

            t.it("onMailEditorBeforeClose()", t => {
                controller = Ext.create(
                    "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                    });
                t.isCalledOnce("onMailEditorBeforeClose", controller);
                view = createEditorForController(controller);

                t.waitForMs(t.parent.TIMEOUT, () => {
                    view.render(document.body);
                    view.close();
                });
            });


            t.it("onMailMessageSendComplete()", t => {
                controller = Ext.create(
                    "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                    });
                t.isCalledNTimes("onMailEditorBeforeClose", controller, 0);
                view = createEditorForController(controller);

                t.isCalledOnce("close", view);

                t.waitForMs(t.parent.TIMEOUT, () => {
                    view.render(document.body);

                    controller.onMailMessageSendComplete(view);

                    t.waitForMs(controller.closeAfterMs * 1.5, () => {

                    });
                });
            });


        });});});