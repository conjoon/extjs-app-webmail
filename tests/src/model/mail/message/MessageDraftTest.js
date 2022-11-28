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

    const helper = l8.liquify(TestHelper.get(t, window));
    await helper.registerIoC().setupSimlets().mockUpMailTemplates().andRun((t) => {
        var model;

        t.beforeEach(function () {

            model = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                id: 1
            });

        });

        t.afterEach(function () {
            model = null;
        });


        // +----------------------------------------------------------------------------
        // |                    =~. Unit Tests .~=
        // +----------------------------------------------------------------------------

        t.requireOk("conjoon.cn_mail.data.mail.BaseSchema", () => {
            t.requireOk("conjoon.cn_mail.data.mail.message.session.MessageDraftSession", () => {

                Ext.ux.ajax.SimManager.init({
                    delay: 1
                });

                t.it("Should create instance", t => {
                    t.expect(model instanceof conjoon.cn_mail.model.mail.message.AbstractMessageItem).toBeTruthy();
                });

                t.it("Test for proper proxy", t => {
                    t.isInstanceOf(model.getProxy(), "conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy");
                });

                t.it("Test Entity Name", t => {
                    t.expect(
                        model.entityName
                    ).toBe("MessageDraft");
                });

                t.it("compoundKeyFields", t => {
                    t.expect(
                        model.compoundKeyFields
                    ).toEqual({
                        MessageBody: ["mailAccountId", "mailFolderId", "id"],
                        DraftAttachment: {
                            "mailAccountId": "mailAccountId",
                            "mailFolderId": "mailFolderId",
                            "id": "parentMessageItemId"
                        }
                    });
                });


                t.it("processRecordAssociation() - not called", t => {

                    t.isntCalled("compareAndApplyCompoundKeys", model);

                    model.processRecordAssociation(Ext.create("Ext.data.Model"));

                });


                t.it("processRecordAssociation() - called", t => {

                    t.isCalledOnce("compareAndApplyCompoundKeys", model);

                    model.processRecordAssociation(Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment"));

                });


                t.it("Test Record Validity", t => {
                    // messageBody is missing
                    t.expect(model.isValid()).toBe(false);

                    for (var i = 0, vs = ["to", "cc", "bcc"], len = vs.length; i < len; i++) {
                        var vtors = model.getField(vs[i])._validators;
                        t.expect(vtors.length).toBe(1);
                        t.expect(vtors[0] instanceof coon.core.data.validator.EmailAddressCollection).toBe(true);
                        t.expect(vtors[0].getAllowEmpty()).toBe(true);
                    }

                });


                t.it("Test addresses inline", t => {

                    var model = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft",{
                        id: "1",
                        to: [{
                            name: "Firstname Lastname",
                            address: "name@domain.tld"
                        }, {
                            name: "Firstname 1 Lastname 1",
                            address: "name@domain.tld"
                        }]
                    });
                    t.expect(model.get("to")).toEqual([{
                        name: "Firstname Lastname",
                        address: "name@domain.tld"
                    }, {
                        name: "Firstname 1 Lastname 1",
                        address: "name@domain.tld"
                    }]);
                });


                t.it("Test addresses load", t => {

                    let messageItem = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(0);

                    var rec = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                        conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                            messageItem.mailAccountId,
                            messageItem.mailFolderId,
                            messageItem.id
                        )
                    );

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(rec.get("to").length).toBeTruthy();
                        t.expect(rec.get("to")[0].name).toBeDefined();
                        t.expect(rec.get("to")[0].address).toBeDefined();
                    });

                });


                t.it("Test MessageBody load", t => {

                    let messageItem = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(0);

                    var rec = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                        conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                            messageItem.mailAccountId,
                            messageItem.mailFolderId,
                            messageItem.id
                        )
                    );


                    t.waitForMs(t.parent.TIMEOUT, () => {
                        var mb = rec.loadMessageBody();

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(mb.get("textHtml")).toBeTruthy();
                            t.expect(mb.get("mailFolderId")).toBe(rec.get("mailFolderId"));
                            t.expect(mb.get("mailAccountId")).toBe(rec.get("mailAccountId"));
                            t.expect(mb.get("id")).toBe(rec.get("id"));

                            t.expect(mb.getId()).toContain(rec.getId());
                        });
                    });

                });


                t.it("Test attachments load", t => {

                    let messageItem = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(0);

                    var rec = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                        conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                            messageItem.mailAccountId,
                            messageItem.mailFolderId,
                            messageItem.id
                        )
                    );

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(typeof rec.attachments).toBe("function");
                        t.isInstanceOf(rec.attachments(), "conjoon.cn_mail.store.mail.message.MessageAttachmentStore");

                        t.expect(rec.attachments().getRange().length).toBe(0);
                        t.isInstanceOf(rec.loadAttachments(), "Ext.data.Store");
                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(rec.attachments().isLoaded()).toBe(true);
                        });
                    });

                });

                t.it("Test MessageDraft save", t => {

                    var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        mailFolderId: 1,
                        mailAccountId: 3
                    });


                    t.expect(rec.getId()).toContain("MessageDraft");
                    t.expect(rec.get("id")).toBeFalsy();

                    rec.save();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let key = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(rec);

                        t.expect(rec.get("id")).not.toBeFalsy();

                        t.expect(rec.getId()).toBe(key.toLocalId());
                    });

                });


                t.it("Test MessageDraft save MessageBody with session", t => {

                    var session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

                    var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        mailFolderId: 1,
                        mailAccountId: 3
                    });

                    session.setMessageDraft(rec);

                    t.expect(rec.isValid()).toBe(false);

                    rec.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                        mailFolderId: 1,
                        mailAccountId: 3
                    }));

                    t.expect(rec.isValid()).toBe(false);

                    var rec2 = rec.getMessageBody();

                    session.adopt(rec);

                    rec2.set("textHtml", "Hallo Welt");

                    var saveBatch = session.getSaveBatch();

                    saveBatch.on("operationcomplete", function () {

                    });

                    saveBatch.start();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let msgKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(rec);
                        let bodyKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(rec2);

                        t.expect(rec2.getId()).toBe(bodyKey.toLocalId());
                        t.expect(rec.getId()).toBe(msgKey.toLocalId());
                        t.expect(rec2.get("id")).toBe(rec.get("id"));

                        t.expect(rec.isValid()).toBe(true);
                    });

                });


                t.it("field - replyTo", t => {

                    var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        from: "from@domain.tld",
                        replyTo: "replyTo@domain.tld"
                    });

                    t.expect(conjoon.cn_mail.model.mail.message.MessageDraft.getField("replyTo").persist).toBe(true);

                    t.expect(rec.get("from").address).toBe("from@domain.tld");
                    t.expect(rec.get("replyTo").address).toBe("replyTo@domain.tld");
                });


                t.it("field - draft", t => {

                    var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");

                    t.expect(rec.get("draft")).toBe(true);
                });


                t.it("field - seen", t => {

                    var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");

                    t.expect(rec.get("seen")).toBe(true);
                });

                t.it("field - answered", t => {

                    var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");

                    t.expect(rec.get("answered")).toBe(false);
                });

                t.it("field - flagged", t => {

                    var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");

                    t.expect(rec.get("flagged")).toBe(false);
                });

                t.it("field - recent", t => {

                    var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");
                    t.expect(rec.get("recent")).toBe(false);

                    t.expect(
                        conjoon.cn_mail.model.mail.message.MessageDraft.getField("recent").getPersist()
                    ).toBe(false);
                });


                t.it("Test MessageDraft save MessageBody updated mailFolderId", t => {

                    var session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession"),
                        newFolder = "INBOX.TRASH";

                    var draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        mailFolderId: 1,
                        mailAccountId: 3
                    });

                    session.setMessageDraft(draft);

                    draft.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                        mailAccountId: 3
                    }));

                    var body = draft.getMessageBody();


                    draft.set("mailFolderId", newFolder);
                    t.expect(draft.get("mailFolderId")).toBe(newFolder);
                    t.expect(draft.get("mailFolderId")).toBe(body.get("mailFolderId"));

                    session.adopt(draft);

                    t.expect(body.getId()).toContain("MessageBody");

                    var saveBatch = session.getSaveBatch();

                    saveBatch.start();


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let msgKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(draft);
                        let bodyKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(body);

                        t.expect(body.getId()).toBe(bodyKey.toLocalId());
                        t.expect(draft.getId()).toBe(msgKey.toLocalId());

                        t.expect(body.get("id")).toBe(draft.get("id"));
                        t.expect(body.get("mailFolderId")).toBe(newFolder);
                        t.expect(body.get("mailAccountId")).toBe(draft.get("mailAccountId"));
                        t.expect(body.get("mailFolderId")).toBe(draft.get("mailFolderId"));
                    });

                });


                t.it("Test MessageDraft save MessageDraft updated id", t => {

                    var session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

                    var draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        mailFolderId: 1,
                        mailAccountId: 3
                    });

                    session.setMessageDraft(draft);

                    draft.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                        mailFolderId: 1,
                        mailAccountId: 3
                    }));

                    var body = draft.getMessageBody();

                    session.adopt(draft);

                    t.expect(body.getId()).toContain("MessageBody");

                    var saveBatch = session.getSaveBatch();

                    saveBatch.start();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let msgKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(draft);
                        let bodyKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(body);

                        t.expect(body.getId()).toBe(bodyKey.toLocalId());
                        t.expect(draft.getId()).toBe(msgKey.toLocalId());

                        t.expect(body.get("id")).toBe(draft.get("id"));
                    });

                });


                t.it("Test MessageDraft save MessageDraft updated mailFolderId for Body", t => {

                    var session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession"),
                        newFolder = "INBOX.TRASH";

                    var draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        mailFolderId: 1,
                        mailAccountId: 3
                    });

                    session.setMessageDraft(draft);

                    draft.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                        mailFolderId: 1,
                        mailAccountId: 3
                    }));

                    var body = draft.getMessageBody();

                    session.adopt(draft);

                    t.expect(body.getId()).toContain("MessageBody");


                    body.set("mailFolderId", newFolder);

                    var saveBatch = session.getSaveBatch();

                    saveBatch.start();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let msgKey  = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(draft);
                        let bodyKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(body);

                        t.expect(body.getId()).toBe(bodyKey.toLocalId());
                        t.expect(draft.getId()).toBe(msgKey.toLocalId());

                        t.expect(body.get("id")).toBe(draft.get("id"));
                        t.expect(body.get("mailFolderId")).toBe(newFolder);
                        t.expect(body.get("mailFolderId")).toBe(draft.get("mailFolderId"));
                    });

                });


                t.it("save() - phantom", t => {
                    let messageItem = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(0);

                    delete messageItem.localId;

                    let draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", messageItem);

                    t.expect(draft.phantom).toBe(true);

                    draft.set("mailFolderId", "foo");

                    let ret = draft.save();


                    t.expect(ret.request.getUrl()).toContain("MailFolders/foo/");

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        t.expect(draft.get("mailFolderId")).toBe("foo");
                        t.expect(draft.get("id")).toBe(messageItem.id);
                        t.expect(draft.get("mailAccountId")).toBe(messageItem.mailAccountId);
                        t.expect(draft.phantom).toBe(false);
                    });
                });


                t.it("save() - consider modified", t => {
                    let messageItem = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(0);

                    var draft = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                        conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                            messageItem.mailAccountId,
                            messageItem.mailFolderId,
                            messageItem.id
                        )
                    );

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        t.expect(draft.phantom).toBe(false);

                        draft.set("mailFolderId", "foo");

                        let ret = draft.save();

                        t.expect(ret.request.getJsonData().data.mailFolderId).toBe("foo");
                        t.expect(ret.request.getUrl()).toContain("MailFolders/" + encodeURIComponent(messageItem.mailFolderId) + "/");

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(draft.get("mailFolderId")).toBe("foo");
                            t.expect(draft.get("id")).toBe(messageItem.id);
                            t.expect(draft.get("mailAccountId")).toBe(messageItem.mailAccountId);
                            t.expect(draft.phantom).toBe(false);
                        });
                    });
                });


                t.it("extjs-app-webmail#73 - 1", t => {

                    let messageItem,
                        session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

                    for (let i = 0, len = 1000; i < len; i++) {
                        messageItem = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(i);

                        if (messageItem.hasAttachments) {
                            break;
                        }

                    }


                    let draft = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                        conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                            messageItem.mailAccountId,
                            messageItem.mailFolderId,
                            messageItem.id
                        )
                    );


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        session.setMessageDraft(draft);
                        draft.loadMessageBody();
                        draft.loadAttachments();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            draft.set("mailFolderId", "15");

                            for (let i = 0, len = draft.attachments().getRange().length; i < len; i++) {
                                t.expect("ATTACHMENT").toBe("ATTACHMENT");
                                t.expect(draft.attachments().getRange()[i].getId()).toContain(draft.getId());
                            }

                            t.expect("MESSAGEBODY").toBe("MESSAGEBODY");
                            t.expect(draft.getMessageBody().getId()).toBe(draft.getId());


                        });
                    });

                });


                t.it("extjs-app-webmail#73 - 2", t => {

                    let messageItem,
                        session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

                    for (let i = 0, len = 1000; i < len; i++) {
                        messageItem = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(i);

                        if (messageItem.hasAttachments) {
                            break;
                        }

                    }


                    let draft = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                        conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                            messageItem.mailAccountId,
                            messageItem.mailFolderId,
                            messageItem.id
                        )
                    );


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        session.setMessageDraft(draft);
                        draft.loadAttachments();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            draft.set("mailFolderId", "15");

                            for (let i = 0, len = draft.attachments().getRange().length; i < len; i++) {
                                t.expect("ATTACHMENT").toBe("ATTACHMENT");
                                t.expect(draft.attachments().getRange()[i].getId()).toContain(draft.getId());
                            }

                        });
                    });

                });


                t.it("extjs-app-webmail#47 - references", t => {

                    let w = conjoon.cn_mail.model.mail.message.MessageDraft.getField("references");

                    t.expect(w).toBeTruthy();
                    t.expect(w.type).toBe("string");
                    t.expect(w.getDefaultValue()).toBe(null);

                });


                t.it("extjs-app-webmail#47 - inReplyTo", t => {

                    let w = conjoon.cn_mail.model.mail.message.MessageDraft.getField("inReplyTo");

                    t.expect(w).toBeTruthy();
                    t.expect(w.type).toBe("string");
                    t.expect(w.getDefaultValue()).toBe(null);

                });


                t.it("extjs-app-webmail#47 - messageId", t => {

                    let w = conjoon.cn_mail.model.mail.message.MessageDraft.getField("messageId");

                    t.expect(w).toBeTruthy();
                    t.expect(w.type).toBe("string");
                    t.expect(w.getPersist()).toBe(false);

                });


                t.it("extjs-app-webmail#47 - xCnDraftInfo", t => {

                    let w = conjoon.cn_mail.model.mail.message.MessageDraft.getField("xCnDraftInfo");

                    t.expect(w).toBeTruthy();
                    t.expect(w.type).toBe("string");
                    t.expect(w.getDefaultValue()).toBe(null);
                });


                t.it("extjs-app-webmail#39 - savedAt", t => {

                    let w = conjoon.cn_mail.model.mail.message.MessageDraft.getField("savedAt");

                    t.expect(w).toBeTruthy();
                    t.expect(w.type).toBe("date");

                });


                t.it("Test MessageBody assoc", t => {

                    let draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        mailFolderId: "INBOX",
                        mailAccountId: "dev"
                    });

                    let mb = Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                        mailFolderId: "INBOX",
                        mailAccountId: "dev"
                    });


                    draft.setMessageBody(mb);

                    t.expect(draft.getMessageBody()).toBe(mb);
                    t.expect(mb.getMessageDraft()).toBe(draft);

                });


                t.it("Test MessageBody save", t => {
                    let session = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");

                    let messageItem = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(0);

                    var rec = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                        conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                            messageItem.mailAccountId,
                            messageItem.mailFolderId,
                            messageItem.id
                        )
                    );

                    session.setMessageDraft(rec);

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        var mb = rec.loadMessageBody();

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            rec.set("subject", "a");
                            mb.set("text/plain", "foo");

                            t.expect(rec.loadMessageBody()).toBe(mb);
                            t.expect(mb.getMessageDraft()).toBe(rec);

                            session.getSaveBatch().start();
                            t.waitForMs(t.parent.TIMEOUT, () => {

                                rec.set("subject", "b");
                                mb.set("text/plain", "foobar");

                                t.expect(rec.getMessageBody()).toBe(mb);
                                t.expect(mb.getMessageDraft()).toBe(rec);

                                session.getSaveBatch().start();
                                t.waitForMs(t.parent.TIMEOUT, () => {

                                });
                            });
                        });

                    });

                });


                t.it("preBatchCompoundKey", t => {

                    let model = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");

                    t.expect(model.getPreBatchCompoundKey()).toBeUndefined();
                    t.expect(model.storePreBatchCompoundKey()).toBeUndefined();
                    t.expect(model.getPreBatchCompoundKey()).toBeUndefined();

                    model = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        id: "123",
                        mailAccountId: "dev_sys_conjoon_org",
                        mailFolderId: "INBOX"
                    });

                    t.expect(model.getPreBatchCompoundKey()).toBeUndefined();
                    let ck = model.storePreBatchCompoundKey();
                    t.expect(ck).toBeDefined();
                    t.expect(ck.equalTo(model.getCompoundKey())).toBe(true);
                    let pbk = model.getPreBatchCompoundKey();
                    t.expect(pbk).toBeDefined();
                    // no save operation yet
                    t.expect(pbk.equalTo(ck)).toBe(true);

                });

                t.it("loadMessageBody() - target parameter", t => {

                    let CALLED = 0,
                        options = {callback: function (){CALLED++;}};
                    model = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        id: "123",
                        mailAccountId: "dev_sys_conjoon_org",
                        mailFolderId: "INBOX"
                    });
                    model.loadMessageBody(options);

                    t.expect(model.get("mailAccountId")).toBeTruthy();
                    t.expect(model.get("mailFolderId")).toBeTruthy();

                    t.expect(options.params.target).toBe("MessageBodyDraft");

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(CALLED).toBe(1);
                    });
                });

            });});});});
