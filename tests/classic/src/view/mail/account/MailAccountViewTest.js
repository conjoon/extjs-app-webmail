/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    let createModel = function () {

        return Ext.create("conjoon.cn_mail.model.mail.account.MailAccount", {
            name: "name",
            from: {name: "foo", address: "from"},
            replyTo: {name: "foo", address: "replyTo"},

            inbox_type: "inbox_type",
            inbox_address: "inbox_address",
            inbox_port: "inbox_port",
            inbox_ssl: true,
            inbox_user: "inbox_user",
            inbox_password: "inbox_password",

            outbox_type: "outbox_type",
            outbox_address: "outbox_address",
            outbox_port: "outbox_port",
            outbox_secure: "tsl",
            outbox_user: "outbox_user",
            outbox_password: "outbox_password"

        });

    };

    var view;


    t.afterEach(function () {
        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function () {


    });


    t.it("Should create and show the MailAccountView along with default config checks", t => {
        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView");

        t.expect(view instanceof Ext.Panel).toBeTruthy();

        t.expect(view.alias).toContain("widget.cn_mail-mailaccountview");

        t.expect(view.cls).toContain("cn_mail-mailaccountview");

        t.isInstanceOf(view.getViewModel(), conjoon.cn_mail.view.mail.account.MailAccountViewModel);

        t.isInstanceOf(view.getController(), conjoon.cn_mail.view.mail.account.MailAccountViewController);
    });


    t.it("setMailAccount()", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView");

        t.isCalled("setMailAccount", view.getViewModel());

        t.expect(view.setMailAccount(null)).toBe(null);

        let ma = createModel(),
            ma2 = view.setMailAccount(ma);

        t.expect(ma2).not.toBe(ma);

        t.expect(ma2.data).toEqual(ma.data);

    });


    t.it("hasPendingChanges()", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView");

        let ma = createModel();

        t.expect(view.hasPendingChanges()).toBe(false);

        ma.set("name", "foo");
        view.setMailAccount(ma);

        t.expect(view.hasPendingChanges()).toBe(true);

        view.getViewModel().get("mailAccount").commit();


        t.expect(view.hasPendingChanges()).toBe(false);
    });


    t.it("rejectPendingChanges()", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView");

        let ma = createModel();

        t.expect(view.rejectPendingChanges()).toBe(false);

        view.setMailAccount(ma);

        t.expect(view.rejectPendingChanges()).toBe(false);

        view.getViewModel().get("mailAccount").set("name", "foo");

        t.expect(view.rejectPendingChanges()).toBe(true);

        t.expect(view.getViewModel().get("mailAccount").get("name")).toBe("name");

        t.expect(view.rejectPendingChanges()).toBe(false);
    });


    t.it("setMailAccount() - view updated", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView", {
            renderTo: document.body,
            height: 600,
            width: 800
        });

        let ma = createModel();

        view.setMailAccount(ma);

        t.waitForMs(t.parent.TIMEOUT, () => {

            let values = view.down("form").getValues(),
                data = ma.data;

            for (let i in values) {
                if (!Object.prototype.hasOwnProperty.call(values, i)) {
                    continue;
                }

                switch (i) {
                case "userName":
                    t.expect(data["from"].name).toBe(values[i]);
                    t.expect(data["replyTo"].name).toBe(values[i]);
                    break;

                case "from":
                    t.expect(data["from"].address).toBe(values[i]);
                    break;

                case "replyTo":
                    t.expect(data["replyTo"].address).toBe(values[i]);
                    break;

                case "inactive":
                    t.expect(data["inactive"]).toBe(!values[i]);
                    break;

                default:
                    t.expect(data[i]).toBe(values[i]);
                    break;
                }

            }


        });

    });


    t.it("cancel button", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView", {
            renderTo: document.body,
            width: 800,
            height: 600
        });

        t.isCalled("onCancelButtonClick", view.getController());

        t.click(view.down("#cancelButton"), function () {

        });

    });


    t.it("save button", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView", {
            renderTo: document.body,
            width: 800,
            height: 600
        });

        const validateSpy = t.spyOn(view.getController(), "validate").and.callFake(() => true);

        t.isCalled("onSaveButtonClick", view.getController());

        t.click(view.down("#saveButton"), function () {

            t.expect(validateSpy.calls.count()).toBe(1);

            validateSpy.remove();
        });

    });


    t.it("setBusy()", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView", {
            renderTo: document.body,
            width: 800,
            height: 600
        });


        let m = view.setBusy();

        t.isInstanceOf(m, coon.comp.component.LoadMask);

        t.expect(view.busyMask).toBe(m);

        t.expect(m.isVisible()).toBe(true);

        t.expect(view.setBusy(false)).toBe(m);
        t.expect(view.busyMask).toBe(m);

        t.expect(m.isVisible()).toBe(false);

        view.close();
        view.destroy();


        t.expect(view.busyMask.destroyed).toBe(true);

        view = null;

    });


    t.it("setMailAccount() - switch mailAccounts and check for busyMask", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView", {
            renderTo: document.body,
            width: 800,
            height: 600
        });

        let maNo = createModel();

        view.setMailAccount(maNo);

        view.getViewModel().setMailAccount = Ext.emptyFn;

        t.expect(view.busyMask).toBe(null);

        let maYes = createModel();

        view.getViewModel().saveOperations[maYes.getId()] = true;

        view.setMailAccount(maYes);
        t.expect(view.busyMask.isVisible()).toBe(true);

        view.setMailAccount(maNo);
        t.expect(view.busyMask.isVisible()).toBe(false);

        view.setMailAccount(maYes);
        t.expect(view.busyMask.isVisible()).toBe(true);

    });


    t.it("cn_mail-mailaccountbeforesave", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView", {
            renderTo: document.body,
            width: 800,
            height: 600
        });

        t.isCalled("onBeforeMailAccountSave", view.getController());

        view.fireEvent("cn_mail-mailaccountbeforesave", view);
    });


    t.it("cn_mail-mailaccountsave", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView", {
            renderTo: document.body,
            width: 800,
            height: 600
        });

        t.isCalled("onMailAccountSaveCallback", view.getController());

        view.fireEvent("cn_mail-mailaccountsave", view);
    });


    t.it("cn_mail-mailaccountsavefailure", t => {

        view = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountView", {
            renderTo: document.body,
            width: 800,
            height: 600
        });

        t.isCalled("onMailAccountSaveCallback", view.getController());

        view.fireEvent("cn_mail-mailaccountsavefailure", view);
    });
});