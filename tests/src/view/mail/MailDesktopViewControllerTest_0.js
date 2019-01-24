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

describe('conjoon.cn_mail.view.mail.MailDesktopViewControllerTest', function(t) {

    const TIMEOUT = 1250,
        discardView = function(t) {

            t.waitForMs(1, function() {
                if (panel) {

                    panel.destroy();
                    panel = null;

                    t.waitForMs(1, function() {});
                }
            });
        },
        createKey = function(id1, id2, id3) {
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


    t.beforeEach(function() {
        conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.resetAll();
    });



t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function () {
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
            renderTo : document.body,
            width  : 800,
            height : 600
        });

        panel.down('cn_mail-mailinboxview').down('cn_mail-mailmessagereadermessageview')
            .fireEvent('cn_mail-mailmessageitemread', getRecordCollection());

        t.expect(_testMailFolders).toBe(null);

        var mv = panel.add({
            xclass : 'conjoon.cn_mail.view.mail.message.reader.MessageView'
        });

        mv.fireEvent('cn_mail-mailmessageitemread', getRecordCollection());

        t.expect(_testMailFolders).not.toBe(null);

        discardView(t);
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

            panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
                    width    : 800,
                    height   : 600,
                    renderTo : document.body
                });
             let ctrl  = panel.getController(),
                store, rec, rec2, view;

            let exc, e;

        try {ctrl.showMailMessageViewFor('foo');}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");


        t.waitForMs(TIMEOUT, function() {

            selectMailFolder(panel, getChildAt(panel, 'dev_sys_conjoon_org', 0, 'INBOX', t));

            t.waitForMs(TIMEOUT, function() {

                store = panel.down('cn_mail-mailmessagegrid').getStore();
                rec   = store.getAt(0);
                rec2  = store.getAt(1);

                t.expect(rec).toBeTruthy();
                t.expect(rec2).toBeTruthy();

                t.expect(rec.get('id')).toBe(rec.get('id') + '');

                // existing records reused from store
                t.expect(panel.down('#' +ctrl.getItemIdForMessageRelatedView(rec.getCompoundKey(), 'read'))).toBe(null);
                view = ctrl.showMailMessageViewFor(
                    MessageEntityCompoundKey.createFor(
                        rec.get('mailAccountId'), rec.get('mailFolderId'), rec.get('id')
                    )
                );
                t.expect(panel.down('#' +ctrl.getItemIdForMessageRelatedView(rec.getCompoundKey(), 'read'))).not.toBe(null);
                t.expect(panel.getActiveTab()).toBe(panel.down('#' +ctrl.getItemIdForMessageRelatedView(rec.getCompoundKey(), 'read')));
                t.expect(panel.getActiveTab()).toBe(view);


                t.expect(panel.down('#' +ctrl.getItemIdForMessageRelatedView(rec2.getCompoundKey(), 'read'))).toBe(null);
                view = ctrl.showMailMessageViewFor(MessageEntityCompoundKey.createFor(rec2.get('mailAccountId'), rec2.get('mailFolderId'), rec2.get('id')));
                t.expect(panel.down('#' +ctrl.getItemIdForMessageRelatedView(rec2.getCompoundKey(), 'read'))).not.toBe(null);
                t.expect(panel.getActiveTab()).toBe(panel.down('#' +ctrl.getItemIdForMessageRelatedView(rec2.getCompoundKey(), 'read')));
                t.expect(panel.getActiveTab()).toBe(view);

                t.expect(panel.down('#' + ctrl.getItemIdForMessageRelatedView(rec.getCompoundKey(), 'read'))).not.toBe(null);
                view = ctrl.showMailMessageViewFor(MessageEntityCompoundKey.createFor(rec.get('mailAccountId'), rec.get('mailFolderId'), rec.get('id')));
                t.expect(panel.getActiveTab()).toBe(panel.down('#' + ctrl.getItemIdForMessageRelatedView(rec.getCompoundKey(), 'read')));
                t.expect(panel.getActiveTab()).toBe(view);

                // remote Loading
                let remoteRec, remoteCompoundKey, remoteLocalId, ind = 0;

                for (ind = 0; ind < 1000; ind++) {
                    remoteRec = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(ind),
                    remoteCompoundKey = MessageEntityCompoundKey.createFor(remoteRec.mailAccountId, remoteRec.mailFolderId, remoteRec.id),
                    remoteLocalId = remoteCompoundKey.toLocalId();

                    if (store.findExact('localId', remoteLocalId) === -1) {
                        break;
                    }
                }

                t.expect(ind).toBeLessThan(1000);
                t.expect(store.findExact('localId', remoteLocalId)).toBe(-1);


                t.expect(panel.down('#' + ctrl.getItemIdForMessageRelatedView(remoteCompoundKey, 'read'))).toBe(null);
                view = ctrl.showMailMessageViewFor(remoteCompoundKey);
                t.expect(panel.getActiveTab()).toBe(view);

                t.waitForMs(TIMEOUT, function() {

                    t.expect(panel.getActiveTab()).toBe(panel.down('#' + ctrl.getItemIdForMessageRelatedView(remoteCompoundKey, 'read')));

                    discardView(t);
                });

            });
        });

    });


    t.it("getItemIdForMessageRelatedView()", function(t) {
        var ctrl = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopViewController'
        ), exc, e, tests, res, results = [];


        let key = MessageEntityCompoundKey.createFor(1, 2, 3);

        tests = [{
            args     : [2],
            expected : 'Exception',
            contains : 'valid value'
        }, {
            args     : [key, 'read'],
            expected : 'cn_mail-read-' + key.toLocalId()
        }, {
            args     : [key, 'edit'],
            expected : 'cn_mail-edit-' + key.toLocalId()
        }, {
            args     : [key, 'replyTo'],
            expected : 'cn_mail-replyTo-' + key.toLocalId()
        }, {
            args     : [key, 'replyAll'],
            expected : 'cn_mail-replyAll-' + key.toLocalId()
        }, {
            args     : [key, 'forward'],
            expected : 'cn_mail-forward-' + key.toLocalId()
        }, {
            args     : ['8797dssdggddsg', 'compose'],
            expected : 'cn_mail-compose-8797dssdggddsg'
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
                try{ctrl.getItemIdForMessageRelatedView.apply(ctrl, tests[i].args);}catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain(tests[i].contains);
            } else {
                res = ctrl.getItemIdForMessageRelatedView.apply(ctrl, tests[i].args);
                t.expect(res).toContain('cn_mail-' + tests[i].args[1]);
                results[i] = res;
            }
        }

        for (var i = 0, len = tests.length; i < len; i++) {
            if (tests[i].expected == 'Exception') {
                continue;
            } else {
                t.expect(ctrl.getItemIdForMessageRelatedView.apply(ctrl, tests[i].args)
                ).toBe(results[i]);
            }
        }

        ctrl.destroy();
    });


    t.it("buildCnHref()", function(t) {
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
            expected : 'cn_mail/message/edit/' + key.toArray().join('/')
        }, {
            args     : [key, 'read'],
            expected : 'cn_mail/message/read/' + key.toArray().join('/')
        }, {
            args     : [key, 'replyTo'],
            expected : 'cn_mail/message/replyTo/' + key.toArray().join('/')
        }, {
            args     : [key, 'replyAll'],
            expected : 'cn_mail/message/replyAll/' + key.toArray().join('/')
        }, {
            args     : [key, 'forward'],
            expected : 'cn_mail/message/forward/' + key.toArray().join('/')
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
                try{ctrl.buildCnHref.apply(ctrl, tests[i].args);}catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain(tests[i].contains);
            } else {
                t.expect(ctrl.buildCnHref.apply(ctrl, tests[i].args)).toBe(
                    tests[i].expected);
            }
        }

        ctrl.destroy();
        ctrl = null;
    });


    t.it("showMailEditor()", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.MailDesktopView', {
                width    : 800,
                height   : 600,
                renderTo : document.body
            })

        let  ctrl  = panel.getController(),
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

        t.waitForMs(TIMEOUT, function() {
            discardView(t);
        });


    });



    t.it("updateHistoryForMessageRelatedView() - exceptions", function(t) {

        let exc, e,
            viewController = Ext.create(
                'conjoon.cn_mail.view.mail.MailDesktopViewController'
            ),
            draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                mailFolderId : '1',
                mailAccountId : '1',
                id : '1'
            });

        try{viewController.updateHistoryForMessageRelatedView({isCnMessageEditor : true}, {});}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');
        exc = undefined;

        try{viewController.updateHistoryForMessageRelatedView(undefined, draft);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('is not a valid value');
        t.expect(exc.msg.toLowerCase()).toContain('type');
        exc = undefined;

        try{viewController.updateHistoryForMessageRelatedView({isCnMessageEditor : true, editMode : 'foo'}, draft);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('of editor must be ');
        t.expect(exc.msg.toLowerCase()).toContain('editmode');

        viewController.destroy();
    });


    t.it("updateHistoryForMessageRelatedView() - editor IS NOT active tab", function(t) {

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
        for (let id in viewController.messageViewIdMap) {
            if (viewController.messageViewIdMap[id] === itemId) {
                oldId = id;
                break;
            }
        }

        t.expect(oldId).not.toBeUndefined();

        t.waitForMs(TIMEOUT, function() {
            let token   = Ext.History.getToken(),
                cn_href = editor.cn_href;

            t.expect(token).toBe(cn_href);

            panel.setActiveTab(panel.down('cn_mail-mailinboxview'));

            let ret = viewController.updateHistoryForMessageRelatedView(editor, draft);

            t.waitForMs(TIMEOUT, function() {
                let newToken  = Ext.History.getToken(),
                    newCnHref = editor.cn_href;

                t.expect(ret).toBe(newCnHref);
                t.expect(newToken).not.toBe(newCnHref);

                t.expect(viewController.messageViewIdMap[oldId]).toBeUndefined()

                for (let id in viewController.messageViewIdMap) {
                    if (viewController.messageViewIdMap[id] === itemId) {
                        newId = id;
                        break;
                    }
                }

                t.expect(newId).toBeDefined();
                t.expect(newId).not.toBe(oldId);

                discardView(t);
            });
        });
    });


    t.it("updateHistoryForMessageRelatedView() - editor IS active tab", function(t) {

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

        let editor = viewController.showMailEditor(8989, 'compose');

        let oldId, newId, itemId = editor.getItemId();
        for (let id in viewController.messageViewIdMap) {
            if (viewController.messageViewIdMap[id] === itemId) {
                oldId = id;
                break;
            }
        }

        t.expect(oldId).not.toBeUndefined();

        t.waitForMs(TIMEOUT, function() {
            let token   = Ext.History.getToken(),
                cn_href = editor.cn_href;

            t.expect(token).toBe(cn_href);

            t.expect(panel.getActiveTab()).toBe(editor);

            let ret = viewController.updateHistoryForMessageRelatedView(editor, draft);

            t.waitForMs(TIMEOUT, function() {
                let newToken  = Ext.History.getToken(),
                    newCnHref = editor.cn_href;

                t.expect(ret).toBe(newCnHref);
                t.expect(newToken).toBe(newCnHref);

                // newId and such is tested in other testcase

                discardView(t);
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
            height     : 600
        });

        t.waitForMs(TIMEOUT, function() {
            messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                id      : 1,
                mailFolderId : 2,
                mailAccountId : 3,
                subject : 'FOOBAR'
            });
            messageDraft.setMessageBody({
                textHtml : '', textPlain : ''
            });

            t.waitForMs(TIMEOUT, function() {
                t.isCalledNTimes('updateItemWithDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 0);
                viewController.onMailMessageSaveComplete(getDummyEditor(), messageDraft);
                discardView(t);
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
            height     : 600
        });

        inboxView        = panel.down('cn_mail-mailinboxview');
        inboxMessageView = inboxView.down('cn_mail-mailmessagereadermessageview');
        grid             = panel.down('cn_mail-mailmessagegrid');

        mailFolderTree = panel.down('cn_mail-mailfoldertree');

        t.waitForMs(TIMEOUT, function() {
            draftNode = mailFolderTree.getStore().findNode('cn_folderType', 'DRAFT');
            mailFolderTree.getSelectionModel().select(draftNode);

            t.waitForMs(TIMEOUT, function() {

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

                t.waitForMs(TIMEOUT, function() {
                    messageDetailView = panel.down('#' + viewController.getItemIdForMessageRelatedView(firstRowCK, 'read'));
                    t.expect(messageDetailView).toBeTruthy();

                    t.isCalledNTimes('updateItemWithDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 1);
                    t.isCalledNTimes('updateMessageItem',  messageDetailView, 0);
                    t.isCalledNTimes('updateMessageItem',  inboxMessageView, 0);
                    viewController.onMailMessageSaveComplete(getDummyEditor(), messageDraft);
                    t.expect(gridStore.getAt(1).get('subject')).not.toBe(oldSubject);
                    t.expect(gridStore.getAt(1).get('date')).toBe(oldDate);
                    t.expect(gridStore.getAt(1).get('subject')).toBe(messageDraft.get('subject'));

                    discardView(t);
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
            height     : 600
        });

        inboxView        = panel.down('cn_mail-mailinboxview');
        inboxMessageView = inboxView.down('cn_mail-mailmessagereadermessageview');
        grid             = panel.down('cn_mail-mailmessagegrid');


        mailFolderTree = panel.down('cn_mail-mailfoldertree');

        t.waitForMs(TIMEOUT, function() {
            draftNode      = mailFolderTree.getStore().findNode('cn_folderType', 'DRAFT');
            mailFolderTree.getSelectionModel().select(draftNode);

            t.waitForMs(TIMEOUT, function() {

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

                t.waitForMs(TIMEOUT, function() {
                    messageDetailView = panel.down('#' + viewController.getItemIdForMessageRelatedView(firstRowCK, 'read'));
                    t.expect(messageDetailView).toBeTruthy();

                    // since app-an_mail#95 called 3 times
                    t.isCalledNTimes('updateItemWithDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 3);
                    t.isCalledNTimes('updateMessageItem',  messageDetailView, 1);
                    t.isCalledNTimes('updateMessageItem',  inboxMessageView, 1);
                    viewController.onMailMessageSaveComplete(getDummyEditor(), messageDraft);
                    t.expect(gridStore.getAt(0).get('subject')).not.toBe(oldSubject);
                    t.expect(gridStore.getAt(0).get('date')).toBe(oldDate);
                    t.expect(gridStore.getAt(0).get('subject')).toBe(messageDraft.get('subject'));

                    discardView(t);
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
            height     : 600
        });

        let newPanel = Ext.create('Ext.Panel', {title : 'foo'});

        panel.add(newPanel);
        panel.setActiveTab(newPanel);

        let inboxView = panel.down('cn_mail-mailinboxview');

        t.isCalled('processMailFolderSelectionForRouting', viewController);


        t.expect(panel.getActiveTab()).toBe(newPanel);
        t.expect(viewController.showInboxViewFor('dev_sys_conjoon_org', 'INBOX.Sent Messages')).toBe(inboxView);
        t.expect(panel.getActiveTab()).toBe(inboxView);

        t.expect(panel.down('cn_mail-mailinboxview').down('cn_mail-mailfoldertree').getStore().getProxy().type).toBe('memory');


        t.waitForMs(Math.max(1000 + 750, TIMEOUT), function() {

            panel.setActiveTab(newPanel);
            t.expect(viewController.showInboxViewFor('dev_sys_conjoon_org', 'INBOX.Drafts')).toBe(panel.down('cn_mail-mailinboxview'));
            t.expect(panel.getActiveTab()).toBe(inboxView);


            discardView(t);
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

        t.waitForMs(TIMEOUT, function() {


            let cnhref = inboxView.cn_href;
            t.expect(cnhref).toBe('cn_mail/home');

            t.expect(viewController.processMailFolderSelectionForRouting('foo')).toBe(false);

            t.expect(cnhref).toBe(inboxView.cn_href);

            let treeStore = inboxView.down('cn_mail-mailfoldertree').getStore(),
                node = treeStore.getNodeById('dev_sys_conjoon_org-INBOX');

            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys_conjoon_org', 'INBOX')).toBe(true);
            t.expect(inboxView.cn_href).toBe(node.toUrl());
            t.expect(Ext.History.getToken()).toBe(inboxView.cn_href);
            t.expect(inboxView.down('cn_mail-mailfoldertree').getSelection()[0]).toBe(node);

            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys_conjoon_org', "INBOX.Sent Messages")).toBe(true);

            node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById("dev_sys_conjoon_org-INBOX.Sent Messages");
            t.expect(viewController.processMailFolderSelectionForRouting('dev_sys_conjoon_org', "INBOX.Sent Messages")).toBe(true);
            t.expect(inboxView.cn_href).toBe(node.toUrl());
            t.expect(Ext.History.getToken()).toBe(inboxView.cn_href);
            t.expect(inboxView.down('cn_mail-mailfoldertree').getSelection()[0]).toBe(node);

            discardView(t);
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

        t.waitForMs(TIMEOUT, function() {

            let treeStore = inboxView.down('cn_mail-mailfoldertree').getStore(),
                node = treeStore.getNodeById("dev_sys_conjoon_org-INBOX");

            inboxView.down('cn_mail-mailfoldertree').getSelectionModel().select(node);
            viewController.showInboxViewFor('dev_sys_conjoon_org', "INBOX");
            t.expect(inboxView.cn_href).toBe(node.toUrl());

            panel.setActiveTab(newPanel);

            node = inboxView.down('cn_mail-mailfoldertree').getStore().getNodeById("dev_sys_conjoon_org-INBOX.Sent Messages");
            inboxView.down('cn_mail-mailfoldertree').getSelectionModel().select(node);
            viewController.showInboxViewFor('dev_sys_conjoon_org', "INBOX.Sent Messages");
            t.expect(inboxView.cn_href).toBe(node.toUrl());

            panel.setActiveTab(newPanel);

            panel.setActiveTab(inboxView);
            t.expect(inboxView.cn_href).toBe(node.toUrl());

            discardView(t);
        });

    });
return;

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


        discardView(t);
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


        t.waitForMs(TIMEOUT, function() {

            let inboxView = panel.down('cn_mail-mailinboxview'),
                msgv      = inboxView.down('cn_mail-mailmessagereadermessageview'),
                btnra     = inboxView.down('#btn-forward'),
                btnr      = inboxView.down('#btn-reply'),
                btnf      = inboxView.down('#btn-replyall'),
                btne      = inboxView.down('#btn-editdraft');

            msgv.setMessageItem(getRecordCollection()[0]);

            viewController.showMailEditor = function() {

            };

            t.isCalled('onInboxViewReplyAllClick', viewController);
            t.isCalled('onInboxViewReplyClick', viewController);
            t.isCalled('onInboxViewForwardClick', viewController);
            t.isCalled('onInboxViewEditDraftClick', viewController);
            t.isCalledNTimes('redirectToEditorFromInboxMessageView', viewController, 4);

            btnra.fireEvent('click');
            btnr.fireEvent('click');
            btnf.fireEvent('click');
            btne.fireEvent('click');


            discardView(t);
        });

    });


});})});