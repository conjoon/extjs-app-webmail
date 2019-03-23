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


