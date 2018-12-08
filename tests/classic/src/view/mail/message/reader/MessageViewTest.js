
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

describe('conjoon.cn_mail.view.mail.message.reader.MessageViewTest', function(t) {

t.requireOk('conjoon.cn_core.util.Date', function() {

    var view,
        viewConfig,
        testDate   = new Date(),
        formatDate = conjoon.cn_core.util.Date.getHumanReadableDate(testDate),
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
        createMessageItem = function(withMessageBody) {

            var conf = {
                id             : 1,
                mailFolderId   : 'INBOX',
                mailAccountId  : 'dev_sys_conjoon_org',
                messageBodyId  : 'dev_sys_conjoon_org-INBOX-1',
                subject        : 'SUBJECT',
                from           : 'FROM',
                date           : testDate,
                seen           : false,
                hasAttachments : true
            };

            if (withMessageBody === false) {
                delete conf.messageBodyId;
            }

            var messageItem = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', conf);

            return messageItem;
        },
        checkHtmlForValidData = function(t, view) {
            t.expect(view.getTitle()).toContain('SUBJECT');
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).toContain('FROM');
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).toContain('SUBJECT');
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).toContain(formatDate);
            t.expect(view.down('component[cls=cn_mail-mailmessagereadermessageviewiframe]').getSrcDoc()).not.toBe("");
        },
        checkHtmlDataNotPresent = function(t, view) {
            t.expect(view.getTitle()).toBe(view.getViewModel().emptySubjectText);
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).not.toContain('FROM');
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).toContain(view.getViewModel().emptySubjectText);
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).not.toContain(formatDate);
            t.expect(view.down('component[cls=cn_mail-mailmessagereadermessageviewiframe]').getSrcDoc()).toBe("");
        };

    t.afterEach(function() {
        if (view) {
            view.destroy();
            view = null;
        }

        viewConfig = {};

    });

    t.beforeEach(function() {

        viewConfig = {
            callbackWasCalled : false,
            renderTo          : document.body,
            listeners         : {
                'cn_mail-mailmessageitemread' : function(record) {
                    view.callbackWasCalled = record;
                }
            }
        }
    });


    t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay : 1
        });


        t.it("Should create and show the view along with default config checks", function(t) {
            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            t.expect(view.isCnMessageView).toBe(true);

            t.expect(view instanceof Ext.Container).toBeTruthy();

            t.expect(view.alias).toContain('widget.cn_mail-mailmessagereadermessageview');

            t.expect(view.closable).toBe(true);

            t.expect(view.down('cn_mail-mailmessagereaderattachmentlist') instanceof conjoon.cn_mail.view.mail.message.reader.AttachmentList).toBe(true);

            t.expect(
                view.getViewModel() instanceof conjoon.cn_mail.view.mail.message.reader.MessageViewModel
            ).toBe(true);
        });


        t.it("Should throw exception if setMessageItem was called with anything other than null or valid model type", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            var exc = undefined;

            try {
                view.setMessageItem({empty : 'object'});
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();

            t.waitForMs(500, function() {
                t.expect(view.callbackWasCalled).toBe(false);
            })

        });


        t.it("Should set data properly when setMessageItem was called with valid model", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            t.expect(view.callbackWasCalled).toBe(false);

            let msgItem = createMessageItem();

            view.setMessageItem(msgItem);

            view.getViewModel().notify();

            t.waitForMs(750, function() {
                checkHtmlForValidData(t, view);
                t.expect(view.callbackWasCalled[0].get('id')).toBe('1');
            });
        });


        t.it("Should set everything to empty when setMessageItem was called with null", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            view.setMessageItem(createMessageItem());

            t.expect(view.callbackWasCalled).toBe(false);

            t.waitForMs(750, function() {
                checkHtmlForValidData(t, view);
                t.expect(view.callbackWasCalled[0].get('id')).toBe('1')
                view.callbackWasCalled = false;
                view.setMessageItem(null);
                t.waitForMs(750, function() {
                    checkHtmlDataNotPresent(t, view);
                    t.expect(view.callbackWasCalled).toBe(false);
                });
            });
        });


        t.it("Should show the AttachmentList if attachment available", function(t) {
            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            t.expect(view.down('cn_mail-mailmessagereaderattachmentlist').isHidden()).toBe(true);

            view.setMessageItem(createMessageItem());

            t.waitForMs(500, function() {
                t.expect(view.down('cn_mail-mailmessagereaderattachmentlist').isHidden()).toBe(false);
            })

        });


        t.it("Should hide  the AttachmentList if no attachment available", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            var item = createMessageItem();

            t.expect(view.down('cn_mail-mailmessagereaderattachmentlist').isHidden()).toBe(true);

            item.set('hasAttachments', false);

            view.setMessageItem(item);

            t.waitForMs(500, function(){
                t.expect(view.down('cn_mail-mailmessagereaderattachmentlist').isHidden()).toBe(true);
            });

        });


        t.it("Should show/hide msgIndicatorBox", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            t.expect(view.down('#msgIndicatorBox').isVisible()).toBe(true);
            t.expect(view.down('#msgHeaderContainer').isVisible()).toBe(false);
            t.expect(view.down('#msgBodyContainer').isVisible()).toBe(false);

            view.setMessageItem(createMessageItem());

            t.waitForMs(500, function(){
                t.expect(view.down('#msgIndicatorBox').isVisible()).toBe(false);
                t.expect(view.down('#msgHeaderContainer').isVisible()).toBe(true);
                t.expect(view.down('#msgBodyContainer').isVisible()).toBe(true);

                view.setMessageItem(createMessageItem(false));

                t.waitForMs(500, function(){
                    t.expect(view.down('#msgIndicatorBox').isVisible()).toBe(true);
                    t.expect(view.down('#msgHeaderContainer').isVisible()).toBe(true);
                    t.expect(view.down('#msgBodyContainer').isVisible()).toBe(false);
                });
            });
        });


        t.it("loadMessageItem() - exception", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let exc, e;

            try{view.loadMessageItem(1);}catch(e){exc=e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");



        });

        t.it("loadMessageItem()", function(t) {
            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let rec  = getMessageItemAt(1);

            t.expect(view.getTitle().toLowerCase()).toContain('loading');

            t.expect(view.getViewModel().get('messageItem')).toBeFalsy();

            t.isCalledNTimes('setMessageItem', view.getViewModel(), 1);

            view.loadMessageItem(createKeyForExistingMessage(1));

            t.expect(view.getViewModel().get('isLoading')).toBe(true);

            t.waitForMs(500, function() {
                t.expect(view.getTitle()).toBe(view.getViewModel().get('messageItem.subject'));
                t.expect(view.getViewModel().get('messageItem')).toBeTruthy();
            });
        });


        t.it("updateMessageItem()", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            t.isCalledNTimes('updateMessageItem', view.getViewModel(), 1);

            view.loadMessageItem(createKeyForExistingMessage(1));

            t.waitForMs(500, function() {
                try{
                    view.updateMessageItem({});
                } catch (e) {}
            });


        });


        t.it("check that LoadMask is properly rendered", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView');

            view.getViewModel().set('isLoading', true);

            t.expect(view.loadingMask).toBeFalsy();

            view.render(document.body);

            t.isInstanceOf(view.loadingMask, 'Ext.LoadMask');

            t.isCalledOnce('destroy', view.loadingMask);

            view.getViewModel().set('isLoading', false);

            view.getViewModel().notify();

            t.expect(view.loadingMask).toBe(null);

        });


        t.it("check that LoadMask is properly removed - beforedestroy", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView');

            view.getViewModel().set('isLoading', true);

            t.expect(view.loadingMask).toBeFalsy();

            view.render(document.body);

            t.isInstanceOf(view.loadingMask, 'Ext.LoadMask');

            t.isCalledOnce('destroy', view.loadingMask);

            view.destroy();

            t.expect(view.loadingMask).toBe(null);

        });

        t.it("should abort pending load operations when view is destroyed", function(t) {

            t.diag("upping SimManager-delay to 1500");
            Ext.ux.ajax.SimManager.init({
                delay : 1500
            });

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView');

            view.loadMessageItem(createKeyForExistingMessage(1));
            t.expect(view.loadingItem).toBeDefined();
            t.isCalledNTimes('abort', view.loadingItem, 1);
            view.destroy();


            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView');
            view.setMessageItem(createMessageItem());
            t.isCalledNTimes('abortMessageAttachmentsLoad', view.getViewModel(), 1);
            t.isCalledNTimes('abortMessageBodyLoad',        view.getViewModel(), 1);
            view.destroy();


        });


        t.it("renders draft properly", function(t) {

            t.diag("lowering SimManager-delay to 1");
            Ext.ux.ajax.SimManager.init({
                delay : 1
            });

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let rec  = getMessageItemAt(1);

            view.loadMessageItem(createKeyForExistingMessage(1));

            t.waitForMs(750, function() {

                view.getViewModel().get('messageItem').set('draft', false);

                t.waitForMs(250, function() {

                    let subjectCont = Ext.dom.Query.select("span[class*=draft]", view.dom);
                    t.expect(subjectCont.length).toBe(0)

                    view.getViewModel().get('messageItem').set('draft', true);


                    t.waitForMs(250, function() {
                        subjectCont = Ext.dom.Query.select("span[class*=draft]", view.dom);
                        t.expect(subjectCont.length).toBe(1);

                        t.expect(subjectCont[0].parentNode.className.toLowerCase()).toContain('subject');
                    });

                })

            })
        });


        t.it("fires cn_mail-messageitemload", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let CALLED = 0;

            let rec  = getMessageItemAt(1);

            view.on('cn_mail-messageitemload', function(messageView, item) {
                CALLED++;
                t.expect(messageView).toBe(view);
                t.expect(item.getId()).toBe(createKey(rec.mailAccountId, rec.mailFolderId, rec.id).toLocalId());
            });

            t.expect(CALLED).toBe(0);

            view.loadMessageItem(createKeyForExistingMessage(1));

            t.waitForMs(750, function() {
                t.expect(CALLED).toBe(1);
            });
        });


        t.it("getMessageItem()", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            t.expect(view.getMessageItem()).toBe(null);

            let rec  = conjoon.cn_mail.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(0);

            view.loadMessageItem(createKeyForExistingMessage(1));

            t.waitForMs(750, function() {
                t.expect(view.getMessageItem()).toBeTruthy();
                t.expect(view.getMessageItem()).toBe(view.getViewModel().get('messageItem'));

            });
        });


        t.it("confirmDialogMask mixin", function(t){
            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            t.expect(view.mixins["conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog"]).toBeTruthy();
            t.expect(view.mixins["conjoon.cn_mail.view.mail.mixin.LoadingFailedDialog"]).toBeTruthy();
            t.expect(view.canCloseAfterDelete).toBe(true);
        });


        t.it("app-cn_mail#61", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let rec = getMessageItemAt(1),
                vm  = view.getViewModel();

            view.loadMessageItem(createKeyForExistingMessage(1));


            t.waitForMs(750, function() {
                t.expect(view.getTitle()).toBe(vm.get('messageItem.subject'));

                vm.set('messageItem.subject', "");
                vm.notify();
                t.expect(view.getTitle()).toBe(vm.emptySubjectText);

                vm.set('messageItem.subject', "foo");
                vm.notify();
                t.expect(view.getTitle()).toBe("foo");

                view.setTitle("bar");
                vm.notify();
                t.expect(vm.get('messageItem.subject')).toBe("foo");


            });
        });


        t.it("app-cn_mail#66 - setMessageItem closes loadingFailedMask if it exist", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let CALLED = 0;

            view.loadingFailedMask = {
                close : function() {
                    CALLED++;
                }
            };


            t.expect(CALLED).toBe(0);

            view.setMessageItem(null);

            t.expect(CALLED).toBe(1);

        });


        t.it("app-cn_mail#66 - loadMessageItem failure registered", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let CALLED = 0;

            view.onMessageItemLoadFailure = function(){
                CALLED++;
            };


            t.expect(CALLED).toBe(0);

            view.loadMessageItem(createKey(1, 2, 3));

            t.waitForMs(750, function() {
                t.expect(CALLED).toBe(1);
            });


        });


        t.it("app-cn_mail#66 - onMessageItemLoadFailure()", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let vm = view.getViewModel();

            vm.set('isLoading', true);
            t.expect(vm.get('isLoading')).toBe(true);

            t.isInstanceOf(view.onMessageItemLoadFailure({}, {}), 'conjoon.cn_comp.component.MessageMask');

            t.expect(vm.get('isLoading')).toBe(false);

        });


        t.it("app-cn_mail#66 - onMessageItemLoadFailure() no loadMask if cancelled", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let vm = view.getViewModel();

            vm.set('isLoading', true);
            t.expect(vm.get('isLoading')).toBe(true);

            t.expect(
                view.onMessageItemLoadFailure({}, {error: {status : -1}}),
                'conjoon.cn_comp.component.MessageMask'
            ).toBeFalsy();

            t.expect(vm.get('isLoading')).toBe(false);

        });


        t.it("app-cn_mail#66 - loadingFailedMask removed before view is destroyed", function(t) {

            let view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let CALLED = 0;

            view.loadingFailedMask = {
                destroy : function() {
                    CALLED++;
                }
            };


            t.expect(CALLED).toBe(0);
            t.expect(view.loadingFailedMask).not.toBe(null);
            view.destroy();

            t.expect(CALLED).toBe(1);

            t.expect(view.loadingFailedMask).toBe(null);
            view = null;
        });


        t.it("app-cn_mail#87", function(t) {

            let view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            ctrl = view.getController();

            t.expect(view.hideMode).toBe('offsets');
            t.isInstanceOf(ctrl, 'conjoon.cn_mail.view.mail.message.reader.MessageViewController');

            let CALLED = 0;

            ctrl.onIframeLoad = function() {
                CALLED++;
            };

            t.expect(CALLED).toBe(0);
            view.down('cn_mail-mailmessagereadermessageviewiframe').fireEvent('load');
            t.expect(CALLED).toBe(1);

            t.expect(view.down('cn_mail-mailmessagereadermessageviewiframe').cn_iframeEl.dom.sandbox[0]).toBe("allow-same-origin");

            view.destroy();
            view = null;
        });


        t.it("app-cn_mail#88 - sandbox", function(t) {

            let view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            let sandbox = view.down('cn_mail-mailmessagereadermessageviewiframe').cn_iframeEl.dom.sandbox,
                res     = [];

            for (let i in sandbox) {
                if (!sandbox.hasOwnProperty(i)) {
                    continue;
                }
                res.push(sandbox[i]);
            }

            t.expect(res.length).toBe(4);

            t.expect(res).toEqual(
                "allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation".split(" ")
            );
            view.destroy();
            view = null;
        });


    });});});
