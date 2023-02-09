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


        t.it("mailaccount update behavior (active/inactive)", t => {
            const
                inst = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

            let STATE = false;
            const observer = function (store, active) {
                STATE = active;
            };

            const activechange = {
                observer () {
                }
            };

            const activechangeSpy = t.spyOn(activechange, "observer");

            inst.on("activemailaccountavailable", observer);
            inst.on("mailaccountactivechange", activechange.observer);

            t.expect(inst.hasActiveMailAccount).toBe(false);
            t.expect(inst.getRoot().childNodes.length).toBe(0);

            const MailAccount = conjoon.cn_mail.model.mail.account.MailAccount;

            const account1 = MailAccount.createFrom({active: true});
            const account2 = MailAccount.createFrom({active: true});

            // 0 - ACTIVE
            inst.getRoot().appendChild(account1);
            t.expect(STATE).toBe(true);

            // 1 - ACTIVE
            inst.getRoot().appendChild(account2);
            t.expect(STATE).toBe(true);

            // 2 - INACTIVE (0, 1 ACTIVE)
            inst.getRoot().appendChild(MailAccount.createFrom({active: false}));
            t.expect(STATE).toBe(true);

            t.expect(activechangeSpy.calls.count()).toBe(0);

            // 2 - ACTIVE - (0, 1, 2 ACTIVE)
            inst.getRoot().childNodes[2].set("active", true);
            inst.getRoot().childNodes[2].commit();
            t.expect(STATE).toBe(true);

            // 1 - INACTIVE - (0, 2 ACTIVE)
            inst.getRoot().childNodes[1].set("active", false);
            inst.getRoot().childNodes[1].commit();
            t.expect(STATE).toBe(true);
            t.expect(activechangeSpy.calls.mostRecent().args).toEqual([inst, account2]);

            // 0 - INACTIVE - (2 ACTIVE)
            inst.getRoot().childNodes[0].set("active", false);
            inst.getRoot().childNodes[0].commit();
            t.expect(STATE).toBe(true);

            t.expect(activechangeSpy.calls.count()).toBe(3);
            t.expect(activechangeSpy.calls.mostRecent().args[0]).toBe(inst);
            t.expect(activechangeSpy.calls.mostRecent().args[1]).toBe(account1);


            // 2 - INACTIVE ()
            inst.getRoot().childNodes[2].set("active", false);
            inst.getRoot().childNodes[2].commit();
            t.expect(STATE).toBe(false);

            // Set one node active again
            inst.getRoot().childNodes[1].set("active", true);
            inst.getRoot().childNodes[1].commit();
            t.expect(STATE).toBe(true);

            activechangeSpy.remove();
        });


        t.it("findFirstActiveMailAccount()", t => {
            const
                inst = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

            t.expect(inst.getRoot().childNodes.length).toBe(0);

            const MailAccount = conjoon.cn_mail.model.mail.account.MailAccount;

            const account1 = MailAccount.createFrom({active: true});
            const account2 = MailAccount.createFrom({active: true});

            t.expect(inst.findFirstActiveMailAccount()).toBe(undefined);

            inst.getRoot().appendChild(account1);
            t.expect(inst.findFirstActiveMailAccount()).toBe(account1);

            inst.getRoot().appendChild(account2);
            t.expect(inst.findFirstActiveMailAccount()).toBe(account1);

            account1.set("active", false);
            t.expect(inst.findFirstActiveMailAccount()).toBe(account2);

            account2.set("active", false);
            t.expect(inst.findFirstActiveMailAccount()).toBe(undefined);

            account1.set("active", true);
            account2.set("active", true);

            t.expect(inst.findFirstActiveMailAccount({
                property: "id",
                operator: "NOT_IN",
                value: [account1.get("id"), account2.get("id")]
            })).toBe(undefined);

            t.expect(inst.findFirstActiveMailAccount({
                property: "id",
                operator: "NOT_IN",
                value: [account1.get("id")]
            })).toBe(account2);

        });

        t.it("loadMailAccounts()", async t => {

            const
                inst = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

            t.expect(inst.areAccountsLoaded()).toBe(false);
            t.expect(inst.getRoot().childNodes.length).toBe(0);

            const observer = {
                onMailAccountsLoaded () {

                }
            };

            const fireSpy = t.spyOn(observer, "onMailAccountsLoaded").and.callThrough();
            const loadSpy = t.spyOn(inst, "load").and.callThrough();

            inst.on("mailaccountsloaded", observer.onMailAccountsLoaded);

            let res = await inst.loadMailAccounts();
            t.expect(inst.areAccountsLoaded()).toBe(true);
            let res2 = await inst.loadMailAccounts();

            const accounts = inst.getRoot().childNodes;

            t.expect(res).toBe(accounts);
            t.expect(res).toBe(res2);

            t.expect(loadSpy.calls.count()).toBe(1 + accounts.length);

            t.expect(fireSpy.calls.count()).toBe(1);
            t.expect(fireSpy.calls.mostRecent().args).toEqual([
                inst,
                accounts
            ]);

            [fireSpy, loadSpy].map(spy => spy.remove());

        });


        t.it("store's areAccountsLoaded() returns \"true\" even if no mail accounts returned from storage", async t => {

            const
                inst = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

            t.expect(inst.areAccountsLoaded()).toBe(false);
            t.expect(inst.getRoot().childNodes.length).toBe(0);

            const loadSpy = t.spyOn(inst, "load").and.callFake(() => {
                inst.fireEvent("load", inst, []);
            });

            let res = await inst.loadMailAccounts();

            t.expect(res).toEqual([]);
            t.expect(inst.areAccountsLoaded()).toBe(true);

            [loadSpy].map(spy => spy.remove());

        });

    });});
