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


    t.it("Should successfully create and test instance", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy");

        t.isInstanceOf(proxy, "conjoon.cn_mail.data.mail.BaseProxy");

        t.expect(proxy.getIdParam()).toBe("id");

        t.expect(proxy.getAppendId()).toBe(false);

        t.expect(proxy.entityName).toBe("MailAccount");

        t.expect(proxy.alias).toContain("proxy.cn_mail-mailaccountproxy");

        t.isInstanceOf(proxy.getReader(), "conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader");


    });


    t.it("buildUrl() - action \"read\"", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy"),
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: {
                    mailAccountId: "root"
                },
                operation: Ext.create("Ext.data.operation.Read")
            }),
            targetUrl = "/MailAccounts";

        t.expect(request.getParams().mailAccountId).not.toBeUndefined();
        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().mailAccountId).toBeUndefined();
    });


    t.it("buildUrl() - action \"create\"", t => {
        let proxy = Ext.create("conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy"),
            request = Ext.create("Ext.data.Request", {
                action: "create",
                params: {
                    mailAccountId: "foo"
                },
                operation: Ext.create("Ext.data.operation.Create")
            }),
            targetUrl = "/MailAccounts";

        t.expect(request.getParams().mailAccountId).not.toBeUndefined();
        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().mailAccountId).toBeUndefined();
    });


    t.it("buildUrl() - params trigger url for MailFolder", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy"),
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: {
                    mailAccountId: "foo"
                },
                operation: Ext.create("Ext.data.operation.Read")
            }),
            targetUrl = "/MailAccounts/foo/MailFolders";

        t.expect(request.getParams().mailAccountId).not.toBeUndefined();
        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().mailAccountId).toBeUndefined();
    });


    t.it("buildUrl() - action \"update\"", t => {

        let recs = [Ext.create("Ext.data.Model", {
                id: "foo"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy", {
                entityName: "MailAccount"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "update",
                operation: Ext.create("Ext.data.operation.Update", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/foo";

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);
    });

});


