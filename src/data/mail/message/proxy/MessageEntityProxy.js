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
 * MessageItems and MessageDrafts.
 */
Ext.define('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {

    extend : 'Ext.data.proxy.Rest',

    requires : [
         'conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader'
    ],

    alias : 'proxy.cn_mail-mailmessageentityproxy',

    // default reader, gets set by BaseSchema for MessageItem and MessageDraft individually
    reader : {
        type : 'cn_mail-mailmessageentityjsonreader'
    },

    idParam : 'localId',

    appendId : false,

    validEntityNames : [
        'MessageDraft',
        'MessageItem',
        'MessageBody'
    ],


    /**
     * The entity being used with this Proxy. Can be any of MessageItem,
     * MessageDraft or MessageBody.
     * @cfg {string}
     */
    entityName : null,


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
              params = request.getParams();

        if (me.validEntityNames.indexOf(me.entityName) === -1) {
            Ext.raise({
                msg : "The entityName (\"" + me.entityName + "\") is not allowed to be used with the url builder of this proxy.",
                entityName : me.entityName
            });
        }

        let url = me.getUrl(request),
            action = request.getAction(),
            rec = request.getRecords() ? request.getRecords()[0] : null,
            source;

        if (!url.match(me.slashRe)) {
            url += '/';
        }

        if (action === 'read') {
            source = params;
            if (source.filter) {
                let fl = Ext.decode(source.filter), np = {};
                for (let i = 0, len = fl.length; i < len; i++) {
                    np[fl[i].property] = fl[i].value;
                }
                source = Ext.apply(source, np);
            } else if (rec && !source.id) {
                source.id = rec.data.id;
            }
        } else {
            source = rec.data;
        }

        if (!source.mailAccountId || !source.mailFolderId) {
            Ext.raise({
                msg    : "Missing compound keys.",
                source : source
            });
        }

        if (me.entityName === 'MessageBody') {
            url += 'MailAccounts/' + encodeURIComponent(source.mailAccountId) + '/' +
                'MailFolders/' + encodeURIComponent(source.mailFolderId) + '/' +
                'MessageItems';

            request.setParams(Ext.apply(request.getParams() || {}, {
                target : 'MessageBody'
            }));
        } else {
            url += 'MailAccounts/' + encodeURIComponent(source.mailAccountId) + '/' +
                'MailFolders/' + encodeURIComponent(source.mailFolderId) + '/' +
                me.entityName + 's';

        }

        if (action !== 'create') {
            if (source.hasOwnProperty('id')) {
                url += '/' + source.id;
            }

        }

        request.setUrl(url);

        return me.callParent([request]);
    }

});
