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
 * A MailboxRunner will fire the global event "conjoon.cn_mail.event.NewMessagesAvailable"
 * along with the mailFolder for which the MessageItems are available, which will
 * be available as the second argument.
 *
 */
Ext.define("conjoon.cn_mail.data.mail.MailboxRunner", {

    requires: [
        // @define
        "l8",
        "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore",
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes",
        "conjoon.cn_mail.model.mail.message.MessageItem"
    ],

    /**
     * The intrerval in ms, in which a runner should be called
     * @var {Number} interval
     */
    interval: 12000,

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
     * Constructor.
     *
     * @param mailFolderTreeStore
     *
     * @see init
     */
    constructor (mailFolderTreeStore) {
        if (mailFolderTreeStore) {
            this.init(mailFolderTreeStore);
        }
    },


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
     * @param {String|Ext.data.TreeModel} mailAccount
     *
     * @return {Object} the subscription object created
     * @return {Object.folder} the folder that was subscripbed to
     *
     * throws if a subscription for the mailAccount already exists,
     * no ACCOUNT-node was passed to the method, the node has no child nodes
     * or if no INBOX node was found for the account.
     */
    createSubscription  (mailAccount) {
        "use strict";

        const me = this;

        if (me.getSubscription(mailAccount)) {
            throw new Error(`subscription for ${me.getSubscriptionId(mailAccount)} already exists`);
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


        const sub = me.addSubscription(mailAccount, {folder: inboxNode});
        me.start(mailAccount);
        return sub;
    },


    /**
     * Sends a request for latest messages, i.e. messages flagged as "recent",
     * or, if available, > than a given uidNext that was recently set
     * for the folder.
     *
     * @param {conjoon.cn_mail.model.mail.folder.MailFolder} mailFolder
     *
     * @private
     */
    async visitSubscription (mailFolder) {
        "use strict";

        const
            me = this,
            mailAccountId = mailFolder.get("mailAccountId"),
            mailFolderId = mailFolder.get("id"),
            uidNext = mailFolder.get("uidNext"),
            proxy = conjoon.cn_mail.model.mail.message.MessageItem.getProxy(),
            keyFilter = [{
                property: "mailAccountId",
                value: mailAccountId
            }, {
                property: "mailFolderId",
                value: mailFolderId
            }],
            latestFilter = [{
                property: "recent",
                value: true
            }];

        if (uidNext) {
            latestFilter.push({
                property: "id",
                value: uidNext,
                operator: ">="
            });
        }

        const url = proxy.assembleUrl(Ext.create("Ext.data.Request", {
            action: "read",
            params: {
                filter: JSON.stringify(keyFilter)
            }
        }));

        Ext.Ajax.request({
            method: "get",
            // required by the custom Reader used by teh messageEntityProxy
            action: "read",
            url,
            headers: proxy.headers,
            params: {
                filter: JSON.stringify(latestFilter),
                options: JSON.stringify(proxy.getDefaultParameters("ListMessageItem.options")),
                target: "MessageItem"
            }
        }).then(me.onSubscriptionResponseAvailable.bind(me, mailFolder));

    },


    /**
     * Spawns and starts the runner for the specified mail account.
     *
     * @param {String|Ext.data.TreeModel} mailAccount The
     * node of the mail account for which the subscription should start, or  the id of it.
     *
     * @return {Boolean} false if the subscription does not exist, otherwise
     * the spawned subscription runner, even if it already existed
     */
    start (mailAccount) {
        "use strict";

        const
            me = this,
            sub = me.getSubscription(mailAccount);

        if (!sub) {
            return false;
        }

        if (!sub.extjsTask) {
            sub.extjsTask = Ext.TaskManager.start({
                run: me.visitSubscription,
                fireOnStart: false,
                scope: me,
                // pass folder as reference to make sure
                // changes to any of it (UIDNEXT, mailFolderId etc)
                // can be taken into account
                args: [sub.folder],
                interval: me.interval
            });
        }

        return sub;
    },


    /**
     * Stops the runner for the specified subscription and removes
     * the subscription completely.
     *
     * @param {String|Ext.data.TreeModel} mailAccount
     *
     * @return {Boolean|Object} false if thge subscription was not found,
     * otherwise the removed subscription.
     */
    stop (mailAccount) {
        "use strict";

        const
            me = this,
            sub = me.getSubscription(mailAccount);

        if (!sub) {
            return false;
        }
        if (sub.extjsTask) {
            Ext.TaskManager.stop(sub.extjsTask, true);
            delete sub.extjsTask;
        }
        delete me.subscriptions[me.getSubscriptionId(mailAccount)];
        return sub;
    },


    /**
     * Pauses a runner for the subscriptions of the mailAccount.
     *
     * @param {String|Ext.data.TreeModel} mailAccount
     *
     * @return {Boolean|Object}  Returns false if no subscription
     * was available to be paused, or if the runner was not started yet,
     * otherwise  the paused subscription object.
     */
    pause (mailAccount) {
        "use strict";

        const
            me = this,
            sub = me.getSubscription(mailAccount);

        if (!sub || !sub.extjsTask) {
            return false;
        }

        if (sub.extjsTask) {
            Ext.TaskManager.stop(sub.extjsTask, false);
        }

        return sub;
    },


    /**
     * Resumes a paused runner.
     *
     * @param {String|Ext.data.TreeModel} mailAccount
     *
     * @return {Boolean|Object} Returns false if no subscription
     * was available to be resumed,  otherwise the resumed subscription object.
     */
    resume (mailAccount) {
        "use strict";

        const
            me = this,
            sub = me.getSubscription(mailAccount);

        if (!sub || !sub.extjsTask) {
            return false;
        }

        if (sub.extjsTask && sub.extjsTask.stopped) {
            Ext.TaskManager.start(sub.extjsTask, false);
        }

        return sub;
    },


    // +------------------------------
    // | Helper
    // +------------------------------

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
     * @private
     */
    initSubscriptions () {
        "use strict";
        const me = this;

        if (!me.subscriptions) {
            me.subscriptions = {};
        }
    },


    /**
     * @param {String|Ext.data.TreeModel}
     *
     * @private
     */
    getSubscription (mailAccount) {
        "use strict";
        const me = this;

        me.initSubscriptions();

        const id = me.getSubscriptionId(mailAccount);

        return me.subscriptions[id];
    },


    /**
     * @param {String|Ext.data.TreeModel}
     * @param {Object}
     *
     * @private
     */
    addSubscription (mailAccount, subscription) {
        "use strict";
        const me = this;

        me.initSubscriptions();

        const id = me.getSubscriptionId(mailAccount);

        me.subscriptions[id] = subscription;

        return subscription;
    },


    /**
     *
     * @param {String|Ext.data.TreeModel}
     *
     * @private
     */
    getSubscriptionId (mailAccount) {
        "use strict";

        if (l8.isObject(mailAccount) && l8.isFunction(mailAccount.get)) {
            return mailAccount.get("id");
        }

        if (!l8.isString(mailAccount)) {
            throw new Error("Unexpected type for \"mailAccount\" submitted");
        }

        return mailAccount;
    },


    /**
     * @inheritdoc
     */
    destroy () {
        const me = this;
        if (me.mailFolderTreeStore) {
            me.mailFolderTreeStore.un("load", me.onMailFolderTreeStoreLoad, me);
        }

        if (me.subscriptions) {
            Object.keys(me.subscriptions).forEach(mailAccount => me.stop(mailAccount));
        }

        delete me.subscriptions;

        me.callParent(arguments);
    },


    /**
     * Callback for the request to fetch latest messages.
     * If messages are available the global event "conjoon.cn_mail.event.NewMessagesAvailable"
     * will be fired with the owning mailFolder as its first argument, and an array of
     * recent messages as the second argument.
     *
     * @param {Object} response
     *
     * @return {Boolean} false if no records where fetched in the recent run, otherwise
     * an array with the fetched records.
     */
    onSubscriptionResponseAvailable (mailFolder, response) {

        const
            proxy = conjoon.cn_mail.model.mail.message.MessageItem.getProxy(),
            reader = proxy.getReader();

        const resultSet = reader.read(response);

        if (resultSet.getRecords().length) {
            Ext.fireEvent(
                "conjoon.cn_mail.event.NewMessagesAvailable",
                mailFolder,
                resultSet.getRecords()
            );
            return resultSet.getRecords();
        }

        return false;
    }

});
