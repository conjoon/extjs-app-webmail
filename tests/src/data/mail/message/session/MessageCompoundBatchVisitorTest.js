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

describe('conjoon.cn_mail.view.mail.message.session.MessageCompoundBatchVisitorTest', function(t) {

    const setupSession = function() {

            let session = Ext.create('coon.core.data.Session', {
                schema : 'cn_mail-mailbaseschema',
                batchVisitorClassName : 'conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor'
            });

            var draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                mailFolderId  : 1,
                mailAccountId : 3
            });

            draft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody'));
            session.adopt(draft);

            return session;

        },
        createVisitor = function() {
            return Ext.create('conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor');
        },
        createOp = function() {
            return Ext.create('Ext.data.operation.Operation');
        },
        createBatch = function() {
            return Ext.create('Ext.data.Batch');
        };

    t.requireOk("conjoon.cn_mail.data.mail.BaseSchema", function() {
    t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function() {



        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it("Should successfully create and test instance", function(t) {

            let visitor = Ext.create('conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor');

            t.isInstanceOf(visitor, 'coon.core.data.session.SplitBatchVisitor');
        });


        t.it("getBatch()", function(t) {

            let MessageCompoundBatchVisitor = conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor,
                tmp = MessageCompoundBatchVisitor.prototype.onBatchOperationComplete;

            MessageCompoundBatchVisitor.prototype.onBatchOperationComplete = function() {
                CALLED = 1;
            };

            let session = setupSession(),
                batch = session.getSaveBatch(),
                CALLED = 0;

            t.expect(CALLED).toBe(0);
            batch.fireEvent('operationcomplete');
            t.expect(CALLED).toBe(1);

            MessageCompoundBatchVisitor.prototype.onBatchOperationComplete = tmp;
        });


        t.it("isOperationSwappable()", function(t) {

            let visitor = createVisitor(),
                op = createOp();

            op.setRecords(Ext.create("Ext.data.Model"));
            t.expect(visitor.isOperationSwappable(op)).toBe(false);

            op.action = 'create';
            op.setRecords(Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft"));
            t.expect(visitor.isOperationSwappable(op)).toBe(false);

            op.setRecords(Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                id : 1,
                mailFolderId : 2
            }));
            t.expect(visitor.isOperationSwappable(op)).toBe(false);

            op.setRecords(Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                id : 1,
                mailFolderId : 2,
                mailAccountId : 3
            }));
            t.expect(visitor.isOperationSwappable(op)).toBe(true);

            op.action = 'destroy';
            t.expect(visitor.isOperationSwappable(op)).toBe(false);
        });


        t.it("onBatchOperationComplete() - exception", function(t) {

            let visitor = createVisitor(),
                op      = createOp(),
                batch   = createBatch();

            op.exception = true;

            t.expect(visitor.onBatchOperationComplete(batch, op)).toBe(null);
        });


        t.it("onBatchOperationComplete() - no operations", function(t) {

            let visitor = createVisitor(),
                op      = createOp(),
                batch   = createBatch();

            t.expect(visitor.onBatchOperationComplete(batch, op)).toBe(null);
        });


        t.it("onBatchOperationComplete() - no records", function(t) {

            let visitor = createVisitor(),
                op      = createOp(),
                batch   = createBatch();

            batch.add(op);

            t.expect(visitor.onBatchOperationComplete(batch, op)).toBe(null);
        });


        t.it("onBatchOperationComplete()", function(t) {

            let visitor = createVisitor(),
                op      = createOp(),
                batch   = createBatch();

            op.setRecords([
                Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                    id  : 1,
                    mailFolderId  : 1,
                    mailAccountId : 3
                })
            ]);
            batch.add(op);

            let op2 = createOp();
            op2.action = 'create';
            op2.setRecords([Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                subject       : 'test',
                id  : 1,
                mailFolderId  : 1,
                mailAccountId : 3
            })]);

            batch.add(op2);
            batch.current = 0;
            let newOp = visitor.onBatchOperationComplete(batch, op);
            t.expect(newOp).toBeTruthy();
            t.expect(newOp).not.toBe(op);
            t.expect(batch.operations[1]).toBe(newOp);
        });


        t.it("Should properly test behavior", function(t) {

            let session = setupSession();

            let batch = session.getSaveBatch();

            let operations = batch.getOperations(),
                oldOp      = operations[1],
                oldId      = operations[1].id,
                oldRecord  = operations[1].getRecords();

            t.expect(oldId).toBeDefined();
            t.expect(operations[1].getAction()).toBe('create');

            // wait for the first operation to complete
            batch.on('operationcomplete', function(batch, operation) {

                if (operation !== operations[0]) {
                    return;
                }

                //  t.expect(operations[1].id).not.toBe(oldId);
                t.expect(operations[1]).not.toBe(oldOp);
                t.expect(operations[1].getAction()).toBe('update');
                t.expect(operations[1].getRecords()[0]).toBe(oldRecord[0]);
           });

            batch.start();

            t.waitForMs(2000, function() {

            });

        });


    });

})});


