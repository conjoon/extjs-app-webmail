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

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy");

        t.isInstanceOf(proxy, "conjoon.cn_mail.data.mail.BaseProxy");

        t.expect(proxy.getIdParam()).toBe("localId");

        t.expect(proxy.getAppendId()).toBe(false);

        t.expect(proxy.validEntityNames).toEqual([
            "MessageDraft",
            "MessageItem",
            "MessageBody"
        ]);


        t.expect(proxy.alias).toContain("proxy.cn_mail-mailmessageentityproxy");

        t.expect(proxy.mixins.utilityMixin).toBe(conjoon.cn_mail.data.mail.message.proxy.UtilityMixin.prototype);

        t.isInstanceOf(proxy.getReader(), "conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader");
        t.isInstanceOf(proxy.getWriter(), "conjoon.cn_mail.data.mail.message.writer.MessageEntityWriter");


    });

    t.it("buildUrl() - exception", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy"),
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

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
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

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
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

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
            }),

            params = {
                mailAccountId: "a",
                mailFolderId: "b"
            },
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: params,
                operation: Ext.create("Ext.data.operation.Read")
            });

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe("/MailAccounts/a/MailFolders/b/MessageItems");
    });


    t.it("buildUrl() - no exception id falsy with read", t => {

        let proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
            }),
            recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b",
                id: 0
            })],
            params = {
                mailAccountId: "a",
                mailFolderId: "b"
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

        t.expect(request.getUrl()).toBe("/MailAccounts/a/MailFolders/b/MessageItems/0");
    });


    t.it("buildUrl() calls assembleUrl()", t => {

        let recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "create",
                operation: Ext.create("Ext.data.operation.Create", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems";

        t.expect(request.getUrl()).not.toBe(targetUrl);

        t.expect(proxy.assembleUrl(request)).toBe(targetUrl);

        t.expect(request.getUrl()).not.toBe(targetUrl);
        t.expect(request.getUrl()).not.toBe(targetUrl);

        let spy = t.spyOn(proxy, "assembleUrl").callFake(() => "fooUrl"),
            urlSpy = t.spyOn(request, "setUrl");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe("fooUrl");
        t.expect(spy).toHaveBeenCalledWith(request);
        t.expect(urlSpy).toHaveBeenCalledWith("fooUrl");

        spy.remove();
        urlSpy.remove();
    });


    t.it("buildUrl() - action \"create\"", t => {

        let recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
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
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems";

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems";
        proxy.entityName = "MessageDraft";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getParams()).toEqual({foo: "bar"});
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems";
        proxy.entityName = "MessageBody";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getParams()).toEqual({foo: "bar"});

        // modified
        t.expect(request.getRecords()[0].phantom).toBe(true);
        request.getRecords()[0].set("mailFolderId", "xyz");
        t.expect(request.getRecords()[0].get("mailFolderId")).toBe("xyz");
        t.expect(request.getOperation().getRecords()[0].get("mailFolderId")).toBe("xyz");
        targetUrl = "/MailAccounts/a/MailFolders/xyz/MessageItems";
        proxy.entityName = "MessageDraft";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getParams()).toEqual({foo: "bar"});
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getUrl()).toBe(targetUrl);

    });


    t.it("buildUrl() - action \"update\"", t => {

        let recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b",
                localId: "c",
                id: "d"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "update",
                operation: Ext.create("Ext.data.operation.Update", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d";

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl + "/MessageItem");


        request.setParams({});
        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d";
        request.setUrl("");
        proxy.entityName = "MessageDraft";
        proxy.buildUrl(request);
        t.expect(request.getParams().target).toBeUndefined();
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getUrl()).toBe(targetUrl + "/MessageDraft");


        request.setParams({});
        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d";
        proxy.entityName = "MessageBody";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl + "/MessageBody");
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getParams().target).toBeUndefined();

        // modified
        request.setParams({});
        t.expect(request.getRecords()[0].phantom).toBe(false);
        request.getRecords()[0].set("mailFolderId", "xyz");
        t.expect(request.getRecords()[0].get("mailFolderId")).toBe("xyz");
        t.expect(request.getOperation().getRecords()[0].get("mailFolderId")).toBe("xyz");
        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d";
        proxy.entityName = "MessageDraft";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getParams().target).toBeUndefined();
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getUrl()).toBe(targetUrl + "/MessageDraft");
    });


    t.it("buildUrl() - action \"destroy\"", t => {

        let recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b",
                localId: "c",
                id: "d"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "destroy",
                operation: Ext.create("Ext.data.operation.Destroy", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d";

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d";
        proxy.entityName = "MessageDraft";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getParams().target).toBeUndefined();
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d";
        proxy.entityName = "MessageBody";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getParams().target).toBeUndefined();


        // modified
        t.expect(request.getRecords()[0].phantom).toBe(false);
        request.getRecords()[0].set("mailFolderId", "xyz");
        t.expect(request.getRecords()[0].get("mailFolderId")).toBe("xyz");
        t.expect(request.getOperation().getRecords()[0].get("mailFolderId")).toBe("xyz");
        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d";
        proxy.entityName = "MessageDraft";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getParams().target).toBeUndefined();
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getUrl()).toBe(targetUrl);
    });


    t.it("buildUrl() - action \"read\" with id", t => {

        let recs = [Ext.create("Ext.data.Model", {
                id: "c",
                localId: "d"
            })],
            params = {
                mailAccountId: "a",
                mailFolderId: "b"
            },
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
            }),
            copyParams = function () {
                return Ext.copy({}, params, "mailAccountId,mailFolderId");
            },
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: copyParams(),
                operation: Ext.create("Ext.data.operation.Read", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/c",
            keysUndefined = function () {
                t.expect(request.getParams().mailFolderId).toBeUndefined();
                t.expect(request.getParams().mailAccountId).toBeUndefined();
                t.expect(request.getParams().id).toBeUndefined();
                t.expect(request.getParams().localId).toBeUndefined();
            };

        let paramSpy = t.spyOn(proxy, "getDefaultParameters").and.callThrough();

        t.expect(request.getUrl()).not.toBe(targetUrl);


        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);


        request.setParams(copyParams());
        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/c";
        proxy.entityName = "MessageDraft";
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getParams().target).toBeUndefined();
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getParams().attributes).toBe(proxy.getDefaultParameters("MessageDraft").attributes);
        t.expect(request.getUrl()).toBe(targetUrl);
        keysUndefined();
        t.expect(paramSpy.calls.mostRecent().args[0]).toBe("MessageDraft");

        targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/c";
        proxy.entityName = "MessageBody";
        request.setParams(copyParams());
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl + "/MessageBody");
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getParams().target).toBeUndefined();
        keysUndefined();


        paramSpy.remove();
    });


    t.it("buildUrl() - consider filter and attributes in params", t => {

        let filters = [{
                property: "mailAccountId",
                value: "a"
            }, {
                property: "mailFolderId",
                value: "b"
            }, {
                property: "id",
                value: "c"
            }],
            params = {
                filter: Ext.encode(filters)
            },
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "read",
                params: params,
                operation: Ext.create("Ext.data.operation.Read")
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems";

        t.expect(request.getUrl()).not.toBe(targetUrl);

        let paramSpy = t.spyOn(proxy, "getDefaultParameters").and.callThrough();

        proxy.buildUrl(request);

        t.expect(paramSpy.calls.mostRecent().args[0]).toBe("MessageItem");

        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().action).toBeUndefined();
        t.expect(request.getParams()).toEqual({
            filter: "[{\"property\":\"id\",\"value\":\"c\"}]",
            attributes: "*,previewText,replyTo,cc,bcc"
        });

        paramSpy.remove();


    });


    t.it("buildUrl() - changing the mailFolderId on MessageItem identifies as \"move\" action", t => {

        let recs = [Ext.create("Ext.data.Model", {
                mailAccountId: "a",
                mailFolderId: "b",
                localId: "c",
                id: "d"
            })],
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
                entityName: "MessageItem"
            }),
            request = Ext.create("Ext.data.Request", {
                action: "update",
                operation: Ext.create("Ext.data.operation.Update", {
                    records: recs
                }),
                records: recs
            }),
            targetUrl = "/MailAccounts/a/MailFolders/b/MessageItems/d/MessageItem";

        t.expect(request.getUrl()).not.toBe(targetUrl);

        t.expect(request.getRecords()[0].phantom).toBe(false);
        request.getRecords()[0].set("mailFolderId", "xyz");

        proxy.buildUrl(request);

        // modified
        t.expect(request.getParams().target).toBeUndefined();
        t.expect(request.getParams().action).toBe("move");
        t.expect(request.getUrl()).toBe(targetUrl);

    });

    t.it("getDefaultParameters()", t => {
        "use strict";
        const proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy", {
            entityName: "MessageItem"
        });

        t.expect(proxy.getDefaultParameters("ListMessageItem.options")).toEqual(JSON.stringify({
            previewText: {
                plain: {
                    precedence: true,
                    length: 200
                },
                html: {
                    length: 200
                }
            }
        }));

        t.expect(proxy.getDefaultParameters("ListMessageItem.limit")).toBe(-1);
        t.expect(proxy.getDefaultParameters("ListMessageItem.target")).toEqual({});
        t.expect(Object.keys(proxy.getDefaultParameters("ListMessageItem"))).toEqual([
            "options", "limit"
        ]);

        t.expect(proxy.getDefaultParameters("notthere")).toEqual({});

        t.expect(proxy.getDefaultParameters("MessageDraft").attributes).toBe("*,previewText,hasAttachments,size");
        t.expect(proxy.getDefaultParameters("MessageItem").attributes).toBe("*,previewText,replyTo,cc,bcc");
    });


    t.it("getMethod()", t => {

        const
            proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy"),
            actions = {
                create: "POST",
                read: "GET",
                update: "PATCH",
                destroy: "DELETE"
            },
            request = new Ext.data.Request;

        Object.entries(actions).forEach(([action, method]) => {
            let spy = t.spyOn(request, "getAction").and.callFake(() => action);
            t.expect(proxy.getMethod(request)).toBe(method);
            spy.remove();
        });


    });

});
