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
 * Default implementation for a ViewModel for {conjoon.cn_mail.view.mail.account.MailAccountView}
 * Note:
 * This ViewModel does not bind to the original MailAccount provided to the #setMailAccount-interface.
 * Instead, it clones this model and stores the original source model in #sourceMailAccount.
 */
Ext.define("conjoon.cn_mail.view.mail.account.MailAccountViewModel", {

    extend: "Ext.app.ViewModel",

    requires: [
        "conjoon.cn_mail.model.mail.account.MailAccount"
    ],

    alias: "viewmodel.cn_mail-mailaccountviewmodel",

    /**
     * Caches the references to the original mail accounts that were
     * passed to this MailAccount via #setMailAccount. An instance of this
     * ViewModel can manage multiple MailAccounts.
     *
     * @type {Object|conjoon.cn_mail.model.mail.acount.MailAccount}
     */
    sourceMailAccounts: null,

    data: {
        /**
         * Should be set by the #setMailAccount method.
         * @private
         */
        mailAccount: null
    },

    stores: {
        subscriptionStore: {
            data: []
        }
    },

    formulas: {

        /**
         * Makes sure getter and setter properly process the replyTo-field
         * of the MailAccount.
         */
        processReplyTo: {

            get: function (get) {
                let replyTo = get("mailAccount.replyTo");
                return replyTo?.address ?? "";
            },

            set: function (value) {
                const me      = this,
                    replyTo = Ext.clone(me.get("mailAccount.replyTo")),
                    ma      = me.get("mailAccount");

                replyTo.address = value;
                ma.set("replyTo", replyTo);
            }

        },


        /**
         * Makes sure getter and setter properly process the from-field
         * of the MailAccount.
         */
        processFrom: {
            get: function (get) {
                let from = get("mailAccount.from");
                return from.address;
            },

            set: function (value) {
                const me   = this,
                    from = Ext.clone(me.get("mailAccount.from")),
                    ma   = me.get("mailAccount");

                from.address = value;
                ma.set("from", from);
            }
        },


        /**
         * Makes sure that the userName specified for this account is both
         * applied to the from and the replyTo address.
         */
        processUserName: {

            get: function (get) {
                let from = get("mailAccount.from");
                return from.name;
            },

            set: function (value) {
                const me      = this,
                    from    = Ext.clone(me.get("mailAccount.from")) || {},
                    replyTo = Ext.clone(me.get("mailAccount.replyTo")) || {},
                    ma      = me.get("mailAccount");

                from.name    = value;
                replyTo.name = value;

                ma.set("from", from);
                ma.set("replyTo", replyTo);
            }

        }
    },

    constructor: function () {
        const me = this;

        me.callParent(arguments);

        me.sourceMailAccounts = {};
        me.saveOperations     = {};
    },

    /**
     * Sets the MailAccount that should be used with this ViewModel.
     * This method makes sure that the ViewModel uses a cloned version of
     * the passed MailAccount.
     *
     * @param {conjoon.cn_mail.model.mail.acount.MailAccount} mailAccount
     *
     * @return {conjoon.cn_mail.model.mail.acount.MailAccount} the cloned instance of
     * mailAccount
     *
     * @throws if mailAccount is not an instance of conjoon.cn_mail.model.mail.account.MailAccount
     */
    setMailAccount: function (mailAccount) {

        if (!(mailAccount instanceof conjoon.cn_mail.model.mail.account.MailAccount)) {
            Ext.raise({
                msg: "\"mailAccount\" must be an instance of conjoon.cn_mail.model.mail.account.MailAccount",
                mailAccount: mailAccount
            });
        }

        const me  = this,
            id  = mailAccount.getId(),
            rec = me.saveOperations[id] ? me.saveOperations[id].getRecords()[0] : null;

        me.cleanup();

        if (me.saveOperations[id]) {
            me.set("mailAccount", rec);
            return rec;
        }

        let cln = mailAccount.clone();

        me.sourceMailAccounts[id] = mailAccount;
        me.set("mailAccount", cln);

        return cln;
    },


    /**
     * Destroys any references to any existing records if there is a completed
     * save-operation associated with this record.
     *
     * @private
     */
    cleanup: function () {

        const me    = this,
            oldId = me.get("mailAccount.id");

        // unload any completed operation first as soon as this ViewModel
        // should manage a new MailAccount
        if (oldId && me.saveOperations[oldId] && me.saveOperations[oldId].isComplete()) {
            delete me.saveOperations[oldId];
            delete me.sourceMailAccounts[oldId];

            return true;
        }

        return false;
    },


    /**
     * Saves the pending changes of the MailAccount available in #mailAccount
     * and commits those changes to the #sourceMailAccount afterwards.
     *
     * @return {Ext.data.Operation|null}null if no change was found, otherwise the
     * return value of the MailAccount's save() method
     */
    savePendingChanges: function () {

        const me          = this,
            view        = me.getView(),
            mailAccount = me.get("mailAccount");

        if (!mailAccount || !mailAccount.modified) {
            return null;
        }

        view.fireEvent("cn_mail-mailaccountbeforesave", view, mailAccount);

        let op = mailAccount.save({
            success: me.onSaveSuccess,
            failure: me.onSaveFailure,
            scope: me
        });

        me.saveOperations[mailAccount.getId()] = op;

        return op;

    },


    /**
     * Internal callback for the successful attempt of saving a MailAccount.
     * Applies the changed data to the source record and commits it.
     * Delegates to this ViewModel's view for triggering the
     * cn_mail-mailaccountsave event.
     *
     *
     * @param {conjoon.cn_mail.model.mail.account.MailAccount} record
     */
    onSaveSuccess: function (record) {

        const me           = this,
            view         = me.getView(),
            sourceRecord = me.sourceMailAccounts[record.getId()];

        let data = Ext.copy(
            {},
            record.data,
            ["name",
                "from",
                "replyTo",

                "inbox_type",
                "inbox_address",
                "inbox_port",
                "inbox_ssl",
                "inbox_user",
                "inbox_password",

                "active",
                "subscriptions",

                "outbox_type",
                "outbox_address",
                "outbox_port",
                "outbox_secure",
                "outbox_user",
                "outbox_password"].join(",")
        );

        sourceRecord.set(data);
        sourceRecord.commit();

        view.fireEvent("cn_mail-mailaccountsave", view, record);
    },


    /**
     * Internal callback for the failed attempt of saving a MailAccount.
     * Delegates to this ViewModel's view for triggering the
     * cn_mail-mailaccountsavefailure event.
     *
     * @param {conjoon.cn_mail.model.mail.account.MailAccount} record
     *
     * @private
     */
    onSaveFailure: function (record) {

        const me   = this,
            view = me.getView();

        view.fireEvent("cn_mail-mailaccountsavefailure", view, record);
    }

});