/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

import TestHelper from "/tests/lib/mail/TestHelper.js";

StartTest(async t => {

    const helper = l8.liquify(TestHelper.get(t, window));
    await helper.setupSimlets().mockUpMailTemplates().andRun((t) => {

        var grid,
            gridConfig,
            prop = function (value, subject) {
                return Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    testProp: value,
                    subject: subject,
                    date: new Date(),
                    previewText: "Random Text"
                });
            };

        t.afterEach(function () {
            if (grid) {
                grid.destroy();
                grid = null;
            }
        });

        t.beforeEach(function () {

            Ext.ux.ajax.SimManager.init({
                delay: 1
            });

            gridConfig = {
                renderTo: document.body
            };
        });


        t.requireOk("conjoon.cn_mail.model.mail.message.MessageItem", () => {
            t.requireOk("conjoon.cn_mail.store.mail.message.MessageItemStore", () => {

                conjoon.dev.cn_mailsim.data.table.MessageTable.ITEM_LENGTH = 1000;

                t.it("Should create and show the grid along with default config checks", t => {
                    grid = Ext.create(
                        "conjoon.cn_mail.view.mail.message.MessageGrid", gridConfig);

                    t.expect(grid.getSelectionModel().toggleOnClick).toBe(false);

                    //
                    // extjs-app-webmail#99
                    //
                    t.expect(grid.getEmptyText()).toBeTruthy();

                    t.expect(grid instanceof Ext.grid.Panel).toBeTruthy();

                    t.expect(grid.tools.refresh).toBeDefined();
                    t.expect(grid.tools.refresh.getItemId()).toBe("cn_mail-mailmessagegrid-refresh");

                    t.expect(grid.alias).toContain("widget.cn_mail-mailmessagegrid");

                    let feature = grid.view.getFeature("cn_mail-mailMessageFeature-messagePreview");
                    t.expect(feature.variableRowHeight).toBe(false);
                    t.isInstanceOf(feature, "coon.comp.grid.feature.RowBodySwitch");
                    t.expect(feature.disabled).toBeFalsy();

                    let lazyLoad = grid.view.getFeature("cn_webmailplug-previewtextlazyload");
                    t.isInstanceOf(lazyLoad, "conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad");

                    t.isCalled("getHumanReadableDate", coon.core.util.Date);
                    t.isCalled("getPreviewTextRow", feature);
                    feature.getAdditionalData(null, null, {get: function () {}}, null);

                    feature = grid.view.getFeature("cn_mail-mailMessageFeature-livegrid");
                    t.isInstanceOf(feature, "conjoon.cn_mail.view.mail.message.grid.feature.Livegrid");

                    feature = grid.view.getFeature("cn_mail-mailMessageFeature-rowFlyMenu");
                    t.isInstanceOf(feature, "coon.comp.grid.feature.RowFlyMenu");
                    let MARKUNREAD = false;
                    for (let i in feature.idToActionMap) {
                        if (feature.idToActionMap[i] === "markunread") {
                            MARKUNREAD = true;
                        }
                    }
                    t.expect(MARKUNREAD).toBe(true);
                });


                t.it("enableRowPreview()", t => {
                    grid = Ext.create(
                        "conjoon.cn_mail.view.mail.message.MessageGrid", gridConfig);
                    let feature    = grid.view.getFeature("cn_mail-mailMessageFeature-messagePreview"),
                        rowFlyMenu = grid.view.getFeature("cn_mail-mailMessageFeature-rowFlyMenu");

                    t.expect(feature.disabled).toBe(false);
                    grid.enableRowPreview(false);
                    t.expect(feature.disabled).toBe(true);
                    t.expect(rowFlyMenu.disabled).toBe(true);
                    grid.enableRowPreview();
                    t.expect(feature.disabled).toBe(false);
                    t.expect(rowFlyMenu.disabled).toBe(false);
                    grid.enableRowPreview(false);
                    t.expect(feature.disabled).toBe(true);
                    t.expect(rowFlyMenu.disabled).toBe(true);
                    grid.enableRowPreview(true);
                    t.expect(feature.disabled).toBe(false);
                    t.expect(rowFlyMenu.disabled).toBe(false);
                });


                t.it("enableRowPreview while store loads", t => {

                    t.diag("upping SimManager delay to t.parent.TIMEOUT + 1000");

                    Ext.ux.ajax.SimManager.init({
                        delay: t.parent.TIMEOUT + 1000
                    });

                    var exc;

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        store: {
                            type: "cn_mail-mailmessageitemstore",
                            autoLoad: false,
                            sorters: [{
                                property: "testProp",
                                direction: "DESC"
                            }]
                        },
                        renderTo: document.body
                    });

                    grid.getStore().filter([
                        {property: "mailAccountId", value: "dev_sys_conjoon_org"},
                        {property: "mailFolderId", value: "INBOX"}
                    ]);

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        try {
                            grid.enableRowPreview(true);
                        } catch (e) {
                            exc = e;
                        }

                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("cannot call enablerowpreview");
                    });

                });


                t.it("bindStore with exception", t => {
                    var exc;

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    try {
                        grid.setStore(Ext.create("Ext.data.Store"));
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg.toLowerCase()).toContain("store must be an instance of");
                });


                t.it("bindStore ext-empty-store", t => {
                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    grid.setStore(Ext.data.StoreManager.lookup("ext-empty-store"));
                    t.expect(grid.getStore()).toBe(Ext.data.StoreManager.lookup("ext-empty-store"));

                    t.isCalledNTimes("onMessageItemStoreBeforeLoad", grid, 0);
                    t.isCalledNTimes("onMessageItemStoreLoad", grid, 0);
                    grid.getStore().load();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                    });
                });


                t.it("bindStore with proper store config and event behavior", t => {

                    t.diag("downing SimManager delay to 1");

                    let ULOAD = 0, UBEFORELOAD = 0, UPREFETCH = 0, store;

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore", {
                        autoLoad: false
                    });

                    grid.setStore(store);

                    grid.on("cn_mail-mailmessagegridbeforeload", function () {UBEFORELOAD++;});
                    grid.on("cn_mail-mailmessagegridload",       function () {ULOAD++;});
                    grid.on("cn_mail-mailmessagegridprefetch",   function () {UPREFETCH++;});

                    t.expect(ULOAD).toBe(0);
                    t.expect(UBEFORELOAD).toBe(0);
                    t.expect(UPREFETCH).toBe(0);

                    store.filter([
                        {property: "mailAccountId", value: "dev_sys_conjoon_org"},
                        {property: "mailFolderId", value: "INBOX"}
                    ]);

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(ULOAD).toBe(1);
                        t.expect(UBEFORELOAD).toBe(1);
                        t.expect(UPREFETCH).toBeGreaterThan(1);

                        grid.unbindStore(store);

                        store.reload();

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(ULOAD).toBe(1);
                            t.expect(UBEFORELOAD).toBe(1);
                            t.expect(UPREFETCH).toBeGreaterThan(1);

                        });

                    });
                });


                t.it("selection still available after pageremove", t => {
                    let store;

                    t.expect(conjoon.dev.cn_mailsim.data.table.MessageTable.ITEM_LENGTH).toBeGreaterThan(999);

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore", {
                        autoLoad: false,
                        pageSize: 25
                    });

                    grid.setStore(store);

                    store.filter([
                        {property: "mailAccountId", value: "dev_sys_conjoon_org"},
                        {property: "mailFolderId", value: "INBOX"}
                    ]);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let rec = store.getAt(0);

                        grid.getSelectionModel().select(rec);

                        grid.view.getScrollable().scrollTo(0, 100000);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            store.getData().removeAtKey(1);
                            t.expect(store.getData().map[1]).toBeUndefined();

                            t.expect(grid.getSelection()[0]).toBe(rec);
                        });

                    });
                });


                t.it("call to relayEvents properly registered", t => {

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    let rowFlyMenu = grid.view.getFeature("cn_mail-mailMessageFeature-rowFlyMenu"),
                        CALLED = 0,
                        SHOWN  = 0;

                    let fid = null;

                    for (let i in rowFlyMenu.idToActionMap) {
                        if (rowFlyMenu.idToActionMap[i] === "markunread") {
                            fid = i;
                            break;
                        }
                    }

                    t.expect(fid).toBeTruthy();

                    t.expect(CALLED).toBe(0);

                    grid.on("cn_comp-rowflymenu-beforemenushow", function (feature, item, action, record) {
                        SHOWN++;
                    });

                    grid.on("cn_comp-rowflymenu-itemclick", function (feature, item, action, record) {
                        CALLED++;
                    });

                    t.expect(SHOWN).toBe(0);
                    rowFlyMenu.fireEvent("beforemenushow");
                    t.expect(SHOWN).toBe(1);

                    rowFlyMenu.onMenuClick(
                        {stopEvent: Ext.emptyFn},
                        {id: fid}
                    );

                    t.expect(CALLED).toBe(1);
                });


                t.it("updateRowFlyMenu()", t => {

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    let rowFlyMenu = grid.view.getFeature("cn_mail-mailMessageFeature-rowFlyMenu"),
                        rec        = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                            mailFolderId: 2,
                            seen: true,
                            flagged: true
                        }),
                        getReadItem = function () {
                            return rowFlyMenu.menu.query("div[id=cn_mail-mailMessageFeature-rowFlyMenu-markUnread]", true)[0];
                        },
                        getFlagItem = function () {
                            return rowFlyMenu.menu.query("div[id=cn_mail-mailMessageFeature-rowFlyMenu-flag]", true)[0];
                        };

                    grid.updateRowFlyMenu(rec);

                    t.expect(getReadItem().getAttribute("data-qtip").toLowerCase()).toBe("mark as unread");
                    t.expect(getFlagItem().getAttribute("data-qtip").toLowerCase()).toBe("remove flag");

                    rec.set("seen", false);
                    rec.set("flagged", false);
                    grid.updateRowFlyMenu(rec);

                    t.expect(getReadItem().getAttribute("data-qtip").toLowerCase()).toBe("mark as read");
                    t.expect(getFlagItem().getAttribute("data-qtip").toLowerCase()).toBe("add flag");


                });


                t.it("getRowClass()", t => {
                    grid = Ext.create(
                        "conjoon.cn_mail.view.mail.message.MessageGrid", gridConfig);

                    let messageItem = prop();

                    messageItem.set("seen", true);
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("boldFont");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("recent");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-deleted");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-moved");

                    messageItem.set("recent", true);
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("boldFont");
                    t.expect(grid.view.getRowClass(messageItem)).toContain("recent");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-deleted");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-moved");

                    messageItem.set("seen", false);
                    t.expect(grid.view.getRowClass(messageItem)).toContain("boldFont");
                    t.expect(grid.view.getRowClass(messageItem)).toContain("recent");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-deleted");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-moved");

                    messageItem.set("recent", false);

                    messageItem.set("cn_deleted", true);
                    t.expect(grid.view.getRowClass(messageItem)).toContain("boldFont");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("recent");
                    t.expect(grid.view.getRowClass(messageItem)).toContain("cn-deleted");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-moved");

                    messageItem.set("cn_moved", true);
                    t.expect(grid.view.getRowClass(messageItem)).toContain("boldFont");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("recent");
                    t.expect(grid.view.getRowClass(messageItem)).toContain("cn-deleted");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-moved");

                    messageItem.set("cn_deleted", false);

                    messageItem.set("cn_moved", true);
                    t.expect(grid.view.getRowClass(messageItem)).toContain("boldFont");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("recent");
                    t.expect(grid.view.getRowClass(messageItem)).not.toContain("cn-deleted");
                    t.expect(grid.view.getRowClass(messageItem)).toContain("cn-moved");


                });


                t.it("draft rendering", t => {
                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    let store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore", {
                        autoLoad: false
                    });

                    grid.setStore(store);

                    store.filter([
                        {property: "mailAccountId", value: "dev_sys_conjoon_org"},
                        {property: "mailFolderId", value: "INBOX"}
                    ]);

                    t.waitForMs(t.parent.TIMEOUT, function () {

                        let messageItem, index, len;
                        for (index = 0, len = 20; index < len; index++) {
                            messageItem = grid.getStore().getAt(index);
                            if (messageItem.get("draft")) {
                                break;
                            }
                        }

                        messageItem.set("draft", false);
                        messageItem.commit();

                        let subjectCont = Ext.dom.Query.select("div[class*=subject]", grid.el.dom)[index];
                        t.expect(subjectCont.firstChild.tagName).toBeUndefined();


                        messageItem.set("draft", true);
                        messageItem.commit();

                        subjectCont = Ext.dom.Query.select("div[class*=subject]", grid.el.dom)[index];
                        t.expect(subjectCont.firstChild.tagName.toLowerCase()).toBe("span");
                        t.expect(subjectCont.firstChild.className.toLowerCase()).toBe("draft");


                    });

                });


                t.it("stringifyTo", t => {
                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    let store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore", {
                        autoLoad: false
                    });

                    grid.setStore(store);

                    store.filter([
                        {property: "mailAccountId", value: "dev_sys_conjoon_org"},
                        {property: "mailFolderId", value: "INBOX"}
                    ]);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        t.expect(grid.stringifyTo([{
                            address: "foobar",
                            name: "bar"
                        }, {
                            address: "barfoo",
                            name: "foo"
                        }])).toBe("bar, foo");
                    });

                });


                t.it("extjs-app-webmail#39 - setRepresentedFolderType()", t => {

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    t.expect(grid.representedFolderType).toBeFalsy();

                    grid.setRepresentedFolderType("foo");

                    t.expect(grid.representedFolderType).toBe("foo");
                });


                t.it("extjs-app-webmail#39 - renderDraftDisplayAddress()", t => {

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        renderTo: document.body
                    });

                    let isDraft = false,
                        from = "",
                        view = grid.getView(),
                        feature = view.getFeature("cn_mail-mailMessageFeature-messagePreview"),
                        rec = {
                            get: function (key) {

                                switch (key) {
                                case "draft":
                                    return isDraft;
                                case "from":
                                    return from;
                                case "to":
                                    return [{name: "a"}, {name: "b"}];
                                }
                            }
                        };

                    feature.disable();
                    grid.representedFolderType = "";

                    t.expect(grid.renderDraftDisplayAddress(null, {}, rec, null, null, null, view)).toBe("");
                    from = {name: "foo"};
                    t.expect(grid.renderDraftDisplayAddress(null, {}, rec, null, null, null, view)).toBe("foo");

                    feature.enable();

                    from = "";
                    t.expect(grid.renderDraftDisplayAddress(null, {}, rec, null, null, null, view)).toBe("");
                    from = {name: "foo"};
                    t.expect(grid.renderDraftDisplayAddress(null, {}, rec, null, null, null, view)).toBe("foo");

                    isDraft = true;
                    t.expect(grid.renderDraftDisplayAddress(null, {}, rec, null, null, null, view)).toBe("a, b");

                    isDraft = false;
                    grid.representedFolderType = "SENT";
                    t.expect(grid.renderDraftDisplayAddress(null, {}, rec, null, null, null, view)).toBe("a, b");

                    isDraft = false;
                    grid.representedFolderType = "";
                    t.expect(grid.renderDraftDisplayAddress(null, {}, rec, null, null, null, view)).toBe("foo");
                });


                t.it("enable/disable rowPreview removes prefetch-requests and reloads store", t => {

                    grid = Ext.create("conjoon.cn_mail.view.mail.message.MessageGrid", {
                        width: 400,
                        height: 400,
                        store: {
                            pageSize: 25,
                            type: "cn_mail-mailmessageitemstore",
                            autoLoad: false,
                            sorters: [{
                                property: "testProp",
                                direction: "DESC"
                            }]
                        },
                        renderTo: document.body
                    });

                    grid.getStore().filter([
                        {property: "mailAccountId", value: "dev_sys_conjoon_org"},
                        {property: "mailFolderId", value: "INBOX"}
                    ]);

                    let PAGEABORT = 0;

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        grid.getStore().pageRequests = [{
                            getOperation: function () {
                                return {
                                    abort: function () {
                                        PAGEABORT++;
                                    }
                                };
                            }
                        }];

                        t.diag("upping SimManager delay");
                        Ext.ux.ajax.SimManager.init({
                            delay: t.parent.TIMEOUT + 500
                        });

                        t.expect(PAGEABORT).toBe(0);
                        t.expect(grid.getStore().isLoading()).toBe(false);
                        grid.enableRowPreview(false);
                        t.expect(grid.getStore().isLoading()).toBe(true);
                        t.expect(PAGEABORT).toBe(1);

                    });

                });


            });});});});
