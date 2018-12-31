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
Ext.define('conjoon.cn_mail.data.mail.ajax.sim.account.MailAccountSim', {

    requires : [
        'conjoon.cn_mail.data.mail.ajax.sim.Init'
    ]

}, function() {

    var accounts = [{
        id            : "dev_sys_conjoon_org",
        text          : "dev@conjoon.org",
        from          : 'dev@conjoon.org',
        replyTo       : 'dev@conjoon.org',
        name          : "conjoon developer"
    },{
        id            : "mail_account",
        text          : "demo@googlemail.com",
        from          : 'demo@googlemail.com',
        replyTo       : 'demo@googlemail.com',
        name          : "google mail",

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


        }
    });

});