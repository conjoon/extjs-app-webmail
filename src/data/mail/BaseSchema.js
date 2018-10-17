/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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
 * Base schema for app-cn_mail.
 *
 * This schema defines a default REST proxy which is used for all models.
 * The url created is as follows: cn_mail/{model.entityName}, except for
 * the DraftAttachment- and ItemAttachment-entities. (@see #constructProxy}.
 */
Ext.define('conjoon.cn_mail.data.mail.BaseSchema', {

    extend : 'conjoon.cn_core.data.schema.BaseSchema',

    requires : [
        'conjoon.cn_mail.data.mail.message.proxy.MessageItemProxy',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageItemCompoundKey',
        'conjoon.cn_mail.data.mail.message.compoundKey.MessageBodyCompoundKey',
        'conjoon.cn_mail.data.mail.message.compoundKey.AttachmentItemCompoundKey'
    ],

    alias : 'schema.cn_mail-mailbaseschema',

    namespace : 'conjoon.cn_mail.model.mail',

    id : 'cn_mail-baseschema',

    urlPrefix : 'cn_mail',

    proxy : {
        type : 'rest',
        url  : '{prefix}'
    },

    privates : {

        /**
         * There seems to be no way to properly inject methods in ObjectTemplates.
         * Thus, we extend this class' constructProxy method and adjust the proxy
         * url for the DraftAttachment and the ItemAttachment, which are in fact
         * the same entities, but have to be treated differently in the Sencha
         * World due to the associations not being flexible enough.
         *
         * @param Model
         * @returns {*|Object}
         */
        constructProxy: function (Model) {
            var me       = this,
                proxy    = me.callParent(arguments),
                tmpData  = Ext.Object.chain(Model),
                tmpProxy = me.getProxy().apply({
                    prefix     : me.getUrlPrefix(),
                    entityName : tmpData.entityName === 'DraftAttachment' ||
                                 tmpData.entityName === 'ItemAttachment'
                                 ? tmpData.entityName = 'Attachment'
                                 : tmpData.entityName
                });


            const MessageItemCompoundKey    = conjoon.cn_mail.data.mail.message.compoundKey.MessageItemCompoundKey,
                  MessageBodyCompoundKey    = conjoon.cn_mail.data.mail.message.compoundKey.MessageBodyCompoundKey,
                  AttachmentItemCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.AttachmentItemCompoundKey;

            //proxy.url = tmpProxy.url;

            if (tmpData.entityName === 'MessageItem' || tmpData.entityName === 'MessageDraft') {

                proxy.prefix = '{prefix}';
                proxy.type = 'cn_mail-mailmessageitemproxy';

            } else if (tmpData.entityName === 'MessageBody') {

                proxy.idParam = 'localId';

                proxy.url = tmpProxy.url;

                proxy.reader = {
                    type         : 'json',
                    rootProperty : 'data',
                    transform    : function(data) {

                        if (Ext.isObject(data) && Ext.isArray(data.data)) {

                            let records = data.data, i, len = records.length, rec;

                            for (i = 0; i < len; i++) {
                                rec = records[i];
                                if (!rec.localId) {

                                    rec.localId = MessageBodyCompoundKey.createFor(
                                        rec.mailAccountId, rec.mailFolderId, rec.parentMessageItemId, rec.id
                                    ).toLocalId();
                                }

                            }
                        } else if (Ext.isObject(data) && Ext.isObject(data.data)) {
                            // POST / PUT
                            data.data.localId = MessageBodyCompoundKey.createFor(
                                data.data.mailAccountId, data.data.mailFolderId, data.data.parentMessageItemId, data.data.id
                            ).toLocalId();
                        }


                        return data;

                    }
                };
            }


            return proxy;
        }
}

});
