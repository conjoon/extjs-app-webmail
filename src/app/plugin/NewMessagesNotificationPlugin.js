/**
 * coon.js
 * extjs-app-webmail
 * Copyright (C) 2021-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * ControllerPlugin for sending Notification messages/sound to ther desktop
 * of the user when recent messages have been found or loaded from the backend.
 * The plugin will make sure that the PackageController registers itself to the
 * "conjoon.cn_mail.event.NewMessagesAvailable"-event and the cn_mail-mailmessagegridload
 * of the MessageGrid to react appropriately to these events.
 *
 */
Ext.define("conjoon.cn_mail.app.plugin.NewMessagesNotificationPlugin", {

    extend: "coon.core.app.plugin.ControllerPlugin",

    requires: [
        // @define
        "l8",
        "coon.user.Manager",
        "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore",
        "conjoon.cn_mail.data.mail.MailboxRunner",
        "coon.comp.window.Toast",
        "coon.core.Environment",
        "coon.core.ConfigManager",
        "conjoon.cn_mail.data.mail.service.MailFolderHelper",
        "conjoon.cn_mail.app.PackageController"
    ],

    /**
     * Default interval to be used with the MailboxRunner, if the package configuration does
     * not have it configured
     * @cfg {Number} defaultInterval
     */
    interval: 120000,

    /**
     * @var {conjoon.cn_mail.data.mail.MailboxRunner} mailboxRunner
     * @private
     */

    /**
     * @var {coon.core.app.PackageController} controller
     * @private
     */

    /**
     * @var {HTMLAudioElement} audio
     * @private
     */

    /**
     * @inheritdoc
     */
    run (controller) {
        "use strict";

        if (!coon.user.Manager.getUser()) {
            return false;
        }

        if (!(controller instanceof conjoon.cn_mail.app.PackageController)) {
            throw new Error("\"controller\" must be an instance of conjoon.cn_mail.app.PackageController");
        }

        const
            me = this,
            treeStore = conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance();

        me.controller = controller;

        me.mailboxRunner = Ext.create("conjoon.cn_mail.data.mail.MailboxRunner", {
            mailFolderTreeStore: treeStore,
            interval: me.interval
        });


        controller.listen({
            global: {
                "conjoon.cn_mail.event.NewMessagesAvailable": {
                    fn: me.onNewMessagesAvailable,
                    scope: me
                }
            }
        });

        controller.control({
            "cn_mail-mailmessagegrid": {
                "cn_mail-mailmessagegridload": {
                    fn: me.onMessageGridLoad,
                    scope: me
                }
            }
        });

        return true;
    },


    /**
     * Callback for the global conjoon.cn_mail.event.NewMessagesAvailable event.
     *
     * @param {conjoon.cn_mail.model.mail.folder.MailFolder} mailFolder
     * @param {Array<conjoon.cn_mail.model.mail.message.MessageItem>} messageItems
     *
     * @return {null|Boolean=true} true if notification process was initiated, otehrwise null
     */
    onNewMessagesAvailable (mailFolder, messageItems) {

        const
            me = this,
            len = messageItems.length;

        if (!len) {
            return null;
        }

        const notificationTxt = me.getNotificationText(mailFolder, len);

        coon.Toast.info(notificationTxt);
        me.showNotification(mailFolder, notificationTxt);
        me.playSound();
        me.updateMessageGridWithRecentMessages(mailFolder, messageItems);

        return true;
    },


    /**
     * Callback for the "cn_mail-mailmessagegridload"-event of the MailMessageGrid.
     * Will check if any of the items flagged as "recent" that were loaded with the grid's store
     * is already existing in recentMessageItems, and if not, trigger the notification-process for
     * these items. They will get added to the recentMessagheItemKeys-Set afterwards to prevent
     * notification-duplicates.
     *
     * @param {conjoon.cn_mail.store.mail.message.MessageItemStore} store
     * @param {Array<conjoon.cn_mail.model.mail.message.MessageItem>} messageItems
     *
     * @return {null|Boolean=true} true for notifications that were sent, otherwise null
     */
    onMessageGridLoad (store, messageItems) {

        const
            me = this,
            ctrl = me.controller,
            recentMessageItemKeys = conjoon.cn_mail.MailboxService.recentMessageItemKeys,
            inboxViewCtrl = ctrl.getMailInboxView().getController(),
            mailFolder = inboxViewCtrl.getSelectedMailFolder(),
            recentMessages = messageItems.filter(
                item => item.get("recent") === true && !recentMessageItemKeys.has(item.getCompoundKey().toString())
            );

        if (!recentMessages.length) {
            return null;
        }

        recentMessages.forEach(recentMessage => {
            recentMessageItemKeys.add(recentMessage.getCompoundKey().toString());
        });

        me.showNotification(
            mailFolder,
            me.getNotificationText(mailFolder, recentMessages.length)
        );
        me.playSound();

        return true;
    },


    /**
     * Updates the current active MessageItemGrid - if any - with the messageItems,
     * if the mailFolder specified is the current selected mailFolder. If any of the
     * messageItems is already found in the grid, it gets not re-added.
     *
     * @param {conjoon.cn_mail.model.mail.folder.MailFolder} mailFolder
     * @param {Array<conjoon.cn_mail.model.mail.message.MessageItem>} messageItems
     *
     * @return {Boolean} false if the selected mail folder was not the folder for
     * which the event was triggered, and no items were added
     */
    updateMessageGridWithRecentMessages (mailFolder, messageItems) {

        const
            me = this,
            ctrl = me.controller,
            inboxViewCtrl = ctrl.getMailInboxView().getController(),
            livegrid =inboxViewCtrl.getLivegrid();

        if (inboxViewCtrl.getSelectedMailFolder() !== mailFolder) {
            return false;
        }

        messageItems.forEach(item => {
            if (livegrid.getRecordByCompoundKey(item.getCompoundKey())) {
                return;
            }
            livegrid.add(item);
            item.join(me.controller.getMailMessageGrid().getStore());
        });

        return true;
    },


    /**
     * Plays an audio file for notifying about new messages.
     *
     * @return {null|HTMLAudioElement} returns null if no audio file was found, otherwise the created
     * Audio-object.
     *
     * @private
     */
    playSound () {

        const me = this;

        if (!me.audio) {
            const file = me.getResource("soundFile");

            if (!file) {
                return null;
            }
            me.audio = new Audio(file);
        }

        const audio = me.audio;

        //@see https://developer.chrome.com/blog/autoplay/
        const promise = audio.play();
        if (promise !== undefined) {
            promise.then(() => {}).catch(err => {});
        }

        return audio;
    },


    /**
     * Shows a Notification with the specified messageText. Will redirect to
     * the mailFolder`s toUrl()-return value on click.
     * The title for the notification will either be the value found in the application's configured
     * "title"-property, or the application's name itself if no configured title was found.
     *
     * @param {conjoon.cn_mail.model.mail.folder.MailFolder} mailFolder
     * @param {String} message
     *
     * @return {null|Notification} returns null if the Notification was not created due to
     * lack of permissions, otherwise the created Notification
     *
     * @private
     */
    showNotification (mailFolder, messageTxt    ) {


        if (Notification.permission === "denied") {
            return null;
        }

        const
            me = this,
            file = me.getResource("iconFile"),
            cfg = {},
            appName = coon.core.Environment.getManifest("name"),
            title = coon.core.ConfigManager.get(appName, "title");

        if (file) {
            cfg.icon = file;
        }

        let notification = new Notification(
            `${title || me.controller.getApplication().getName()} - new email`,
            Object.assign({
                body: messageTxt
            }, cfg)
        );
        notification.onclick = function () {
            window.focus();
            me.controller.redirectTo(mailFolder.toUrl());
            this.close();
        };

        return notification;
    },


    /**
     *
     * @param {conjoon.cn_mail.model.mail.folder.MailFolder} mailFolder
     * @param {Number} len
     * @returns {string}
     *
     * @private
     */
    getNotificationText (mailFolder, len) {
        return `${conjoon.cn_mail.MailFolderHelper.getInstance()
            .getAccountNode(mailFolder.get("mailAccountId"))
            .get("name")} has ${len} new message${len > 1 ? "s" : ""}`;
    },


    /**
     * Returns the path to the resource represented by the type for this plugin.
     * Queries the package configuration of "extjs-app-webmail" for
     * "resources.[sounds|images].notifications.newEmail", depending on the passed type
     *
     * @param {String} type "soundFile" or "iconFile" to detect the path to the resource given
     * the package config an environment
     * @returns {String|null}
     */
    getResource (type) {
        const
            me = this,
            types = ["iconFile", "soundFile"];

        if (!types.includes(type)) {
            throw new Error(`"type" must be one of ${types.join(", ")}`);
        }

        if (me[type] !== undefined) {
            return me[type];
        }

        const conf = me.getConfig();

        me[type] = l8.unchain(
            `resources.${type === "soundFile" ? "sounds" : "images"}.notifications.newEmail`,
            conf, undefined
        );

        if (me[type]) {
            me[type] = coon.core.Environment.getPathForResource(me[type], "extjs-app-webmail");
            return me[type];
        }

        return null;
    },


    /**
     * @returns {Object}
     * @private
     */
    getConfig () {
        const me = this;
        return me.controller.getApplication().getPackageConfig(me.controller);
    }


});
