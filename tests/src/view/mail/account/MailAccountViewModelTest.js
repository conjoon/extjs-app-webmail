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

    let viewModel;


    t.afterEach(function() {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }

    });

    t.beforeEach(function() {


    });



    t.it("Should create and show the MailAccountViewModel along with default config checks", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        t.expect(viewModel instanceof Ext.app.ViewModel).toBeTruthy();

        t.expect(viewModel.alias).toContain('viewmodel.cn_mail-mailaccountviewmodel');

        t.expect(viewModel.get('mailAccount')).toBe(null);
    });


    t.it("setMailAccount()", function(t) {

        let exc, e;

        viewModel = Ext.create('conjoon.cn_mail.view.mail.account.MailAccountViewModel');

        t.expect(viewModel.sourceMailAccount).toBe(null);

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

        t.expect(viewModel.sourceMailAccount).toBe(ma);
        t.expect(ma2).not.toBe(ma);
        t.expect(ma2.data).toEqual(ma.data);
    });



});
