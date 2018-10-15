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

describe('conjoon.cn_mail.view.mail.message.proxy.MessageItemProxyTest', function(t) {


    t.it("Should successfully create and test instance", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageItemProxy');

        t.isInstanceOf(proxy, 'Ext.data.proxy.Rest');

        t.expect(proxy.getIdParam()).toBe('localId');

        t.expect(proxy.alias).toContain('proxy.cn_mail-mailmessageitemproxy');

        t.isInstanceOf(proxy.getReader(), 'conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader');


    });


    t.it("buildUrl() - exception", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageItemProxy'),
            request = Ext.create('Ext.data.Request', {
                records : [{}, {}, {}]
            }),
            exc, e;

        try{proxy.buildUrl(request);}catch(e){exc = e;}

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("multiple records");
    });


    t.it("buildUrl() - action \"create\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageItemProxy'),
            request = Ext.create('Ext.data.Request', {
                action : 'create',
                operation : Ext.create('Ext.data.operation.Create', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/a/MailFolders/b/MessageItems';

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);

    });



    t.it("buildUrl() - action \"update\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                localId : 'c',
                id : 'd'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageItemProxy'),
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

    });


    t.it("buildUrl() - action \"destroy\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                mailAccountId : 'a',
                mailFolderId : 'b',
                localId : 'c',
                id : 'd'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageItemProxy'),
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
            proxy = Ext.create('conjoon.cn_mail.data.mail.message.proxy.MessageItemProxy'),
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

    });


});


