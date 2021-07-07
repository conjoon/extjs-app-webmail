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

import TestHelper from "../../../../../../lib/mail/TestHelper.js";

StartTest(async t => {

    const helper =  l8.liquify(TestHelper.get(t, window));
    await helper.mockUpMailTemplates().andRun((t) => {
        
        t.requireOk("coon.core.util.Date", () => {

          
            if (!Ext.manifest) {
                Ext.manifest = {};
            }

            if (!Ext.manifest.resources) {
                Ext.manifest.resources = {};
            }

            var view,
                viewConfig,
                testDate   = new Date(),
                formatDate = coon.core.util.Date.getHumanReadableDate(testDate),
                createKey = function (id1, id2, id3) {
                    return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
                },
                getMessageItemAt = function (messageIndex) {
                    return conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);
                },
                createKeyForExistingMessage = function (messageIndex){
                    let item = getMessageItemAt(messageIndex);

                    let key = createKey(
                        item.mailAccountId, item.mailFolderId, item.id
                    );

                    return key;
                },
                createMessageItem = function (withMessageBody) {

                    var conf = {
                        id: 1,
                        mailFolderId: "INBOX",
                        mailAccountId: "dev_sys_conjoon_org",
                        messageBodyId: "dev_sys_conjoon_org-INBOX-1",
                        subject: "SUBJECT",
                        from: "FROM",
                        date: testDate,
                        seen: false,
                        hasAttachments: true
                    };

                    if (withMessageBody === false) {
                        delete conf.messageBodyId;
                    }

                    var messageItem = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", conf);

                    return messageItem;
                },
                checkHtmlForValidData = function (t, view) {
                    t.expect(view.getTitle()).toContain("SUBJECT");

                    let node = view.down("#msgHeaderContainer").down("container").el.dom;

                    t.expect(node.innerHTML).toContain("FROM");
                    t.expect(node.innerHTML).toContain("SUBJECT");
                    t.expect(node.innerHTML).toContain(formatDate);
                    t.expect(view.down("component[cls=cn_mail-mailmessagereadermessageviewiframe]").getSrcDoc()).not.toBe("");
                },
                checkHtmlDataNotPresent = function (t, view) {

                    t.expect(view.down("#msgIndicatorBox").isVisible()).toBe(true);

                    let node = view.down("#msgHeaderContainer").down("container").el.dom;

                    t.expect(view.getTitle()).toBe(view.getViewModel().emptySubjectText);
                    t.expect(node.innerHTML).not.toContain("FROM");
                    t.expect(node.innerHTML).toContain(view.getViewModel().emptySubjectText);
                    t.expect(node.innerHTML).not.toContain(formatDate);
                    t.expect(view.down("component[cls=cn_mail-mailmessagereadermessageviewiframe]").getSrcDoc()).toBe("");
                };

            t.afterEach(function () {
                if (view) {
                    view.destroy();
                    view = null;
                }

                viewConfig = {};

            });

            t.beforeEach(function () {

                Ext.ux.ajax.SimManager.init({
                    delay: 1
                });

                viewConfig = {
                    callbackWasCalled: false,
                    height: 600,
                    width: 800,
                    renderTo: document.body,
                    listeners: {
                        "cn_mail-mailmessageitemread": function (record) {
                            view.callbackWasCalled = record;
                        }
                    }
                };
            });


            t.requireOk("conjoon.dev.cn_mailsim.data.mail.PackageSim", () => {

                t.it("Should create and show the view along with default config checks", t => {
                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.expect(view.isCnMessageView).toBe(true);

                    t.expect(view instanceof Ext.Container).toBeTruthy();

                    t.expect(view.alias).toContain("widget.cn_mail-mailmessagereadermessageview");

                    t.expect(view.closable).toBe(true);

                    t.expect(view.down("cn_mail-mailmessagereaderattachmentlist") instanceof conjoon.cn_mail.view.mail.message.reader.AttachmentList).toBe(true);

                    t.expect(
                        view.getViewModel() instanceof conjoon.cn_mail.view.mail.message.reader.MessageViewModel
                    ).toBe(true);
                });


                t.it("Should throw exception if setMessageItem was called with anything other than null or valid model type", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    var exc = undefined;

                    try {
                        view.setMessageItem({empty: "object"});
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toBeDefined();

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(view.callbackWasCalled).toBe(false);
                    });

                });


                t.it("Should set data properly when setMessageItem was called with valid model", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.expect(view.callbackWasCalled).toBe(false);

                    let msgItem = createMessageItem();

                    view.setMessageItem(msgItem);

                    view.getViewModel().notify();

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        checkHtmlForValidData(t, view);
                        t.expect(view.callbackWasCalled[0].get("id")).toBe("1");
                    });
                });


                t.it("Should set everything to empty when setMessageItem was called with null", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    view.setMessageItem(createMessageItem());

                    t.expect(view.callbackWasCalled).toBe(false);

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        checkHtmlForValidData(t, view);
                        t.expect(view.callbackWasCalled[0].get("id")).toBe("1");
                        view.callbackWasCalled = false;
                        view.setMessageItem(null);
                        t.waitForMs(t.parent.TIMEOUT, () => {
                            checkHtmlDataNotPresent(t, view);
                            t.expect(view.callbackWasCalled).toBe(false);
                        });
                    });
                });


                t.it("Should show the AttachmentList if attachment available", t => {
                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.expect(view.down("cn_mail-mailmessagereaderattachmentlist").isHidden()).toBe(true);

                    view.setMessageItem(createMessageItem());

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(view.down("cn_mail-mailmessagereaderattachmentlist").isHidden()).toBe(false);
                    });

                });


                t.it("Should hide  the AttachmentList if no attachment available", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    var item = createMessageItem();

                    t.expect(view.down("cn_mail-mailmessagereaderattachmentlist").isHidden()).toBe(true);

                    item.set("hasAttachments", false);

                    view.setMessageItem(item);

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(view.down("cn_mail-mailmessagereaderattachmentlist").isHidden()).toBe(true);
                    });

                });


                t.it("Should show/hide msgIndicatorBox", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.expect(view.down("#msgIndicatorBox").isVisible()).toBe(true);
                    t.expect(view.down("#msgHeaderContainer").isVisible()).toBe(false);
                    t.expect(view.down("#msgBodyContainer").isVisible()).toBe(false);

                    view.setMessageItem(createMessageItem());

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(view.down("#msgIndicatorBox").isVisible()).toBe(false);
                        t.expect(view.down("#msgHeaderContainer").isVisible()).toBe(true);
                        t.expect(view.down("#msgBodyContainer").isVisible()).toBe(true);

                        view.setMessageItem(createMessageItem(false));

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(view.down("#msgIndicatorBox").isVisible()).toBe(true);
                            t.expect(view.down("#msgHeaderContainer").isVisible()).toBe(true);
                            t.expect(view.down("#msgBodyContainer").isVisible()).toBe(false);
                        });
                    });
                });


                t.it("loadMessageItem() - exception", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let exc;

                    try{view.loadMessageItem(1);}catch(e){exc=e;}
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toBeDefined();
                    t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");


                });

                t.it("loadMessageItem()", t => {
                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.expect(view.getTitle().toLowerCase()).toContain("loading");

                    t.expect(view.getViewModel().get("messageItem")).toBeFalsy();

                    t.isCalledNTimes("setMessageItem", view.getViewModel(), 1);

                    view.loadMessageItem(createKeyForExistingMessage(1));

                    t.expect(view.getViewModel().get("isLoading")).toBe(true);

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(view.getTitle()).toBe(view.getViewModel().get("messageItem.subject"));
                        t.expect(view.getViewModel().get("messageItem")).toBeTruthy();
                    });
                });


                t.it("updateMessageItem()", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.isCalledNTimes("updateMessageItem", view.getViewModel(), 1);

                    view.loadMessageItem(createKeyForExistingMessage(1));

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        try{
                            view.updateMessageItem({});
                        } catch (e) {
                            // intentionally left empty
                        }
                    });


                });


                t.it("check that LoadMask is properly rendered", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView");

                    view.getViewModel().set("isLoading", true);

                    t.expect(view.loadingMask).toBeFalsy();

                    view.render(document.body);

                    t.isInstanceOf(view.loadingMask, "Ext.LoadMask");

                    t.isCalledOnce("destroy", view.loadingMask);

                    view.getViewModel().set("isLoading", false);

                    view.getViewModel().notify();

                    t.expect(view.loadingMask).toBe(null);

                });


                t.it("check that LoadMask is properly removed - beforedestroy", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView");

                    view.getViewModel().set("isLoading", true);

                    t.expect(view.loadingMask).toBeFalsy();

                    view.render(document.body);

                    t.isInstanceOf(view.loadingMask, "Ext.LoadMask");

                    t.isCalledOnce("destroy", view.loadingMask);

                    view.destroy();

                    t.expect(view.loadingMask).toBe(null);

                });

                t.it("should abort pending load operations when view is destroyed", t => {

                    t.diag("upping SimManager-delay to t.TIMEOUT + 1000");
                    Ext.ux.ajax.SimManager.init({
                        delay: t.TIMEOUT + 1000
                    });

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView");

                    view.loadMessageItem(createKeyForExistingMessage(1));
                    t.expect(view.loadingItem).toBeDefined();
                    t.isCalledNTimes("abort", view.loadingItem, 1);
                    view.destroy();


                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView");
                    view.setMessageItem(createMessageItem());
                    t.isCalledNTimes("abortMessageAttachmentsLoad", view.getViewModel(), 1);
                    t.isCalledNTimes("abortMessageBodyLoad",        view.getViewModel(), 1);
                    view.destroy();


                });


                t.it("renders draft properly", t => {

                    t.diag("lowering SimManager-delay to 1");
                    Ext.ux.ajax.SimManager.init({
                        delay: 1
                    });

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    view.loadMessageItem(createKeyForExistingMessage(1));

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.getViewModel().get("messageItem").set("draft", false);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let subjectCont = Ext.dom.Query.select("span[class*=draft]", view.dom);
                            t.expect(subjectCont.length).toBe(0);

                            view.getViewModel().get("messageItem").set("draft", true);


                            t.waitForMs(t.parent.TIMEOUT, () => {
                                subjectCont = Ext.dom.Query.select("span[class*=draft]", view.dom);
                                t.expect(subjectCont.length).toBe(1);

                                t.expect(subjectCont[0].parentNode.className.toLowerCase()).toContain("subject");
                            });

                        });

                    });
                });


                t.it("fires cn_mail-messageitemload", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let CALLED = 0;

                    let rec  = getMessageItemAt(1);

                    view.on("cn_mail-messageitemload", function (messageView, item) {
                        CALLED++;
                        t.expect(messageView).toBe(view);
                        t.expect(item.getId()).toBe(createKey(rec.mailAccountId, rec.mailFolderId, rec.id).toLocalId());
                    });

                    t.expect(CALLED).toBe(0);

                    view.loadMessageItem(createKeyForExistingMessage(1));

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(CALLED).toBe(1);
                    });
                });


                t.it("getMessageItem()", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.expect(view.getMessageItem()).toBe(null);

                    view.loadMessageItem(createKeyForExistingMessage(1));

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(view.getMessageItem()).toBeTruthy();
                        t.expect(view.getMessageItem()).toBe(view.getViewModel().get("messageItem"));

                    });
                });


                t.it("confirmDialogMask mixin", function (t){
                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.expect(view.mixins["conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog"]).toBeTruthy();
                    t.expect(view.mixins["conjoon.cn_mail.view.mail.mixin.LoadingFailedDialog"]).toBeTruthy();
                    t.expect(view.canCloseAfterDelete).toBe(true);
                });


                t.it("extjs-app-webmail#61", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let vm  = view.getViewModel();

                    view.loadMessageItem(createKeyForExistingMessage(1));


                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(view.getTitle()).toBe(vm.get("messageItem.subject"));

                        vm.set("messageItem.subject", "");
                        vm.notify();
                        t.expect(view.getTitle()).toBe(vm.emptySubjectText);

                        vm.set("messageItem.subject", "foo");
                        vm.notify();
                        t.expect(view.getTitle()).toBe("foo");

                        view.setTitle("bar");
                        vm.notify();
                        t.expect(vm.get("messageItem.subject")).toBe("foo");


                    });
                });


                t.it("extjs-app-webmail#66 - setMessageItem closes loadingFailedMask if it exist", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let CALLED = 0;

                    view.loadingFailedMask = {
                        close: function () {
                            CALLED++;
                        }
                    };


                    t.expect(CALLED).toBe(0);

                    view.setMessageItem(null);

                    t.expect(CALLED).toBe(1);

                });


                t.it("extjs-app-webmail#66 - loadMessageItem failure registered", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let CALLED = 0;

                    view.onMessageItemLoadFailure = function (){
                        CALLED++;
                    };


                    t.expect(CALLED).toBe(0);

                    view.loadMessageItem(createKey(1, 2, 3));

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(CALLED).toBe(1);
                    });


                });


                t.it("extjs-app-webmail#66 - onMessageItemLoadFailure()", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let vm = view.getViewModel();

                    vm.set("isLoading", true);
                    t.expect(vm.get("isLoading")).toBe(true);

                    t.isInstanceOf(view.onMessageItemLoadFailure({}, {}), "coon.comp.component.MessageMask");

                    t.expect(vm.get("isLoading")).toBe(false);

                });


                t.it("extjs-app-webmail#66 - onMessageItemLoadFailure() no loadMask if cancelled", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let vm = view.getViewModel();

                    vm.set("isLoading", true);
                    t.expect(vm.get("isLoading")).toBe(true);

                    t.expect(
                        view.onMessageItemLoadFailure({}, {error: {status: -1}}),
                        "coon.comp.component.MessageMask"
                    ).toBeFalsy();

                    t.expect(vm.get("isLoading")).toBe(false);

                });


                t.it("extjs-app-webmail#66 - loadingFailedMask removed before view is destroyed", t => {

                    let view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let CALLED = 0;

                    view.loadingFailedMask = {
                        destroy: function () {
                            CALLED++;
                        }
                    };


                    t.expect(CALLED).toBe(0);
                    t.expect(view.loadingFailedMask).not.toBe(null);
                    view.destroy();

                    t.expect(CALLED).toBe(1);

                    t.expect(view.loadingFailedMask).toBe(null);
                    view = null;
                });


                t.it("extjs-app-webmail#87", t => {

                    let view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let ctrl = view.getController();

                    t.expect(view.hideMode).toBe("offsets");
                    t.isInstanceOf(ctrl, "conjoon.cn_mail.view.mail.message.reader.MessageViewController");

                    let CALLED = 0;

                    ctrl.onIframeLoad = function () {
                        CALLED++;
                    };

                    t.expect(CALLED).toBe(0);
                    view.down("cn_mail-mailmessagereadermessageviewiframe").fireEvent("load");
                    t.expect(CALLED).toBe(1);

                    t.expect(view.down("cn_mail-mailmessagereadermessageviewiframe").cn_iframeEl.dom.sandbox[0]).toBe("allow-same-origin");

                    view.destroy();
                    view = null;
                });


                t.it("extjs-app-webmail#88 / extjs-app-webmail#96 - sandbox", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let sandbox = view.down("cn_mail-mailmessagereadermessageviewiframe").cn_iframeEl.dom.sandbox,
                        res     = [];

                    for (let i in sandbox) {
                        if (!Object.prototype.hasOwnProperty.call(sandbox, i)) {
                            continue;
                        }
                        res.push(sandbox[i]);
                    }

                    t.expect(res.length).toBe(4);

                    let STR = "allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation";

                    if (Ext.isGecko) {
                        STR = "allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation";
                    }

                    t.expect(res).toEqual(
                        STR.split(" ")
                    );


                    view.destroy();
                    view = null;
                });


                t.it("updateContextButtonsEnabled()", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let item = createMessageItem(true);

                    view.setMessageItem(item);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        t.expect(view.getContextButtonsEnabled()).toBe(false);
                        t.expect(view.getViewModel().get("contextButtonsEnabled")).toBe(false);

                        t.expect(view.down("#btn-editdraft").isVisible()).toBe(false);
                        t.expect(view.down("#btn-deletedraft").isVisible()).toBe(false);
                        t.expect(view.down("#btn-replyall").isVisible()).toBe(false);


                        view.setContextButtonsEnabled(true);

                        t.waitForMs(t.parent.TIMEOUT, function (){

                            t.expect(view.getViewModel().get("contextButtonsEnabled")).toBe(true);

                            t.expect(view.down("#btn-replyall").isVisible()).toBe(true);

                            item.set("draft", true);

                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(view.down("#btn-editdraft").isVisible()).toBe(true);
                                t.expect(view.down("#btn-deletedraft").isVisible()).toBe(true);
                                t.expect(view.down("#btn-replyall").isVisible()).toBe(false);
                            });
                        });

                    });
                });


                t.it("Should show/hide remoteImageWarning", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let vm = view.getViewModel();

                    view.setMessageItem(createMessageItem());

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        // precondition
                        vm.set("hasImages", false);
                        vm.notify();

                        t.expect(view.down("#remoteImageWarning").isVisible()).toBe(false);

                        vm.set("iframeLoaded", false);
                        vm.set("cn_mail_iframe.imagesAllowed", false);
                        vm.set("hasImages", false);
                        vm.notify();
                        t.expect(view.down("#remoteImageWarning").isVisible()).toBe(false);

                        vm.set("iframeLoaded", true);
                        vm.set("cn_mail_iframe.imagesAllowed", false);
                        vm.set("hasImages", false);
                        vm.notify();
                        t.expect(view.down("#remoteImageWarning").isVisible()).toBe(false);

                        vm.set("iframeLoaded", true);
                        vm.set("cn_mail_iframe.imagesAllowed", false);
                        vm.set("hasImages", true);
                        vm.notify();
                        t.expect(view.down("#remoteImageWarning").isVisible()).toBe(true);

                        vm.set("iframeLoaded", true);
                        vm.set("cn_mail_iframe.imagesAllowed", true);
                        vm.set("hasImages", false);
                        vm.notify();
                        t.expect(view.down("#remoteImageWarning").isVisible()).toBe(false);

                        vm.set("iframeLoaded", false);
                        vm.set("cn_mail_iframe.imagesAllowed", false);
                        vm.set("hasImages", true);
                        vm.notify();
                        t.expect(view.down("#remoteImageWarning").isVisible()).toBe(false);

                    });
                });


                t.it("Should show/hide remoteImageWarning - click event", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    let vm = view.getViewModel();

                    view.setMessageItem(createMessageItem());


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        // precondition
                        vm.set("hasImages", true);
                        vm.notify();

                        t.expect(view.down("#remoteImageWarning").isVisible()).toBe(true);

                        t.click(view.down("#remoteImageWarning"), function () {

                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(view.down("#remoteImageWarning").isVisible()).toBe(false);
                            });
                        });

                    });
                });


                t.it("messageview iframe / reference", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", viewConfig);

                    t.expect(view.down("cn_mail-mailmessagereadermessageviewiframe").getReference()).toBe("cn_mail_iframe");
                });


                t.it("show html / text button", async (t) => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.message.reader.MessageView", {
                            height: 600,
                            width: 800,
                            renderTo: document.body
                        });

                    let vm = view.getViewModel();


                    const
                        segmentedbutton = view.down("segmentedbutton"),
                        plainbtn = view.down("#btn-showplain"),
                        htmlbtn = view.down("#btn-showhtml"),
                        messageItem = createMessageItem(true);

                    view.setMessageItem(messageItem);

                    t.waitForMs(t.parent.TIMEOUT, async () => {

                        t.expect(vm.get("messageBody.textHtml")).toBeTruthy();
                        t.expect(vm.get("messageBody.textPlain")).toBeTruthy();
                        t.expect(segmentedbutton.isVisible()).toBe(true);
                        t.expect(plainbtn.pressed).toBe(false);
                        t.expect(htmlbtn.pressed).toBe(true);
                        t.expect(view.down("cn_mail-mailmessagereadermessageviewiframe").getSrcDoc()).toContain(vm.get("messageBody.textHtml"));

                        // switch to plain by setting values / mimmicking loading
                        t.pass("switch to plain by setting values / mimmicking loading");
                        let plain = "[foo/bar]";
                        vm.set("messageBody.textPlain", plain);
                        vm.set("messageBody.textHtml", null);
                        vm.notify();
                        t.expect(plainbtn.pressed).toBe(true);
                        t.expect(htmlbtn.pressed).toBe(false);
                        t.expect(segmentedbutton.isVisible()).toBe(true);
                        t.expect(segmentedbutton.isDisabled()).toBe(true);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(view.down("cn_mail-mailmessagereadermessageviewiframe").getSrcDoc()).toContain(plain);
                            let html = "somehtml";
                            vm.set("messageBody.textPlain", plain);
                            vm.set("messageBody.textHtml", html);
                            vm.notify();

                            t.expect(segmentedbutton.isVisible()).toBe(true);
                            t.expect(htmlbtn.pressed).toBe(true);
                            t.expect(segmentedbutton.isDisabled()).toBe(false);
                            // switch by button click
                            t.click(plainbtn, function () {
                                vm.notify();
                                t.expect(view.down("cn_mail-mailmessagereadermessageviewiframe").getSrcDoc()).toContain(plain);

                                t.click(htmlbtn, function () {
                                    vm.notify();
                                    t.expect(view.down("cn_mail-mailmessagereadermessageviewiframe").getSrcDoc()).toContain(html);
                                });
                            });


                        });

                    });
                });


            });});});});
