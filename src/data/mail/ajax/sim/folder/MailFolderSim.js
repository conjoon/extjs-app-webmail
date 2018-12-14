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
        id            : "dev_sys_conjoon_org",
        text          : "dev@conjoon.org",
        mailAccountId :  "dev_sys_conjoon_org",
        type          : 'ACCOUNT',
        expanded      : true,
        from          : 'dev@conjoon.org',
        replyTo       : 'dev@conjoon.org',
        name          : "conjoon developer",
        children : [{
            id            : "INBOX",
            text          : 'Inbox',
            unreadCount   : 3787,
            type          : 'INBOX',
            children      : [{
                id            : "INBOX.ToDo",
                text          : 'ToDo',
                unreadCount   : 3787,
                expandedn     : true,
                type          : 'INBOX',
                children      : [],
                mailAccountId :  "dev_sys_conjoon_org",
            }],
            mailAccountId :  "dev_sys_conjoon_org"
        }, {
            id            : "INBOX.Sent Messages",
            text          : 'Sent',
            unreadCount   : 0,
            type          : 'SENT',
            children      : [],
            mailAccountId :  "dev_sys_conjoon_org",
        }, {
            id            : "INBOX.Junk",
            text          : 'Junk',
            unreadCount   : 0,
            type          : 'JUNK',
            children      : [],
            mailAccountId :  "dev_sys_conjoon_org",
        }, {
            id            : "INBOX.Drafts",
            text          : 'Drafts',
            unreadCount   : 0,
            type          : 'DRAFT',
            children      : [],
            mailAccountId :  "dev_sys_conjoon_org",
        }, {
            id           : "INBOX.Trash",
            text         : 'Trash',
            unreadCount  : 5,
            type         : 'TRASH',
            children     : [],
            mailAccountId :  "dev_sys_conjoon_org",
        }]
    }, {
        id            : "mail_account",
        text          : "demo@googlemail.com",
        mailAccountId :  "mail_account",
        type          : 'ACCOUNT',
        expanded      : true,
        from          : 'demo@googlemail.com',
        replyTo       : 'demo@googlemail.com',
        name          : "google mail",
        children : [{
            id            : "INBOX",
            text          : 'Inbox',
            unreadCount   : 3787,
            type          : 'INBOX',
            children      : [],
            mailAccountId :  "mail_account",

        }, {
            id            : "INBOX.Sent Messages",
            text          : 'Sent',
            unreadCount   : 0,
            type          : 'SENT',
            children      : [],
            mailAccountId :  "mail_account",
        }, {
            id            : "INBOX.Junk",
            text          : 'Junk',
            unreadCount   : 0,
            type          : 'JUNK',
            children      : [],
            mailAccountId :  "mail_account",
        }, {
            id            : "INBOX.Drafts",
            text          : 'Drafts',
            unreadCount   : 0,
            type          : 'DRAFT',
            children      : [],
            mailAccountId :  "mail_account",
        }, {
            id           : "INBOX.Trash",
            text         : 'Trash',
            unreadCount  : 5,
            type         : 'TRASH',
            children     : [],
            mailAccountId :  "mail_account",
        }]
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