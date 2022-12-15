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

import TestHelper from "/tests/lib/mail/TestHelper.js";

StartTest(async t => {

    const helper =  l8.liquify(TestHelper.get(t, window));
    await helper.registerIoC().setupSimlets().mockUpMailTemplates().mockUpServices("coon.core.service.UserImageService").andRun((t) => {

        t.requireOk(
            "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore", () => {

                let viewConfig;

                const getChildAt = function (panel, rootId, index, shouldBe, t) {

                        let root = panel.down("cn_mail-mailfoldertree").getStore().getRoot().findChild("id", rootId),
                            c    = root.getChildAt(index);

                        if (shouldBe && t) {
                            t.expect(c.get("id")).toBe(shouldBe);
                        }

                        return c;
                    },
                    selectMailFolder = function (panel, storeAt, shouldBeId, t) {

                        let folder = storeAt instanceof Ext.data.TreeModel
                            ? storeAt
                            : panel.down("cn_mail-mailfoldertree").getStore().getAt(storeAt);

                        let p = folder.parentNode;

                        while (p) {
                            p.expand();
                            p = p.parentNode;
                        }

                        panel.down("cn_mail-mailfoldertree").getSelectionModel()
                            .select(folder);

                        if (shouldBeId && t) {
                            t.expect(folder.get("id")).toBe(shouldBeId);
                        }

                        return folder;

                    },
                    discardView = t => {

                        t.waitForMs(1, function () {
                            if (view) {

                                view.destroy();
                                view = null;

                                t.waitForMs(1, function () {});
                            }
                        });
                    };

                let view;

                t.afterEach(() => {
                    Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
                    Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");

                });


                t.beforeEach(function () {

                    Ext.ux.ajax.SimManager.init({
                        delay: 1
                    });


                    viewConfig = {
                        viewModel: {
                            type: "cn_mail-mailinboxviewmodel",
                            stores: {
                                "cn_mail_mailfoldertreestore": {
                                    type: "cn_mail-mailfoldertreestore",
                                    autoLoad: true
                                }
                            }
                        },
                        width: 800,
                        height: 600,
                        renderTo: document.body
                    };

                });


                conjoon.dev.cn_mailsim.data.table.MessageTable.ITEM_LENGTH = 1000;


                t.it("Should create and show the inbox view along with default config checks", t => {
                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    t.expect(view instanceof Ext.Panel).toBeTruthy();

                    t.expect(view.alias).toContain("widget.cn_mail-mailinboxview");

                    t.expect(view.closable).toBe(false);

                    t.expect(
                        view.getViewModel() instanceof conjoon.cn_mail.view.mail.inbox.InboxViewModel
                    ).toBe(true);

                    t.expect(
                        view.getController() instanceof conjoon.cn_mail.view.mail.inbox.InboxViewController
                    ).toBe(true);

                    t.expect(view.getSession()).toBeFalsy();

                    t.expect(view.down("cn_mail-mailfoldertree") instanceof conjoon.cn_mail.view.mail.folder.MailFolderTree).toBe(true);
                    t.expect(view.down("#cn_mail-mailmessagegridcontainer") instanceof Ext.Container).toBe(true);
                    t.expect(view.down("cn_mail-mailmessagegrid") instanceof conjoon.cn_mail.view.mail.message.MessageGrid).toBe(true);
                    t.expect(view.down("cn_mail-mailmessagereadermessageview") instanceof conjoon.cn_mail.view.mail.message.reader.MessageView).toBe(true);

                    discardView(t);

                });

                t.it("Should select folder and messageItem properly create and show the inbox view along with default config checks", t => {


                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    var grid           = view.down("cn_mail-mailmessagegrid"),
                        tree           = view.down("cn_mail-mailfoldertree"),
                        gridMessageBox = view.down("#msgIndicatorBox"),
                        messageView    = view.down("cn_mail-mailmessagereadermessageview");

                    t.expect(tree.getStore().getRange().length).toBe(0);
                    t.expect(grid.getStore().getRange().length).toBe(0);
                    t.expect(messageView.getViewModel().get("messageItem")).toBeFalsy();

                    t.waitForMs(t.parent.TIMEOUT, function (){
                        t.expect(messageView.isVisible()).toBe(false);
                        t.expect(gridMessageBox.isVisible()).toBe(true);
                        t.expect(grid.isVisible()).toBe(false);

                        t.waitForMs(t.parent.TIMEOUT, function (){
                            var mailFolder = getChildAt(view, "dev_sys_conjoon_org", 0, "INBOX", t),
                                unreadCount =  mailFolder.get("unreadCount");

                            t.expect(unreadCount).not.toBe(0);
                            tree.getSelectionModel().select(mailFolder);

                            t.expect(grid.representedFolderType).toBeFalsy();

                            t.waitForMs(t.parent.TIMEOUT, function (){

                                t.expect(grid.representedFolderType).toBe("INBOX");

                                t.expect(messageView.isVisible()).toBe(true);
                                t.expect(gridMessageBox.isVisible()).toBe(false);
                                t.expect(grid.isVisible()).toBe(true);

                                var messageItem = grid.getStore().getAt(0);
                                t.expect(grid.getStore().getTotalCount()).not.toBe(0);
                                messageItem.set("seen", false);
                                t.expect(messageItem.get("seen")).toBe(false);
                                grid.getSelectionModel().select(messageItem);

                                t.waitForMs(t.parent.TIMEOUT, function (){
                                    t.expect(messageView.getViewModel().get("messageItem")).toBe(messageItem);

                                    t.expect(mailFolder.get("unreadCount")).toBe(unreadCount - 1);

                                    discardView(t);
                                });

                            });
                        });
                    });


                });


                t.it("toggleReadingPane()", t => {
                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    var messageView = view.down("cn_mail-mailmessagereadermessageview"),
                        bodyLayout  = view.down("#cn_mail-mailInboxViewPanelBody").getLayout(),
                        tree        = view.down("cn_mail-mailfoldertree");


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        var mailFolder = getChildAt(view, "dev_sys_conjoon_org", 0, "INBOX", t);

                        tree.getSelectionModel().select(mailFolder);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(messageView.isVisible()).toBe(true);
                            t.expect(bodyLayout.getVertical()).toBe(false);

                            view.toggleReadingPane("bottom");
                            view.getViewModel().notify();
                            t.expect(messageView.isVisible()).toBe(true);
                            t.expect(bodyLayout.getVertical()).toBe(true);

                            view.toggleReadingPane("right");
                            view.getViewModel().notify();
                            t.expect(messageView.isVisible()).toBe(true);
                            t.expect(bodyLayout.getVertical()).toBe(false);

                            view.toggleReadingPane();
                            view.getViewModel().notify();
                            t.expect(messageView.isVisible()).toBe(false);

                            view.toggleReadingPane("bottom");
                            view.getViewModel().notify();
                            t.expect(messageView.isVisible()).toBe(true);
                            t.expect(bodyLayout.getVertical()).toBe(true);


                            discardView(t);

                        });
                    });

                });


                t.it("Selection after switching between folders in grid is still available", t => {


                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    var grid           = view.down("cn_mail-mailmessagegrid"),
                        tree           = view.down("cn_mail-mailfoldertree");


                    t.waitForMs(t.parent.TIMEOUT, function (){

                        var mailFolder1 = getChildAt(view, "dev_sys_conjoon_org", 0, "INBOX", t),
                            mailFolder2 = getChildAt(view, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t);

                        tree.getSelectionModel().select(mailFolder1);

                        t.waitForMs(t.parent.TIMEOUT, function (){

                            var messageItem = grid.getStore().getAt(0);

                            grid.getSelectionModel().select(messageItem);

                            t.expect(grid.getSelection()[0]).toBe(messageItem);

                            grid.view.getScrollable().scrollTo(0, 100000);

                            t.waitForMs(t.parent.TIMEOUT, () => {
                                // need at least 1000 items in the mock message Tabe
                                t.expect(conjoon.dev.cn_mailsim.data.table.MessageTable.ITEM_LENGTH).toBeGreaterThan(999);
                                grid.getStore().getData().removeAtKey(1);
                                t.expect(grid.getStore().getData().map[1]).toBeUndefined();

                                t.expect(grid.getSelection()[0]).toBe(messageItem);
                                tree.getSelectionModel().select(mailFolder2);

                                t.waitForMs(t.parent.TIMEOUT, function (){

                                    t.expect(grid.getSelection()[0]).toBe(messageItem);

                                    var messageItem2 = grid.getStore().getAt(0);

                                    grid.getSelectionModel().select(messageItem2);

                                    t.expect(grid.getSelection()[0]).toBe(messageItem2);

                                    tree.getSelectionModel().select(mailFolder2);

                                    t.waitForMs(t.parent.TIMEOUT, function (){
                                        t.expect(grid.getSelection()[0]).toBe(messageItem2);

                                        discardView(t);
                                    });


                                });
                            });

                        });
                    });


                });


                t.it("should trigger onRowFlyMenuItemClick()", t => {

                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    let grid = view.down("cn_mail-mailmessagegrid");

                    t.isCalledNTimes("onRowFlyMenuItemClick", view.getController(), 1);
                    grid.fireEvent("cn_comp-rowflymenu-itemclick");

                    discardView(t);

                });


                t.it("should trigger onRowFlyMenuBeforeShow()", t => {

                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    let grid = view.down("cn_mail-mailmessagegrid");

                    t.isCalledNTimes("onRowFlyMenuBeforeShow", view.getController(), 1);
                    grid.fireEvent("cn_comp-rowflymenu-beforemenushow", null, 1, {get: Ext.emptyFn});

                    discardView(t);
                });


                t.it("reply all / edit draft / delete draft button is there", t => {


                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    var grid           = view.down("cn_mail-mailmessagegrid"),
                        tree           = view.down("cn_mail-mailfoldertree"),
                        messageView    = view.down("cn_mail-mailmessagereadermessageview");

                    t.expect(messageView.down("#btn-editdraft")).toBeTruthy();
                    t.expect(messageView.down("#btn-deletedraft")).toBeTruthy();
                    t.expect(messageView.down("#btn-replyall")).toBeTruthy();
                    t.expect(messageView.down("#btn-replyall").getMenu()).toBeTruthy();

                    t.expect(messageView.down("#btn-replyall").getMenu().down("#btn-forward")).toBeTruthy();
                    t.expect(messageView.down("#btn-replyall").getMenu().down("#btn-reply")).toBeTruthy();


                    t.waitForMs(t.parent.TIMEOUT, function (){

                        t.waitForMs(t.parent.TIMEOUT, function (){

                            var mailFolder = getChildAt(view, "dev_sys_conjoon_org", 0, "INBOX", t);
                            tree.getSelectionModel().select(mailFolder);

                            t.waitForMs(t.parent.TIMEOUT, function (){

                                var messageItem = grid.getStore().getAt(0);
                                messageItem.set("draft", false);
                                grid.getSelectionModel().select(messageItem);

                                t.waitForMs(t.parent.TIMEOUT, function (){

                                    t.expect(messageView.down("#btn-replyall").isVisible()).toBe(true);
                                    t.expect(messageView.down("#btn-editdraft").isVisible()).toBe(false);
                                    t.expect(messageView.down("#btn-deletedraft").isVisible()).toBe(false);

                                    messageItem = grid.getStore().getAt(1);
                                    messageItem.set("draft", true);
                                    grid.getSelectionModel().select(messageItem);

                                    t.waitForMs(t.parent.TIMEOUT, function (){
                                        t.expect(messageView.down("#btn-replyall").isVisible()).toBe(false);
                                        t.expect(messageView.down("#btn-editdraft").isVisible()).toBe(true);
                                        t.expect(messageView.down("#btn-deletedraft").isVisible()).toBe(true);

                                        discardView(t);
                                    });

                                });

                            });
                        });
                    });

                });


                t.it("showMessageDeleteConfirmDialog()", t => {

                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    let obj = { CALLED: 0},
                        fn = function () {
                            this.CALLED++;
                        };

                    t.expect(obj.CALLED).toBe(0);
                    let mask = view.showMessageDeleteConfirmDialog(null, fn, obj);
                    t.isInstanceOf(mask, "coon.comp.component.MessageMask");
                    t.expect(mask).toBe(view.deleteMask);
                    t.expect(view.showMessageDeleteConfirmDialog(null, fn, obj)).toBe(mask);

                    let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);
                    t.click(yesButton[0], function () {
                        t.expect(obj.CALLED).toBe(1);
                        t.expect(view.deleteMask).toBe(null);

                        discardView(t);
                    });

                });


                t.it("updateViewForCreatedDraft() - delegates to controller", function (t){

                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    t.isCalledOnce("updateViewForCreatedDraft", view.getController());

                    view.updateViewForCreatedDraft(Ext.create(
                        "conjoon.cn_mail.model.mail.message.MessageDraft", {id: "foo"}
                    ));

                    discardView(t);
                });


                t.it("confirmDialogMask mixin", function (t){
                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    t.expect(view.mixins["conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog"]).toBeTruthy();
                    t.expect(view.canCloseAfterDelete).toBe(false);

                    discardView(t);
                });


                t.it("extjs-app-webmail#83 - MailAccountView should be shown when folder representing MailAccount is selected", t => {

                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    let vm = view.getViewModel();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let mailAccountView = view.down("cn_mail-mailaccountview"),
                            accountNode1    = function () {selectMailFolder(view, 0, "dev_sys_conjoon_org", t);vm.notify();},
                            accountNode2    = function () {selectMailFolder(view, 6, "mail_account", t);vm.notify();},
                            draftNode       = function () {selectMailFolder(view, getChildAt(view, "dev_sys_conjoon_org", 3, "INBOX.Drafts"));vm.notify();};

                        t.expect(mailAccountView.isVisible()).toBe(false);

                        accountNode1();

                        t.expect(mailAccountView.isVisible()).toBe(true);


                        draftNode();

                        t.expect(mailAccountView.isVisible()).toBe(false);

                        accountNode2();

                        t.expect(mailAccountView.isVisible()).toBe(true);

                        discardView(t);
                    });

                });


                t.it("extjs-app-webmail#83 - showMailAccountIsBeingEditedNotice()", t => {


                    view = Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    let iconCls        = view.getIconCls(),
                        mailFolderTree = view.down("cn_mail-mailfoldertree"),
                        REJECTED = 0;

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        view.down("cn_mail-mailaccountview").rejectPendingChanges = function () {
                            REJECTED++;
                        };

                        let mailFolder1 = selectMailFolder(view, 0, "dev_sys_conjoon_org"),
                            mailFolder2 =  selectMailFolder(view, 1, "mail_account");

                        let mask = view.showMailAccountIsBeingEditedNotice(mailFolder1);

                        t.isInstanceOf(mask, "coon.comp.component.MessageMask");
                        t.expect(mask.isVisible()).toBe(true);

                        let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom),
                            noButton  = Ext.dom.Query.select("span[data-ref=noButton]", view.el.dom);

                        t.expect(yesButton.length).toBe(1);
                        t.expect(yesButton[0].parentNode.style.display).not.toBe("none");
                        t.expect(noButton.length).toBe(1);
                        t.expect(noButton[0].parentNode.style.display).not.toBe("none");

                        t.expect(view.getIconCls()).not.toBe(iconCls);

                        t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(mailFolder2);
                        t.click(noButton[0], function () {
                            t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(mailFolder2);

                            view.showMailAccountIsBeingEditedNotice(mailFolder1);
                            t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(1);

                            yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);

                            t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(mailFolder2);
                            t.click(yesButton[0], function () {
                                t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(mailFolder1);

                                t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);

                                t.expect(view.getIconCls()).toBe(iconCls);

                                t.expect(REJECTED).toBe(1);

                                discardView(t);
                            });

                        });

                    });

                });


                t.it("extjs-app-webmail#98", t => {

                    view = Ext.create(
                        "conjoon.cn_mail.view.mail.inbox.InboxView", viewConfig);

                    var messageView = view.down("cn_mail-mailmessagereadermessageview"),
                        tree        = view.down("cn_mail-mailfoldertree");


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        var accountFolder = selectMailFolder(view, "0", "dev_sys_conjoon_org", t);
                        var inboxFolder   = getChildAt(view, "dev_sys_conjoon_org", 0, "INBOX", t);

                        tree.getSelectionModel().select(inboxFolder);


                        t.waitForMs(t.parent.TIMEOUT, () => {

                            view.toggleReadingPane();
                            view.getViewModel().notify();
                            t.expect(messageView.isVisible()).toBe(false);

                            tree.getSelectionModel().select(accountFolder);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                tree.getSelectionModel().select(inboxFolder);

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    t.expect(messageView.isVisible()).toBe(false);

                                    discardView(t);

                                });
                            });
                        });
                    });
                });


            });});});
