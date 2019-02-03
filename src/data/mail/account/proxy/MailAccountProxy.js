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
 * Specialized version of a REST-proxy to be used with MailAccounts.
 * Capable of creating the following URLs:
 *
 * READ:
 * MailAccounts
 * MailAccounts/[id]/MailFolders
 *
 * UPDATE:
 * MailAccounts/[id]
 *
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

        if (request.getRecords() && request.getRecords().length > 1) {
            Ext.raise({
                msg : "Doesn't support batch operations with multiple records.",
                request : request
            });
        }

        const me     = this,
              action = request.getAction();

        let url    = me.getUrl(request),
            rec    = request.getRecords() ? request.getRecords()[0] : null,
            params = request.getParams();

        if (!url.match(me.slashRe)) {
            url += '/';
        }

        if (action !== "read" && action !== "update") {
            Ext.raise("Unexpected error; any action other but \"read\" and \"update\" not supported.");
        }


        url += 'MailAccounts';

        if (action === 'read') {
            // if we are here, the mailAccountId is specified as the mail-account
            // for which the child items should get loaded
            if (params.mailAccountId && params.mailAccountId !== "root") {
                url += '/' +
                    params.mailAccountId +
                    '/MailFolders';
            }
        } else {
            url += '/' + rec.getId();
        }

        request.setUrl(url);

        return me.callParent([request]);
    }

});
