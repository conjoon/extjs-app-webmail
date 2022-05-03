/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Helper mixin to manage a list of subscription for MailAccounts and their associated folders.
 * Subscriptions should be managed in the form of <pre>mailAccountId => {folder: concrete_mailFolder_model_instance}</pre>.
 * Requesting APIs must implement the additional logic to visit subscribed mailboxes,
 * e.g. the MailboxRunner can serve as a
 * reference.
 *
 * @example
 *
 *    Ext.define("FolderVisitor", {
 *
 *        mixins: [
 *            "conjoon.cn_mail.data.mail.MailboxSubscriptionMixin"
 *        ],
 *
 *        visit() {
 *            const me = this;
 *
 *            window.setInterval(function() {
 *
 *                Object.entries(me.subscriptions).forEach(([subscriptionId, subscription]) => {
 *
 *                    l8.request("checkMessages.php", {
 *                        params:  {
 *                            ...subscription.folder.getCompoundKey()
 *                        }
 *                    }).
 *                      then(response => response.text()).
 *                      then(txt => console.log(txt, " messages available");
 *                });
 *
 *            }, 120000);
 *        }
 *    });
 *
 *    let visitor = new FolderVisitor();
 *
 *     const accountNodes = mailFolderTreeStore.getRoot().childNodes;
 *     accountNodes.forEach(mailAccount => {
 *        const inboxNode = mailAccount.findChild("folderType", TYPES.INBOX, false);
 *        me.addSubscription(mailAccount, {folder: inboxNode})
 *     });
 *
 *     visitor.visit();
 *
 *
 */
Ext.define("conjoon.cn_mail.data.mail.MailboxSubscriptionMixin", {

    requires: [
        // @define
        "l8"
    ],


    /**
     * A key value pair with the key being the mail account, and
     * the value the mail folder for which a subscription exists.
     * @type {Object} subscriptions
     */


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
     * @param {String|Ext.data.TreeModel} mailAccount
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
    }

});
