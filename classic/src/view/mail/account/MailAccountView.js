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
 * Default view implementation for MailAccount.
 * Provides a form to change the data of a {conjoon.cn_mail.model.mail.account.MailAccount}
 * available to this view's MailAccountViewModel.
 */
Ext.define("conjoon.cn_mail.view.mail.account.MailAccountView", {

    extend : 'Ext.Panel',

    requires : [
        "conjoon.cn_mail.view.mail.account.MailAccountViewModel",
        "conjoon.cn_mail.view.mail.account.MailAccountViewController"
    ],

    alias : 'widget.cn_mail-mailaccountview',

    viewModel : 'cn_mail-mailaccountviewmodel',

    controller : 'cn_mail-mailaccountviewcontroller',

    cls : 'cn_mail-mailaccountview',

    layout : {
        type : 'vbox',
        align : 'center'
    },

    items : [{
        scrollable : 'y',
        bodyPadding : '0 40 0 40',

        margin : '0 0 5 0',
        flex : 1,
        layout : {
            type : 'vbox',
            align : 'stretch',
        },
        xtype : 'form',
          bind : {
            /**
             * @i18n
             */
            title : 'Account Settings - {mailAccount.name}'
         },
        buttons : [{
            scale  : 'small',
            ui     : 'cn-btn-medium-base-color',
            text   : 'Cancel',
            width  : 108,
            itemId : 'cancelButton'
        }, {
            scale  : 'small',
            ui     : 'cn-btn-medium-base-color',
            text   : 'Save',
            itemId : 'saveButton',
            width  : 108
        }],
        minWidth : 800,
        cls : 'fieldsetCnt',

        defaults : {
            margin : '40 0 0 0',
            defaults : {
                labelWidth : 160,
                flex : '1',
            },
            layout : {type : 'vbox', align : 'stretch'},
        },

        items : [{
            xtype : 'fieldset',
            title : 'General Information',
            margin : '10 0 0 0',
            items : [{
                xtype: 'textfield',
                fieldLabel: 'Account Name',
                name : 'name',
                bind: {
                    value: '{mailAccount.name}'
                }
            }, {
                xtype: 'textfield',
                fieldLabel: 'Your Name',
                name : 'userName',
                bind: {
                    value: '{mailAccount.userName}'
                }
            }, {
                xtype: 'textfield',
                name :  'from',
                fieldLabel: 'Email-Address',
                bind: {
                    value: '{mailAccount.from}'
                }
            }, {
                xtype: 'textfield',
                name : 'replyTo',
                fieldLabel: 'Reply-To',
                bind: {
                    value: '{mailAccount.replyTo}'
                }
            }]
        }, {
            xtype : 'fieldset',
            bind : {
                title : 'Incoming Server ({mailAccount.inbox_type})',
            },
            items: [{
                xtype : 'container',
                layout : {
                    type: 'hbox',
                    align : 'stretch'
                },
                items : [{
                    xtype: 'textfield',
                    flex : 9,
                    labelWidth: 160,
                    fieldLabel: 'Address',
                    name : 'inbox_address',
                    bind: {
                        value: '{mailAccount.inbox_address}'
                    }
                }, {
                    xtype: 'textfield',
                    margin : '0 0 0 5',
                    flex : 1,
                    labelWidth : 10,
                    fieldLabel: ' ',
                    name : 'inbox_port',
                    bind: {
                        value: '{mailAccount.inbox_port}'
                    }
                }]}, {
                xtype: 'checkbox',
                labelWidth : 160,
                inputValue : true,
                fieldLabel: 'Use SSL',
                name : 'inbox_ssl',
                bind: {
                    value: '{mailAccount.inbox_ssl}'
                }
            }, {
                xtype : 'container',
                margin : '0 0 10 0',
                layout : {
                    type: 'hbox',
                    align : 'stretch'
                },
                items : [{
                    xtype: 'textfield',
                    flex : 1,
                    labelWidth: 160,
                    name : 'inbox_user',
                    fieldLabel: 'Username',
                    bind: {
                        value: '{mailAccount.inbox_user}'
                    }
                }, {
                    xtype: 'textfield',
                    margin : '0 0 0 20',
                    inputType : 'password',
                    flex : 1,
                    labelWidth: 80,
                    name : 'inbox_password',
                    fieldLabel: 'Password',
                    bind: {
                        value: '{mailAccount.inbox_password}'
                    }
                }]}]
        }, {
            xtype : 'fieldset',
            title : 'SMTP Server',
            items: [{
                xtype : 'container',
                anchor : '100%',
                layout : {
                    type: 'hbox',
                    align : 'stretch'
                },
                items : [{
                    xtype: 'textfield',
                    flex : 9,
                    labelWidth: 160,
                    fieldLabel: 'Address',
                    name : 'outbox_address',
                    bind: {
                        value: '{mailAccount.outbox_address}'
                    }
                }, {
                    xtype: 'textfield',
                    margin : '0 0 0 5',
                    flex : 1,
                    name : 'outbox_port',
                    labelWidth : 10,
                    fieldLabel: ' ',
                    bind: {
                        value: '{mailAccount.outbox_port}'
                    }
                }]}, {
                xtype: 'checkbox',
                labelWidth : 160,
                inputValue : true,
                fieldLabel: 'Use SSL',
                name : 'outbox_ssl',
                bind: {
                    value: '{mailAccount.outbox_ssl}'
                }
            }, {
                xtype : 'container',
                margin : '0 0 10 0',
                layout : {
                    type: 'hbox',
                    align : 'stretch'
                },
                items : [{
                    xtype: 'textfield',
                    flex : 1,
                    labelWidth: 160,
                    name : 'outbox_user',
                    fieldLabel: 'Username',
                    bind: {
                        value: '{mailAccount.outbox_user}'
                    }
                }, {
                    xtype: 'textfield',
                    margin : '0 0 0 20',
                    inputType : 'password',
                    flex : 1,
                    labelWidth: 80,
                    name : 'outbox_password',
                    fieldLabel: 'Password',
                    bind: {
                        value: '{mailAccount.outbox_password}'
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
    setMailAccount : function(mailAccount) {

        const me = this,
              vm = me.getViewModel();

        if (!mailAccount) {
            return null;
        }

        return vm.setMailAccount(mailAccount);
    },


    /**
     * Returns true if the MailAccount model used by this view was changed
     * and those changes have not yet been committed.
     *
     * @returns {Boolean}
     */
    hasPendingChanges : function() {
        const me          = this,
              mailAccount = me.getViewModel().get('mailAccount');

        return !!(mailAccount && mailAccount.modified);
    },


    /**
     * Provides an interface for the API to reject the outstanding changes of this
     * view's MailAccount-model, if there are any.
     *
     * @returns {boolean} true if there have been outstanding changes that were
     * rejected, otherwise false
     */
    rejectPendingChanges : function() {
        const me          = this,
              mailAccount = me.getViewModel().get('mailAccount');

        if (!mailAccount || !mailAccount.modified) {
            return false;
        }

        mailAccount.reject();
        return true;
    }

});