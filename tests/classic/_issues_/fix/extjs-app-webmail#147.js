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


StartTest(async t => {

    t.requireOk(
        "conjoon.cn_mail.model.mail.AbstractCompoundKeyedModel",
        "conjoon.cn_mail.data.mail.AbstractCompoundKey", () => {

            let model,
                classSpy,
                keySpy;

            t.beforeEach(t => {

                keySpy = t.spyOn(conjoon.cn_mail.data.mail.AbstractCompoundKey, "fromRecord").and.returnValue({});
                classSpy = t.spyOn(conjoon.cn_mail.model.mail.AbstractCompoundKeyedModel.prototype, "getRepresentingCompoundKeyClass").and.returnValue(
                    conjoon.cn_mail.data.mail.AbstractCompoundKey
                );
                model = Ext.create("conjoon.cn_mail.model.mail.AbstractCompoundKeyedModel", {
                    mailAccountId: "prod"
                });

            });

            t.afterEach(t => {
                keySpy.remove();
                classSpy.remove();
                model.destroy();
                model = null;
            });


            // +-----------------------------------------
            // | Tests
            // +-----------------------------------------
            t.diag("fix: deleting multiple messages using rowflymenu triggers error (conjoon/extjs-app-webmail#147)");


            t.it("getCompoundKey()", t => {

                const modifiedSpy = t.spyOn(model, "hasKeysModified");

                t.expect(model.getCompoundKey()).toEqual({});
                model.set("mailAccountId", "dev");

                t.expect(() => model.getCompoundKey()).toThrow();
                t.expect(modifiedSpy.calls.mostRecent().args[0]).toBe(true);

                modifiedSpy.remove();

            });


            t.it("hasKeysModified()", t => {

                t.expect(model.hasKeysModified()).toBe(false);
                model.set("mailAccountId", "dev");

                t.expect(() => model.hasKeysModified(true)).toThrow();
                t.expect(model.hasKeysModified()).toBe(true);
            });


            t.it("getRecordByCompoundKey()", t => {

                let hasModified = true;

                const
                    recMock = {
                        getCompoundKey: () => compoundKey,
                        hasKeysModified: () => hasModified
                    },
                    livegrid = Ext.create("conjoon.cn_mail.view.mail.message.grid.feature.Livegrid"),
                    compoundKey = Ext.create("conjoon.cn_mail.data.mail.message.CompoundKey", {
                        mailAccountId: "dev", mailFolderId: "INBOX", id: "1234"
                    }),
                    mapSpy = t.spyOn(coon.core.data.pageMap.PageMapUtil, "getRecordBy").and.callFake(search => search(recMock)),
                    hasMod = t.spyOn(recMock, "hasKeysModified");


                t.expect(livegrid.getRecordByCompoundKey(compoundKey)).toBe(false);
                hasModified = false;
                t.expect(livegrid.getRecordByCompoundKey(compoundKey)).toBe(true);

                t.expect(hasMod.calls.mostRecent().args).toEqual([]);

                [mapSpy].map(spy => spy.remove());
            });


            t.it("getMessageItemsFromOpenedViews()", t => {

                const
                    ctrl = Ext.create("conjoon.cn_mail.view.mail.MailDesktopViewController"),
                    messageItem = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                        mailAccountId: "dev", mailFolderId: "INBOX", id: "1234"
                    }),
                    compoundKey = messageItem.getCompoundKey();

                ctrl.getView = function () {
                    return {
                        items: {
                            each: () => ({})
                        },
                        down: () => ({
                            down: () => ({
                                getMessageItem: () => messageItem
                            })
                        })
                    };
                };

                messageItem.set("mailFolderId", "Trash");
                t.expect(ctrl.getMessageItemsFromOpenedViews(compoundKey)).toBeTruthy();

                ctrl.destroy();
            });


        });});
