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

StartTest(t => {


    t.it("Should successfully create and test instance", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy");

        t.expect(conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy.required.requestConfigurator).toBe(
            "coon.core.data.request.Configurator"
        );

        t.isInstanceOf(proxy, "coon.core.data.proxy.RestForm");

        t.expect(proxy.getIdParam()).toBe("localId");

        t.expect(proxy.getAppendId()).toBe(false);

        t.expect(proxy.validEntityNames).toEqual([
            "DraftAttachment", "ItemAttachment"
        ]);

        t.expect(proxy.entityName).toBe(null);

        t.expect(proxy.alias).toContain("proxy.cn_mail-mailmessageattachmentproxy");

        t.expect(proxy.mixins.utilityMixin).toBe(conjoon.cn_mail.data.mail.message.proxy.UtilityMixin.prototype);

        t.isInstanceOf(proxy.getReader(), "conjoon.cn_mail.data.mail.message.reader.MessageItemChildJsonReader");


    });

    t.it("buildUrl() - exception", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy"),
            request = Ext.create("Ext.data.Request", {
                records: [{}]
            }),
            exc;

        try{proxy.buildUrl(request);}catch(e){exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("entityname");
    });


    t.it("buildUrl() - exception", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "ItemAttachment"
            }),
            request = Ext.create("Ext.data.Request", {
                records: [{}, {}, {}]
            }),
            exc;

        try{proxy.buildUrl(request);}catch(e){exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("multiple records");
    });


    t.it("buildUrl() - exception missing compound keys", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "DraftAttachment"
            }),
            recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a"
            })],
            request = Ext.create("Ext.data.Request", {
                action: "create",
                operation: Ext.create("Ext.data.operation.Create", {
                    records: recs
                }),
                records: recs
            }),
            exc;

        try{proxy.buildUrl(request);}catch(e){exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("compound keys");
    });


    t.it("buildUrl() - no exception missing id with read", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "DraftAttachment"
            }),

            params = {
                mailAccountId: "a",
                mailFolderId: "b",
                parentMessageItemId: "c"
            },
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: params,
                operation: Ext.create("Ext.data.operation.Read")
            });

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe("/MailAccounts/a/MailFolders/b/MessageItems/c/Attachments");
    });


    t.it("buildUrl() - no exception id falsy with read", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "DraftAttachment"
            }),
            recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b",
                parentMessageItemId: "c",
                id: 0
            })],
            params = {
                mailAccountId: "a",
                mailFolderId: "b",
                parentMessageItemId: "c"
            },
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: params,
                operation: Ext.create("Ext.data.operation.Read", {
                    records: recs
                }),
                records: recs
            });

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe("/MailAccounts/a/MailFolders/b/MessageItems/c/Attachments/0");
    });


    t.it("buildUrl() - action \"create\"", t => {

        let recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b",
                parentMessageItemId: "c"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "DraftAttachment"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "create",
                params: {
                    foo: "bar"
                },
                operation: Ext.create("Ext.data.operation.Create", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/c/Attachments";

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams()).toEqual({foo: "bar"});

        let exc;
        proxy.entityName = "ItemAttachment";
        request.setUrl("");
        try{proxy.buildUrl(request);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected entity");

        // modified
        t.expect(request.getRecords()[0].phantom).toBe(true);
        request.getRecords()[0].set("mailFolderId", "xyz");
        t.expect(request.getRecords()[0].get("mailFolderId")).toBe("xyz");
        t.expect(request.getOperation().getRecords()[0].get("mailFolderId")).toBe("xyz");
        targetUrl = "/MailAccounts/a/MailFolders/xyz/MessageItems/c/Attachments";
        request.setUrl("");
        proxy.entityName = "DraftAttachment";
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
    });


    t.it("buildUrl() - action \"update\"", t => {

        let recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b",
                localId: "c",
                parentMessageItemId: "e",
                id: "d"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "DraftAttachment"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "update",
                operation: Ext.create("Ext.data.operation.Update", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/d";

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams()).toBeUndefined();

        let exc;
        proxy.entityName = "ItemAttachment";
        request.setUrl("");
        try{proxy.buildUrl(request);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected entity");

        // modified
        t.expect(request.getRecords()[0].phantom).toBe(false);
        request.getRecords()[0].set("mailFolderId", "xyz");
        t.expect(request.getRecords()[0].get("mailFolderId")).toBe("xyz");
        t.expect(request.getOperation().getRecords()[0].get("mailFolderId")).toBe("xyz");
        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/d";
        request.setUrl("");
        proxy.entityName = "DraftAttachment";
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
    });


    t.it("buildUrl() - action \"destroy\"", t => {

        let recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b",
                localId: "c",
                id: "d",
                parentMessageItemId: "e"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "DraftAttachment"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "destroy",
                operation: Ext.create("Ext.data.operation.Destroy", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/d";

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams()).toBeUndefined();

        let exc;
        proxy.entityName = "ItemAttachment";
        request.setUrl("");
        try{proxy.buildUrl(request);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected entity");

        // modified
        t.expect(request.getRecords()[0].phantom).toBe(false);
        request.getRecords()[0].set("mailFolderId", "xyz");
        t.expect(request.getRecords()[0].get("mailFolderId")).toBe("xyz");
        t.expect(request.getOperation().getRecords()[0].get("mailFolderId")).toBe("xyz");
        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/d";
        request.setUrl("");
        proxy.entityName = "DraftAttachment";
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);

    });


    t.it("buildUrl() - action \"read\" with id", t => {

        let recs = [Ext.create("Ext.data.Model", {
                id: "c",
                localId: "d"
            })],
            params = {
                mailAccountId: "a",
                mailFolderId: "b",
                parentMessageItemId: "e"
            },
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "DraftAttachment"
            }),
            copyParams = function () {
                return Ext.copy({}, params, "mailAccountId,mailFolderId,parentMessageItemId");
            },
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: copyParams(),
                operation: Ext.create("Ext.data.operation.Read", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/c",
            keysUndefined = function () {
                t.expect(request.getParams().mailFolderId).toBeUndefined();
                t.expect(request.getParams().mailAccountId).toBeUndefined();
                t.expect(request.getParams().parentMessageItemId).toBeUndefined();
                t.expect(request.getParams().id).toBeUndefined();
                t.expect(request.getParams().localId).toBeUndefined();
            };

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().type).toBeUndefined();
        keysUndefined();

        proxy.entityName = "ItemAttachment";
        request.setUrl("");
        request.setParams(copyParams());
        delete request.getParams().type;
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().type).toBeUndefined();
        keysUndefined();
    });


    t.it("buildUrl() - consider filters in params", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy", {
                entityName: "DraftAttachment"
            }),
            filters = [Ext.create("Ext.util.Filter", {
                property: "mailAccountId",
                value: "a"
            }), Ext.create("Ext.util.Filter", {
                property: "mailFolderId",
                value: "b"
            }), Ext.create("Ext.util.Filter", {
                property: "parentMessageItemId",
                value: "c"
            }), Ext.create("Ext.util.Filter", {
                property: "foo",
                value: "bar"
            })],
            params = {
                snafu: "YO!",
                filter: proxy.encodeFilters(filters)
            },
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: params,
                operation: Ext.create("Ext.data.operation.Read")
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/c/Attachments";

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams()).toEqual({
            snafu: "YO!",
            filter: JSON.stringify({"=": {"foo": "bar"}})
        });

    });


    t.it("sendRequest()", t => {

        const
            requestConfigurator = Ext.create("coon.core.data.request.Configurator"),
            proxy = Ext.create("conjoon.cn_mail.data.mail.BaseProxy", {
                requestConfigurator
            }),
            fakeRequest = {},
            parentSpy = t.spyOn(proxy, "callParent").and.callFake(() => {}),
            cfgSpy = t.spyOn(requestConfigurator, "configure").and.callThrough();

        proxy.sendRequest(fakeRequest);

        t.expect(cfgSpy.calls.mostRecent().args[0]).toBe(fakeRequest);
        t.expect(parentSpy.calls.mostRecent().args[0][0]).toBe(cfgSpy.calls.mostRecent().returnValue);

        [cfgSpy, parentSpy].map(spy => spy.remove());

    });


});


