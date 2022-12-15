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

    const helper =  l8.liquify(TestHelper.get(t, window));
    await helper.registerIoC().setupSimlets().andRun((t) => {

        t.requireOk(
            "conjoon.cn_mail.data.mail.message.EditingModes",
            "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", () => {

                const createKey = function (id1, id2, id3) {
                        return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
                    },
                    createKeyForExistingMessage = function (messageIndex){
                        let item = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(messageIndex);

                        let key = createKey(
                            item.mailAccountId, item.mailFolderId, item.id
                        );

                        return key;
                    };


                Ext.ux.ajax.SimManager.init({
                    delay: 1
                });

                t.it("constructor()", t => {
                    var copier;

                    copier = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier");

                    t.expect(copier).toBeTruthy();
                });


                t.it("loadMessageDraftCopy() - exceptions", t => {
                    var copier, exc, request;
                    copier = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier");

                    try {
                        copier.loadMessageDraftCopy(null, Ext.emptyFn);
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toContain("must be an instance of");
                    exc = undefined;


                    request = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                        compoundKey: createKeyForExistingMessage(1),
                        editMode: conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO,
                        defaultMailAccountId: "foo",
                        defaultMailFolderId: "bar"
                    });

                    try {
                        copier.loadMessageDraftCopy(request, null);
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toContain("must be a valid callback");


                    request = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                        compoundKey: createKeyForExistingMessage(1),
                        editMode: conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
                    });

                    try {
                        copier.loadMessageDraftCopy(request, Ext.emptyFn);
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toContain("is not fully configured");
                });


                const testLoad = function (t, key, expected) {

                    var SUCCESS     = false,
                        DRAFTCONFIG = null,
                        COPIER      = null,
                        OPERATION   = null,
                        SCOPE       = null,
                        scope       = {foo: "bar"},
                        func        = function (copier, draftConfig, success, operation) {

                            SCOPE       = this;
                            COPIER      = copier;
                            SUCCESS     = success;
                            DRAFTCONFIG = draftConfig;
                            OPERATION   = operation;
                        },
                        request = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                            compoundKey: key,
                            editMode: conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO,
                            defaultMailAccountId: "foo",
                            defaultMailFolderId: "bar"
                        }),
                        copier;
                    copier = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier");

                    copier.loadMessageDraftCopy(request, func, scope);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        t.expect(SCOPE).toBe(scope);
                        t.expect(COPIER).toBe(copier);
                        t.expect(SUCCESS).toBe(expected);

                        t.isInstanceOf(OPERATION, "Ext.data.operation.Read");

                        if (expected) {
                            t.isInstanceOf(DRAFTCONFIG, conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig);
                            t.expect(DRAFTCONFIG.getMailAccountId()).toBe("foo");
                            t.expect(DRAFTCONFIG.getMailFolderId()).toBe("bar");
                        } else {
                            t.expect(DRAFTCONFIG).toBe(null);
                        }

                    });
                };


                t.it("loadMessageDraftCopy() - success", t => {
                    testLoad(t, createKeyForExistingMessage(1), true);
                });


                t.it("loadMessageDraftCopy() - failure", t => {
                    testLoad(t, createKey(1, 2, 3), false);
                });


            });

    });});
