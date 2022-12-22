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
 * Default view implementation for MailAccount.
 * Provides a form to change the data of a {conjoon.cn_mail.model.mail.account.MailAccount}
 * available to this view's MailAccountViewModel.
 */
Ext.define("conjoon.cn_mail.view.mail.account.MailAccountWizard", {

    extend: "Ext.Window",


    requires: [
        "conjoon.cn_mail.view.mail.account.MailAccountWizardController",
        "coon.core.ConfigManager",
        "coon.core.Environment",
        "conjoon.cn_mail.data.mail.folder.MailFolderTypes"
    ],

    /**
     * @event accountavailable
     * @param this
     * @param {conjoon.cn_mail.model.mail.account.MailAccount}
     */

    alias: "widget.cn_mail-mailaccountwizard",

    controller: "cn_mail-mailaccountwizardcontroller",


    cls: "cn_mail-mailaccountwizard",
    
    
    /**
     * @type {coon.comp.component.LoadMask} busyMask
     * @private
     */


    autoShow: false,

    resizable: false,

    width: 400,

    height: 600,

    header: false,

    padding: "20 20 0 20",

    buttons: [{
        text: "Back",
        itemId: "backBtn",
        hidden: true
    }, {
        text: "Create",
        itemId: "createBtn",
        hidden: true
    }, {
        text: "Cancel",
        itemId: "cancelBtn"
    }],

    layout: {
        type: "vbox",
        align: "stretch"
    },

    scrollable: "y",

    items: [{
        itemId: "intro",
        xtype: "component",
        margin: "10 10 10 10",
        /**
         * @i18n
         */
        html: "<span class=\"intro\">Add new account</span><span> - select a preset:</span>"
    }, {
        xtype: "dataview",
        itemId: "presets",
        itemSelector: "div.preset",
        tpl: [
            "<tpl for=\".\">",
            "<div class=\"preset\">",
            "<tpl if=\"img\">",
            "<img src=\"{img}\" />",
            "<tpl else>",
            "<span class=\"no-img fa fa-envelope\"></span>",
            "</tpl>",
            "<div class=\"name\">",
            "<tpl if=\"displayName\">",
            "{displayName}",
            "<tpl else>",
            "{name}",
            "</tpl>",
            "</div>",
            "</div>",
            "</tpl>"
        ],
        store: {
            fields: ["name", "img"],
            data: []
        }
    }, {
        xtype: "textfield",
        hidden: true,
        fieldLabel: "Account-Name",
        itemId: "accountNameField"
    }, {
        xtype: "textfield",
        hidden: true,
        fieldLabel: "Your name",
        itemId: "nameField"
    }, {
        xtype: "textfield",
        hidden: true,
        fieldLabel: "Email-Address",
        itemId: "emailField"
    }],


    showStepOne () {
        const me = this;

        me.down("#presets").getStore().clearFilter();

        me.stepOneElements().map(itemId => me.down(itemId).setHidden(false));
        me.stepTwoElements().map(itemId => me.down(itemId).setHidden(true));
    },


    showStepTwo (preset) {

        const me = this;

        me.down("#presets").getStore().filter(rec => {
            return rec.getId() === preset.getId();
        });

        me.stepOneElements().map(itemId => me.down(itemId).setHidden(true));
        me.stepTwoElements().map(itemId => me.down(itemId).setHidden(false));

        me.down("#accountNameField").setValue(preset.get("name") ?? preset.get("displayName"));
        me.down("#nameField").focus();

        me.down("#presets").getSelectionModel().deselectAll();
    },


    /**
     * @private
     */
    stepOneElements: () => [
        "#intro" , "#cancelBtn"
    ],


    /**
     * @private
     */
    stepTwoElements: () => [
        "#accountNameField" , "#backBtn", "#createBtn", "#nameField", "#emailField"
    ],


    setBusy (show = true) {
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
                msg: "Loading configuration",
                msgAction: "Please wait...",
                glyphCls: "fa fa-spin fa-gear",
                target: me
            });
            me.busyMask = mask;
        }

        mask.show();
        mask.loopProgress();
        return mask;
    }


});