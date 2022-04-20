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

StartTest(t => {

    let mailFolderHelperSpy, environmentSpy, configSpy, appNameSpy, plugin, packageConfig = {};

    class AudioMock {

        constructor (file) {
            this.file = file;
        }

        play () {


        }

    }

    class NotificationMock {

        constructor (title, cfg) {
            this.title = title;
            this.cfg = cfg;
        }

        close () {

        }
    }

    const
        store = {},
        livegrid = {
            getRecordByCompoundKey: function () {

            },
            add: function () {

            }
        },
        inboxViewController = {
            getLivegrid: function () {
                return livegrid;
            },
            getSelectedMailFolder: function () {

            }
        },
        applicationName = "conjoon",
        accountNode = {
            name: "accountNodeName"
        },
        mailFolderHelper = {
            getAccountNode: function () {
                return {
                    get: function () {
                        return accountNode.name;
                    }
                };
            }
        },
        packageName = "extjs-app-webmail",
        applicationMock = {
            getPackageConfig: function () {
                return packageConfig;
            },
            getName: function () {
                return applicationName;
            }
        },
        // PackageController for which the ControllerPlugin is installed
        controllerMock = {
            getApplication: function () {
                return applicationMock;
            },
            redirectTo: function (url) {

            },
            getMailInboxView: function () {
                return {
                    getController: function () {
                        return inboxViewController;
                    }
                };
            },
            getMailMessageGrid: function () {
                return {
                    getStore: function () {
                        return store;
                    }
                };
            }
        },
        expectedPath = resource => `${packageName}/${resource}`;


    const create = (cfg) => {
        let plugin = Ext.create("conjoon.cn_mail.app.plugin.NewMessagesNotificationPlugin", cfg || {});
        plugin.controller = controllerMock;
        return plugin;
    };


    t.beforeEach(() => {
        plugin = create();

        mailFolderHelperSpy = t.spyOn(conjoon.cn_mail.MailFolderHelper, "getInstance").and.returnValue(
            mailFolderHelper
        );

        appNameSpy = t.spyOn(coon.core.Environment, "getManifest").and.callFake(
            () => "AppName"
        );

        environmentSpy = t.spyOn(coon.core.Environment, "getPathForResource").and.callFake(
            (resource, pckg) => {
                if (pckg !== packageName) {
                    return null;
                }
                return expectedPath(resource);
            }
        );

    });

    t.afterEach(() => {
        packageConfig = {};
        environmentSpy.remove();
        appNameSpy.remove();
        configSpy && configSpy.remove();
        mailFolderHelperSpy.remove();
        conjoon.cn_mail.MailboxService.recentMessageItemKeys.clear();
        if (plugin) {
            plugin.destroy();
            plugin = null;
        }
    });

    // +-------------------------------------------
    // | Tests
    // +-------------------------------------------

    t.it("constructor()", t => {

        t.isInstanceOf(plugin,  "coon.core.app.plugin.ControllerPlugin");
        t.expect(plugin.interval).toBe(120000);

        plugin = create({interval: 1000});
        t.expect(plugin.interval).toBe(1000);
    });


    t.it("getConfig()", t => {

        const spy = t.spyOn(applicationMock, "getPackageConfig");

        let res = plugin.getConfig();
        t.expect(res).toBe(packageConfig);
        t.expect(spy.calls.mostRecent().args[0]).toBe(controllerMock);
    });


    t.it("getResource()", t => {

        t.expect(() => plugin.getResource("file")).toThrow();

        let iconFile = {}, soundFile = {};
        plugin.iconFile = iconFile;
        plugin.soundFile = soundFile;
        t.expect(plugin.getResource("iconFile")).toBe(iconFile);
        t.expect(plugin.getResource("soundFile")).toBe(soundFile);
        delete plugin.iconFile;
        delete plugin.soundFile;

        t.expect(plugin.getResource("iconFile")).toBe(null);
        t.expect(plugin.getResource("soundFile")).toBe(null);

        l8.chain("resources.sounds.notifications.newEmail", packageConfig, "snd.wav");
        l8.chain("resources.images.notifications.newEmail", packageConfig, "img.png");

        t.expect(plugin.getResource("soundFile")).toBe(expectedPath("snd.wav"));
        t.expect(plugin.getResource("iconFile")).toBe(expectedPath("img.png"));

    });


    t.it("getNotificationText()", t => {
        const
            accountNodeSpy = t.spyOn(mailFolderHelper, "getAccountNode"),
            len = 6, mailAccountId = "dev";

        const txt = plugin.getNotificationText(
            {
                get: (key) => key === "mailAccountId" ? mailAccountId : null
            },
            len
        );
        t.expect(accountNodeSpy.calls.mostRecent().args[0]).toBe("dev");
        t.expect(txt).toBe(`${accountNode.name} has ${len} new messages`);

        accountNodeSpy.remove();
    });


    t.it("showNotification()", t => {
        window.Notification = NotificationMock;

        const
            focusSpy = t.spyOn(window, "focus").and.callFake(() => {}),
            mailFolder = {toUrl: () => "#url"},
            resourceSpy = t.spyOn(plugin, "getResource").and.returnValue("icon.png"),
            redirectToSpy = t.spyOn(plugin.controller, "redirectTo"),
            messageText = "new messages available";

        NotificationMock.permission = "denied";
        let notification = plugin.showNotification(mailFolder, messageText);
        t.expect(notification).toBe(null);

        NotificationMock.permission = "granted";

        configSpy = t.spyOn(coon.core.ConfigManager, "get").and.callFake(
            (domain, key) => null
        );
        notification = plugin.showNotification(mailFolder, messageText);
        t.expect(notification.title).toBe(`${applicationName} - new email`);

        configSpy = t.spyOn(coon.core.ConfigManager, "get").and.callFake(
            (domain, key) => domain === "AppName" && key === "title" ? "ConfigTitle" : null
        );
        notification = plugin.showNotification(mailFolder, messageText);
        const closeSpy = t.spyOn(notification, "close");
        t.isInstanceOf(notification, NotificationMock);
        t.expect(resourceSpy.calls.mostRecent().args[0]).toBe("iconFile");
        t.expect(notification.title).toBe("ConfigTitle - new email");

        t.expect(notification.cfg).toEqual({
            body: messageText,
            icon: "icon.png"
        });

        t.expect(closeSpy.calls.count()).toBe(0);
        t.expect(focusSpy.calls.count()).toBe(0);

        notification.onclick();
        t.expect(closeSpy.calls.count()).toBe(1);
        t.expect(focusSpy.calls.count()).toBe(1);
        t.expect(redirectToSpy.calls.mostRecent().args[0]).toBe(mailFolder.toUrl());

        [focusSpy, resourceSpy, redirectToSpy, closeSpy].map(spy => spy.remove());
    });


    t.it("playSound()", t => {

        window.Audio = AudioMock;
        let file = null;


        const getResourceSpy = t.spyOn(plugin, "getResource").and.callFake(() => file);

        t.expect(plugin.playSound()).toBe(null);

        file = "alert.wav";

        t.expect(plugin.audio).toBeUndefined();

        const playSpy = t.spyOn(AudioMock.prototype, "play");

        let audio = plugin.playSound();
        t.expect(audio.file).toBe(file);
        t.expect(plugin.audio).toBe(audio);
        t.expect(playSpy.calls.count()).toBe(1);

        plugin.playSound();
        t.expect(getResourceSpy.calls.count()).toBe(2);

        [getResourceSpy, playSpy].map(spy => spy.remove());
    });


    t.it("updateMessageGridWithRecentMessages()", t => {

        let mailFolder = {},
            retMailFolder = null,
            compoundKey = "key",
            found = false;

        const
            record = {
                getCompoundKey: function () {
                    return compoundKey;
                },
                join: function () {

                }
            },
            messageItems = [record];

        const
            getRecordSpy = t.spyOn(livegrid, "getRecordByCompoundKey").and.callFake(() => found),
            addSpy = t.spyOn(livegrid, "add"),
            joinSpy = t.spyOn(record, "join"),
            selectedSpy = t.spyOn(
                inboxViewController, "getSelectedMailFolder"
            ).and.callFake(() => retMailFolder);

        t.expect(plugin.updateMessageGridWithRecentMessages(mailFolder, messageItems)).toBe(false);

        retMailFolder = mailFolder;

        found = true;
        t.expect(plugin.updateMessageGridWithRecentMessages(mailFolder, messageItems)).toBe(true);
        t.expect(getRecordSpy.calls.mostRecent().args[0]).toBe(record.getCompoundKey());
        t.expect(joinSpy.calls.count()).toBe(0);
        t.expect(addSpy.calls.count()).toBe(0);

        found = false;
        messageItems.push(record);
        t.expect(plugin.updateMessageGridWithRecentMessages(mailFolder, messageItems)).toBe(true);
        t.expect(joinSpy.calls.count()).toBe(2);
        t.expect(addSpy.calls.count()).toBe(2);

        [getRecordSpy, addSpy, joinSpy, selectedSpy].map(spy => spy.remove());
    });


    t.it("onMessageGridLoad()", t => {

        const
            mailFolder = {},
            text = "_",
            textSpy = t.spyOn(plugin, "getNotificationText").and.returnValue(text),
            playSpy = t.spyOn(plugin, "playSound").and.callFake(() => {}),
            notificationSpy = t.spyOn(plugin, "showNotification").and.callFake(() => {}),
            mailFolderSpy = t.spyOn(inboxViewController, "getSelectedMailFolder").and.callFake(() => mailFolder),
            compoundKey = {
                toString: function () {
                    return "key";
                }
            },
            record = {
                recent: true,
                get: function (key) {
                    return this[key];
                },
                getCompoundKey: function () {
                    return compoundKey;
                },
                join: function () {

                }
            },
            messageItems = [record];

        conjoon.cn_mail.MailboxService.recentMessageItemKeys.add(record.getCompoundKey().toString());
        t.expect(plugin.onMessageGridLoad(store, messageItems)).toBe(null);

        conjoon.cn_mail.MailboxService.recentMessageItemKeys.clear();

        t.expect(plugin.onMessageGridLoad(store, messageItems)).toBe(true);
        t.expect(conjoon.cn_mail.MailboxService.recentMessageItemKeys.has(
            record.getCompoundKey().toString())
        ).toBe(true);
        t.expect(notificationSpy.calls.mostRecent().args).toEqual(
            [mailFolder, text]
        );
        t.expect(playSpy.calls.count()).toBe(1);

        [textSpy, playSpy, notificationSpy, mailFolderSpy].map(spy => spy.remove());
    });


    t.it("onNewMessagesAvailable()", t => {

        const
            mailFolder = {},
            record = {},
            messageItems = [record],
            text = "_",
            toastSpy = t.spyOn(coon.Toast, "info").and.callFake(() => {}),
            textSpy = t.spyOn(plugin, "getNotificationText").and.callFake(() => text),
            playSpy = t.spyOn(plugin, "playSound").and.callFake(() => {}),
            notificationSpy = t.spyOn(plugin, "showNotification").and.callFake(() => {}),
            updateGridSpy = t.spyOn(plugin, "updateMessageGridWithRecentMessages").and.callFake(() => {});

        t.expect(plugin.onNewMessagesAvailable(mailFolder, [])).toBe(null);
        t.expect(plugin.onNewMessagesAvailable(mailFolder, messageItems)).toBe(true);

        t.expect(textSpy.calls.mostRecent().args).toEqual([mailFolder, 1]);
        t.expect(toastSpy.calls.mostRecent().args[0]).toBe(text);
        t.expect(notificationSpy.calls.mostRecent().args).toEqual([mailFolder, text]);
        t.expect(playSpy.calls.count()).toBe(1);
        t.expect(updateGridSpy.calls.mostRecent().args).toEqual([mailFolder, messageItems]);


        [textSpy, playSpy, notificationSpy, updateGridSpy, toastSpy].map(spy => spy.remove());
    });


    t.it("run()", t => {

        const
            mailboxRunner = {},
            ctrl = Ext.create("conjoon.cn_mail.app.PackageController"),
            // spy must be created after "creating" the controller
            createSpy = t.spyOn(Ext, "create").and.callFake(() => mailboxRunner),
            listenSpy = t.spyOn(ctrl, "listen").and.callFake(() => {}),
            controlSpy = t.spyOn(ctrl, "control").and.callFake(() => {});

        coon.user.Manager.getUser = () => undefined;
        t.expect(plugin.run(controllerMock)).toBe(false);

        coon.user.Manager.getUser = () => ({});
        t.expect(() => plugin.run(controllerMock)).toThrow();


        t.expect(plugin.run(ctrl)).toBe(true);

        t.expect(plugin.controller).toBe(ctrl);
        t.expect(plugin.mailboxRunner).toBe(mailboxRunner);
        t.expect(createSpy.calls.mostRecent().args).toEqual([
            "conjoon.cn_mail.data.mail.MailboxRunner",
            {mailFolderTreeStore: conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance(),
                interval: plugin.interval}
        ]);
        t.expect(plugin.mailboxRunner).toBe(mailboxRunner);

        t.expect(listenSpy.calls.mostRecent().args[0]).toEqual({
            global: {
                "conjoon.cn_mail.event.NewMessagesAvailable": {
                    fn: plugin.onNewMessagesAvailable,
                    scope: plugin
                }
            }
        });

        t.expect(controlSpy.calls.mostRecent().args[0]).toEqual({
            "cn_mail-mailmessagegrid": {
                "cn_mail-mailmessagegridload": {
                    fn: plugin.onMessageGridLoad,
                    scope: plugin
                }
            }
        });

        [createSpy, listenSpy, controlSpy].map(spy => spy.remove());
    });

});
