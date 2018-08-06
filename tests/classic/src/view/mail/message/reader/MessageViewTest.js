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

    var view,
        viewConfig,
        testDate   = new Date(),
        formatDate = Ext.util.Format.date(testDate, 'd.m.Y H:i')
        createMessageItem = function(withMessageBody) {

            var conf = {
                id             : 1,
                messageBodyId  : 1,
                subject        : 'SUBJECT',
                from           : 'FROM',
                date           : testDate,
                seen         : false,
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
            t.expect(view.down('component[cls=cn_mail-body]').el.dom.innerHTML).not.toBe("");
        },
        checkHtmlDataNotPresent = function(t, view) {
            t.expect(view.getTitle()).toBeFalsy();
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).not.toContain('FROM');
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).not.toContain('SUBJECT');
            t.expect(view.down('component[cls=message-subject]').el.dom.innerHTML).not.toContain(formatDate);
            t.expect(view.down('component[cls=cn_mail-body]').el.dom.innerHTML).toBe("");
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

            view.setMessageItem(createMessageItem());

            view.getViewModel().notify();

            t.waitForMs(500, function() {
                checkHtmlForValidData(t, view);
                t.expect(view.callbackWasCalled[0].get('id')).toBe('1');
            });
        });

        t.it("Should set everything to empty when setMessageItem was called with null", function(t) {

            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            view.setMessageItem(createMessageItem());

            t.expect(view.callbackWasCalled).toBe(false);

            t.waitForMs(500, function() {
                checkHtmlForValidData(t, view);
                t.expect(view.callbackWasCalled[0].get('id')).toBe('1')
                view.callbackWasCalled = false;
                view.setMessageItem(null);
                t.waitForMs(500, function() {
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


        t.it("loadMessageItem()", function(t) {
            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.reader.MessageView', viewConfig);

            t.expect(view.getTitle().toLowerCase()).toContain('loading');

            t.expect(view.getViewModel().get('messageItem')).toBeFalsy();

            t.isCalledNTimes('setMessageItem', view.getViewModel(), 1);

            view.loadMessageItem(1);

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

            view.loadMessageItem(1);

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

            view.loadMessageItem(1);
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



    });
});
