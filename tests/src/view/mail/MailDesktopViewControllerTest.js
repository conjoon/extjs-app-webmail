/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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

    var panel,
        getRecordCollection = function() {
            return [
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 1,
                    mailFolderId : 1
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 2,
                    mailFolderId : 1
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 3,
                    mailFolderId : 2
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 4,
                    mailFolderId : 2
                }),
                Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id           : 5,
                    mailFolderId : 2
                })
            ];
        };


    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

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
                expected : {to : [{name : 'test@domain.tld', address : 'test@domain.tld'}]}
            }, {
                value    : 'mailto:',
                expected : {}
            }, {
                value    : 'maito:',
                expected : {}
            },{
                value    : 'mailto%3Atest1@domain.tld',
                expected :{to : [{name : 'test1@domain.tld', address : 'test1@domain.tld'}]}
            }, {
                value    : 'mailto%3Aaddress1@domain1.tld1,address2@domain2.tld2?subject=registerProtocolHandler()%20FTW!&body=Check%20out%20what%20I%20learned%20at%20http%3A%2F%2Fupdates.html5rocks.com%2F2012%2F02%2FGetting-Gmail-to-handle-all-mailto-links-with-registerProtocolHandler%0A%0APlus%2C%20flawless%20handling%20of%20the%20subject%20and%20body%20parameters.%20Bonus%20from%20RFC%202368!',
                expected : {
                    to          : [{name : 'address1@domain1.tld1', address : 'address1@domain1.tld1'}, {name : 'address2@domain2.tld2', address : 'address2@domain2.tld2'}],
                    subject     : 'registerProtocolHandler() FTW!',
                    messageBody : {
                        textHtml : 'Check out what I learned at http://updates.html5rocks.com/2012/02/Getting-Gmail-to-handle-all-mailto-links-with-registerProtocolHandler\n\nPlus, flawless handling of the subject and body parameters. Bonus from RFC 2368!'
                    }
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
            t.expect(Ext.util.History.getToken()).toBe('cn_mail/message/read/' + records[0].get('id'));

            ctrl.onMailMessageGridDoubleClick(null, records[1]);
            t.expect(Ext.util.History.getToken()).toBe('cn_mail/message/read/' + records[1].get('id'));

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
                    store, rec, rec2;

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
                        t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec.get('id'))).toBe(null);
                        ctrl.showMailMessageViewFor(rec.get('id'));
                        t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec.get('id'))).not.toBe(null);
                        t.expect(panel.getActiveTab()).toBe(panel.down('#cn_mail-mailmessagereadermessageview-'  + rec.get('id')));

                        t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec2.get('id'))).toBe(null);
                        ctrl.showMailMessageViewFor( + rec2.get('id'));
                        t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec2.get('id'))).not.toBe(null);
                        t.expect(panel.getActiveTab()).toBe(panel.down('#cn_mail-mailmessagereadermessageview-'  + rec2.get('id')));

                        t.expect(panel.down('#cn_mail-mailmessagereadermessageview-' + rec.get('id'))).not.toBe(null);
                        ctrl.showMailMessageViewFor(rec.get('id'));
                        t.expect(panel.getActiveTab()).toBe(panel.down('#cn_mail-mailmessagereadermessageview-' + rec.get('id')));

                        // remote Loading
                        t.expect(store.findExact('id', '1')).toBe(-1);
                        t.expect(panel.down('#cn_mail-mailmessagereadermessageview-1')).toBe(null);
                        ctrl.showMailMessageViewFor(1);

                        t.waitForMs(500, function() {

                            t.expect(panel.getActiveTab()).toBe(panel.down('#cn_mail-mailmessagereadermessageview-1'));


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

            tests = [{
                args     : [2],
                expected : 'Exception'
            }, {
                args     : [8797, 'edit'],
                expected : 'cn_mail-mailmessageeditor-edit-8797'
            }, {
                args     : ['8', 'replyTo'],
                expected : 'cn_mail-mailmessageeditor-replyTo-8'
            }, {
                args     : ['7', 'replyAll'],
                expected : 'cn_mail-mailmessageeditor-replyAll-7'
            }, {
                args     : ['9', 'forward'],
                expected : 'cn_mail-mailmessageeditor-forward-9'
            }, {
                args     : ['8797dssdggddsg', 'compose'],
                expected : 'cn_mail-mailmessageeditor-compose-8797dssdggddsg'
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
                    try{ctrl.getItemIdForMessageEditor.apply(ctrl, tests[i].args);}catch(e){
                        exc = e;
                    }
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toContain("valid value");
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
        });


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



    });

});
