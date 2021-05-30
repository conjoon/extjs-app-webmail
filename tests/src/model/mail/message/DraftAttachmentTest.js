/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe("conjoon.cn_mail.model.mail.message.DraftAttachmentTest", function (t) {

    var model;

    t.beforeEach(function () {
        model = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
            localId: 1,
            mailFolderId: 4,
            mailAccountId: 5,
            id: 1,
            parentMessageItemId: 1
        });
    });

    t.afterEach(function () {
        model = null;
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("conjoon.dev.cn_mailsim.data.mail.PackageSim", function () {
        t.requireOk("conjoon.cn_mail.data.mail.message.session.MessageDraftSession", function () {


            Ext.ux.ajax.SimManager.init({
                delay: 1
            });

            t.it("Should create instance", function (t) {

                t.isInstanceOf(model, "conjoon.cn_mail.model.mail.message.MessageItemChildModel");


                t.expect(model.compoundKeyFields).toEqual({
                    MessageDraft: {
                        "mailAccountId": "mailAccountId",
                        "mailFolderId": "mailFolderId",
                        "parentMessageItemId": "id"
                    }});
            });

            t.it("Test Entity Name", function (t) {
                t.expect(
                    model.entityName
                ).toBe("DraftAttachment");
            });

            t.it("Test Record Validity", function (t) {
                t.expect(model.isValid()).toBe(true);
            });


            t.it("Test mailFolderId", function (t) {
                t.expect(model.getField("mailFolderId")).toBeTruthy();
                t.expect(model.getField("mailFolderId").critical).toBe(true);
            });

            t.it("Test mailAccountId", function (t) {
                t.expect(model.getField("mailAccountId")).toBeTruthy();
                t.expect(model.getField("mailAccountId").critical).toBe(true);
            });

            t.it("localId", function (t) {
                t.expect(model.getIdProperty()).toBe("localId");
            });

            t.it("id", function (t) {
                t.expect(model.getField("id")).toBeTruthy();
                t.expect(model.getField("id").critical).toBe(true);
            });

            t.it("parentMessageItemId", function (t) {
                t.expect(model.getField("parentMessageItemId")).toBeTruthy();
                t.isInstanceOf(model.getField("parentMessageItemId"), "coon.core.data.field.CompoundKeyField");
            });

            t.it("messageItemId", function (t) {
                t.expect(model.getField("messageItemId").persist).toBe(false);
            });


            t.it("getAssociatedCompoundKeyedData", function (t) {
                let model = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment");

                model.getMessageItem = undefined;
                t.expect(model.getAssociatedCompoundKeyedData()).toEqual([]);

                model.getMessageItem = function (){return 1;};
                t.expect(model.getAssociatedCompoundKeyedData()).toEqual([1]);
                model.getMessageItem = function (){return null;};
                t.expect(model.getAssociatedCompoundKeyedData()).toEqual([]);
            });


            t.it("Test MessageDraft add attachment - compound key updated", function (t) {

                let draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                    subject: "test",
                    mailFolderId: 1,
                    mailAccountId: 3
                });

                let attachment1 = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment"),
                    attachment2 = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment");

                t.expect(draft.attachments().getRange().length).toBe(0);


                draft.attachments().add(attachment1);
                t.expect(attachment1.get("mailFolderId")).toBe("1");
                t.expect(attachment1.get("mailAccountId")).toBe("3");
                t.expect(attachment1.get("parentMessageItemId")).toBeFalsy();

                draft.attachments().add(attachment2);
                t.expect(attachment2.get("mailFolderId")).toBe("1");
                t.expect(attachment2.get("mailAccountId")).toBe("3");
                t.expect(attachment2.get("parentMessageItemId")).toBeFalsy();

                draft.set("mailFolderId", "foo");
                t.expect(attachment1.get("mailFolderId")).toBe("foo");
                t.expect(attachment2.get("mailFolderId")).toBe("foo");

                draft.set("mailAccountId", "bar");
                t.expect(attachment1.get("mailAccountId")).toBe("bar");
                t.expect(attachment2.get("mailAccountId")).toBe("bar");

                draft.set("id", "foobar");
                t.expect(attachment1.get("parentMessageItemId")).toBe("foobar");
                t.expect(attachment2.get("parentMessageItemId")).toBe("foobar");

            });

            t.it("proxy", function (t) {

                t.isInstanceOf(model.getProxy(), "conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy");

            });

            t.it("Test MessageDraft save with MessageBody and Attachments", function (t) {

                var session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

                var draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                    subject: "test",
                    mailFolderId: "INBOX.Drafts",
                    mailAccountId: "dev_sys_conjoon_org"
                });

                session.setMessageDraft(draft);

                // consider batchvisitor and an issue with associations and
                // session - see  MessageEditorViewModel, where we are doing the same
                var messageBody = session.createRecord("MessageBody", {
                    mailFolderId: "INBOX.Drafts",
                    mailAccountId: "dev_sys_conjoon_org"
                });
                draft.setMessageBody(messageBody);


                let store = draft.attachments(),
                    att   = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment");

                store.add(att);

                let batch = session.getSaveBatch();

                t.expect(att.phantom).toBe(true);
                t.expect(draft.get("id")).toBeUndefined();

                batch.start();

                t.waitForMs(1000, function () {

                    t.expect(att.phantom).toBe(false);
                    t.expect(att.get("mailAccountId")).toBe("dev_sys_conjoon_org");
                    t.expect(att.get("mailFolderId")).toBe("INBOX.Drafts");
                    t.expect(draft.get("id")).toBeDefined();
                    t.expect(draft.get("id")).toBe(draft.getMessageBody().get("id"));
                    t.expect(att.get("parentMessageItemId")).toBe(draft.get("id"));

                    var oldId = draft.get("id");

                    draft.set("subject", "foo");

                    session.getSaveBatch().start();

                    t.waitForMs(1000, function () {

                        t.expect(draft.get("id")).not.toBe(oldId);
                        t.expect(draft.get("id")).toBe(draft.getMessageBody().get("id"));
                        t.expect(att.get("parentMessageItemId")).toBe(draft.get("id"));
                        oldId = draft.get("id");
                        messageBody.set("textHtml", "foobar");

                        session.getSaveBatch().start();

                        t.waitForMs(1000, function () {

                            t.expect(draft.get("id")).not.toBe(oldId);
                            t.expect(draft.get("id")).toBe(draft.getMessageBody().get("id"));
                            t.expect(att.get("parentMessageItemId")).toBe(draft.get("id"));

                        });

                    });


                });

            });


            t.it("Test MessageDraft attachment delete with MessageBody", function (t) {

                var session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

                var draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                    subject: "test",
                    mailFolderId: "INBOX.Drafts",
                    mailAccountId: "dev_sys_conjoon_org"
                });

                session.setMessageDraft(draft);

                // consider batchvisitor and an issue with associations and
                // session - see  MessageEditorViewModel, where we are doing the same
                var messageBody = session.createRecord("MessageBody", {
                    mailFolderId: "INBOX.Drafts",
                    mailAccountId: "dev_sys_conjoon_org"
                });
                draft.setMessageBody(messageBody);


                let store = draft.attachments(),
                    att   = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment"),
                    att2  = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment");

                store.add(att);
                store.add(att2);

                let batch = session.getSaveBatch();

                t.expect(att.phantom).toBe(true);
                t.expect(draft.get("id")).toBeUndefined();

                batch.start();

                t.waitForMs(1000, function () {

                    t.expect(att.phantom).toBe(false);
                    t.expect(att.get("mailAccountId")).toBe("dev_sys_conjoon_org");
                    t.expect(att.get("mailFolderId")).toBe("INBOX.Drafts");
                    t.expect(draft.get("id")).toBeDefined();
                    t.expect(draft.get("id")).toBe(draft.getMessageBody().get("id"));
                    t.expect(att.get("parentMessageItemId")).toBe(draft.get("id"));

                    t.expect(att.get("parentMessageItemId")).toBe(att2.get("parentMessageItemId"));

                    var oldId = draft.get("id");

                    draft.attachments().remove(att);

                    let btch = session.getSaveBatch();
                    btch.start();

                    t.waitForMs(1000, function () {

                        t.expect(draft.get("id")).not.toBe(oldId);
                        t.expect(draft.get("id")).toBe(draft.getMessageBody().get("id"));
                        t.expect(draft.attachments().getRange().length).toBe(1);
                        t.expect(draft.attachments().getRange()[0].get("parentMessageItemId")).toBe(draft.get("id"));

                        oldId = draft.get("id");
                        store.remove(att2);
                        draft.set("subject", "test1234");

                        btch = session.getSaveBatch();
                        btch.start();

                        t.waitForMs(1000, function () {

                            t.expect(draft.get("id")).not.toBe(oldId);
                            t.expect(draft.get("id")).toBe(draft.getMessageBody().get("id"));
                            t.expect(draft.attachments().getRange().length).toBe(0);


                        });

                    });


                });

            });

        });

    });});
