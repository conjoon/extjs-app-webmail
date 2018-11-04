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
 * MessageItem child entities, such as attachments.
 */
Ext.define('conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy', {

    extend : 'conjoon.cn_core.data.proxy.RestForm',

    requires : [
         'conjoon.cn_mail.data.mail.message.reader.MessageItemChildJsonReader'
    ],

    alias : 'proxy.cn_mail-mailmessageattachmentproxy',

    reader : {
        type : 'cn_mail-mailmessageitemchildjsonreader'
    },

    idParam : 'localId',

    appendId : false,

    /**
     * The entity being used with this Proxy. Either DraftAttachment or
     * ItemAttachment.
     * @cfg {string}
     */
    entityName : null,

    /**
     * Valid entity names to be used with this proxy.
     * @private
     */
    validEntityNames : [
        'DraftAttachment',
        'ItemAttachment'
    ],

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

        if (me.entityName !== 'DraftAttachment' && ["create", "update", "destroy"].indexOf(action) !== -1) {
            Ext.raise({
                msg : "Unexpected entityName with specified action",
                entityName : me.entityName,
                action : action
            });
        }

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

        if (!source.mailAccountId || !source.mailFolderId || !source.parentMessageItemId) {
            Ext.raise({
                msg    : "Missing compound keys.",
                source : source
            });
        }

        url += 'MailAccounts/' + encodeURIComponent(source.mailAccountId) + '/' +
            'MailFolders/' + encodeURIComponent(source.mailFolderId) + '/' +
            'MessageItems/' + encodeURIComponent(source.parentMessageItemId) + '/' +
            'Attachments'

        if (me.entityName === 'DraftAttachment') {
            request.setParams(Ext.apply(request.getParams() || {}, {
                type : 'draft'
            }));
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
