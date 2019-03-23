/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe('conjoon.cn_mail.view.mail.message.proxy.AttachmentProxyTest', function(t) {


    t.it("Should successfully create and test instance", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy');

        t.isInstanceOf(proxy, 'coon.core.data.proxy.RestForm');

        t.expect(proxy.getIdParam()).toBe('localId');

        t.expect(proxy.getAppendId()).toBe(false);

        t.expect(proxy.validEntityNames).toEqual([
            "DraftAttachment", "ItemAttachment"
        ]);

        t.expect(proxy.entityName).toBe(null);

        t.expect(proxy.alias).toContain('proxy.cn_mail-mailmessageattachmentproxy');

        t.isInstanceOf(proxy.getReader(), 'conjoon.cn_mail.data.mail.message.reader.MessageItemChildJsonReader');


    });

    t.it("buildUrl() - exception", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy'),
            request = Ext.create('Ext.data.Request', {
                records : [{}]
            }),
            exc, e;

        try{proxy.buildUrl(request);}catch(e){exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("entityname");
    });


    t.it("buildUrl() - exception", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'ItemAttachment'
            }),
            request = Ext.create('Ext.data.Request', {
                records : [{}, {}, {}]
            }),
            exc, e;

        try{proxy.buildUrl(request);}catch(e){exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("multiple records");
    });


    t.it("buildUrl() - exception missing compound keys", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'DraftAttachment'
            }),
            recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a'
            })],
            request = Ext.create('Ext.data.Request', {
                action : 'create',
                operation : Ext.create('Ext.data.operation.Create', {
                    records : recs
                }),
                records : recs
            }),
            exc, e;

        try{proxy.buildUrl(request);}catch(e){exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("compound keys");
    });


    t.it("buildUrl() - no exception missing id with read", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'DraftAttachment'
            }),

            params = {
                mailAccountId : 'a',
                mailFolderId : 'b',
                parentMessageItemId : 'c'
            },
            request = Ext.create('Ext.data.Request', {
                action : 'read',
                params : params,
                operation : Ext.create('Ext.data.operation.Read')
            }),
            exc, e;

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe('/MailAccounts/a/MailFolders/b/MessageItems/c/Attachments');
    });


    t.it("buildUrl() - no exception id falsy with read", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'DraftAttachment'
            }),
            recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                parentMessageItemId : 'c',
                id : 0
            })],
            params = {
                mailAccountId : 'a',
                mailFolderId : 'b',
                parentMessageItemId : 'c'
            },
            request = Ext.create('Ext.data.Request', {
                action : 'read',
                params : params,
                operation : Ext.create('Ext.data.operation.Read', {
                    records : recs
                }),
                records : recs
            }),
            exc, e;

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe('/MailAccounts/a/MailFolders/b/MessageItems/c/Attachments/0');
    });


    t.it("buildUrl() - action \"create\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                parentMessageItemId : 'c'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'DraftAttachment'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'create',
                params : {
                    foo : 'bar'
                },
                operation : Ext.create('Ext.data.operation.Create', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/c/Attachments';

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams()).toEqual({foo : 'bar', type : 'draft'});

        let exc, e;
        proxy.entityName = 'ItemAttachment';
        request.setUrl("");
        try{proxy.buildUrl(request);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected entity");

        // modified
        t.expect(request.getRecords()[0].phantom).toBe(true);
        request.getRecords()[0].set('mailFolderId', 'xyz');
        t.expect(request.getRecords()[0].get('mailFolderId')).toBe('xyz');
        t.expect(request.getOperation().getRecords()[0].get('mailFolderId')).toBe('xyz');
        targetUrl = '/MailAccounts/a/MailFolders/xyz/MessageItems/c/Attachments';
        request.setUrl("");
        proxy.entityName = 'DraftAttachment';
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
    });



    t.it("buildUrl() - action \"update\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                localId : 'c',
                parentMessageItemId : 'e',
                id : 'd'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'DraftAttachment'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'update',
                operation : Ext.create('Ext.data.operation.Update', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/d';

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().type).toBe('draft');

        let exc, e;
        proxy.entityName = 'ItemAttachment';
        request.setUrl("");
        try{proxy.buildUrl(request);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected entity");

        // modified
        t.expect(request.getRecords()[0].phantom).toBe(false);
        request.getRecords()[0].set('mailFolderId', 'xyz');
        t.expect(request.getRecords()[0].get('mailFolderId')).toBe('xyz');
        t.expect(request.getOperation().getRecords()[0].get('mailFolderId')).toBe('xyz');
        targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/d';
        request.setUrl("");
        proxy.entityName = 'DraftAttachment';
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
    });


    t.it("buildUrl() - action \"destroy\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                localId : 'c',
                id : 'd',
                parentMessageItemId : 'e'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'DraftAttachment'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'destroy',
                operation : Ext.create('Ext.data.operation.Destroy', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/d';

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().type).toBe('draft');

        let exc, e;
        proxy.entityName = 'ItemAttachment';
        request.setUrl("");
        try{proxy.buildUrl(request);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected entity");

        // modified
        t.expect(request.getRecords()[0].phantom).toBe(false);
        request.getRecords()[0].set('mailFolderId', 'xyz');
        t.expect(request.getRecords()[0].get('mailFolderId')).toBe('xyz');
        t.expect(request.getOperation().getRecords()[0].get('mailFolderId')).toBe('xyz');
        targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/d';
        request.setUrl("");
        proxy.entityName = 'DraftAttachment';
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);

    });


    t.it("buildUrl() - action \"read\" with id", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                id : 'c',
                localId : 'd'
            })],
            params = {
                mailAccountId : 'a',
                mailFolderId : 'b',
                parentMessageItemId : 'e'
            },
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'DraftAttachment'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'read',
                params : params,
                operation : Ext.create('Ext.data.operation.Read', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/e/Attachments/c';

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().type).toBe('draft');

        let exc, e;
        proxy.entityName = 'ItemAttachment';
        request.setUrl("");
        delete request.getParams().type;
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().type).toBeUndefined();
    });


    t.it("buildUrl() - consider filters in params", function(t) {

        let filters = [{
                property : 'mailAccountId',
                value : 'a'
            }, {
                property : 'mailFolderId',
                value : 'b'
            }, {
                property : 'parentMessageItemId',
                value : 'c'
            }],
            params = {
                filter : Ext.encode(filters)
            },
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {
                entityName : 'DraftAttachment'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'read',
                params : params,
                operation : Ext.create('Ext.data.operation.Read')
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/c/Attachments';

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
    });


});


