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

    alias : 'schema.cn_mail-mailbaseschema',

    namespace : 'conjoon.cn_mail.model.mail',

    id : 'cn_mail-baseschema',

    urlPrefix : 'cn_mail',

    proxy : {
        type : 'rest',
        url  : '{prefix}/{entityName}'
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

            proxy.url = tmpProxy.url;

            if (tmpData.entityName === 'MessageItem') {
                proxy.reader = {
                    type         : 'json',
                    rootProperty : 'data'
                };
            }

            return proxy;
        }
}

});
