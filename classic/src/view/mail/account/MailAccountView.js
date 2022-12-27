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
 * Default view implementation for MailAccount.
 * Provides a form to change the data of a {conjoon.cn_mail.model.mail.account.MailAccount}
 * available to this view's MailAccountViewModel.
 */
Ext.define("conjoon.cn_mail.view.mail.account.MailAccountView", {

    extend: "Ext.Panel",

    requires: [
        "Ext.form.FieldSet",
        "coon.comp.component.MessageMask",
        "coon.comp.component.LoadMask",
        "conjoon.cn_mail.view.mail.account.MailAccountViewModel",
        "conjoon.cn_mail.view.mail.account.MailAccountViewController"
    ],

    alias: "widget.cn_mail-mailaccountview",

    viewModel: "cn_mail-mailaccountviewmodel",

    controller: "cn_mail-mailaccountviewcontroller",

    /**
     * @event cn_mail-mailaccountbeforesave
     * @param this
     * @param {conjoon.cn_mail.model.mail.account.MailAccount}
     *
     * Gets fired before the MailAccount gets saved.
     */

    /**
     * @event cn_mail-mailaccountsave
     * @param this
     * @param {conjoon.cn_mail.model.mail.account.MailAccount}
     *
     * Gets fired after the MailAccount was successfully saved.
     */

    /**
     * @event cn_mail-mailaccountsavefailure
     * @param this
     * @param {conjoon.cn_mail.model.mail.account.MailAccount}
     *
     * Gets fired if saving a MailAccount failed.
     */

    cls: "cn_mail-mailaccountview",

    layout: {
        type: "vbox",
        align: "center"
    },

    /**
     * @type {coon.comp.component.LoadMask}
     */
    busyMask: null,

    items: [{
        scrollable: "y",
        bodyPadding: "0 40 0 40",

        margin: "0 0 5 0",
        flex: 1,
        layout: {
            type: "vbox",
            align: "stretch"
        },
        xtype: "form",
        bind: {
            /**
             * @i18n
             */
            title: "Account Settings - {mailAccount.name}"
        },
        buttons: [{
            text: "Cancel",
            width: 108,
            itemId: "cancelButton"
        }, {
            text: "Save",
            itemId: "saveButton",
            width: 108
        }],
        minWidth: 800,
        cls: "fieldsetCnt",

        defaults: {
            margin: "40 0 0 0",
            defaults: {
                labelWidth: 160,
                labelAlign: "right",
                flex: "1"
            },

            layout: {type: "vbox", align: "stretch"}
        },

        items: [{
            xtype: "fieldset",
            title: "General Information",
            margin: "10 0 0 0",
            items: [{
                xtype: "textfield",
                fieldLabel: "Account Name",
                name: "name",
                bind: {
                    value: "{mailAccount.name}"
                }
            }, {
                xtype: "textfield",
                fieldLabel: "Your Name",
                name: "userName",
                bind: {
                    value: "{processUserName}"
                }
            }, {
                xtype: "textfield",
                name: "from",
                fieldLabel: "Email-Address",
                bind: {
                    value: "{processFrom}"
                }
            }, {
                xtype: "textfield",
                name: "replyTo",
                fieldLabel: "Reply-To",
                bind: {
                    value: "{processReplyTo}"
                }
            }, {
                xtype: "checkbox",
                labelWidth: 160,
                inputValue: true,
                fieldLabel: "Active",
                name: "inactive",
                bind: {
                    value: "{!mailAccount.inactive}"
                }
            }]
        }, {
            xtype: "fieldset",
            bind: {
                title: "Incoming Server ({mailAccount.inbox_type})"
            },
            items: [{
                xtype: "container",
                layout: {
                    type: "hbox",
                    align: "stretch"
                },
                defaults: {
                    labelAlign: "right"
                },
                items: [{
                    xtype: "textfield",
                    flex: 9,
                    labelWidth: 160,
                    fieldLabel: "Address",
                    name: "inbox_address",
                    bind: {
                        value: "{mailAccount.inbox_address}"
                    }
                }, {
                    xtype: "textfield",
                    margin: "0 0 0 5",
                    flex: 1,
                    labelWidth: 10,
                    fieldLabel: " ",
                    name: "inbox_port",
                    bind: {
                        value: "{mailAccount.inbox_port}"
                    }
                }]}, {
                xtype: "checkbox",
                labelWidth: 160,
                inputValue: true,
                fieldLabel: "Use SSL",
                name: "inbox_ssl",
                bind: {
                    value: "{mailAccount.inbox_ssl}"
                }
            }, {
                xtype: "container",
                margin: "0 0 10 0",
                layout: {
                    type: "hbox",
                    align: "stretch"
                },
                defaults: {
                    labelAlign: "right"
                },
                items: [{
                    xtype: "textfield",
                    flex: 1,
                    labelWidth: 160,
                    name: "inbox_user",
                    fieldLabel: "Username",
                    bind: {
                        value: "{mailAccount.inbox_user}"
                    }
                }, {
                    xtype: "textfield",
                    margin: "0 0 0 20",
                    inputType: "password",
                    flex: 1,
                    labelWidth: 80,
                    name: "inbox_password",
                    fieldLabel: "Password",
                    bind: {
                        value: "{mailAccount.inbox_password}"
                    }
                }]}]
        }, {
            xtype: "fieldset",
            title: "SMTP Server",
            items: [{
                xtype: "container",
                anchor: "100%",
                layout: {
                    type: "hbox",
                    align: "stretch"
                },
                defaults: {
                    labelAlign: "right"
                },
                items: [{
                    xtype: "textfield",
                    flex: 9,
                    labelWidth: 160,
                    fieldLabel: "Address",
                    name: "outbox_address",
                    bind: {
                        value: "{mailAccount.outbox_address}"
                    }
                }, {
                    xtype: "textfield",
                    margin: "0 0 0 5",
                    flex: 1,
                    name: "outbox_port",
                    labelWidth: 10,
                    fieldLabel: " ",
                    bind: {
                        value: "{mailAccount.outbox_port}"
                    }
                }]}, {
                xtype: "combobox",
                labelWidth: 160,
                fieldLabel: "Secure",
                cls: "outbox_secure",
                name: "outbox_secure",
                displayField: "value",
                editable: false,
                valueField: "id",
                store: {
                    data: [{
                        id: "ssl",
                        value: "SSL"
                    }, {
                        id: "tls",
                        value: "TLS"
                    }]
                },
                bind: {
                    value: "{mailAccount.outbox_secure}"
                }
            }, {
                xtype: "container",
                margin: "0 0 10 0",
                layout: {
                    type: "hbox",
                    align: "stretch"
                },
                defaults: {
                    labelAlign: "right"
                },
                items: [{
                    xtype: "textfield",
                    flex: 1,
                    labelWidth: 160,
                    name: "outbox_user",
                    fieldLabel: "Username",
                    bind: {
                        value: "{mailAccount.outbox_user}"
                    }
                }, {
                    xtype: "textfield",
                    margin: "0 0 0 20",
                    inputType: "password",
                    flex: 1,
                    labelWidth: 80,
                    name: "outbox_password",
                    fieldLabel: "Password",
                    bind: {
                        value: "{mailAccount.outbox_password}"
                    }
                }]}]
        }]
    }],


    /**
     * Sets the MailAcount this view should represent. Delegates to this view's
     * ViewModel #setMailAccount-method.
     *
     * @param {conjoon.cn_mail.model.mail.account.MailAccount} mailAccount
     *
     * @return {conjoon.cn_mail.model.mail.account.MailAccount} The mail account
     * model that was used for the binding. This must not necessarily be the same
     * reference as the incoming model if the ViewModel uses a cloned version.
     * Returns null if no MailAccount was available for this method.
     */
    setMailAccount: function (mailAccount) {

        const me = this,
            vm = me.getViewModel(),
            id = mailAccount ? mailAccount.getId() : null;

        if (!mailAccount) {
            return null;
        }

        me.setBusy(!!vm.saveOperations[id]);

        return vm.setMailAccount(mailAccount);
    },


    /**
     * Returns true if the MailAccount model used by this view was changed
     * and those changes have not yet been committed.
     *
     * @returns {Boolean}
     */
    hasPendingChanges: function () {
        const me          = this,
            mailAccount = me.getViewModel().get("mailAccount");

        return !!(mailAccount && mailAccount.modified);
    },


    /**
     * Provides an interface for the API to reject the outstanding changes of this
     * view's MailAccount-model, if there are any.
     *
     * @returns {boolean} true if there have been outstanding changes that were
     * rejected, otherwise false
     */
    rejectPendingChanges: function () {
        const me          = this,
            mailAccount = me.getViewModel().get("mailAccount");

        if (!mailAccount || !mailAccount.modified) {
            return false;
        }

        mailAccount.reject();
        return true;
    },


    /**
     * Updates this MailAccount's view to indicate that it is currently busy saving
     * data. The indicator is represented by a coon.comp.component.LoadMask.
     *
     * @param {Boolean} show false to hide any currently active
     * mask indicating busy state, or true to show the mask
     *
     * @return {coon.comp.component.LoadMask}
     *
     * @see #busyMask
     *
     * @throws if conf is neither boolean nor an Object
     */

    setBusy: function (show = true) {

        const me = this;

        let mask = me.busyMask;

        if (show === false) {
            if (mask) {
                mask.hide();
            }
            return mask;
        }

        if (!mask && show !== false) {
            mask = Ext.create("coon.comp.component.LoadMask", {
                /**
                 * @i18n
                 */
                msg: "Saving account",
                msgAction: "Please wait...",
                glyphCls: "fa fa-spin fa-gear",
                target: me
            });
            me.busyMask = mask;
        }

        mask.show();

        mask.loopProgress();

        return mask;
    },


    showMailAccountNotValidMessage () {

        const me = this;

        let myMask = Ext.create("coon.comp.component.MessageMask", {
            title: "Invalid configuration",
            message: "Please make sure that an account name is specified which does not already exist.",
            target: me,
            buttons: coon.comp.component.MessageMask.OK,
            icon: coon.comp.component.MessageMask.ERROR
        });

        myMask.show();

    }

});