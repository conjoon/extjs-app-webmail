/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

        var model;

        t.beforeEach(function () {
            model = Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                id: 1,
                mailFolderId: 4,
                mailAccountId: 5
            });
        });

        t.afterEach(function () {
            model = null;
        });

        var createKey = function (id1, id2, id3) {
                return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
            },
            getMessageItemAt = function (messageIndex) {
                return conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(messageIndex);
            },
            createKeyForExistingMessage = function (messageIndex){
                let item = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(messageIndex);

                let key = createKey(
                    item.mailAccountId, item.mailFolderId, item.id
                );

                return key;
            },
            createSession = function () {
                return Ext.create("coon.core.data.Session", {
                    schema: "cn_mail-mailbaseschema",
                    batchVisitorClassName: "conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor"
                });
            };


        // +----------------------------------------------------------------------------
        // |                    =~. Unit Tests .~=
        // +----------------------------------------------------------------------------

        t.requireOk("conjoon.dev.cn_mailsim.data.table.MessageTable", function (){
            t.requireOk("conjoon.cn_mail.data.mail.BaseSchema", () => {
                t.requireOk("conjoon.cn_mail.model.mail.message.MessageDraft", () => {
                    t.requireOk("conjoon.cn_mail.model.mail.message.MessageBody", () => {
                        Ext.ux.ajax.SimManager.init({
                            delay: 1
                        });

                        t.it("Should create instance", t => {
                            t.isInstanceOf(model, "conjoon.cn_mail.model.mail.message.CompoundKeyedModel");
                        });

                        t.it("Test Entity Name", t => {
                            t.expect(
                                model.entityName
                            ).toBe("MessageBody");
                        });

                        t.it("Test Record Validity", t => {
                            t.expect(model.isValid()).toBe(false);
                            model.set("messageDraftId", "123");
                            t.expect(model.isValid()).toBe(true);
                        });

                        t.it("Test mailFolderId", t => {
                            t.expect(model.getField("mailFolderId")).toBeTruthy();
                            t.expect(model.getField("mailFolderId").critical).toBe(true);
                        });

                        t.it("Test mailAccountId", t => {
                            t.expect(model.getField("mailAccountId")).toBeTruthy();
                            t.expect(model.getField("mailAccountId").critical).toBe(true);
                        });

                        t.it("localId", t => {
                            t.expect(model.getIdProperty()).toBe("localId");
                        });

                        t.it("id", t => {
                            t.expect(model.getField("id")).toBeTruthy();
                            t.expect(model.getField("id").critical).toBe(true);
                        });


                        t.it("messageDraftId", t => {
                            t.expect(model.getField("messageDraftId")).toBeTruthy();
                            t.expect(model.getField("messageDraftId").persist).toBe(false);
                            t.expect(model.getField("messageDraftId").unique).toBe(true);
                        });


                        t.it("getAssociatedCompoundKeyedData() - MessageDraft", t => {

                            var session = Ext.create("Ext.data.Session", {
                                schema: "cn_mail-mailbaseschema"
                            });

                            var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                                subject: "test",
                                mailFolderId: 1,
                                mailAccountId: 3
                            });

                            let mb = Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                                mailFolderId: 1,
                                mailAccountId: 3
                            });

                            rec.setMessageBody(mb);

                            var rec2 = rec.getMessageBody();

                            session.adopt(rec);

                            t.expect(rec2.getAssociatedCompoundKeyedData().length).toBe(1);
                            t.expect(rec2.getAssociatedCompoundKeyedData()[0]).toBe(rec);
                        });


                        t.it("getAssociatedCompoundKeyedData() - MessageItems", t => {

                            var session = Ext.create("Ext.data.Session", {
                                schema: "cn_mail-mailbaseschema"
                            });

                            var rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                                subject: "test",
                                mailFolderId: 1,
                                mailAccountId: 3
                            });


                            rec.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                                mailFolderId: 1,
                                mailAccountId: 3
                            }));

                            var rec2 = rec.getMessageBody();

                            session.adopt(rec);

                            t.expect(rec2.getAssociatedCompoundKeyedData().length).toBe(1);
                            t.expect(rec2.getAssociatedCompoundKeyedData()[0]).toBe(rec);
                        });

                        t.it("load() - with session and proper param settings when loaded in session", t => {


                            let session = createSession(),
                                item    = getMessageItemAt(1),
                                key     = createKeyForExistingMessage(1);

                            let model = session.getRecord("MessageDraft", key.toLocalId(), {params: key.toObject()});


                            t.waitForMs(1500, function () {

                                model.loadMessageBody();

                                t.waitForMs(1500, function () {
                                    t.expect(model.getMessageBody().get("mailAccountId")).toBe(model.data.mailAccountId);
                                    t.expect(model.getMessageBody().get("mailAccountId")).toBe(item.mailAccountId);

                                    t.expect(model.getMessageBody().get("mailFolderId")).toBe(model.data.mailFolderId);
                                    t.expect(model.getMessageBody().get("mailFolderId")).toBe(item.mailFolderId);

                                    t.expect(model.getMessageBody().get("mailFolderId")).toBe(model.data.mailFolderId);
                                    t.expect(model.getMessageBody().get("id")).toBe(item.id);
                                });
                            });
                        });


                    });});


            });});});});
