/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.registerIoC().setupSimlets().mockUpMailTemplates()
        .mockUpServices("coon.core.service.UserImageService").andRun((t) => {

            let panel;

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
                selectMessage = function (panel, storeAt, shouldEqualToCK, t) {

                    let message = panel.down("cn_mail-mailmessagegrid").getStore().getAt(storeAt);

                    if (shouldEqualToCK) {
                        t.expect(message.getCompoundKey().toObject()).toEqual(shouldEqualToCK.toObject());
                    }

                    panel.down("cn_mail-mailmessagegrid").getSelectionModel()
                        .select(message);


                    return message;
                },
                getFirstMessageItem = function (mailAccountId) {

                    let mi;

                    for (let index = 0; index <= 1000; index++) {
                        mi = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(index);
                        if (mi.mailAccountId === mailAccountId) {
                            break;
                        }
                    }

                    if (!mi) {
                        t.fail();
                    }


                    return Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                        localId: [mi.mailAccountId, mi.mailFolderId, mi.id].join("-"),
                        id: mi.id,
                        mailAccountId: mi.mailAccountId,
                        mailFolderId: mi.mailFolderId
                    });
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

                if (panel) {
                    panel.destroy();
                    panel = null;
                }
            });

            t.requireOk(
                "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
                "conjoon.cn_mail.view.mail.MailDesktopView",
                "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore", () => {

                    t.it("extjs-app-webmail#83 - showMailAccountFor()", t => {

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        let accountId = "dev_sys_conjoon_org",
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

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

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

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

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

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        let   inboxView        = panel.down("cn_mail-mailinboxview"),
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

                                                                panel.destroy();
                                                                panel = null;

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


                    t.it("getDefaultDraftFolderForComposing()", t => {

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();
                        const store = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();


                        t.waitForMs(t.parent.TIMEOUT, () => {

                            const accounts = store.getRoot().childNodes;
                            t.expect(accounts.length).toBe(2);

                            t.expect(accounts[0].get("active")).toBe(true);

                            t.expect(ctrl.getDefaultDraftFolderForComposing(true)?.parentNode).toBe(accounts[0]);

                            accounts[0].set("active", false);
                            accounts[1].set("active", false);

                            t.expect(ctrl.getDefaultDraftFolderForComposing(true)).toBeUndefined();
                            t.expect(ctrl.getDefaultDraftFolderForComposing(false)?.parentNode).toBe(accounts[0]);

                            t.expect(ctrl.getDefaultDraftFolderForComposing( accounts[0].get("id"))?.parentNode).toBe(accounts[0]);
                            t.expect(ctrl.getDefaultDraftFolderForComposing( accounts[1].get("id"))?.parentNode).toBe(accounts[1]);

                            t.expect(ctrl.getDefaultDraftFolderForComposing( accounts[0].get("id"))?.parentNode).toBe(accounts[0]);
                            t.expect(ctrl.getDefaultDraftFolderForComposing(accounts[1].get("id"))?.parentNode).toBe(accounts[1]);

                            panel.destroy();
                            panel = null;

                        });
                    });


                    t.it("local - MailAccount of email being replied to is default mailAccountId for editor", t => {

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            selectMailFolder(panel, 10, "INBOX.Drafts", t);

                            t.waitForMs(t.parent.TIMEOUT, () => {
                                const message = selectMessage(panel, 0);

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    const editor = ctrl.showMailEditor(message.getCompoundKey(), "replyTo");
                                    t.waitForMs(t.parent.TIMEOUT, () => {

                                        t.expect(editor.getViewModel().get("messageDraft.mailAccountId")).toBe(
                                            message.getCompoundKey().getMailAccountId());

                                        panel.destroy();
                                        panel = null;
                                    });
                                });

                            });
                        });
                    });


                    t.it("loading - MailAccount of email being replied to is default mailAccountId for editor", t => {

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        const messageItem = getFirstMessageItem("mail_account");
                        const ck = messageItem.getCompoundKey();

                        const editor = ctrl.showMailEditor(ck, "replyTo");

                        t.expect(
                            conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance().getRoot().childNodes.length
                        ).toBe(0);
                        
                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(editor.getViewModel().get("messageDraft.mailAccountId")).not.toBeFalsy();
                            t.expect(editor.getViewModel().get("messageDraft.mailAccountId")).toBe(
                                ck.getMailAccountId());

                            panel.destroy();
                            panel = null;
                        });

                    });


                    t.it("event \"activate\" registered", t => {
                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        t.expect(ctrl.getControl()["cn_mail-maildesktopview"].activate).toBe("onMailDesktopViewShow");

                        panel.destroy();
                        panel = null;
                    });


                    t.it("showMailAccountWizard()", t => {

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        const RETURNVALUE = {};

                        t.isInstanceOf(ctrl.mailAccountHandler, "conjoon.cn_mail.view.mail.account.MailAccountHandler");
                        t.expect(ctrl.mailAccountHandler.enabled()).toBe(true);

                        const invokeSpy = t.spyOn(ctrl.mailAccountHandler, "invoke").and.callFake(() => RETURNVALUE);

                        t.expect(ctrl.showMailAccountWizard()).not.toBeUndefined();
                        t.expect(ctrl.showMailAccountWizard()).toBe(invokeSpy.calls.mostRecent().returnValue);

                        const enabledSpy = t.spyOn(ctrl.mailAccountHandler, "enabled").and.callFake(() => false);

                        t.expect(ctrl.mailAccountHandler.enabled()).toBe(false);
                        t.expect(ctrl.showMailAccountWizard()).toBeUndefined();

                        [enabledSpy, invokeSpy].map(spy => spy.remove());

                        panel.destroy();
                        panel = null;
                    });


                    t.it("ioc (mailAccountHandler)", t => {
                        t.expect(conjoon.cn_mail.view.mail.MailDesktopViewController.required.mailAccountHandler).toBe(
                            "conjoon.cn_mail.view.mail.account.MailAccountHandler"
                        );
                    });


                    t.it("onMailDesktopViewShow()", t => {

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        const RETURNVALUE = {};
                        let HAS_MAIL_ACCOUNTS = false;
                        let ARE_ACCOUNTS_LOADED = true;

                        t.isInstanceOf(ctrl.mailAccountHandler, "conjoon.cn_mail.view.mail.account.MailAccountHandler");


                        const showMailAccountWizardSpy = t.spyOn(ctrl, "showMailAccountWizard").and.callFake(() => RETURNVALUE);

                        const store = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();
                        const loadSpy = t.spyOn(store, "load").and.callFake(() => {});
                        const hasAccountsSpy = t.spyOn(store, "hasMailAccounts").and.callFake(() => HAS_MAIL_ACCOUNTS);
                        const areAccountsLoadedSpy =  t.spyOn(store, "areAccountsLoaded").and.callFake(() => ARE_ACCOUNTS_LOADED);

                        HAS_MAIL_ACCOUNTS = true;
                        ARE_ACCOUNTS_LOADED = true;
                        t.expect(ctrl.onMailDesktopViewShow()).toBeUndefined();

                        HAS_MAIL_ACCOUNTS = false;
                        ARE_ACCOUNTS_LOADED = true;
                        t.expect(ctrl.onMailDesktopViewShow()).toBe(RETURNVALUE);
                        t.expect(showMailAccountWizardSpy.calls.count()).toBe(1);

                        HAS_MAIL_ACCOUNTS = false;
                        ARE_ACCOUNTS_LOADED = false;
                        t.expect(ctrl.onMailDesktopViewShow()).toBeUndefined();
                        t.expect(showMailAccountWizardSpy.calls.count()).toBe(1);

                        store.fireEvent("mailaccountsloaded", {}, [1]);
                        t.expect(showMailAccountWizardSpy.calls.count()).toBe(1);

                        // re-attach listener
                        t.expect(ctrl.onMailDesktopViewShow()).toBeUndefined();
                        t.expect(showMailAccountWizardSpy.calls.count()).toBe(1);
                        store.fireEvent("mailaccountsloaded", {}, []);
                        t.expect(showMailAccountWizardSpy.calls.count()).toBe(2);

                        [loadSpy, showMailAccountWizardSpy, hasAccountsSpy, areAccountsLoadedSpy].map(spy => spy.remove());
                    });


                    t.it("onMailDesktopVieShow() - callback does not cancel subsequent events", t => {
                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        const RETURNVALUE = undefined;

                        const showMailAccountWizardSpy = t.spyOn(ctrl, "showMailAccountWizard").and.callFake(() => RETURNVALUE);

                        const observer = {
                            callback () {
                            }
                        };
                        const observerSpy = t.spyOn(observer, "callback");

                        const store = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();
                        const areAccountsLoadedSpy =  t.spyOn(store, "areAccountsLoaded").and.callFake(() => false);

                        t.expect(ctrl.onMailDesktopViewShow()).toBeUndefined();

                        store.on("mailaccountsloaded", observer.callback);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(observerSpy.calls.count()).toBe(1);
                            [showMailAccountWizardSpy, areAccountsLoadedSpy, observerSpy].map(spy => spy.remove());
                        });
                    });


                    t.it("onRouteChange()", t => {

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();

                        t.expect(ctrl.getRoutes()["*"].action).toBe("onRouteChange");

                        let ENABLED = false;

                        const enableSpy = t.spyOn(ctrl.mailAccountHandler, "enabled").and.callFake(() => ENABLED);

                        t.expect(ctrl.onRouteChange()).toBeUndefined();

                        ENABLED = true;

                        const invokeSpy = t.spyOn(ctrl.mailAccountHandler, "forceCloseAccountWizard").and.callFake(() => "FAKERETURN");

                        t.expect(ctrl.onRouteChange()).toBe(invokeSpy.calls.mostRecent().returnValue);

                        [enableSpy, invokeSpy].map(spy => spy.remove());
                    });

                    t.it("showMailMessageViewFor() registers callback if MailAccountRepository is still loading", t => {

                        panel = createMailDesktopView();
                        let ctrl = panel.getController();
                        const setActiveTabSpy = t.spyOn(panel, "setActiveTab");

                        const repository = ctrl.getMailAccountRepository();

                        t.expect(repository.areAccountsLoaded()).toBe(false);

                        const busyWithLoadingSpy = t.spyOn(
                            conjoon.cn_mail.view.mail.message.reader.MessageView.prototype, "busyWithLoading"
                        ).and.callFake(() => {
                            // make sure setActiveTab was called somewhen before busyWithLoading()
                            // method on the view was called
                            // this is required to make sure the tab is active so that error masks are properly applied
                            // in cases where messages fail to load
                            t.expect(setActiveTabSpy.calls.count()).toBe(1);
                        });
                        const loadMessageItemSpy = t.spyOn(
                            conjoon.cn_mail.view.mail.message.reader.MessageView.prototype, "loadMessageItem"
                        );
                        const COMPOUND_KEY = getFirstMessageItem("dev_sys_conjoon_org").getCompoundKey();

                        ctrl.showMailMessageViewFor(COMPOUND_KEY);

                        t.expect(loadMessageItemSpy.calls.count()).toBe(0);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(busyWithLoadingSpy.calls.count()).toBe(2);
                            t.expect(loadMessageItemSpy.calls.mostRecent().args[0]).toBe(COMPOUND_KEY);
                            [setActiveTabSpy, busyWithLoadingSpy, loadMessageItemSpy].map(spy => spy.remove());
                        });

                    });

                });});});
