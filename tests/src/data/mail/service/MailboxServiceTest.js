/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

        const
            ACCOUNTID = "dev_sys_conjoon_org",
            createService = function (helper) {

                return Ext.create("conjoon.cn_mail.data.mail.service.MailboxService", {
                    mailFolderHelper: helper === false ? undefined : Ext.create("conjoon.cn_mail.data.mail.service.MailFolderHelper", {
                        store: Ext.create("conjoon.cn_mail.store.mail.folder.MailFolderTreeStore",{
                            autoLoad: true
                        })
                    })
                });
            },
            checkArgMessageItem = function (t, service) {
                t.isCalled("filterMessageItemValue", service);
            },
            createDummyItem = function () {
                return Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    localId: "foo",
                    id: "meh",
                    mailAccountId: "bla",
                    mailFolderId: "INBOX"
                });
            },
            createMessageItem = function (index, mailFolderId) {

                index = index === undefined ? 1 : index;

                let mi = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(index);

                if (mailFolderId) {
                    let i = index >= 0 ? index : 0, upper = 10000;

                    for (; i <= upper; i++) {
                        mi = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(i);
                        if (mi.mailFolderId === mailFolderId) {
                            break;
                        }
                    }

                }

                return Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    localId: [mi.mailAccountId, mi.mailFolderId, mi.id].join("-"),
                    id: mi.id,
                    mailAccountId: mi.mailAccountId,
                    mailFolderId: mi.mailFolderId
                });
            },
            expectOp = function (t, op) {
                t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");
            };


        // -----------------------------------------------------------------------------
        // |   Tests
        // -----------------------------------------------------------------------------


        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it("statics", t => {
            t.requireOk("conjoon.cn_mail.data.mail.service.MailboxService", () => {
                t.isInstanceOf(conjoon.cn_mail.data.mail.service.MailboxService.recentMessageItemKeys, "Set");


                t.isInstanceOf(conjoon.cn_mail.MailboxService.getInstance(), "conjoon.cn_mail.data.mail.service.MailboxService");
                t.expect(conjoon.cn_mail.MailboxService.getInstance().getMailFolderHelper()).toBe(
                    conjoon.cn_mail.MailFolderHelper.getInstance()
                );
                t.expect(conjoon.cn_mail.MailboxService.getInstance()).toBe(
                    conjoon.cn_mail.MailboxService.getInstance()
                );
            });


        });


        t.it("constructor()", t => {
            let exc,
                service;

            try{createService(false);} catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

            service = createService();
            t.isInstanceOf(service, "conjoon.cn_mail.data.mail.service.MailboxService");
        });


        t.it("filterMessageItemValue() - exception", t => {

            let service = createService(), exc;

            try{service.filterMessageItemValue();}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");


            let mi = createMessageItem();
            mi.set("mailAccountId", undefined);

            try{service.filterMessageItemValue(mi);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("mailaccountid");
            t.expect(exc.msg.toLowerCase()).toContain("missing");

            mi = createMessageItem();

            t.expect(service.filterMessageItemValue(mi)).toBe(mi);
        });


        t.it("createOperation()", t => {

            let service = createService();

            let op = service.createOperation({foo: "bar"});
            expectOp(t, op);
            t.expect(op.getRequest()).toEqual({foo: "bar"});
            t.expect(op.getResult()).toBeUndefined();

            op = service.createOperation({foo: "bar"}, {bar: "foo"});
            expectOp(t, op);
            t.expect(op.getRequest()).toEqual({foo: "bar"});
            t.expect(op.getResult()).toEqual({bar: "foo"});
        });


        t.it("configureOperationCallbacks()", t => {

            let service = createService(),
                op, cfg,
                testObj   = {CALLED: 0},
                cbOptions = {
                    success: function (op) {this.CALLED++;expectOp(t, op);},
                    failure: function (op) {this.CALLED--;expectOp(t, op);},
                    scope: testObj
                };

            op = service.createOperation({foo: "bar"});
            cfg = service.configureOperationCallbacks(op, cbOptions);
            t.expect(cfg.success).toBeDefined();
            t.expect(cfg.failure).toBeDefined();

            // success
            t.expect(testObj.CALLED).toBe(0);
            cfg.success();
            t.expect(op.getResult().success).toBe(true);
            t.expect(testObj.CALLED).toBe(1);

            // failure
            op = service.createOperation({foo: "bar"});
            cfg = service.configureOperationCallbacks(op, cbOptions);
            t.expect(testObj.CALLED).toBe(1);
            cfg.failure();
            t.expect(op.getResult().success).toBe(false);
            t.expect(testObj.CALLED).toBe(0);

        });


        t.it("callBefore()", t => {

            let service = createService(),
                op,
                testObj   = {CALLED: 0},
                cbOptions = {
                    before: function (op) {this.BEFORE = -1;expectOp(t, op);},
                    scope: testObj
                };

            op = service.createOperation({foo: "bar"});

            t.expect(testObj.BEFORE).toBeUndefined();
            service.callBefore(op, cbOptions);
            t.expect(testObj.BEFORE).toBe(-1);

        });


        t.it("moveToTrashOrDeleteMessage() - no trashfolder", t => {

            let service = createService(),
                messageItem = createMessageItem();

            checkArgMessageItem(t, service);

            let testObj   = {CALLED: 0},
                cbOptions = {
                    success: function (op) {this.CALLED++;expectOp(t, op);},
                    failure: function (op) {this.CALLED--;expectOp(t, op);},
                    scope: testObj
                };

            t.isCalled("createOperation", service);
            t.expect(testObj.CALLED).toBe(0);
            let op = service.moveToTrashOrDeleteMessage(messageItem, cbOptions);

            t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");

            let request = op.getRequest();
            t.expect(request.type).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE_OR_DELETE);
            t.expect(request.record).toBe(messageItem);


            let result = op.getResult();
            t.expect(result.success).toBe(false);
            t.expect(result.reason.toLowerCase()).toContain("could not find");
            t.expect(testObj.CALLED).toBe(-1);
        });


        t.it("deleteMessage()", t => {

            let service     = createService(),
                messageItem = createMessageItem();

            checkArgMessageItem(t, service);

            let testObj   = {CALLED: 0},
                cbOptions = {
                    success: function (op) {this.CALLED++;expectOp(t, op);},
                    before: function (op) {this.BEFORE = -1;expectOp(t, op);},
                    failure: function (op) {this.CALLED--;expectOp(t, op);},
                    scope: testObj
                };
            t.isCalled("createOperation", service);
            t.isCalled("callBefore", service);
            t.isCalled("configureOperationCallbacks", service);
            let op = service.deleteMessage(messageItem, cbOptions);

            t.expect(testObj.BEFORE).toBe(-1);
            t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");

            let request = op.getRequest();
            t.expect(request.type).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE);
            t.expect(request.record).toBe(messageItem);

            t.expect(testObj.CALLED).toBe(0);
            t.expect(op.getResult()).toBeUndefined();

            t.waitForMs(t.parent.TIMEOUT, () => {
                let result = op.getResult();
                t.expect(result.success).toBe(true);
                t.expect(testObj.CALLED).toBe(1);

                op = service.deleteMessage(createDummyItem(), cbOptions);

                t.waitForMs(t.parent.TIMEOUT, () => {
                    let result = op.getResult();
                    t.expect(result.success).toBe(false);
                    t.expect(testObj.CALLED).toBe(0);
                });
            });

        });


        t.it("moveToTrashOrDeleteMessage() - mailfolder is trashfolder", t => {

            let service     = createService(),
                messageItem = createMessageItem(1, "INBOX.Trash");

            t.isCalledNTimes("deleteMessage", service, 1);
            t.waitForMs(t.parent.TIMEOUT, () => {
                let op = service.moveToTrashOrDeleteMessage(messageItem);

                t.waitForMs(t.parent.TIMEOUT, () => {
                    t.expect(op.getResult().success).toBe(true);
                });
            });

        });


        t.it("moveMessage() - exception mailFolderId", t => {

            let service     = createService(),
                messageItem = createMessageItem(),
                exc;

            checkArgMessageItem(t, service);

            try{service.moveMessage(messageItem, 3);}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be a string");
        });


        t.it("moveMessage() - same folder NOOP", t => {

            let service     = createService(),
                messageItem = createMessageItem();

            let testObj   = {CALLED: 0},
                cbOptions = {
                    success: function (op) {this.CALLED++;expectOp(t, op);},
                    failure: function (op) {this.CALLED--;expectOp(t, op);},
                    scope: testObj
                };

            let targetFolderId = messageItem.get("mailFolderId");
            t.expect(testObj.CALLED).toBe(0);
            t.isCalled("createOperation", service);
            let op = service.moveMessage(messageItem, targetFolderId, cbOptions);

            t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");

            let request = op.getRequest();
            t.expect(request.type).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.NOOP);
            t.expect(request.record).toBe(messageItem);
            t.expect(testObj.CALLED).toBe(1);

            let result = op.getResult();
            t.expect(result.success).toBe(true);
        });


        t.it("moveMessage() - invalid target", t => {

            let service     = createService(),
                messageItem = createMessageItem();

            let cbOptions = {
                success: Ext.emptyFn,
                failure: Ext.emptyFn,
                scope: null
            };

            let targetFolderId = "foobar";
            let op = service.moveMessage(messageItem, targetFolderId, cbOptions);

            t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");

            let result = op.getResult();
            t.expect(result.success).toBe(false);
            t.expect(result.code).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.INVALID_TARGET);
        });


        t.it("moveMessage()", t => {

            let service     = createService(),
                messageItem = createMessageItem(1, "INBOX");

            t.waitForMs(t.parent.TIMEOUT, () => {


                let testObj   = {CALLED: 0},
                    cbOptions = {
                        success: function (op) {this.CALLED++;expectOp(t, op);},
                        before: function (op) {this.BEFORE = -1;expectOp(t, op);},
                        failure: function (op) {this.CALLED--;expectOp(t, op);},
                        scope: testObj
                    };

                let targetFolderId      = "INBOX.Sent Messages",
                    sourceFolderId      = messageItem.get("mailFolderId"),
                    sourceMessageItemId = messageItem.get("id");

                t.expect(sourceFolderId).toBeTruthy();
                t.expect(targetFolderId).not.toBe(sourceFolderId);
                t.expect(testObj.CALLED).toBe(0);
                t.isCalled("callBefore", service);
                t.isCalled("createOperation", service);
                t.isCalled("configureOperationCallbacks", service);

                let op = service.moveMessage(messageItem, targetFolderId, cbOptions);
                t.expect(testObj.BEFORE).toBe(-1);
                t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");

                let request = op.getRequest();
                t.expect(request.type).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE);
                t.expect(request.record).toBe(messageItem);
                t.expect(request.targetFolderId).toBe(targetFolderId);
                t.expect(request.sourceFolderId).toBe(sourceFolderId);


                t.expect(op.getResult()).toBeUndefined();

                t.waitForMs(t.parent.TIMEOUT, () => {
                    let result = op.getResult();
                    t.expect(result.success).toBe(true);
                    t.expect(testObj.CALLED).toBe(1);

                    t.expect(messageItem.get("mailFolderId")).toBe(targetFolderId);
                    t.expect(messageItem.get("id")).not.toBe(sourceMessageItemId);

                });


            });


        });


        t.it("moveToTrashOrDeleteMessage() - message moved to trashfolder", t => {

            let service     = createService(),
                messageItem = createMessageItem(1, "INBOX");

            let testObj   = {CALLED: 0},
                cbOptions = {
                    success: function (op) {this.CALLED++;expectOp(t, op);},
                    failure: function (op) {this.CALLED--;expectOp(t, op);},
                    scope: testObj
                };

            t.isCalledNTimes("moveMessage", service, 1);
            t.waitForMs(t.parent.TIMEOUT, () => {
                t.expect(testObj.CALLED).toBe(0);
                let op = service.moveToTrashOrDeleteMessage(messageItem, cbOptions);

                t.waitForMs(t.parent.TIMEOUT, () => {
                    t.expect(testObj.CALLED).toBe(1);
                    t.expect(op.getResult().success).toBe(true);
                    t.expect(messageItem.get("mailFolderId")).toBe("INBOX.Trash");

                });
            });

        });


        t.it("callBefore() - check return value", t => {

            let service = createService(),
                op,
                testObj   = {CALLED: 0},
                cbOptions = {
                    before: function (op) {return "foo";},
                    scope: testObj
                };

            op = service.createOperation({foo: "bar"});

            t.expect(service.callBefore(op, cbOptions)).toBe("foo");

        });


        t.it("deleteMessage() - cancel", t => {

            let service     = createService(),
                messageItem = createMessageItem();

            checkArgMessageItem(t, service);

            let testObj   = {CALLED: 0},
                cbOptions = {
                    before: function (op) {return false;},
                    scope: testObj
                };

            let op = service.deleteMessage(messageItem, cbOptions);

            t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");

            t.expect(op.getResult().success).toBe(false);
            t.expect(op.getResult().code).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.CANCELED);


        });


        t.it("moveCallback()", t => {
            let service     = createService(),
                sourceFolderId = "INBOX",
                targetFolderId = "INBOX.Trash",
                messageItem = createMessageItem(1, sourceFolderId);

            let oldMessageBodyId = messageItem.get("messageBodyId");
            t.expect(oldMessageBodyId).toBeFalsy();

            t.waitForMs(t.parent.TIMEOUT, () => {

                let sourceFolder = service.getMailFolderHelper().getMailFolder(ACCOUNTID, sourceFolderId),
                    targetFolder = service.getMailFolderHelper().getMailFolder(ACCOUNTID, targetFolderId);

                sourceFolder.set("unreadMessages", 5);
                targetFolder.set("unreadMessages", 0);

                messageItem.set("seen", false);

                let op = service.createOperation({
                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                    record: messageItem,
                    sourceFolderId: sourceFolderId,
                    targetFolderId: targetFolderId
                }, {
                    success: true
                });

                t.expect(service.moveCallback(op)).toBe(true);

                t.expect(messageItem.get("messageBodyId")).not.toBeFalsy();
                t.expect(oldMessageBodyId).not.toBe(messageItem.get("messageBodyId"));

                t.expect(sourceFolder.get("unreadMessages")).toBe(4);
                t.expect(targetFolder.get("unreadMessages")).toBe(1);

                t.expect(sourceFolder.dirty).toBe(false);
                t.expect(targetFolder.dirty).toBe(false);

                // no success
                messageItem = createMessageItem(3, sourceFolderId);
                messageItem.set("seen", false);

                op = service.createOperation({
                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                    record: messageItem,
                    sourceFolderId: sourceFolderId,
                    targetFolderId: targetFolderId
                }, {
                    success: false
                });

                t.expect(service.moveCallback(op)).toBe(false);

                t.expect(sourceFolder.get("unreadMessages")).toBe(4);
                t.expect(targetFolder.get("unreadMessages")).toBe(1);
            });
        });


        t.it("deleteCallback()", t => {
            let service        = createService(),
                sourceFolderId = "INBOX.Trash",
                messageItem    = createMessageItem(4, sourceFolderId);


            t.waitForMs(t.parent.TIMEOUT, () => {

                let sourceFolder = service.getMailFolderHelper().getMailFolder(ACCOUNTID, sourceFolderId);

                sourceFolder.set("unreadMessages", 5);

                messageItem.set("seen", false);

                let op = service.createOperation({
                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                    record: messageItem
                }, {
                    success: true
                });

                t.expect(service.deleteCallback(op)).toBe(true);

                t.expect(sourceFolder.get("unreadMessages")).toBe(4);

                t.expect(sourceFolder.dirty).toBe(false);

                // no success
                messageItem = createMessageItem(43, sourceFolderId);
                messageItem.set("seen", false);

                op = service.createOperation({
                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                    record: messageItem
                }, {
                    success: false
                });

                t.expect(service.deleteCallback(op)).toBe(false);

                t.expect(sourceFolder.get("unreadMessages")).toBe(4);


            });

        });


        t.it("configureOperationCallbacks() - internal delete/move callbacks called", t => {

            let service = createService(),
                op, opts,
                messageItem = createMessageItem(3, "INBOX.Junk"),
                moveRequest = {
                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                    record: messageItem
                },
                deleteRequest = {
                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                    record: messageItem
                }, opCbs = {success: Ext.emptyFn, failure: Ext.emptyFn};

            t.isCalledNTimes("moveCallback", service, 2);
            t.isCalledNTimes("deleteCallback", service, 2);

            // MOVE
            op = service.createOperation(moveRequest);
            opts = service.configureOperationCallbacks(op, opCbs);
            opts.success.apply(service, [op]);


            op = service.createOperation(moveRequest);
            opts = service.configureOperationCallbacks(op, opCbs);
            opts.failure.apply(service, [op]);

            // DELETE
            op = service.createOperation(deleteRequest);
            opts = service.configureOperationCallbacks(op, opCbs);
            opts.success.apply(service, [op]);

            op = service.createOperation(deleteRequest);
            opts = service.configureOperationCallbacks(op, opCbs);
            opts.failure.apply(service, [op]);

            // NOOP
            op = service.createOperation({
                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.NOOP,
                record: messageItem
            });
            opts = service.configureOperationCallbacks(op, opCbs);
            opts.success.apply(service, [op]);
        });


        t.it("deleteCallback() - max 0 unreadMessages", t => {
            let service        = createService(),
                sourceFolderId = "INBOX.Trash",
                messageItem    = createMessageItem(4, sourceFolderId);


            t.waitForMs(t.parent.TIMEOUT, () => {

                let sourceFolder = service.getMailFolderHelper().getMailFolder(ACCOUNTID, sourceFolderId);

                sourceFolder.set("unreadMessages", 0);

                messageItem.set("seen", false);

                let op = service.createOperation({
                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                    record: messageItem
                }, {
                    success: true
                });

                t.expect(service.deleteCallback(op)).toBe(true);

                t.expect(sourceFolder.get("unreadMessages")).toBe(0);
            });

        });


        t.it("filterMessageItemValue() - accepts AbstractMessageItems", t => {

            let service  = createService(),
                abstract = Ext.create("conjoon.cn_mail.model.mail.message.AbstractMessageItem", {
                    mailAccountId: ACCOUNTID
                });

            t.expect(service.filterMessageItemValue(abstract)).toBe(abstract);
        });


        t.it("moveToTrashOrDeleteMessage() - message not moved, deleted directly since it was a phantom", t => {

            let service     = createService(),
                messageItem =  Ext.create("conjoon.cn_mail.model.mail.message.MessageItem",{
                    mailAccountId: ACCOUNTID
                });

            t.isntCalled("moveMessage", service);
            t.isCalled("deleteMessage", service);

            let cbOptions = {success: Ext.emptyFn, failure: Ext.emptyFn};

            t.waitForMs(t.parent.TIMEOUT, () => {
                let op = service.moveToTrashOrDeleteMessage(messageItem, cbOptions);

                t.waitForMs(t.parent.TIMEOUT, () => {
                    t.expect(op.getResult().success).toBe(true);
                });
            });

        });


    });});
