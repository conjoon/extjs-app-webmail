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
 * Ext.ux.ajax.SimManager hook for {@link conjoon.cn_mail.model.mail.folder.MailFolder}
 * data.
 */
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.account.MailAccountSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init'
    ]

}, function() {

    var accounts = [{
        id             : "dev_sys_conjoon_org",
        name           : "conjoon developer",
        userName       : "John Smith",
        from           : 'dev@conjoon.org',
        replyTo        : 'dev@conjoon.org',
        inbox_type     : 'IMAP',
        inbox_address  : 'sfsffs.ffssf.sffs',
        inbox_port     : 993,
        inbox_user     : 'inboxuser',
        inbox_password : 'inboxpassword',
        inbox_ssl       : true,
        outbox_address  : 'sfsffs.ffssf.sffs',
        outbox_port     : 993,
        outbox_user     : 'outboxuser',
        outbox_password : 'outboxpassword',
        outbox_ssl      : true

    },{
        id            : "mail_account",
        name          : "google mail",
        userName  : "Peter Parker",
        from          : 'demo@googlemail.com',
        replyTo       : 'demo@googlemail.com',
        inbox_type   : 'IMAP'

    }];



    Ext.ux.ajax.SimManager.register({
        type : 'json',

        url  : /cn_mail\/MailAccounts(\/\d+)?/,

        doGet: function(ctx) {
            const me = this;

            let ret = {};

            ret.responseText = Ext.JSON.encode({
                data : accounts
            });

            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });
            return ret;


        },


        doPut : function(ctx) {

            const me = this;

            let ret  = {},
                data = ctx.xhr.options.jsonData,
                id   = data.id;

            if (data['name'] === "FAILURE") {

                ret.responseText = Ext.JSON.encode({
                    success : false
                });

            } else {

                for (let i = 0, len = accounts.length; i < len; i++) {
                    if (accounts[i].id === id) {
                        Ext.apply(accounts[i], data);
                    }
                }

                ret.responseText = Ext.JSON.encode({
                    success : true,
                    data    : data
                });

            }



            Ext.Array.forEach(me.responseProps, function (prop) {
                if (prop in me) {
                    ret[prop] = me[prop];
                }
            });

            return ret;



        }

    });

});