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

describe('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModelTest', function(t) {



    var viewModel;

    var view, viewConfig,
        createKey = function(id1, id2, id3) {
            return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
        },
        getMessageItemAt = function(messageIndex) {
            return conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);
        },
        createKeyForExistingMessage = function(messageIndex){
            let item = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);

            let key = createKey(
                item.mailAccountId, item.mailFolderId, item.id
            );

            return key;
        },
        createSession = function() {
            return Ext.create('conjoon.cn_core.data.Session', {
                schema : 'cn_mail-mailbaseschema',
                batchVisitorClassName : 'conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor'
            })
        },
        createWithSession = function() {
            return Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                messageDraft : Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig'),
                session      : createSession()
            });
        },
        testEditorMode = function(t, editMode) {
            view = Ext.create('Ext.Panel');
            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                view    : view,
                session      : createSession(),
                messageDraft : Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                    editMode    : editMode,
                    compoundKey : createKeyForExistingMessage(1),
                    defaultMailAccountId : 'foo',
                    defaultMailFolderId  : 'bar'
                })
            });

            var draft = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(createKeyForExistingMessage(1));

            t.waitForMs(500, function() {
                var body = draft.loadMessageBody();
                draft.loadAttachments();
                t.waitForMs(500, function() {
                    var attachments = draft.attachments().getRange();
                    var messageDraft = viewModel.get('messageDraft');
                    var messageBody  = viewModel.get('messageDraft.messageBody');

                    t.expect(messageDraft).not.toBe(draft);
                    t.expect(messageBody).not.toBe(body);

                    t.expect(messageDraft).toBeDefined();
                    t.expect(messageDraft.phantom).toBe(true);
                    t.expect(messageDraft.getId()).not.toBe(draft.getId());

                    t.expect(messageBody).toBeDefined();
                    t.expect(messageBody.phantom).toBe(true);
                    t.expect(messageBody.getId()).not.toBe(body.getId());

                    t.expect(messageDraft.get('subject')).toContain(draft.get('subject'));

                    if (editMode !== conjoon.cn_mail.data.mail.message.EditingModes.FORWARD) {
                        t.expect(messageDraft.get('to')[0].name).toBe(draft.get('from').name);
                        t.expect(messageDraft.get('to')[0].address).toBe(draft.get('from').address);
                    }
                    t.expect(messageBody.get('textHtml')).toContain(body.get('textHtml'));

                    // only Forwarded mails have their attachments copied.
                    // this should be put into a separate test class dealing
                    // with teh copier, but we'll leave it in here for now
                    if (editMode === conjoon.cn_mail.data.mail.message.EditingModes.FORWARD) {
                        var draftAttachments = messageDraft.attachments().getRange();
                        t.waitForMs(500, function() {
                            t.expect(attachments.length).toBe(draftAttachments.length);
                            t.expect(attachments.length).toBeGreaterThan(0);

                            for (var i = 0, len = draftAttachments.length; i < len; i++) {
                                t.expect(draftAttachments[i].getId()).not.toBe(attachments[i].getId());
                                var cmp1 = Ext.copy({}, draftAttachments[i].data, 'sourceId,size,text,type');
                                var cmp2 = Ext.copy({}, attachments[i].data, 'sourceId,size,text,type');
                                t.expect(cmp1).toEqual(cmp2);
                            }

                        });
                    } else {
                        t.expect(messageDraft.attachments().getRange().length).toBe(0);
                    }

                }) ;
            });
        };

    t.afterEach(function() {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }

        if (view) {
            view.destroy();
            view = null;
        }
    });


    t.requireOk('conjoon.cn_mail.data.mail.message.EditingModes', function(){
    t.requireOk('conjoon.cn_mail.data.mail.BaseSchema', function(){
    t.requireOk('conjoon.cn_core.data.Session', function(){
    t.requireOk('conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor', function(){
    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {



        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it('constructor() - exception', function(t) {

            var exc, e,
                cls = 'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel';

            try {Ext.create(cls);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("must be set");

            exc = e = undefined;

            try {Ext.create(cls, {});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("must be set");

            try {Ext.create(cls, {messageDraft : 1});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("MessageCompoundBatchVisitor");


            try {Ext.create(cls, {
                messageDraft : 1,
                session      : createSession()
            });} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("must either be an instance");

        });


        t.it('constructor() - messageDraft is messageDraftConfig', function(t) {

            t.isCalledOnce('createDraftFromData', conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype)

            Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session      : createSession(),
                messageDraft : Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig')
            });

        });


        t.it('constructor() - messageDraft is MessageDraftCopyRequest', function(t) {

            t.isCalledOnce('onMessageDraftCopyLoad', conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype);
            t.isCalled('processPendingCopyRequest', conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype);


            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session      : createSession(),
                messageDraft : Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                    compoundKey  : createKeyForExistingMessage(1),
                    editMode : conjoon.cn_mail.data.mail.message.EditingModes.FORWARD,
                    defaultMailAccountId : 'foo',
                    defaultMailFolderId  : 'bar'
                })
            });

            t.expect(viewModel.hasPendingCopyRequest()).toBe(false);

            try{viewModel.processPendingCopyRequest();}catch(e){exc=e;}
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg).toContain("is not available");

            t.waitForMs(750, function() {
                t.isInstanceOf(viewModel.messageDraftCopier, conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier);
            });

        });


        t.it('constructor() - MessageDraftCopyRequest is not properly configured', function(t) {

            t.isntCalled('onMessageDraftCopyLoad', conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype)

            let request = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                compoundKey  : createKeyForExistingMessage(1),
                editMode : conjoon.cn_mail.data.mail.message.EditingModes.FORWARD
            }), exc, e;

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session      : createSession(),
                messageDraft : request
            });

            t.expect(viewModel.hasPendingCopyRequest()).toBe(true);
            t.expect(viewModel.pendingCopyRequest).toBe(request);

            try{viewModel.processPendingCopyRequest();}catch(e){exc=e;}
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg).toContain("is not properly configured");

            try{viewModel.processPendingCopyRequest('foo');}catch(e){exc=e;}
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg).toContain("is not properly configured");

            try{viewModel.processPendingCopyRequest(null, 'foo');}catch(e){exc=e;}
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg).toContain("is not properly configured");
        });


        t.it('constructor() - MessageDraftCopyRequest is not properly configured, processing manually', function(t) {

            t.isCalled('onMessageDraftCopyLoad', conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype)

            let request = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                compoundKey  : createKeyForExistingMessage(1),
                editMode : conjoon.cn_mail.data.mail.message.EditingModes.FORWARD
            }), exc, e;

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session      : createSession(),
                messageDraft : request
            });

            t.expect(viewModel.hasPendingCopyRequest()).toBe(true);
            t.expect(viewModel.pendingCopyRequest).toBe(request);

            viewModel.processPendingCopyRequest('foo', 'bar');

            t.expect(viewModel.hasPendingCopyRequest()).toBe(false);

            t.waitForMs(750, function() {
                t.expect(viewModel.get('messageDraft').get('mailAccountId')).toBe('foo');
                t.expect(viewModel.get('messageDraft').get('mailFolderId')).toBe('bar');
            });

        });



        t.it('constructor() - messageDraft is compound key', function(t) {

            let index = 1;

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session      : createSession(),
                messageDraft : createKeyForExistingMessage(index)
            });

            let messageItem = getMessageItemAt(index);

            t.waitForMs(500, function() {
                t.expect(viewModel.get('messageDraft').get('id')).toBe(messageItem.id);
                t.expect(viewModel.get('messageDraft').get('mailAccountId')).toBe(messageItem.mailAccountId);
                t.expect(viewModel.get('messageDraft').get('mailFolderId')).toBe(messageItem.mailFolderId);
            });

        });



        t.it('createDraftFromData()', function(t) {

            viewModel = createWithSession();

            var exc, e;

            try{viewModel.createDraftFromData()} catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain("must be an instance of");

            var c = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
                    subject  : 'SUBJECT',
                    textHtml : 'TEXTHTML'
                }),
                result;
            t.isCalledOnce('toObject', c);
            t.isCalledOnce('linkTo', viewModel);

            viewModel.createDraftFromData(c);

            t.waitForMs(500, function() {
                t.expect(viewModel.get('messageDraft.subject')).toBe('SUBJECT');
                t.expect(viewModel.get('messageDraft.messageBody.textHtml')).toBe('TEXTHTML');
            });

        });


        t.it('onMessageDraftCopyLoad()', function(t) {

            viewModel = createWithSession();

            t.isCalledOnce('createDraftFromData', viewModel);

            viewModel.onMessageDraftCopyLoad(null, Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig'));
        });


        t.it("Should create the ViewModel", function(t) {
            viewModel = createWithSession();

            t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);
            t.expect(viewModel.emptySubjectText).toBeDefined();
            t.expect(viewModel.alias).toContain('viewmodel.cn_mail-mailmessageeditorviewmodel');

            t.expect(viewModel.get('isSaving')).toBe(false);
            t.expect(viewModel.get('isSending')).toBe(false);
            t.expect(viewModel.get('isSubjectRequired')).toBe(true);

            t.waitForMs(500, function() {
                var formulas = viewModel.getFormulas(),
                    expected = [
                        'addressStoreData', 'getBcc', 'getCc',
                        'getSubject', 'getTo', 'isCcOrBccValueSet', 'isMessageBodyLoading',
                        'isAccountAndFolderSet'
                    ],
                    expectedCount = expected.length,
                    count = 0;

                for (var i in formulas) {
                    t.expect(expected).toContain(i);
                    count++;
                }
                t.expect(count).toBe(expectedCount);

                t.expect(viewModel.getStore('addressStore')).toBeDefined();
                t.expect(viewModel.getStore('addressStore').getModel().getName()).toBe(
                    'conjoon.cn_mail.model.mail.message.EmailAddress');
                t.expect(viewModel.get('messageDraft')).toBeDefined();
                t.expect(viewModel.get('messageDraft').phantom).toBe(true);
            });
        });


        t.it("Should create the ViewModel with data from the backend", function(t) {
            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session : createSession(),
                messageDraft : createKeyForExistingMessage(1)
            });

            let item = getMessageItemAt(1);

            t.waitForMs(500, function() {
                t.expect(viewModel.get('messageDraft')).toBeDefined();
                t.expect(viewModel.get('messageDraft').phantom).toBe(false);
                t.expect(viewModel.get('messageDraft').get('id')).toBe(item.id);
            });
        });


        t.it("Should make sure that getAddressValuesFromDraft works properly", function(t) {
            viewModel = createWithSession();

            var addresses = [{
                    address : 'a',
                    name    : 'a'
                }, {
                    address : 'b',
                    name    : 'b'
                }],
                expected = ['a', 'b'];

            t.expect(viewModel.getAddressValuesFromDraft('to', {to : addresses})).toEqual(expected);
            t.expect(viewModel.getAddressValuesFromDraft('cc', {cc : addresses})).toEqual(expected);
            t.expect(viewModel.getAddressValuesFromDraft('bcc', {bcc : addresses})).toEqual(expected);
            t.expect(viewModel.getAddressValuesFromDraft('to', {bcc : addresses})).toEqual([]);
        });


        t.it("Should make sure that setAddressesForDraft works properly", function(t) {
            viewModel = createWithSession();

            var addresses = [{
                    address : 'a',
                    name    : 'foo'
                }, {
                    address : 'b',
                    name    : 'bar'
                }],
                values   = ['a', 'b', 'c'],
                expected = [{
                    address : 'a',
                    name    : 'foo'
                }, {
                    address : 'b',
                    name    : 'bar'
                }, {
                    address : 'c',
                    name    : 'c'
                }];

            t.waitForMs(500, function() {

                t.expect(viewModel.get('messageDraft.to')).toEqual([]);
                t.expect(viewModel.get('messageDraft.cc')).toEqual([]);
                t.expect(viewModel.get('messageDraft.bcc')).toEqual([]);

                viewModel.getStore('addressStore').add(addresses);

                viewModel.setAddressesForDraft('to', values);
                viewModel.setAddressesForDraft('cc', values);
                viewModel.setAddressesForDraft('bcc', values);

                t.waitForMs(500, function() {
                    t.expect(viewModel.get('messageDraft.to')).toEqual(expected);
                    t.expect(viewModel.get('messageDraft.cc')).toEqual(expected);
                    t.expect(viewModel.get('messageDraft.bcc')).toEqual(expected);
                });

            });
        });


        t.it("Should make sure that addressStoreDate works properly", function(t) {
            viewModel = createWithSession();

            var formulas = viewModel.getFormulas(),
                data     = {
                    to : [{
                        address : 'a'
                    }],
                    cc : [{
                        address : 'b'
                    }],
                    bcc : [{
                        address : 'c'
                    }]
                },
                expected = [{address : 'a'}, {address : 'b'}, {address : 'c'}];

            t.expect(formulas.addressStoreData.set).toBeUndefined();
            t.expect(formulas.addressStoreData.single).toBe(true);
            t.expect(formulas.addressStoreData.get(data)).toEqual(expected);
        });


        t.it("Should make sure that isCcOrBccValueSet works properly", function(t) {
            viewModel = createWithSession();

            var formulas = viewModel.getFormulas(),
                data     = {
                    cc : [{
                        address : 'b'
                    }],
                    bcc : [{
                        address : 'c'
                    }]
                };


            t.expect(formulas.isCcOrBccValueSet.set).toBeUndefined();
            t.expect(formulas.isCcOrBccValueSet.single).not.toBe(true);
            t.expect(formulas.isCcOrBccValueSet.get(data)).toBe(true);

            t.expect(formulas.isCcOrBccValueSet.get({})).toBe(false);
            t.expect(formulas.isCcOrBccValueSet.get({
                cc : [{
                    address : 'b'
                }]
            })).toBe(true);
            t.expect(formulas.isCcOrBccValueSet.get({
                bcc : [{
                    address : 'b'
                }]
            })).toBe(true);
            t.expect(formulas.isCcOrBccValueSet.get({
                bcc : []
            })).toBe(false);

        });


        t.it("Should make sure that getSubject works properly", function(t) {
            viewModel = createWithSession();

            var formulas       = viewModel.getFormulas(),
                defaultSubject = viewModel.emptySubjectText;

            t.expect(formulas.getSubject.set).toBeDefined();
            t.expect(formulas.getSubject.single).not.toBe(true);
            t.expect(formulas.getSubject.get.apply(viewModel, [{}])).toBe(defaultSubject);
            t.expect(formulas.getSubject.get.apply(viewModel, [{subject : ''}])).toBe(defaultSubject);

            formulas.getSubject.set.apply(viewModel);
            t.expect(viewModel.get('messageDraft.subject')).toBe(defaultSubject);
            formulas.getSubject.set.apply(viewModel, ['test']);
            t.expect(viewModel.get('messageDraft.subject')).toBe('test');
        });


        t.it("Should make sure that isMessageBodyLoading works properly", function(t) {
            viewModel = createWithSession();

            var formulas = viewModel.getFormulas();

            t.expect(formulas.isMessageBodyLoading).toBeDefined();
            t.expect(formulas.isMessageBodyLoading.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);

            viewModel.set(
                'messageDraft.messageBody',
                viewModel.getSession().createRecord('MessageBody', {prop : 'foo'})
            );

            t.expect(formulas.isMessageBodyLoading.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);

            viewModel.get('messageDraft.messageBody').loading = true;

            t.expect(formulas.isMessageBodyLoading.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(true);

        });


        t.it("Should make sure that isAccountAndFolderSet works properly", function(t) {
            viewModel = createWithSession();

            var formulas = viewModel.getFormulas();

            t.expect(formulas.isAccountAndFolderSet).toBeDefined();
            t.expect(formulas.isAccountAndFolderSet.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);

            viewModel.get('messageDraft').set('mailAccountId', 'foo');

            t.expect(formulas.isAccountAndFolderSet.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);

            viewModel.get('messageDraft').set('mailFolderId', 'bar');

            t.expect(formulas.isAccountAndFolderSet.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(true);

        });


        t.it("Should create the ViewModel with data from the backend - replyTo", function(t) {
            testEditorMode(t, conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO);
        });


        t.it("Should create the ViewModel with data from the backend - replyAll", function(t) {
            testEditorMode(t, conjoon.cn_mail.data.mail.message.EditingModes.REPLY_ALL);
        });


        t.it("Should create the ViewModel with data from the backend - forward", function(t) {
            testEditorMode(t, conjoon.cn_mail.data.mail.message.EditingModes.FORWARD);
        });


        t.it('constructor() - messageDraft is compound key, but message cannot be found conjoon/app-cn_mail#64', function(t) {

            let CK       = createKey(1, 2, 3),
                session  = createSession(),
                existing = createKeyForExistingMessage(1),
                draft;

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session      : session,
                messageDraft : CK
            });


            t.waitForMs(750, function() {
                t.expect(viewModel.get('messageDraft')).toBeFalsy();
                t.expect(session.peekRecord('MessageDraft', CK.toLocalId())).toBeFalsy();


                let newVm = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                    session      : session,
                    messageDraft : existing
                });

                t.waitForMs(750, function() {

                    // test loading of compoundKey and makse sure session is
                    // set properly
                    t.expect(newVm.get('messageDraft')).toBeTruthy();
                    t.expect(session.peekRecord('MessageDraft', existing.toLocalId())).toBe(newVm.get('messageDraft'));
                    newVm.destroy();
                    newVm = null;

                    session  = createSession(),
                    draft    = Ext.create(
                        'conjoon.cn_mail.model.mail.message.MessageDraft',
                        Ext.applyIf({localId : existing.toLocalId()}, Ext.apply({}, getMessageItemAt(1))));
                    existing = createKeyForExistingMessage(1);

                    t.expect(draft.getCompoundKey().equalTo(existing)).toBe(true);
                    t.expect(draft.getId()).toBe(existing.toLocalId());
                    session.adopt(draft);

                    newVm = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                        session      : session,
                        messageDraft : existing
                    });

                    // make sure record will be re-used if found in session
                    t.expect(newVm.get('messageDraft')).toBeTruthy();
                    t.expect(session.peekRecord('MessageDraft', existing.toLocalId())).toBe(newVm.get('messageDraft'));

                });

            });

        });




})});});});});});