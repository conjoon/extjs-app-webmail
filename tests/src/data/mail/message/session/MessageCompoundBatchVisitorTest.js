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
    await helper.setupSimlets().mockUpMailTemplates().andRun((t) => {

        const setupSession = function (withExistingDraft = false) {

                let session = Ext.create("coon.core.data.Session", {
                    schema: "cn_mail-mailbaseschema",
                    batchVisitorClassName: "conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor"
                });

                let cfg = {
                    subject: "test",
                    mailFolderId: "1",
                    mailAccountId: "3"
                };

                if (withExistingDraft === true) {
                    cfg.id = "123";
                }

                let draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", cfg);

                draft.setMessageBody(session.createRecord("MessageBody"));

                session.adopt(draft);

                session.createVisitor = function () {

                    let visitor = coon.core.data.Session.prototype.createVisitor.apply(session);

                    visitor.setMessageDraft(draft);

                    this.visitorForTesting = visitor;

                    return visitor;
                };


                return session;

            },
            createVisitor = function (setDraft = true) {
                let visitor = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor");

                if (setDraft !== false) {
                    let draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        mailFolderId: "1",
                        mailAccountId: "3"
                    });

                    visitor.setMessageDraft(draft);
                }

                return visitor;
            },
            createOp = function () {
                const op = Ext.create("Ext.data.operation.Operation");

                op.getResponse = function () {
                    return {
                        responseText: "{}"
                    };
                };

                return op;
            },
            createBatch = function () {
                return Ext.create("Ext.data.Batch");
            };

        t.requireOk("conjoon.cn_mail.data.mail.BaseSchema", () => {
            t.requireOk("conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor", () => {


                Ext.ux.ajax.SimManager.init({
                    delay: 1
                });


                t.it("Should successfully create and test instance", t => {

                    let visitor = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor");

                    t.isInstanceOf(visitor, "coon.core.data.session.SplitBatchVisitor");
                });


                t.it("getBatch()", t => {

                    let MessageCompoundBatchVisitor = conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor,
                        tmp = MessageCompoundBatchVisitor.prototype.onBatchOperationComplete;

                    MessageCompoundBatchVisitor.prototype.onBatchOperationComplete = function () {
                        CALLED = 1;
                    };

                    let session = setupSession(),
                        batch = session.getSaveBatch(),
                        CALLED = 0;

                    t.expect(CALLED).toBe(0);
                    batch.fireEvent("operationcomplete");
                    t.expect(CALLED).toBe(1);

                    MessageCompoundBatchVisitor.prototype.onBatchOperationComplete = tmp;
                });


                t.it("isOperationSwappable()", t => {

                    let visitor = createVisitor(),
                        op = createOp();

                    op.setRecords(Ext.create("Ext.data.Model"));
                    t.expect(visitor.isOperationSwappable(op)).toBe(false);

                    op.action = "create";
                    op.setRecords(Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft"));
                    t.expect(visitor.isOperationSwappable(op)).toBe(false);

                    op.setRecords(Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        id: 1,
                        mailFolderId: 2
                    }));
                    t.expect(visitor.isOperationSwappable(op)).toBe(false);

                    op.setRecords(Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        id: 1,
                        mailFolderId: 2,
                        mailAccountId: 3
                    }));
                    t.expect(visitor.isOperationSwappable(op)).toBe(true);

                    op.action = "destroy";
                    t.expect(visitor.isOperationSwappable(op)).toBe(false);
                });


                t.it("onBatchOperationComplete() - exception", t => {

                    let visitor = createVisitor(),
                        op      = createOp(),
                        batch   = createBatch();

                    op.exception = true;

                    t.expect(visitor.onBatchOperationComplete(batch, op)).toBe(null);
                });


                t.it("onBatchOperationComplete() - no operations", t => {

                    let visitor = createVisitor(),
                        op      = createOp(),
                        batch   = createBatch();

                    t.expect(visitor.onBatchOperationComplete(batch, op)).toBe(null);
                });


                t.it("onBatchOperationComplete() - no records", t => {

                    let visitor = createVisitor(),
                        op      = createOp(),
                        batch   = createBatch();

                    batch.add(op);

                    t.expect(visitor.onBatchOperationComplete(batch, op)).toBe(null);
                });


                t.it("onBatchOperationComplete()", t => {

                    let visitor = createVisitor(),
                        op      = createOp(),
                        batch   = createBatch();

                    op.setRecords([
                        Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                            id: 1,
                            mailFolderId: 1,
                            mailAccountId: 3
                        })
                    ]);
                    batch.add(op);

                    let op2 = createOp();
                    op2.action = "create";
                    op2.setRecords([Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        id: 1,
                        mailFolderId: 1,
                        mailAccountId: 3
                    })]);

                    batch.add(op2);
                    batch.current = 0;
                    let newOp = visitor.onBatchOperationComplete(batch, op);
                    t.expect(newOp).toBeTruthy();
                    t.expect(newOp).not.toBe(op);
                    t.expect(newOp.getParams().origin).toBe("create");
                    t.expect(batch.operations[1]).toBe(newOp);
                });


                t.it("Should properly test behavior", t => {

                    /**
                     * @note the behavior changed with conjoon/php-lib-conjoon#8.
                     * The first entity sent to the backend is always a MessageDraft, followed by
                     * the MessageBody and the attachments.
                     */
                    let session = setupSession();

                    let batch = session.getSaveBatch();

                    let operations = batch.getOperations();

                    t.expect(operations.length).toBe(2);

                    let oldOp      = operations[1],
                        oldId      = operations[1].id,
                        oldRecord  = operations[1].getRecords();

                    let REFR_OP = [];
                    session.visitorForTesting.refreshKeyForDestroy = function (op) {
                        if (op) {
                            //  debugger;
                            REFR_OP.push(op.getRecords()[0]);
                        } else {
                            REFR_OP.push(false);
                        }

                    };

                    t.expect(oldId).toBeDefined();
                    t.expect(operations[1].getAction()).toBe("create");

                    let CMP_REC = -1;
                    // wait for the first operation to complete
                    batch.on("operationcomplete", function (batch, operation) {

                        if (operation !== operations[0]) {
                            return;
                        }

                        //  t.expect(operations[1].id).not.toBe(oldId);
                        t.expect(operations[1]).toBe(oldOp);
                        t.expect(operations[1].getAction()).toBe("create");
                        t.expect(operations[1].getParams()).toBeUndefined();
                        t.expect(operations[1].getRecords()[0]).toBe(oldRecord[0]);
                        CMP_REC = operations[1].getRecords()[0];
                    });

                    let md = session.visitorForTesting.getMessageDraft();

                    t.expect(md.getPreBatchCompoundKey()).toBeUndefined();
                    batch.start();
                    t.expect(md.getPreBatchCompoundKey()).toBeUndefined();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        t.expect(REFR_OP[0]).toBeTruthy();
                        t.expect(REFR_OP[0]).toBe(CMP_REC);

                        t.expect(REFR_OP[1]).toBe(false);

                    });

                });


                t.it("Test setMessageDraft()", t => {

                    const visitor = createVisitor(false);

                    let exc;

                    // wrong type
                    exc = undefined;
                    try {
                        visitor.setMessageDraft({});
                    } catch(e) {
                        exc = e;
                    }
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toBeDefined();
                    t.expect(exc.msg).toContain("must be an instance of");

                    // okay
                    t.expect(visitor.getMessageDraft()).toBeUndefined();
                    const draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");
                    visitor.setMessageDraft(draft);
                    t.expect(visitor.getMessageDraft()).toBe(draft);

                    // already set
                    exc = undefined;
                    try {
                        visitor.setMessageDraft({});
                    } catch(e) {
                        exc = e;
                    }
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toBeDefined();
                    t.expect(exc.msg).toContain("already set");
                });


                t.it("Test seedRetrievedKey()", t => {

                    const visitor = createVisitor(false);

                    t.expect(visitor.seedRetrievedKey()).toBe(false);

                    const op = createOp();

                    t.expect(visitor.seedRetrievedKey(op)).toBe(false);

                    let draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        mailFolderId: "1",
                        mailAccountId: "3"
                    });

                    visitor.setMessageDraft(draft);

                    op.action = "destroy";
                    let CMP = "STRTIOULRFC2Z7Ä";
                    op.getResponse = function () {
                        return {
                            responseText: Ext.encode({
                                data: {
                                    id: CMP
                                }
                            })
                        };
                    };
                    op.setRecords([ Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
                        mailFolderId: "1",
                        mailAccountId: "3"
                    })]);

                    t.expect(visitor.seedRetrievedKey(op)).toBe(true);
                    t.expect(draft.get("id")).toBe(CMP);
                    t.expect(draft.dirty).toBe(false);

                });


                t.it("Test seedRetrievedKey() - response was application/json - extjs-app-webmail#119", t => {

                    const visitor = createVisitor(false),
                        op = createOp(),
                        draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                            subject: "test",
                            mailFolderId: "1",
                            mailAccountId: "3"
                        });

                    visitor.setMessageDraft(draft);

                    op.action = "destroy";
                    let CMP = "STRTIOULRFC2Z7Ä";
                    op.getResponse = function () {
                        return {
                            responseType: "json",
                            responseJson: {
                                data: {
                                    id: CMP
                                }
                            }
                        };
                    };
                    op.setRecords([ Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
                        mailFolderId: "1",
                        mailAccountId: "3"
                    })]);

                    t.expect(visitor.seedRetrievedKey(op)).toBe(true);
                    t.expect(draft.get("id")).toBe(CMP);
                    t.expect(draft.dirty).toBe(false);

                });


                t.it("Test refreshKeyForDestroy()", t => {

                    const visitor = createVisitor(false);

                    t.expect(visitor.refreshKeyForDestroy()).toBe(false);

                    const op = createOp();

                    t.expect(visitor.refreshKeyForDestroy(op)).toBe(false);

                    let draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        subject: "test",
                        id: "FOOBAR",
                        mailFolderId: "1",
                        mailAccountId: "3"
                    });

                    visitor.setMessageDraft(draft);

                    op.action = "destroy";
                    let attachment = Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
                        id: "567",
                        mailFolderId: "1",
                        mailAccountId: "3"
                    });
                    op.setRecords([attachment]);

                    t.expect(attachment.get("parentMessageItemId")).not.toBe(draft.get("id"));
                    t.expect(visitor.refreshKeyForDestroy(op)).toBe(true);
                    t.expect(attachment.get("parentMessageItemId")).toBe(draft.get("id"));
                    t.expect(attachment.dirty).toBe(false);

                });


                t.it("Should make sure preBatchCompoundKey is saved on MessageDraft", t => {

                    let session    = setupSession(true),
                        batch      = session.getSaveBatch(),
                        operations = batch.getOperations();

                    t.expect(operations.length).toBe(2);

                    let md = session.visitorForTesting.getMessageDraft();

                    // wait for the first operation to complete
                    batch.on("operationcomplete", function (batch, operation) {

                        // test last operation!
                        if (operation !== operations[0]) {
                            return;
                        }

                        t.expect(md.getPreBatchCompoundKey()).not.toBeUndefined();
                        t.expect(md.getPreBatchCompoundKey().getId()).not.toBe(md.getCompoundKey().getId());
                        t.expect(md.getPreBatchCompoundKey().equalTo(md.getCompoundKey())).toBe(false);
                    });

                    t.expect(md.getPreBatchCompoundKey()).toBeUndefined();
                    batch.start();
                    t.expect(md.getPreBatchCompoundKey().equalTo(md.getCompoundKey()));

                    t.waitForMs(t.parent.TIMEOUT, () => {

                    });

                });


            });});});});


