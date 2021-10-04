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

        const ACCOUNTID = "dev_sys_conjoon_org",
            createHelper = function (store) {

                return Ext.create("conjoon.cn_mail.data.mail.service.MailFolderHelper", {
                    store: store === false ? undefined  : Ext.create("conjoon.cn_mail.store.mail.folder.MailFolderTreeStore",{
                        autoLoad: true
                    })
                });
            };


        // -----------------------------------------------------------------------------
        // |   Tests
        // -----------------------------------------------------------------------------


        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it("constructor()", t => {
            let exc, helper;

            try{helper = createHelper(false);}catch(e){exc=e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

            helper = createHelper();
            t.isInstanceOf(helper, "conjoon.cn_mail.data.mail.service.MailFolderHelper");
            t.expect(helper.getStore()).toBeDefined();
            t.isInstanceOf(helper.getStore(), "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore");
        });


        t.it("getAccountNode()", t => {

            let helper = createHelper();

            t.waitForMs(t.parent.TIMEOUT, () => {

                t.expect(helper.getAccountNode("foo")).toBe(null);

                t.isInstanceOf(helper.getAccountNode(ACCOUNTID), "conjoon.cn_mail.model.mail.account.MailAccount");
            });
        });


        t.it("getMailFolderIdForType()", t => {

            let helper = createHelper();

            t.waitForMs(t.parent.TIMEOUT, () => {
                t.expect(helper.getMailFolderIdForType(ACCOUNTID, "foo")).toBeNull();
                t.expect(helper.getMailFolderIdForType("ACCOUNTID", conjoon.cn_mail.data.mail.folder.MailFolderTypes.INBOX)).toBe(null);
                t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.INBOX)).toBe("INBOX");
                t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.SENT)).toBe("INBOX.Sent Messages");
                t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.JUNK)).toBe("INBOX.Junk");
                t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.DRAFT)).toBe("INBOX.Drafts");
                t.expect(helper.getMailFolderIdForType(ACCOUNTID, conjoon.cn_mail.data.mail.folder.MailFolderTypes.TRASH)).toBe("INBOX.Trash");
            });

        });


        t.it("getMailFolder()", t => {

            let helper = createHelper();

            t.waitForMs(t.parent.TIMEOUT, () => {
                t.expect(helper.getMailFolder(ACCOUNTID, "foo")).toBeNull();

                t.isInstanceOf(helper.getMailFolder(ACCOUNTID, "INBOX"), "conjoon.cn_mail.model.mail.folder.MailFolder");

                t.expect(helper.getMailFolder("ACCOUNTID", "INBOX")).toBeNull();
            });

        });


        t.it("doesFolderBelongToAccount()", t => {

            let helper = createHelper();

            t.waitForMs(t.parent.TIMEOUT, () => {
                t.expect(helper.doesFolderBelongToAccount("foo", ACCOUNTID)).toBe(false);
                t.expect(helper.doesFolderBelongToAccount("INBOX", "ACCOUNTID")).toBe(false);
                t.expect(helper.doesFolderBelongToAccount("INBOX", ACCOUNTID)).toBe(true);
            });


        });


    });});