/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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
 * Ext.ux.ajax.SimManager hook for {@link conjoon.cn_mail.model.mail.folder.MailFolder}
 * data.
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.folder.MailFolderSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init'
    ]

}, function() {

    var mailFolders =   [{
        id          : 1,
        text        : 'Inbox',
        unreadCount : 3787,
        type        : 'INBOX',
        iconCls     : 'fa fa-inbox',
        children    : []
    }, {
        id          : 2,
        text        : 'Sent',
        unreadCount : 0,
        type        : 'SENT',
        children    : []
    }, {
        id          : 3,
        text        : 'Junk',
        unreadCount : 0,
        type        : 'JUNK',
        children    : []
    }, {
        id          : 4,
        text        : 'Drafts',
        unreadCount : 0,
        type        : 'DRAFT',
        children    : []
    }, {
        id          : 5,
        text        : 'Trash',
        unreadCount : 5,
        type        : 'TRASH',
        children    : []
    }];



    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_mail\/MailFolder(\/\d+)?/,

        data: function(ctx) {

            var idPart = ctx.url.match(this.url)[1],
                id;
            if (idPart) {
                id = parseInt(idPart.substring(1), 10);
                return Ext.Array.findBy(mailFolders, function(mailFolder) {
                    return mailFolder.id === id;
                });
            } else {
                return mailFolders;
            }
        }
    });

});