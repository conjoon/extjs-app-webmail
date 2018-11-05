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

describe('conjoon.cn_mail.view.mail.MailDesktopViewControllerTest', function(t) {

    const selectMailFolder = function(panel, storeAt) {

            let folder = panel.down('cn_mail-mailfoldertree').getStore().getAt(storeAt);

            panel.down('cn_mail-mailfoldertree').getSelectionModel()
                .select(folder);

            return folder;

        },
        selectMessage = function(panel, storeAt) {

            let message = panel.down('cn_mail-mailmessagegrid').getStore().getAt(storeAt);

            panel.down('cn_mail-mailmessagegrid').getSelectionModel()
                .select(message);

            return message;
        },
        getRecordCollection = function () {
            return [
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id: '1',
                    mailFolderId: 1,
                    mailAccountId : 1
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id: 2,
                    mailFolderId: 1,
                    mailAccountId : 2
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id: 3,
                    mailFolderId: 2,
                    mailAccountId : 3
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id: 4,
                    mailFolderId: 2,
                    mailAccountId : 4
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id: 5,
                    mailFolderId: 2,
                    mailAccountId : 5
                })
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


    t.it("createMessageDraftConfig()", function(t) {

        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        ), exc, e, tests, test;

        t.isInstanceOf(ctrl.createMessageDraftConfig(2), conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig);
        t.isInstanceOf(ctrl.createMessageDraftConfig("jhkjhkj"), conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig);

        tests = [{
            value    : 'mailto:test@domain.tld',
            expected : {to : [{name : 'test@domain.tld', address : 'test@domain.tld'}], seen : true, draft : true, recent : false, flagged : false, answered : false}
        }, {
            value    : 'mailto:',
            expected : {seen : true, draft : true, recent : false, flagged : false, answered : false}
        }, {
            value    : 'maito:',
            expected : {seen : true, draft : true, recent : false, flagged : false, answered : false}
        },{
            value    : 'mailto%3Atest1@domain.tld',
            expected :{to : [{name : 'test1@domain.tld', address : 'test1@domain.tld'}], seen : true, draft : true, recent : false, flagged : false, answered : false}
        }, {
            value    : 'mailto%3Aaddress1@domain1.tld1,address2@domain2.tld2?subject=registerProtocolHandler()%20FTW!&body=Check%20out%20what%20I%20learned%20at%20http%3A%2F%2Fupdates.html5rocks.com%2F2012%2F02%2FGetting-Gmail-to-handle-all-mailto-links-with-registerProtocolHandler%0A%0APlus%2C%20flawless%20handling%20of%20the%20subject%20and%20body%20parameters.%20Bonus%20from%20RFC%202368!',
            expected : {
                to          : [{name : 'address1@domain1.tld1', address : 'address1@domain1.tld1'}, {name : 'address2@domain2.tld2', address : 'address2@domain2.tld2'}],
                subject     : 'registerProtocolHandler() FTW!',
                messageBody : {
                    textHtml : 'Check out what I learned at http://updates.html5rocks.com/2012/02/Getting-Gmail-to-handle-all-mailto-links-with-registerProtocolHandler\n\nPlus, flawless handling of the subject and body parameters. Bonus from RFC 2368!'
                },
                seen : true, draft : true, recent : false, flagged : false, answered : false
            }
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            if (!Ext.isObject(test.expected)) {
                t.expect(ctrl.createMessageDraftConfig(test.value)).toBe(test.expected);
            } else {

                t.isInstanceOf(ctrl.createMessageDraftConfig(test.value), 'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig');
                t.expect(ctrl.createMessageDraftConfig(test.value).toObject()).toEqual(
                    test.expected
                );
            }

        }

        ctrl.destroy();
    });


    t.it("getMessageViewItemId()", function(t) {

        let ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        let value = '@=jhoih78/(///)/ß ó';

        t.expect(Ext.validIdRe.test(value)).toBe(false);
        t.expect(Ext.validIdRe.test(ctrl.getMessageViewItemId(value))).toBe(true);

        ctrl.destroy();

    });


    t.it("Should create the ViewController and run basic checks", function(t) {
        var viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        t.expect(viewController.alias).toContain('controller.cn_mail-maildesktopviewcontroller');
        t.expect(viewController instanceof Ext.app.ViewController).toBe(true);

        viewController.destroy();
    });


    t.it("Should make sure that cn_mail-mailmessageitemread events are only considered " +
        "when fired as direct children of the MailDesktopView", function(t) {

        var _testMailFolders = null,
            viewController = Ext.create(
                'conjoon.cn_mail.view.mail.MailDesktopViewController'
            );

        viewController.onMessageItemRead = function(messageItemRecords) {
            _testMailFolders = messageItemRecords;
        };

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            width  : 800,
            height : 600,
            items : [{
                xclass : 'conjoon.cn_mail.view.mail.inbox.InboxView'
            }]
        });

        panel.down('cn_mail-mailinboxview').down('cn_mail-mailmessagereadermessageview')
            .fireEvent('cn_mail-mailmessageitemread', getRecordCollection());

        t.expect(_testMailFolders).toBe(null);

        var mv = panel.add({
            xclass : 'conjoon.cn_mail.view.mail.message.reader.MessageView'
        });

        mv.fireEvent('cn_mail-mailmessageitemread', getRecordCollection());

        t.expect(_testMailFolders).not.toBe(null);

        panel.destroy();
        panel = null;
    });

    t.it("Should make sure that onMailMessageGridDoubleClick works properly", function(t) {

        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
            ),
            records = getRecordCollection();

        ctrl.onMailMessageGridDoubleClick(null, records[0]);
        t.expect(Ext.util.History.getToken()).toBe(
            'cn_mail/message/read/' +
            records[0].get('mailAccountId')  + '/' +
            records[0].get('mailFolderId') +'/' +
            records[0].get('id')
        );

        ctrl.onMailMessageGridDoubleClick(null, records[1]);
        t.expect(Ext.util.History.getToken()).toBe(
            'cn_mail/message/read/' +
            records[1].get('mailAccountId')  + '/' +
            records[1].get('mailFolderId') +'/' +
            records[1].get('id')
        );

        ctrl.destroy();
        ctrl = null;
    });

    t.it("Should make sure that onTabChange works properly", function(t) {

        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        ctrl.onTabChange(null, {cn_href : 'somehash'});
        t.expect(Ext.util.History.getToken()).toBe('somehash');

        ctrl.onTabChange(null, {cn_href : 'somehash2'});
        t.expect(Ext.util.History.getToken()).toBe('somehash2');

        ctrl.destroy();
        ctrl = null;

    });

    t.it("Should make sure that showMailMessageViewFor works properly", function(t) {

            var panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
                    width    : 800,
                    height   : 600,
                    renderTo : document.body
                }),
                ctrl  = panel.getController(),
                store, rec, rec2, view;

            let exc, e;

        try {ctrl.showMailMessageViewFor('foo');}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");


        t.waitForMs(500, function() {

            panel.down('cn_mail-mailfoldertree').setSelection(panel.down('cn_mail-mailfoldertree').getStore().getAt(1));

            t.waitForMs(500, function() {

                store = panel.down('cn_mail-mailmessagegrid').getStore();
                rec   = store.getAt(0);
                rec2  = store.getAt(1);

                t.expect(rec).toBeTruthy();
                t.expect(rec2).toBeTruthy();

                t.expect(rec.get('id')).toBe(rec.get('id') + '');

                // existing records reused from store
                t.expect(panel.down('#' +ctrl.getMessageViewItemId(rec.getId()))).toBe(null);
                view = ctrl.showMailMessageViewFor(
                    MessageEntityCompoundKey.createFor(
                        rec.get('mailAccountId'), rec.get('mailFolderId'), rec.get('id')
                    )
                );
                t.expect(panel.down('#' +ctrl.getMessageViewItemId(rec.getId()))).not.toBe(null);
                t.expect(panel.getActiveTab()).toBe(panel.down('#' +ctrl.getMessageViewItemId(rec.getId())));
                t.expect(panel.getActiveTab()).toBe(view);


                t.expect(panel.down('#' +ctrl.getMessageViewItemId(rec2.getId()))).toBe(null);
                view = ctrl.showMailMessageViewFor(MessageEntityCompoundKey.createFor(rec2.get('mailAccountId'), rec2.get('mailFolderId'), rec2.get('id')));
                t.expect(panel.down('#' +ctrl.getMessageViewItemId(rec2.getId()))).not.toBe(null);
                t.expect(panel.getActiveTab()).toBe(panel.down('#' +ctrl.getMessageViewItemId(rec2.getId())));
                t.expect(panel.getActiveTab()).toBe(view);

                t.expect(panel.down('#' + ctrl.getMessageViewItemId(rec.getId()))).not.toBe(null);
                view = ctrl.showMailMessageViewFor(MessageEntityCompoundKey.createFor(rec.get('mailAccountId'), rec.get('mailFolderId'), rec.get('id')));
                t.expect(panel.getActiveTab()).toBe(panel.down('#' + ctrl.getMessageViewItemId(rec.getId())));
                t.expect(panel.getActiveTab()).toBe(view);

                // remote Loading
                let remoteRec = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(0),
                    remoteCompoundKey = MessageEntityCompoundKey.createFor(remoteRec.mailAccountId, remoteRec.mailFolderId, remoteRec.id),
                    remoteLocalId = remoteCompoundKey.toLocalId();

                t.expect(store.findExact('localId', remoteLocalId)).toBe(-1);
                t.expect(panel.down('#' + ctrl.getMessageViewItemId(remoteLocalId))).toBe(null);
                view = ctrl.showMailMessageViewFor(remoteCompoundKey);
                t.expect(panel.getActiveTab()).toBe(view);

                t.waitForMs(500, function() {

                    t.expect(panel.getActiveTab()).toBe(panel.down('#' + ctrl.getMessageViewItemId(remoteLocalId)));

                    t.waitForMs(500, function() {
                        panel.destroy();
                        panel = null;
                    });
                });

            });
        });

    });


    t.it("getItemIdForMessageEditor()", function(t) {
        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        ), exc, e, tests, res, results = [];


        let key = MessageEntityCompoundKey.createFor(1, 2, 3);

        tests = [{
            args     : [2],
            expected : 'Exception',
            contains : 'valid value'
        }, {
            args     : [key, 'edit'],
            expected : 'cn_mail-mailmessageeditor-edit-' + key.toLocalId()
        }, {
            args     : [key, 'replyTo'],
            expected : 'cn_mail-mailmessageeditor-replyTo-' + key.toLocalId()
        }, {
            args     : [key, 'replyAll'],
            expected : 'cn_mail-mailmessageeditor-replyAll-' + key.toLocalId()
        }, {
            args     : [key, 'forward'],
            expected : 'cn_mail-mailmessageeditor-forward-' + key.toLocalId()
        }, {
            args     : ['8797dssdggddsg', 'compose'],
            expected : 'cn_mail-mailmessageeditor-compose-8797dssdggddsg'
        }, {
            args     : [false],
            expected : 'Exception',
            contains : 'valid value'
        }, {
            args     : [{}],
            expected : 'Exception',
            contains : 'valid value'
        }, {
            args     : ['a', 'edit'],
            expected : 'Exception',
            contains : 'expects an instance'
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            exc = e = undefined;
            if (tests[i].expected == 'Exception') {
                try{ctrl.getItemIdForMessageEditor.apply(ctrl, tests[i].args);}catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain(tests[i].contains);
            } else {
                res = ctrl.getItemIdForMessageEditor.apply(ctrl, tests[i].args);
                t.expect(res).toContain('cn_mail-mailmessageeditor-' + tests[i].args[1]);
                results[i] = res;
            }
        }

        for (var i = 0, len = tests.length; i < len; i++) {
            if (tests[i].expected == 'Exception') {
                continue;
            } else {
                t.expect(ctrl.getItemIdForMessageEditor.apply(ctrl, tests[i].args)
                ).toBe(results[i]);
            }
        }

        ctrl.destroy();
    });

