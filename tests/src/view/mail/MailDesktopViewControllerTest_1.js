/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe('conjoon.cn_mail.view.mail.MailDesktopViewControllerTest', function(t) {

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
        selectMessage = function(panel, storeAt) {

            let message = panel.down('cn_mail-mailmessagegrid').getStore().getAt(storeAt);

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
        };

    let panel;

    t.beforeEach(function() {
        conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.resetAll();
    });

t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function () {
t.requireOk('conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey', function () {

    const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });


    t.it("onBeforeMessageItemDelete() - event registered", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );
        Ext.ux.ajax.SimManager.init({
            delay : 1
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        t.waitForMs(750, function() {
            t.isCalledOnce('onBeforeMessageItemDelete', viewController);
            panel.down('cn_mail-mailinboxview').fireEvent(
                'cn_mail-beforemessageitemdelete', panel.down('cn_mail-mailinboxview'), getRecordCollection()[0]);

            t.waitForMs(750, function() {
                panel.destroy();
                panel = null;
            });
        });

    });


    t.it("onBeforeMessageItemDelete()", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });


        t.waitForMs(750, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX', t));


            t.waitForMs(751, function(){

                let DRAFTMESSAGE = selectMessage(panel, 1),
                    DRAFTCK      = DRAFTMESSAGE.getCompoundKey(),
                    compoundKey = getRecordCollection()[0].getCompoundKey(),
                    compoundKey2 = getRecordCollection()[1].getCompoundKey(),
                    rec       = conjoon.cn_mail.model.mail.message.MessageItem.loadEntity(
                        compoundKey
                    ),
                    inboxView = panel.down('cn_mail-mailinboxview');

                t.waitForMs(752, function() {

                    let view      = viewController.showMailMessageViewFor(compoundKey),
                        edit      = viewController.showMailEditor(compoundKey, 'edit'),
                        replyAll  = viewController.showMailEditor(compoundKey, 'replyAll'),
                        replyTo   = viewController.showMailEditor(compoundKey, 'replyTo'),
                        forward   = viewController.showMailEditor(compoundKey, 'forward'),
                        DRAFTVIEW =  viewController.showMailMessageViewFor(DRAFTCK, 'edit'),
                        cmpEdit  =  viewController.showMailEditor(compoundKey2, 'replyTo');

                    let isActive = function(views) {
                        for (let i in views) {
                            if (panel.getActiveTab() === views[i]) {
                                return true;
                            }
                        }
                    };


                    let ibc = panel.down('cn_mail-mailinboxview').getController();
                    ibc.moveOrDeleteMessage(DRAFTMESSAGE);


                    t.isCalled('showMessageCannotBeDeletedWarning', panel);

                    panel.setActiveTab(inboxView);

                    t.waitForMs(1753, function() {


                        t.expect(viewController.onBeforeMessageItemDelete(inboxView, DRAFTMESSAGE)).toBe(false);

                        t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                        t.expect(isActive([view, edit, replyAll, replyTo, forward])).toBe(true);

                        t.waitForMs(754, function() {
                            forward.close();

                            t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                            t.expect(isActive([view, edit, replyAll, replyTo])).toBe(true);

                            t.waitForMs(755, function() {

                                t.expect(
                                    viewController.onBeforeMessageItemDelete(
                                        inboxView, cmpEdit.getViewModel().get('messageDraft'), cmpEdit
                                    )).toBe(true);
                                cmpEdit.close();


                                replyTo.close();

                                t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                                t.expect(isActive([view, edit, replyAll])).toBe(true);

                                t.waitForMs(756, function() {
                                    replyAll.close();

                                    t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                                    t.expect(isActive([view, edit])).toBe(true);

                                    t.waitForMs(757, function() {
                                        edit.close();

                                        t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                                        t.expect(isActive([view])).toBe(true);

                                        t.waitForMs(758, function() {
                                            view.close();

                                            t.waitForMs(759, function() {
                                                t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(true);

                                                t.expect(viewController.onBeforeMessageItemDelete(inboxView, DRAFTMESSAGE)).toBe(false);

                                                DRAFTVIEW.close();

                                                t.expect(viewController.onBeforeMessageItemDelete(inboxView, DRAFTMESSAGE)).toBe(true);


                                                t.waitForMs(760, function () {
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

                });
            });
        });
    });


    t.it("onMailMessageSaveComplete() - DRAFT folder active, DRAFT created", function (t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller: viewController,
            renderTo: document.body,
            width: 800,
            height: 600
        });

        t.isCalledNTimes('add', panel.down('cn_mail-mailinboxview').getController().getLivegrid(), 1);
        t.isCalledNTimes('createItemFromDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 1);
        t.isCalledOnce('updateViewForCreatedDraft', panel.down('cn_mail-mailinboxview'));

        t.waitForMs(750, function () {

            let treeStore = panel.down('cn_mail-mailfoldertree').getStore();


            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));


            t.waitForMs(1250, function () {

                let editor = viewController.showMailEditor(2253236, 'compose');
                let myValue = Ext.id();

                t.waitForMs(750, function () {

                    t.expect(editor.getViewModel().get('messageDraft').get('mailAccountId')).toBeTruthy();
                    t.expect(editor.getViewModel().get('messageDraft').get('mailFolderId')).toBeTruthy();
                    editor.down('#subjectField').setValue(myValue);

                    t.waitForMs(750, function () {

                        t.click(editor.down('#saveButton'), function () {

                            panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                            let subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                            t.expect(subjectCont[0].innerHTML).toContain(myValue);

                            panel.setActiveTab(editor);

                            editor.down('#subjectField').setValue('456');

                            t.click(editor.down('#saveButton'));

                            t.waitForMs(750, function () {

                                panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                                subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                                t.expect(subjectCont[0].innerHTML).toContain('456');

                                panel.destroy();
                                panel = null;
                            });
                        });
                });
            });});
        });

    });


    t.it("onMailMessageSaveComplete() - edited data after switching folders is reflected in grid", function (t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller: viewController,
            renderTo: document.body,
            width: 800,
            height: 600
        });

        t.isCalled('add', panel.down('cn_mail-mailinboxview').getController().getLivegrid());
        t.isCalled('createItemFromDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater);


        t.waitForMs(251, function () {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));

            t.waitForMs(1252, function () {

                let editor = viewController.showMailEditor(2253236, 'compose');
                let myValue = 'ff-snafu-876';
                editor.down('#subjectField').setValue(myValue);


                t.waitForMs(753, function () {

                    t.click(editor.down('#saveButton'), function() {

                    t.waitForMs(1754, function () {

                        t.expect(editor.getViewModel().get('messageDraft').get('mailFolderId')).toBe('INBOX.Drafts');

                        panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                        let subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                        t.expect(subjectCont[0].innerHTML).toContain(myValue);

                        let rec   = panel.down('cn_mail-mailmessagegrid').getStore().getData().map[1].value[0],
                            recId = rec.getId();

                        let ctrl = panel.down('cn_mail-mailinboxview').getController(),
                            mvRec = panel.down('cn_mail-mailmessagegrid').getStore().getData().map[1].value[0];


                        ctrl.moveOrDeleteMessage(mvRec);

                        t.waitForMs(1755, function() {

                            t.expect(mvRec.get('mailFolderId')).toBe('INBOX.Trash');
                            t.expect(editor.getViewModel().get('messageDraft').get('mailFolderId')).toBe('INBOX.Trash');

                            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 4, 'INBOX.Trash', t));


                            t.waitForMs(1756, function() {

                                subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                                t.expect(subjectCont[0].innerHTML).toContain(myValue);

                                panel.setActiveTab(editor);

                                editor.down('#subjectField').setValue('uaav-456');

                                t.click(editor.down('#saveButton'), function() {

                                    t.waitForMs(1757, function() {

                                        panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                                        subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                                        t.expect(subjectCont[0].innerHTML).toContain('uaav-456');

                                        panel.setActiveTab(editor);
                                        editor.down('#subjectField').setValue('andagain');


                                        t.click(editor.down('#saveButton'), function() {

                                            t.waitForMs(1758, function() {

                                                editor.close();
                                                panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                                                subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                                                t.expect(subjectCont[0].innerHTML).toContain('andagain');

                                                panel.destroy();
                                                panel = null;


                                            });


                                        });

                                    });


                                });

                            });
                        });


                    });});
                });
            });
        });

    });




    t.it("onMailMessageSendComplete() - registered", function(t) {

        var viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
            ),
            messageDraft;

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600,
            items      : [{
                xclass : 'conjoon.cn_mail.view.mail.inbox.InboxView'
            }]
        });

        t.waitForMs(500, function() {

            let CALLED = 0;

            viewController.onMailMessageSendComplete = function() {
                CALLED++;
            }

            let editor = panel.showMailEditor('233242', 'compose');

            t.expect(CALLED).toBe(0);

            t.waitForMs(250, function() {

                editor.fireEvent('cn_mail-mailmessagesendcomplete',
                    editor,
                    Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                        subject : 'FOOBAR'
                    })
                );

                t.expect(CALLED).toBe(1);

                panel.destroy();
                panel = null;
            });

        });

    });


    t.it("onMailMessageSendComplete() - delegating to InboxView", function(t) {

        var viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
            ),
            messageDraft;

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600,
            items      : [{
                xclass : 'conjoon.cn_mail.view.mail.inbox.InboxView'
            }]
        });

        t.waitForMs(TIMEOUT, function() {


            let editor = panel.showMailEditor('233242', 'compose');
            t.isCalledOnce('updateViewForSentDraft', panel.down('cn_mail-mailinboxview'));

            t.waitForMs(TIMEOUT, function() {

                let md = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                    mailAccountId : 'foo',
                    mailFolderId : 'bar',
                    id : 'foobar',
                    subject : 'FOOBAR'
                });
                md.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody'));

                let oldM = conjoon.cn_mail.data.mail.service.MailboxService.prototype.moveMessage;

                conjoon.cn_mail.data.mail.service.MailboxService.prototype.moveMessage = Ext.emptyFn;

                editor.fireEvent('cn_mail-mailmessagesendcomplete',
                    editor,
                    md
                );

                conjoon.cn_mail.data.mail.service.MailboxService.prototype.moveMessage = oldM;
                panel.destroy();
                panel = null;

            });

        });

    });


    const testForContext = function(context, t) {
        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller: viewController,
            renderTo: document.body,
            width: 800,
            height: 600
        });

        t.isCalledNTimes('add', panel.down('cn_mail-mailinboxview').getController().getLivegrid(), 1);
        t.isCalledNTimes('createItemFromDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 1);
        t.isCalledOnce('updateViewForCreatedDraft', panel.down('cn_mail-mailinboxview'));

        t.waitForMs(750, function () {


            let folder = selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));

            t.waitForMs(1250, function () {

                let ck = '1';

                if (context != 'compose') {
                    ck = createMessageItem(1, folder.get('id')).getCompoundKey();
                }

                let editor = viewController.showMailEditor(ck, context);
                let myValue = Ext.id();

                t.waitForMs(1250, function () {
                    editor.down('#subjectField').setValue(myValue);


                    t.waitForMs(750, function () {

                        t.click(editor.down('#saveButton'), function() {

                            t.waitForMs(1750, function () {

                                panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                                let subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                                t.expect(subjectCont[0].innerHTML).toContain(myValue);

                                panel.setActiveTab(editor);

                                editor.down('#subjectField').setValue('456');

                                t.click(editor.down('#saveButton'), function() {

                                    t.waitForMs(750, function () {

                                        panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                                        subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                                        t.expect(subjectCont[0].innerHTML).toContain('456');

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

    };


    t.it("onMailMessageSaveComplete() - INBOX active, DRAFT created replyTo", function (t) {
        testForContext('replyTo', t);
    });

    t.it("onMailMessageSaveComplete() - INBOX active, DRAFT created replyAll", function (t) {
        testForContext('replyAll', t);
    });

    t.it("onMailMessageSaveComplete() - INBOX active, DRAFT created forward", function (t) {
        testForContext('forward', t);
    });

    t.it("onMailMessageSaveComplete() - INBOX active, DRAFT created compose", function (t) {
        testForContext('compose', t);
    });



    t.it("conjoon/app-cn_mail#55", function(t) {
        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller: viewController,
            renderTo: document.body,
            width: 800,
            height: 600
        });

        let inboxView       = panel.down('cn_mail-mailinboxview'),
            mailFolderTree  = panel.down('cn_mail-mailfoldertree'),
            messageGrid     = panel.down('cn_mail-mailmessagegrid');

        t.waitForMs(250, function () {

            let draftFolder = getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t),
                inboxFolder = getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX', t);

            t.expect(draftFolder.get('folderType')).toBe('DRAFT');
            t.expect(inboxFolder.get('folderType')).toBe('INBOX');

            selectMailFolder(panel, inboxFolder);

            t.waitForMs(1751, function () {

                let messageItem = messageGrid.getStore().getAt(0);
                messageItem.set('draft', false);

                messageGrid.getSelectionModel().select(messageItem);

                t.waitForMs(1752, function() {

                    let editor = viewController.showMailEditor(messageItem.getCompoundKey(), 'replyAll');

                    t.waitForMs(1753, function() {

                        panel.setActiveTab(inboxView);

                        selectMailFolder(panel, draftFolder);

                        t.waitForMs(1754, function() {

                            panel.setActiveTab(editor);

                            t.click(editor.down('#saveButton'));

                            t.waitForMs(1755, function() {

                                t.click(editor.down('#sendButton'));

                                t.waitForMs(1756, function() {
                                    panel.destroy();
                                    panel = null;
                                });

                            });


                        });


                    })

                });



            });
        });
    });


    t.it("deleting a message draft  - picked from DRAFTS", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller: viewController,
            renderTo: document.body,
            width: 600,
            height: 400
        });


        let editor, draft;


        t.waitForMs(750, function() {

            let mailFolder =  selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));

            t.expect(mailFolder.get('folderType')).toBe('DRAFT');

            t.waitForMs(751, function(){

                // intentionally not selected
                draft = panel.down('cn_mail-mailmessagegrid').getStore().getAt(0);
                t.expect(draft.get('mailFolderId')).toBe(mailFolder.get('id'));
                editor = viewController.showMailEditor(draft.getCompoundKey(), 'edit');
                t.expect(panel.down('cn_mail-mailmessagegrid').getStore().getAt(0).getCompoundKey().equalTo(draft.getCompoundKey())).toBe(true);

                t.waitForMs(752, function() {

                    draft = editor.getMessageDraft();

                    panel.down('cn_mail-mailinboxview').getController().moveOrDeleteMessage(
                        draft,
                        false,
                        editor
                    );

                    t.waitForMs(1753, function() {

                        let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                        t.click(yesButton[0], function() {

                            editor.close();

                            t.expect(draft.get('cn_deleted')).toBeUndefined();
                            t.expect(draft.get('cn_moved')).toBeUndefined();

                            t.expect(draft.get('mailFolderId')).toBe('INBOX.Trash');

                            t.expect(panel.down('cn_mail-mailmessagegrid').getStore().getAt(0)
                                          .getCompoundKey().equalTo(draft.getCompoundKey())).toBe(false);

                            let trashMailFolder = selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 4, 'INBOX.Trash', t));
                            t.expect(trashMailFolder.get('folderType')).toBe('TRASH');

                            t.waitForMs(1755, function() {

                                let movedRec = panel.down('cn_mail-mailinboxview').getController().getLivegrid().getRecordByCompoundKey(draft.getCompoundKey());
                                t.expect(movedRec).toBeTruthy();

                                editor = viewController.showMailEditor(movedRec.getCompoundKey(), 'edit');

                                t.waitForMs(1756, function() {

                                    draft = editor.getMessageDraft();
                                    t.expect(movedRec).toBeTruthy();

                                    panel.down('cn_mail-mailinboxview').getController().moveOrDeleteMessage(
                                        draft,
                                        false,
                                        editor
                                    );

                                    t.waitForMs(1757, function() {

                                        yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                                        t.click(yesButton[0], function() {

                                            editor.close();

                                            t.expect(draft.get('cn_deleted')).toBeUndefined();
                                            t.expect(draft.get('cn_moved')).toBeUndefined();

                                            t.expect(draft.erased).toBe(true);
                                            let removedRec =
                                                panel.down('cn_mail-mailinboxview')
                                                .getController().getLivegrid().getRecordByCompoundKey(draft.getCompoundKey());
                                            t.expect(removedRec).toBe(null);

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
        });
    });


    t.it("deleting a message draft  - composed message moved immediately to TRASH", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller: viewController,
            renderTo: document.body,
            width: 800,
            height: 600
        });


        let editor, draft;


        editor = viewController.showMailEditor('1', 'compose');

        t.waitForMs(TIMEOUT, function() {

            t.expect(panel.down('cn_mail-mailmessageeditor')).toBe(editor);

            let ctrl = panel.down('cn_mail-mailinboxview').getController(),
                md = editor.getViewModel().get('messageDraft');


            ctrl.moveOrDeleteMessage(
                md,
                true,
                editor
            );

            t.waitForMs(TIMEOUT, function() {


                editor.close();

                t.waitForMs(TIMEOUT, function() {

                    t.expect(panel.down('cn_mail-mailmessageeditor')).toBe(null);

                    panel.destroy();
                    panel = null;
                });
            });

        });

    });


    t.it("deleting a message draft  - moved immediately to TRASH", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller: viewController,
            renderTo: document.body,
            width: 800,
            height: 600
        });


        let editor, draft;


        t.waitForMs(1751, function() {

            let mailFolder = selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t));

            t.expect(mailFolder.get('folderType')).toBe('DRAFT');

            t.waitForMs(1752, function(){

                // intentionally not selected
                draft = panel.down('cn_mail-mailmessagegrid').getStore().getAt(0);
                t.expect(draft.get('mailFolderId')).toBe(mailFolder.get('id'));

                t.waitForMs(1753, function() {

                    mailFolder = selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 4, 'INBOX.Trash', t));
                    t.expect(mailFolder.get('folderType')).toBe('TRASH');

                    t.waitForMs(1754, function() {

                        t.expect(panel.down('cn_mail-mailinboxview').getController().getLivegrid().getRecordByCompoundKey(draft.getCompoundKey())).toBe(null);

                        editor = viewController.showMailEditor(draft.getCompoundKey(), 'edit');

                        t.waitForMs(1755, function() {

                            draft = editor.getMessageDraft();

                            panel.down('cn_mail-mailinboxview').getController().moveOrDeleteMessage(
                                draft,
                                false,
                                editor
                            );

                            t.waitForMs(1756, function() {

                                let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);

                                t.click(yesButton[0], function() {

                                    editor.close();

                                    t.expect(draft.get('cn_deleted')).toBeUndefined();
                                    t.expect(draft.get('cn_moved')).toBeUndefined();


                                    t.expect(panel.down('cn_mail-mailinboxview').getController().getLivegrid().getRecordByCompoundKey(
                                        draft.getCompoundKey())).not.toBe(null);

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


    t.it("onBeforeMessageItemDelete() - requestingView", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        let rec       = getRecordCollection()[0],
            ck        = rec.getCompoundKey(),
            inboxView = panel.down('cn_mail-mailinboxview');

        t.waitForMs(750, function() {

            let edit = viewController.showMailEditor(ck, 'edit');

            panel.setActiveTab(inboxView);

            t.expect(viewController.onBeforeMessageItemDelete(edit, rec, edit)).toBe(true);

            t.waitForMs(750, function () {
                panel.destroy();
                panel = null;
            });

        });
    });


    t.it("onMessageItemMove() - event registered", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        let CALLED    = 0,
            inboxView = panel.down('cn_mail-mailinboxview');

        viewController.onMessageItemMove = function() {
            CALLED++;
        };

        t.expect(CALLED).toBe(0);
        inboxView.fireEvent('cn_mail-messageitemmove');
        t.expect(CALLED).toBe(1);

        t.waitForMs(750, function () {
            panel.destroy();
            panel = null;
        });
    });


    t.it("onMessageItemMove() - toast window not shown", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        t.isntCalled('showMessageMovedInfo', panel);

        let inboxView = panel.down('cn_mail-mailinboxview'),
            prevCk = function() {
                return  conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(1, 2, 3);
            };

        viewController.onMessageItemMove(inboxView,
            {getCompoundKey : prevCk ,getPreviousCompoundKey : prevCk, getId : Ext.emptyFn},
            inboxView,
            {getCompoundKey : prevCk ,getPreviousCompoundKey : prevCk, getId : Ext.emptyFn},
            {getCompoundKey : prevCk ,getPreviousCompoundKey : prevCk, get : Ext.emptyFn, getId : Ext.emptyFn});

        t.waitForMs(750, function () {
            panel.destroy();
            panel = null;
        });
    });


    t.it("onMessageItemMove() - toast window shown", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        t.isCalled('showMessageMovedInfo', panel);

        let inboxView = panel.down('cn_mail-mailinboxview'),
            prevCk = function() {
                return  conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(1, 2, 3);
            };

        viewController.onMessageItemMove(
            inboxView,
            {getCompoundKey : prevCk ,getPreviousCompoundKey : prevCk, getId : Ext.emptyFn}, null,
            {getCompoundKey : prevCk, getPreviousCompoundKey : prevCk, getId : Ext.emptyFn},
            {getCompoundKey : prevCk, getPreviousCompoundKey : prevCk, get : Ext.emptyFn, getId : Ext.emptyFn});

        t.waitForMs(750, function () {
            panel.destroy();
            panel = null;
        });
    });


    t.it("getMessageItemsFromOpenedViews()", function(t) {

        let ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : ctrl,
            viewModel  : {
                type  : 'cn_mail-maildesktopviewmodel'
            },
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        t.expect(Ext.isArray(ctrl.getMessageItemsFromOpenedViews())).toBe(true);
        t.expect(ctrl.getMessageItemsFromOpenedViews().length).toBe(0);

        t.waitForMs(1750, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX', t));


            t.waitForMs(1750, function() {

                let recs            = getRecordCollection(),
                    editorEdit1     = ctrl.showMailEditor(recs[0].getCompoundKey(), 'edit'),
                    editorReplyTo1  = ctrl.showMailEditor(recs[0].getCompoundKey(), 'replyTo'),
                    editorReplyAll1 = ctrl.showMailEditor(recs[0].getCompoundKey(), 'replyAll'),
                    editorCompose   = ctrl.showMailEditor(13232, 'compose'),
                    editorForward1  = ctrl.showMailEditor(recs[0].getCompoundKey(), 'forward'),
                    editorEdit3     = ctrl.showMailEditor(recs[2].getCompoundKey(), 'edit'),
                    mailView        = ctrl.showMailMessageViewFor(recs[1].getCompoundKey());

                t.waitForMs(1750, function() {

                    let inboxView   = panel.setActiveTab(panel.down('cn_mail-mailinboxview')),
                        messageView = inboxView.down('cn_mail-mailmessagereadermessageview');

                    selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 2, 'INBOX.Junk', t));

                    t.waitForMs(750, function() {

                        let messageItemFromInboxView = selectMessage(panel, 1);

                        t.waitForMs(750, function() {

                            let expected = [{
                                view        : messageView,
                                messageItem : messageItemFromInboxView
                            }, {
                                view        : editorEdit1,
                                messageItem : editorEdit1.getMessageDraft()
                            }, {
                                view        : editorReplyTo1,
                                messageItem : editorReplyTo1.getMessageDraft()
                            }, {
                                view        : editorReplyAll1,
                                messageItem : editorReplyAll1.getMessageDraft()
                            }, {
                                view        : editorCompose,
                                messageItem : editorCompose.getMessageDraft()
                            }, {
                                view        : editorForward1,
                                messageItem : editorForward1.getMessageDraft()
                            }, {
                                view        : editorEdit3,
                                messageItem : editorEdit3.getMessageDraft()
                            }, {
                                view        : mailView,
                                messageItem : mailView.getMessageItem()
                            }]

                            let collection = ctrl.getMessageItemsFromOpenedViews();

                            t.expect(collection.length).toBe(8)

                            for (let i = 0, len = collection.length; i < len; i++) {

                                let item        = collection[i],
                                    view        = item.view,
                                    messageItem = item.messageItem;

                                t.expect(view).toBe(expected[i].view);
                                t.expect(messageItem).toBe(expected[i].messageItem);
                            }

                            t.waitForMs(750, function () {
                                panel.destroy();
                                panel = null;
                            });
                        });
                    });
                });
            });
        });
    });


    t.it("getMessageItemsFromOpenedViews() - messageItemId specified", function(t) {

        let ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : ctrl,
            viewModel  : {
                type  : 'cn_mail-maildesktopviewmodel'
            },
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        t.expect(Ext.isArray(ctrl.getMessageItemsFromOpenedViews())).toBe(true);
        t.expect(ctrl.getMessageItemsFromOpenedViews().length).toBe(0);

        t.waitForMs(1750, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX', t));

            t.waitForMs(1750, function() {

                let recs            = getRecordCollection(),
                    ck              = recs[0].getCompoundKey(),
                    editorEdit1     = ctrl.showMailEditor(recs[0].getCompoundKey(), 'edit'),
                    editorReplyTo1  = ctrl.showMailEditor(recs[0].getCompoundKey(), 'replyTo'),
                    editorReplyAll1 = ctrl.showMailEditor(recs[0].getCompoundKey(), 'replyAll'),
                    editorCompose   = ctrl.showMailEditor(13232, 'compose'),
                    editorForward1  = ctrl.showMailEditor(recs[0].getCompoundKey(), 'forward'),
                    editorEdit3     = ctrl.showMailEditor(recs[2].getCompoundKey(), 'edit'),
                    mailView        = ctrl.showMailMessageViewFor(recs[0].getCompoundKey());

                t.waitForMs(1750, function() {

                    let inboxView   = panel.setActiveTab(panel.down('cn_mail-mailinboxview')),
                        messageView = inboxView.down('cn_mail-mailmessagereadermessageview');

                    selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 2, 'INBOX.Junk', t));

                    t.waitForMs(750, function() {

                        let messageItemFromInboxView = selectMessage(panel, 1);

                        t.waitForMs(750, function() {

                            let expected = [{
                                view        : editorEdit1,
                                messageItem : editorEdit1.getMessageDraft()
                            },{
                                view        : mailView,
                                messageItem : mailView.getMessageItem()
                            }]


                            let collection = ctrl.getMessageItemsFromOpenedViews(ck);

                            t.expect(collection.length).toBe(2);

                            for (let i = 0, len = collection.length; i < len; i++) {

                                let item        = collection[i],
                                    view        = item.view,
                                    messageItem = item.messageItem;

                                t.expect(view).toBe(expected[i].view);
                                t.expect(messageItem).toBe(expected[i].messageItem);
                            }


                            t.waitForMs(750, function () {
                                panel.destroy();
                                panel = null;
                            });
                        });
                    });
                });
            });
        });
    });




    t.it("updateMessageItemsFromOpenedViews()", function(t) {

        let ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : ctrl,
            renderTo   : document.body,
            viewModel  : {
                type  : 'cn_mail-maildesktopviewmodel'
            },
            width      : 800,
            height     : 600
        });

        t.waitForMs(1750, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX', t));


            t.waitForMs(1750, function() {
                t.isCalledNTimes('getMessageItemsFromOpenedViews', ctrl, 3);

                let field = 'mailFolderId',
                    id    = '1',
                    value = '15';

                let recs            = getRecordCollection(),
                    ck              = recs[0].getCompoundKey(),
                    editorEdit1     = ctrl.showMailEditor(ck, 'edit'),
                    editorReplyTo1  = ctrl.showMailEditor(ck, 'replyTo'),
                    editorReplyAll1 = ctrl.showMailEditor(ck, 'replyAll'),
                    editorCompose   = ctrl.showMailEditor(13232, 'compose'),
                    editorForward1  = ctrl.showMailEditor(ck, 'forward'),
                    editorEdit3     = ctrl.showMailEditor(recs[2].getCompoundKey(), 'edit'),
                    mailView        = ctrl.showMailMessageViewFor(ck);

                let newCk = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(
                    ck.getMailAccountId(), "15", ck.getId()
                );

                t.waitForMs(1750, function() {

                    let inboxView   = panel.setActiveTab(panel.down('cn_mail-mailinboxview')),
                        messageView = inboxView.down('cn_mail-mailmessagereadermessageview');

                    selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 2, 'INBOX.Junk', t));


                    t.waitForMs(750, function() {

                        let messageItemFromInboxView = selectMessage(panel, 1);

                        t.waitForMs(750, function() {

                            let coll = ctrl.getMessageItemsFromOpenedViews(),
                                count = 0, refs = {}, check = [];
                            for (let i = 0, len = coll.length; i < len; i++) {
                                let messageItem = coll[i].messageItem;
                                if (messageItem.isCompoundKeyConfigured() && messageItem.getCompoundKey().equalTo(ck)) {
                                    count++;
                                    refs[messageItem.internalId] = messageItem;
                                    check.push(messageItem);
                                    t.expect(messageItem.get(field)).not.toBe(value);
                                }
                            }
                            t.expect(count).toBe(2);
                            count = 0;

                            ctrl.updateMessageItemsFromOpenedViews(ck, field, value);

                            coll = ctrl.getMessageItemsFromOpenedViews();
                            for (let i = 0, len = coll.length; i < len; i++) {
                                let messageItem = coll[i].messageItem;
                                if (messageItem.isCompoundKeyConfigured() && messageItem.getCompoundKey().equalTo(newCk)) {
                                    count++;
                                    t.expect(messageItem.get(field)).toBe(value);
                                    t.expect(messageItem.dirty).toBe(false);
                                    t.expect(refs[messageItem.internalId]).toBe(messageItem);
                                    t.expect(check[count-1]).toBe(messageItem);
                                    delete refs[messageItem.internalId];
                                }
                            }
                            t.expect(count).toBe(2);


                            t.waitForMs(750, function () {
                                panel.destroy();
                                panel = null;
                            });
                        });
                    });
                });
            });
        });
    });



    t.it("updateMessageItemsFromOpenedViews() - exception", function(t) {

        let ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : ctrl,
            renderTo   : document.body,
            viewModel  : {
                type  : 'cn_mail-maildesktopviewmodel'
            },
            width      : 800,
            height     : 600
        });

        t.waitForMs(1750, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX', t));

            let field = 'foo',
                id    = '1',
                value = '15',
                exc, e;

            t.waitForMs(1750, function() {

                let recs            = getRecordCollection(),
                    ck              = recs[0].getCompoundKey(),
                    editorEdit1     = ctrl.showMailEditor(ck, 'edit'),
                    editorReplyTo1  = ctrl.showMailEditor(ck, 'replyTo'),
                    editorReplyAll1 = ctrl.showMailEditor(ck, 'replyAll'),
                    editorCompose   = ctrl.showMailEditor(13232, 'compose'),
                    editorForward1  = ctrl.showMailEditor(ck, 'forward'),
                    editorEdit3     = ctrl.showMailEditor(recs[2].getCompoundKey(), 'edit'),
                    mailView        = ctrl.showMailMessageViewFor(ck);

                t.waitForMs(1750, function() {
                    try {ctrl.updateMessageItemsFromOpenedViews(ck, field, value)}catch(e){exc = e};
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toBeDefined();
                    t.expect(exc.msg.toLowerCase()).toContain("not defined in the model");

                    t.waitForMs(750, function () {
                        panel.destroy();
                        panel = null;
                    });
                });
            });
        });
    });



    t.it("onMessageItemMove() - updateMessageItemsFromOpenedViews() / updateHistoryForMessageRelatedView() called", function(t) {

        let ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : ctrl,
            renderTo   : document.body,
            viewModel  : {
                type  : 'cn_mail-maildesktopviewmodel'
            },
            width      : 800,
            height     : 600
        });

        let CK,
            FIELD,
            VALUE,
            PREVMOCKCK = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor('a', 'b', 'c');;
            COLLS = [{view : {}, messageItem : {}}];

        ctrl.getMessageItemsFromOpenedViews = function() {
            return COLLS;
        };

        ctrl.updateHistoryForMessageRelatedView = function(panel, messageItem) {
            panel.CALLED = true;
        };

        ctrl.updateMessageItemsFromOpenedViews = function(ck, field, value) {
            CK    = ck;
            FIELD = field;
            VALUE = value;
        };

        t.isCalled('showMessageMovedInfo', panel);

        let inboxView = panel.down('cn_mail-mailinboxview');

        ctrl.onMessageItemMove(
            inboxView,
            {
                getCompoundKey         : function(){return PREVMOCKCK;},
                getPreviousCompoundKey : function(){return PREVMOCKCK;}

            },
            null,
            {},
            {
                getId : function(){return 'INBOX'},
                get : function() {return 'INBOX'}
            }
        );

        t.expect(CK.toLocalId()).toBe('a-b-c');
        t.expect(FIELD).toBe('mailFolderId');
        t.expect(VALUE).toBe('INBOX');

        t.expect(COLLS.length).toBe(1);
        t.expect(COLLS[0].view.CALLED).toBe(true);

        t.waitForMs(750, function () {
            panel.destroy();
            panel = null;
        });
    });


});})});