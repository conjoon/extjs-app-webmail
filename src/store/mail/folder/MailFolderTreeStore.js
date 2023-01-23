/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 *
 * This store will observe changes made to MAilAccount's and fire the activemailaccountchange-event
 * based on the availability of active MailAccounts (see conjoon.cn_mail.model.mail.account.MailAccount#active).
 *
 *
 */
Ext.define("conjoon.cn_mail.store.mail.folder.MailFolderTreeStore", {

    extend: "Ext.data.TreeStore",

    requires: [
        // @define l8
        "l8",
        "conjoon.cn_mail.model.mail.folder.MailFolder",
        "conjoon.cn_mail.model.mail.account.MailAccount",
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes"
    ],

    alias: "store.cn_mail-mailfoldertreestore",

    model: "conjoon.cn_mail.model.mail.account.MailAccount",

    autoLoad: false,

    nodeParam: "mailAccountId",

    storeId: "cn_mail-mailfoldertreestore",

    /**
     * @event activemailaccountavailable
     * @param this
     * @param {Boolean} hasActiveMailAccount
     */

    /**
     * Fired when the "active" value of an account managed by this store has changed.
     * @event mailaccountactivechange
     * @param this
     * @param {Boolean} hasActiveMailAccount
     */

    /**
     * Fired when the MailAccounts and their child nodes where loaded.
     * @event mailaccountsloaded
     * @param this
     * @param {Array} mailAccounts
     */

    /**
     * @type {Boolean} accountsLoaded
     */

    /**
     * @type {Boolean} hasActiveMailAccount
     */
    hasActiveMailAccount: false,

    /**
     * @type {Boolean} acccountsAreBeingLoaded
     * @private
     */

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

        me.on("add", me.onMailFolderTreeStoreAdd, me);
        me.on("update", me.onMailFolderTreeStoreUpdate, me);
    },


    /**
     * Finds the first active mail account managed by this store.
     * Returns undefined if no active account was found
     *
     * @param {Object} filter allows for specifying a filter object that
     * can be used for filtering active mail accounts based on additional
     * conditions
     *
     * @return {conjoon.cn_mail.model.mail.account.MailAccount|undefined}
     */
    findFirstActiveMailAccount (filter = {}) {

        const
            me = this,
            childNodes = me.getRoot().childNodes;

        let mailAccount;
        childNodes.some(node => {
            if (node.get("active")) {

                if (filter) {
                    if (filter.operator === "NOT_IN") {
                        if (filter.value.includes(node.get(filter.property))) {
                            return;
                        }
                    }
                }

                mailAccount = node;
                return true;
            }
        });

        return mailAccount;
    },


    /**
     * Callback for the add-event of this store.
     *
     * @param {this} store
     * @param {Array} records
     *
     * @see checkAndFireActiveMailAccountChange
     */
    onMailFolderTreeStoreAdd (store, records) {

        const me = this;
        const TYPES = conjoon.cn_mail.data.mail.folder.MailFolderTypes;

        if (records[0].get("folderType") !== TYPES.ACCOUNT &&
            records[0].parentNode.get("folderType") !== TYPES.ACCOUNT) {
            return;
        }
        me.checkAndFireActiveMailAccountChange();
    },


    /**
     * Callback for the update-event of this store.
     *
     * @param {this} store
     * @param {Ext.data.Model} record
     *
     * @see checkAndFireActiveMailAccountChange
     */
    onMailFolderTreeStoreUpdate (store, record) {

        const me = this;

        const TYPES = conjoon.cn_mail.data.mail.folder.MailFolderTypes;

        if (record.modified?.active !== undefined && record.get("folderType") === TYPES.ACCOUNT) {
            me.fireEvent("mailaccountactivechange", me, record);
            me.checkAndFireActiveMailAccountChange();
        }
    },


    /**
     * Checks whether this store hase any active MailAccounts available and compare the rersult
     * with #hasActiveMailAccount. Will trigger the activemailaccountavailable-event
     * if the state regarding this value has changed.
     *
     */
    checkAndFireActiveMailAccountChange () {
        const me = this;

        const hasActive = me.getRoot().childNodes.filter(account => account.get("active")).length !== 0;

        if (hasActive === me.hasActiveMailAccount) {
            return;
        }

        me.hasActiveMailAccount = hasActive;

        me.fireEvent("activemailaccountavailable", me, me.hasActiveMailAccount);
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
    },


    /**
     * Makes an attempt to load the MailAccounts with their child nodes.
     * Fires the "mailaccountsloaded"-once load-operations have
     * finished.
     *
     * @return {Array} the nodes loaded.
     */
    async loadMailAccounts () {

        const me = this;

        if (me.accountsLoaded) {
            return me.getRoot().childNodes;
        }

        if (me.acccountsAreBeingLoaded) {
            return await new Promise(function (resolve, reject) {
                me.on("mailaccountsloaded", function (store, nodes) {
                    return resolve(nodes);
                }, {single: true});
            });
        }

        me.acccountsAreBeingLoaded = true;

        const accounts = await new Promise(function (resolve, reject) {
            const childs = me.getRoot().childNodes;

            if (childs.length) {
                return resolve(childs);
            }

            me.load();
            me.on("load", function (store, nodes) {
                return resolve(nodes);
            }, {single: true});
        });

        if (!accounts) {
            return [];
        }

        let accountCount = accounts.length;

        if (me.isLoading()) {
            await new Promise (function (resolve, reject) {
                const cb = function () {
                    accountCount--;
                    if (accountCount === 0) {
                        me.accountsLoaded = true;
                        resolve();
                    } else {
                        me.on("load", cb, me, {single: true});
                    }
                };
                me.on("load", cb, me, {single: true});
            });
        }

        const childNodes = me.getRoot().childNodes;
        me.fireEvent("mailaccountsloaded", me, childNodes);

        return childNodes;
    }

});
