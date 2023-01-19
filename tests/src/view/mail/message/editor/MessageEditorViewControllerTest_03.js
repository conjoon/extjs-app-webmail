/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2020-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.registerIoC().setupSimlets().mockUpMailTemplates().andRun((t) => {

        var view,
            controller;

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

            t.it("init registers MailAccount active-related functionality", t => {

                const FAKE_VIEWMODEL = {
                    includeInactiveMailAccounts () {}
                };
                const FAKE_VIEW = {
                    on () {}                        
                };

                const SOURCE_STORE = Ext.create("Ext.data.Store");
                const FAKE_STORE = {getSource: () => SOURCE_STORE};

                controller = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController");

                controller.getView = () => FAKE_VIEW;
                controller.getViewModel = () => FAKE_VIEWMODEL;

                const onMailAccountActiveChangeSpy = t.spyOn(
                    controller,
                    "onMailAccountActiveChange"
                ).and.callFake(() => {});

                const includeInactiveMailAccountsSpy = t.spyOn(
                    controller.getViewModel(),
                    "includeInactiveMailAccounts"
                ).and.callThrough();

                const getChainedMailAccountStoreSpy = t.spyOn(
                    controller,
                    "getChainedMailAccountStore"
                ).and.callFake(() => FAKE_STORE);

                controller.init();

                t.expect(includeInactiveMailAccountsSpy.calls.mostRecent().args[0]).toBe(false);

                FAKE_STORE.getSource().fireEvent("mailaccountactivechange");

                t.expect(onMailAccountActiveChangeSpy.calls.count()).toBe(1);


                [
                    onMailAccountActiveChangeSpy,
                    includeInactiveMailAccountsSpy,
                    getChainedMailAccountStoreSpy
                ].map(spy => spy.remove());  
            });


            t.it("onMailAccountActiveChange()", t => {

                controller = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController");

                let store = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

                let IS_PHANTOM = false;

                let MAIL_ACCOUNT_ID = "id";

                let ACCOUNT_ACTIVE = false;

                const getAccountNodeSpy = t.spyOn(controller, "getAccountNode").and.callFake(id => {
                    if (id === "dev_sys_conjoon_org") {
                        return {
                            get: key => key === "active" ? ACCOUNT_ACTIVE : undefined
                        };
                    }
                });

                const FAKE_MESSAGEDRAFT = {

                    get (key) {
                        switch (key) {
                        case "mailAccountId":
                            return MAIL_ACCOUNT_ID;
                        }
                    },
                    set (key, value) {
                        this[key] = value;
                    }
                };

                const FAKE_VIEWMODEL = {
                    get: (key) => {
                        switch (key) {
                        case "messageDraft":
                            return FAKE_MESSAGEDRAFT;
                        case "isPhantom":
                            return IS_PHANTOM;
                        }
                    }
                };

                let NODE_TPL = {
                    get: () => "newactiveid"
                };
                let FAKE_NODE = undefined;
                const findSpy = t.spyOn(store, "findFirstActiveMailAccount").and.callFake(() => FAKE_NODE);

                // case vm isPhantom == false

                controller.getViewModel = () => FAKE_VIEWMODEL;

                t.waitForMs(t.parent.TIMEOUT, () => {
                    // case vm isPhantom == false
                    IS_PHANTOM = false;
                    let activeId = controller.onMailAccountActiveChange(store, {});
                    t.expect(activeId).toBe(MAIL_ACCOUNT_ID);

                    // isPhantom = true, no current node (account removed, message was loaded before)
                    IS_PHANTOM = true;
                    activeId = controller.onMailAccountActiveChange(store, {});
                    t.expect(activeId).toBe(MAIL_ACCOUNT_ID);

                    // isPhantom = true, current node active (account removed, message was loaded before)
                    IS_PHANTOM = true;
                    ACCOUNT_ACTIVE = true;
                    MAIL_ACCOUNT_ID = "dev_sys_conjoon_org";
                    activeId = controller.onMailAccountActiveChange(store, {});
                    t.expect(activeId).toBe(MAIL_ACCOUNT_ID);

                    // isPhantom = true, currentNode is not active, no active account found
                    IS_PHANTOM = true;
                    ACCOUNT_ACTIVE = false;
                    MAIL_ACCOUNT_ID = "dev_sys_conjoon_org";
                    activeId = controller.onMailAccountActiveChange(store, {});
                    t.expect(activeId).toBeUndefined();
                    t.expect(FAKE_MESSAGEDRAFT.mailAccountId).toBe(null);

                    // isPhantom = true, currentNode is not active, active account found
                    IS_PHANTOM = true;
                    ACCOUNT_ACTIVE = false;
                    MAIL_ACCOUNT_ID = "dev_sys_conjoon_org";
                    FAKE_NODE = NODE_TPL;
                    activeId = controller.onMailAccountActiveChange(store, {});
                    t.expect(activeId).toBe(NODE_TPL.get());
                    t.expect(FAKE_MESSAGEDRAFT.mailAccountId).toBe(activeId);

                    [getAccountNodeSpy, findSpy].map(spy => spy.remove());
                });
            });


            t.it("onMailMessageSaveOperationComplete() considers inactiveMailAccounts", t => {

                const FAKE_OPERATION = {};

                const FAKE_VIEWMODEL = {
                    includeInactiveMailAccounts () {}
                };
                const FAKE_VIEW = {

                };

                controller = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController");
                const setViewBusySpy = t.spyOn(controller, "setViewBusy").and.callFake(() => {});

                controller.getView = () => FAKE_VIEW;
                controller.getViewModel = () => FAKE_VIEWMODEL;

                const includeInactiveMailAccountsSpy = t.spyOn(
                    controller.getViewModel(),
                    "includeInactiveMailAccounts"
                ).and.callThrough();

                controller.onMailMessageSaveOperationComplete(FAKE_OPERATION);

                t.expect(includeInactiveMailAccountsSpy.calls.mostRecent().args[0]).toBe(true);

                [
                    includeInactiveMailAccountsSpy,
                    setViewBusySpy
                ].map(spy => spy.remove());
            });


            t.it("getChainedMailAccountStore()", t => {

                let NOTIFIED = false;

                const SOURCE_STORE = Ext.create("Ext.data.Store");
                const FAKE_STORE = {getSource: () => SOURCE_STORE};

                const FAKE_VIEWMODEL = {
                    get () {return NOTIFIED ? FAKE_STORE : undefined;},
                    notify () {NOTIFIED = true;}
                };

                const notifySpy = t.spyOn(FAKE_VIEWMODEL, "notify");
                const getSpy = t.spyOn(FAKE_VIEWMODEL, "get");

                controller = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController");
                controller.getViewModel = () => FAKE_VIEWMODEL;

                t.expect(controller.getChainedMailAccountStore()).toBe(FAKE_STORE);
                t.expect(notifySpy.calls.count()).toBe(1);
                t.expect(getSpy.calls.count()).toBe(2);

                [getSpy, notifySpy].map(spy => spy.remove());
            });


            t.it("configureAndStartSaveBatch() - exits if applyAccountInformation() is false", t => {

                controller = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController");

                const FAKE_VIEW = {
                    showAccountInvalidNotice () {

                    },
                    fireEvent: () => true,
                    getSession: () => ({
                        getSaveBatch: () => ({
                            setPauseOnException: ()  => {},
                            on: () => {},
                            start: ()  => {}
                        })}),
                    getViewModel: () => ({
                        get: () => ({})
                    })
                };

                controller.getView = () => FAKE_VIEW;

                let VALID = false;

                const showSpy = t.spyOn(FAKE_VIEW, "showAccountInvalidNotice").and.callFake(() => {});
                const applySpy = t.spyOn(controller, "applyAccountInformation").and.callFake(() => VALID);

                t.expect(controller.configureAndStartSaveBatch()).toBe(false);

                t.expect(showSpy.calls.count()).toBe(1);

                VALID = true;
                t.expect(controller.configureAndStartSaveBatch()).toBe(true);

                [showSpy, applySpy].map(spy => spy.remove());
            });

            // +----------------------------------------------------------------------------
            // | SENDING
            // +----------------------------------------------------------------------------


            t.it("getSendMessageDraftRequestConfig()", t => {
                controller = Ext.create(
                    "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        requestConfigurator: Ext.create("coon.core.data.request.Configurator")
                    });

                const expectedRequestCfg = {
                        url: "./cn_mail/MailAccounts/1/MailFolders/3/MessageItems/2",
                        method: "POST"
                    },
                    requestConfiguratorSpy = t.spyOn(controller.requestConfigurator, "configure").and.callFake(
                        cfg => Object.assign({headers: "injected"}, expectedRequestCfg)
                    );

                let messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                    mailAccountId: 1, mailFolderId: 3, id: 2
                });
                messageDraft.dirty = messageDraft.phantom = false;

                let exc;
                try {
                    controller.getSendMessageDraftRequestConfig(messageDraft);
                } catch (e) {
                    exc = e;
                }
                t.expect(exc).toContain("baseAddress");


                t.expect(
                    controller.getSendMessageDraftRequestConfig(messageDraft, ".//cn_mail///")
                ).toEqual(requestConfiguratorSpy.calls.mostRecent().returnValue);
                t.expect(requestConfiguratorSpy.calls.mostRecent().args[0]).toEqual(expectedRequestCfg);


                let tmp = Ext.Ajax.request;

                controller.getView = function () {
                    return {
                        getViewModel: function () {
                            return {
                                get: function () {
                                    return messageDraft;
                                }
                            };
                        },
                        fireEvent: function () {

                        }
                    };
                };

                controller.getSendMessageDraftRequestConfig = function () {
                    return {CALLED: true};
                };

                let REQUEST = false;
                Ext.Ajax.request = function (cfg) {
                    REQUEST = true;
                    t.expect(cfg).toEqual({CALLED: true});
                    return Ext.Promise.resolve();
                };

                controller.sendMessage();

                t.expect(REQUEST).toBe(true);
                Ext.Ajax.request = tmp;
            });


        });});});
