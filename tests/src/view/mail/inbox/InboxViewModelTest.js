/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.view.mail.inbox.InboxViewModelTest', function(t) {

    var viewModel;

    t.afterEach(function() {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }
    });

    t.it("Should create the ViewModel", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxViewModel');
        t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);

        t.expect(viewModel.alias).toContain('viewmodel.cn_mail-mailinboxviewmodel');

    });

    t.it("Should properly define the stores", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxViewModel');

        // check config since store filters uses binding.
        // store won't be available until binding is set,
        // so simply query the defaultConfig
        t.expect(viewModel.defaultConfig.stores).toEqual({

            'cn_mail-mailfoldertreestore' : {
                type     : 'cn_mail-mailfoldertreestore',
                autoLoad : true
            },

            'cn_mail-mailmessageitemstore' : {
                type : 'cn_mail-mailmessageitemstore',
                autoLoad : true,
                filters : [{
                    property : 'mailFolderId',
                    value    : '{cn_mail_ref_mailfoldertree.selection.id}'
                }, {
                    property : 'mailAccountId',
                    value    : '{cn_mail_ref_mailfoldertree.selection.mailAccountId}'
                }]
            }
        });

    });


    t.it("Should properly test updateUnreadMessageCount", function(t) {

        t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.folder.MailFolderSim', function() {

            Ext.ux.ajax.SimManager.init({
                delay: 1
            });

            viewModel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxViewModel');


            t.waitForMs(500, function() {
                var store = viewModel.getStore('cn_mail-mailfoldertreestore'),
                    rec = store.getAt(store.findExact('id', 'INBOX'));

                t.expect(rec.get('unreadCount')).toBe(3787);

                viewModel.updateUnreadMessageCount('dev_sys_conjoon_org', 'INBOX', -10);

                t.expect(rec.get('unreadCount')).toBe(3777);

                viewModel.updateUnreadMessageCount('dev_sys_conjoon_org', 'INBOX', 12);

                t.expect(rec.get('unreadCount')).toBe(3789);

            });

        });
    });




});
