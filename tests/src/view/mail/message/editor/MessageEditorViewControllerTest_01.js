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
        .load("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController")
        .andRun((t) => {

            var view,
                controller,
                createOperation = function () {
                    return Ext.create("Ext.data.operation.Create", {
                        entityType: {
                            entityName: "TESTENTITY"
                        }
                    });
                },
                createFile = function (type) {

                    return new File([{
                        name: "foo.png",
                        type: type ? type : "image/jpg"
                    }], "foo.png");
                },
                createEditorForController = function (controller, editMode, messageDraft) {

                    if (!messageDraft) {
                        editMode = editMode ? editMode : "CREATE";

                        switch (editMode) {
                        case "CREATE":
                            messageDraft = Ext.create(
                                "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                                    mailAccountId: "dev_sys_conjoon_org",
                                    mailFolderId: "INBOX"
                                });
                            break;
                        }
                    }


                    let store = Ext.create(
                        "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore"
                    );


                    // conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel

                    let ed = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                            controller: controller,
                            messageDraft: messageDraft
                        });

                    let vm = ed.getViewModel();

                    vm.set("cn_mail_mailfoldertreestore", store);
                    store.load();

                    return ed;
                };

            let registerMailAccountRelatedFunctionalitySpy;

            t.beforeEach(function () {
                registerMailAccountRelatedFunctionalitySpy = t.spyOn(
                    conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController.prototype,
                    "registerMailAccountRelatedFunctionality"
                ).and.callFake(() => {});
            });

            t.afterEach(function () {
                registerMailAccountRelatedFunctionalitySpy.remove();
                registerMailAccountRelatedFunctionalitySpy = null;

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


                t.it("Should make sure setting up controller works", t => {

                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });


                    t.expect(conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController.required.requestConfigurator).toBe(
                        "coon.core.data.request.Configurator"
                    );

                    t.expect(controller instanceof Ext.app.ViewController).toBe(true);

                    t.expect(controller.alias).toContain("controller.cn_mail-mailmessageeditorviewcontroller");
                });


                //remove/add listener where removed for conjoon/extjs-app-webmail/1
                t.it("Should register and catch the events properly", t => {

                    // the itemremove event fires directly when the view was created.
                    // this might be related to the use of MVVM, where the store
                    // of the AttachmentList gets replaced when the binding
                    // are initially pocessed? Thus, we set itemremove flag to -1 here
                    var itemremove           = -1,
                        itemadd              = 0,
                        formFileButtonChange = 0,
                        showCcBccButtonClick = 0,
                        sendButtonClick      = 0,
                        saveButtonClick      = 0;

                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });

                    controller.onAttachmentListItemRemove = function () {itemremove++;};
                    controller.onAttachmentListItemAdd = function () {itemadd++;};
                    controller.onFormFileButtonChange = function () {formFileButtonChange++;};
                    controller.onShowCcBccButtonClick = function () {showCcBccButtonClick++;};
                    controller.onSendButtonClick = function () {sendButtonClick++;};
                    controller.onSaveButtonClick = function () {saveButtonClick++;};

                    view = createEditorForController(controller, "CREATE");

                    t.isCalledNTimes("onMailMessageEditorBeforeDestroy", controller, 1);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        t.expect(itemremove).toBe(-1);
                        t.expect(itemadd).toBe(0);
                        t.expect(formFileButtonChange).toBe(0);
                        t.expect(showCcBccButtonClick).toBe(0);
                        t.expect(sendButtonClick).toBe(0);
                        t.expect(saveButtonClick).toBe(0);

                        view.down("cn_mail-mailmessageeditorattachmentlist").fireEvent("itemremove");
                        view.down("cn_mail-mailmessageeditorattachmentlist").fireEvent("itemadd");
                        view.down("cn_comp-formfieldfilebutton").fireEvent("change");
                        view.down("#showCcBccButton").fireEvent("click");
                        view.down("#sendButton").fireEvent("click");
                        view.down("#saveButton").fireEvent("click");

                        t.expect(itemremove).toBe(-1);
                        t.expect(itemadd).toBe(0);
                        t.expect(formFileButtonChange).toBe(1);
                        t.expect(showCcBccButtonClick).toBe(1);
                        t.expect(sendButtonClick).toBe(1);
                        t.expect(saveButtonClick).toBe(1);

                        // destroy the view here so it's part of the test and
                        // onMailMessageEditorBeforeDestroy can be observed
                        view.destroy();
                        view = null;
                    });


                });

                //onAttachmentListItemRemove() removed for conjoon/extjs-app-webmail/1
                t.it("Should make sure that onAttachmentListItemRemove works properly", t => {

                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });

                    t.expect(controller.onAttachmentListItemRemove).toBeUndefined();
                });

                //onAttachmentListItemAdd() removed for conjoon/extjs-app-webmail/1
                t.it("Should make sure that onAttachmentListItemAdd works properly", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });

                    t.expect(controller.onAttachmentListItemAdd).toBeUndefined();
                });


                t.it("Should make sure that onFormFileButtonChange works properly", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            var attachmentList = view.down("cn_mail-mailmessageeditorattachmentlist");
                            t.expect(attachmentList.getStore().getRange().length).toBe(0);
                            controller.onFormFileButtonChange(null, null, null, [createFile()]);
                            t.expect(attachmentList.getStore().getRange().length).toBe(1);
                        });
                    });
                });


                t.it("Should make sure that onShowCcBccButtonClick works properly", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(view.down("#ccField").isHidden()).toBe(true);
                            t.expect(view.down("#bccField").isHidden()).toBe(true);
                            controller.onShowCcBccButtonClick();
                            t.expect(view.down("#ccField").isHidden()).toBe(false);
                            t.expect(view.down("#bccField").isHidden()).toBe(false);
                            controller.onShowCcBccButtonClick();
                            t.expect(view.down("#ccField").isHidden()).toBe(true);
                            t.expect(view.down("#bccField").isHidden()).toBe(true);

                        });
                    });
                });


                //conjoon/extjs-app-webmail/1
                t.it("Should test properly changes for conjoon/extjs-app-webmail/1", function (t){
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        var wrap  = view.down("#attachmentListWrap").el,
                            event = {
                                preventDefault: Ext.emptyFn,
                                event: {}
                            },
                            expectCountAndHover = function (t, count, hover) {
                                if (hover) {
                                    t.expect(wrap.dom.className).toContain("hover");
                                } else {
                                    t.expect(wrap.dom.className).not.toContain("hover");
                                }

                                t.expect(controller.ddListener.dragEnterCount).toBe(count);
                            };

                        // dragenter, dragleave, dragend
                        t.expect(controller.ddListener.dragEnterCount).toBe(0);
                        wrap.fireEvent("dragenter", event);
                        expectCountAndHover(t, 1, true);
                        wrap.fireEvent("dragenter", event);
                        expectCountAndHover(t, 2, true);
                        wrap.fireEvent("dragenter", event);
                        expectCountAndHover(t, 3, true);
                        wrap.fireEvent("dragenter", event);
                        expectCountAndHover(t, 4, true);
                        wrap.fireEvent("dragleave", event);
                        expectCountAndHover(t, 3, true);
                        wrap.fireEvent("dragleave", event);
                        expectCountAndHover(t, 2, true);
                        wrap.fireEvent("dragend", event);
                        expectCountAndHover(t, 0, false);

                        // registerAttachmentListWrapEnter
                        controller.ddListener.registerAttachmentListWrapEnter(true);
                        expectCountAndHover(t, 1, true);
                        controller.dragEnterCount = 8970;
                        controller.ddListener.registerAttachmentListWrapEnter(false, true);
                        expectCountAndHover(t, 0, false);
                        controller.dragEnterCount = -8970;
                        wrap.fireEvent("drop", event);
                        expectCountAndHover(t, 0, false);

                        controller.dragEnterCount = 0;
                        controller.ddListener.onAttachmentListWrapDragEnter(event);
                        expectCountAndHover(t, 1, true);
                        controller.ddListener.onAttachmentListWrapDragLeave(event);
                        expectCountAndHover(t, 0, false);
                        controller.dragEnterCount = 9890;
                        controller.ddListener.onAttachmentListWrapDragEnd(event);
                        expectCountAndHover(t, 0, false);
                        controller.dragEnterCount = 9890;
                        controller.ddListener.onAttachmentListWrapDrop(event);
                        expectCountAndHover(t, 0, false);

                        // wait for viewmodel bindings
                        t.waitForMs(t.parent.TIMEOUT, () => {
                            var attachmentList = view.down("cn_mail-mailmessageeditorattachmentlist");
                            t.expect(attachmentList.getStore().getRange().length).toBe(0);
                            controller.addAttachmentsFromFileList([createFile()]);
                            t.expect(attachmentList.getStore().getRange().length).toBe(1);

                            attachmentList.getStore().removeAll();

                            event.event.dataTransfer = {files: [createFile()]};
                            t.expect(attachmentList.getStore().getRange().length).toBe(0);
                            controller.ddListener.onAttachmentListWrapDrop(event);
                            t.expect(attachmentList.getStore().getRange().length).toBe(1);
                        });

                    });

                });


                t.it("endBusyState()", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        view.getViewModel().set("isSaving",  true);
                        view.getViewModel().set("isSending", true);
                        view.setBusy({msg: "foo"});

                        t.expect(view.busyMask.isHidden()).toBe(false);
                        controller.endBusyState("saving");

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(view.getViewModel().get("isSaving")).toBe(false);
                            t.expect(view.getViewModel().get("isSending")).toBe(true);

                            t.expect(view.busyMask.isHidden()).toBe(true);

                            view.setBusy({msg: "foo"});
                            controller.endBusyState("sending");

                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(view.getViewModel().get("isSending")).toBe(false);
                                t.expect(view.busyMask.isHidden()).toBe(true);

                                var exc;
                                try{
                                    controller.endBusyState();
                                } catch (e) {
                                    exc = e;
                                }
                                t.expect(exc).toBeDefined();
                                t.expect(exc.msg).toContain("Unknown");

                            });
                        });});
                });


                t.it("setViewBusy()", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        t.isCalledNTimes("setBusy", view, 2);
                        t.expect(view.busyMask).toBeFalsy();
                        controller.setViewBusy(createOperation());

                        t.expect(view.busyMask).toBeTruthy();
                        t.expect(view.busyMask.isHidden()).toBe(false);
                        t.expect(view.busyMask.waitTimer).toBeTruthy();

                        controller.setViewBusy(createOperation(), 1);
                        t.expect(view.busyMask.waitTimer).toBeFalsy();

                    });


                });


                t.it("onMailMessageEditorBeforeDestroy()", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);


                        // dummy
                        view.setBusy({msg: "foo"});

                        t.expect(controller.deferTimers).toBeDefined();
                        controller.deferTimers["test"] = 456;
                        t.isCalledNTimes("onMailMessageEditorBeforeDestroy", controller, 1);

                        t.expect(view.busyMask).toBeDefined();
                        t.isCalledNTimes("destroy", view.busyMask, 1);

                        t.expect(controller.ddListener).toBeDefined();
                        t.isCalledNTimes("destroy", controller.ddListener, 1);


                        t.expect(view.addressTip).toBeTruthy();
                        const addressTipSpy = t.spyOn(view.addressTip, "destroy");

                        controller.onMailMessageEditorBeforeDestroy();

                        t.expect(addressTipSpy.calls.count()).toBe(1);
                        t.expect(view.addressTip).toBeFalsy();

                        addressTipSpy.remove();

                        t.expect(controller.deferTimers["test"]).toBeUndefined();
                    });


                });


                // +----------------------------------------------------------------------------
                // | SAVING
                // +----------------------------------------------------------------------------
                t.it("Should make sure that onSaveButtonClick works properly", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            view.down("#subjectField").setValue("test");
                            view.down("cn_mail-mailmessageeditorhtmleditor").setValue("Test");

                            t.isCalledNTimes("onMailMessageBeforeSave",             controller, 1);
                            t.isCalledNTimes("onMailMessageSaveOperationComplete",  controller, 0);
                            t.isCalledNTimes("onMailMessageSaveComplete",           controller, 1);
                            t.isCalledNTimes("onMailMessageSaveOperationException", controller, 0);

                            controller.onSaveButtonClick();

                            t.waitForMs(t.parent.TIMEOUT, () => {
                            // give enough time for the tests to finish
                            });
                        });

                    });

                });


                t.it("Should make sure that onSaveButtonClick works properly with exception", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            view.down("#subjectField").setValue("TESTFAIL");
                            view.down("cn_mail-mailmessageeditorhtmleditor").setValue("Test");

                            t.isCalledNTimes("onMailMessageBeforeSave",            controller, 1);
                            t.isCalledNTimes("onMailMessageSaveOperationComplete", controller, 1);
                            t.isCalledNTimes("onMailMessageSaveComplete",          controller, 0);
                            t.isCalledNTimes("onMailMessageSaveOperationException", controller, 1);

                            controller.onSaveButtonClick();

                            t.waitForMs(t.parent.TIMEOUT, () => {
                            // give enough time for the tests to finish
                            });
                        });

                    });
                });


                t.it("onMailMessageSaveOperationComplete()", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        t.isCalledNTimes("setViewBusy", controller, 1);
                        controller.onMailMessageSaveOperationComplete(
                            view, view.getViewModel().get("messageDraft"), createOperation());

                    });

                });


                t.it("onMailMessageSaveOperationException()", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        var batch = {retry: function () {}};

                        view.getViewModel().set("messageDraft.subject", "TEST");
                        view.getViewModel().set("isSaving", true);
                        view.getViewModel().notify();


                        t.isCalledNTimes("showMailMessageSaveFailedNotice", view, 2);

                        controller.onMailMessageSaveOperationException(
                            view, view.getViewModel().get("messageDraft"), createOperation(), false, false, batch);

                        var noButton = Ext.dom.Query.select("span[data-ref=noButton]", view.el.dom);
                        t.click(noButton[0], function () {

                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(view.getViewModel().get("isSaving")).toBe(false);

                                view.getViewModel().set("isSaving", true);

                                controller.onMailMessageSaveOperationException(
                                    view, view.getViewModel().get("messageDraft"), createOperation(), false, false, batch);

                                t.isCalledOnce("retry", batch);

                                var yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);
                                t.click(yesButton[0], function () {
                                    t.waitForMs(t.parent.TIMEOUT, () => {
                                        t.expect(view.getViewModel().get("isSaving")).toBe(true);
                                    });
                                });

                            });

                        });


                    });


                });


                t.it("onMailMessageBeforeSave()", t => {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });
                    view = createEditorForController(controller);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.render(document.body);

                        t.isCalledNTimes("setBusy", view, 1);
                        view.getViewModel().get("messageDraft").set("subject", "foo");
                        controller.onMailMessageBeforeSave(
                            view, view.getViewModel().get("messageDraft"), false, false);
                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(view.getViewModel().get("isSaving")).toBe(true);
                        });

                    });

                });


            });});});
