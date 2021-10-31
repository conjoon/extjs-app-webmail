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


        t.it("constructor() - no arg", t => {

            mailboxRunner = Ext.create("conjoon.cn_mail.data.mail.MailboxRunner");

            const spy = t.spyOn(conjoon.cn_mail.data.mail.MailboxRunner.prototype, "init");

            t.expect(spy.calls.count()).toBe(0);

            spy.remove();
        });


        t.it("constructor() - mailFolderTreeStore arg", t => {

            let spy = t.spyOn(conjoon.cn_mail.data.mail.MailboxRunner.prototype, "init");
            mailboxRunner = Ext.create("conjoon.cn_mail.data.mail.MailboxRunner", MailFolderTreeStore().getInstance()),

            t.expect(spy.calls.count()).toBe(1);
            t.expect(spy.calls.mostRecent().args[0]).toBe(MailFolderTreeStore().getInstance());

            spy.remove();
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


        t.it("createSubscription() - subscription exists", t => {

            mailboxRunner = createMailboxRunner();
            mailboxRunner.subscriptions = {"foo": {}};
            t.expect(mailboxRunner.createSubscription({get: () => "foo"})).toBe(false);
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

            const
                startSpy = t.spyOn(mailboxRunner, "start").and.callThrough(),
                inboxNode = {},
                mailAccountMock = {
                    get: (key) => key === "folderType" ? "ACCOUNT" : "foo",
                    childNodes: [1, 2, 3],
                    findChild: () => inboxNode
                };

            const created = mailboxRunner.createSubscription(mailAccountMock);

            t.expect(created.folder).toBe(inboxNode);
            t.expect(created.extjsTask.stopped).toBe(false);
            t.expect(created.extjsTask.pending).toBe(true);

            t.expect(mailboxRunner.subscriptions.foo).toBeDefined();

            t.expect(startSpy.calls.all()[0].args[0]).toBe(mailAccountMock);

            startSpy.remove();
        });


        t.it("onSubscriptionResponseAvailable", t => {

            mailboxRunner = createMailboxRunner();

            const
                mailFolder = {},
                responseMock = {},
                record = {},
                recordMock = [],
                resultSetMock = {
                    getRecords: () => recordMock
                },
                readSpy = t.spyOn(
                    conjoon.cn_mail.model.mail.message.MessageItem.getProxy().getReader(), "read"
                ).and.returnValue(resultSetMock),
                fireSpy = t.spyOn(Ext, "fireEvent");

            t.expect(mailboxRunner.onSubscriptionResponseAvailable(mailFolder, responseMock)).toBe(false);
            t.expect(readSpy.calls.all()[0].args[0]).toBe(responseMock);
            t.expect(fireSpy.calls.count()).toBe(0);

            recordMock.push(record);
            t.expect(mailboxRunner.onSubscriptionResponseAvailable(mailFolder, responseMock)).toBe(recordMock);
            t.expect(fireSpy.calls.count()).toBe(1);
            t.expect(fireSpy.calls.all()[0].args[0]).toBe("conjoon.cn_mail.event.NewMessagesAvailable");
            t.expect(fireSpy.calls.all()[0].args[1]).toBe(mailFolder);
            t.expect(fireSpy.calls.all()[0].args[2]).toBe(recordMock);

            readSpy.remove();
            fireSpy.remove();
        });


        t.it("visitSubscription()", async t => {

            mailboxRunner = createMailboxRunner();

            const
                requestSpy = t.spyOn(Ext.Ajax, "request").and.callFake(() => Promise.resolve("response")),
                responseSpy = t.spyOn(mailboxRunner, "onSubscriptionResponseAvailable").and.callFake(() => {});

            const FOLDER = {
                props: {
                    mailAccountId: 1,
                    id: 2,
                    uidNext: 3
                },
                get: function (key) {
                    return this.props[key];
                }
            };


            await mailboxRunner.visitSubscription(FOLDER);

            const options =  JSON.stringify(
                conjoon.cn_mail.model.mail.message.MessageItem.getProxy().getDefaultParameters("ListMessageItem.options")
            );

            t.expect(requestSpy.calls.mostRecent().args[0]).toEqual({
                method: "get",
                action: "read",
                url: "cn_mail/MailAccounts/1/MailFolders/2/MessageItems",
                headers: undefined,
                params: {
                    filter: "[{\"property\":\"recent\",\"value\":true,\"operator\":\"=\"},{\"property\":\"id\",\"value\":3,\"operator\":\">=\"}]",
                    options: options,
                    target: "MessageItem"
                }
            });

            t.expect(responseSpy.calls.count()).toBe(1);
            t.expect(responseSpy.calls.mostRecent().args[0]).toBe(FOLDER);
            t.expect(responseSpy.calls.mostRecent().args[1]).toBe("response");

            delete FOLDER.props.uidNext;
            mailboxRunner.visitSubscription(FOLDER);

            t.expect(requestSpy.calls.mostRecent().args[0]).toEqual({
                method: "get",
                action: "read",
                url: "cn_mail/MailAccounts/1/MailFolders/2/MessageItems",
                headers: undefined,
                params: {
                    filter: "[{\"property\":\"recent\",\"value\":true,\"operator\":\"=\"}]",
                    options: options,
                    target: "MessageItem"
                }
            });

            requestSpy.remove();
            responseSpy.remove();

        });


        t.it("start()", t => {

            mailboxRunner = createMailboxRunner();

            const FOLDER = {get: (key)=> {
                const obj = {
                    mailAccountId: 1,
                    id: 2,
                    uidNext: 3
                };
                return obj[key];
            }};

            const subscriptionSpy = t.spyOn(mailboxRunner, "visitSubscription").and.callFake(() => {});

            t.expect(mailboxRunner.start("foo")).toBe(false);

            mailboxRunner.subscriptions = {"foo": {folder: FOLDER}};

            const task = mailboxRunner.start("foo");

            t.expect(task.extjsTask).toBeDefined();
            const extjsTask = task.extjsTask;
            t.expect(extjsTask.interval).toBe(mailboxRunner.interval);
            t.expect(extjsTask.pending).toBe(true);
            t.expect(extjsTask.fireOnStart).toBe(false);
            t.expect(extjsTask.stopped).toBe(false);
            t.expect(extjsTask.scope).toBe(mailboxRunner);
            t.expect(extjsTask.args[0]).toBe(FOLDER);


            t.expect(subscriptionSpy.calls.count()).toBe(0);
            extjsTask.run(task.folder);
            t.expect(subscriptionSpy.calls.count()).toBe(1);
            t.expect(subscriptionSpy.calls.all()[0].args[0]).toBe(FOLDER);

            t.expect(task.folder).toBe(FOLDER);

            subscriptionSpy.remove();
        });


        t.it("stop()", t => {
            mailboxRunner = createMailboxRunner();

            const stopSpy = t.spyOn(Ext.TaskManager, "stop").and.callFake(
                (task, remove) => {
                    t.expect(task).toBe(sub.extjsTask);
                    t.expect(remove).toBe(true);
                }
            );
            const FOLDER = {};
            t.expect(mailboxRunner.stop("foo")).toBe(false);

            const sub = {folder: FOLDER};
            mailboxRunner.subscriptions = {"foo": sub};

            t.expect(mailboxRunner.start("foo")).toBe(sub);
            t.expect(mailboxRunner.subscriptions["foo"]).toBeDefined();

            const
                subStop = mailboxRunner.stop("foo"),
                extjsTask = subStop.extjsTask;

            t.expect(subStop).toBe(sub);
            t.expect(extjsTask).toBeUndefined();
            t.expect(mailboxRunner.subscriptions["foo"]).toBeUndefined();

            t.expect(stopSpy.calls.count()).toBe(1);
            stopSpy.remove();
        });


        t.it("pause()", t => {
            mailboxRunner = createMailboxRunner();

            const FOLDER = {};
            t.expect(mailboxRunner.pause("foo")).toBe(false);

            const sub = {folder: FOLDER};
            mailboxRunner.subscriptions = {"foo": sub};

            t.expect(mailboxRunner.pause("foo")).toBe(false);

            mailboxRunner.start("foo");

            const
                subPause = mailboxRunner.pause("foo"),
                extjsTask = subPause.extjsTask;

            t.expect(subPause).toBe(sub);

            t.expect(extjsTask.pending).toBe(false);
            t.expect(extjsTask.stopped).toBe(true);

            t.expect(mailboxRunner.subscriptions["foo"]).toBe(subPause);

        });


        t.it("resume()", t => {
            mailboxRunner = createMailboxRunner();

            const FOLDER = {};
            t.expect(mailboxRunner.resume("foo")).toBe(false);

            const sub = {folder: FOLDER};
            mailboxRunner.subscriptions = {"foo": sub};

            t.expect(mailboxRunner.resume("foo")).toBe(false);

            mailboxRunner.start("foo");
            t.expect(mailboxRunner.resume("foo")).toBe(sub);
            mailboxRunner.pause("foo");

            const
                subResume = mailboxRunner.resume("foo"),
                extjsTask = subResume.extjsTask;

            t.expect(subResume).toBe(sub);

            t.expect(extjsTask.pending).toBe(true);
            t.expect(extjsTask.stopped).toBe(false);

            t.expect(mailboxRunner.subscriptions["foo"]).toBe(subResume);

        });

    });
});
