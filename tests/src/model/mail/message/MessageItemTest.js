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

StartTest(t => {

    var model,
        messageBody,
        attachments,
        longString = "";

    t.beforeEach(function () {

        for (var i = 0, len = 4000; i < len; i++) {
            longString += "0";
        }

        let mid = Ext.id();

        messageBody = Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
            localId: mid,
            mailAccountId: 4,
            mailFolderId: 5
        });

        model = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
            localId: "4-5-1",
            messageBodyId: mid,
            id: 1,
            mailAccountId: 4,
            mailFolderId: 5
        });

        attachments = [Ext.create("conjoon.cn_mail.model.mail.message.ItemAttachment", {
            id: 1
        }), Ext.create("conjoon.cn_mail.model.mail.message.ItemAttachment", {
            id: 2
        }), Ext.create("conjoon.cn_mail.model.mail.message.ItemAttachment", {
            id: 3
        })];

    });

    t.afterEach(function () {
        longString  = "";
        model       = null;
        messageBody = null;
        attachments  = null;
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Should create instance", t => {
        t.expect(model instanceof conjoon.cn_mail.model.mail.message.AbstractMessageItem).toBeTruthy();
    });

    t.it("Test for proper proxy and urls", t => {
        t.isInstanceOf(model.getProxy(), "conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy");

        // READ
        let op,
            m = conjoon.cn_mail.model.mail.message.MessageItem.loadEntity(
                conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                    "a", "b", "c"
                )
            );
        t.expect(m.loadOperation.getRequest().getUrl()).toContain("cn_mail/MailAccounts/a/MailFolders/b/MessageItems/c?");

        m = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
            mailFolderId: "b1",
            mailAccountId: "a1",
            id: "c1",
            localId: "foo"
        });


        // ERASE
        op = m.erase();
        t.expect(op.getRequest().getUrl()).toContain("cn_mail/MailAccounts/a1/MailFolders/b1/MessageItems/c1?");


        // UPDATE
        m = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
            mailFolderId: "b2",
            mailAccountId: "a2",
            id: "c2",
            localId: "foo"
        });

        m.set("foo", "bar");
        op = m.save();
        t.expect(op.getRequest().getUrl()).toContain("cn_mail/MailAccounts/a2/MailFolders/b2/MessageItems/c2?");

        // CREATE
        m = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
            mailFolderId: "b3",
            mailAccountId: "a3"
        });

        m.set("foo", "bar");
        op = m.save();
        t.expect(op.getRequest().getUrl()).toContain("cn_mail/MailAccounts/a3/MailFolders/b3/MessageItems?");

    });

    t.it("Test Entity Name", t => {
        t.expect(
            model.entityName
        ).toBe("MessageItem");
    });

    t.it("Test Record Validity", t => {
        t.expect(model.isValid()).toBe(true);
    });

    t.it("Test getMessageBody", t => {
        model.setMessageBody(messageBody);
        t.expect(model.getMessageBody()).toBeTruthy();
    });

    t.it("Test attachments", t => {
        t.isInstanceOf(model.attachments(), "conjoon.cn_mail.store.mail.message.MessageAttachmentStore");
        model.attachments().add(attachments);
        t.expect(model.attachments().getAt(1).get("id")).toBe("2");
        t.expect(model.attachments().getAt(1).getMessageItem()).toBe(model);
    });

    t.it("Test previewText", t => {

        t.expect(longString.length).toBe(4000);

        model.set("previewText", longString);
        t.expect(model.data.previewText.length).toBe(200);
        t.expect(model.get("previewText").length).toBe(200);

        model.set("previewText", "u" + longString);
        t.expect(model.previousValues.previewText.length).toBe(200);
        t.expect(model.data.previewText[0]).toBe("u");
        t.expect(model.data.previewText.length).toBe(200);
        t.expect(model.get("previewText").length).toBe(200);

        model.set("previewText", 0);
        t.expect(model.get("previewText")).toBe("");
        model.set("previewText", undefined);
        t.expect(model.get("previewText")).toBe("");
        model.set("previewText", null);
        t.expect(model.get("previewText")).toBe("");
        model.set("previewText", true);
        t.expect(model.get("previewText")).toBe("");


    });

    t.it("cn_deleted / cn_moved", t => {

        t.expect(model.get("cn_deleted")).toBe(false);
        t.expect(model.get("cn_moved")).toBe(false);

        model.set("cn_deleted", 1);
        t.expect(model.get("cn_deleted")).toBe(true);

        model.set("cn_moved", true);
        t.expect(model.get("cn_moved")).toBe(true);
    });


});
