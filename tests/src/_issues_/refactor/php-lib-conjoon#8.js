/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

StartTest(t => {


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController.saveBatch() is called with sort=true", t => {
        const
            ctrl = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController"),
            fakeBatch = {start: ()  => {}, on: () => {}, setPauseOnException: () => {}},
            fakeSession = {getSaveBatch () {}};

        ctrl.applyAccountInformation = () => {};
        ctrl.getView = function () {
            return {
                fireEvent: () => true,
                getViewModel () {return {get: () => ({})};},
                getSession () {
                    return fakeSession;
                }};};


        let saveBatchSpy = t.spyOn(fakeSession, "getSaveBatch").and.callFake(() => fakeBatch);
        ctrl.configureAndStartSaveBatch();
        t.expect(saveBatchSpy.calls.mostRecent().args[0]).toBe(true);

        [saveBatchSpy].map(spy => spy.remove());
    });

    t.it("conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor.getBatch() sorts MessageDraft first",  t => {

        const
            visitor = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor"),
            testBatch = new Ext.data.Batch();

        visitor.callParent = () => testBatch;

        const op = function (rec) {
                return {
                    getRecords: () => [rec]
                };
            },
            [messageDraft, messageBody, attachment] = [
                op(Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft")),
                op(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody")),
                op(Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment"))
            ];

        const tests = [{
            input: () => [messageBody, messageDraft],
            output: [messageDraft, messageBody]
        }, {
            input: () =>[messageDraft, messageBody],
            output: [messageDraft, messageBody]
        }, {
            input: () =>[messageBody, attachment],
            output: [messageBody, attachment]
        }, {
            input: () =>[attachment, messageBody, messageDraft],
            output: [messageDraft, messageBody, attachment]
        }, {
            input: () =>[messageDraft, attachment, messageBody],
            output: [messageDraft, messageBody, attachment]
        }];

        tests.forEach(({input, output}) => {
            [true, undefined].forEach(doSort => {

                let operations = input();
                testBatch.getOperations = () => operations;

                visitor.getBatch(doSort).getOperations().forEach((op, index) => {
                    t.expect(op.getRecords()[0]).toBe(output[index].getRecords()[0]);
                });
            });

        });

    });

});
