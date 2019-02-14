/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

describe('conjoon.cn_mail.view.mail.account.MailAccountViewControllerTest', function(t) {

    let VIEW_ISBUSY = false,
        VIEW_ISVISIBLE = true;

    let createCtrlMock = function() {
        let ctrl = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewController');

        let viewModel = {
            savePendingChanges : function() {

            },
            cleanup : function() {

            }
        };

        let view =  {
            rejectPendingChanges : function() {

            },
            getViewModel : function() {
                return viewModel;
            },
            setBusy : function(isBusy = true) {
                VIEW_ISBUSY = isBusy;
            },
            isVisible : function() {
                return VIEW_ISVISIBLE;
            }
        };

        ctrl.getView = function() {
            return view;
        }

        return ctrl;
    }



    let createModel = function() {

        return Ext.create('conjoon.cn_mail.model.mail.account.MailAccount', {
            name     : 'name',
            from     : 'from',
            replyTo  : 'replyTo',

            inbox_type     : 'inbox_type',
            inbox_address  : 'inbox_address',
            inbox_port     : 'inbox_port',
            inbox_ssl      : true,
            inbox_user     : 'inbox_user',
            inbox_password : 'inbox_password',

            outbox_type     : 'outbox_type',
            outbox_address  : 'outbox_address',
            outbox_port     : 'outbox_port',
            outbox_ssl      : true,
            outbox_user     : 'outbox_user',
            outbox_password : 'outbox_password'
        });

    };

    let ctrl;


    t.afterEach(function() {
        if (ctrl) {
            ctrl.destroy();
            ctrl = null;
        }


    });

    t.beforeEach(function() {


    });



    t.it("Should create and show the MailAccountViewController along with default config checks", function(t) {
        ctrl = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewController');

        t.expect(ctrl instanceof Ext.app.ViewController).toBeTruthy();

        t.expect(ctrl.alias).toContain('controller.cn_mail-mailaccountviewcontroller');


    });


    t.it("onCancelButtonClick()", function(t) {

        ctrl = createCtrlMock();

        t.isCalled('rejectPendingChanges', ctrl.getView());

        ctrl.onCancelButtonClick();

    });


    t.it("onSaveButtonClick()", function(t) {

        ctrl = createCtrlMock();


        t.isCalled('savePendingChanges', ctrl.getView().getViewModel());

        ctrl.onSaveButtonClick();

    });


    t.it("onBeforeMailAccountSave()", function(t) {

        ctrl = createCtrlMock();


        t.isCalled('setBusy', ctrl.getView());

        t.expect(VIEW_ISBUSY).toBe(false);

        ctrl.onBeforeMailAccountSave(ctrl.getView());

        t.expect(VIEW_ISBUSY).toBe(true);
    });


    t.it("onMailAccountSaveCallback() - visible view", function(t) {

        ctrl = createCtrlMock();

        VIEW_ISBUSY    = true;
        VIEW_ISVISIBLE = true;

        t.isCalled('setBusy', ctrl.getView());

        t.isntCalled('cleanup', ctrl.getView().getViewModel());

        ctrl.onMailAccountSaveCallback(ctrl.getView());

        t.expect(VIEW_ISBUSY).toBe(false);
    });


    t.it("onMailAccountSaveCallback() - hidden view", function(t) {

        ctrl = createCtrlMock();

        VIEW_ISBUSY    = true;
        VIEW_ISVISIBLE = false;

        t.isCalled('setBusy', ctrl.getView());

        t.isCalled('cleanup', ctrl.getView().getViewModel());

        ctrl.onMailAccountSaveCallback(ctrl.getView());

        t.expect(VIEW_ISBUSY).toBe(false);
    });


    t.it("onMailAccountViewHide()", function(t) {

        ctrl = createCtrlMock();

        t.isCalled('cleanup', ctrl.getView().getViewModel());

        ctrl.onMailAccountViewHide(ctrl.getView());
    });

});
