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

        let node = accountNode.findChild("cn_folderType", type, false);

        if (!node) {
            return null;
        }

        return node.get('id');
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
                if (node.get('id') === mailAccountId && node.get('cn_folderType') ===
                    conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT) {
                    return true;
                }
            });

        if (nodeInd === -1) {
            return null;
        }

        return store.getAt(nodeInd);

    },


    /**
     * Returns true if the specified folder id represents a folder belonging
     * to the specified account id.
     *
     * @param {String} mailFolderId
     * @param {String} mailAccountId
     *
     * @return {Boolean}
     */
    doesFolderBelongToAccount : function(mailFolderId, mailAccountId) {

        const me = this;

        if (me.getMailFolder(mailAccountId, mailFolderId)) {
            return true;
        }

        return false;
    }

});
