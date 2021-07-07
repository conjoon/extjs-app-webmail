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

    var model;

    t.beforeEach(function () {
        model = Ext.create("conjoon.cn_mail.model.mail.folder.MailFolder", {
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
        t.expect(model instanceof conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel).toBe(true);
        t.expect(model instanceof conjoon.cn_mail.model.mail.BaseTreeModel).toBe(true);

        t.expect(model.getIdProperty()).toBe("localId");
        t.expect(model.getField("unreadCount").getPersist()).toBe(false);
        t.expect(model.getField("mailAccountId").critical).toBe(true);
    });

    t.it("Test Entity Name", t => {
        t.expect(
            model.entityName
        ).toBe("MailFolder");
    });

    t.it("Test Record Validity", t => {
        t.expect(model.isValid()).toBe(false);
        model.set("name", "Posteingang");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "Posteingang");
        t.expect(model.isValid()).toBe(false);

        model.set("mailAccountId", "foo");
        model.set("folderType", "INBOX");
        t.expect(model.isValid()).toBe(true);
        model.set("folderType", "");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "DRAFT");
        t.expect(model.isValid()).toBe(true);
        model.set("folderType", "");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "JUNK");
        t.expect(model.isValid()).toBe(true);
        model.set("folderType", "");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "TRASH");
        t.expect(model.isValid()).toBe(true);
        model.set("folderType", "");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "SENT");
        t.expect(model.isValid()).toBe(true);
        model.set("folderType", "");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "FOLDER");
        t.expect(model.isValid()).toBe(true);
        model.set("folderType", "");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", null);
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "foo");
        t.expect(model.isValid()).toBe(false);

        model.set("mailAccountId", null);
        t.expect(model.isValid()).toBe(false);
    });


    t.it("toUrl()", t => {

        let accountNode =  Ext.create("conjoon.cn_mail.model.mail.folder.MailFolder", {
            localId: "meh",
            id: 1,
            mailAccountId: "foo@account"
        });

        t.expect(accountNode.toUrl()).toBe("cn_mail/folder/foo@account/1");
    });


    t.it("getRepresentingCompoundKeyClass()", t => {

        let model = Ext.create("conjoon.cn_mail.model.mail.folder.MailFolder", {

        });

        t.expect(model.getRepresentingCompoundKeyClass()).toBe(
            conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey
        );

    });


    t.it("foreignKeyFields", t => {

        let model = Ext.create("conjoon.cn_mail.model.mail.folder.MailFolder", {

        });

        t.expect(model.foreignKeyFields).toEqual(
            ["mailAccountId", "id"]
        );

    });


});
