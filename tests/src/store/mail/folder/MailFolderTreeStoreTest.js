/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    const helper = l8.liquify(TestHelper.get(t, window));
    await helper.registerIoC().setupSimlets().mockUpMailTemplates().andRun((t) => {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.afterEach(() => {
            Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
            Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");
        });


        t.it("Should properly create the store and check for default config, and initial load", t => {

            var store = Ext.create("conjoon.cn_mail.store.mail.folder.MailFolderTreeStore", {
                asynchronousLoad: false
            });

            t.expect(store.getStoreId()).toBe("cn_mail-mailfoldertreestore");

            t.expect(store instanceof Ext.data.TreeStore).toBe(true);

            t.expect(store.getAutoLoad()).toBe(false);


            t.expect(store.config.model).toBe("conjoon.cn_mail.model.mail.account.MailAccount");

            t.expect(store.alias).toContain("store.cn_mail-mailfoldertreestore");
            t.expect(store.getRoot() instanceof conjoon.cn_mail.model.mail.account.MailAccount).toBe(true);

            // proxy
            t.expect(store.getProxy() instanceof Ext.data.proxy.Rest).toBe(true);

            t.expect(store.getRoot().isExpanded()).toBe(true);

            t.expect(store.getRoot().isLoading()).toBe(false);


            t.expect(store.getNodeParam()).toBe("mailAccountId");


            store.load();


            t.expect(store.getRoot().isLoading()).toBe(true);

            t.waitForMs(t.parent.TIMEOUT, () => {

                t.expect(store.getRoot().childNodes.length).toBe(2);

                t.expect(store.getRoot().childNodes[0].childNodes.length).toBeGreaterThan(1);

                t.expect(store.getRoot().childNodes[1].childNodes.length).toBeGreaterThan(1);

                t.expect(store.getRoot().childNodes[0].isExpanded()).toBe(true);

                t.expect(store.getRoot().childNodes[1].isExpanded()).toBe(true);
            });
        });


        t.it("getInstance()", t => {

            t.expect(conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance()).toBe(
                conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance()
            );

            t.expect(conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance()).toBe(
                Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore")
            );

        });


        t.it("addMailAccount()", t => {

            const
                inst = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance(),
                accounts = [
                    conjoon.cn_mail.model.mail.account.MailAccount.createFrom({name: "New Account"}),
                    conjoon.cn_mail.model.mail.account.MailAccount.createFrom({name: "New Account"})
                ];


            accounts.forEach(acc => t.expect(inst.addMailAccount(acc)).toBe(acc));

            const
                nodes = inst.getRoot().childNodes,
                length = nodes.length;

            t.expect(nodes[length - 2].get("name")).toBe("New Account");
            t.expect(nodes[length - 1].get("name")).toBe("New Account (1)");
        });


        t.it("checkAndFireActiveMailAccountChange()", t => {
            const
                inst = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

            let STATE = false;
            const observer = function (store, active) {

                STATE = active;
            };

            inst.on("activemailaccountavailable", observer);

            t.expect(inst.hasActiveMailAccount).toBe(false);
            t.expect(inst.getRoot().childNodes.length).toBe(0);

            const MailAccount = conjoon.cn_mail.model.mail.account.MailAccount;

            // 0 - ACTIVE
            inst.getRoot().appendChild(MailAccount.createFrom({active: true}));
            t.expect(STATE).toBe(true);

            // 1 - ACTIVE
            inst.getRoot().appendChild(MailAccount.createFrom({active: true}));
            t.expect(STATE).toBe(true);

            // 2 - INACTIVE (0, 1 ACTIVE)
            inst.getRoot().appendChild(MailAccount.createFrom({active: false}));
            t.expect(STATE).toBe(true);

            // 2 - ACTIVE - (0, 1, 2 ACTIVE)
            inst.getRoot().childNodes[2].set("active", true);
            inst.getRoot().childNodes[2].commit();
            t.expect(STATE).toBe(true);

            // 1 - INACTIVE - (0, 2 ACTIVE)
            inst.getRoot().childNodes[1].set("active", false);
            inst.getRoot().childNodes[1].commit();
            t.expect(STATE).toBe(true);

            // 0 - INACTIVE - (2 ACTIVE)
            inst.getRoot().childNodes[0].set("active", false);
            inst.getRoot().childNodes[0].commit();
            t.expect(STATE).toBe(true);

            // 2 - INACTIVE ()
            inst.getRoot().childNodes[2].set("active", false);
            inst.getRoot().childNodes[2].commit();
            t.expect(STATE).toBe(false);

            // Set one node active again
            inst.getRoot().childNodes[1].set("active", true);
            inst.getRoot().childNodes[1].commit();
            t.expect(STATE).toBe(true);


        });


    });


});
