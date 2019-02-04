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
 * Default implementation for a ViewModel for {conjoon.cn_mail.view.mail.account.MailAccountView}
 * Note:
 * This ViewModel does not bind to the original MailAccount provided to the #setMailAccount-interface.
 * Instead, it clones this model and stores the original source model in #sourceMailAccount.
 */
Ext.define("conjoon.cn_mail.view.mail.account.MailAccountViewModel", {

    extend : 'Ext.app.ViewModel',

    requires : [
        "conjoon.cn_mail.model.mail.account.MailAccount"
    ],

    alias : 'viewmodel.cn_mail-mailaccountviewmodel',

    /**
     * Caches the references to the original mail accounts that were
     * passed to this MailAccount via #setMailAccount. An instance of this
     * ViewModel can manage multiple MailAccounts.
     *
     * @type {Object|conjoon.cn_mail.model.mail.acount.MailAccount}
     */
    sourceMailAccounts : null,

    data : {
        /**
         * Should be set by the #setMailAccount method.
         * @private
         */
        mailAccount : null
    },

    constructor : function() {
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
    setMailAccount : function(mailAccount) {

        if (!(mailAccount instanceof conjoon.cn_mail.model.mail.account.MailAccount)) {
            Ext.raise({
                msg : "\"mailAccount\" must be an instance of conjoon.cn_mail.model.mail.account.MailAccount",
                mailAccount : mailAccount
            });
        }

        const me  = this,
              id  = mailAccount.getId(),
              rec = me.saveOperations[id] ? me.saveOperations[id].getRecords()[0] : null;

        me.cleanup();

        if (me.saveOperations[id]) {
            me.set('mailAccount', rec);
            return rec;
        }

        let cln = mailAccount.clone();

        me.sourceMailAccounts[id] = mailAccount;
        me.set('mailAccount', cln);

        return cln;
    },


    /**
     * Destroys any references to any existing records if there is a completed
     * save-operation associated with this record.
     *
     * @private
     */
    cleanup : function() {

        const me    = this,
              oldId = me.get('mailAccount.id');

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
    savePendingChanges : function() {

        const me          = this,
              view        = me.getView(),
              mailAccount = me.get('mailAccount');

        if (!mailAccount.modified) {
            return null;
        }

        view.fireEvent('cn_mail-mailaccountbeforesave', view, mailAccount);

        let op = mailAccount.save({
            success : me.onSaveSuccess,
            failure : me.onSaveFailure,
            scope : me
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
    onSaveSuccess : function(record) {

        const me           = this,
              view         = me.getView(),
              sourceRecord = me.sourceMailAccounts[record.getId()];

        let data = Ext.copy(
            {},
            record.data,
            ['name',
            'userName',
            'from',
            'replyTo',

            'inbox_type',
            'inbox_address',
            'inbox_port',
            'inbox_ssl',
            'inbox_user',
            'inbox_password',

            'outbox_type',
            'outbox_address',
            'outbox_port',
            'outbox_ssl',
            'outbox_user',
            'outbox_password'].join(',')
            );

        sourceRecord.set(data);
        sourceRecord.commit();

        view.fireEvent('cn_mail-mailaccountsave', view, record);
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
    onSaveFailure : function(record) {

        const me   = this,
              view = me.getView();

        view.fireEvent('cn_mail-mailaccountsavefailure', view, record);
    }

});