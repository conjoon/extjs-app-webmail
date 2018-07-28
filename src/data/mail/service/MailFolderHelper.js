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
 * Utility class for providing convenient access to often needed MailFolder
 * queries.
 *
 */
Ext.define("conjoon.cn_mail.data.mail.service.MailFolderHelper", {


    requires : [
        'conjoon.cn_mail.store.mail.folder.MailFolderTreeStore'
    ],


    /**
     * @cfg {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} store
     * @private
     */
    store : null,

    /**
     * Constructor
     * Expects a store property representing an instance of
     * {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} this helper can work with.
     *
     * @throws if cfg.store is not set or not an instance of conjoon.cn_mail.store.mail.folder.MailFolderTreeStore
     */
    constructor : function(cfg) {

        cfg = cfg || {};

        const me = this;

        if (!cfg.store || !(cfg.store instanceof conjoon.cn_mail.store.mail.folder.MailFolderTreeStore)) {
            Ext.raise({
                msg   : "'store' must be an instance of conjoon.cn_mail.store.mail.folder.MailFolderTreeStore",
                store : cfg.store
            })
        }

        me.initConfig(cfg);
    },



    /**
     * Returns the id of the mailfolder found in #store with this type.
     * Folders are queried directly under the root node and not deep!
     *
     * @param {String} type The type to look for. Types can be found in
     * conjoon.cn_mail.data.mail.folder.MailFolderTypes
     *
     * @return {String|null} The id of the MailFolder if a folder with the type
     * could be found, otherwise null.
     */
    getMailFolderIdForType : function(type) {

        const me = this,
              store = me.getStore();

        let node = store.getRoot().findChild("type", type, false);

        if (!node) {
            return null;
        }

        return node.getId();
    },


    /**
     * Returns the store used by this helper.
     *
     * @return {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore}
     *
     * @private
     */
    getStore : function() {

        const me = this;

        return me.store;
    }


});
