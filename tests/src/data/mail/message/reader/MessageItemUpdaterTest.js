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

import TestHelper from "/tests/lib/mail/TestHelper.js";


StartTest(async t => {

    const helper = l8.liquify(TestHelper.get(t, window));
    await helper.setupSimlets().mockUpMailTemplates().andRun((t) => {

        var createMessageItem = function () {

                var messageItem = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    id: 1,
                    messageBodyId: "1",
                    size: 400,
                    subject: "SUBJECT",
                    from: {name: "foo", address: "bar"},
                    date: "DATE",
                    to: [{name: "foo", address: "bar"}],
                    hasAttachments: true,
                    seen: Math.random() >= 0.5 === true,
                    recent: Math.random() >= 0.5 === true,
                    flagged: Math.random() >= 0.5 === true,
                    answered: Math.random() >= 0.5 === true,
                    draft: Math.random() >= 0.5 === true
                });

                return messageItem;
            },
            createMessageDraft = function () {
                var messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                    id: 3,
                    subject: "subject",
                    from: {name: "foo", address: "bar"},
                    date: "2017-07-30 23:45:00",
                    to: [{name: "foo", address: "bar"}],
                    seen: Math.random() >= 0.5 === true
                });

                messageDraft.attachments().add(Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
                    text: "myAttachment",
                    size: 20
                }));

                messageDraft.attachments().add(Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
                    text: "myAttachment2",
                    size: 40
                }));

                let mb = Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                    id: "3",
                    mailFolderId: "INBOX",
                    mailAccountId: "dev_sys_conjoon_org",
                    textHtml: "Html text",
                    textPlain: "Plain Text"
                });

                mb.setId(mb.getCompoundKey().toLocalId());
                messageDraft.setMessageBody(mb);

                return messageDraft;
            };


        t.requireOk("conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater", () => {


            t.requireOk("conjoon.cn_mail.model.mail.message.MessageBody", () => {

                t.it("Should make sure MessageItemUpdater exist", t => {

                    t.expect(conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater).toBeDefined();

                });

                t.it("updateItemWithDraft()", t => {

                    var messageItem = createMessageItem(),
                        UPDATER     =  conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater,
                        exc, oldSize = messageItem.get("size"),
                        messageDraft = createMessageDraft(),
                        expectedSize, ret;


                    try {UPDATER.updateItemWithDraft(messageItem);} catch (e) {exc = e;}
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg.toLowerCase()).toContain("messagedraft must be an instance of");

                    exc = null;

                    try {UPDATER.updateItemWithDraft(null, messageDraft);} catch (e) {exc = e;}
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg.toLowerCase()).toContain("messageitem must be an instance of");


                    t.expect(messageItem.get("messageBodyId")).toBe("1");
                    t.expect(messageDraft.get("messageBodyId")).toBe(messageDraft.getMessageBody().getId());
                    ret = UPDATER.updateItemWithDraft(messageItem, messageDraft);

                    t.expect(ret).toBe(messageItem);

                    // messageBodyId
                    t.expect(messageItem.get("id")).toBe(messageDraft.get("id"));
                    t.expect(messageItem.get("messageBodyId")).toBe(messageDraft.get("messageBodyId"));

                    t.expect(messageItem.get("subject")).toBe(messageDraft.get("subject"));
                    t.expect(messageItem.get("date")).toBe(messageDraft.get("date"));
                    t.expect(messageItem.get("previewText")).toContain(messageDraft.getMessageBody().get("textPlain"));
                    t.expect(messageItem.get("hasAttachments")).toBe(true);

                    t.expect(messageItem.get("seen")).toBe(messageDraft.get("seen"));
                    t.expect(messageItem.get("recent")).toBe(messageDraft.get("recent"));
                    t.expect(messageItem.get("flagged")).toBe(messageDraft.get("flagged"));
                    t.expect(messageItem.get("answered")).toBe(messageDraft.get("answered"));
                    t.expect(messageItem.get("draft")).toBe(messageDraft.get("draft"));

                    expectedSize = 0;
                    expectedSize += messageDraft.getMessageBody().get("textPlain").length;
                    expectedSize += messageDraft.getMessageBody().get("textHtml").length;

                    for (var i = 0, len = messageDraft.attachments().getRange().length; i < len; i++) {
                        expectedSize += messageDraft.attachments().getRange()[i].get("size");
                    }

                    t.expect(messageItem.get("size")).toBeGreaterThan(0);
                    t.expect(messageItem.get("size")).not.toBe(oldSize);
                    t.expect(messageItem.get("size")).toBe(expectedSize);

                    t.expect(messageItem.get("from")).not.toBe(messageDraft.get("from"));
                    t.expect(messageItem.get("from")).toEqual(messageDraft.get("from"));

                    t.expect(messageItem.get("to")).not.toBe(messageDraft.get("to"));
                    t.expect(messageItem.get("to")).toEqual(messageDraft.get("to"));

                    // was committed
                    t.expect(messageItem.dirty).toBe(false);

                });


                t.it("createItemFromDraft()", t => {

                    let UPDATER     =  conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater,
                        exc,
                        messageDraft = createMessageDraft(),
                        messageItem;

                    try {UPDATER.createItemFromDraft();} catch (e) {exc = e;}
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
                    t.expect(exc.msg.toLowerCase()).toContain("messagedraft");
                    exc = undefined;

                    t.isCalled("updateItemWithDraft", UPDATER);

                    messageItem = UPDATER.createItemFromDraft(messageDraft);

                    t.isInstanceOf(messageItem, "conjoon.cn_mail.model.mail.message.MessageItem");

                    t.expect(messageItem.get("id")).toBe(messageDraft.get("id"));

                    t.expect(messageItem.get("mailFolderId")).toBe(messageDraft.get("mailFolderId"));
                    t.expect(messageItem.get("mailAccountId")).toBe(messageDraft.get("mailAccountId"));

                    t.expect(messageItem.get("seen")).toBe(messageDraft.get("seen"));
                    t.expect(messageItem.get("recent")).toBe(messageDraft.get("recent"));
                    t.expect(messageItem.get("flagged")).toBe(messageDraft.get("flagged"));
                    t.expect(messageItem.get("answered")).toBe(messageDraft.get("answered"));
                    t.expect(messageItem.get("draft")).toBe(messageDraft.get("draft"));


                    t.expect(messageItem.get("messageBodyId")).toBe(messageDraft.getMessageBody().getId());


                    // was committed
                    t.expect(messageItem.dirty).toBe(false);

                });


            });});

    });});

