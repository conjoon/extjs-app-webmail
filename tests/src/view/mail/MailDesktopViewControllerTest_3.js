/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.setupSimlets().mockUpMailTemplates().mockUpServices("coon.core.service.UserImageService").andRun((t) => {

        const selectMailFolder = function (panel, storeAt, shouldBeId, t) {

                let folder = storeAt instanceof Ext.data.TreeModel
                    ? storeAt
                    : panel.down("cn_mail-mailfoldertree").getStore().getAt(storeAt);

                let p = folder.parentNode;

                while (p) {
                    p.expand();
                    p = p.parentNode;
                }

                panel.down("cn_mail-mailfoldertree").getSelectionModel()
                    .select(folder);

                if (shouldBeId && t) {
                    t.expect(folder.get("id")).toBe(shouldBeId);
                }

                return folder;

            },
            doubleClickMessage = function (grid, storeAt, shouldEqualToCK, t, cb) {

                let message = grid.getStore().getAt(storeAt);

                if (shouldEqualToCK) {
                    t.expect(message.getCompoundKey().toObject()).toEqual(shouldEqualToCK.toObject());
                }

                t.doubleClick(grid.view.getRow(message), cb);


            },
            createMailDesktopView = function () {
                return Ext.create("conjoon.cn_mail.view.mail.MailDesktopView", {
                    width: 800,
                    height: 600,
                    renderTo: document.body
                });
            };

        t.beforeEach(function () {
            conjoon.dev.cn_mailsim.data.table.MessageTable.resetAll();
        });

        t.afterEach(function () {
            Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
            Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
        });

        t.requireOk("conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", () => {
            t.requireOk("conjoon.cn_mail.view.mail.MailDesktopView", function (){

                t.it("extjs-app-webmail#83 - showMailAccountFor()", t => {

                    let panel     = createMailDesktopView(),
                        ctrl      = panel.getController(),
                        accountId = "dev_sys_conjoon_org",
                        accountView;

                    accountView = ctrl.showMailAccountFor(accountId);

                    t.isInstanceOf(accountView, "conjoon.cn_mail.view.mail.account.MailAccountView");

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let mailFolder = panel.down("cn_mail-mailfoldertree");

                        t.expect(mailFolder.getSelectionModel().getSelection()[0].getId()).toBe(accountId);

                        t.expect(ctrl.showMailAccountFor("mail_account")).toBe(accountView);

                        t.expect(mailFolder.getSelectionModel().getSelection()[0].getId()).toBe("mail_account");

                        panel.destroy();

                        panel = null;
                    });

                });


                t.it("onMailMessageGridRefreshClick()", t => {

                    let panel = createMailDesktopView(),
                        ctrl  = panel.getController();

                    let CALLED = false,
                        ISAVAILABLE = true;

                    let tmp = ctrl.getView;

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        ctrl.getView = function () {
                            return {
                                down: function () {
                                    return {
                                        getStore: function () {
                                            return ISAVAILABLE ? {
                                                reload: function () {
                                                    CALLED = true;
                                                }
                                            } : null;
                                        }
                                    };
                                }
                            };
                        };

                        t.expect(CALLED).toBe(false);
                        ctrl.onMailMessageGridRefreshClick();
                        t.expect(CALLED).toBe(true);

                        CALLED = false;
                        ISAVAILABLE = false;

                        ctrl.onMailMessageGridRefreshClick();
                        t.expect(CALLED).toBe(false);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            ctrl.getView = tmp;

                            panel.destroy();
                            panel = null;
                        });

                    });


                });


                t.it("onMailMessageGridRefreshClick() - click event observed", t => {

                    let panel     = createMailDesktopView(),
                        ctrl      = panel.getController();

                    t.isCalledOnce("onMailMessageGridRefreshClick", ctrl);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, 3);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let el = panel.down("cn_mail-mailmessagegrid #cn_mail-mailmessagegrid-refresh");

                            t.click(el, function () {

                                panel.destroy();
                                panel = null;

                            });

                        });


                    });
                });


                t.it("changes in attachments are reflected across all MessageViews", t => {

                    let panel            = createMailDesktopView(),
                        ctrl             = panel.getController(),
                        inboxView        = panel.down("cn_mail-mailinboxview"),
                        inboxMessageView = inboxView.down("cn_mail-mailmessagereadermessageview"),
                        grid             = panel.down("cn_mail-mailmessagegrid");


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, 4, "INBOX.Drafts", t);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            // create editor and draft and save it.
                            let editor = ctrl.showMailEditor("foobar", "compose");

                            editor.down("#subjectField").setValue("Test");
                            t.click(editor.down("#saveButton"), function () {

                                // wait until the message is saved...
                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    // go back to messagedraft and make sure newly created message is available
                                    // and selected and viewable in the MessageView
                                    panel.setActiveItem(inboxView);

                                    let compoundKey = editor.getViewModel().get("messageDraft").getCompoundKey();
                                    doubleClickMessage(grid, 0, compoundKey, t,function () {

                                        ctrl.showMailMessageViewFor(compoundKey);

                                        // wait for the MessageView to properly initialize
                                        t.waitForMs(t.parent.TIMEOUT, () => {

                                            panel.setActiveItem(editor);

                                            editor.down("#subjectField").setValue("foobar");

                                            t.click(editor.down("#saveButton"), function () {

                                                // wait until the message is saved...
                                                t.waitForMs(t.parent.TIMEOUT, () => {

                                                    panel.setActiveItem(inboxView);
                                                    t.expect(grid.getSelectionModel().getSelection().length).toBeTruthy();
                                                    t.expect(grid.getSelectionModel().getSelection()[0].getCompoundKey().toLocalId()).toEqual(
                                                        editor.getViewModel().get("messageDraft").getCompoundKey().toLocalId()
                                                    );

                                                    t.expect(
                                                        grid.view.getRow(grid.getSelectionModel().getSelection()[0]
                                                        ).parentNode.parentNode.className).toContain("selected");

                                                    panel.setActiveItem(editor);

                                                    editor.getViewModel().get("messageDraft").attachments().add(
                                                        Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {text: "foo", type: "image/jpg", size: 5000})
                                                    );

                                                    t.click(editor.down("#saveButton"), function () {

                                                        // wait until the message is saved...
                                                        t.waitForMs(t.parent.TIMEOUT, () => {

                                                            panel.setActiveItem(inboxView);

                                                            t.expect(
                                                                inboxMessageView.getViewModel().get("attachmentStore").getRange()[0].getId()
                                                            ).toBe(
                                                                editor.getViewModel().get("messageDraft").attachments().getRange()[0].getId()
                                                            );

                                                        });

                                                    });
                                                });

                                            });
                                        });


                                    });

                                });


                            });

                        });


                    });


                });


            });});});});
