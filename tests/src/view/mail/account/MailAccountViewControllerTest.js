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

StartTest(t => {

    let VIEW_ISBUSY = false,
        VIEW_ISVISIBLE = true;

    let createCtrlMock = function () {
        let ctrl = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewController");

        let viewModel = {
            savePendingChanges: function () {

            },
            cleanup: function () {

            }
        };

        let view =  {
            rejectPendingChanges: function () {

            },
            getViewModel: function () {
                return viewModel;
            },
            setBusy: function (isBusy = true) {
                VIEW_ISBUSY = isBusy;
            },
            isVisible: function () {
                return VIEW_ISVISIBLE;
            }
        };

        ctrl.getView = function () {
            return view;
        };

        return ctrl;
    };


    let ctrl;


    t.afterEach(function () {
        Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
        Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");
        if (ctrl) {
            ctrl.destroy();
            ctrl = null;
        }


    });

    t.beforeEach(function () {


    });


    t.it("Should create and show the MailAccountViewController along with default config checks", t => {
        ctrl = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewController");

        t.expect(ctrl instanceof Ext.app.ViewController).toBeTruthy();

        t.expect(ctrl.alias).toContain("controller.cn_mail-mailaccountviewcontroller");


    });


    t.it("onCancelButtonClick()", t => {

        ctrl = createCtrlMock();

        t.isCalled("rejectPendingChanges", ctrl.getView());

        ctrl.onCancelButtonClick();

    });


    t.it("onSaveButtonClick()", t => {

        ctrl = createCtrlMock();


        t.isCalled("savePendingChanges", ctrl.getView().getViewModel());

        ctrl.onSaveButtonClick();

    });


    t.it("onBeforeMailAccountSave()", t => {

        ctrl = createCtrlMock();


        t.isCalled("setBusy", ctrl.getView());

        t.expect(VIEW_ISBUSY).toBe(false);

        ctrl.onBeforeMailAccountSave(ctrl.getView());

        t.expect(VIEW_ISBUSY).toBe(true);
    });


    t.it("onMailAccountSaveCallback() - visible view", t => {

        ctrl = createCtrlMock();

        VIEW_ISBUSY    = true;
        VIEW_ISVISIBLE = true;

        t.isCalled("setBusy", ctrl.getView());

        t.isntCalled("cleanup", ctrl.getView().getViewModel());

        ctrl.onMailAccountSaveCallback(ctrl.getView());

        t.expect(VIEW_ISBUSY).toBe(false);
    });


    t.it("onMailAccountSaveCallback() - hidden view", t => {

        ctrl = createCtrlMock();

        VIEW_ISBUSY    = true;
        VIEW_ISVISIBLE = false;

        t.isCalled("setBusy", ctrl.getView());

        t.isCalled("cleanup", ctrl.getView().getViewModel());

        ctrl.onMailAccountSaveCallback(ctrl.getView());

        t.expect(VIEW_ISBUSY).toBe(false);
    });


    t.it("onMailAccountViewHide()", t => {

        ctrl = createCtrlMock();

        t.isCalled("cleanup", ctrl.getView().getViewModel());

        ctrl.onMailAccountViewHide(ctrl.getView());
    });

});
