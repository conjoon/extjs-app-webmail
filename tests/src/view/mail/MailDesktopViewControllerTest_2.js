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

describe('conjoon.cn_mail.view.mail.MailDesktopViewControllerTest_2', function(t) {

    const TIMEOUT = 1250,
        createKey = function(id1, id2, id3) {
            return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
        },
        getMessageItemAt = function(messageIndex) {
            return conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);
        },
        createKeyForExistingMessage = function(messageIndex){
            let item = getMessageItemAt(messageIndex);

            let key = createKey(
                item.mailAccountId, item.mailFolderId, item.id
            );

            return key;
        },
        getChildAt = function(panel, rootId, index, shouldBe, t) {

            let root = panel.down('cn_mail-mailfoldertree').getStore().getRoot().findChild('id', rootId),
                c    = root.getChildAt(index);

            if (shouldBe && t) {
                t.expect(c.get('id')).toBe(shouldBe);
            }

            return c;
        },
        selectMailFolder = function(panel, storeAt, shouldBeId, t) {

            let folder = storeAt instanceof Ext.data.TreeModel
                ? storeAt
                : panel.down('cn_mail-mailfoldertree').getStore().getAt(storeAt);

            let p = folder.parentNode;

            while (p) {
                p.expand();
                p = p.parentNode;
            }

            panel.down('cn_mail-mailfoldertree').getSelectionModel()
                .select(folder);

            if (shouldBeId && t) {
                t.expect(folder.get('id')).toBe(shouldBeId);
            }

            return folder;

        },
        selectMessage = function(panel, storeAt, shouldEqualToCK, t) {

            let message = panel.down('cn_mail-mailmessagegrid').getStore().getAt(storeAt);

            if (shouldEqualToCK) {
                t.expect(message.getCompoundKey().toObject()).toEqual(shouldEqualToCK.toObject());
            }

            panel.down('cn_mail-mailmessagegrid').getSelectionModel()
                .select(message);



            return message;
        },
        createMessageItem = function(index, mailFolderId) {

            index = index === undefined ? 1 : index;

            let mi = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(index);

            if (mailFolderId) {
                let i = index >= 0 ? index : 0, upper = 10000;

                for (; i <= upper; i++) {
                    mi = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(i);
                    if (mi.mailFolderId === mailFolderId) {
                        break;
                    }
                }

            }

            return Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                localId       : [mi.mailAccountId, mi.mailFolderId, mi.id].join('-'),
                id            : mi.id,
                mailAccountId : mi.mailAccountId,
                mailFolderId  : mi.mailFolderId
            })
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
        getDummyEditor = function () {
            return Ext.create({
                xtype: 'cn_mail-mailmessageeditor',
                messageDraft: Ext.create(
                    'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig')
            });
        },
        createMailDesktopView = function() {
            return Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
                width    : 800,
                height   : 600,
                renderTo : document.body
            });
        };

    t.afterEach(function() {
    });

    t.beforeEach(function() {

        conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.resetAll();
    });

    let panel;


