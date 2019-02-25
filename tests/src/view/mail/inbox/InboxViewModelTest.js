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

describe('conjoon.cn_mail.view.mail.inbox.InboxViewModelTest', function(t) {

    const TIMEOUT = 1250;

    var viewModel,
        decorateMockView = function(viewModel) {

            let splitter = {
                visible : true,
                isVisible : function() {
                    return this.visible;
                },
                splitter : {
                    orientation : {

                    }
                }
            };

            let view = {
                down : function() {
                    return splitter;
                }
            };

            viewModel.getView = function() {
                return view;
            };


        };

    t.afterEach(function() {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }
    });

t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function() {

    Ext.ux.ajax.SimManager.init({
        delay: 1
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
        let store = viewModel.defaultConfig.stores['cn_mail-mailmessageitemstore'];

        t.expect(store.type).toBe('cn_mail-mailmessageitemstore');
        t.expect(store.autoLoad).toBe(true);

        t.expect(store.filters.length).toBe(2);

        t.expect(store.filters).toEqual([{
            disabled : '{cn_mail_ref_mailfoldertree.selection.cn_folderType === "ACCOUNT"}',
            property : 'mailFolderId',
            value    : '{cn_mail_ref_mailfoldertree.selection.id}'
        }, {
            disabled : '{cn_mail_ref_mailfoldertree.selection.cn_folderType === "ACCOUNT"}',
            property : 'mailAccountId',
            value    : '{cn_mail_ref_mailfoldertree.selection.mailAccountId}'
        }]);

    });


    t.it("Should properly test updateUnreadMessageCount", function(t) {




            viewModel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxViewModel', {
                stores : {
                    'cn_mail-mailfoldertreestore' : {
                        type : 'cn_mail-mailfoldertreestore',
                        autoLoad : true
                    }
                }
            });
            decorateMockView(viewModel);


            t.waitForMs(TIMEOUT, function() {
                var store = viewModel.getStore('cn_mail-mailfoldertreestore'),
                    rec = store.getRoot().findChild('id', 'dev_sys_conjoon_org').findChild('id', 'INBOX');

                t.expect(rec.get('unreadCount')).toBe(3787);

                viewModel.updateUnreadMessageCount('dev_sys_conjoon_org', 'INBOX', -10);

                t.expect(rec.get('unreadCount')).toBe(3777);

                viewModel.updateUnreadMessageCount('dev_sys_conjoon_org', 'INBOX', 12);

                t.expect(rec.get('unreadCount')).toBe(3789);

            });


    });


    t.it("app-cn_mail#83 - no load if any filter is disabled", function(t) {

        viewModel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxViewModel');

        decorateMockView(viewModel);

        viewModel.set('cn_mail_ref_mailfoldertree.selection.cn_folderType', 'foo');
        viewModel.set('cn_mail_ref_mailfoldertree.selection.id', 'a');
        viewModel.set('cn_mail_ref_mailfoldertree.selection.mailAccountId', 'b');

        t.waitForMs(TIMEOUT, function() {

            let store = viewModel.getStore('cn_mail-mailmessageitemstore'),
                defaultStoreConfig = viewModel.defaultConfig.stores['cn_mail-mailmessageitemstore'];

            t.expect(store.isLoading()).toBe(false);
            t.expect(store.isLoaded()).toBe(true);

            viewModel.set('cn_mail_ref_mailfoldertree.selection.cn_folderType', 'ACCOUNT');
            viewModel.notify();

            t.expect(defaultStoreConfig.listeners.beforeload(store)).toBe(false);

            viewModel.set('cn_mail_ref_mailfoldertree.selection.cn_folderType', 'INBOX');
            viewModel.notify();

            t.expect(defaultStoreConfig.listeners.beforeload(store)).not.toBe(false);
        });

    });


    t.it("app-cn_mail#98", function(t) {

        viewModel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxViewModel');

        decorateMockView(viewModel);

        t.expect(viewModel.get('messageViewHidden')).toBe(false);

        let FOLDERTYPE = "ACCOUNT",
            MESSAGEVIEWHIDDEN = false,
            get = function(key) {
                switch (key) {
                    case 'cn_mail_ref_mailfoldertree.selection.cn_folderType':
                        return FOLDERTYPE;

                    case 'messageViewHidden':
                        return MESSAGEVIEWHIDDEN;
                }

            };

        FOLDERTYPE = "ACCOUNT";
        viewModel.getView().down('foo').splitter.orientation = 'vertical';
        t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 0 0 0");

        viewModel.getView().down('foo').splitter.orientation = 'horizontal';
        t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 0 0 0");


        FOLDERTYPE = "bar";
        viewModel.getView().down('foo').splitter.orientation = 'vertical';
        t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 0 5 0");

        viewModel.getView().down('foo').splitter.orientation = 'horizontal';
        t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 5 0 0");

        MESSAGEVIEWHIDDEN = true;
        t.expect(viewModel.getFormulas().computeMessageGridMargin.apply(viewModel, [get])).toBe("0 5 5 0");



    });



});});