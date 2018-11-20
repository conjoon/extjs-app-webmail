/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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

    const createKey = function(id1, id2, id3) {
            return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
        },
        getMessageItemAt = function(messageIndex) {
            return conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);
        },
        createKeyForExistingMessage = function(messageIndex){
            let item = getMessageItemAt(messageIndex);

            let key = createKey(
                item.mailAccountId, item.mailFolderId, item.id
            );

            return key;
        },
        selectMailFolder = function(panel, storeAt, shouldBeId, t) {

            let folder = panel.down('cn_mail-mailfoldertree').getStore().getAt(storeAt);

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
                t.expect(message.getCompoundKey().equalTo(shouldEqualToCK)).toBe(true);
            }

            panel.down('cn_mail-mailmessagegrid').getSelectionModel()
                .select(message);



            return message;
        },
        createMessageItem = function(index, mailFolderId) {

            index = index === undefined ? 1 : index;

            let mi = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(index);

            if (mailFolderId) {
                let i = index >= 0 ? index : 0, upper = 10000;

                for (; i <= upper; i++) {
                    mi = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(i);
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

    let panel;


t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.folder.MailFolderSim', function () {
// place AttachmentSim before MessageItemSim due to similiar regex
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.AttachmentSim', function () {
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', function () {
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageDraftSim', function () {
t.requireOk('conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey', function () {

    const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });


    t.it("showMailMessageViewFor() - app-cn_mail#64", function(t) {

        let panel = createMailDesktopView(),
            ctrl  = panel.getController(),
            CK    = getRecordCollection()[0].getCompoundKey();

        t.expect(ctrl.showMailMessageViewFor(CK)).toBeTruthy();

        t.waitForMs(750, function() {

            panel.destroy();
            panel = null;

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

            selectMailFolder(panel, 4, 'INBOX.Drafts', t);

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

            selectMailFolder(panel, 4, 'INBOX.Drafts', t);

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

            selectMailFolder(panel, 4, 'INBOX.Drafts', t);



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


        t.waitForMs(750, function() {

            selectMailFolder(panel, 4, 'INBOX.Drafts', t);



            t.waitForMs(750, function() {


                let message = selectMessage(panel, 0);

                editor = ctrl.showMailEditor(message.getCompoundKey(), 'edit');
                editorVm = editor.getViewModel();

                t.waitForMs(750, function() {


                    editorVm.get('messageDraft').set('subject', 'abc');

                    editor.getController().configureAndStartSaveBatch();

                    t.waitForMs(750, function() {

                        inboxView.getController().moveOrDeleteMessage(editorVm.get('messageDraft'));

                        t.waitForMs(750, function() {

                            // set active tab so Livegrid rendering
                            //  can be reinitialized and no further error is thrown
                            // when trying to access it's nodeCache.
                            panel.setActiveTab(inboxView);
                            selectMailFolder(panel, 5, 'INBOX.Trash', t);


                            t.waitForMs(750, function() {

                                let newmessage = selectMessage(panel, 0, editorVm.get('messageDraft').getCompoundKey(), t);

                                CK = newmessage.getCompoundKey();

                                selectMessage(panel, 1);

                                t.expect(newmessage.getCompoundKey().toObject()).toEqual(
                                    editorVm.get('messageDraft').getCompoundKey().toObject()
                                );

                                let ictrl = inboxView.getController(),
                                    md = editorVm.get('messageDraft');


                                ictrl.moveOrDeleteMessage(md, true, editor);

                                t.waitForMs(750, function() {

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


});})});});});});