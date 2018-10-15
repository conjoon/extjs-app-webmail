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
 * Specialized version of a REST-proxy for a MessageItem.
 */
Ext.define('conjoon.cn_mail.data.mail.message.proxy.MessageItemProxy', {

    extend : 'Ext.data.proxy.Rest',

    requires : [
         'conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader'
    ],

    alias : 'proxy.cn_mail-mailmessageitemproxy',

    reader : {
        type : 'cn_mail-mailmessageitemjsonreader'
    },

    idParam : 'localId',


    /**
     * @inheritdoc
     *
     * @param {Ext.data.Request} request
     *
     * @return {Object}
     */
    buildUrl: function(request) {

        if (request.getRecords() && request.getRecords().length > 1) {
            Ext.raise({
                msg : "Doesn't support batch operations with multiple records.",
                request : request
            });
        }

       // /MailAccounts/{id}/MailFolder/{id}

        const me     = this,
              params = request.getParams();

        let url = me.getUrl(request), rec, source;

        if (!url.match(me.slashRe)) {
            url += '/';
        }


        rec = request.getRecords()[0];

        if (request.getAction() === 'read') {
            source = params;
        } else {
            source = rec.data;
        }

        url += 'MailAccounts/' + encodeURIComponent(source.mailAccountId) + '/' +
               'MailFolders/' + encodeURIComponent(source.mailFolderId) + '/' +
               'MessageItems';

        request.setUrl(url);

        return me.callParent([request]);
    }

});
