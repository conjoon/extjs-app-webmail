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

    const helper =  l8.liquify(TestHelper.get(t, window));
    await helper.setupSimlets().mockUpMailTemplates().andRun((t) => {


        var panel;

        const
            createPanelWithViewModel = function () {

                return Ext.create("conjoon.cn_mail.view.mail.inbox.InboxView", {

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

                });

            },
            createMessageDraftByFolderId = function (index, mailFolderId) {

                index = index === undefined ? 1 : index;

                let mi = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(index);

                if (mailFolderId) {
                    let i = index >= 0 ? index : 0, upper = 1000;

                    for (; i <= upper; i++) {
                        mi = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(i);
                        if (mi.mailFolderId === mailFolderId) {
                            break;
                        }
                    }

                }

                return Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                    localId: [mi.mailAccountId, mi.mailFolderId, mi.id].join("-"),
                    id: mi.id,
                    mailAccountId: mi.mailAccountId,
                    mailFolderId: mi.mailFolderId
                });
            },
            selectMailFolder = function (panel, storeAt) {

                let folder = panel.down("cn_mail-mailfoldertree").getStore().getRoot().findChild("id", "dev_sys_conjoon_org");

                folder = folder.childNodes[storeAt - 1];

                let p = folder.parentNode;

                while(p) {
                    p.expand();
                    p = p.parentNode;
                }

                panel.down("cn_mail-mailfoldertree").getSelectionModel()
                    .select(folder);

                return folder;

            }, deselectMessage = function (panel, message) {
                panel.down("cn_mail-mailmessagegrid").getSelectionModel()
                    .deselect(message);

            },

            selectMessage = function (panel, storeAt) {

                let message = panel.down("cn_mail-mailmessagegrid").getStore().getAt(storeAt);

                panel.down("cn_mail-mailmessagegrid").getSelectionModel()
                    .select(message);

                return message;
            }, getMessageGridStore = function (panel) {

                return panel.down("cn_mail-mailmessagegrid").getStore();

            }, getSelectedMessage = function (panel) {

                return panel.down("cn_mail-mailmessagegrid").getSelection()
                    ? panel.down("cn_mail-mailmessagegrid").getSelection()[0]
                    : null;

            };

        t.afterEach(function () {
            Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
            Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");
            if (panel) {
                panel.destroy();
            }
            panel = null;
        });

        t.requireOk("conjoon.cn_mail.model.mail.message.MessageBody", () => {

            Ext.ux.ajax.SimManager.init({
                delay: 1
            });


            t.it("Should create the ViewController", t => {

                var _testMailFolderId = {},
                    viewController    = Ext.create(
                        "conjoon.cn_mail.view.mail.inbox.InboxViewController"
                    );

                t.expect(viewController.alias).toContain("controller.cn_mail-mailinboxviewcontroller");
                t.expect(viewController instanceof Ext.app.ViewController).toBe(true);

                panel = Ext.create("Ext.Panel", {
                    controller: viewController,

                    viewModel: {
                        updateUnreadMessageCount: function (mailAccountId, mailFolderId, unreadCount) {
                            if (!_testMailFolderId[mailAccountId]) {
                                _testMailFolderId[mailAccountId] = {};
                            }
                            _testMailFolderId[mailAccountId][mailFolderId] = unreadCount;
                        }
                    },

                    width: 800,
                    height: 600,

                    items: [{
                        xclass: "conjoon.cn_mail.view.mail.message.reader.MessageView"
                    }]
                });

                panel.down("cn_mail-mailmessagereadermessageview").fireEvent(
                    "cn_mail-mailmessageitemread", [
                        Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                            mailAccountId: "dev_sys_conjoon_org",
                            mailFolderId: 1,
                            seen: true
                        }),
                        Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                            mailAccountId: "dev_sys_conjoon_org",
                            mailFolderId: 1,
                            seen: false
                        }),
                        Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                            mailAccountId: "dev_sys_conjoon_org",
                            mailFolderId: 2,
                            seen: false
                        }),
                        Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                            mailAccountId: "dev_sys_conjoon_org",
                            mailFolderId: 2,
                            seen: true
                        }),
                        Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                            mailAccountId: "dev_sys_conjoon_org",
                            mailFolderId: 2,
                            seen: true
                        })
                    ]);


                t.expect(_testMailFolderId).toEqual({
                    "dev_sys_conjoon_org": {
                        2: -1
                    }
                });


            });


            t.it("onMailFolderTreeSelect", t => {

                const viewController = Ext.create(
                        "conjoon.cn_mail.view.mail.inbox.InboxViewController"
                    ),
                    node = Ext.create("conjoon.cn_mail.model.mail.folder.MailFolder", {
                        id: 2
                    });

                t.isCalledNTimes("redirectTo", viewController, 1);

                viewController.onMailFolderTreeSelect(null, node);
            });


            t.it("onMessageItemRead()", t => {

                let CALLED = 0;

                const viewController = Ext.create(
                    "conjoon.cn_mail.view.mail.inbox.InboxViewController",
                    {
                        view: {
                            getViewModel: function () {
                                return {
                                    updateUnreadMessageCount: function () {
                                        CALLED++;
                                    }
                                };
                            }
                        }});

                t.expect(CALLED).toBe(0);
                viewController.onMessageItemRead(Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    mailFolderId: 2,
                    seen: false
                }));
                t.expect(CALLED).toBe(1);

                CALLED = 0;

                t.expect(CALLED).toBe(0);
                viewController.onMessageItemRead([Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    mailFolderId: 2,
                    seen: false
                }), Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    mailFolderId: 3,
                    seen: true
                })]);
                t.expect(CALLED).toBe(2);
            });


            t.it("onRowFlyMenuItemClick()", t => {

                const viewController = Ext.create(
                    "conjoon.cn_mail.view.mail.inbox.InboxViewController");

                let rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                        mailFolderId: "INBOX",
                        mailAccountId: "dev_sys_conjoon_org",
                        seen: true,
                        flagged: false
                    }),
                    CALLED = 0;

                viewController.onMessageItemRead = function () {
                    CALLED++;
                };

                t.expect(rec.get("seen")).toBe(true);
                t.expect(rec.get("flagged")).toBe(false);
                t.expect(CALLED).toBe(0);

                viewController.onRowFlyMenuItemClick(null, null, "flag", rec);
                t.expect(rec.get("flagged")).toBe(true);

                viewController.onRowFlyMenuItemClick(null, null, "markunread", rec);

                t.waitForMs(t.parent.TIMEOUT, () => {
                    t.expect(rec.get("seen")).toBe(false);
                    t.expect(CALLED).toBe(1);
                });

            });


            t.it("onRowFlyMenuBeforeShow()", t => {

                let CALLED = 0;

                const viewController = Ext.create(
                    "conjoon.cn_mail.view.mail.inbox.InboxViewController", {
                        view: {
                            down: function () {
                                return {
                                    updateRowFlyMenu: function () {
                                        CALLED++;
                                    }
                                };
                            }
                        }});

                t.expect(CALLED).toBe(0);
                viewController.onRowFlyMenuBeforeShow(null, null, {get: function (){}});
                t.expect(CALLED).toBe(1);

            });


            t.it("getMailBoxMessageService()", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {
                    let service = viewController.getMailboxService();

                    t.isInstanceOf(service, "conjoon.cn_mail.data.mail.service.MailboxService");
                    t.expect(service).toBe(viewController.getMailboxService());

                    t.isInstanceOf(service.getMailFolderHelper(), "conjoon.cn_mail.data.mail.service.MailFolderHelper");
                    t.expect(service.getMailFolderHelper().getStore()).toBe(viewController.getView().down("cn_mail-mailfoldertree").getStore());

                });

            });


            t.it("onRowFlyMenuItemClick() - delete", t => {

                const viewController = Ext.create(
                    "conjoon.cn_mail.view.mail.inbox.InboxViewController");

                viewController.getMailboxService = function () {
                    return {
                        moveToTrashOrDeleteMessage: function () {}
                    };
                };

                let rec = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    mailFolderId: "INBOX",
                    mailAccountId: "dev_sys_conjoon_org",
                    seen: true
                });

                t.isCalled("moveOrDeleteMessage", viewController);

                viewController.onRowFlyMenuItemClick(null, null, "delete", rec);
            });


            t.it("onRowFlyMenuBeforeShow() - cn_deleted / cn_moved", t => {

                const viewController = Ext.create(
                    "conjoon.cn_mail.view.mail.inbox.InboxViewController"
                );

                t.expect(viewController.onRowFlyMenuBeforeShow(null, null,  Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    mailFolderId: "INBOX",
                    mailAccountId: "dev_sys_conjoon_org",
                    cn_deleted: true
                }))).toBe(false);


                t.expect(viewController.onRowFlyMenuBeforeShow(null, null,  Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    mailFolderId: "INBOX",
                    mailAccountId: "dev_sys_conjoon_org",
                    cn_moved: true
                }))).toBe(false);
            });


            t.it("onBeforeMessageMoveOrDelete()", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 2);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3);

                        let op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                            request: {
                                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                                record: messageItem
                            }
                        });

                        t.expect(messageItem.get("cn_moved")).toBe(false);
                        t.expect(viewController.onBeforeMessageMoveOrDelete(op, true)).toBe(op);
                        t.expect(messageItem.get("cn_moved")).toBe(true);

                        messageItem = selectMessage(panel, 2);
                        op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                            request: {
                                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                                record: messageItem
                            }
                        });

                        t.isCalled("detachMenuAndUnset", viewController.getRowFlyMenu());
                        t.expect(messageItem).toBeTruthy();
                        t.expect(messageItem.get("cn_deleted")).toBe(false);
                        t.expect(messageItem.store).toBe(getMessageGridStore(panel));
                        t.expect(getSelectedMessage(panel)).toBe(messageItem);
                        t.expect(viewController.onBeforeMessageMoveOrDelete(op, true)).toBe(op);
                        t.expect(messageItem.get("cn_deleted")).toBe(true);
                        t.expect(messageItem.store).toBeFalsy();
                        t.expect(getSelectedMessage(panel)).toBeFalsy();
                    });
                });
            });


            t.it("onMessageMovedOrDeletedFailure()", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 2);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3),
                            owningStore = messageItem.store;


                        messageItem.unjoin(owningStore);
                        messageItem.set("cn_moved",   true);


                        let op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                            request: {
                                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                                record: messageItem,
                                owningStore: owningStore
                            }
                        });


                        t.expect(messageItem.get("cn_moved")).toBe(true);
                        t.expect(viewController.onMessageMovedOrDeletedFailure(op)).toBe(op);
                        t.expect(messageItem.get("cn_moved")).toBe(false);

                        messageItem = selectMessage(panel, 2);
                        messageItem.unjoin(messageItem.store);
                        messageItem.set("cn_deleted", true);
                        op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                            request: {
                                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                                record: messageItem,
                                owningStore: owningStore
                            }
                        });

                        t.isCalled("reject", messageItem);

                        t.expect(messageItem).toBeTruthy();
                        t.expect(messageItem.get("cn_deleted")).toBe(true);
                        t.expect(messageItem.store).toBeFalsy();
                        t.expect(viewController.onMessageMovedOrDeletedFailure(op)).toBe(op);
                        t.expect(messageItem.get("cn_deleted")).toBe(false);
                        t.expect(messageItem.store).toBe(getMessageGridStore(panel));
                    });
                });
            });


            t.it("onMessageMovedOrDeleted() - MOVED - targetFolder not shown in messageGrid", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 2);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3),
                            owningStore = messageItem.store;

                        messageItem.unjoin(messageItem.store);
                        messageItem.set("cn_moved",   true);

                        let op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                            request: {
                                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                                record: messageItem,
                                targetFolderId: "5",
                                owningStore: owningStore
                            }
                        });

                        t.isCalled("remove", viewController.getLivegrid());
                        t.isntCalled("add", viewController.getLivegrid());

                        t.expect(messageItem.get("cn_moved")).toBe(true);
                        t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                        t.expect(messageItem.get("cn_moved")).toBe(false);
                        t.expect(messageItem.store).toBe(getMessageGridStore(panel));
                    });
                });
            });


            t.it("onMessageMovedOrDeleted() - MOVED - targetFolder shown in messageGrid", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 2);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3),
                            owningStore = messageItem.store;
                        deselectMessage(panel, messageItem);
                        let targetFolder = selectMailFolder(panel, 4);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            messageItem.unjoin(messageItem.store);
                            messageItem.set("cn_moved",   true);

                            let op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                                request: {
                                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                                    record: messageItem,
                                    targetFolderId: targetFolder.get("id"),
                                    owningStore: owningStore
                                }
                            });

                            t.isntCalled("remove", viewController.getLivegrid());
                            t.isCalled("add", viewController.getLivegrid());

                            t.expect(messageItem.get("cn_moved")).toBe(true);
                            t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                            t.expect(messageItem.get("cn_moved")).toBe(false);
                            t.expect(messageItem.store).toBe(getMessageGridStore(panel));
                        });
                    });
                });
            });


            t.it("onMessageMovedOrDeleted() - DELETED - messageItems MailFolder not selected", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 2);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3),
                            owningStore = messageItem.store;

                        selectMailFolder(panel, 4);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            messageItem.unjoin(messageItem.store);
                            messageItem.set("cn_deleted", true);

                            let op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                                request: {
                                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                                    record: messageItem,
                                    owningStore: owningStore
                                }
                            });

                            t.isntCalled("remove", viewController.getLivegrid());
                            t.isntCalled("add", viewController.getLivegrid());

                            t.expect(messageItem.get("cn_deleted")).toBe(true);
                            t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                            t.expect(messageItem.get("cn_deleted")).toBe(false);
                            t.expect(messageItem.store).toBeFalsy();
                        });
                    });
                });
            });


            t.it("onMessageMovedOrDeleted() - DELETED - messageItems MailFolder is selected", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 2);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3),
                            owningStore = messageItem.store;

                        messageItem.unjoin(messageItem.store);
                        messageItem.set("cn_deleted", true);

                        let op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                            request: {
                                type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                                record: messageItem,
                                owningStore: owningStore
                            }
                        });

                        t.isCalled("remove", viewController.getLivegrid());
                        t.isntCalled("add", viewController.getLivegrid());

                        t.expect(messageItem.get("cn_deleted")).toBe(true);
                        t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                        t.expect(messageItem.get("cn_deleted")).toBe(false);
                        t.expect(messageItem.store).toBeFalsy();
                    });
                });
            });


            t.it("moveOrDeleteMessage()", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    // should be move operation since selected folder is not of type
                    // TRASH
                    t.expect(selectMailFolder(panel, 2).get("folderType")).not.toBe("TRASH");

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        let messageItem = panel.down("cn_mail-mailmessagegrid").getStore().getAt(0);

                        t.isCalled("moveToTrashOrDeleteMessage", viewController.getMailboxService());
                        t.isCalled("onBeforeMessageMoveOrDelete", viewController);
                        t.isCalled("onMessageMovedOrDeleted", viewController);
                        t.isntCalled("onMessageMovedOrDeletedFailure", viewController);


                        t.isInstanceOf(viewController.moveOrDeleteMessage(messageItem, true), "conjoon.cn_mail.data.mail.service.mailbox.Operation");

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            // intentionally left empty
                        });
                    });
                });
            });


            t.it("moveOrDeleteMessage() - failure", function (t){

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    let folder =  selectMailFolder(panel, 5);
                    t.expect(folder.get("folderType")).toBe("TRASH");

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        let messageItem = Ext.create(
                            "conjoon.cn_mail.model.mail.message.MessageItem", {
                                localId: "bla",
                                id: "foobar",
                                mailAccountId: "dev_sys_conjoon_org",
                                mailFolderId: folder.get("id")
                            });

                        t.isCalled("onMessageMovedOrDeletedFailure", viewController);


                        viewController.moveOrDeleteMessage(messageItem, true);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            // intentionally left empty

                        });
                    });
                });

            });


            t.it("callbacks registered for delete draft / delete buttons", function (t){

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                let messageView = panel.down("cn_mail-mailmessagereadermessageview");


                t.waitForMs(t.parent.TIMEOUT, () => {

                    t.isCalledNTimes("onDeleteClick", viewController, 2);
                    t.isCalledNTimes("onDeleteClick", viewController, 2);


                    selectMailFolder(panel, 5);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMessage(panel, 2);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            messageView.down("#btn-delete").fireEvent("click");

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                selectMessage(panel, 4);

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    messageView.down("#btn-deletedraft").fireEvent("click");


                                    t.waitForMs(t.parent.TIMEOUT, () => {
                                        // intentionally left empty
                                    });

                                });
                            });

                        });
                    });
                });
            });


            t.it("onBeforeMessageMoveOrDelete() - cancel delete", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 5);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3);

                        t.isntCalled("erase", messageItem);
                        t.isntCalled("moveMessage", viewController.getMailboxService());

                        let cb = function () {
                            return false;
                        };

                        panel.on("cn_mail-beforemessageitemdelete", cb);


                        let op = viewController.moveOrDeleteMessage(messageItem, true);

                        t.expect(messageItem.dropped).toBe(false);
                        t.expect(messageItem.get("cn_deleted")).toBe(false);
                        t.expect(messageItem.get("cn_moved")).toBe(false);
                        t.expect(messageItem.store).toBe(getMessageGridStore(panel));

                        t.expect(op.getResult()).toBeDefined();
                        t.expect(op.getResult().success).toBe(false);
                        t.expect(op.getResult().code).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.CANCELED);

                    });
                });
            });


            t.it("moveOrDeleteMessage() - confirm dialog not shown", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 5);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3);

                        let cb = function () {
                            return false;
                        };

                        panel.on("cn_mail-beforemessageitemdelete", cb);

                        t.isntCalled("showMessageDeleteConfirmDialog", viewController.getView());
                        viewController.moveOrDeleteMessage(messageItem);

                    });
                });
            });


            t.it("moveOrDeleteMessage() - confirm dialog shown", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 5);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3);

                        let cb = function () {
                            return true;
                        };

                        panel.on("cn_mail-beforemessageitemdelete", cb);

                        t.isCalled("showMessageDeleteConfirmDialog", viewController.getView());
                        t.isCalled("erase", messageItem);


                        viewController.moveOrDeleteMessage(messageItem);

                        let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                        t.click(yesButton[0]);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            // intentionally left blank
                        });


                    });
                });
            });


            t.it("moveOrDeleteMessage() - confirm dialog shown while global event returned false again", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 5);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3);

                        let cbtrue = function () {
                                return true;
                            },
                            cbfalse = function () {
                                return false;
                            };

                        panel.on("cn_mail-beforemessageitemdelete", cbtrue);

                        t.isntCalled("erase", messageItem);
                        t.isCalled("showMessageDeleteConfirmDialog", viewController.getView());
                        viewController.moveOrDeleteMessage(messageItem);

                        panel.on("cn_mail-beforemessageitemdelete", cbfalse);

                        let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                        t.click(yesButton[0]);


                        t.waitForMs(t.parent.TIMEOUT, () => {
                            // intentionally left blank
                        });

                    });
                });
            });


            t.it("updateViewForSentDraft() - no selection", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    let oldM = conjoon.cn_mail.data.mail.service.MailboxService.prototype.moveMessage,
                        CALLED = 0;

                    conjoon.cn_mail.data.mail.service.MailboxService.prototype.moveMessage = function () {
                        CALLED++;
                    };

                    let md = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        mailAccountId: "foo",
                        mailFolderId: "bar",
                        id: "foobar",
                        subject: "FOOBAR"
                    });
                    md.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody"));

                    viewController.updateViewForSentDraft(md);
                    t.expect(CALLED).toBe(1);

                    conjoon.cn_mail.data.mail.service.MailboxService.prototype.moveMessage = oldM;
                });
            });


            t.it("updateViewForSentDraft() - mail folder SENT selected", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    // messageDrafts are sent once they have been moved to DRAFT folder
                    let messageDraft = createMessageDraftByFolderId(1, "INBOX.Drafts");

                    messageDraft.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody"));

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let mailFolder = selectMailFolder(panel, 2);
                        let tfid = mailFolder.get("id");

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.isCalledOnce("onBeforeMessageMoveOrDelete", viewController);
                            t.isCalledOnce("onMessageMovedOrDeleted", viewController);

                            let op = viewController.updateViewForSentDraft(messageDraft);

                            t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");

                            t.expect(op.getRequest().targetFolderId).toBe(tfid);

                            t.waitForMs(t.parent.TIMEOUT, () => {
                                // intentionally left blank
                            });
                        });
                    });
                });
            });


            t.it("updateViewForSentDraft() - mail folder DRAFT selected", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let mailFolder = selectMailFolder(panel, 4);
                        t.expect(mailFolder.get("folderType")).toBe("DRAFT");

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let messageItem  = selectMessage(panel, 0),
                                messageDraft = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(
                                    messageItem.getCompoundKey()
                                );

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                let op = viewController.updateViewForSentDraft(messageDraft);

                                t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");
                                t.expect(op.getRequest().targetFolderId).toBe("INBOX.Sent Messages");
                                t.expect(op.getRequest().sourceFolderId).toBe(mailFolder.get("id"));

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    // intentionally left blank
                                });
                            });
                        });

                    });
                });
            });


            t.it("moveOrDeleteMessage() - event \"cn_mail-messageitemmove\" fired", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                let CALLED = 0;

                panel.on("cn_mail-messageitemmove", function () {
                    CALLED++;
                });

                t.waitForMs(t.parent.TIMEOUT, () => {

                    // should be move operation since selected folder is not of type
                    // TRASH
                    t.expect(selectMailFolder(panel, 1).get("folderType, ")).not.toBe("TRASH");

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        let messageItem = panel.down("cn_mail-mailmessagegrid").getStore().getAt(0);

                        t.expect(CALLED).toBe(0);
                        viewController.moveOrDeleteMessage(messageItem, true);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(CALLED).toBe(1);
                        });
                    });
                });
            });


            t.it("extjs-app-webmail#82 - onMessageMovedOrDeleted() - DELETED - messageItem has no compound key (composed)", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");

                        selectMailFolder(panel, 4);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                                request: {
                                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                                    record: messageItem
                                }
                            });

                            t.isntCalled("remove", viewController.getLivegrid());
                            t.isntCalled("add", viewController.getLivegrid());

                            t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);

                        });
                    });
                });
            });


            t.it("extjs-app-webmail#47 - updateViewForSentDraft() - mail folder INBOX is selected and message to which was replied is available", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 1);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 0);

                        let messageDraft = createMessageDraftByFolderId(1, "INBOX.Drafts");
                        messageDraft.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody"));
                        messageDraft.set("xCnDraftInfo", btoa(
                            Ext.encode(
                                [messageItem.get("mailAccountId"),
                                    messageItem.get("mailFolderId"),
                                    messageItem.get("id")]
                            )
                        ));

                        t.expect(messageItem.get("answered")).toBe(false);
                        viewController.updateViewForSentDraft(messageDraft);

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            t.expect(messageItem.get("answered")).toBe(true);

                        });

                    });
                });
            });


            t.it("extjs-app-webmail#90 - joining to store", t => {

                panel = createPanelWithViewModel();

                const viewController = panel.getController();

                t.waitForMs(t.parent.TIMEOUT, () => {

                    selectMailFolder(panel, 2);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        let messageItem = selectMessage(panel, 3);
                        deselectMessage(panel, messageItem);
                        let targetFolder = selectMailFolder(panel, 4);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            // UNJOIN
                            messageItem.unjoin(messageItem.store);

                            let op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
                                request: {
                                    type: conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                                    record: messageItem,
                                    targetFolderId: targetFolder.get("id")
                                    // NO OWNING STORE MARKED
                                }
                            });

                            t.isntCalled("remove", viewController.getLivegrid());
                            t.isCalled("add", viewController.getLivegrid());


                            t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                            t.expect(messageItem.store).toBe(getMessageGridStore(panel));
                        });
                    });
                });
            });


            t.it("extjs-app-webmail#83 - make sure MailFolderTree *select-events are registered", t => {

                panel = createPanelWithViewModel();

                let ctrl = panel.getController(),
                    tmp  = panel.down;


                panel.down = function (query) {

                    if (query !== "cn_mail-mailaccountview") {
                        return tmp.apply(panel, [query]);
                    }

                    return {
                        hasPendingChanges: function () {
                            return false;
                        }
                    };
                };

                t.waitForMs(t.parent.TIMEOUT, () => {

                    t.isCalled("onMailFolderTreeSelect", ctrl);
                    t.isCalled("onMailFolderTreeBeforeSelect", ctrl);

                    selectMailFolder(panel, 2);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                    });

                });
            });


            t.it("extjs-app-webmail#83 - onMailFolderTreeBeforeSelect()", function (t){

                panel = createPanelWithViewModel();

                let ctrl = panel.getController(),
                    PENDINGCHANGES = false,
                    CALLED;

                t.waitForMs(t.parent.TIMEOUT, () => {

                    panel.showMailAccountIsBeingEditedNotice = function () {
                        CALLED = true;
                    };

                    panel.down = function () {

                        return {
                            hasPendingChanges: function () {
                                return PENDINGCHANGES;
                            }
                        };

                    };

                    t.expect(PENDINGCHANGES).toBe(false);
                    t.expect(CALLED).toBeUndefined();

                    t.expect(ctrl.onMailFolderTreeBeforeSelect()).toBe(true);

                    PENDINGCHANGES = true;

                    t.expect(ctrl.onMailFolderTreeBeforeSelect()).toBe(false);

                    t.expect(CALLED).toBe(true);

                });

            });


        });});});
