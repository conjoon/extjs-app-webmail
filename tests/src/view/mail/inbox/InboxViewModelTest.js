/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe("conjoon.cn_mail.view.mail.inbox.InboxViewModelTest", function (t) {

    const TIMEOUT = 1250;

    var viewModel,
        decorateMockView = function (viewModel) {

            let splitter = {
                visible: true,
                isVisible: function () {
                    return this.visible;
                },
                splitter: {
                    orientation: {

                    }
                }
            };

            let view = {
                down: function () {
                    return splitter;
                }
            };

            viewModel.getView = function () {
                return view;
            };


        };

    t.afterEach(function () {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }
    });

    t.requireOk("conjoon.dev.cn_mailsim.data.mail.PackageSim", function () {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        t.it("Should create the ViewModel", function (t) {
            viewModel = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxViewModel");
            t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);

            t.expect(viewModel.alias).toContain("viewmodel.cn_mail-mailinboxviewmodel");

        });

        t.it("Should properly define the stores", function (t) {
            viewModel = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxViewModel");

            // check config since store filters uses binding.
            // store won't be available until binding is set,
            // so simply query the defaultConfig
            let store = viewModel.defaultConfig.stores["cn_mail_mailmessageitemstore"];

            t.expect(store.type).toBe("cn_mail-mailmessageitemstore");
            t.expect(store.autoLoad).toBe(true);

            t.expect(store.filters.length).toBe(2);

            t.expect(store.filters).toEqual([{
                disabled: "{cn_mail_ref_mailfoldertree.selection.folderType === \"ACCOUNT\"}",
                property: "mailFolderId",
                value: "{cn_mail_ref_mailfoldertree.selection.id}"
            }, {
                disabled: "{cn_mail_ref_mailfoldertree.selection.folderType === \"ACCOUNT\"}",
                property: "mailAccountId",
                value: "{cn_mail_ref_mailfoldertree.selection.mailAccountId}"
            }]);

        });


        t.it("Should properly test updateUnreadMessageCount", function (t) {


            viewModel = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxViewModel", {
                stores: {
                    "cn_mail_mailfoldertreestore": {
                        type: "cn_mail-mailfoldertreestore",
                        autoLoad: true
                    }
                }
            });
            decorateMockView(viewModel);


            t.waitForMs(TIMEOUT, function () {
                var store = viewModel.getStore("cn_mail_mailfoldertreestore"),
                    rec = store.getRoot().findChild("id", "dev_sys_conjoon_org").findChild("id", "INBOX");

                t.expect(rec.get("unreadCount")).toBe(3787);

                viewModel.updateUnreadMessageCount("dev_sys_conjoon_org", "INBOX", -10);

                t.expect(rec.get("unreadCount")).toBe(3777);

                viewModel.updateUnreadMessageCount("dev_sys_conjoon_org", "INBOX", 12);

                t.expect(rec.get("unreadCount")).toBe(3789);

            });


        });


        t.it("app-cn_mail#83 - no load if any filter is disabled", function (t) {

            viewModel = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxViewModel");

            decorateMockView(viewModel);

            viewModel.set("cn_mail_ref_mailfoldertree.selection.folderType", "foo");
            viewModel.set("cn_mail_ref_mailfoldertree.selection.id", "a");
            viewModel.set("cn_mail_ref_mailfoldertree.selection.mailAccountId", "b");

            t.waitForMs(TIMEOUT, function () {

                let store = viewModel.getStore("cn_mail_mailmessageitemstore"),
                    defaultStoreConfig = viewModel.defaultConfig.stores["cn_mail_mailmessageitemstore"];

                t.expect(store.isLoading()).toBe(false);
                t.expect(store.isLoaded()).toBe(true);

                viewModel.set("cn_mail_ref_mailfoldertree.selection.folderType", "ACCOUNT");
                viewModel.notify();

                t.expect(defaultStoreConfig.listeners.beforeload(store)).toBe(false);

                viewModel.set("cn_mail_ref_mailfoldertree.selection.folderType", "INBOX");
                viewModel.notify();

                t.expect(defaultStoreConfig.listeners.beforeload(store)).not.toBe(false);
            });

        });


        t.it("app-cn_mail#98", function (t) {

            viewModel = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxViewModel");

            decorateMockView(viewModel);

            t.expect(viewModel.get("messageViewHidden")).toBe(false);

            let FOLDERTYPE = "ACCOUNT",
                MESSAGEVIEWHIDDEN = false,
                get = function (key) {
                    switch (key) {
                    case "cn_mail_ref_mailfoldertree.selection.folderType":
                        return FOLDERTYPE;

                    case "messageViewHidden":
                        return MESSAGEVIEWHIDDEN;
                    }

                };

            FOLDERTYPE = "ACCOUNT";
            viewModel.getView().down("foo").splitter.orientation = "vertical";
            t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 0 0 0");

            viewModel.getView().down("foo").splitter.orientation = "horizontal";
            t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 0 0 0");


            FOLDERTYPE = "bar";
            viewModel.getView().down("foo").splitter.orientation = "vertical";
            t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 0 5 0");

            viewModel.getView().down("foo").splitter.orientation = "horizontal";
            t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 5 0 0");

            MESSAGEVIEWHIDDEN = true;
            t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 5 5 0");


        });


    });});