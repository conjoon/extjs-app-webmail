/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Runner for polling newest messages from the mailboxes of a mail account.
 * The Runner will read out INBOX-nodes from the various account-nodes of
 * the MailFolderTreeStore the runner is configured with, and work with these
 * references.
 *
 * @example
 */
Ext.define("conjoon.cn_mail.data.mail.MailboxRunner", {

    requires: [
        "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore",
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes"
    ],


    /**
     * A key value pair with the key being the mail account, and
     * the value the mail folder for which a subscription to receive latest
     * messages exist.
     * @type {Object} subscriptions
     */

    /**
     * @var {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} mailFolderTreeStore
     * @private
     */

    /**
     * @var {conjoon.cn_mail.data.mail.service.MailFolderHelper} mailFolderHelper
     */

    /**
     * Inits this MailboxRunner by registering itself to the load-event of the treeStore.
     *
     * @param {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} treeStore
     *
     * @throws if init was already called, or if treeStore is not an instance of
     * conjoon.cn_mail.store.mail.folder.MailFolderTreeStore
     *
     * @see
     */
    init (mailFolderTreeStore) {
        "use strict";

        const me = this;

        if (me.mailFolderTreeStore) {
            throw new Error("MailboxRunner was already initialized");
        }

        if (!(mailFolderTreeStore instanceof conjoon.cn_mail.store.mail.folder.MailFolderTreeStore)) {
            throw new Error("\"treeStore\" must be an instance of conjoon.cn_mail.store.mail.folder.MailFolderTreeStore");
        }

        me.mailFolderTreeStore = mailFolderTreeStore;

        mailFolderTreeStore.on("load", me.onMailFolderTreeStoreLoad, me);

        if (mailFolderTreeStore.isLoaded()) {
            const accountNodes = mailFolderTreeStore.getRoot().childNodes;
            accountNodes && accountNodes.forEach(mailAccount => me.createSubscription(mailAccount));
        }
    },


    /**
     * Creates subscribtions for the mailboxes from the root mail account node
     * that was passed.
     * Only the node with the type INBOX is considered as mailbox for which a subscription
     * is created.
     *
     * @param {conjoon.cn_mail.model.mail.account.MailAccount} mailAccount
     *
     * @return {Ext.data.TreeModel} the node for which a subscription was created.
     *
     * throws if a subscription for the mailAccount already exists,
     * no ACCOUNT-node was passed to the method, the node has no child nodes
     * or if no INBOX node was found for the account.
     */
    createSubscription  (mailAccount) {
        "use strict";

        const
            me = this,
            mailAccountId = mailAccount.get("id");

        if (!me.subscriptions) {
            me.subscriptions = {};
        }

        if (me.subscriptions[mailAccountId]) {
            throw new Error(`subscription for ${mailAccountId} already exists`);
        }

        const TYPES = conjoon.cn_mail.data.mail.folder.MailFolderTypes;

        if (mailAccount.get("folderType") !== TYPES.ACCOUNT) {
            throw new Error(`The folderType of the passed node must be ${TYPES.ACCOUNT}`);
        }

        if (mailAccount.childNodes.length === 0) {
            throw new Error("need at least one child node to subscribe to");
        }

        const inboxNode = mailAccount.findChild("folderType", TYPES.INBOX, false);

        if (!inboxNode) {
            throw new Error("no INBOX node found for creating a subscription");
        }

        me.subscriptions[mailAccountId] = inboxNode;

        return inboxNode;
    },

    /**
     *
     * @param {conjoon.cn_mail.model.mail.account.MailAccount} mailAccount
     */
    start (mailAccount) {
        "use strict";
    },


    /**
     *
     * @param {conjoon.cn_mail.model.mail.account.MailAccount} mailAccount
     */
    stop (mailAccount) {
        "use strict";
    },


    /**
     *
     * @param {conjoon.cn_mail.model.mail.account.MailAccount} mailAccount
     */
    pause (mailAccount) {
        "use strict";
    },


    /**
     * Callback for the "load"-event of the mailFolderTreeStore this runner was
     * initialized with. Delegates to createSubscription to create tasks for querying
     * mailboxes for latest messages.
     * MailAccount-nodes get loaded first, subsequent calls will then call the load-
     * operations for the children. Those calls have to be considered since the method need the folder
     * information from the children.
     *
     * @param {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore} store
     * @param {Array} records The records loaded with the store. Instances of
     * {conjoon.cn_mail.model.mail.account.MailAccount} will be found in the first index
     * of the passed records, if any.
     * @param {Boolean} success
     *
     * @see createSubscription
     */
    onMailFolderTreeStoreLoad (store, records, success) {
        "use strict";

        if (!success) {
            return;
        }

        const me = this;

        const TYPES = conjoon.cn_mail.data.mail.folder.MailFolderTypes;

        if (records[0].get("folderType") === TYPES.ACCOUNT) {
            return;
        }

        me.createSubscription(records[0].parentNode);
    },


    /**
     * @inheritdoc
     */
    destroy () {
        const me = this;
        if (me.mailFolderTreeStore) {
            me.mailFolderTreeStore.un("load", me.onMailFolderTreeStoreLoad, me);
        }
        me.callParent(arguments);
    }
});
