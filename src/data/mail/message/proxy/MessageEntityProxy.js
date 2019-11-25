/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Specialized version of a REST-proxy to be used with
 * MessageItems and MessageDrafts.
 */
Ext.define('conjoon.cn_mail.data.mail.message.proxy.MessageEntityProxy', {

    extend : 'Ext.data.proxy.Rest',

    requires : [
        'conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader',
        'conjoon.cn_mail.data.mail.message.proxy.UtilityMixin'
    ],

    mixins : {
        utilityMixin : 'conjoon.cn_mail.data.mail.message.proxy.UtilityMixin'
    },


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
                me.purgeFilter(params, ["mailAccountId", "mailFolderId"]);
            } else if (rec && !source.id) {
                source.id = rec.data.id;
            }

        } else {

            if (rec.phantom) {
                source = rec.data;
            } else {
                source = Ext.applyIf(Ext.apply({}, rec.modified), rec.data);
            }
        }

        if (!source.mailAccountId || !source.mailFolderId) {
            Ext.raise({
                msg    : "Missing compound keys.",
                source : source
            });
        }

        url += 'MailAccounts/' + encodeURIComponent(source.mailAccountId) + '/' +
            'MailFolders/' + encodeURIComponent(source.mailFolderId) + '/' +
            'MessageItems';

        // switch target parameter to MessageBodyDraft if applicable
        let target = me.entityName;
        if ((action === 'create' || action === 'update') && target === 'MessageBody') {
            target = 'MessageBodyDraft';
        }

        request.setParams(Ext.apply(request.getParams() || {}, {target: target}));

        if (action !== 'create') {
            if (source.hasOwnProperty('id')) {
                url += '/' + source.id;
            }
        }

        if (params) {
            delete params.mailFolderId;
            delete params.mailAccountId;
            delete params.id;
            delete params.localId;
        }


        request.setUrl(url);

        return me.callParent([request]);
    }

});
