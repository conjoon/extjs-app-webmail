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
 * Specialized version of a REST-proxy to be used with
 * MailAccounts.
 */
Ext.define('conjoon.cn_mail.data.mail.account.proxy.MailAccountProxy', {

    extend : 'Ext.data.proxy.Rest',

    requires : [
         'conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader'
    ],

    alias : 'proxy.cn_mail-mailaccountproxy',

    reader : {
        type : 'cn_mail-mailaccountjsonreader'
    },

    idParam : 'id',

    appendId : false,

    /**
     * @private
     */
    entityName : 'MailAccount',


    /**
     * @inheritdoc
     *
     * @param {Ext.data.Request} request
     *
     * @return {Object}
     *
     * @throws if #entityName is not in the list of #validEntityNames
     */
    buildUrl: function(request) {

        const me = this;

        let url = me.getUrl(request);

        if (!url.match(me.slashRe)) {
            url += '/';
        }

        if (request.getAction() !== "read") {
            Ext.raise("Unexpected error; any action other but \"read\" not supported.");
        }

        url += 'MailAccounts';
        request.setUrl(url);

        return me.callParent([request]);
    }

});
