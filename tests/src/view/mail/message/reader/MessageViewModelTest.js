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

describe('conjoon.cn_mail.view.mail.message.reader.MessageViewModelTest', function(t) {

    var viewModel;

    var view,
        viewConfig,
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
        createMessageItem = function() {

            const MessageTable = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable;

            let index, messageItem;

            for (index = 0, len = 1000; index < len; index++) {
                item = getMessageItemAt(index);
                if (!item.seen) {
                    break;
                }
            }

            item.messageBodyId = createKeyForExistingMessage(index).toLocalId();

            messageItem = Ext.create(
                'conjoon.cn_mail.model.mail.message.MessageItem',
                item
            );

            return messageItem;
        },
        createMessageItemWoBody = function() {

            var messageItem = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                id            : 2,
                mailFolderId  : 'INBOX',
                mailAccountId : 'dev_sys_conjoon_org',
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

            let msgItem = createMessageItem();

            viewModel.setMessageItem(msgItem);

            t.expect(viewModel.bodyLoadOperation.loadOperation.getParams()).toEqual({
                mailAccountId : msgItem.get('mailAccountId'),
                mailFolderId  : msgItem.get('mailFolderId'),
                id            : msgItem.get('id')
            });

            t.expect(viewModel.bodyLoadOperation.loadOperation instanceof Ext.data.operation.Read).toBe(true);
            t.expect(viewModel.bodyLoadOperation.messageBodyId).toBe(msgItem.get('messageBodyId'));
            t.expect(viewModel.bodyLoadOperation.loadOperation.isRunning()).toBe(true);

            t.expect(wasCalled).toBe(false);
            t.waitForMs(1500, function() {
                t.expect(viewModel.bodyLoadOperation).toBe(null);

                t.expect(wasCalled).toBe(true);
                t.expect(viewModel.get('messageBody').getCompoundKey().equalTo(msgItem.getCompoundKey())).toBe(true);
                t.expect(viewModel.get('messageBody').getId()).toBe(msgItem.get('messageBodyId'));
                t.expect(viewModel.get('messageBody').get('textHtml')).toBeTruthy();
                // we are working with cloned messageItem for the assoziations
                t.expect(viewModel.get('messageItem').loadMessageBody()).not.toBe(viewModel.get('messageBody'));
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

            let msgItem = createMessageItem();
            viewModel.setMessageItem(msgItem);

            t.waitForMs(500, function() {
                t.expect(viewModel.bodyLoadOperation.loadOperation instanceof Ext.data.operation.Read).toBe(true);
                t.expect(viewModel.bodyLoadOperation.loadOperation.isRunning()).toBe(true);
                t.expect(viewModel.abortedRequestMap).toEqual({});
                viewModel.abortMessageBodyLoad();
                let obj = {};
                obj[msgItem.get('messageBodyId')] = true;
                t.expect(viewModel.abortedRequestMap).toEqual(obj);
                t.expect(viewModel.bodyLoadOperation).toBe(null);

                t.waitForMs(1000, function() {
                    t.expect(viewModel.get('messageItem')).not.toBe(null);
                    t.expect(viewModel.get('messageItem').getCompoundKey().equalTo(msgItem.getCompoundKey())).toBe(true);
                    t.expect(viewModel.get('messageItem').getId()).toBe(msgItem.getId());
                    t.expect(viewModel.get('messageBody')).toBe(null);

                    // aborted the load operation, messageItem will continue with
                    // dummy model
                    t.expect(viewModel.get('messageItem').loadMessageBody().get('textHtml')).toBe('');
                    t.expect(viewModel.get('messageItem').loadMessageBody()).not.toBe(null);
                    let mbLoad = viewModel.get('messageItem').loadMessageBody();
                    t.expect(mbLoad.getId()).toBe(msgItem.get('messageBodyId'));

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

            let item = createMessageItemWoBody();

            viewModel.setMessageItem(item);


            t.waitForMs(1500, function() {
                t.expect(viewModel.bodyLoadOperation).toBe(null);

                t.expect(viewModel.get('messageItem').getCompoundKey().equalTo(item.getCompoundKey())).toBe(true);
                t.expect(viewModel.get('messageItem').loadMessageBody()).toBe(null);
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

                t.expect(viewModel.get('messageBody')).not.toBe(viewModel.get('messageItem').loadMessageBody());
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

            let msgItem = createMessageItem();
            viewModel.setMessageItem(msgItem);

            t.waitForMs(500, function() {

                t.expect(viewModel.attachmentsLoadOperation instanceof Ext.data.operation.Read).toBe(true);
                t.expect(viewModel.attachmentsLoadOperation.isRunning()).toBe(true);

                let filters = viewModel.attachmentsLoadOperation.getFilters();

                t.expect(filters.length).toBe(3);
                let exp = [];
                for (let i = 0, len = filters.length; i < len; i++) {
                    exp.push({property : filters[i].getProperty(), value : filters[i].getValue()});
                }

                t.expect(exp).toEqual([{
                    property : "mailAccountId", value : msgItem.get('mailAccountId')
                }, {
                    property : "mailFolderId", value : msgItem.get('mailFolderId')
                },{
                    property : "parentMessageItemId", value : msgItem.get('id')
                }]);

                viewModel.abortMessageAttachmentsLoad();
                t.expect(viewModel.attachmentsLoadOperation).toBe(null);

                t.waitForMs(1000, function() {
                    t.expect(viewModel.get('messageItem')).not.toBe(null);
                    t.expect(viewModel.get('messageItem').getCompoundKey().equalTo(msgItem.getCompoundKey())).toBe(true);
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


    t.it("updateMessageItem()", function(t) {

        Ext.ux.ajax.SimManager.init({
            delay : 1
        });

        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
            view : Ext.create('Ext.Component')
        });

        var messageItem = createMessageItem(),
            viewModelItem,
            messageDraft, exc, e;

        messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            localId       : messageItem.getId(),
            mailAccountId : messageItem.get('mailAccountId'),
            mailFolderId  : messageItem.get('mailFolderId'),
            id            : messageItem.get('id'),
            subject       : 'subject',
            date          : '2017-07-30 23:45:00',
            to            : 'test@testdomain.tld'
        });

        messageDraft.attachments().add(Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment', {
            text : 'myAttachment'
        }));

        messageDraft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody', {
            textHtml  : 'Html text',
            textPlain : 'Plain Text'
        }));

        try {viewModel.updateMessageItem(messageDraft);} catch (e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('no messageitem available');

        viewModel.setMessageItem(createMessageItem());

        t.waitForMs(500, function() {

            try {viewModel.updateMessageItem({});} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('must be an instance of');

            let mdCopy = messageDraft.copy(1000000);
            mdCopy.set({mailAccountId : 1, mailFolderId : 2, id : 3}, {dirty : false});
            try {viewModel.updateMessageItem(mdCopy);} catch (e) {exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain('does not equal to the compoundkey');

            viewModelItem = viewModel.get('messageItem');

            t.isCalledNTimes('updateItemWithDraft', conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 1);

            viewModel.updateMessageItem(messageDraft);
            t.expect(viewModel.get('messageBody')).toBeTruthy();



            var attachments = viewModel.get('attachments');

            t.expect(viewModel.get('attachments')[0].data).toEqual(messageDraft.attachments().getRange()[0].data);
            t.expect(viewModel.get('attachments')[0]).not.toBe(messageDraft.attachments().getRange()[0]);

            t.expect(viewModel.get('messageBody')).not.toBe(messageDraft.loadMessageBody());
            t.expect(viewModel.get('messageBody').data).toEqual(messageDraft.loadMessageBody().data);

            // was committed
            t.expect(viewModelItem.dirty).toBe(false);
        });
    });


    t.it("formula.getFormattedDate", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');

        var MESSAGEBODY = false,
            MESSAGEITEM = false,
            date        = new Date(),
            expected    = Ext.util.Format.date(date, "H:i"),
            formulas    = viewModel.getFormulas(),
            get         = function() {
                return date
            };

        t.isCalled('getHumanReadableDate', conjoon.cn_core.util.Date);

        t.expect(formulas.getFormattedDate(get)).toBe(expected);
    });

    
    t.it("formula.getDisplayToAddress", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');

        var formulas    = viewModel.getFormulas(),
            messageItem = {
                get : function(value) {
                    if (value === 'draft') {
                        return false;
                    }
                }
            },
            get  = function(value) {
                if (value === 'messageItem') {
                    return messageItem;
                }

                if (value === 'messageItem.to') {
                    return [{name : 'a', address : 'b'}, {name : 'c', address : 'd'}];
                }
            };

        t.expect(formulas.getDisplayToAddress(get)).toBe("a, c");

        messageItem = null;

        t.expect(formulas.getDisplayToAddress(get)).toBe("");
    });


    t.it("formula.getDisplayFromAddress", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');

        var formulas    = viewModel.getFormulas(),
            from        = {name : 'a', address : 'b'},
            messageItem = {
                get : function(value) {
                    if (value === 'draft') {
                        return false;
                    }
                }
            },
            get  = function(value) {
                if (value === 'messageItem') {
                    return messageItem;
                }

                if (value === 'messageItem.from') {
                    return from;
                }
            };

        t.expect(formulas.getDisplayFromAddress(get)).toBe("a");

        from = null;

        t.expect(formulas.getDisplayFromAddress(get)).toBe("");

        messageItem = null;

        t.expect(formulas.getDisplayToAddress(get)).toBe("");

    });


    t.it("formula.getSubject", function(t) {
        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel');

        const formulas       = viewModel.getFormulas(),
            defaultSubject = viewModel.emptySubjectText;

        t.expect(formulas.getSubject.set).not.toBeDefined();
        t.expect(formulas.getSubject.get.apply(viewModel, [{}])).toBe(defaultSubject);
        t.expect(formulas.getSubject.get.apply(viewModel, [{subject : ''}])).toBe(defaultSubject);
        t.expect(formulas.getSubject.get.apply(viewModel, [{subject : 'foo'}])).toBe('foo');
    });


    t.it("app-cn_mail#66 - onMessageBodyLoadFailure", function(t) {

        let view = Ext.create('Ext.Component', {});

        let CALLED = 0;

        view.onMessageItemLoadFailure = function() {
            CALLED = 1;
        }

        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
            view : view
        });

        t.expect(CALLED).toBe(0);

        t.isCalled('onMessageBodyLoadFailure', viewModel);

        viewModel.loadMessageBodyFor(Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            localId       : 'foo',
            mailAccountId : 'bar',
            mailFolderId  : 'm',
            id            : 'xyz',
            messageBodyId : 'foobar'
        }));

        t.waitForMs(750, function() {
            t.expect(CALLED).toBe(1);
        });


    });


    t.it("app-cn_mail#66 - onMessageBodyLoadFailure with error exiting", function(t) {

        let view = Ext.create('Ext.Component', {});

        let CALLED = 0;

        view.onMessageItemLoadFailure = function() {
            CALLED = 1;
        }

        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
            view : view
        });

        t.expect(CALLED).toBe(0);

        viewModel.onMessageBodyLoadFailure({}, {error : {status : -1}});


        t.waitForMs(750, function() {
            t.expect(CALLED).toBe(0);
        });
    });


    t.it("contextButtonsEnabled", function(t) {

        let view = Ext.create('Ext.Component', {});

        viewModel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewModel', {
            view : view
        });

        t.expect(viewModel.get('contextButtonsEnabled')).toBe(false);

    });



})})});

