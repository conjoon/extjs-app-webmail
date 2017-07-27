/**
 * conjoon
 * (c) 2007-2016 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2016 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.view.mail.message.reader.MessageViewModelTest', function(t) {

    var viewModel;

    var view,
        viewConfig,
        createMessageItem = function() {

            var messageItem = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    id             : 1,
                    messageBodyId  : 2,
                    subject        : 'SUBJECT',
                    from           : 'FROM',
                    date           : 'DATE',
                    hasAttachments : true
                });

            return messageItem;
        },
        createMessageItemWoBody = function() {

            var messageItem = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                id            : 2,
                subject       : 'SUBJECT',
                from          : 'FROM',
                date          : 'DATE'
            });

            return messageItem;
        };

    t.afterEach(function() {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }
    });


    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
    t.requireOk('conjoon.cn_mail.model.mail.message.MessageBody', function () {

        t.it("1. Should create the ViewModel", function(t) {
            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');
            t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);

            t.expect(viewModel.alias).toContain('viewmodel.cn_mail-mailmessagereadermessageviewmodel');

        });

        t.it("2. Should trigger loading the messageBody along with a configured view for firing the event", function(t) {

            var wasCalled = false,
                view      = Ext.create('Ext.Component', {
                listeners : {
                    'cn_mail-mailmessageitemread' : function() {
                        wasCalled = true;
                    }
                }
            });

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
                view : view
            });

            Ext.ux.ajax.SimManager.init({
                delay: 500
            });

            viewModel.setMessageItem(createMessageItem());

            t.expect(viewModel.bodyLoadOperation.loadOperation instanceof Ext.data.operation.Read).toBe(true);
            t.expect(viewModel.bodyLoadOperation.messageBodyId).toBe('2');
            t.expect(viewModel.bodyLoadOperation.loadOperation.isRunning()).toBe(true);

            t.expect(wasCalled).toBe(false);
            t.waitForMs(1500, function() {
                t.expect(viewModel.bodyLoadOperation).toBe(null);

                t.expect(wasCalled).toBe(true);
                t.expect(viewModel.get('messageBody').get('id')).toBe('2');
                t.expect(viewModel.get('messageBody').get('textHtml')).toBeTruthy();
                // we are working with cloned messageItem for the assoziations
                t.expect(viewModel.get('messageItem').getMessageBody()).not.toBe(viewModel.get('messageBody'));
            });

        });

        t.it("3. Should abort loading the messageBody and reload later on properly", function(t) {

            var view = Ext.create('Ext.Component', {
                listeners : {
                    'cn_mail-mailmessageitemread' : function() {
                        wasCalled = true;
                    }
                }});

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
                view : view
            });

            Ext.ux.ajax.SimManager.init({
                delay: 1000
            });

            viewModel.setMessageItem(createMessageItem());

            t.waitForMs(500, function() {
                t.expect(viewModel.bodyLoadOperation.loadOperation instanceof Ext.data.operation.Read).toBe(true);
                t.expect(viewModel.bodyLoadOperation.loadOperation.isRunning()).toBe(true);
                t.expect(viewModel.abortedRequestMap).toEqual({});
                viewModel.abortMessageBodyLoad();
                t.expect(viewModel.abortedRequestMap).toEqual({'2' : true});
                t.expect(viewModel.bodyLoadOperation).toBe(null);

                t.waitForMs(1000, function() {
                    t.expect(viewModel.get('messageItem')).not.toBe(null);
                    t.expect(viewModel.get('messageItem').get('id')).toBe('1');
                    t.expect(viewModel.get('messageBody')).toBe(null);

                    // aborted the load operation, messageItem will continue with
                    // dummy model
                    t.expect(viewModel.get('messageItem').getMessageBody().get('textHtml')).toBe('');
                    t.expect(viewModel.get('messageItem').getMessageBody()).not.toBe(null);
                    t.expect(viewModel.get('messageItem').getMessageBody().getId()).toBe('2');

                    Ext.ux.ajax.SimManager.init({
                        delay: 100
                    });

                    // and trigger reload
                    viewModel.setMessageItem(createMessageItem());
                    t.waitForMs(500, function() {
                        t.expect(viewModel.abortedRequestMap).toEqual({});
                        t.expect(viewModel.get('messageBody').get('textHtml')).not.toBe('');
                    });

                });

            });

        });

        t.it("4. Should not trigger an error if no message body was specified", function(t) {

            var wasCalled = false,
                view      = Ext.create('Ext.Component');

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
                view : view
            });

            viewModel.setMessageItem(createMessageItemWoBody());


            t.waitForMs(1500, function() {
                t.expect(viewModel.bodyLoadOperation).toBe(null);

                t.expect(viewModel.get('messageItem').getId()).toBe('2');
                t.expect(viewModel.get('messageItem').getMessageBody()).toBe(null);
                t.expect(viewModel.get('messageBody')).toEqual(null);
            });

        });


        t.it("5. MessageItem's MessageBody/Attachments should not be loaded for the same Reference", function(t) {

            var wasCalled = false,
                view      = Ext.create('Ext.Component');

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
                view : view
            });
            Ext.ux.ajax.SimManager.init({
                delay: 100
            });
            viewModel.setMessageItem(createMessageItem());

            t.waitForMs(1500, function() {
                t.expect(viewModel.bodyLoadOperation).toBe(null);

                t.expect(viewModel.get('messageBody')).toBeTruthy();
                t.expect(viewModel.get('attachments')).toBeTruthy();

                t.expect(viewModel.get('messageBody')).not.toBe(viewModel.get('messageItem').getMessageBody());
                // attachment store of original mesage item should not have been
                // loaded, allthough we have access to attachment data. In
                // this case, its from the internally cloned messageItem
                t.expect(viewModel.get('messageItem').attachments().isLoaded()).toBe(false);


            });

        });


        t.it("6. Should abort loading the attachments and reload later on properly", function(t) {

            var view = Ext.create('Ext.Component');

            viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
                view : view
            });

            Ext.ux.ajax.SimManager.init({
                delay: 1000
            });

            viewModel.setMessageItem(createMessageItem());

            t.waitForMs(500, function() {
                t.expect(viewModel.attachmentsLoadOperation instanceof Ext.data.operation.Read).toBe(true);
                t.expect(viewModel.attachmentsLoadOperation.isRunning()).toBe(true);
                viewModel.abortMessageAttachmentsLoad();
                t.expect(viewModel.attachmentsLoadOperation).toBe(null);

                t.waitForMs(1000, function() {
                    t.expect(viewModel.get('messageItem')).not.toBe(null);
                    t.expect(viewModel.get('messageItem').get('id')).toBe('1');
                    t.expect(viewModel.get('attachments')).toEqual([]);

                    Ext.ux.ajax.SimManager.init({
                        delay: 100
                    });

                    // and trigger reload
                    viewModel.setMessageItem(createMessageItem());
                    t.waitForMs(500, function() {
                        t.expect(viewModel.abortedRequestMap).toEqual({});
                        t.expect(viewModel.get('attachments')).not.toEqual([]);
                    });

                });

            });

        });


    t.it("formula.getIndicatorText", function(t) {

        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');

        var MESSAGEBODY = false,
            MESSAGEITEM = false,
            formulas    = viewModel.getFormulas(),
            get         = function(key) {
                switch (key) {
                    case 'messageBody':
                        return MESSAGEBODY;
                    case 'messageItem':
                        return MESSAGEITEM;
                }
            }

        t.expect(formulas.getIndicatorText(get)).toContain('Select');
        MESSAGEITEM = true;
        t.expect(formulas.getIndicatorText(get)).toContain('Loading');
        MESSAGEBODY = true;
        t.expect(formulas.getIndicatorText(get)).toBe("");


    });


    t.it("formula.getIndicatorIcon", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');

        var MESSAGEBODY = false,
            MESSAGEITEM = false,
            formulas    = viewModel.getFormulas(),
            get         = function(key) {
                switch (key) {
                    case 'messageBody':
                        return MESSAGEBODY;
                    case 'messageItem':
                        return MESSAGEITEM;
                }
            }

        t.expect(formulas.getIndicatorIcon(get)).toBeTruthy();
        MESSAGEITEM = true;
        t.expect(formulas.getIndicatorIcon(get)).toBeTruthy();
        MESSAGEBODY = true;
        t.expect(formulas.getIndicatorText(get)).toBe("");
    });


    t.it("stores.attachmentStore", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');

        viewModel.set('attachments', []);

        t.waitForMs(500, function() {
            t.expect(viewModel.getStore('attachmentStore')).toBeDefined();
            t.expect(viewModel.getStore('attachmentStore').model.$className).toBe('conjoon.cn_mail.model.mail.message.ItemAttachment');
        });
    });


    t.it("data.isLoading", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');

        t.expect(viewModel.get('isLoading')).toBe(false);
    });


    t.it("formulas.getTitle", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
            view : Ext.create('Ext.Component')
        });

        t.waitForMs(500, function() {
            viewModel.set('isLoading', true);

            t.expect(viewModel.getFormulas().getTitle.apply(viewModel, [viewModel.get.bind(viewModel)]).toLowerCase()).toContain('loading');

            viewModel.setMessageItem(createMessageItem());
            viewModel.set('isLoading', false);

            t.waitForMs(1500, function() {
                t.expect(viewModel.getFormulas().getTitle.apply(viewModel, [viewModel.get.bind(viewModel)])).toBe('SUBJECT');
            });
        });

    });

})});

});

