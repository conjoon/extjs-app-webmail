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
        'conjoon.cn_mail.store.mail.folder.MailFolderTreeStore',
        'conjoon.cn_mail.data.mail.folder.MailFolderTypes'
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
     * Queries the store this helper is configured with and returns the
     * conjoon.cn_mail.model.mail.folder.MailFolder with the specified id for
     * the specified account.
     * Returns null if the MailFolder couldn't be found.
     *
     * @param {String} mailAccountId
     * @param {String} mailFolderId
     *
     * @return {null|conjoon.cn_mail.model.mail.folder.MailFolder}
     */
    getMailFolder : function(mailAccountId, mailFolderId) {

        const me = this,
              accountNode = me.getAccountNode(mailAccountId);

        if (!accountNode) {
            return null;
        }

        return accountNode.findChild("id", mailFolderId, true);
    },


    /**
     * Returns the id of the mailfolder found in #store with this type.
     * Folders are queried directly under the root node and not deep!
     *
     * @param {String} mailAccountId THe maila ccount to which the node belongs to
     * @param {String} type The type to look for. Types can be found in
     * conjoon.cn_mail.data.mail.folder.MailFolderTypes
     *
     * @return {String|null} The id of the MailFolder if a folder with the type
     * could be found, otherwise null.
     */
    getMailFolderIdForType : function(mailAccountId, type) {

        const me = this,
            accountNode = me.getAccountNode(mailAccountId);

        if (!accountNode) {
            return null;
        }

        let node = accountNode.findChild("type", type, false);

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
    },


    /**
     * Returns the node which represents the account identified by the specified
     * mailAccountId.
     * Returns null if not found.
     *
     * @param {String} mailAccountId
     *
     * @return {null|conjoon.cn_mail.model.mail.folder.MailFolder}
     */
    getAccountNode : function(mailAccountId) {

        const me    = this,
            store   = me.getStore(),
            nodeInd = store.findBy(function(node) {
                if (node.get('id') === mailAccountId && node.get('type') ===
                    conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT) {
                    return true;
                }
            });

        if (nodeInd === -1) {
            return null;
        }

        return store.getAt(nodeInd);

    }

});