t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function () {
t.requireOk('conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey', function () {
t.requireOk('conjoon.cn_mail.view.mail.MailDesktopView', function(){
    const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });


    t.it("showMailMessageViewFor() - app-cn_mail#64", function(t) {

        let panel = createMailDesktopView(),
            ctrl  = panel.getController(),
            CK    = getRecordCollection()[0].getCompoundKey();

        t.waitForMs(TIMEOUT, function() {

            t.expect(ctrl.showMailMessageViewFor(CK)).toBeTruthy();

            t.waitForMs(TIMEOUT, function() {
                panel.destroy();
                panel = null;
            });

        });
    });


    t.it("app-cn_mail#70", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor = ctrl.showMailEditor('sffss', 'compose'),
            editorVm = editor.getViewModel(),
            CK, view, attachmentCount, attachmentStore;

        t.expect(editor).toBeTruthy();

        t.waitForMs(750, function() {

            editorVm        = editor.getViewModel();
            attachmentStore = editorVm.get('messageDraft').attachments();
            attachmentCount = attachmentStore.getRange().length;


            editorVm.get('messageDraft').set('subject', 'foo');
            editorVm.get('messageDraft').attachments().add(
                Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment', {})
            );

            t.expect(attachmentStore.getRange().length).toBe(++attachmentCount);

            editor.getController().configureAndStartSaveBatch();


            t.waitForMs(750, function() {

                CK = editorVm.get('messageDraft').getCompoundKey();

                editor.close();

                view = ctrl.showMailMessageViewFor(CK);


                t.waitForMs(750, function() {

                    t.expect(view.getViewModel().get('attachmentStore').getRange().length).toBe(attachmentCount);

                    panel.destroy();
                    panel = null;
                });


            });

        });
    });


    t.it("app-cn_mail#71 - 1", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor, editorVm, inboxView,
            CK;


        t.waitForMs(750, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));


            t.waitForMs(750, function() {

                editor = ctrl.showMailEditor('sffss', 'compose'),
                    editorVm = editor.getViewModel();

                t.waitForMs(750, function() {

                    editorVm.get('messageDraft').set('subject', 'foo');
                    editorVm.notify();

                    editor.getController().configureAndStartSaveBatch();

                    t.waitForMs(750, function() {

                        inboxView = panel.down('cn_mail-mailinboxview');
                        CK        = editorVm.get('messageDraft').getCompoundKey();

                        panel.setActiveTab(inboxView);

                        CK = editorVm.get('messageDraft').getCompoundKey();
                        selectMessage(panel, 0, CK, t);

                        panel.setActiveTab(editor);

                        inboxView.getController().moveOrDeleteMessage(editorVm.get('messageDraft'), null, editor);

                        t.waitForMs(750, function() {

                            editor.close();

                            let message =  selectMessage(panel, 0);

                            t.expect(message.getCompoundKey().toObject()).not.toEqual(CK.toObject());

                            panel.destroy();
                            panel = null;
                        });

                    });


                });

            });


        });
    });


    t.it("app-cn_mail#71 - 2", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor, editorVm, inboxView,
            CK;


        t.waitForMs(750, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));

            t.waitForMs(750, function() {

                inboxView = panel.down('cn_mail-mailinboxview');


                panel.setActiveTab(inboxView);

                let message = selectMessage(panel, 0);

                panel.setActiveTab(editor);

                inboxView.getController().moveOrDeleteMessage(message);

                t.waitForMs(750, function() {

                    let message_new =  selectMessage(panel, 0);

                    t.expect(message.getCompoundKey().toObject()).not.toEqual(message_new.getCompoundKey().toObject());

                    panel.destroy();
                    panel = null;
                });

            });
        });
    });




    t.it("app-cn_mail#71 - 3", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor, editorVm, inboxView,
            CK, cnhref;


        t.waitForMs(750, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));


            t.waitForMs(750, function() {


                let message = selectMessage(panel, 0);

                editor = ctrl.showMailEditor(message.getCompoundKey(), 'edit');
                editorVm = editor.getViewModel();

                t.waitForMs(750, function() {


                    cnhref = editor.cn_href;

                    editorVm.get('messageDraft').set('subject', 'abc');

                    editor.getController().configureAndStartSaveBatch();

                    t.waitForMs(750, function() {

                        inboxView = panel.down('cn_mail-mailinboxview');
                        CK        = editorVm.get('messageDraft').getCompoundKey();

                        panel.setActiveTab(inboxView);


                        message = selectMessage(panel, 0, CK, t);


                        inboxView.getController().moveOrDeleteMessage(message);

                        t.waitForMs(750, function() {

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



    t.it("app-cn_mail#71 - 4", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor, editorVm,
            inboxView = panel.down('cn_mail-mailinboxview'),
            CK;


        t.waitForMs(TIMEOUT, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));




            t.waitForMs(TIMEOUT, function() {


                let message = selectMessage(panel, 0);

                editor = ctrl.showMailEditor(message.getCompoundKey(), 'edit');
                editorVm = editor.getViewModel();

                t.waitForMs(TIMEOUT, function() {


                    editorVm.get('messageDraft').set('subject', 'abc');

                    editor.getController().configureAndStartSaveBatch();

                    t.waitForMs(TIMEOUT, function() {

                        inboxView.getController().moveOrDeleteMessage(editorVm.get('messageDraft'));

                        t.waitForMs(TIMEOUT, function() {

                            // set active tab so Livegrid rendering
                            //  can be reinitialized and no further error is thrown
                            // when trying to access it's nodeCache.
                            panel.setActiveTab(inboxView);
                            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 4, 'INBOX.Trash', t));



                            t.waitForMs(TIMEOUT, function() {

                                let newmessage = selectMessage(panel, 0, editorVm.get('messageDraft').getCompoundKey(), t);

                                CK = newmessage.getCompoundKey();

                                selectMessage(panel, 1);

                                t.expect(newmessage.getCompoundKey().toObject()).toEqual(
                                    editorVm.get('messageDraft').getCompoundKey().toObject()
                                );

                                let ictrl = inboxView.getController(),
                                    md = editorVm.get('messageDraft');


                                ictrl.moveOrDeleteMessage(md, true, editor);

                                t.waitForMs(TIMEOUT, function() {

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


    t.it("app-cn_mail#75", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor, editorVm,
            inboxView = panel.down('cn_mail-mailinboxview'),
            CK;


        t.waitForMs(TIMEOUT, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));


            t.waitForMs(TIMEOUT, function() {

                let message;
                for (let i = 0; i < 100; i++) {
                    message = selectMessage(panel, i);
                    if (message.get('hasAttachments')) {
                        break;
                    }
                }


                CK = message.getCompoundKey();

                editor   = ctrl.showMailEditor(CK, 'edit');
                editorVm = editor.getViewModel();

                t.waitForMs(TIMEOUT, function() {


                    editor.getController().configureAndStartSaveBatch();

                    t.waitForMs(TIMEOUT, function() {

                        panel.setActiveTab(inboxView);

                        inboxView.getController().moveOrDeleteMessage(message);

                        t.waitForMs(TIMEOUT, function() {

                            panel.setActiveTab(editor);

                            t.waitForMs(TIMEOUT, function() {
                                t.isntCalled('onMailMessageSaveOperationException', editor.getController());
                                t.isCalled('onMailMessageSaveComplete', editor.getController());

                                editor.getController().configureAndStartSaveBatch();


                                t.waitForMs(TIMEOUT, function() {
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


    let testAppCnMail63 = function(t, editMode) {
        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor, editorVm,
            inboxView = panel.down('cn_mail-mailinboxview'),
            CK;


        t.waitForMs(TIMEOUT, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 2, 'INBOX.Junk', t));



            t.waitForMs(TIMEOUT, function() {

                let message = selectMessage(panel, 0);

                editor   = ctrl.showMailEditor(message.getCompoundKey(), editMode);
                editorVm = editor.getViewModel();

                t.waitForMs(TIMEOUT, function() {

                    t.expect(Ext.util.History.getToken()).toContain(editMode + "/" + message.getCompoundKey().toArray().join('/'));
                    editor.getController().configureAndStartSaveBatch();

                    t.waitForMs(TIMEOUT, function() {

                        t.expect(Ext.util.History.getToken()).toContain("edit/" + editorVm.get('messageDraft').getCompoundKey().toArray().join('/'));

                        panel.setActiveTab(inboxView);

                        inboxView.getController().moveOrDeleteMessage(message);

                        t.waitForMs(TIMEOUT, function() {

                            CK = message.getCompoundKey();

                            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));


                            t.waitForMs(TIMEOUT, function() {


                                message = selectMessage(panel, 0);

                                inboxView.getController().moveOrDeleteMessage(message);


                                t.waitForMs(TIMEOUT, function() {
                                    t.expect(message.get('mailFolderId')).toBe("INBOX.Trash");
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


    t.it("app-cn_mail#63 - replyAll", function(t) {
        testAppCnMail63(t, 'replyAll');
    });


    t.it("app-cn_mail#63 - replyTo", function(t) {
        testAppCnMail63(t, 'replyTo');
    });

    t.it("app-cn_mail#63 - forward", function(t) {
        testAppCnMail63(t, 'forward');
    });


    t.it("app-cn_mail#78 - composed draft ", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor = ctrl.showMailEditor('sffss', 'compose'),
            editorVm = editor.getViewModel(),
            CK, md, inboxView = panel.down('cn_mail-mailinboxview');

        t.expect(editor).toBeTruthy();

        t.waitForMs(TIMEOUT, function() {

            editorVm = editor.getViewModel();

            md = editorVm.get('messageDraft');
            md.set('subject', 'foo');
            md.set('to', 'demo@conjoon.org');
            t.expect(md.get('draft')).toBe(true);

            editor.getController().configureAndStartSaveBatch(true);

            t.waitForMs(TIMEOUT + 1000, function() {

                CK = md.getCompoundKey();

                t.expect(md.get('mailFolderId')).toBe("INBOX.Sent Messages");
                t.expect(md.getCompoundKey().toLocalId()).toContain("INBOX.Sent Messages");

                panel.setActiveTab(inboxView);

                selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 1, 'INBOX.Sent Messages', t));


                t.waitForMs(TIMEOUT, function() {
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
                    t.expect(msg.get('draft')).toBe(false);

                    panel.destroy();
                    panel = null;

                });
            });

        });
    });


    t.it("app-cn_mail#78 - loaded draft ", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor,
            CK, md, inboxView = panel.down('cn_mail-mailinboxview');


        t.waitForMs(TIMEOUT, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));

            t.waitForMs(TIMEOUT, function() {

                let msg = selectMessage(panel, 0),
                    OLDCK = msg.getCompoundKey();

                editor = ctrl.showMailEditor(OLDCK, 'edit'),
                editorVm = editor.getViewModel()


                t.waitForMs(TIMEOUT, function() {

                    md = editorVm.get('messageDraft');
                    md.set('subject', 'foo');
                    t.expect(md.get('draft')).toBe(true);

                    editor.getController().configureAndStartSaveBatch(true);

                    t.waitForMs(TIMEOUT + 1000, function() {

                        CK = md.getCompoundKey();

                        let livegrid = inboxView.getController().getLivegrid();

                        t.expect(livegrid.getRecordByCompoundKey(OLDCK)).toBeFalsy();
                        t.expect(livegrid.getRecordByCompoundKey(CK)).toBeFalsy();

                        selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 1, 'INBOX.Sent Messages', t));

                        t.waitForMs(TIMEOUT, function() {
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
                            t.expect(msg.get('draft')).toBe(false);

                            panel.destroy();
                            panel = null;
                        });
                    });

                });

            });
        });
    });


    t.it("app-cn_mail#79", function(t) {

        let panel = createMailDesktopView(),
            ctrl = panel.getController(),
            REDIRECTED = 0;


        ctrl.getCompoundKeyFromInboxMessageView = function() {
            return {
                toArray : function(){return ['foo'];}
            };
        }

        ctrl.redirectTo = function() {
            REDIRECTED++;
        }

        t.expect(ctrl.redirectToEditorFromInboxMessageView('edit')).toBe('cn_mail/message/edit/foo');
        t.expect(ctrl.redirectToEditorFromInboxMessageView('replyTo')).toBe('cn_mail/message/replyTo/foo');
        t.expect(ctrl.redirectToEditorFromInboxMessageView('replyAll')).toBe('cn_mail/message/replyAll/foo');
        t.expect(ctrl.redirectToEditorFromInboxMessageView('forward')).toBe('cn_mail/message/forward/foo');

        t.expect(REDIRECTED).toBe(4);

        panel.destroy();
        panel = null;
    });


    t.it("app-cn_mail#80", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor = ctrl.showMailEditor('sffss', 'compose'),
            editorVm = editor.getViewModel(),
            CK;

        t.expect(editor).toBeTruthy();

        t.waitForMs(750, function() {

            panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 1, 'INBOX.Sent Messages', t));

            t.waitForMs(750, function() {
                panel.setActiveTab(editor);

                editorVm.get('messageDraft').set('subject', 'foo');
                editorVm.get('messageDraft').set('to', 'foo');

                editor.getController().configureAndStartSaveBatch(true);

                t.waitForMs(1750, function () {

                    CK = editorVm.get('messageDraft').getCompoundKey();

                    panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                    selectMessage(panel, 0, CK, t);

                    editor = ctrl.showMailEditor(CK, 'replyTo');

                    t.waitForMs(750, function () {

                        editor.getController().configureAndStartSaveBatch();

                        t.waitForMs(750, function () {
                            let mdck = editor.getViewModel().get('messageDraft').getCompoundKey();

                            t.expect(mdck.toObject()).toBeTruthy();

                            panel.destroy();
                            panel = null;
                        });
                    });
                });

            });
        });
    });




    t.it("app-cn_mail#82", function(t) {

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController(),
            editor,
            editorVm,
            CK,
            inboxView;

        t.waitForMs(750, function() {

            inboxView = panel.setActiveTab(panel.down('cn_mail-mailinboxview'));
            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX', t));

            t.waitForMs(750, function() {

                let msg = selectMessage(panel, 0);

                CK = msg.getCompoundKey();

                editor = ctrl.showMailEditor(CK, 'replyTo');


                t.waitForMs(750, function() {
                    t.expect(editor.destroyed).toBeFalsy();
                    inboxView.getController().moveOrDeleteMessage(editor.getViewModel().get('messageDraft'), true, editor);

                    t.waitForMs(750, function() {

                        t.expect(editor.destroyed).toBe(true);

                        panel.destroy();
                        panel = null;
                    });

                });


            });
        });
    });


    t.it("onMailFolderTreeStoreLoad()", function(t) {

        let PROT = conjoon.cn_mail.view.mail.MailDesktopViewController.prototype,
            onMailFolderTreeStoreLoad = PROT.onMailFolderTreeStoreLoad;

        PROT.onMailFolderTreeStoreLoad = Ext.emptyFn;

        let panel  = createMailDesktopView(),
            ctrl   = panel.getController();


        t.waitForMs(TIMEOUT, function() {

            PROT.onMailFolderTreeStoreLoad = onMailFolderTreeStoreLoad;

            let store = panel.down('cn_mail-mailfoldertree').getStore(),
                root  = store.getRoot();

            let records = [root.childNodes[0]];
            t.expect(ctrl.onMailFolderTreeStoreLoad(store, records)).toBe(null);

            records = [root.childNodes[0].childNodes[0]];
            t.expect(ctrl.onMailFolderTreeStoreLoad(store, records)).not.toBe(null);

            t.expect(ctrl.onMailFolderTreeStoreLoad(store, records)).toBe(
                ctrl.defaultAccountInformations
            );

            ctrl.defaultAccountInformations = "TEST";
            // will return the same if called multiple times
            t.expect(ctrl.onMailFolderTreeStoreLoad(store, records)).toBe("TEST");

            // will throw if no draft node found
            ctrl.defaultAccountInformations = null;
            root.childNodes[0].childNodes[3].set('cn_folderType', 'foo');

            let exc, e;
            try{ctrl.onMailFolderTreeStoreLoad(store, records);}catch(e){exc = e};
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("no suitable");

            panel.destroy();
            panel = null;
        });

    });


    t.it("app-cn_mail#94", function(t) {

        let panel  = createMailDesktopView(),
            inboxView = panel.down('cn_mail-mailinboxview'),
            ctrl   = panel.getController(),
            editor = ctrl.showMailEditor('sffss', 'compose'),
            editorVm = editor.getViewModel(),
            CK, view;

        t.expect(editor).toBeTruthy();

        t.waitForMs(TIMEOUT, function() {

            selectMailFolder(panel, getChildAt(panel, 'mail_account', 3, 'INBOX.Drafts'))

            t.waitForMs(TIMEOUT, function() {

                editorVm.get('messageDraft').set('subject', 'foo');
                editor.getController().configureAndStartSaveBatch();

                t.waitForMs(TIMEOUT, function() {

                    t.expect(editorVm.get('messageDraft').get('mailAccountId')).toBe('dev_sys_conjoon_org');

                    CK = editorVm.get('messageDraft').getCompoundKey();
                    editor.close();

                    let livegrid = inboxView.getController().getLivegrid();

                    t.expect(livegrid.getRecordByCompoundKey(CK)).toBeFalsy();

                    panel.destroy();
                    panel = null;

                });
            });

        });
    });


    t.it("app-cn_mail#95", function(t) {

        let panel  = createMailDesktopView(),
            message,
            inboxView = panel.down('cn_mail-mailinboxview'),
            ctrl   = panel.getController(),
            editor, editorVm,
            CK, gridRec;

        // select folder
        t.waitForMs(TIMEOUT, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX'))

            // select draft
            t.waitForMs(TIMEOUT, function() {

                let i = 0, len = 20;
                for (let i = 0, len = 20; i < 20; i++) {
                    message = selectMessage(panel, i);
                    if (message.get('draft')) {
                        break;
                    }
                }
                t.expect(message).toBeDefined();
                t.expect(message.get('draft')).toBe(true);

                CK       = message.getCompoundKey();
                editor   = ctrl.showMailEditor(CK, 'edit');
                editorVm = editor.getViewModel();

                // open draft and edit subject
                t.waitForMs(TIMEOUT, function() {

                    editorVm.get('messageDraft').set('subject', 'foo');
                    editor.getController().configureAndStartSaveBatch();

                    // test subject changes in grid
                    t.waitForMs(TIMEOUT, function () {

                        panel.setActiveItem(inboxView);

                        let livegrid = inboxView.getController().getLivegrid();
                        gridRec      = livegrid.getRecordByCompoundKey(CK)
                        t.expect(gridRec).toBeTruthy();
                        t.expect(gridRec.get('subject')).toBe("foo");

                        // select other folder
                        selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts'))
                        t.waitForMs(TIMEOUT, function() {

                            // back to previous folder
                            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX'))

                            t.waitForMs(TIMEOUT, function () {

                                // make sure rec is still there
                                gridRec = livegrid.getRecordByCompoundKey(CK)
                                t.expect(gridRec).toBeTruthy();
                                t.expect(gridRec.get('subject')).toBe("foo");

                                // edit subject again
                                panel.setActiveItem(editor);
                                editorVm.get('messageDraft').set('subject', 'bar');
                                editor.getController().configureAndStartSaveBatch();

                                t.waitForMs(TIMEOUT, function () {

                                    panel.setActiveItem(inboxView);

                                    gridRec = livegrid.getRecordByCompoundKey(CK)
                                    t.expect(gridRec).toBeTruthy();
                                    t.expect(gridRec.get('subject')).toBe("bar");

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



});})});});