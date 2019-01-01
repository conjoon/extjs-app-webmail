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
 * Base store for managing {@link conjoon.cn_mail.model.mail.folder.MailFolder}.
 * Store's proxy is set to memory and should be overridden in subclasses.
 *
 */
Ext.define('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore', {

    extend : 'Ext.data.TreeStore',

    requires : [
        'conjoon.cn_mail.model.mail.folder.MailFolder',
        'conjoon.cn_mail.model.mail.account.MailAccount'
    ],

    alias : 'store.cn_mail-mailfoldertreestore',

    model : 'conjoon.cn_mail.model.mail.account.MailAccount',

    autoLoad : false,

    nodeParam : 'mailAccountId',

    root: {
        expanded : true,
        data     : []
    },


    /**
     * This is a single observer to make sure the MailAccount-nodes load the MailFolder
     * nodes. There is currently no other way to trigger the loading properly with
     * ExtJS6.2.
     */
    listeners : {
        load : {
            fn : function(store, nodes) {
                let node;
                for (let i = 0, len  = nodes.length; i < len; i++) {
                    node = nodes[i];
                    node.expand(false, node.collapse);
                }
            },
            single : true
        }
    }




});