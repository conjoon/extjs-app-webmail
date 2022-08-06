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


    t.it("JSON:API compliant sorting and pagination parameters",  t => {

        const proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy");

        t.expect(proxy.getPageParam()).toBe("");
        t.expect(proxy.getStartParam()).toBe("page[start]");
        t.expect(proxy.getLimitParam()).toBe("page[limit]");

        const sorters = [Ext.create("Ext.util.Sorter", {
            property: "date",
            direction: "DESC"
        }), Ext.create("Ext.util.Sorter",{
            property: "subject",
            direction: "ASC"
        })];

        const encoderSpy = t.spyOn(coon.core.data.jsonApi.SorterEncoder.prototype, "encode").and.callThrough();

        t.expect(proxy.encodeSorters(sorters)).toBe(
            encoderSpy.calls.mostRecent().returnValue
        );

        t.expect(encoderSpy.calls.mostRecent().args[0]).toBe(sorters);

        encoderSpy.remove();
    });


    t.it("@conjoon/rest-api-description - rest-api-email compliant filter query params",  t => {

        const encoder = Ext.create("conjoon.cn_mail.data.jsonApi.PnFilterEncoder");
        const filterCollection = Ext.create("Ext.util.FilterCollection");

        filterCollection.add(Ext.create("Ext.util.Filter", {
            property: "date",
            operator: ">=",
            value: 1000
        }));

        filterCollection.add(Ext.create("Ext.util.Filter",{
            property: "subject",
            operator: "IN",
            value: ["Hello World", "Hallo Welt"]
        }));

        // missing operator defaults to "="
        filterCollection.add(Ext.create("Ext.util.Filter",{
            property: "size",
            value: 250
        }));

        const serializeSpy = t.spyOn(conjoon.cn_mail.data.jsonApi.PnFilterEncoder.prototype, "serialize").and.callThrough();


        t.expect(encoder.encode(filterCollection)).toBe(
            JSON.stringify({
                "AND": [{
                    ">=": {date: 1000}
                }, {
                    "IN": {subject: ["Hello World", "Hallo Welt"]}
                }, {
                    "=": {size: 250}
                }]
            })
        );

        t.expect(serializeSpy.calls.count()).toBe(filterCollection.length);

        const testWithProxy = function (proxy) {
            let encoderSpy = t.spyOn(conjoon.cn_mail.data.jsonApi.PnFilterEncoder.prototype, "encode").and.callThrough();

            // pass array instead of Ext.util.FilterCollection
            let collection = filterCollection.items;

            t.expect(proxy.encodeFilters(collection)).toBe(
                encoderSpy.calls.mostRecent().returnValue
            );

            t.isInstanceOf(proxy.filterEncoder, "conjoon.cn_mail.data.jsonApi.PnFilterEncoder");

            t.expect(encoderSpy.calls.mostRecent().args[0]).toBe(collection);

            serializeSpy.remove();
            encoderSpy.remove();
        };

        [
            Ext.create("conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy"),
            Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy")
        ].map(proxy => testWithProxy(proxy));
    });

});
