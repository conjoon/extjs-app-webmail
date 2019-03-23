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

/**
 * The default viewModel for {@link conjoon.cn_mail.view.mail.inbox.InboxView}.
 * This default implementation is configured to be used with {@link conjoon.cn_mail.view.mail.inbox.InboxView},
 * which binds the stores "cn_mail_mailfolderstore" and
 * "cn_mail_mailmessageitemstore" to its MailFolderTree and MessageGrid.
 * Additionally, the filter of the "cn_mail_mailmessageitemstore" is bound to the
 * id of the selection in the MailFolderTree.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.MailDesktopViewModel', {

    extend : 'Ext.app.ViewModel',

    requires : [
        'conjoon.cn_mail.store.mail.folder.MailFolderTreeStore'
    ],

    alias : 'viewmodel.cn_mail-maildesktopviewmodel',

    stores : {
        'cn_mail_mailfoldertreestore' : {
            type     : 'cn_mail-mailfoldertreestore',
            autoLoad : true,
            listeners : {
                load : 'onMailFolderTreeStoreLoad'
            }
        }
    }


});