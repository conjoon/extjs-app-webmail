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
        selectMessage = function(panel, storeAt) {

            let message = panel.down('cn_mail-mailmessagegrid').getStore().getAt(storeAt);

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
            value    : {},
            expected : 'Exception',
            contains : 'not a valid value'
        }, {
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
            if (test.expected === 'Exception') {

                try{ctrl.createMessageDraftConfig(test.value);}catch(e){exc=e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain(test.contains);

            } else if (!Ext.isObject(test.expected)) {
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

        let remoteCompoundKey = MessageEntityCompoundKey.createFor('mailAccountId', 'mailFolderId', 'id');

        t.expect(Ext.validIdRe.test(value)).toBe(false);
        t.expect(Ext.validIdRe.test(ctrl.getMessageViewItemId(remoteCompoundKey))).toBe(true);

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
                t.expect(panel.down('#' +ctrl.getMessageViewItemId(rec.getCompoundKey()))).toBe(null);
                view = ctrl.showMailMessageViewFor(
                    MessageEntityCompoundKey.createFor(
                        rec.get('mailAccountId'), rec.get('mailFolderId'), rec.get('id')
                    )
                );
                t.expect(panel.down('#' +ctrl.getMessageViewItemId(rec.getCompoundKey()))).not.toBe(null);
                t.expect(panel.getActiveTab()).toBe(panel.down('#' +ctrl.getMessageViewItemId(rec.getCompoundKey())));
                t.expect(panel.getActiveTab()).toBe(view);


                t.expect(panel.down('#' +ctrl.getMessageViewItemId(rec2.getCompoundKey()))).toBe(null);
                view = ctrl.showMailMessageViewFor(MessageEntityCompoundKey.createFor(rec2.get('mailAccountId'), rec2.get('mailFolderId'), rec2.get('id')));
                t.expect(panel.down('#' +ctrl.getMessageViewItemId(rec2.getCompoundKey()))).not.toBe(null);
                t.expect(panel.getActiveTab()).toBe(panel.down('#' +ctrl.getMessageViewItemId(rec2.getCompoundKey())));
                t.expect(panel.getActiveTab()).toBe(view);

                t.expect(panel.down('#' + ctrl.getMessageViewItemId(rec.getCompoundKey()))).not.toBe(null);
                view = ctrl.showMailMessageViewFor(MessageEntityCompoundKey.createFor(rec.get('mailAccountId'), rec.get('mailFolderId'), rec.get('id')));
                t.expect(panel.getActiveTab()).toBe(panel.down('#' + ctrl.getMessageViewItemId(rec.getCompoundKey())));
                t.expect(panel.getActiveTab()).toBe(view);

                // remote Loading
                let remoteRec = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(0),
                    remoteCompoundKey = MessageEntityCompoundKey.createFor(remoteRec.mailAccountId, remoteRec.mailFolderId, remoteRec.id),
                    remoteLocalId = remoteCompoundKey.toLocalId();

                t.expect(store.findExact('localId', remoteLocalId)).toBe(-1);
                t.expect(panel.down('#' + ctrl.getMessageViewItemId(remoteCompoundKey))).toBe(null);
                view = ctrl.showMailMessageViewFor(remoteCompoundKey);
                t.expect(panel.getActiveTab()).toBe(view);

                t.waitForMs(500, function() {

                    t.expect(panel.getActiveTab()).toBe(panel.down('#' + ctrl.getMessageViewItemId(remoteCompoundKey)));

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


    t.it("getCnHrefForMessageEditor()", function(t) {
        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        ), exc, e, tests;

        let key = MessageEntityCompoundKey.createFor(1, 2, 3);

        tests = [{
            args     : [8797],
            expected : 'Exception',
            contains : 'valid value'
        }, {
            args     : [8797, 'edit'],
            expected : 'Exception',
            contains : 'expects an instance'
        }, {
            args     : [8797, 'compose'],
            expected : 'cn_mail/message/compose/8797'
        }, {
            args     : [key, 'edit'],
            expected : 'cn_mail/message/edit/' + key.toLocalId()
        }, {
            args     : [key, 'replyTo'],
            expected : 'cn_mail/message/replyTo/' + key.toLocalId()
        }, {
            args     : [key, 'replyAll'],
            expected : 'cn_mail/message/replyAll/' + key.toLocalId()
        }, {
            args     : [key, 'forward'],
            expected : 'cn_mail/message/forward/' + key.toLocalId()
        }, {
            args     : ["8797dssdggddsg", 'compose'],
            expected : 'cn_mail/message/compose/8797dssdggddsg'
        }, {
            args     : [false],
            expected : 'Exception',
            contains : 'valid value'
        }, {
            args     : [{}],
            expected : 'Exception',
            contains : 'valid value'
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            exc = e = undefined;
            if (tests[i].expected == 'Exception') {
                try{ctrl.getCnHrefForMessageEditor.apply(ctrl, tests[i].args);}catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain(tests[i].contains);
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

        let keyOne = createKeyForExistingMessage(1),
            keyTwo = createKeyForExistingMessage(2),
            keyEight = createKeyForExistingMessage(3),
            keyNine = createKeyForExistingMessage(4),
            keyOneOneOne = createKeyForExistingMessage(5);


        editor = ctrl.showMailEditor(keyOne, 'edit');
        t.isInstanceOf(editor, 'conjoon.cn_mail.view.mail.message.editor.MessageEditor');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel)[0]).toBe(editor);

        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(1);
        ctrl.showMailEditor(keyTwo, 'edit');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(2);

        editor2 = ctrl.showMailEditor(keyOne, 'edit');
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

        var editorReplyTo = ctrl.showMailEditor(keyEight, 'replyTo');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(5);

        var editorReplyAll = ctrl.showMailEditor(keyEight, 'replyAll');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(6);

        var editorForward = ctrl.showMailEditor(keyNine, 'forward');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(7);

        t.expect(editorReplyTo).not.toBe(editorReplyAll);
        t.expect(editorReplyAll).not.toBe(editorForward);

        var editorReplyTo2 = ctrl.showMailEditor(keyEight, 'replyTo');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(7);
        var editorReplyAll2 = ctrl.showMailEditor(keyEight, 'replyAll');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(7);
        var editorForward2 = ctrl.showMailEditor(keyNine, 'forward');
        t.expect(Ext.ComponentQuery.query('cn_mail-mailmessageeditor', panel).length).toBe(7);

        t.expect(editorReplyTo).toBe(editorReplyTo2);
        t.expect(editorReplyAll).toBe(editorReplyAll2);
        t.expect(editorForward).toBe(editorForward2);

        editor  = ctrl.showMailEditor(keyOneOneOne, 'edit');
        editor2 = ctrl.showMailEditor('foobar', 'compose');
        t.expect(editor).not.toBe(editor2);

        t.waitForMs(1500, function() {
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

        let draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            mailFolderId : '1',
            mailAccountId : '1',
            id : '1'
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

            let ret = viewController.updateHistoryForComposedMessage(editor, draft);

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
                mailFolderId : 2,
                mailAccountId : 3,
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
            grid, oldSubject, oldDate, firstRowCK;

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

        t.waitForMs(750, function() {
            draftNode = mailFolderTree.getStore().findNode('type', 'DRAFT');
            mailFolderTree.getSelectionModel().select(draftNode);

            t.waitForMs(750, function() {

                gridStore = grid.getStore();

                t.expect(draftNode).toBeTruthy();
                t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(draftNode);

                firstRowId = gridStore.getAt(0).getId();
                firstRowCK = gridStore.getAt(0).getCompoundKey();
                oldSubject = gridStore.getAt(1).get('subject');
                oldDate    = gridStore.getAt(1).get('date');

                messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                    localId       : gridStore.getAt(1).getId(), // CHOOSE DIFFERENT ID FOR MESSAGE DRAFT
                    mailFolderId  : gridStore.getAt(1).get('mailFolderId'),
                    mailAccountId : gridStore.getAt(1).get('mailAccountId'),
                    id            : gridStore.getAt(1).get('id'),
                    subject       : 'FOOBAR',
                    date          : gridStore.getAt(1).get('date')
                });


                messageDraft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                    textHtml : '', textPlain : ''
                }));

                grid.getSelectionModel().select(gridStore.getAt(0));
                panel.showMailMessageViewFor(firstRowCK);

                t.waitForMs(500, function() {
                    messageDetailView = panel.down('#' + viewController.getMessageViewItemId(firstRowCK));
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
            grid, oldSubject, oldDate, firstRowCK;

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
                firstRowCK = gridStore.getAt(0).getCompoundKey();
                oldSubject = gridStore.getAt(0).get('subject');
                oldDate    = gridStore.getAt(0).get('date');

                messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                    localId       : firstRowId,
                    mailFolderId  : gridStore.getAt(0).get('mailFolderId'),
                    mailAccountId : gridStore.getAt(0).get('mailAccountId'),
                    id            : gridStore.getAt(0).get('id'),
                    subject       : 'FOOBAR',
                    date          : oldDate
                });

                messageDraft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
                    textHtml : '', textPlain : ''
                }));

                grid.getSelectionModel().select(gridStore.getAt(0));
                panel.showMailMessageViewFor(firstRowCK);

                t.waitForMs(500, function() {
                    messageDetailView = panel.down('#' + viewController.getMessageViewItemId(firstRowCK));
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
        t.expect(viewController.showInboxViewFor('dev_sys_conjoon.org', 'INBOX.Sent Messages')).toBe(inboxView);
        t.expect(panel.getActiveTab()).toBe(inboxView);

        t.expect(panel.down('cn_mail-mailinboxview').down('cn_mail-mailfoldertree').getStore().getProxy().type).toBe('memory');


        t.waitForMs(1250, function() {

            t.expect(panel.down('cn_mail-mailinboxview').down('cn_mail-mailfoldertree').getStore().getProxy().type).not.toBe('memory');
            panel.setActiveTab(newPanel);
            t.expect(viewController.showInboxViewFor('dev_sys_conjoon.org', 'INBOX.Drafts')).toBe(panel.down('cn_mail-mailinboxview'));
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

            let node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById('INBOX');
            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys_conjoon_org', 'INBOX')).toBe(true);
            t.expect(inboxView.cn_href).toBe(node.toUrl());
            t.expect(Ext.History.getToken()).toBe(inboxView.cn_href);
            t.expect(inboxView.down('cn_mail-mailfoldertree').getSelection()[0]).toBe(node);

            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys_conjoon_org', "INBOX.Sent Messages")).toBe(true);

            node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById("INBOX.Sent Messages");
            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys_conjoon_org', "INBOX.Sent Messages")).toBe(true);
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


            let node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById("INBOX");
            inboxView.down('cn_mail-mailfoldertree').getSelectionModel().select(node);
            viewController.showInboxViewFor('dev_sys_conjoon_org', "INBOX");
            t.expect(inboxView.cn_href).toBe(node.toUrl());

            panel.setActiveTab(newPanel);

            node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById("INBOX.Sent Messages");
            inboxView.down('cn_mail-mailfoldertree').getSelectionModel().select(node);
            viewController.showInboxViewFor('dev_sys_conjoon_org', "INBOX.Sent Messages");
            t.expect(inboxView.cn_href).toBe(node.toUrl());

            panel.setActiveTab(newPanel);

            panel.setActiveTab(inboxView);
            t.expect(inboxView.cn_href).toBe(node.toUrl());



            panel.destroy();
            panel = null;
        });

    });


    t.it("getCompoundKeyFromInboxMessageView()", function(t) {

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
        t.expect(viewController.getCompoundKeyFromInboxMessageView().toObject()).toEqual(
            getRecordCollection()[0].getCompoundKey().toObject()
        );

        msgv.setMessageItem(getRecordCollection()[3]);
        t.expect(viewController.getCompoundKeyFromInboxMessageView().toObject()).toEqual(
            getRecordCollection()[3].getCompoundKey().toObject()
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


        t.waitForMs(750, function() {

            let inboxView = panel.down('cn_mail-mailinboxview'),
                msgv      = inboxView.down('cn_mail-mailmessagereadermessageview'),
                btnra     = inboxView.down('#btn-forward'),
                btnr      = inboxView.down('#btn-reply'),
                btnf      = inboxView.down('#btn-replyall'),
                btne      = inboxView.down('#btn-editdraft');

            msgv.setMessageItem(getRecordCollection()[0]);

            console.log(msgv.getViewModel().get('messageItem'));

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

            selectMailFolder(panel, 1, 'INBOX', t);


            t.waitForMs(751, function(){

                let DRAFTMESSAGE = selectMessage(panel, 1),
                    DRAFTCK      = DRAFTMESSAGE.getCompoundKey(),
                    compoundKey = getRecordCollection()[0].getCompoundKey(),
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
                        DRAFTVIEW =  viewController.showMailMessageViewFor(DRAFTCK, 'edit');

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
            t.expect(treeStore.getAt(4).get('type')).toBe('DRAFT');
            panel.down('cn_mail-mailfoldertree').getSelectionModel().select(
                treeStore.getAt(4)
            );

            t.waitForMs(1250, function () {

                let editor = viewController.showMailEditor(2253236, 'compose');
                let myValue = Ext.id();

                t.waitForMs(750, function () {

                    t.expect(editor.getViewModel().get('messageDraft').get('mailAccountId')).toBeTruthy();
                    t.expect(editor.getViewModel().get('messageDraft').get('mailFolderId')).toBeTruthy();
                    editor.down('#subjectField').setValue(myValue);

                    t.waitForMs(750, function () {

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

            t.expect(panel.down('cn_mail-mailfoldertree').getStore().getAt(4).get('type')).toBe('DRAFT');
            panel.down('cn_mail-mailfoldertree').getSelectionModel().select(
                panel.down('cn_mail-mailfoldertree').getStore().getAt(4)
            );

            t.waitForMs(1252, function () {

                let editor = viewController.showMailEditor(2253236, 'compose');
                let myValue = 'ff-snafu-876';
                editor.down('#subjectField').setValue(myValue);


                t.waitForMs(753, function () {

                    t.click(editor.down('#saveButton'));

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

                            t.expect(panel.down('cn_mail-mailfoldertree').getStore().getAt(5).get('type')).toBe('TRASH');
                            panel.down('cn_mail-mailfoldertree').getSelectionModel().select(
                                panel.down('cn_mail-mailfoldertree').getStore().getAt(5)
                            );

                            t.waitForMs(1756, function() {

                                subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                                t.expect(subjectCont[0].innerHTML).toContain(myValue);

                                panel.setActiveTab(editor);

                                editor.down('#subjectField').setValue('uaav-456');

                                t.click(editor.down('#saveButton'));

                                t.waitForMs(1757, function () {

                                    panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

                                    subjectCont = Ext.dom.Query.select("div[class=subject]", panel.down('cn_mail-mailmessagegrid').el.dom);
                                    t.expect(subjectCont[0].innerHTML).toContain('uaav-456');

                                    panel.setActiveTab(editor);
                                    editor.down('#subjectField').setValue('andagain');
                                    t.click(editor.down('#saveButton'));

                                    t.waitForMs(1758, function () {

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

        t.waitForMs(750, function () {

            let folder = panel.down('cn_mail-mailfoldertree').getStore().getAt(4);
            t.expect(folder.get('type')).toBe('DRAFT');
            panel.down('cn_mail-mailfoldertree').getSelectionModel().select(folder);

            t.waitForMs(1250, function () {

                let ck = '1';

                if (context != 'compose') {
                    ck = createMessageItem(1, folder.getId()).getCompoundKey();
                }

                let editor = viewController.showMailEditor(ck, context);
                let myValue = Ext.id();

                t.waitForMs(1250, function () {
                    editor.down('#subjectField').setValue(myValue);


                    t.waitForMs(750, function () {

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

            let draftFolder = mailFolderTree.getStore().getAt(4),
                inboxFolder = mailFolderTree.getStore().getAt(1);

            t.expect(draftFolder.get('type')).toBe('DRAFT');
            t.expect(inboxFolder.get('type')).toBe('INBOX');

            mailFolderTree.getSelectionModel().select(inboxFolder);

            t.waitForMs(1751, function () {

                let messageItem = messageGrid.getStore().getAt(0);
                messageItem.set('draft', false);

                messageGrid.getSelectionModel().select(messageItem);

                t.waitForMs(1752, function() {

                    let editor = viewController.showMailEditor(messageItem.getCompoundKey(), 'replyAll');

                    t.waitForMs(1753, function() {

                        panel.setActiveTab(inboxView);

                        mailFolderTree.getSelectionModel().select(draftFolder);

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

            let mailFolder = selectMailFolder(panel, 4);
            t.expect(mailFolder.get('type')).toBe('DRAFT');

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
                        t.click(yesButton[0]);


                        t.waitForMs(1754, function() {

                            editor.close();

                            t.expect(draft.get('cn_deleted')).toBeUndefined();
                            t.expect(draft.get('cn_moved')).toBeUndefined();

                            t.expect(draft.get('mailFolderId')).toBe('INBOX.Trash');

                            t.expect(panel.down('cn_mail-mailmessagegrid').getStore().getAt(0)
                                          .getCompoundKey().equalTo(draft.getCompoundKey())).toBe(false);

                            let trashMailFolder = selectMailFolder(panel, 5);
                            t.expect(trashMailFolder.get('type')).toBe('TRASH');

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
                                        t.click(yesButton[0]);

                                        t.waitForMs(1758, function() {

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

            let mailFolder = selectMailFolder(panel, 4);
            t.expect(mailFolder.get('type')).toBe('DRAFT');

            t.waitForMs(1752, function(){

                // intentionally not selected
                draft = panel.down('cn_mail-mailmessagegrid').getStore().getAt(0);
                t.expect(draft.get('mailFolderId')).toBe(mailFolder.getId());

                t.waitForMs(1753, function() {

                    mailFolder = selectMailFolder(panel, 5);
                    t.expect(mailFolder.get('type')).toBe('TRASH');

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
                                t.click(yesButton[0]);


                                t.waitForMs(1757, function() {

                                    editor.close();

                                    t.expect(draft.get('cn_deleted')).toBeUndefined();
                                    t.expect(draft.get('cn_moved')).toBeUndefined();


                                    t.expect(panel.down('cn_mail-mailinboxview').getController().getLivegrid().getRecordByCompoundKey(draft.getCompoundKey())).not.toBe(null);

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
            {getPreviousCompoundKey : prevCk, getId : Ext.emptyFn},
            inboxView,
            {getPreviousCompoundKey : prevCk, getId : Ext.emptyFn},
            {getPreviousCompoundKey : prevCk, get : Ext.emptyFn, getId : Ext.emptyFn});

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
            {getPreviousCompoundKey : prevCk, getId : Ext.emptyFn}, null,
            {getPreviousCompoundKey : prevCk, getId : Ext.emptyFn},
            {getPreviousCompoundKey : prevCk, get : Ext.emptyFn, getId : Ext.emptyFn});

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

            selectMailFolder(panel, 1);

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

                    selectMailFolder(panel, 3);

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

            selectMailFolder(panel, 1);

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

                    selectMailFolder(panel, 3);

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

            selectMailFolder(panel, 1);


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

                    selectMailFolder(panel, 3);

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

            selectMailFolder(panel, 1);

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



    t.it("onMessageItemMove() - updateMessageItemsFromOpenedViews() called", function(t) {

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


        t.waitForMs(750, function () {
            panel.destroy();
            panel = null;
        });
    });


});})});});});});