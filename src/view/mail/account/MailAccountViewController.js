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
 * Default implementation for ViewController for MailAccountView.
 */
Ext.define("conjoon.cn_mail.view.mail.account.MailAccountViewController", {

    extend : 'Ext.app.ViewController',


    alias : 'controller.cn_mail-mailaccountviewcontroller',


    control : {

        'cn_mail-mailaccountview' : {
            'cn_mail-mailaccountbeforesave'  : 'onBeforeMailAccountSave',
            'cn_mail-mailaccountsave'        : 'onMailAccountSaveCallback',
            'cn_mail-mailaccountsavefailure' : 'onMailAccountSaveCallback',
            hide                             : 'onMailAccountViewHide'
        },

        '#saveButton' : {
            click : 'onSaveButtonClick'
        },

        '#cancelButton' : {
            click : 'onCancelButtonClick'
        }
    },


    /**
     * Callback for the saveButton's "click" event.
     *
     * @param {Ext.Button} btn
     */
    onSaveButtonClick : function(btn) {

        const me = this,
            view = me.getView();

        return view.getViewModel().savePendingChanges();
    },


    /**
     * Callback for the cancelButton's "click" event.
     * Delegates to this view's rejectPendingChanges
     *
     * @param {Ext.Button} btn
     */
    onCancelButtonClick : function(btn) {

        const me   = this,
              view = me.getView();

        return view.rejectPendingChanges();

    },


    /**
     * Callback for the cn_mail-mailaccountbeforesave-event of this ViewController's
     * MailAccountView.
     *
     * @param {conjoon.cn_mail.view.mail.accountMailAccountView} view
     * @param {conjoon.cn_mail.view.model.account.MailAccountModel} mailAccount
     *
     * @see #setBusy
     */
    onBeforeMailAccountSave : function(view, mailAccount) {
        const me = this;

        view.setBusy();
    },


    /**
     * Callback for the cn_mail-mailaccountsave/failure-event of this ViewController's
     * MailAccountView.
     *
     * @param {conjoon.cn_mail.view.mail.accountMailAccountView} view
     * @param {conjoon.cn_mail.view.model.account.MailAccountModel} mailAccount
     *
     * @see #setBusy
     */
    onMailAccountSaveCallback : function(view, mailAccount) {

        const me = this;

        view.setBusy(false);

        if (!view.isVisible()) {
            view.getViewModel().cleanup();
        }
    },


    /**
     * Callback for the MailAccountView's hide event. Delegates to
     * the ViewModel of the view by calling its cleanup() method.
     *
     * @param {conjoon.cn_mail.view.mail.account.MailAccountView} view
     */
    onMailAccountViewHide : function(view) {

        const me = this;

        view.getViewModel().cleanup();
    }


});