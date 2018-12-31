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

    var folders =   [{
        id            : "INBOX",
        text          : 'Inbox',
        unreadCount   : 3787,
        type          : 'INBOX',
        data      : [{
            id            : "INBOX.MyStuff",
            text          : 'MyStuff',
            unreadCount   : 3787,
            type          : 'INBOX',
            data      : [],
            mailAccountId :  "dev_sys_conjoon_org",
        }],
        mailAccountId :  "dev_sys_conjoon_org",
    }, {
        id            : "INBOX.Sent Messages",
        text          : 'Sent',
        unreadCount   : 0,
        type          : 'SENT',
        data      : [],
        mailAccountId :  "dev_sys_conjoon_org",
    }, {
        id            : "INBOX.Junk",
        text          : 'Junk',
        unreadCount   : 0,
        type          : 'JUNK',
        data      : [],
        mailAccountId :  "dev_sys_conjoon_org",
    }, {
        id            : "INBOX.Drafts",
        text          : 'Drafts',
        unreadCount   : 0,
        type          : 'DRAFT',
        data      : [],
        mailAccountId :  "dev_sys_conjoon_org",
    }, {
        id           : "INBOX.Trash",
        text         : 'Trash',
        unreadCount  : 5,
        type         : 'TRASH',
        data     : [],
        mailAccountId :  "dev_sys_conjoon_org",
    },
    //////////////////////////////
    {
        id            : "INBOX",
        text          : 'Inbox',
        unreadCount   : 3787,
        type          : 'INBOX',
        data      : [],
        mailAccountId :  "mail_account",

    }, {
        id            : "INBOX.Sent Messages",
        text          : 'Sent',
        unreadCount   : 0,
        type          : 'SENT',
            data      : [],
        mailAccountId :  "mail_account",
    }, {
        id            : "INBOX.Junk",
        text          : 'Junk',
        unreadCount   : 0,
        type          : 'JUNK',
            data      : [],
        mailAccountId :  "mail_account",
    }, {
        id            : "INBOX.Drafts",
        text          : 'Drafts',
        unreadCount   : 0,
        type          : 'DRAFT',
            data      : [],
        mailAccountId :  "mail_account",
    }, {
        id           : "INBOX.Trash",
        text         : 'Trash',
        unreadCount  : 5,
        type         : 'TRASH',
            data     : [],
        mailAccountId :  "mail_account"
    }];



    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url : /cn_mail\/MailAccounts\/(.+)\/MailFolders(\/.*)?/im,

        doGet: function(ctx) {
            const me            = this,
                  mailAccountId = ctx.params.mailAccountId;

            ret = {};

            let mailFolders = Ext.Array.filter(
                folders,
                function(item) {
                    return item.mailAccountId === '' + mailAccountId;
                }
            );


            ret.responseText = Ext.JSON.encode({
                data :  mailFolders
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;


        }
    });

});