return;
    t.it("getCnHrefForMessageEditor()", function(t) {
        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        ), exc, e, tests;

        tests = [{
            args     : [8797],
            expected : 'Exception'
        }, {
            args     : [8797, 'compose'],
            expected : 'cn_mail/message/compose/8797'
        }, {
            args     : [8797, 'edit'],
            expected : 'cn_mail/message/edit/8797'
        }, {
            args     : [8, 'replyTo'],
            expected : 'cn_mail/message/replyTo/8'
        }, {
            args     : [9, 'replyAll'],
            expected : 'cn_mail/message/replyAll/9'
        }, {
            args     : [10, 'forward'],
            expected : 'cn_mail/message/forward/10'
        }, {
            args     : ["8797dssdggddsg", 'compose'],
            expected : 'cn_mail/message/compose/8797dssdggddsg'
        }, {
            args     : [false],
            expected : 'Exception'
        }, {
            args     : [{}],
            expected : 'Exception'
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            exc = e = undefined;
            if (tests[i].expected == 'Exception') {
                try{ctrl.getCnHrefForMessageEditor.apply(ctrl, tests[i].args);}catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain("valid value");
            } else {
                t.expect(ctrl.getCnHrefForMessageEditor.apply(ctrl, tests[i].args)).toBe(
                    tests[i].expected);
            }
        }

        ctrl.destroy();
        ctrl = null;
    });


    t.it("showMailEditor()", function(t) {

        var panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
                width    : 800,
                height   : 600,
                renderTo : document.body
            }),
            ctrl  = panel.getController(),
            queryRes, editor, exc, e, editor2;

        try {ctrl.showMailEditor();}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("valid value");

        try {ctrl.showMailEditor(true);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("valid value");

        try {ctrl.showMailEditor(false);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("valid value");

        queryRes = Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel);
        t.expect(queryRes.length).toBe(0);

        editor = ctrl.showMailEditor(1, 'edit');
        t.isInstanceOf(editor, 'conjoon.cn_mail.view.mail.message.editor.MessageEditor');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel)[0]).toBe(editor);

        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(1);
        ctrl.showMailEditor(2, 'edit');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(2);

        editor2 = ctrl.showMailEditor(1, 'edit');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(2);
        t.expect(editor2).toBe(editor);

        editor = ctrl.showMailEditor('mailto:test@domain.tld', 'compose');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(3);

        editor2 = ctrl.showMailEditor('mailto:new_test@domain.tld', 'compose');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(4);
        t.expect(editor).not.toBe(editor2);

        editor2 = ctrl.showMailEditor('mailto:test@domain.tld', 'compose');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(4);
        t.expect(editor).toBe(editor2);

        var editorReplyTo = ctrl.showMailEditor(8, 'replyTo');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(5);

        var editorReplyAll = ctrl.showMailEditor(8, 'replyAll');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(6);

        var editorForward = ctrl.showMailEditor(9, 'forward');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(7);

        t.expect(editorReplyTo).not.toBe(editorReplyAll);
        t.expect(editorReplyAll).not.toBe(editorForward);

        var editorReplyTo2 = ctrl.showMailEditor(8, 'replyTo');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(7);
        var editorReplyAll2 = ctrl.showMailEditor(8, 'replyAll');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(7);
        var editorForward2 = ctrl.showMailEditor(9, 'forward');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(7);

        t.expect(editorReplyTo).toBe(editorReplyTo2);
        t.expect(editorReplyAll).toBe(editorReplyAll2);
        t.expect(editorForward).toBe(editorForward2);

        editor  = ctrl.showMailEditor(111, 'edit');
        editor2 = ctrl.showMailEditor(111, 'compose');
        t.expect(editor).not.toBe(editor2);

        t.waitForMs(1500, function() {
            panel.destroy();
            panel = null;
        });

    });

    return;
    t.it("onMailMessageSaveComplete() - no related views opened.", function(t) {

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
            messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                id      : 1,
                subject : 'FOOBAR'
            });
            messageDraft.setMessageBody({
                textHtml : '', textPlain : ''
            });

            t.waitForMs(500, function() {
                t.isCalledNTimes('updateItemWithDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 0);
                viewController.onMailMessageSaveComplete(getDummyEditor(), messageDraft);
                panel.destroy();
                panel = null;
            });
        });

    });


    t.it("onMailMessageSaveComplete() - selected gridRow not represented by messageViews", function(t) {

        let viewController = Ext.create(
                'conjoon.cn_mail.view.mail.MailDesktopViewController'
            ),
            mailFolderTree, draftNode, firstRowId, messageDraft,
            messageDetailView, inboxView, inboxMessageView, gridStore,
            grid, oldSubject, oldDate;

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600,
            items      : [{
                xclass : 'conjoon.cn_mail.view.mail.inbox.InboxView'
            }]
        });

        inboxView        = panel.down('cn_mail-mailinboxview');
        inboxMessageView = inboxView.down('cn_mail-mailmessagereadermessageview');
        grid             = panel.down('cn_mail-mailmessagegrid');

        mailFolderTree = panel.down('cn_mail-mailfoldertree');

        t.waitForMs(500, function() {
            draftNode = mailFolderTree.getStore().findNode('type', 'DRAFT');
            mailFolderTree.getSelectionModel().select(draftNode);

            t.waitForMs(500, function() {

                gridStore = grid.getStore();

                t.expect(draftNode).toBeTruthy();
                t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(draftNode);

                firstRowId = gridStore.getAt(0).getId();
                oldSubject = gridStore.getAt(1).get('subject');
                oldDate    = gridStore.getAt(1).get('date');

                messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                    id      : gridStore.getAt(1).getId(), // CHOOSE DIFFERENT ID FOR MESSAGE DRAFT
                    subject : 'FOOBAR',
                    date    : gridStore.getAt(1).get('date')
                });

                messageDraft.setMessageBody({
                    textHtml : '', textPlain : ''
                });

                grid.getSelectionModel().select(gridStore.getAt(0));
                panel.showMailMessageViewFor(firstRowId);

                t.waitForMs(500, function() {
                    messageDetailView = panel.down('#cn_mail-mailmessagereadermessageview-' + firstRowId);
                    t.expect(messageDetailView).toBeTruthy();

                    t.isCalledNTimes('updateItemWithDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 1);
                    t.isCalledNTimes('updateMessageItem',  messageDetailView, 0);
                    t.isCalledNTimes('updateMessageItem',  inboxMessageView, 0);
                    viewController.onMailMessageSaveComplete(getDummyEditor(), messageDraft);
                    t.expect(gridStore.getAt(1).get('subject')).not.toBe(oldSubject);
                    t.expect(gridStore.getAt(1).get('date')).toBe(oldDate);
                    t.expect(gridStore.getAt(1).get('subject')).toBe(messageDraft.get('subject'));

                    panel.destroy();
                    panel = null;
                });
            });
        });
    });



    t.it("onMailMessageSaveComplete() - opened inboxView, opened messageView, selected gridRow", function(t) {

        let viewController = Ext.create(
                'conjoon.cn_mail.view.mail.MailDesktopViewController'
            ),
            mailFolderTree, draftNode, firstRowId, messageDraft,
            messageDetailView, inboxView, inboxMessageView, gridStore,
            grid, oldSubject, oldDate;

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600,
            items      : [{
                xclass : 'conjoon.cn_mail.view.mail.inbox.InboxView'
            }]
        });

        inboxView        = panel.down('cn_mail-mailinboxview');
        inboxMessageView = inboxView.down('cn_mail-mailmessagereadermessageview');
        grid             = panel.down('cn_mail-mailmessagegrid');


        mailFolderTree = panel.down('cn_mail-mailfoldertree');

        t.waitForMs(500, function() {
            draftNode      = mailFolderTree.getStore().findNode('type', 'DRAFT');
            mailFolderTree.getSelectionModel().select(draftNode);

            t.waitForMs(500, function() {

                gridStore = grid.getStore();

                t.expect(draftNode).toBeTruthy();
                t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(draftNode);

                firstRowId = gridStore.getAt(0).getId();
                oldSubject = gridStore.getAt(0).get('subject');
                oldDate    = gridStore.getAt(0).get('date');

                messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                    id      : firstRowId,
                    subject : 'FOOBAR',
                    date    : oldDate
                });
                messageDraft.setMessageBody({
                    textHtml : '', textPlain : ''
                });

                grid.getSelectionModel().select(gridStore.getAt(0));
                panel.showMailMessageViewFor(firstRowId);

                t.waitForMs(500, function() {
                    messageDetailView = panel.down('#cn_mail-mailmessagereadermessageview-' + firstRowId);
                    t.expect(messageDetailView).toBeTruthy();

                    t.isCalledNTimes('updateItemWithDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 2);
                    t.isCalledNTimes('updateMessageItem',  messageDetailView, 1);
                    t.isCalledNTimes('updateMessageItem',  inboxMessageView, 1);
                    viewController.onMailMessageSaveComplete(getDummyEditor(), messageDraft);
                    t.expect(gridStore.getAt(0).get('subject')).not.toBe(oldSubject);
                    t.expect(gridStore.getAt(0).get('date')).toBe(oldDate);
                    t.expect(gridStore.getAt(0).get('subject')).toBe(messageDraft.get('subject'));

                    panel.destroy();
                    panel = null;
                });
            });
        });
    });


    t.it("showInboxViewFor()", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
            );
        Ext.ux.ajax.SimManager.init({
            delay : 1000
        });
        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600,
            items      : [{
                xclass : 'conjoon.cn_mail.view.mail.inbox.InboxView'
            }]
        });

        let newPanel = Ext.create('Ext.Panel', {title : 'foo'});

        panel.add(newPanel);
        panel.setActiveTab(newPanel);

        let inboxView = panel.down('cn_mail-mailinboxview');

        t.isCalledNTimes('processMailFolderSelectionForRouting', viewController, 2);

        t.expect(panel.getActiveTab()).toBe(newPanel);
        t.expect(viewController.showInboxViewFor('dev_sys@conjoon.org', '2')).toBe(inboxView);
        t.expect(panel.getActiveTab()).toBe(inboxView);

        t.expect(panel.down('cn_mail-mailinboxview').down('cn_mail-mailfoldertree').getStore().getProxy().type).toBe('memory');


        t.waitForMs(1250, function() {

            t.expect(panel.down('cn_mail-mailinboxview').down('cn_mail-mailfoldertree').getStore().getProxy().type).not.toBe('memory');
            panel.setActiveTab(newPanel);
            t.expect(viewController.showInboxViewFor('dev_sys@conjoon.org', '3')).toBe(panel.down('cn_mail-mailinboxview'));
            t.expect(panel.getActiveTab()).toBe(inboxView);

            panel.destroy();
            panel = null;

        });

    });


    t.it("processMailFolderSelectionForRouting()", function(t) {

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

        let inboxView = panel.down('cn_mail-mailinboxview');

        t.waitForMs(750, function() {

            let cnhref = inboxView.cn_href;
            t.expect(cnhref).toBe('cn_mail/home');

            t.expect(viewController.processMailFolderSelectionForRouting('foo')).toBe(false);

            t.expect(cnhref).toBe(inboxView.cn_href);

            let node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById('1');
            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys@conjoon.org', 1)).toBe(true);
            t.expect(inboxView.cn_href).toBe(node.toUrl());
            t.expect(Ext.History.getToken()).toBe(inboxView.cn_href);
            t.expect(inboxView.down('cn_mail-mailfoldertree').getSelection()[0]).toBe(node);

            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys@conjoon.org', 1)).toBe(true);

            node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById(2);
            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys@conjoon.org', 2)).toBe(true);
            t.expect(inboxView.cn_href).toBe(node.toUrl());
            t.expect(Ext.History.getToken()).toBe(inboxView.cn_href);
            t.expect(inboxView.down('cn_mail-mailfoldertree').getSelection()[0]).toBe(node);

            panel.destroy();
            panel = null;
        });

    });


    t.it("showInboxViewFor() - issue with selection already registered", function(t) {

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

        let newPanel = Ext.create('Ext.Panel', {
            title   : 'foo',
            cn_href : 'foo'
        });

        panel.add(newPanel);
        let inboxView = panel.down('cn_mail-mailinboxview');

        t.waitForMs(750, function() {

            let node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById(1);
            inboxView.down('cn_mail-mailfoldertree').getSelectionModel().select(node);
            viewController.showInboxViewFor('dev_sys@conjoon.org', 1);
            t.expect(inboxView.cn_href).toBe(node.toUrl());

            panel.setActiveTab(newPanel);

            node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById(2);
            inboxView.down('cn_mail-mailfoldertree').getSelectionModel().select(node);
            viewController.showInboxViewFor('dev_sys@conjoon.org', 2);
            t.expect(inboxView.cn_href).toBe(node.toUrl());

            panel.setActiveTab(newPanel);

            panel.setActiveTab(inboxView);
            t.expect(inboxView.cn_href).toBe(node.toUrl());



            panel.destroy();
            panel = null;
        });

    });


    t.it("updateHistoryForComposedMessage() - exceptions", function(t) {

        let exc, e,
            viewController = Ext.create(
                'conjoon.cn_mail.view.mail.MailDesktopViewController'
            );

        try{viewController.updateHistoryForComposedMessage();}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('of editor must be');
        t.expect(exc.msg.toLowerCase()).toContain('editmode');
        exc = undefined;

        try{viewController.updateHistoryForComposedMessage({editMode : 'foo'});}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('of editor must be');
        t.expect(exc.msg.toLowerCase()).toContain('editmode');

        viewController.destroy();
    });

    t.it("updateHistoryForComposedMessage()", function(t) {

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

        let inboxView = panel.down('cn_mail-mailinboxview');

        let editor = viewController.showMailEditor(8989, 'compose');

        let oldId, newId, itemId = editor.getItemId();
        for (let id in viewController.editorIdMap) {
            if (viewController.editorIdMap[id] === itemId) {
                oldId = id;
                break;
            }
        }

        t.expect(oldId).not.toBeUndefined();

        t.waitForMs(250, function() {
            let token   = Ext.History.getToken(),
                cn_href = editor.cn_href;

            t.expect(token).toBe(cn_href);

            let ret = viewController.updateHistoryForComposedMessage(editor, 5);

            t.waitForMs(750, function() {
                let newToken  = Ext.History.getToken(),
                    newCnHref = editor.cn_href;

                t.expect(ret).toBe(newCnHref);
                t.expect(newToken).toBe(newCnHref);
                t.expect(newToken).not.toBe(token);

                t.expect(viewController.editorIdMap[oldId]).toBeUndefined()

                for (let id in viewController.editorIdMap) {
                    if (viewController.editorIdMap[id] === itemId) {
                        newId = id;
                        break;
                    }
                }

                t.expect(newId).toBeDefined();
                t.expect(newId).not.toBe(oldId);

                panel.destroy();
                panel = null;
            });

        });
    });


    t.it("getIdFromInboxMessageView()", function(t) {

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

        let inboxView = panel.down('cn_mail-mailinboxview'),
            msgv      = inboxView.down('cn_mail-mailmessagereadermessageview');

        msgv.setMessageItem(getRecordCollection()[0]);
        t.expect(viewController.getIdFromInboxMessageView()).toBe(
            getRecordCollection()[0].getId()
        );

        msgv.setMessageItem(getRecordCollection()[3]);
        t.expect(viewController.getIdFromInboxMessageView()).toBe(
            getRecordCollection()[3].getId()
        );


        panel.destroy();
        panel = null;

    });


    t.it("onInboxViewReplyAllClick() / onInboxViewReplyClick() / onInboxViewForwardClick() / onInboxViewEditDraftClick()", function(t) {

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

        let inboxView = panel.down('cn_mail-mailinboxview'),
            msgv      = inboxView.down('cn_mail-mailmessagereadermessageview'),
            btnra     = inboxView.down('#btn-forward'),
            btnr      = inboxView.down('#btn-reply'),
            btnf      = inboxView.down('#btn-replyall'),
            btne      = inboxView.down('#btn-editdraft');

        msgv.setMessageItem(getRecordCollection()[0]);

        t.isCalled('onInboxViewReplyAllClick', viewController);
        t.isCalled('onInboxViewReplyClick', viewController);
        t.isCalled('onInboxViewForwardClick', viewController);
        t.isCalled('onInboxViewEditDraftClick', viewController);
        t.isCalledNTimes('showMailEditor', viewController, 4);

        btnra.fireEvent('click');
        btnr.fireEvent('click');
        btnf.fireEvent('click');
        btne.fireEvent('click');

        t.waitForMs(750, function() {
            panel.destroy();
            panel = null;
        });


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

        let rec       = conjoon.cn_mail.model.mail.message.MessageItem.load('123'),
            id        = rec.getId() + '',
            inboxView = panel.down('cn_mail-mailinboxview');

        t.waitForMs(750, function() {

            let view  = viewController.showMailMessageViewFor(id),
                edit     = viewController.showMailEditor(id, 'edit'),
                replyAll = viewController.showMailEditor(id, 'replyAll'),
                replyTo  = viewController.showMailEditor(id, 'replyTo'),
                forward  = viewController.showMailEditor(id, 'forward');

            let isActive = function(views) {
                for (let i in views) {
                    if (panel.getActiveTab() === views[i]) {
                        return true;
                    }
                }
            };

           t.isCalled('showMessageCannotBeDeletedWarning', panel);

            panel.setActiveTab(inboxView);

            t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
            t.expect(isActive([view, edit, replyAll, replyTo, forward])).toBe(true);

            t.waitForMs(750, function() {
                forward.close();

                t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                t.expect(isActive([view, edit, replyAll, replyTo])).toBe(true);

                t.waitForMs(750, function() {

                    replyTo.close();

                    t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                    t.expect(isActive([view, edit, replyAll])).toBe(true);

                    t.waitForMs(750, function() {
                        replyAll.close();

                        t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                        t.expect(isActive([view, edit])).toBe(true);

                        t.waitForMs(750, function() {
                            edit.close();

                            t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(false);
                            t.expect(isActive([view])).toBe(true);

                            t.waitForMs(750, function() {
                                view.close();

                                t.waitForMs(750, function() {
                                    t.expect(viewController.onBeforeMessageItemDelete(inboxView, rec)).toBe(true);

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

        t.waitForMs(250, function () {

            t.expect(panel.down('cn_mail-mailfoldertree').getStore().getAt(3).get('type')).toBe('DRAFT');
            panel.down('cn_mail-mailfoldertree').getSelectionModel().select(
                panel.down('cn_mail-mailfoldertree').getStore().getAt(3)
            );

            t.waitForMs(1250, function () {

                let editor = viewController.showMailEditor(2253236, 'compose');
                let myValue = Ext.id();
                editor.down('#subjectField').setValue(myValue);


                t.waitForMs(250, function () {

                    t.click(editor.down('#saveButton'));

                    t.waitForMs(1750, function () {

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
            });
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

        t.isCalledNTimes('add', panel.down('cn_mail-mailinboxview').getController().getLivegrid(), 1);
        t.isCalledNTimes('createItemFromDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 1);


        t.waitForMs(250, function () {

            t.expect(panel.down('cn_mail-mailfoldertree').getStore().getAt(3).get('type')).toBe('DRAFT');
            panel.down('cn_mail-mailfoldertree').getSelectionModel().select(
                panel.down('cn_mail-mailfoldertree').getStore().getAt(3)
            );

            t.waitForMs(1250, function () {

                let editor = viewController.showMailEditor(2253236, 'compose');
                let myValue = Ext.id();
                editor.down('#subjectField').setValue(myValue);


                t.waitForMs(250, function () {

                    t.click(editor.down('#saveButton'));

                    t.waitForMs(1750, function () {

                        panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                        let subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                        t.expect(subjectCont[0].innerHTML).toContain(myValue);

                        let rec   = panel.down('cn_mail-mailmessagegrid').getStore().getData().map[1].value[0],
                            recId = rec.getId();

                        panel.down('cn_mail-mailinboxview').getController().moveOrDeleteMessage(
                            panel.down('cn_mail-mailmessagegrid').getStore().getData().map[1].value[0]
                        );

                        t.waitForMs(750, function() {

                            t.expect(panel.down('cn_mail-mailfoldertree').getStore().getAt(4).get('type')).toBe('TRASH');
                            panel.down('cn_mail-mailfoldertree').getSelectionModel().select(
                                panel.down('cn_mail-mailfoldertree').getStore().getAt(4)
                            );

                            t.waitForMs(750, function() {

                                subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
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


                    });
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

        t.waitForMs(500, function() {


            let editor = panel.showMailEditor('233242', 'compose');
            t.isCalledOnce('updateViewForSentDraft', panel.down('cn_mail-mailinboxview'));

            t.waitForMs(250, function() {

                editor.fireEvent('cn_mail-mailmessagesendcomplete',
                    editor,
                    Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                        subject : 'FOOBAR'
                    })
                );
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

        t.waitForMs(250, function () {

            t.expect(panel.down('cn_mail-mailfoldertree').getStore().getAt(3).get('type')).toBe('DRAFT');
            panel.down('cn_mail-mailfoldertree').getSelectionModel().select(
                panel.down('cn_mail-mailfoldertree').getStore().getAt(3)
            );

            t.waitForMs(1250, function () {

                let editor = viewController.showMailEditor('1', context);
                let myValue = Ext.id();

                t.waitForMs(1250, function () {
                    editor.down('#subjectField').setValue(myValue);


                    t.waitForMs(250, function () {

                        t.click(editor.down('#saveButton'));

                        t.waitForMs(1750, function () {

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

            let draftFolder = mailFolderTree.getStore().getAt(3),
                inboxFolder = mailFolderTree.getStore().getAt(0);

            t.expect(draftFolder.get('type')).toBe('DRAFT');
            t.expect(inboxFolder.get('type')).toBe('INBOX');

            mailFolderTree.getSelectionModel().select(inboxFolder);

            t.waitForMs(1750, function () {

                let messageItem = messageGrid.getStore().getAt(0);
                messageItem.set('draft', false);

                messageGrid.getSelectionModel().select(messageItem);

                t.waitForMs(1750, function() {

                    let editor = viewController.showMailEditor(messageItem.getId(), 'replyAll');

                    t.waitForMs(1750, function() {

                        panel.setActiveTab(inboxView);

                        mailFolderTree.getSelectionModel().select(draftFolder);

                        t.waitForMs(1750, function() {

                            panel.setActiveTab(editor);

                            t.click(editor.down('#saveButton'));

                            t.waitForMs(1750, function() {

                                t.click(editor.down('#sendButton'));

                                t.waitForMs(1750, function() {
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
            width: 800,
            height: 600
        });


        let editor, draft;


        t.waitForMs(750, function() {

            let mailFolder = selectMailFolder(panel, 3);
            t.expect(mailFolder.get('type')).toBe('DRAFT');

            t.waitForMs(750, function(){

                // intentionally not selected
                draft = panel.down('cn_mail-mailmessagegrid').getStore().getAt(0);
                t.expect(draft.get('mailFolderId')).toBe(mailFolder.getId());
                editor = viewController.showMailEditor(draft.getId(), 'edit');
                t.expect(panel.down('cn_mail-mailmessagegrid').getStore().getAt(0).getId()).toBe(draft.getId());

                t.waitForMs(750, function() {

                    draft = editor.getMessageDraft();

                    panel.down('cn_mail-mailinboxview').getController().moveOrDeleteMessage(
                        draft,
                        false,
                        editor
                    );

                    t.waitForMs(750, function() {

                        let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                        t.click(yesButton[0]);


                        t.waitForMs(750, function() {

                            editor.close();

                            t.expect(draft.get('cn_deleted')).toBeUndefined();
                            t.expect(draft.get('cn_moved')).toBeUndefined();

                            t.expect(draft.get('mailFolderId')).toBe('5');

                            t.expect(panel.down('cn_mail-mailmessagegrid').getStore().getAt(0).getId()).not.toBe(draft.getId());

                            let trashMailFolder = selectMailFolder(panel, 4);
                            t.expect(trashMailFolder.get('type')).toBe('TRASH');

                            t.waitForMs(750, function() {

                                let movedRec = panel.down('cn_mail-mailinboxview').getController().getLivegrid().getRecordById(draft.getId());
                                t.expect(movedRec).toBeTruthy();

                                editor = viewController.showMailEditor(movedRec.getId(), 'edit');

                                t.waitForMs(750, function() {

                                    draft = editor.getMessageDraft();
                                    t.expect(movedRec).toBeTruthy();
                                    panel.down('cn_mail-mailinboxview').getController().moveOrDeleteMessage(
                                        draft,
                                        false,
                                        editor
                                    );

                                    t.waitForMs(750, function() {

                                        yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                                        t.click(yesButton[0]);

                                        t.waitForMs(750, function() {

                                            editor.close();

                                            t.expect(draft.get('cn_deleted')).toBeUndefined();
                                            t.expect(draft.get('cn_moved')).toBeUndefined();

                                            t.expect(draft.erased).toBe(true);
                                            let removedRec = panel.down('cn_mail-mailinboxview').getController().getLivegrid().getRecordById(draft.getId());
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


        t.waitForMs(750, function() {

            let mailFolder = selectMailFolder(panel, 3);
            t.expect(mailFolder.get('type')).toBe('DRAFT');

            t.waitForMs(750, function(){

                // intentionally not selected
                draft = panel.down('cn_mail-mailmessagegrid').getStore().getAt(0);
                t.expect(draft.get('mailFolderId')).toBe(mailFolder.getId());

                t.waitForMs(750, function() {

                    mailFolder = selectMailFolder(panel, 4);
                    t.expect(mailFolder.get('type')).toBe('TRASH');

                    t.waitForMs(750, function() {

                        t.expect(panel.down('cn_mail-mailinboxview').getController().getLivegrid().getRecordById(draft.getId())).toBe(null);

                        editor = viewController.showMailEditor(draft.getId(), 'edit');

                        t.waitForMs(750, function() {

                            draft = editor.getMessageDraft();

                            panel.down('cn_mail-mailinboxview').getController().moveOrDeleteMessage(
                                draft,
                                false,
                                editor
                            );

                            t.waitForMs(750, function() {

                                let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                                t.click(yesButton[0]);


                                t.waitForMs(750, function() {

                                    editor.close();

                                    t.expect(draft.get('cn_deleted')).toBeUndefined();
                                    t.expect(draft.get('cn_moved')).toBeUndefined();


                                    t.expect(panel.down('cn_mail-mailinboxview').getController().getLivegrid().getRecordById(draft.getId())).not.toBe(null);

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

        let rec       = conjoon.cn_mail.model.mail.message.MessageItem.load('123'),
            id        = rec.getId() + '',
            inboxView = panel.down('cn_mail-mailinboxview');

        t.waitForMs(750, function() {

            let edit = viewController.showMailEditor(id, 'edit');

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

        let inboxView = panel.down('cn_mail-mailinboxview');

        viewController.onMessageItemMove(inboxView, {getId : Ext.emptyFn}, inboxView, {getId : Ext.emptyFn}, {get : Ext.emptyFn, getId : Ext.emptyFn});

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

        let inboxView = panel.down('cn_mail-mailinboxview');

        viewController.onMessageItemMove(inboxView, {getId : Ext.emptyFn}, null, {getId : Ext.emptyFn}, {get : Ext.emptyFn, getId : Ext.emptyFn});

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
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        t.expect(Ext.isArray(ctrl.getMessageItemsFromOpenedViews())).toBe(true);
        t.expect(ctrl.getMessageItemsFromOpenedViews().length).toBe(0);


        let editorEdit1     = ctrl.showMailEditor('1', 'edit'),
            editorReplyTo1  = ctrl.showMailEditor('1', 'replyTo'),
            editorReplyAll1 = ctrl.showMailEditor('1', 'replyAll'),
            editorCompose   = ctrl.showMailEditor(13232, 'compose'),
            editorForward1  = ctrl.showMailEditor('1', 'forward'),
            editorEdit3     = ctrl.showMailEditor('3', 'edit'),
            mailView        = ctrl.showMailMessageViewFor('2');

        t.waitForMs(1750, function() {

            let inboxView   = panel.setActiveTab(panel.down('cn_mail-mailinboxview')),
                messageView = inboxView.down('cn_mail-mailmessagereadermessageview');

            selectMailFolder(panel, 2);

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


    t.it("getMessageItemsFromOpenedViews() - messageItemId specified", function(t) {

        let ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : ctrl,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        let id = '1';

        t.expect(Ext.isArray(ctrl.getMessageItemsFromOpenedViews(id))).toBe(true);
        t.expect(ctrl.getMessageItemsFromOpenedViews(id).length).toBe(0);


        let editorEdit1     = ctrl.showMailEditor('1', 'edit'),
            editorReplyTo1  = ctrl.showMailEditor('1', 'replyTo'),
            editorReplyAll1 = ctrl.showMailEditor('1', 'replyAll'),
            editorCompose   = ctrl.showMailEditor(13232, 'compose'),
            editorForward1  = ctrl.showMailEditor('1', 'forward'),
            editorEdit3     = ctrl.showMailEditor('3', 'edit'),
            mailView        = ctrl.showMailMessageViewFor('1');

        t.waitForMs(1750, function() {

            let inboxView   = panel.setActiveTab(panel.down('cn_mail-mailinboxview')),
                messageView = inboxView.down('cn_mail-mailmessagereadermessageview');

            selectMailFolder(panel, 2);

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


                    let collection = ctrl.getMessageItemsFromOpenedViews(id);

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


    t.it("updateMessageItemsFromOpenedViews()", function(t) {

        let ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : ctrl,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        t.isCalledNTimes('getMessageItemsFromOpenedViews', ctrl, 3);

        let field = 'mailFolderId',
            id    = '1',
            value = '15';

        let editorEdit1     = ctrl.showMailEditor('1', 'edit'),
            editorReplyTo1  = ctrl.showMailEditor('1', 'replyTo'),
            editorReplyAll1 = ctrl.showMailEditor('1', 'replyAll'),
            editorCompose   = ctrl.showMailEditor(13232, 'compose'),
            editorForward1  = ctrl.showMailEditor('1', 'forward'),
            editorEdit3     = ctrl.showMailEditor('3', 'edit'),
            mailView        = ctrl.showMailMessageViewFor('1');

        t.waitForMs(1750, function() {

            let inboxView   = panel.setActiveTab(panel.down('cn_mail-mailinboxview')),
                messageView = inboxView.down('cn_mail-mailmessagereadermessageview');

            selectMailFolder(panel, 2);

            t.waitForMs(750, function() {

                let messageItemFromInboxView = selectMessage(panel, 1);

                t.waitForMs(750, function() {

                    let coll = ctrl.getMessageItemsFromOpenedViews(),
                        count = 0;
                    for (let i = 0, len = coll.length; i < len; i++) {
                        let messageItem = coll[i].messageItem;
                        if (messageItem.getId() === id) {
                            count++;
                            t.expect(messageItem.get(field)).not.toBe(value);
                        }
                    }
                    t.expect(count).toBe(2);
                    count = 0;

                    ctrl.updateMessageItemsFromOpenedViews(id, field, value);

                    coll = ctrl.getMessageItemsFromOpenedViews();
                    for (let i = 0, len = coll.length; i < len; i++) {
                        let messageItem = coll[i].messageItem;
                        if (messageItem.getId() === id) {
                            count++;
                            t.expect(messageItem.get(field)).toBe(value);
                            t.expect(messageItem.dirty).toBe(false);
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


    t.it("updateMessageItemsFromOpenedViews() - exception", function(t) {

        let ctrl = Ext.create(
                'conjoon.cn_mail.view.mail.MailDesktopViewController'
            ), exc, e;

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : ctrl,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        let field = 'foo',
            id    = '1',
            value = '15';

        let editorEdit1     = ctrl.showMailEditor('1', 'edit'),
            editorReplyTo1  = ctrl.showMailEditor('1', 'replyTo'),
            editorReplyAll1 = ctrl.showMailEditor('1', 'replyAll'),
            editorCompose   = ctrl.showMailEditor(13232, 'compose'),
            editorForward1  = ctrl.showMailEditor('1', 'forward'),
            editorEdit3     = ctrl.showMailEditor('3', 'edit'),
            mailView        = ctrl.showMailMessageViewFor('1');

        t.waitForMs(1750, function() {
            try {ctrl.updateMessageItemsFromOpenedViews(id, field, value)}catch(e){exc = e};
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("not defined in the model");

            t.waitForMs(750, function () {
                panel.destroy();
                panel = null;
            });
        });
    });


    t.it("onMessageItemMove() - updateMessageItemsFromOpenedViews() called", function(t) {

        let viewController = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        );

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
            controller : viewController,
            renderTo   : document.body,
            width      : 800,
            height     : 600
        });

        let ID, FIELD, VALUE;

        viewController.updateMessageItemsFromOpenedViews = function(id, field, value) {
            ID    = id;
            FIELD = field;
            VALUE = value;
        };

        t.isCalled('showMessageMovedInfo', panel);

        let inboxView = panel.down('cn_mail-mailinboxview');

        viewController.onMessageItemMove(
            inboxView, {getId : function(){return '8';}}, null, {}, {getId : function(){return '15'}, get : function() {return '15'}});

        t.expect(ID).toBe('8');
        t.expect(FIELD).toBe('mailFolderId');
        t.expect(VALUE).toBe('15');


        t.waitForMs(750, function () {
            panel.destroy();
            panel = null;
        });
    });


});})});});});});