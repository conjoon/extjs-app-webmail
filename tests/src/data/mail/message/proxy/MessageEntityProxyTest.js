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

describe('conjoon.cn_mail.view.mail.message.proxy.MessageEntityProxyTest', function(t) {


    t.it("Should successfully create and test instance", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy');

        t.isInstanceOf(proxy, 'Ext.data.proxy.Rest');

        t.expect(proxy.getIdParam()).toBe('localId');

        t.expect(proxy.getAppendId()).toBe(false);

        t.expect(proxy.validEntityNames).toEqual([
            "MessageDraft",
            "MessageItem",
            'MessageBody'
        ]);

        t.expect(proxy.alias).toContain('proxy.cn_mail-mailmessageentityproxy');

        t.isInstanceOf(proxy.getReader(), 'conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader');


    });

    t.it("buildUrl() - exception", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy'),
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

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {
                entityName : 'MessageItem'
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

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {
                entityName : 'MessageItem'
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


    t.it("buildUrl() - exception missing id with read", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {
                entityName : 'MessageItem'
            }),
            recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                id : 0 // set this explicitely to 0 - it is used as the default primary key
                       // so a value will be available automatically which will break the test
            })],
            params = {
                mailAccountId : 'c',
                mailFolderId : 'd'
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

        try{proxy.buildUrl(request);}catch(e){exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("missing id");
    });


    t.it("buildUrl() - action \"create\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {
                entityName : 'MessageItem'
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
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems';

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = '/MailAccounts/a/MailFolders/b/MessageDrafts';
        proxy.entityName = 'MessageDraft';
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems';
        proxy.entityName = 'MessageBody';
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams()).toEqual({foo : 'bar', target : 'MessageBody'});


    });



    t.it("buildUrl() - action \"update\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                localId : 'c',
                id : 'd'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {
                entityName : 'MessageItem'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'update',
                operation : Ext.create('Ext.data.operation.Update', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/d';

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = '/MailAccounts/a/MailFolders/b/MessageDrafts/d';
        request.setUrl("");
        proxy.entityName = 'MessageDraft';
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);


        targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/d';
        proxy.entityName = 'MessageBody';
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().target).toBe('MessageBody');

    });


    t.it("buildUrl() - action \"destroy\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                localId : 'c',
                id : 'd'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {
                entityName : 'MessageItem'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'destroy',
                operation : Ext.create('Ext.data.operation.Destroy', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/d';

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = '/MailAccounts/a/MailFolders/b/MessageDrafts/d';
        proxy.entityName = 'MessageDraft';
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);

        targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/d';
        proxy.entityName = 'MessageBody';
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().target).toBe('MessageBody');
    });


    t.it("buildUrl() - action \"read\" with id", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                id : 'c',
                localId : 'd'
            })],
            params = {
                mailAccountId : 'a',
                mailFolderId : 'b'
            },
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {
                entityName : 'MessageItem'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'read',
                params : params,
                operation : Ext.create('Ext.data.operation.Read', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/c';

        t.expect(request.getUrl()).not.toBe(targetUrl);


        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);


        targetUrl = '/MailAccounts/a/MailFolders/b/MessageDrafts/c';
        proxy.entityName = 'MessageDraft';
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);


        targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems/c';
        proxy.entityName = 'MessageBody';
        request.setUrl("");
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
        t.expect(request.getParams().target).toBe('MessageBody');
    });


});


