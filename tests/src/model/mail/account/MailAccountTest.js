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

StartTest(t => {

    var model;

    t.beforeEach(function () {
        model = Ext.create("conjoon.cn_mail.model.mail.account.MailAccount", {
            id: 1
        });
    });

    t.afterEach(function () {
        model = null;
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Should create instance and check basic configuration", t => {
        t.expect(model instanceof conjoon.cn_mail.model.mail.BaseTreeModel).toBe(true);

        t.expect(model.get("active")).toBe(true);

        t.expect(model.getIdProperty()).toBe("id");

    });

    t.it("Test Entity Name", t => {
        t.expect(
            model.entityName
        ).toBe("MailAccount");
    });

    t.it("toUrl()", t => {

        let model =  Ext.create("conjoon.cn_mail.model.mail.account.MailAccount", {
            id: "foo"
        });
        t.expect(model.toUrl()).toBe("cn_mail/account/foo");

    });


    t.it("Test Record Validity", t => {
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "Posteingang");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "ACCOUNT");
        t.expect(model.isValid()).toBe(false);

        model.set("name", "foo");
        t.expect(model.isValid()).toBe(true);

        model.set("folderType", null);
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "ACCOUNT");
        t.expect(model.isValid()).toBe(true);
    });


    t.it("extjs-app-webmail#101", t => {
        t.isInstanceOf(model.getField("from"), "coon.core.data.field.EmailAddress");
        t.isInstanceOf(model.getField("replyTo"), "coon.core.data.field.EmailAddress");
    });

    t.it("createFrom()", t => {
        const rec  = conjoon.cn_mail.model.mail.account.MailAccount.createFrom({name: "accountName"});

        t.isInstanceOf(rec, "conjoon.cn_mail.model.mail.account.MailAccount");

        t.expect(rec.get("name")).toBe("accountName");
        t.expect(rec.get("folderType")).toBe(conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT);
    });


    t.it("getInboxAuth()", t => {
        model.set("inbox_user", "user");
        model.set("inbox_password", "password");

        t.expect(model.getInboxAuth()).toEqual(["user", "password"]);
    });


    t.it("getOutboxAuth()", t => {
        model.set("outbox_user", "user");
        model.set("outbox_password", "password");

        t.expect(model.getOutboxAuth()).toEqual(["user", "password"]);
    });


    t.it("getInboxInfo()", t => {
        model.set("inbox_address", "address");
        model.set("inbox_port", "8080");
        model.set("inbox_ssl", true);

        t.expect(model.getInboxInfo()).toEqual({
            inbox_address: "address",
            inbox_port: 8080,
            inbox_ssl: true
        });
    });


    t.it("getOutboxInfo()", t => {
        model.set("outbox_address", "address");
        model.set("outbox_port", "8080");
        model.set("outbox_secure", "tls");

        model.set("outbox_user", "user");
        model.set("outbox_password", "password");

        t.expect(model.getOutboxInfo()).toEqual({
            outbox_address: "address",
            outbox_port: 8080,
            outbox_secure: "tls"
        });

        t.expect(model.getOutboxInfo(true)).toEqual({
            outbox_address: "address",
            outbox_port: 8080,
            outbox_secure: "tls",
            outbox_user: "user",
            outbox_password: "password"
        });
    });


    t.it("subscription field", t => {
        t.isInstanceOf(model.getField("subscriptions"), "Ext.data.field.Array");
    });


});
