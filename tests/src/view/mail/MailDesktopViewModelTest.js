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

describe('conjoon.cn_mail.view.mail.MailDesktopViewModelTest', function(t) {

    t.it("Should create the ViewModel", function(t) {

        let c = Ext.create('Ext.app.ViewController', {
            onMailFolderTreeStoreLoad : Ext.emptyFn
        });

        let p = Ext.create('Ext.Panel', {

            viewModel : Ext.create('conjoon.cn_mail.view.mail.MailDesktopViewModel'),

            controller : c

        });

        viewModel = p.getViewModel();
        t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);

        t.expect(viewModel.alias).toContain('viewmodel.cn_mail-maildesktopviewmodel');

    });

    t.it("Should properly define the stores", function(t) {

        let c = Ext.create('Ext.app.ViewController', {
            onMailFolderTreeStoreLoad : Ext.emptyFn
        });

        let p = Ext.create('Ext.Panel', {

            viewModel : Ext.create('conjoon.cn_mail.view.mail.MailDesktopViewModel'),

            controller : c

        });

        viewModel = p.getViewModel();


        t.expect(viewModel.defaultConfig.stores).toEqual({
            'cn_mail_mailfoldertreestore' : {
                type     : 'cn_mail-mailfoldertreestore',
                autoLoad : true,
                listeners : {
                    load : 'onMailFolderTreeStoreLoad'
                }
            }
        });

    });

});