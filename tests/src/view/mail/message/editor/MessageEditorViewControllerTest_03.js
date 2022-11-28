/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2020-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.setupSimlets().registerIoC().mockUpMailTemplates().andRun((t) => {

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

        t.requireOk("conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", () => {

            Ext.ux.ajax.SimManager.init({
                delay: 1
            });


            // +----------------------------------------------------------------------------
            // | SENDING
            // +----------------------------------------------------------------------------


            t.it("getSendMessageDraftRequestConfig()", t => {
                controller = Ext.create(
                    "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController", {
                        requestConfigurator: Ext.create("coon.core.data.request.Configurator")
                    });

                const expectedRequestCfg = {
                        url: "./cn_mail/MailAccounts/1/MailFolders/3/MessageItems/2",
                        method: "POST"
                    },
                    requestConfiguratorSpy = t.spyOn(controller.requestConfigurator, "configure").and.callFake(
                        cfg => Object.assign({headers: "injected"}, expectedRequestCfg)
                    );

                let messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                    mailAccountId: 1, mailFolderId: 3, id: 2
                });
                messageDraft.dirty = messageDraft.phantom = false;

                let exc;
                try {
                    controller.getSendMessageDraftRequestConfig(messageDraft);
                } catch (e) {
                    exc = e;
                }
                t.expect(exc).toContain("baseAddress");


                t.expect(
                    controller.getSendMessageDraftRequestConfig(messageDraft, ".//cn_mail///")
                ).toEqual(requestConfiguratorSpy.calls.mostRecent().returnValue);
                t.expect(requestConfiguratorSpy.calls.mostRecent().args[0]).toEqual(expectedRequestCfg);


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
