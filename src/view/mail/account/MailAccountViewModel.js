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
     * Caches the reference to the original mail account that was passed
     * to this MailAccount via #setMailAccount
     *
     * @type {conjoon.cn_mail.model.mail.acount.MailAccount}
     */
    sourceMailAccount : null,

    data : {
        /**
         * Should be set by the #setMailAccount method.
         * @private
         */
        mailAccount : null
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
              cln = mailAccount.clone();

        me.sourceMailAccount = mailAccount;

        me.set('mailAccount', cln);

        return cln;
    }






});