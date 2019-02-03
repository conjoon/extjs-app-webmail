/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.view.mail.account.proxy.MailAccountProxyTest', function(t) {


    t.it("Should successfully create and test instance", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy');

        t.isInstanceOf(proxy, 'Ext.data.proxy.Rest');

        t.expect(proxy.getIdParam()).toBe('id');

        t.expect(proxy.getAppendId()).toBe(false);

        t.expect(proxy.entityName).toBe('MailAccount');

        t.expect(proxy.alias).toContain('proxy.cn_mail-mailaccountproxy');

        t.isInstanceOf(proxy.getReader(), 'conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader');


    });


    t.it("buildUrl() - action \"read\"", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy'),
            request = Ext.create('Ext.data.Request', {
                action : 'read',
                params : {
                    mailAccountId : 'root'
                },
                operation : Ext.create('Ext.data.operation.Read')
            }),
            targetUrl = '/MailAccounts';

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
    });


    t.it("buildUrl() - params trigger url for MailFolder", function(t) {

        let proxy = Ext.create('conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy'),
            request = Ext.create('Ext.data.Request', {
                action : 'read',
                params : {
                    mailAccountId : 'foo'
                },
                operation : Ext.create('Ext.data.operation.Read')
            }),
            targetUrl = '/MailAccounts/foo/MailFolders';

        t.expect(request.getUrl()).not.toBe(targetUrl);
        proxy.buildUrl(request);
        t.expect(request.getUrl()).toBe(targetUrl);
    });


    t.it("buildUrl() - action \"update\"", function(t) {

        let recs = [Ext.create('Ext.data.Model', {
                id : 'foo'
            })],
            proxy = Ext.create('conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy', {
                entityName : 'MailAccount'
            }),
            request = Ext.create('Ext.data.Request', {
                action : 'update',
                operation : Ext.create('Ext.data.operation.Update', {
                    records : recs
                }),
                records : recs
            }),
            targetUrl = '/MailAccounts/foo';

        t.expect(request.getUrl()).not.toBe(targetUrl);

        proxy.buildUrl(request);

        t.expect(request.getUrl()).toBe(targetUrl);
    });

});


