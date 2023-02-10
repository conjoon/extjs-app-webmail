/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    t.requireOk("conjoon.cn_mail.view.mail.account.MailAccountWizardController", () => {


        let handler;

        const CLASS_NAME = "conjoon.cn_mail.view.mail.account.MailAccountHandler";
        const PARENT_CLASS = "conjoon.cn_mail.view.mail.account.MailAccountHandler";

        const create = () => Ext.create(CLASS_NAME);

        let PANEL;

        let WIZARD_SPY;

        t.afterEach(function () {
            if (handler) {
                handler.destroy();
                handler = null;
            }

            if (PANEL) {
                PANEL.destroy();
                PANEL = null;
            }

            if (WIZARD_SPY) {
                WIZARD_SPY.remove();
                WIZARD_SPY = null;
            }
        });


        t.beforeEach(function () {
            PANEL = Ext.create("Ext.Panel", {
                renderTo: document.body,
                width: "100%",
                height: "100%",
                title: "MainView"
            });

            WIZARD_SPY = t.spyOn(
                conjoon.cn_mail.view.mail.account.MailAccountWizardController.prototype,
                "loadConfig"
            ).and.callFake(async () => [{}]);

        });


        t.it("Sanity checks", t => {
            handler = create();

            t.isInstanceOf(handler, PARENT_CLASS);
            t.expect(handler.enabled()).toBe(true);
        });


        t.it("invoke()", t => {

            handler = create();

            const
                fakeStore = {
                    addMailAccount: function () {}
                },
                viewSpy = t.spyOn(handler, "getMailMainPackageView").and.callFake(() => PANEL);


            t.isInstanceOf(handler.invoke(), "conjoon.cn_mail.view.mail.account.MailAccountWizard");

            t.waitForMs(t.parent.TIMEOUT, () => {
                const accountWizard = handler.accountWizard;

                t.isInstanceOf(accountWizard, "conjoon.cn_mail.view.mail.account.MailAccountWizard");
                t.expect(accountWizard.isVisible()).toBe(true);

                const mailAccount = Ext.create("conjoon.cn_mail.model.mail.account.MailAccount");
                const saveSpy = t.spyOn(mailAccount, "save").and.callFake(() => {});
                const storeSpy = t.spyOn(handler, "getMailFolderStore").and.callFake(() => fakeStore);
                const addMailAccountSpy = t.spyOn(fakeStore, "addMailAccount").and.callFake(() => {});

                accountWizard.fireEvent("accountavailable", accountWizard, mailAccount);

                t.expect(saveSpy.calls.mostRecent().args[0]).toEqual({
                    success: handler.onMailAccountSaveSuccess,
                    failure: handler.onMailAccountSaveFailure,
                    scope: handler
                });

                t.expect(addMailAccountSpy.calls.mostRecent().args[0]).toBe(mailAccount);

                accountWizard.close();

                [
                    viewSpy, saveSpy, storeSpy, addMailAccountSpy
                ].map(spy => spy.remove());

            });
        });


        t.it("onMailAccountSaveSuccess", t => {

            const fakeSelModel = {
                select: function () {}
            };
            const fakeMailAccount = {};

            handler = create();

            const viewSpy = t.spyOn(handler, "getMailMainPackageView").and.callFake(() => PANEL);
            const selModelSpy = t.spyOn(handler, "getMailFolderTreeSelectionModel").and.callFake(() => fakeSelModel);
            const selectSpy = t.spyOn(fakeSelModel, "select").and.callFake(() => {});

            handler.invoke();

            t.waitForMs(t.parent.TIMEOUT, () => {
                t.expect(handler.accountWizard.isVisible()).toBe(true);

                handler.onMailAccountSaveSuccess(fakeMailAccount);

                t.expect(selectSpy.calls.mostRecent().args[0]).toBe(fakeMailAccount);
                t.expect(handler.accountWizard.destroyed).toBe(true);

                [viewSpy, selModelSpy, selectSpy].map(spy => spy.remove());
            });

        });


        t.it("onMailAccountSaveFailure", t => {

            handler = create();

            const viewSpy = t.spyOn(handler, "getMailMainPackageView").and.callFake(() => PANEL);
            const maskSpy = t.spyOn(handler, "showFailureMask").and.callFake(() => {});

            handler.invoke();

            t.waitForMs(t.parent.TIMEOUT, () => {

                t.expect(handler.accountWizard.isVisible()).toBe(true);
                handler.onMailAccountSaveFailure();
                t.expect(maskSpy.calls.count()).toBe(1);

                [viewSpy, maskSpy].map(spy => spy.remove());
            });

        });

    });
});