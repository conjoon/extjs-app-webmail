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

describe('conjoon.cn_mail.view.mail.account.MailAccountViewTest', function(t) {

    let createModel = function() {

        return Ext.create('conjoon.cn_mail.model.mail.account.MailAccount', {
            name     : 'name',
            userName : 'userName',
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

    var view;



    t.afterEach(function() {
        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function() {


    });



    t.it("Should create and show the MailAccountView along with default config checks", function(t) {
        view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView');

        t.expect(view instanceof Ext.Panel).toBeTruthy();

        t.expect(view.alias).toContain('widget.cn_mail-mailaccountview');

        t.expect(view.cls).toContain('cn_mail-mailaccountview');

        t.isInstanceOf(view.getViewModel(), conjoon.cn_mail.view.mail.account.MailAccountViewModel);

        t.isInstanceOf(view.getController(), conjoon.cn_mail.view.mail.account.MailAccountViewController);
    });


    t.it("setMailAccount()", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView');

        t.isCalled('setMailAccount', view.getViewModel());

        t.expect(view.setMailAccount(null)).toBe(null);

        let ma = createModel(),
            ma2 = view.setMailAccount(ma);

        t.expect(ma2).not.toBe(ma);

        t.expect(ma2.data).toEqual(ma.data);

    });


    t.it("hasPendingChanges()", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView');

        let ma = createModel();

        t.expect(view.hasPendingChanges()).toBe(false);

        ma.set('name', 'foo');
        view.setMailAccount(ma);

        t.expect(view.hasPendingChanges()).toBe(true);

        view.getViewModel().get('mailAccount').commit();


        t.expect(view.hasPendingChanges()).toBe(false);
    });


    t.it("rejectPendingChanges()", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView');

        let ma = createModel();

        t.expect(view.rejectPendingChanges()).toBe(false);

        view.setMailAccount(ma);

        t.expect(view.rejectPendingChanges()).toBe(false);

        view.getViewModel().get('mailAccount').set('name', 'foo');

        t.expect(view.rejectPendingChanges()).toBe(true);

        t.expect(view.getViewModel().get('mailAccount').get('name')).toBe('name');

        t.expect(view.rejectPendingChanges()).toBe(false);
    });


    t.it("setMailAccount() - view updated", function(t) {

       view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView', {
           renderTo : document.body,
           height   : 600,
           width    : 800
       });

        let ma = createModel();

        view.setMailAccount(ma);

        t.waitForMs(250, function() {

            let values = view.down('form').getValues(),
                data = ma.data;

            for (let i in values) {
                if (!values.hasOwnProperty(i)) {
                    continue;
                }
                t.expect(data[i]).toBe(values[i]);
            }


        });

    });


    t.it("cancel button", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView', {
            renderTo : document.body,
            width : 800,
            height : 600
        });

        t.isCalled('onCancelButtonClick', view.getController());

        t.click(view.down('#cancelButton'), function() {

        });

    });


    t.it("save button", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView', {
            renderTo : document.body,
            width : 800,
            height : 600
        });

        t.isCalled('onSaveButtonClick', view.getController());

        t.click(view.down('#saveButton'), function() {

        });

    });


    t.it("setBusy()", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView', {
            renderTo : document.body,
            width : 800,
            height : 600
        });


        let m = view.setBusy();

        t.isInstanceOf(m, conjoon.cn_comp.component.LoadMask);

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


    t.it("setMailAccount() - switch mailAccounts and check for busyMask", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountView', {
            renderTo : document.body,
            width : 800,
            height : 600
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

});