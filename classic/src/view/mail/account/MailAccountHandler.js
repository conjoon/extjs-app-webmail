/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Handler representing Strategy for adding MailAccounts.
 */Ext.define("conjoon.cn_mail.view.mail.account.MailAccountHandler", {


    requires: [
        // @define
        "l8",
        "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore",
        "conjoon.cn_mail.view.mail.account.MailAccountWizard",
        "coon.comp.component.MessageMask"
    ],

    /**
     * @type {conjoon.cn_mail.app.PackageController} mailPackageController
     * @private
     */

    enabled () {
        return true;
    },

    
    invoke () {
        const
            me = this,
            mailView = me.getMailMainPackageView();

        const accountWizard = me.createOrReturnAccountWizard();
        mailView.add(accountWizard);

        accountWizard.show();
        return accountWizard;
    },


    createOrReturnAccountWizard () {
        const me = this;

        if (!me.accountWizard || me.accountWizard.destroyed) {
            me.accountWizard = null;
            let accountWizard = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountWizard");
            accountWizard.on("accountavailable", me.onAccountAvailable, me);
            me.accountWizard = accountWizard;
        }

        return me.accountWizard;
    },


    onAccountAvailable (wizard, mailAccount) {
        const
            me = this,
            store = me.getMailFolderStore();

        wizard.setBusy(true, "Saving...");

        // add mailAccount first since store might update its name
        store.addMailAccount(mailAccount);

        // ... then save
        mailAccount.save({
            success: me.onMailAccountSaveSuccess,
            failure: me.onMailAccountSaveFailure,
            scope: me
        });
    },


    onMailAccountSaveSuccess (mailAccount) {
        const me = this;

        me.accountWizard.close();
        me.getMailFolderTreeSelectionModel().select(mailAccount);
    },


    onMailAccountSaveFailure () {

        const me = this;

        me.accountWizard.setBusy(false);
        me.accountWizard.hide();

        me.showFailureMask();
    },


    showFailureMask () {

        const me = this;

        let myMask = Ext.create("coon.comp.component.MessageMask", {
            title: "Saving failed",
            message: "Creating the Mail Account failed. Retry?",
            target: me.getMailMainPackageView(),
            buttons: coon.comp.component.MessageMask.YESNO,
            icon: coon.comp.component.MessageMask.FAILURE,
            callback: function (btnAction) {
                const me = this;
                if (btnAction === "noButton") {
                    me.accountWizard.close();
                    myMask.close();
                    return;
                }

                myMask.close();
                me.accountWizard.show();
            },
            scope: me
        });

        myMask.show();
    },


    /**
     * @private
     */
    getMailFolderTreeSelectionModel () {
        return this.getMailPackageController().getMailFolderTree().getSelectionModel();
    },


    /**
     * @private
     */
    getMailMainPackageView () {
        return this.getMailPackageController().getMainPackageView();
    },


    /**
     * @private
     */
    getMailPackageController () {
        const me = this;
        if (!me.mailPackageController) {
            me.mailPackageController = Ext.getApplication().getController("conjoon.cn_mail.app.PackageController");
        }

        return me.mailPackageController;
    },


    /**
     * @private
     * @returns {conjoon.cn_mail.store.mail.folder.MailFolderTreeStore}
     */
    getMailFolderStore () {
        return conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();
    }

});