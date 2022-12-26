/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Base store for managing {@link conjoon.cn_mail.model.mail.folder.MailFolder} as
 * child nodes of {@link conjoon.cn_mail.model.mail.account.MailAccount}.
 *
 * The hierarchy of the tree content of a MailFolderTreeStore looks as follows:
 *
 * - root
 *     |
 *     +- MailAccount
 *     |        |
 *     |        + MailFolder
 *     |        + MailFolder
 *     |        + MailFolder
 *     |
 *     +- MailAccount
 *             |
 *             + MailFolder
 *             + MailFolder
 *
 * Model types will be set by the readers specified by the proxies et al.
 */
Ext.define("conjoon.cn_mail.store.mail.folder.MailFolderTreeStore", {

    extend: "Ext.data.TreeStore",

    requires: [
        // @define l8
        "l8",
        "conjoon.cn_mail.model.mail.folder.MailFolder",
        "conjoon.cn_mail.model.mail.account.MailAccount"
    ],

    alias: "store.cn_mail-mailfoldertreestore",

    model: "conjoon.cn_mail.model.mail.account.MailAccount",

    autoLoad: false,

    nodeParam: "mailAccountId",

    storeId: "cn_mail-mailfoldertreestore",

    statics: {

        /**
         * Returns the instance from the StoreManager. If not available, creates exactly this instance.
         *
         * @returns {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore}
         */
        getInstance () {

            let treeStore = Ext.StoreManager.get("cn_mail-mailfoldertreestore");
            if (!treeStore) {
                treeStore = Ext.create("conjoon.cn_mail.store.mail.folder.MailFolderTreeStore");
            }

            return Ext.StoreManager.get("cn_mail-mailfoldertreestore");
        }

    },

    root: {
        // set initially to false so no ugly fragments will blink when account node
        // was loaded and load mask is hidden / shown when mail folder loads.
        // this will  set the loadCount of the store to +1
        expanded: true,
        data: []
    },


    constructor: function () {

        const me = this;

        me.callParent(arguments);

        me.on("load", me.onStoreHasLoadedRootNode, me, {single: true});
    },


    /**
     * Callback for the tree's load event, to make sure the child nodes are loaded.
     * Child Nodes are Mail Accounts that have to load their child folders.
     * subsequent collapsing/expanding is required in some cases to properly display
     * node icons.
     *
     * @param store
     */
    onStoreHasLoadedRootNode (store) {
        store.getRootNode().childNodes.forEach(
            // close / collapse to make sure icons are rendered
            (node) => node.expand(false, () => {
                node.collapse();
                node.expand();
            })
        );
    },


    /**
     * Adds a new MailAccount to this instance. Makes sure the name does not appear twice.
     *
     *
     * @param {conjoon.cn_mail.model.mail.account.MailAccount} mailAccount
     *
     * @return conjoon.cn_mail.model.mail.account.MailAccount
     */
    addMailAccount (mailAccount) {

        const
            me = this,
            root = me.getRoot(),
            childNodes = root.childNodes;

        let list = [];
        childNodes.forEach(node => list.push(node.get("name")));

        let name = l8.text.nameToOrdinal(mailAccount.get("name"), list);

        mailAccount.set("name", name);

        root.appendChild(mailAccount);

        return mailAccount;
    }

});
