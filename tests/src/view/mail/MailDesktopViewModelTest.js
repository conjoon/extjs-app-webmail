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

import TestHelper from "/tests/lib/mail/TestHelper.js";

StartTest(async t => {

    const helper =  l8.liquify(TestHelper.get(t, window));
    await helper.registerIoC().andRun((t) => {

        t.afterEach(() => {
            Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
        Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");
        });

        t.it("Should create the ViewModel", t => {

            let viewModel = Ext.create("conjoon.cn_mail.view.mail.MailDesktopViewModel");

            t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);

            t.expect(viewModel.alias).toContain("viewmodel.cn_mail-maildesktopviewmodel");

        });

        t.it("Should properly define the stores", t => {

            let viewModel = Ext.create("conjoon.cn_mail.view.mail.MailDesktopViewModel");

            t.expect(viewModel.defaultConfig.stores).toEqual({
                "cn_mail_mailfoldertreestore": {
                    type: "cn_mail-mailfoldertreestore",
                    autoLoad: true
                }
            });

        });


        t.it("Should properly return the stores", t => {

            let viewModel = Ext.create("conjoon.cn_mail.view.mail.MailDesktopViewModel");

            t.expect(viewModel.get("cn_mail_mailfoldertreestore")).toBe(
                conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance()
            );

        });


        t.it("Should properly autoload the MailFolderTreeStore", t => {

            const
                loadSpy = t.spyOn(conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance(), "load");

            Ext.create("conjoon.cn_mail.view.mail.MailDesktopViewModel");

            t.expect(loadSpy.calls.count()).toBe(1);

            loadSpy.remove();
        });

    });});
