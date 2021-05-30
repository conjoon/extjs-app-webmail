/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2020-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

    const helper =  t.l8.liquify(t.TestHelper.get(t, window));
    await helper.mockUpMailTemplates().andRun((t) => {

        var view,
            controller;

        t.afterEach(function () {
            if (view) {
                view.destroy();
                view = null;
            }

            if (controller) {
                controller.destroy();
                controller = null;
            }


        });

        t.requireOk("conjoon.dev.cn_mailsim.data.mail.PackageSim",
            "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", function () {

                Ext.ux.ajax.SimManager.init({
                    delay: 1
                });


                // +----------------------------------------------------------------------------
                // | SENDING
                // +----------------------------------------------------------------------------


                t.it("getSendMessageDraftRequestConfig()", function (t) {
                    controller = Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        });

                    let messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        mailAccountId: 1, mailFolderId: 1, id: 1
                    });
                    messageDraft.dirty = messageDraft.phantom = false;

                    t.expect(
                        controller.getSendMessageDraftRequestConfig(messageDraft)
                    ).toEqual({
                        url: "./cn_mail/SendMessage",
                        params: messageDraft.getCompoundKey().toObject()
                    });

                    let tmp = Ext.Ajax.request;

                    controller.getView = function () {
                        return {
                            getViewModel: function () {
                                return {
                                    get: function () {
                                        return messageDraft;
                                    }
                                };
                            },
                            fireEvent: function () {

                            }
                        };
                    };

                    controller.getSendMessageDraftRequestConfig = function () {
                        return {CALLED: true};
                    };

                    let REQUEST = false;
                    Ext.Ajax.request = function (cfg) {
                        REQUEST = true;
                        t.expect(cfg).toEqual({CALLED: true});
                        return Ext.Promise.resolve();
                    };

                    controller.sendMessage();

                    t.expect(REQUEST).toBe(true);
                    Ext.Ajax.request = tmp;
                });


            });});});