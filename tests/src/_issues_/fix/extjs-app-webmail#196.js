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

    const helper = l8.liquify(TestHelper.get(t, window));
    await helper.setupSimlets().mockUpMailTemplates().andRun((t) => {


        const createVisitor = (cfg) => {

            const visitor = Ext.create(
                "conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor"
            );

            visitor.setMessageDraft(cfg.messageDraft);
            return visitor;
        };


        // +-----------------------------------------
        // | Tests
        // +-----------------------------------------
        t.diag("fix: attachments must re-appear in the list if DELETING fails (conjoon/extjs-app-webmail#196)");

        t.it("MessageCompoundBatchVisitor.refreshKeyForDestroy()", t => {

            const
                id = "123",
                store = Ext.create("Ext.data.Store"),
                messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                    mailAccountId: "dev",
                    mailFolderId: "inbox",
                    id
                }),
                draftAttachment = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
                    mailAccountId: "dev",
                    mailFolderId: "inbox",
                    id: "1"
                }),
                records = [draftAttachment],
                operation = {getAction: () => "destroy", getRecords: () => records},
                visitor = createVisitor({messageDraft});

            draftAttachment.commit();
            store.add(draftAttachment);
            draftAttachment.drop();

            t.expect(draftAttachment.dropped).toBe(true);
            t.expect(visitor.refreshKeyForDestroy(operation)).toBe(true);
            t.expect(draftAttachment.get("parentMessageItemId")).toBe(id);
            t.expect(draftAttachment.dropped).toBe(true);

            t.expect(store.getRemovedRecords()[0]).toBe(draftAttachment);
        });


        t.it("MessageEditorViewController.onMailMessageSaveOperationException()", t => {

            const
                messageDraft = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig",
                    Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                        localId: ["1-2-4"].join("-"),
                        id: "4",
                        mailAccountId: "1",
                        mailFolderId: "2"
                    }).data
                ),
                editor = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                    renderTo: document.body,
                    messageDraft
                }),
                store = editor.getViewModel().get("messageDraft.attachments"),
                storeSpy = t.spyOn(store, "rejectChanges");

            editor.getController().onMailMessageSaveOperationException(editor);

            const noButton = Ext.dom.Query.select("span[data-ref=noButton]", editor.el.dom)[0];

            t.click(noButton, () => {
                t.expect(storeSpy.calls.count()).toBe(1);
                editor.close();
                editor.destroy();
                [storeSpy].map(spy => spy.remove());
            });
        });
    });
});