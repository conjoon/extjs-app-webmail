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
 * Default implementation for ViewController for MailAccountView.
 */
Ext.define("conjoon.cn_mail.view.mail.account.MailAccountViewController", {

    extend: "Ext.app.ViewController",


    alias: "controller.cn_mail-mailaccountviewcontroller",


    control: {

        "cn_mail-mailaccountview": {
            "cn_mail-mailaccountbeforesave": "onBeforeMailAccountSave",
            "cn_mail-mailaccountsave": "onMailAccountSaveCallback",
            "cn_mail-mailaccountsavefailure": "onMailAccountSaveCallback",
            hide: "onMailAccountViewHide"
        },

        "#saveButton": {
            click: "onSaveButtonClick"
        },

        "#cancelButton": {
            click: "onCancelButtonClick"
        }
    },


    /**
     * Callback for the saveButton's "click" event.
     *
     * @param {Ext.Button} btn
     *
     * @see validate()
     */
    onSaveButtonClick: function (btn) {

        const me = this,
            view = me.getView();

        if (me.validate() !== true) {
            me.getView().showMailAccountNotValidMessage();
            return;
        }

        return view.getViewModel().savePendingChanges();
    },


    /**
     * Validates the
     */
    validate () {

        const
            me = this,
            mailAccount = me.getViewModel().get("mailAccount"),
            name = (mailAccount.get("name") || "").toLowerCase().trim();

        let accounts = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance().getRoot().childNodes;

        accounts = accounts || [];

        let found = accounts.some(
            node => node.getId() !== mailAccount.getId() && node.get("name").toLowerCase().trim() === name
        );

        return !found;
    },


    /**
     * Callback for the cancelButton's "click" event.
     * Delegates to this view's rejectPendingChanges
     *
     * @param {Ext.Button} btn
     */
    onCancelButtonClick: function (btn) {

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
    onBeforeMailAccountSave: function (view, mailAccount) {
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
    onMailAccountSaveCallback: function (view, mailAccount) {
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
    onMailAccountViewHide: function (view) {
        view.getViewModel().cleanup();
    }


});