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