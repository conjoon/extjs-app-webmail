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

    const helper = l8.liquify(TestHelper.get(t, window));
    await helper.setupSimlets().mockUpMailTemplates().mockUpServices("coon.core.service.UserImageService").andRun((t) => {

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
            selectMessage = function (panel, storeAt, shouldEqualToCK, t) {

                let message = panel.down("cn_mail-mailmessagegrid").getStore().getAt(storeAt);

                if (shouldEqualToCK) {
                    t.expect(message.getCompoundKey().toObject()).toEqual(shouldEqualToCK.toObject());
                }

                panel.down("cn_mail-mailmessagegrid").getSelectionModel()
                    .select(message);


                return message;
            },
            createMessageItem = function (index, mailFolderId) {

                index = index === undefined ? 1 : index;

                let mi = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(index);

                if (mailFolderId) {
                    let i = index >= 0 ? index : 0, upper = 10000;

                    for (; i <= upper; i++) {
                        mi = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(i);
                        if (mi.mailFolderId === mailFolderId) {
                            break;
                        }
                    }

                }

                return Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    localId: [mi.mailAccountId, mi.mailFolderId, mi.id].join("-"),
                    id: mi.id,
                    mailAccountId: mi.mailAccountId,
                    mailFolderId: mi.mailFolderId
                });
            },
            getRecordCollection = function () {
                return [
                    createMessageItem(1, "INBOX"),
                    createMessageItem(2, "INBOX.Drafts"),
                    createMessageItem(3, "INBOX.Sent Messages"),
                    createMessageItem(4, "INBOX.Drafts"),
                    createMessageItem(5, "INBOX.Drafts")
                ];
            },
            createMailDesktopView = function () {
                return Ext.create("conjoon.cn_mail.view.mail.MailDesktopView", {
                    width: 800,
                    height: 600,
                    renderTo: document.body
                });
            };

        t.beforeEach(function () {
            conjoon.dev.cn_mailsim.data.table.MessageTable.resetAll();
        });


        t.afterEach(function () {
            Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
            Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
        });


        t.requireOk("conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", () => {
            t.requireOk("conjoon.cn_mail.view.mail.MailDesktopView", function (){


                t.it("showMailMessageViewFor() - extjs-app-webmail#64", t => {

                    let panel = createMailDesktopView(),
                        ctrl  = panel.getController(),
                        CK    = getRecordCollection()[0].getCompoundKey();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        t.expect(ctrl.showMailMessageViewFor(CK)).toBeTruthy();

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            panel.destroy();
                            panel = null;
                        });

                    });
                });


                t.it("extjs-app-webmail#70", t => {

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor = ctrl.showMailEditor("sffss", "compose"),
                        editorVm = editor.getViewModel(),
                        CK, view, attachmentCount, attachmentStore;

                    t.expect(editor).toBeTruthy();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        editorVm        = editor.getViewModel();
                        attachmentStore = editorVm.get("messageDraft").attachments();
                        attachmentCount = attachmentStore.getRange().length;


                        editorVm.get("messageDraft").set("subject", "foo");
                        editorVm.get("messageDraft").attachments().add(
                            Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {})
                        );

                        t.expect(attachmentStore.getRange().length).toBe(++attachmentCount);

                        editor.getController().configureAndStartSaveBatch();


                        t.waitForMs(t.parent.TIMEOUT, () => {

                            CK = editorVm.get("messageDraft").getCompoundKey();

                            editor.close();

                            view = ctrl.showMailMessageViewFor(CK);


                            t.waitForMs(t.parent.TIMEOUT, () => {

                                t.expect(view.getViewModel().get("attachmentStore").getRange().length).toBe(attachmentCount);

                                panel.destroy();
                                panel = null;
                            });


                        });

                    });
                });


                let v = Ext.getVersion().version;
                if (v === "7.4.0.42") {
                    t.diag("skipping extjs-app-webmail#71 - 1 (test broken with siesta 5.5.2 and ExtJS 7.1.0.46/7.4.0.42)");
                } else {
                    t.it("extjs-app-webmail#71 - 1", t => {


                        let panel  = createMailDesktopView(),
                            ctrl   = panel.getController(),
                            editor, editorVm, inboxView,
                            CK;


                        t.waitForMs(t.parent.TIMEOUT, () => {

                            selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));


                            t.waitForMs(t.parent.TIMEOUT, () => {

                                editor = ctrl.showMailEditor("sffss", "compose"),
                                editorVm = editor.getViewModel();

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    editorVm.get("messageDraft").set("subject", "foo");
                                    editorVm.get("messageDraft").set("to", "To");
                                    editorVm.get("messageDraft").set("cc", "CC");
                                    editorVm.get("messageDraft").set("bcc", "BCC");
                                    editorVm.notify();

                                    editor.getController().configureAndStartSaveBatch();

                                    t.waitForMs(t.parent.TIMEOUT, () => {

                                        inboxView = panel.down("cn_mail-mailinboxview");
                                        CK        = editorVm.get("messageDraft").getCompoundKey();

                                        panel.setActiveTab(inboxView);

                                        CK = editorVm.get("messageDraft").getCompoundKey();
                                        selectMessage(panel, 0, CK, t);

                                        panel.setActiveTab(editor);

                                        inboxView.getController().moveOrDeleteMessage(editorVm.get("messageDraft"), null, editor);

                                        t.waitForMs(t.parent.TIMEOUT, () => {

                                            editor.close();

                                            let message =  selectMessage(panel, 0);

                                            t.expect(message.getCompoundKey().toObject()).not.toEqual(CK.toObject());

                                            panel.close();
                                            panel = null;

                                        });

                                    });


                                });

                            });


                        });
                    });
                }


                t.it("extjs-app-webmail#71 - 2", t => {

                    let panel  = createMailDesktopView(),
                        editor, inboxView;


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            inboxView = panel.down("cn_mail-mailinboxview");


                            panel.setActiveTab(inboxView);

                            let message = selectMessage(panel, 0);

                            panel.setActiveTab(editor);

                            inboxView.getController().moveOrDeleteMessage(message);

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                let message_new =  selectMessage(panel, 0);

                                t.expect(message.getCompoundKey().toObject()).not.toEqual(message_new.getCompoundKey().toObject());

                                panel.destroy();
                                panel = null;
                            });

                        });
                    });
                });


                t.it("extjs-app-webmail#71 - 3", t => {

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor, editorVm, inboxView,
                        CK, cnhref;


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));


                        t.waitForMs(t.parent.TIMEOUT, () => {


                            let message = selectMessage(panel, 0);

                            editor = ctrl.showMailEditor(message.getCompoundKey(), "edit");
                            editorVm = editor.getViewModel();

                            t.waitForMs(t.parent.TIMEOUT, () => {


                                cnhref = editor.cn_href;

                                editorVm.get("messageDraft").set("subject", "abc");

                                editor.getController().configureAndStartSaveBatch();

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    inboxView = panel.down("cn_mail-mailinboxview");
                                    CK        = editorVm.get("messageDraft").getCompoundKey();

                                    panel.setActiveTab(inboxView);


                                    message = selectMessage(panel, 0, CK, t);


                                    inboxView.getController().moveOrDeleteMessage(message);

                                    t.waitForMs(t.parent.TIMEOUT, () => {

                                        let message = selectMessage(panel, 0);

                                        t.expect(message.getCompoundKey().toObject()).not.toEqual(CK.toObject());

                                        t.expect(editor.cn_href).not.toBe(cnhref);

                                        panel.destroy();
                                        panel = null;
                                    });

                                });


                            });

                        });


                    });
                });


                t.it("extjs-app-webmail#71 - 4", t => {

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor, editorVm,
                        inboxView = panel.down("cn_mail-mailinboxview"),
                        CK;


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));


                        t.waitForMs(t.parent.TIMEOUT, () => {


                            let message = selectMessage(panel, 0);

                            editor = ctrl.showMailEditor(message.getCompoundKey(), "edit");
                            editorVm = editor.getViewModel();

                            t.waitForMs(t.parent.TIMEOUT, () => {


                                editorVm.get("messageDraft").set("subject", "abc");

                                editor.getController().configureAndStartSaveBatch();

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    inboxView.getController().moveOrDeleteMessage(editorVm.get("messageDraft"));

                                    t.waitForMs(t.parent.TIMEOUT, () => {

                                        // set active tab so Livegrid rendering
                                        //  can be reinitialized and no further error is thrown
                                        // when trying to access it's nodeCache.
                                        panel.setActiveTab(inboxView);
                                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 4, "INBOX.Trash", t));


                                        t.waitForMs(t.parent.TIMEOUT, () => {

                                            let newmessage = selectMessage(panel, 0, editorVm.get("messageDraft").getCompoundKey(), t);

                                            CK = newmessage.getCompoundKey();

                                            selectMessage(panel, 1);

                                            t.expect(newmessage.getCompoundKey().toObject()).toEqual(
                                                editorVm.get("messageDraft").getCompoundKey().toObject()
                                            );

                                            let ictrl = inboxView.getController(),
                                                md = editorVm.get("messageDraft");


                                            ictrl.moveOrDeleteMessage(md, true, editor);

                                            t.waitForMs(t.parent.TIMEOUT, () => {

                                                newmessage = selectMessage(panel, 0);

                                                t.expect(newmessage.getCompoundKey().toObject()).not.toEqual(CK.toObject());

                                                panel.destroy();
                                                panel = null;

                                            });

                                        });

                                    });


                                });


                            });

                        });


                    });
                });


                t.it("extjs-app-webmail#75", t => {

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor,
                        inboxView = panel.down("cn_mail-mailinboxview"),
                        CK;


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));


                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let message;
                            for (let i = 0; i < 100; i++) {
                                message = selectMessage(panel, i);
                                if (message.get("hasAttachments")) {
                                    break;
                                }
                            }


                            CK = message.getCompoundKey();

                            editor   = ctrl.showMailEditor(CK, "edit");

                            t.waitForMs(t.parent.TIMEOUT, () => {


                                editor.getController().configureAndStartSaveBatch();

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    panel.setActiveTab(inboxView);

                                    inboxView.getController().moveOrDeleteMessage(message);

                                    t.waitForMs(t.parent.TIMEOUT, () => {

                                        panel.setActiveTab(editor);

                                        t.waitForMs(t.parent.TIMEOUT, () => {
                                            t.isntCalled("onMailMessageSaveOperationException", editor.getController());
                                            t.isCalled("onMailMessageSaveComplete", editor.getController());

                                            editor.getController().configureAndStartSaveBatch();


                                            t.waitForMs(t.parent.TIMEOUT, () => {
                                                panel.destroy();
                                                panel = null;
                                            });
                                        });
                                    });


                                });


                            });

                        });


                    });
                });


                let testAppCnMail63 = function (t, editMode) {
                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor, editorVm,
                        inboxView = panel.down("cn_mail-mailinboxview");


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 2, "INBOX.Junk", t));


                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let message = selectMessage(panel, 0);

                            editor   = ctrl.showMailEditor(message.getCompoundKey(), editMode);
                            editorVm = editor.getViewModel();

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                t.expect(Ext.util.History.getToken()).toContain(editMode + "/" + message.getCompoundKey().toArray().join("/"));
                                editor.getController().configureAndStartSaveBatch();

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    t.expect(Ext.util.History.getToken()).toContain("edit/" + editorVm.get("messageDraft").getCompoundKey().toArray().join("/"));

                                    panel.setActiveTab(inboxView);

                                    inboxView.getController().moveOrDeleteMessage(message);

                                    t.waitForMs(t.parent.TIMEOUT, () => {

                                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));


                                        t.waitForMs(t.parent.TIMEOUT, () => {


                                            message = selectMessage(panel, 0);

                                            inboxView.getController().moveOrDeleteMessage(message);


                                            t.waitForMs(t.parent.TIMEOUT, () => {
                                                t.expect(message.get("mailFolderId")).toBe("INBOX.Trash");
                                                panel.destroy();
                                                panel = null;
                                            });
                                        });
                                    });


                                });


                            });

                        });


                    });
                };


                t.it("extjs-app-webmail#63 - replyAll", t => {
                    testAppCnMail63(t, "replyAll");
                });


                t.it("extjs-app-webmail#63 - replyTo", t => {
                    testAppCnMail63(t, "replyTo");
                });

                t.it("extjs-app-webmail#63 - forward", t => {
                    testAppCnMail63(t, "forward");
                });


                t.it("extjs-app-webmail#78 - composed draft ", t => {

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor = ctrl.showMailEditor("sffss", "compose"),
                        editorVm = editor.getViewModel(),
                        CK, md, inboxView = panel.down("cn_mail-mailinboxview");

                    t.expect(editor).toBeTruthy();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        editorVm = editor.getViewModel();

                        md = editorVm.get("messageDraft");
                        md.set("subject", "foo");
                        md.set("to", "demo@conjoon.org");
                        t.expect(md.get("draft")).toBe(true);

                        editor.getController().configureAndStartSaveBatch(true);

                        t.waitForMs(t.parent.TIMEOUT, function () {

                            CK = md.getCompoundKey();

                            t.expect(md.get("mailFolderId")).toBe("INBOX.Sent Messages");
                            t.expect(md.getCompoundKey().toLocalId()).toContain("INBOX.Sent Messages");

                            panel.setActiveTab(inboxView);

                            selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 1, "INBOX.Sent Messages", t));


                            t.waitForMs(t.parent.TIMEOUT, () => {
                                // it is possible we will not find the newly created item at the first position
                                // due to date sorting (created might be newer)
                                // loop through 10 first items to find
                                let msg;
                                for (let i = 0, len = 10; i < len; i++) {
                                    msg = selectMessage(panel, i);
                                    if (msg.getCompoundKey().equalTo(CK)) {
                                        break;
                                    }
                                }

                                t.expect(msg.getCompoundKey().toObject()).toEqual(CK.toObject());
                                t.expect(msg.get("draft")).toBe(false);

                                panel.destroy();
                                panel = null;

                            });
                        });

                    });
                });


                t.it("extjs-app-webmail#78 - loaded draft ", t => {

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor, editorVm,
                        CK, md, inboxView = panel.down("cn_mail-mailinboxview");


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let msg = selectMessage(panel, 0),
                                OLDCK = msg.getCompoundKey();

                            editor = ctrl.showMailEditor(OLDCK, "edit"),
                            editorVm = editor.getViewModel();


                            t.waitForMs(t.parent.TIMEOUT, () => {

                                md = editorVm.get("messageDraft");
                                md.set("subject", "foo");
                                t.expect(md.get("draft")).toBe(true);

                                editor.getController().configureAndStartSaveBatch(true);

                                t.waitForMs(t.parent.TIMEOUT, function () {

                                    CK = md.getCompoundKey();

                                    let livegrid = inboxView.getController().getLivegrid();

                                    t.expect(livegrid.getRecordByCompoundKey(OLDCK)).toBeFalsy();
                                    t.expect(livegrid.getRecordByCompoundKey(CK)).toBeFalsy();

                                    selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 1, "INBOX.Sent Messages", t));

                                    t.waitForMs(t.parent.TIMEOUT, () => {
                                        // it is possible we will not find the newly created item at the first position
                                        // due to date sorting (created might be newer)
                                        // loop through 10 first items to find
                                        let msg;
                                        for (let i = 0, len = 10; i < len; i++) {
                                            msg = selectMessage(panel, i);
                                            if (msg.getCompoundKey().equalTo(CK)) {
                                                break;
                                            }
                                        }

                                        t.expect(msg.getCompoundKey().toObject()).toEqual(CK.toObject());
                                        t.expect(msg.get("draft")).toBe(false);

                                        panel.destroy();
                                        panel = null;
                                    });
                                });

                            });

                        });
                    });
                });


                t.it("extjs-app-webmail#79", t => {

                    let panel = createMailDesktopView(),
                        ctrl = panel.getController(),
                        REDIRECTED = 0;


                    ctrl.getCompoundKeyFromInboxMessageView = function () {
                        return {
                            toArray: function (){return ["foo"];}
                        };
                    };

                    ctrl.redirectTo = function () {
                        REDIRECTED++;
                    };

                    t.expect(ctrl.redirectToEditorFromInboxMessageView("edit")).toBe("cn_mail/message/edit/foo");
                    t.expect(ctrl.redirectToEditorFromInboxMessageView("replyTo")).toBe("cn_mail/message/replyTo/foo");
                    t.expect(ctrl.redirectToEditorFromInboxMessageView("replyAll")).toBe("cn_mail/message/replyAll/foo");
                    t.expect(ctrl.redirectToEditorFromInboxMessageView("forward")).toBe("cn_mail/message/forward/foo");

                    t.expect(REDIRECTED).toBe(4);

                    panel.destroy();
                    panel = null;
                });


                t.it("extjs-app-webmail#80", t => {

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor = ctrl.showMailEditor("sffss", "compose"),
                        editorVm = editor.getViewModel(),
                        CK;

                    t.expect(editor).toBeTruthy();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        panel.setActiveTab(panel.down("cn_mail-mailinboxview"));

                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 1, "INBOX.Sent Messages", t));

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            panel.setActiveTab(editor);

                            editorVm.get("messageDraft").set("subject", "foo");
                            editorVm.get("messageDraft").set("to", "foo");

                            editor.getController().configureAndStartSaveBatch(true);

                            t.waitForMs(1750, function () {

                                CK = editorVm.get("messageDraft").getCompoundKey();

                                panel.setActiveTab(panel.down("cn_mail-mailinboxview"));

                                selectMessage(panel, 0, CK, t);

                                editor = ctrl.showMailEditor(CK, "replyTo");

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    editor.getController().configureAndStartSaveBatch();

                                    t.waitForMs(t.parent.TIMEOUT, () => {
                                        let mdck = editor.getViewModel().get("messageDraft").getCompoundKey();

                                        t.expect(mdck.toObject()).toBeTruthy();

                                        panel.destroy();
                                        panel = null;
                                    });
                                });
                            });

                        });
                    });
                });


                t.it("extjs-app-webmail#82", t => {

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController(),
                        editor,
                        CK,
                        inboxView;

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        inboxView = panel.setActiveTab(panel.down("cn_mail-mailinboxview"));
                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 0, "INBOX", t));

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            let msg = selectMessage(panel, 0);

                            CK = msg.getCompoundKey();

                            editor = ctrl.showMailEditor(CK, "replyTo");


                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(editor.destroyed).toBeFalsy();
                                inboxView.getController().moveOrDeleteMessage(editor.getViewModel().get("messageDraft"), true, editor);

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    t.expect(editor.destroyed).toBe(true);

                                    panel.destroy();
                                    panel = null;
                                });

                            });


                        });
                    });
                });


                t.it("onMailFolderTreeStoreLoad()", t => {

                    let PROT = conjoon.cn_mail.view.mail.MailDesktopViewController.prototype,
                        onMailFolderTreeStoreLoad = PROT.onMailFolderTreeStoreLoad;

                    PROT.onMailFolderTreeStoreLoad = Ext.emptyFn;

                    let panel  = createMailDesktopView(),
                        ctrl   = panel.getController();


                    t.waitForMs(t.parent.TIMEOUT, () => {

                        PROT.onMailFolderTreeStoreLoad = onMailFolderTreeStoreLoad;

                        let store = panel.down("cn_mail-mailfoldertree").getStore(),
                            root  = store.getRoot();

                        let records = [root.childNodes[0]];
                        t.expect(ctrl.onMailFolderTreeStoreLoad(store, records, false)).toBe(null);
                        t.expect(ctrl.onMailFolderTreeStoreLoad(store, records, true)).toBe(null);

                        records = [root.childNodes[0].childNodes[0]];
                        t.expect(ctrl.onMailFolderTreeStoreLoad(store, records, true)).not.toBe(null);

                        t.expect(ctrl.onMailFolderTreeStoreLoad(store, records, true)).toBe(
                            ctrl.defaultAccountInformations
                        );

                        ctrl.defaultAccountInformations = "TEST";
                        // will return the same if called multiple times
                        t.expect(ctrl.onMailFolderTreeStoreLoad(store, records, true)).toBe("TEST");

                        // will throw if no draft node found
                        ctrl.defaultAccountInformations = null;

                        root.childNodes[0].childNodes[3].set("folderType", "foo");

                        let exc;
                        try{ctrl.onMailFolderTreeStoreLoad(store, records, true);}catch(e){exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("no suitable");

                        panel.destroy();
                        panel = null;

                    });

                });


                t.it("extjs-app-webmail#94", t => {

                    let panel  = createMailDesktopView(),
                        inboxView = panel.down("cn_mail-mailinboxview"),
                        ctrl   = panel.getController(),
                        editor = ctrl.showMailEditor("sffss", "compose"),
                        editorVm = editor.getViewModel(),
                        CK;

                    t.expect(editor).toBeTruthy();

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, getChildAt(panel, "mail_account", 3, "INBOX.Drafts"));

                        t.waitForMs(t.parent.TIMEOUT, () => {

                            editorVm.get("messageDraft").set("subject", "foo");
                            editor.getController().configureAndStartSaveBatch();

                            t.waitForMs(t.parent.TIMEOUT, () => {

                                t.expect(editorVm.get("messageDraft").get("mailAccountId")).toBe("dev_sys_conjoon_org");

                                CK = editorVm.get("messageDraft").getCompoundKey();
                                editor.close();

                                let livegrid = inboxView.getController().getLivegrid();

                                t.expect(livegrid.getRecordByCompoundKey(CK)).toBeFalsy();

                                panel.destroy();
                                panel = null;

                            });
                        });

                    });
                });


                t.it("extjs-app-webmail#95", t => {

                    let panel  = createMailDesktopView(),
                        message,
                        inboxView = panel.down("cn_mail-mailinboxview"),
                        messageView = inboxView.down("cn_mail-mailmessagereadermessageview"),
                        ctrl   = panel.getController(),
                        editor, editorVm,
                        CK, gridRec;

                    // select folder
                    t.waitForMs(t.parent.TIMEOUT, () => {

                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));

                        // select draft
                        t.waitForMs(t.parent.TIMEOUT, () => {

                            for (let i = 0, len = 20; i < len; i++) {
                                message = selectMessage(panel, i);
                                if (message.get("draft")) {
                                    break;
                                }
                            }
                            t.expect(message).toBeDefined();
                            t.expect(message.get("draft")).toBe(true);

                            CK       = message.getCompoundKey();
                            editor   = ctrl.showMailEditor(CK, "edit");
                            editorVm = editor.getViewModel();

                            // open draft and edit subject
                            t.waitForMs(t.parent.TIMEOUT, () => {

                                editorVm.get("messageDraft").set("subject", "foo");
                                editor.getController().configureAndStartSaveBatch();

                                // test subject changes in grid
                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    panel.setActiveItem(inboxView);

                                    let livegrid   = inboxView.getController().getLivegrid();
                                    let UPDATED_CK = editorVm.get("messageDraft").getCompoundKey();

                                    t.expect(messageView.getMessageItem().getCompoundKey().toLocalId()).toBe(UPDATED_CK.toLocalId());
                                    gridRec = livegrid.getRecordByCompoundKey(UPDATED_CK);

                                    t.expect(gridRec).toBeTruthy();
                                    t.expect(gridRec.get("subject")).toBe("foo");

                                    // select other folder
                                    selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 0, "INBOX", t));
                                    t.waitForMs(t.parent.TIMEOUT, () => {

                                        // back to previous folder
                                        selectMailFolder(panel, getChildAt(panel, "dev_sys_conjoon_org", 3, "INBOX.Drafts", t));


                                        t.waitForMs(t.parent.TIMEOUT, () => {

                                            // make sure rec is still there
                                            gridRec = livegrid.getRecordByCompoundKey(UPDATED_CK);
                                            t.expect(gridRec).toBeTruthy();
                                            t.expect(gridRec.get("subject")).toBe("foo");

                                            t.expect(messageView.getMessageItem().getCompoundKey().toLocalId()).toBe(UPDATED_CK.toLocalId());

                                            // edit subject again
                                            panel.setActiveItem(editor);
                                            editorVm.get("messageDraft").set("subject", "bar");
                                            editor.getController().configureAndStartSaveBatch();

                                            t.waitForMs(t.parent.TIMEOUT, () => {

                                                panel.setActiveItem(inboxView);

                                                UPDATED_CK = editorVm.get("messageDraft").getCompoundKey();

                                                t.expect(messageView.getMessageItem().getCompoundKey().toLocalId()).toBe(UPDATED_CK.toLocalId());

                                                gridRec = livegrid.getRecordByCompoundKey(UPDATED_CK);
                                                t.expect(gridRec).toBeTruthy();
                                                t.expect(gridRec.get("subject")).toBe("bar");

                                                panel.destroy();
                                                panel = null;
                                            });

                                        });

                                    });


                                });
                            });
                        });


                    });

                });


            });});});});
