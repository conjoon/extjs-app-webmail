/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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