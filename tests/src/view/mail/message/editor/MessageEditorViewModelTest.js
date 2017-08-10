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

describe('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModelTest', function(t) {

    var viewModel;

    var view,
        viewConfig,
        createWithSession = function() {
            return Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session : Ext.create('Ext.data.Session', {
                    schema : 'cn_mail-mailbaseschema'
                })
            });
        };

    t.afterEach(function() {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }
    });

    t.requireOk('conjoon.cn_mail.data.mail.BaseSchema', function(){
    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        t.it("Should create the ViewModel", function(t) {
            viewModel = createWithSession();

            t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);
            t.expect(viewModel.emptySubjectText).toBeDefined();
            t.expect(viewModel.alias).toContain('viewmodel.cn_mail-mailmessageeditorviewmodel');

            t.expect(viewModel.get('isSaving')).toBe(false);
            t.expect(viewModel.get('isSending')).toBe(false);
            t.expect(viewModel.get('isSubjectRequired')).toBe(true);

            t.expect(conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.MODE_REPLY_TO).toBeDefined();
            t.expect(conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.MODE_REPLY_ALL).toBeDefined();
            t.expect(conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.MODE_FORWARD).toBeDefined();

            t.waitForMs(500, function() {
                var formulas = viewModel.getFormulas(),
                    expected = [
                        'addressStoreData', 'getBcc', 'getCc',
                        'getSubject', 'getTo', 'isCcOrBccValueSet', 'isMessageBodyLoading'
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
                session : Ext.create('Ext.data.Session', {
                    schema : 'cn_mail-mailbaseschema'
                }),
                links : {
                    messageDraft : {
                        type : 'MessageDraft',
                        id   : 1
                    }
                }
            });

            t.waitForMs(500, function() {
                t.expect(viewModel.get('messageDraft')).toBeDefined();
                t.expect(viewModel.get('messageDraft').phantom).toBe(false);
                t.expect(viewModel.get('messageDraft').get('id')).toBe('1');
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


        t.it("Should create the ViewModel with data from the backend - replyTo", function(t) {
            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session : Ext.create('Ext.data.Session', {
                    schema : 'cn_mail-mailbaseschema'
                }),
                editMode : {
                    type : conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.MODE_REPLY_TO,
                    id   : 1
                }
            });

            var draft = conjoon.cn_mail.model.mail.message.MessageDraft.load(1);
            t.waitForMs(100, function() {
                var body = draft.getMessageBody();
                t.waitForMs(100, function() {

                    var messageDraft = viewModel.get('messageDraft');
                    var messageBody  = viewModel.get('messageDraft.messageBody');

                    t.expect(messageDraft).not.toBe(draft);
                    t.expect(messageBody).not.toBe(body);

                    t.expect(messageDraft).toBeDefined();
                    t.expect(messageDraft.phantom).toBe(true);
                    t.expect(messageDraft.get('id')).not.toBe(draft.get('id'));

                    t.expect(messageBody).toBeDefined();
                    t.expect(messageBody.phantom).toBe(true);
                    t.expect(messageBody.get('id')).not.toBe(body.get('id'));

                    t.expect(messageDraft.get('subject')).toBe(draft.get('subject'));
                    t.expect(messageDraft.get('to')[0].name).toBe(draft.get('from').name);
                    t.expect(messageDraft.get('to')[0].address).toBe(draft.get('from').address);

                    t.expect(messageBody.get('textHtml')).toBe(body.get('textHtml'));

                }) ;
            });
        });


        t.it("Should create the ViewModel with data from the backend - replyAll", function(t) {
            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session : Ext.create('Ext.data.Session', {
                    schema : 'cn_mail-mailbaseschema'
                }),
                editMode : {
                    type : conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.MODE_REPLY_ALL,
                    id   : 1
                }
            });

            var draft = conjoon.cn_mail.model.mail.message.MessageDraft.load(1);
            t.waitForMs(100, function() {
                var body = draft.getMessageBody();
                t.waitForMs(100, function() {

                    var messageDraft = viewModel.get('messageDraft');
                    var messageBody  = viewModel.get('messageDraft.messageBody');

                    t.expect(messageDraft).not.toBe(draft);
                    t.expect(messageBody).not.toBe(body);

                    t.expect(messageDraft).toBeDefined();
                    t.expect(messageDraft.phantom).toBe(true);
                    t.expect(messageDraft.get('id')).not.toBe(draft.get('id'));

                    t.expect(messageBody).toBeDefined();
                    t.expect(messageBody.phantom).toBe(true);
                    t.expect(messageBody.get('id')).not.toBe(body.get('id'));

                    t.expect(messageDraft.get('subject')).toBe(draft.get('subject'));
                    t.expect(messageDraft.get('to')[0].name).toBe(draft.get('from').name);
                    t.expect(messageDraft.get('to')[0].address).toBe(draft.get('from').address);

                    t.expect(messageBody.get('textHtml')).toBe(body.get('textHtml'));

                }) ;
            });
        });


        t.it("Should create the ViewModel with data from the backend - forward", function(t) {
            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel', {
                session : Ext.create('Ext.data.Session', {
                    schema : 'cn_mail-mailbaseschema'
                }),
                editMode : {
                    type : conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.MODE_FORWARD,
                    id   : 1
                }
            });

            var draft = conjoon.cn_mail.model.mail.message.MessageDraft.load(1);
            t.waitForMs(100, function() {
                var body = draft.getMessageBody();
                t.waitForMs(100, function() {

                    var messageDraft = viewModel.get('messageDraft');
                    var messageBody  = viewModel.get('messageDraft.messageBody');

                    t.expect(messageDraft).not.toBe(draft);
                    t.expect(messageBody).not.toBe(body);

                    t.expect(messageDraft).toBeDefined();
                    t.expect(messageDraft.phantom).toBe(true);
                    t.expect(messageDraft.get('id')).not.toBe(draft.get('id'));

                    t.expect(messageBody).toBeDefined();
                    t.expect(messageBody.phantom).toBe(true);
                    t.expect(messageBody.get('id')).not.toBe(body.get('id'));

                    t.expect(messageDraft.get('subject')).toBe(draft.get('subject'));
                    t.expect(messageDraft.get('to')[0].name).toBe(draft.get('from').name);
                    t.expect(messageDraft.get('to')[0].address).toBe(draft.get('from').address);

                    t.expect(messageBody.get('textHtml')).toBe(body.get('textHtml'));

                }) ;
            });
        });

    })});

});