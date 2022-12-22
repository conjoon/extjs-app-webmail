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

    let view;

    t.afterEach(function () {
        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function () {


    });


    t.it("Should create and show the MailAccountView along with default config checks", t => {
        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountWizard");

        t.expect(view instanceof Ext.Window).toBeTruthy();
        t.expect(view.autoShow).toBe(false);
        t.expect(view.alias).toContain("widget.cn_mail-mailaccountwizard");
        t.expect(view.cls).toContain("cn_mail-mailaccountwizard");
        t.isInstanceOf(view.getController(), conjoon.cn_mail.view.mail.account.MailAccountWizardController);
    });


    t.it("show() should trigger busymask and config load", t => {
        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountWizard");

        const ctrl = view.getController();

        const busySpy = t.spyOn(view, "setBusy").and.callThrough();
        const loadSpy = t.spyOn(ctrl, "loadConfig").and.callFake(async () => {});
        const configsLoadSpy = t.spyOn(ctrl, "onConfigsLoad").and.callFake(() => {});

        view.show();

        t.waitForMs(t.parent.TIMEOUT, () => {
            t.expect(busySpy.calls.count()).toBe(1);
            t.expect(loadSpy.calls.count()).toBe(1);
            t.expect(configsLoadSpy.calls.count()).toBe(1);

            [busySpy, loadSpy, configsLoadSpy].map(spy => spy.remove());
        });
    });


    t.it("test wizard behavior w/ back-btn and create-btn ", t => {
        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountWizard");

        const configs = [{
            name: "test 1",
            displayName: "displayNameTest 1",
            config: {}
        }, {
            name: "test 2",
            displayName: "displayNameTest 2",
            config: {testField: "shouldBeAvailableInAccountModel"}
        }];

        const ctrl = view.getController();

        const envSpy = t.spyOn(coon.core.Environment, "getPathForResource").and.callFake(() => "");

        const loadSpy = t.spyOn(ctrl, "loadConfig").and.callFake(async () => configs);

        view.show();

        t.waitForMs(t.parent.TIMEOUT, () => {


            const presets = view.down("#presets");

            view.stepOneElements().map(itemId => t.expect(view.down(itemId).isHidden()).toBe(false));
            view.stepTwoElements().map(itemId => t.expect(view.down(itemId).isHidden()).toBe(true));

            t.expect(presets.getStore().getRange().length).toBe(configs.length + 1);
            t.expect(presets.getStore().getAt(2).get("name")).toBe("Email Account");

            // CLICK PRESET
            t.click(presets.getNode(presets.getStore().getAt(1)), () => {

                view.stepOneElements().map(itemId => t.expect(view.down(itemId).isHidden()).toBe(true));
                view.stepTwoElements().map(itemId => t.expect(view.down(itemId).isHidden()).toBe(false));

                t.expect(presets.getStore().getRange().length).toBe(1);
                t.expect(presets.getStore().getAt(0).get("name")).toBe(configs[1].name);


                // CLICK BACK
                t.click(view.down("#backBtn"), () => {

                    view.stepOneElements().map(itemId => t.expect(view.down(itemId).isHidden()).toBe(false));
                    view.stepTwoElements().map(itemId => t.expect(view.down(itemId).isHidden()).toBe(true));

                    t.expect(presets.getStore().getRange().length).toBe(configs.length + 1);


                    // CLICK PRESET AGAIN
                    t.click(presets.getNode(presets.getStore().getAt(1)), () => {

                        view.down("#accountNameField").setValue("accountName");
                        view.down("#nameField").setValue("fromName");
                        view.down("#emailField").setValue("fromAddress");

                        const client = {createAccount: function () {}};

                        const createAccountSpy = t.spyOn(client, "createAccount").and.callThrough();

                        view.on("accountavailable", client.createAccount);

                        // CLICK CREATE
                        t.click(view.down("#createBtn"), () => {

                            const rec = createAccountSpy.calls.mostRecent().args[1];
                            t.expect(rec.get("testField")).toBe("shouldBeAvailableInAccountModel");
                            t.expect(rec.get("name")).toBe("accountName");
                            t.expect(rec.get("from")).toEqual({name: "fromName", address: "fromAddress"});

                            t.isInstanceOf(rec, "conjoon.cn_mail.model.mail.account.MailAccount");

                            [loadSpy, envSpy,createAccountSpy].map(spy => spy.remove());
                        });
                    });
                });

            });

        });
    });

});