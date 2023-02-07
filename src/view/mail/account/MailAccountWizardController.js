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


Ext.define("conjoon.cn_mail.view.mail.account.MailAccountWizardController", {

    extend: "Ext.app.ViewController",

    alias: "controller.cn_mail-mailaccountwizardcontroller",

    requires: [
        "coon.core.Environment",
        "coon.core.ConfigManager",
        "conjoon.cn_mail.model.mail.account.MailAccount"
    ],

    /**
     * @type {Boolean} configsLoaded
     * @private
     */


    control: {

        "#backBtn": {
            click: "onBackBtnClick"
        },

        "#cancelBtn": {
            click: "onCancelBtnClick"
        },

        "#createBtn": {
            click: "onCreateBtnClick"
        },

        "cn_mail-mailaccountwizard": {
            show: {
                fn: "onShow",
                single: true
            }
        },

        "#presets": {
            select: "onPresetSelect"
        }
    },


    onPresetSelect (dataView, preset) {
        const
            me = this,
            view = me.getView();
        
        view.showStepTwo(preset);
    },


    onBackBtnClick () {
        const
            me = this,
            view = me.getView();

        view.showStepOne();
    },


    onCancelBtnClick () {
        this.getView().close();
    },


    onCreateBtnClick () {
        const
            me = this,
            view = me.getView(),
            config = view.down("#presets").getStore().getAt(0).get("config"),
            accountName = view.down("#accountNameField").getValue(),
            name = view.down("#nameField").getValue(),
            address = view.down("#emailField").getValue(),
            accountModel = me.makeAccountModel({
                config,
                accountName,
                name,
                address
            });

        view.fireEvent("accountavailable", view, accountModel);

        return accountModel;
    },


    /**
     * @return {conjoon.cn_mail.model.mail.account.MailAccount}
     */
    makeAccountModel ({config, accountName, name, address}) {

        const from = name ? {name, address} : {address};

        return conjoon.cn_mail.model.mail.account.MailAccount.createFrom(
            Object.assign(
                config,
                {
                    name: accountName,
                    from,
                    replyTo: Object.assign({}, from),
                    active: true,
                    inbox_user: address,
                    outbox_user: address
                }
            )
        );
    },


    onShow () {
        const
            me = this,
            view = me.getView();

        if (me.configsLoaded === true) {
            return;
        }
        view.setBusy(true);
        me.loadConfig().then(configs => {
            me.configsLoaded = true;
            me.onConfigsLoad(configs);
        });
    },


    prepareConfig (configs) {

        configs = configs.map(config => {
            if (config.img) {
                config.img = coon.core.Environment.getPathForResource(
                    config.img,
                    "extjs-app-webmail"
                );
            }
            return config;
        });

        configs.push({
            /**
             * @i18n
             */
            displayName: "... other IMAP account",
            name: "Email Account",
            config: {
                "inbox_type": "IMAP",
                "inbox_port": 993,
                "inbox_ssl": true,
                "outbox_port": 587,
                "outbox_secure": "tls",
                "subscriptions": ["INBOX"]
            }
        });

        return configs;
    },


    onConfigsLoad (configs) {
        const
            me = this,
            view = me.getView();

        const store = view.down("#presets").getStore();

        configs = me.prepareConfig(configs);

        store.add(configs);

        view.setBusy(false);

    },


    async loadConfig () {
        "use strict";

        const path = coon.core.Environment.getPathForResource(
            coon.core.ConfigManager.get("extjs-app-webmail", "resources.mailServerPresets"),
            "extjs-app-webmail"
        );

        let res, configs = [];

        try {
            res = await l8.load(path);
            configs = JSON.parse(res);
        } catch (e) {
            throw new Error(`could not load account-presets from ${path}`);
        }

        return configs;
    }

});