/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.load(
        "conjoon.cn_mail.data.mail.MailboxRunner",
        "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore"
    ).setupSimlets().mockUpMailTemplates().andRun((t) => {

        let mailboxRunner = null;

        const
            createMailboxRunner = () => Ext.create("conjoon.cn_mail.data.mail.MailboxRunner"),
            MailFolderTreeStore = () => conjoon.cn_mail.store.mail.folder.MailFolderTreeStore;

        t.beforeEach(() => {

        });

        t.afterEach(() => {
            if (mailboxRunner) {
                mailboxRunner.destroy();
                mailboxRunner = null;
            }
            MailFolderTreeStore().getInstance().getRoot().removeAll();
        });


        t.it("init() - exception", t => {

            let exc;

            try {
                createMailboxRunner().init();
            } catch (e) {
                exc = e;
            }

            t.expect(exc.message).toContain("must be an instance of");

        });


        t.it("init() - initialized exception", t => {
            let exc;

            mailboxRunner = createMailboxRunner();

            t.expect(mailboxRunner.mailFolderTreeStore).toBeUndefined();
            mailboxRunner.mailFolderTreeStore = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

            try {
                mailboxRunner.init(
                    conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance()
                );
            } catch (e) {
                exc = e;
            }

            t.expect(exc.message).toContain("was already initialized");
        });


        t.it("init() - no load, no subscriptions", t => {

            mailboxRunner = createMailboxRunner();

            const
                treeStore = MailFolderTreeStore().getInstance(),
                subSpy = t.spyOn(mailboxRunner, "createSubscription").and.callFake(() => {}),
                loadSpy = t.spyOn(mailboxRunner, "onMailFolderTreeStoreLoad").and.callFake(() => {});

            mailboxRunner.init(treeStore);

            t.expect(subSpy.calls.count()).toBe(0);
            t.expect(loadSpy.calls.count()).toBe(0);

            subSpy.remove();
            loadSpy.remove();
        });


        t.it("init() - treeStore loaded", t => {

            mailboxRunner = createMailboxRunner();

            const
                treeStore = MailFolderTreeStore().getInstance(),
                subSpy = t.spyOn(mailboxRunner, "createSubscription").and.callFake(() => {}),
                loadSpy = t.spyOn(mailboxRunner, "onMailFolderTreeStoreLoad").and.callFake(() => {});

            treeStore.load();

            t.waitForMs(t.parent.TIMEOUT, () => {
                mailboxRunner.init(treeStore);

                t.expect(subSpy.calls.count()).toBe(2);
                t.expect(loadSpy.calls.count()).toBe(0);

                subSpy.remove();
                loadSpy.remove();

            });
        });


        t.it("init() - treeStore about to get loaded", t => {

            mailboxRunner = createMailboxRunner();

            const
                treeStore = MailFolderTreeStore().getInstance(),
                subSpy = t.spyOn(mailboxRunner, "createSubscription"),
                loadSpy = t.spyOn(mailboxRunner, "onMailFolderTreeStoreLoad");

            mailboxRunner.init(treeStore);
            treeStore.load();

            t.waitForMs(t.parent.TIMEOUT, () => {
                t.expect(subSpy.calls.count()).toBe(2);
                t.expect(loadSpy.calls.count()).toBeGreaterThan(0);

                subSpy.remove();
                loadSpy.remove();
            });
        });


        t.it("createSubscription() - exception no account node", t => {

            mailboxRunner = createMailboxRunner();
            let exc;
            try {
                mailboxRunner.createSubscription({get: () => {}});
            } catch (e) {
                exc = e;
            }

            t.expect(exc.message).toContain("folderType of the passed node");
        });


        t.it("createSubscription() - exception no child nodes", t => {

            mailboxRunner = createMailboxRunner();
            let exc;
            try {
                mailboxRunner.createSubscription({get: () => "ACCOUNT", childNodes: []});
            } catch (e) {
                exc = e;
            }

            t.expect(exc.message).toContain("at least one child node");
        });


        t.it("createSubscription() - exception subscription exists", t => {

            mailboxRunner = createMailboxRunner();
            let exc;
            try {
                mailboxRunner.subscriptions = {"foo": {}};
                mailboxRunner.createSubscription({get: () => "foo"});
            } catch (e) {
                exc = e;
            }

            t.expect(exc.message).toContain("subscription");
            t.expect(exc.message).toContain("already exists");
        });


        t.it("createSubscription() - exception no inbox node exists", t => {

            mailboxRunner = createMailboxRunner();
            let exc;
            try {
                mailboxRunner.createSubscription({get: (key) => key === "folderType" ? "ACCOUNT" : "foo", childNodes: [1, 2, 3], findChild: () => {}});
            } catch (e) {
                exc = e;
            }

            t.expect(exc.message).toContain("no INBOX node found");
        });


        t.it("createSubscription()", t => {

            mailboxRunner = createMailboxRunner();

            const inboxNode = {};
            t.expect(mailboxRunner.createSubscription({
                get: (key) => key === "folderType" ? "ACCOUNT" : "foo",
                childNodes: [1, 2, 3],
                findChild: () => inboxNode
            })).toBe(inboxNode);

            t.expect(mailboxRunner.subscriptions["foo"]).toBe(inboxNode);

        });

        t.it("start()", t => {


        });

        t.it("stop()", t => {


        });

        t.it("pause()", t => {


        });


    });
});
