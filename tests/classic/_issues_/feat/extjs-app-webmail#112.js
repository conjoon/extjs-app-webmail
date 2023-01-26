/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.setupSimlets().mockUpMailTemplates()
        .load("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController")
        .andRun((t) => {

            const cn_href = "#cn_href";

            let editor;

            let registerMailAccountRelatedFunctionalitySpy;


            t.beforeEach(t => {
                registerMailAccountRelatedFunctionalitySpy = t.spyOn(
                    conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController.prototype,
                    "registerMailAccountRelatedFunctionality"
                ).and.callFake(() => {});

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
                registerMailAccountRelatedFunctionalitySpy.remove();
                registerMailAccountRelatedFunctionalitySpy = null;

                editor?.getViewModel()?.getSession()?.destroy();
                editor.destroy();
                editor = null;
            });

            // +-----------------------------------------
            // | Tests
            // +-----------------------------------------
            t.diag("feat: add confirm dialog before message editor is closed (conjoon/extjs-app-webmail#112)");


            t.it("MailboxService.moveCallback()", t => {

                const
                    messageBody = {
                        commit: function () {}
                    },
                    record = {
                        entityName: "MessageDraft",
                        set: () => {},
                        getId: () => "id",
                        get: (key) => key === "seen",
                        getMessageBody: () => messageBody
                    },
                    service = conjoon.cn_mail.MailboxService.getInstance(),
                    op = {
                        getRequest: () => ({
                            record: record
                        }),
                        getResult: () => ({
                            success: true
                        })
                    },
                    commitSpy = t.spyOn(messageBody, "commit");

                t.expect(service.moveCallback(op)).toBe(true);
                t.expect(commitSpy.calls.count()).toBe(1);

                record.entityName = "MessageItem";
                t.expect(service.moveCallback(op)).toBe(true);
                t.expect(commitSpy.calls.count()).toBe(1);

            });


            t.it("MessageEditorViewModel.isDraftDirty()", t => {

                let attachmentMock = {};

                const
                    vm    = editor.getViewModel(),
                    draft = editor.getMessageDraft() ;

                t.expect(vm.isDraftDirty()).toBe(false);

                draft.set("subject", "Subject");
                t.expect(vm.isDraftDirty()).toBe(true);
                draft.commit();
                t.expect(vm.isDraftDirty()).toBe(false);

                draft.getMessageBody().set("textHtml", "text");
                t.expect(vm.isDraftDirty()).toBe(true);
                draft.getMessageBody().commit();
                t.expect(vm.isDraftDirty()).toBe(false);

                attachmentMock = draft.attachments().add(attachmentMock)[0];
                t.expect(vm.isDraftDirty()).toBe(true);
                draft.attachments().commitChanges();
                attachmentMock.phantom = false;
                t.expect(vm.isDraftDirty()).toBe(false);

                attachmentMock.set("text", "attachment");
                t.expect(vm.isDraftDirty()).toBe(true);
                attachmentMock.commit();
                t.expect(vm.isDraftDirty()).toBe(false);

                const remSpy = t.spyOn(draft.attachments(), "getRemovedRecords").and.returnValue([attachmentMock]);
                draft.attachments().remove(attachmentMock);
                t.expect(vm.isDraftDirty()).toBe(true);

                remSpy.remove();
            });


            t.it("MessageEditorViewController.onMailEditorBeforeClose() - draft clean", t => {
                let
                    dialogSpy = t.spyOn(editor, "showConfirmCloseDialog").and.callFake(() => ({})),
                    dirtySpy = t.spyOn(editor.getViewModel(), "isDraftDirty").and.returnValue(false);

                editor.close();
                t.expect(editor.destroyed).toBe(true);
                t.expect(dialogSpy.calls.count()).toBe(0);
                t.expect(dirtySpy.calls.count()).toBe(1);

                [dialogSpy, dirtySpy].map(spy => spy.remove());
            });


            t.it("MessageEditorViewController.onMailEditorBeforeClose() - draft dirty", t => {
                let redirectToSpy = t.spyOn(editor.getController(), "redirectTo").and.callFake(() => ({})),
                    dialogSpy = t.spyOn(editor, "showConfirmCloseDialog").and.callFake(() => ({})),
                    dirtySpy = t.spyOn(editor.getViewModel(), "isDraftDirty").and.returnValue(true);

                editor.close();
                t.expect(editor.destroyed).toBe(false);
                t.expect(redirectToSpy.calls.mostRecent().args).toEqual([cn_href]);
                t.expect(dialogSpy.calls.count()).toBe(1);

                [redirectToSpy, dialogSpy, dirtySpy].map(spy => spy.remove());
            });


            t.it("MessageEditorViewController.onMailEditorBeforeClose() - no messagedraft loaded", t => {
                let dialogSpy = t.spyOn(editor, "showConfirmCloseDialog").and.callFake(() => ({})),
                    dirtySpy = t.spyOn(editor.getViewModel(), "isDraftDirty");

                editor.getViewModel().set("messageDraft", null);

                editor.close();
                t.expect(dialogSpy.calls.count()).toBe(0);
                t.expect(dirtySpy.calls.count()).toBe(0);
                t.expect(editor.destroyed).toBe(true);

                [dialogSpy, dirtySpy].map(spy => spy.remove());
            });


            t.it("MessageEditor.showConfirmCloseDialog()", t => {

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


            t.it("MailDesktopViewController.seedFolders()", t => {

                const
                    ctrl = Ext.create("conjoon.cn_mail.view.mail.MailDesktopViewController"),
                    folder = Ext.create("conjoon.cn_mail.model.mail.folder.MailFolder"),
                    messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft"),
                    messageDraftSpy = t.spyOn(messageDraft, "set"),
                    defaultDraftSpy = t.spyOn(ctrl, "getDefaultDraftFolderForComposing").and.callFake(() => folder);


                Object.assign(ctrl, {
                    starvingEditors: ["itemid"],
                    view: {
                        down: () => ({
                            editMode: "CREATE",
                            getViewModel: () => ({
                                hasPendingCopyRequest: () => false,
                                get: () => messageDraft
                            })
                        })
                    }
                });


                ctrl.seedFolders();
                t.expect(messageDraftSpy.calls.count()).toBe(1);
                t.expect(Object.keys(messageDraftSpy.calls.all()[0].args[0])).toEqual(["mailAccountId", "mailFolderId"]);
                t.expect(messageDraft.dirty).toBe(false);

                [messageDraftSpy, defaultDraftSpy].map(spy => spy.remove());
            });


        });});
