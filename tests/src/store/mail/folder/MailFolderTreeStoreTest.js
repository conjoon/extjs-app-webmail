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

describe('conjoon.cn_mail.store.mail.folder.MailFolderTreeStoreTest', function(t) {

    const TIMEOUT = 1250;

    t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        t.it("Should properly create the store and check for default config, and initial load", function(t) {

            var store = Ext.create('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore', {
                asynchronousLoad : false
            });

            t.expect(store instanceof Ext.data.TreeStore).toBe(true);

            t.expect(store.getAutoLoad()).toBe(false);


            t.expect(store.config.model).toBe('conjoon.cn_mail.model.mail.account.MailAccount');

            t.expect(store.alias).toContain('store.cn_mail-mailfoldertreestore');
            t.expect(store.getRoot() instanceof conjoon.cn_mail.model.mail.account.MailAccount).toBe(true);

            // proxy
            t.expect(store.getProxy() instanceof Ext.data.proxy.Rest).toBe(true);

            t.expect(store.getRoot().isExpanded()).toBe(false);

            t.expect(store.getRoot().isLoading()).toBe(false);


            t.expect(store.getNodeParam()).toBe("mailAccountId");


            store.load();


            t.expect(store.getRoot().isLoading()).toBe(true);

            t.waitForMs(TIMEOUT, function() {

                t.expect(store.getRoot().childNodes.length).toBe(2);

                t.expect(store.getRoot().childNodes[0].childNodes.length).toBeGreaterThan(1);

                t.expect(store.getRoot().childNodes[1].childNodes.length).toBeGreaterThan(1);

                t.expect(store.getRoot().childNodes[0].isExpanded()).toBe(false);

                t.expect(store.getRoot().childNodes[1].isExpanded()).toBe(false);
            });


        });


    });



});
