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
 * Base model for app-cn_mail representing a MailAccount.
 */
Ext.define('conjoon.cn_mail.model.mail.account.MailAccount', {

    extend : 'conjoon.cn_mail.model.mail.BaseTreeModel',

    entityName : 'MailAccount',

    idProperty : 'id',

    requires : [
        'conjoon.cn_mail.data.mail.folder.MailFolderTypes'
    ],


    fields : [{
        name : 'name',
        type : 'string',
        validators : [{
            type : 'presence'
        }]
    }, {
        name : 'cn_folderType',
        type : 'string'
    }, {
        name : 'userName',
        type : 'string'
    }, {
        name : 'from',
        type : 'string'
    }, {
        name : 'replyTo',
        type : 'string'
    },

    // INBOX CONFIGURATION
    {
        name : 'inbox_type',
        type : 'string'
    }, {
        name : 'inbox_address',
        type : 'string'
    }, {
        name : 'inbox_port',
        type : 'string'
    }, {
        name : 'inbox_user',
        type : 'string'
    }, {
        name : 'inbox_password',
        type : 'string'
    }, {
        name : 'inbox_ssl',
        type : 'boolean'
    },
    // OUTBOX CONFIGURATION
    {
        name : 'outbox_address',
        type : 'string'
    }, {
        name : 'outbox_port',
        type : 'string'
    }, {
        name : 'outbox_user',
        type : 'string'
    }, {
        name : 'outbox_password',
        type : 'string'
    }, {
        name : 'outbox_ssl',
        type : 'boolean'
    }],

    /**
     * Overriden to make sure we can specify class statics for values of
     * field validation for "type".
     *
     * @inheritdoc
     */
    constructor : function() {
        const me = this;

        me.callParent(arguments);

        me.getField('cn_folderType').setModelValidators([{
            type : 'inclusion',
            list : [
                conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT
            ]
        }]);
    },


    /**
     * Returns the url represented by an instance of this MailFolder
     * to be used with redirectTo.
     *
     * @returns {string}
     *
     * @throws if no parentNode can be found
     */
    toUrl : function() {
        const me     = this,
              prefix = 'cn_mail/account/';

            return prefix + me.get('id');
    }

});
