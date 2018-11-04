/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

describe('conjoon.cn_mail.view.mail.message.proxy.AttachmentProxyTest', function(t) {


    t.it("Should successfully create and test instance", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy');

        t.isInstanceOf(proxy, 'conjoon.cn_core.data.proxy.RestForm');

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


