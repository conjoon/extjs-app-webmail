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

describe('conjoon.cn_mail.view.mail.account.MailAccountViewModelTest', function(t) {

    let createModel = function (id) {

        return Ext.create('conjoon.cn_mail.model.mail.account.MailAccount', {
            id  : id ? id : undefined,
            name: 'name',
            userName: 'userName',
            from: 'from',
            replyTo: 'replyTo',

            inbox_type: 'inbox_type',
            inbox_address: 'inbox_address',
            inbox_port: 'inbox_port',
            inbox_ssl: true,
            inbox_user: 'inbox_user',
            inbox_password: 'inbox_password',

            outbox_type: 'outbox_type',
            outbox_address: 'outbox_address',
            outbox_port: 'outbox_port',
            outbox_ssl: true,
            outbox_user: 'outbox_user',
            outbox_password: 'outbox_password'
        });

    };

    let viewModel;


    t.afterEach(function () {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }

    });

    t.beforeEach(function () {


    });

t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function () {

    t.it("Should create and show the MailAccountViewModel along with default config checks", function (t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        t.expect(viewModel instanceof Ext.app.ViewModel).toBeTruthy();

        t.expect(viewModel.alias).toContain('viewmodel.cn_mail-mailaccountviewmodel');

        t.expect(viewModel.saveOperations).toEqual({});
        t.expect(viewModel.sourceMailAccounts).toEqual({});

        t.expect(viewModel.get('mailAccount')).toBe(null);
    });


    t.it("setMailAccount()", function (t) {

        let exc, e;

        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        t.isCalled('cleanup', viewModel);

        t.expect(viewModel.sourceMailAccounts).toEqual({});

        try {
            viewModel.setMailAccount(null);
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

        let ma = createModel(),
            ma2 = viewModel.setMailAccount(ma);

        t.expect(viewModel.sourceMailAccounts[ma2.getId()]).toBe(ma);
        t.expect(ma2).not.toBe(ma);
        t.expect(ma2.data).toEqual(ma.data);
    });


    t.it("setMailAccount() with existing saveOperation", function (t) {

        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        let ma = createModel();

        let saveOperations = {};

        saveOperations[ma.getId()] = {
            getRecords: function () {
                return [ma];
            }
        };

        viewModel.saveOperations = saveOperations;

        t.expect(viewModel.setMailAccount(ma)).toBe(ma);

    });


    t.it("cleanup()", function (t) {

        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');


        t.expect(viewModel.cleanup()).toBe(false);

        let ma = createModel(),
            id = ma.getId(),
            saveOperations = {};

        viewModel.set('mailAccount', {id: id})
        viewModel.sourceMailAccounts[id] = ma;

        saveOperations[id] = {
            getRecords: function () {
                return [ma];
            },
            isComplete: function () {
                return true;
            }
        };

        viewModel.saveOperations = saveOperations;

        t.expect(viewModel.cleanup()).toBe(true);

        t.expect(viewModel.saveOperations).toEqual({});
        t.expect(viewModel.sourceMailAccounts).toEqual({});

    });


    t.it("savePendingChanges()", function (t) {

        Ext.ux.ajax.SimManager.init({
            delay: 500
        });


        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        let ma = createModel('snafu');

        viewModel.setMailAccount(ma);

        t.expect(viewModel.savePendingChanges()).toBe(null);

        viewModel.set('mailAccount.name', 'foo');

        let CALLED = 0;
        viewModel.getView = function () {
            return {
                fireEvent : function (evt) {
                    if (evt === "cn_mail-mailaccountbeforesave") {
                        CALLED++;
                    }
                }
            }
        };

        t.isCalled('onSaveSuccess', viewModel);

        let op = viewModel.savePendingChanges();
        t.isInstanceOf(op, Ext.data.operation.Update);
        t.expect(CALLED).toBe(1);
        t.expect(viewModel.saveOperations[ma.getId()], op);

        t.waitForMs(1250, function() {
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
        });

    });


    t.it("savePendingChanges() - failure", function (t) {

        Ext.ux.ajax.SimManager.init({
            delay: 500
        });


        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        let ma = createModel('snafu');

        viewModel.setMailAccount(ma);

        viewModel.set('mailAccount.name', 'FAILURE');

        viewModel.getView = function () {
            return {
                fireEvent : function (evt) {}
            }
        };

        t.isCalled('onSaveFailure', viewModel);

        viewModel.savePendingChanges();

        t.waitForMs(1250, function() {
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
        });

    });


    t.it("onSaveSuccess()", function(t) {


        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        let ma = createModel(),
            id = ma.getId();

        viewModel.sourceMailAccounts[id] = ma;

        let fields = ['name',
            'userName',
            'from',
            'replyTo',

            'inbox_type',
            'inbox_address',
            'inbox_port',
            'inbox_ssl',
            'inbox_user',
            'inbox_password',

            'outbox_type',
            'outbox_address',
            'outbox_port',
            'outbox_ssl',
            'outbox_user',
            'outbox_password'];


        let record = {data : {}};
        record.getId = function() {
            return ma.getId();
        };

        for (let i = 0, len = fields.length; i < len; i++) {
            record.data[fields[i]] = fields[i].indexOf('_ssl') !== -1 ? true : Ext.id();
        }

        let CALLED = 0;
        viewModel.getView = function () {
            return {
                fireEvent : function (evt) {
                    if (evt === "cn_mail-mailaccountsave") {
                        CALLED++;
                    }
                }
            }
        };

        viewModel.onSaveSuccess(record);

        t.expect(CALLED).toBe(1);

        for (let i = 0, len = fields.length; i < len; i++) {
            t.expect(record.data[fields[i]]).toBe(viewModel.sourceMailAccounts[id].data[fields[i]]);
        }

        t.expect(viewModel.sourceMailAccounts[id].modified).toBeFalsy();
    });


    t.it("onSaveFailure", function(t) {

        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        let CALLED = 0;
        viewModel.getView = function () {
            return {
                fireEvent : function (evt) {
                    if (evt === "cn_mail-mailaccountsavefailure") {
                        CALLED++;
                    }
                }
            }
        };


        viewModel.onSaveFailure();

        t.expect(CALLED).toBe(1);
    });

})});