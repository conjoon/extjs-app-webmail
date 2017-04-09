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

describe('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewControllerTest', function(t) {

    var view,
        viewConfig,
        controller,
        createFile = function(type) {

            return new File([{
                name : 'foo.png',
                type : type ? type : 'image/jpg'
            }], 'foo.png');
        };

    t.afterEach(function() {
        if (view) {
            view.destroy();
            view = null;
            controller = null;
        }

        if (controller) {
            controller.destroy();
            controller = null;
        }


    });

    t.beforeEach(function() {

        viewConfig = {

        }
    });


    t.it("Should make sure setting up controller works", function(t) {

        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });

        t.expect(controller instanceof Ext.app.ViewController).toBe(true);

        t.expect(controller.alias).toContain('controller.cn_mail-mailmessageeditorviewcontroller');
    });


    t.it("Should register and catch the events properly", function(t) {

        // the itemremove event fires directly when the view was created.
        // this might be related to the use of MVVM, where the store
        // of the AttachmentList gets replaced when the binding
        // are initially pocessed? Thus, we set itemremove flag to -1 here
        var itemremove           = -1,
            itemadd              = 0,
            formFileButtonChange = 0,
            showCcBccButtonClick = 0,
            sendButtonClick      = 0,
            saveButtonClick      = 0;

        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
        });

        controller.onAttachmentListItemRemove = function() {itemremove++;};
        controller.onAttachmentListItemAdd = function() {itemadd++;};
        controller.onFormFileButtonChange = function() {formFileButtonChange++;};
        controller.onShowCcBccButtonClick = function() {showCcBccButtonClick++;};
        controller.onSendButtonClick = function() {sendButtonClick++;};
        controller.onSaveButtonClick = function() {saveButtonClick++;};

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                controller : controller,
                renderTo : document.body
            });

        t.waitForMs(500, function() {
            t.expect(itemremove).toBe(0);
            t.expect(itemadd).toBe(0);
            t.expect(formFileButtonChange).toBe(0);
            t.expect(showCcBccButtonClick).toBe(0);
            t.expect(sendButtonClick).toBe(0);
            t.expect(saveButtonClick).toBe(0);

            view.down('cn_mail-mailmessageeditorattachmentlist').fireEvent('itemremove');
            view.down('cn_mail-mailmessageeditorattachmentlist').fireEvent('itemadd');
            view.down('cn_comp-formfieldfilebutton').fireEvent('change');
            view.down('#showCcBccButton').fireEvent('click');
            view.down('#sendButton').fireEvent('click');
            view.down('#saveButton').fireEvent('click');

            t.expect(itemremove).toBe(1);
            t.expect(itemadd).toBe(1);
            t.expect(formFileButtonChange).toBe(1);
            t.expect(showCcBccButtonClick).toBe(1);
            t.expect(sendButtonClick).toBe(1);
            t.expect(saveButtonClick).toBe(1);
        });


    });

    t.it("Should make sure that onAttachmentListItemRemove works properly", function(t) {

        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                controller : controller,
                renderTo : document.body
            });

        t.waitForMs(500, function() {
            var attachmentList = view.down('cn_mail-mailmessageeditorattachmentlist');
            attachmentList.addAttachment(createFile());

            t.expect(attachmentList.isHidden()).toBe(false);
            attachmentList.getStore().suspendEvents();
            attachmentList.getStore().removeAll();
            attachmentList.getStore().resumeEvents();

            //records, index, item, view, eOpts
            t.waitForMs(500, function() {
                t.expect(attachmentList.isHidden()).toBe(false);
                controller.onAttachmentListItemRemove([], 0, null, attachmentList);

                t.waitForMs(500, function() {
                    t.expect(attachmentList.isHidden()).toBe(true);
                });
            });
        });
    });


    t.it("Should make sure that onAttachmentListItemAdd works properly", function(t) {
        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                controller : controller,
                renderTo : document.body
            });

        t.waitForMs(500, function() {
            var attachmentList = view.down('cn_mail-mailmessageeditorattachmentlist');

            t.expect(attachmentList.isHidden()).toBe(true);

            attachmentList.suspendEvents();
            attachmentList.addAttachment(createFile());
            attachmentList.getStore().resumeEvents();

            //records, index, item, view, eOpts
            t.waitForMs(500, function() {
                t.expect(attachmentList.isHidden()).toBe(true);
                controller.onAttachmentListItemAdd([], 0, null, attachmentList);

                t.waitForMs(500, function() {
                    t.expect(attachmentList.isHidden()).toBe(false);
                });
            });
        });
    });


    t.it("Should make sure that onFormFileButtonChange works properly", function(t) {
        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                controller : controller,
                renderTo : document.body
            });

        t.waitForMs(500, function() {
            var attachmentList = view.down('cn_mail-mailmessageeditorattachmentlist');
            t.expect(attachmentList.getStore().getRange().length).toBe(0);
            controller.onFormFileButtonChange(null, null, null, [createFile()]);
            t.expect(attachmentList.getStore().getRange().length).toBe(1);
        });
    });


    t.it("Should make sure that onShowCcBccButtonClick works properly", function(t) {
        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                controller : controller,
                renderTo : document.body
            });

        t.waitForMs(500, function() {
            t.expect(view.down('#ccField').isHidden()).toBe(true);
            t.expect(view.down('#bccField').isHidden()).toBe(true);
            controller.onShowCcBccButtonClick();
            t.expect(view.down('#ccField').isHidden()).toBe(false);
            t.expect(view.down('#bccField').isHidden()).toBe(false);
            controller.onShowCcBccButtonClick();
            t.expect(view.down('#ccField').isHidden()).toBe(true);
            t.expect(view.down('#bccField').isHidden()).toBe(true);
        });
    });


    t.it("Should make sure that onSendButtonClick works properly", function(t) {
        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });

        var exc = undefined;
        try {
            controller.onSendButtonClick();
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain('Not implemented yet');
    });


    t.it("Should make sure that onSaveButtonClick works properly", function(t) {
        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });

        t.fail();
    });
});
