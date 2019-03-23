/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

describe('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewControllerTest', function(t) {

    const TIMEOUT = 1250;

    var view,
        viewConfig,
        controller,
        setStoreForEditor = function(editor) {
            let store = Ext.create(
                'conjoon.cn_mail.store.mail.folder.MailFolderTreeStore'
            );
            editor.getViewModel().set('cn_mail_mailfoldertreestore', store);
            store.load();
        },
        createKey = function(id1, id2, id3) {
            return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
        },
        getMessageItemAt = function(messageIndex) {
            return conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);
        },
        createKeyForExistingMessage = function(messageIndex){
            let item = getMessageItemAt(messageIndex);

            let key = createKey(
                item.mailAccountId, item.mailFolderId, item.id
            );

            return key;
        },
        createOperation = function() {
            return Ext.create('Ext.data.operation.Create', {
                entityType : {
                    entityName : 'TESTENTITY'
                }
            });
        },
        createFile = function(type) {

            return new File([{
                name : 'foo.png',
                type : type ? type : 'image/jpg'
            }], 'foo.png');
        },
        createEditorForController = function(controller, editMode, messageDraft) {

            if (!messageDraft) {
                var editMode = editMode ? editMode : 'CREATE';

                switch (editMode) {
                    case 'CREATE':
                        messageDraft = Ext.create(
                            'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
                                mailAccountId : 'dev_sys_conjoon_org',
                                mailFolderId : 'INBOX'
                            });
                        break;
                }
            }


            let store = Ext.create(
                'conjoon.cn_mail.store.mail.folder.MailFolderTreeStore'
            );


           // conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel

            let ed = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                    controller   : controller,
                    messageDraft : messageDraft
                });

            vm = ed.getViewModel();

            vm.set('cn_mail_mailfoldertreestore', store);
            store.load();

            return ed;
        };

    t.afterEach(function() {
        if (view) {
            view.destroy();
            view = null;
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


    t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function() {
        t.requireOk('conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it("Should make sure setting up controller works", function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });

            t.expect(controller instanceof Ext.app.ViewController).toBe(true);

            t.expect(controller.alias).toContain('controller.cn_mail-mailmessageeditorviewcontroller');
        });


        //remove/add listener where removed for conjoon/app-cn_mail/1
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

            view = createEditorForController(controller, 'CREATE');

            t.isCalledNTimes('onMailMessageEditorBeforeDestroy', controller, 1);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.expect(itemremove).toBe(-1);
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

                t.expect(itemremove).toBe(-1);
                t.expect(itemadd).toBe(0);
                t.expect(formFileButtonChange).toBe(1);
                t.expect(showCcBccButtonClick).toBe(1);
                t.expect(sendButtonClick).toBe(1);
                t.expect(saveButtonClick).toBe(1);

                // destroy the view here so it's part of the test and
                // onMailMessageEditorBeforeDestroy can be observed
                view.destroy();
                view = null;
            });


        });

        //onAttachmentListItemRemove() removed for conjoon/app-cn_mail/1
        t.it("Should make sure that onAttachmentListItemRemove works properly", function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });

            t.expect(controller.onAttachmentListItemRemove).toBeUndefined();
        });

        //onAttachmentListItemAdd() removed for conjoon/app-cn_mail/1
        t.it("Should make sure that onAttachmentListItemAdd works properly", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });

            t.expect(controller.onAttachmentListItemAdd).toBeUndefined();
        });


        t.it("Should make sure that onFormFileButtonChange works properly", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.waitForMs(TIMEOUT, function() {
                    var attachmentList = view.down('cn_mail-mailmessageeditorattachmentlist');
                    t.expect(attachmentList.getStore().getRange().length).toBe(0);
                    controller.onFormFileButtonChange(null, null, null, [createFile()]);
                    t.expect(attachmentList.getStore().getRange().length).toBe(1);
                });
            });
        });


        t.it("Should make sure that onShowCcBccButtonClick works properly", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.waitForMs(TIMEOUT, function() {

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
        });


        //conjoon/app-cn_mail/1
        t.it("Should test properly changes for conjoon/app-cn_mail/1", function(t){
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                var wrap  = view.down('#attachmentListWrap').el,
                    event = {
                        preventDefault : Ext.emptyFn,
                        event          : {}
                    },
                    expectCountAndHover = function(t, count, hover) {
                        if (hover) {
                            t.expect(wrap.dom.className).toContain('hover');
                        } else {
                            t.expect(wrap.dom.className).not.toContain('hover');
                        }

                        t.expect(controller.ddListener.dragEnterCount).toBe(count);
                    };

                // dragenter, dragleave, dragend
                t.expect(controller.ddListener.dragEnterCount).toBe(0);
                wrap.fireEvent('dragenter', event);
                expectCountAndHover(t, 1, true);
                wrap.fireEvent('dragenter', event);
                expectCountAndHover(t, 2, true);
                wrap.fireEvent('dragenter', event);
                expectCountAndHover(t, 3, true);
                wrap.fireEvent('dragenter', event);
                expectCountAndHover(t, 4, true);
                wrap.fireEvent('dragleave', event);
                expectCountAndHover(t, 3, true);
                wrap.fireEvent('dragleave', event);
                expectCountAndHover(t, 2, true);
                wrap.fireEvent('dragend', event);
                expectCountAndHover(t, 0, false);

                // registerAttachmentListWrapEnter
                controller.ddListener.registerAttachmentListWrapEnter(true);
                expectCountAndHover(t, 1, true);
                controller.dragEnterCount = 8970;
                controller.ddListener.registerAttachmentListWrapEnter(false, true);
                expectCountAndHover(t, 0, false);
                controller.dragEnterCount = -8970;
                wrap.fireEvent('drop', event);
                expectCountAndHover(t, 0, false);

                controller.dragEnterCount = 0;
                controller.ddListener.onAttachmentListWrapDragEnter(event);
                expectCountAndHover(t, 1, true);
                controller.ddListener.onAttachmentListWrapDragLeave(event);
                expectCountAndHover(t, 0, false);
                controller.dragEnterCount = 9890;
                controller.ddListener.onAttachmentListWrapDragEnd(event);
                expectCountAndHover(t, 0, false);
                controller.dragEnterCount = 9890;
                controller.ddListener.onAttachmentListWrapDrop(event);
                expectCountAndHover(t, 0, false);

                // wait for viewmodel bindings
                t.waitForMs(TIMEOUT, function() {
                    var attachmentList = view.down('cn_mail-mailmessageeditorattachmentlist');
                    t.expect(attachmentList.getStore().getRange().length).toBe(0);
                    controller.addAttachmentsFromFileList([createFile()]);
                    t.expect(attachmentList.getStore().getRange().length).toBe(1);

                    attachmentList.getStore().removeAll();

                    event.event.dataTransfer = {files : [createFile()]};
                    t.expect(attachmentList.getStore().getRange().length).toBe(0);
                    controller.ddListener.onAttachmentListWrapDrop(event);
                    t.expect(attachmentList.getStore().getRange().length).toBe(1);
                });

            });

        });


        t.it("endBusyState()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                view.getViewModel().set('isSaving',  true);
                view.getViewModel().set('isSending', true);
                view.setBusy({msg : 'foo'});

                t.expect(view.busyMask.isHidden()).toBe(false);
                controller.endBusyState('saving');

                t.waitForMs(TIMEOUT, function() {

                    t.expect(view.getViewModel().get('isSaving')).toBe(false);
                    t.expect(view.getViewModel().get('isSending')).toBe(true);

                    t.expect(view.busyMask.isHidden()).toBe(true);

                    view.setBusy({msg : 'foo'});
                    controller.endBusyState('sending');

                    t.waitForMs(TIMEOUT, function() {
                        t.expect(view.getViewModel().get('isSending')).toBe(false);
                        t.expect(view.busyMask.isHidden()).toBe(true);

                        var exc, e;
                        try{
                            controller.endBusyState();
                        } catch (e) {
                            exc = e;
                        }
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg).toContain("Unknown");

                    });
                });});
        });


        t.it("setViewBusy()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.isCalledNTimes('setBusy', view, 2);
                t.expect(view.busyMask).toBeFalsy();
                controller.setViewBusy(createOperation());

                t.expect(view.busyMask).toBeTruthy();
                t.expect(view.busyMask.isHidden()).toBe(false);
                t.expect(view.busyMask.waitTimer).toBeTruthy();

                controller.setViewBusy(createOperation(), 1);
                t.expect(view.busyMask.waitTimer).toBeFalsy();

            });


        });


        t.it("onMailMessageEditorBeforeDestroy()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
             });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);


                // dummy
                view.setBusy({msg : 'foo'});

                t.expect(controller.deferTimers).toBeDefined();
                controller.deferTimers['test'] = 456;
                t.isCalledNTimes('onMailMessageEditorBeforeDestroy', controller, 1);

                t.expect(view.busyMask).toBeDefined();
                t.isCalledNTimes('destroy', view.busyMask, 1);

                t.expect(controller.ddListener).toBeDefined();
                t.isCalledNTimes('destroy', controller.ddListener, 1);

                controller.onMailMessageEditorBeforeDestroy();

                t.expect(controller.deferTimers['test']).toBeUndefined();
            });


        });


// +----------------------------------------------------------------------------
// | SAVING
// +----------------------------------------------------------------------------
        t.it("Should make sure that onSaveButtonClick works properly", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.waitForMs(TIMEOUT, function() {
                    view.down('#subjectField').setValue('test');
                    view.down('cn_mail-mailmessageeditorhtmleditor').setValue('Test');

                    t.isCalledNTimes('onMailMessageBeforeSave',             controller, 1);
                    t.isCalledNTimes('onMailMessageSaveOperationComplete',  controller, 2);
                    t.isCalledNTimes('onMailMessageSaveComplete',           controller, 1);
                    t.isCalledNTimes('onMailMessageSaveOperationException', controller, 0);

                    controller.onSaveButtonClick();

                    t.waitForMs(TIMEOUT, function() {
                        // give enough time for the tests to finish
                    });
                });

            });

        });


        t.it("Should make sure that onSaveButtonClick works properly with exception", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);


            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.waitForMs(TIMEOUT, function() {
                    view.down('#subjectField').setValue('TESTFAIL');
                    view.down('cn_mail-mailmessageeditorhtmleditor').setValue('Test');

                    t.isCalledNTimes('onMailMessageBeforeSave',            controller, 1);
                    t.isCalledNTimes('onMailMessageSaveOperationComplete', controller, 1);
                    t.isCalledNTimes('onMailMessageSaveComplete',          controller, 0);
                    t.isCalledNTimes('onMailMessageSaveOperationException', controller, 1);

                    controller.onSaveButtonClick();

                    t.waitForMs(TIMEOUT, function() {
                        // give enough time for the tests to finish
                    });
                });

            });
        });



        t.it("onMailMessageSaveOperationComplete()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.isCalledNTimes('setViewBusy', controller, 1);
                controller.onMailMessageSaveOperationComplete(
                    view, view.getViewModel().get('messageDraft'), createOperation());

            });

        });


        t.it("onMailMessageSaveOperationException()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                var batch = {retry : function() {}};

                view.getViewModel().set('messageDraft.subject', 'TEST');
                view.getViewModel().set('isSaving', true);
                view.getViewModel().notify();


                t.isCalledNTimes('showMailMessageSaveFailedNotice', view, 2);

                controller.onMailMessageSaveOperationException(
                    view, view.getViewModel().get('messageDraft'), createOperation(), false, false, batch);

                var noButton = Ext.dom.Query.select("span[data-ref=noButton]", view.el.dom);
                t.click(noButton[0], function() {

                    t.waitForMs(TIMEOUT, function() {
                        t.expect(view.getViewModel().get('isSaving')).toBe(false);

                        view.getViewModel().set('isSaving', true);

                        controller.onMailMessageSaveOperationException(
                            view, view.getViewModel().get('messageDraft'), createOperation(), false, false, batch);

                        t.isCalledOnce('retry', batch);

                        var yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);
                        t.click(yesButton[0], function() {
                            t.waitForMs(TIMEOUT, function() {
                                t.expect(view.getViewModel().get('isSaving')).toBe(true);
                            });
                        });

                    });

                });


            });


        });


        t.it("onMailMessageBeforeSave()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.isCalledNTimes('setBusy', view, 1);
                view.getViewModel().get('messageDraft').set('subject', 'foo');
                controller.onMailMessageBeforeSave(
                    view, view.getViewModel().get('messageDraft'), false, false);
                t.waitForMs(TIMEOUT, function() {
                    t.expect(view.getViewModel().get('isSaving')).toBe(true);
                });

            });

        });


        t.it("onMailMessageBeforeSave() - cancelled", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.isCalledNTimes('showSubjectMissingNotice', view, 1);

                controller.onMailMessageBeforeSave(
                    view, view.getViewModel().get('messageDraft'), false, false);
                t.waitForMs(TIMEOUT, function() {
                    t.expect(view.getViewModel().get('isSaving')).toBe(false);
                });
            });


        });


        t.it("onMailMessageBeforeSave() - isSubjectRequired == false", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                view.getViewModel().set('isSubjectRequired', false);
                view.getViewModel().notify();

                t.isntCalled('showSubjectMissingNotice', view);
                t.isCalledNTimes('setBusy', view, 1);

                controller.onMailMessageBeforeSave(
                    view, view.getViewModel().get('messageDraft'), false, false);
                t.waitForMs(TIMEOUT, function() {
                    t.expect(view.getViewModel().get('isSaving')).toBe(true);
                });
            });


        });


        t.it("onMailMessageBeforeSave() - cancelled - cancelButton click", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.isCalledNTimes('showSubjectMissingNotice', view, 1);
                controller.onMailMessageBeforeSave(view, view.getViewModel().get('messageDraft'), false, false);

                var cancelButton = Ext.dom.Query.select("span[data-ref=cancelButton]", view.el.dom),
                    mask         = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom);

                t.click(cancelButton[0], function() {
                    t.waitForMs(TIMEOUT, function() {
                        t.expect(view.getViewModel().get('subject')).toBeFalsy();
                        t.expect(view.getViewModel().get('isSubjectRequired')).toBe(true);
                        t.expect(view.getViewModel().get('isSaving')).toBe(false);
                    });
                });


            });


        });


        t.it("onMailMessageBeforeSave() - cancelled - okButton click / empty subject", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.isCalledNTimes('showSubjectMissingNotice', view, 1);
                controller.onMailMessageBeforeSave(view, view.getViewModel().get('messageDraft'), false, false);

                var okButton = Ext.dom.Query.select("span[data-ref=okButton]", view.el.dom),
                    mask     = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom);

                t.click(okButton[0], function() {

                    t.expect(view.getViewModel().get('subject')).toBeFalsy();
                    t.expect(view.getViewModel().get('isSubjectRequired')).toBe(false);
                    t.expect(view.getViewModel().get('isSaving')).toBe(true);

                });


            });

        });


        t.it("onMailMessageBeforeSave() - cancelled - okButton click / subject specified", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);


            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.isCalledNTimes('showSubjectMissingNotice', view, 1);
                controller.onMailMessageBeforeSave(view, view.getViewModel().get('messageDraft'), false, false);

                var okButton   = Ext.dom.Query.select("span[data-ref=okButton]", view.el.dom),
                    mask       = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom),
                    inputField = Ext.dom.Query.select("input[type=text]", mask);

                inputField[0].value = 'foo';

                t.click(okButton[0], function() {
                    t.expect(view.getViewModel().get('messageDraft').get('subject')).toBe('foo');
                    t.expect(view.getViewModel().get('isSubjectRequired')).toBe(true);
                    t.expect(view.getViewModel().get('isSaving')).toBe(true);
                });


            });
        });


        t.it("onMailMessageBeforeSave() - exception", function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);


                let exc, e;

                try{controller.onMailMessageBeforeSave(view, Ext.create(
                    'conjoon.cn_mail.model.mail.message.MessageDraft'
                ))} catch(e) {exc=e};

                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain("compound key for message draft missing");

            });

        });


        t.it("onMailMessageSaveComplete()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.isCalledNTimes('setViewBusy', controller, 1);
                t.isCalledNTimes('endBusyState', controller, 1);
                controller.onMailMessageSaveComplete(
                    view, view.getViewModel().get('messageDraft'), createOperation(), false, false);
                t.waitForMs(TIMEOUT, function () {
                    // 1500 for delay for endBusyState
                    t.expect(view.getViewModel().get('isSaving')).toBe(false);
                });
            });
        });


// +----------------------------------------------------------------------------
// | SENDING
// +----------------------------------------------------------------------------
        t.it("Should make sure that onSendButtonClick works properly", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);


            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                view.getViewModel().get('messageDraft').set('to', 'address@domain.tld');
                view.down('#subjectField').setValue('SEND');
                view.down('cn_mail-mailmessageeditorhtmleditor').setValue('Test');

                t.isCalledNTimes('onMailMessageBeforeSave', controller, 1);
                t.isCalledNTimes('onMailMessageSaveOperationComplete', controller, 2);
                t.isCalledNTimes('onMailMessageSaveComplete', controller, 1);
                t.isCalledNTimes('onMailMessageSaveOperationException', controller, 0);
                t.isCalledNTimes('onMailMessageBeforeSend', controller, 1);
                t.isCalledNTimes('onMailMessageSendComplete', controller, 1);
                t.isCalledNTimes('onMailMessageSendException', controller, 0);

                controller.onSendButtonClick();

                // send / save both add defers with each appr. 750 ms
                // wait long enough here
                t.waitForMs(TIMEOUT + 1000, function () {
                    // give enough time for the tests to finish
                });
            });
        });


        t.it("Should make sure that onSendButtonClick works properly with exception", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);


            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                view.getViewModel().get('messageDraft').set('to', 'address@domain.tld');
                view.down('#subjectField').setValue('SENDFAIL');
                view.down('cn_mail-mailmessageeditorhtmleditor').setValue('Test');

                t.isCalledNTimes('onMailMessageBeforeSave',             controller, 1);
                t.isCalledNTimes('onMailMessageSaveOperationComplete',  controller, 2);
                t.isCalledNTimes('onMailMessageSaveComplete',           controller, 1);
                t.isCalledNTimes('onMailMessageSaveOperationException', controller, 0);
                t.isCalledNTimes('onMailMessageBeforeSend',             controller, 1);
                t.isCalledNTimes('onMailMessageSendComplete',           controller, 0);
                t.isCalledNTimes('onMailMessageSendException',          controller, 1);

                controller.onSendButtonClick();

                // send / save both add defers with each appr. 750 ms
                // wait long enough here
                t.waitForMs(TIMEOUT + 1000, function() {
                    t.expect(view.getViewModel()).toBeDefined();
                });
            });
        });


        t.it("onMailMessageSendException()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                controller.onMailMessageSendException();

                t.waitForMs(TIMEOUT, function() {
                    t.expect(view.busyMask.isHidden()).toBe(true);
                    t.expect(view.getViewModel().get('isSending')).toBe(false);
                });
            });


        });


        t.it("onMailMessageBeforeSend()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);


            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);
                view.getViewModel().get('messageDraft').set('to', 'address@domain.tld');
                controller.onMailMessageBeforeSend(view, view.getViewModel().get('messageDraft'));

                t.waitForMs(TIMEOUT, function() {
                    t.expect(view.busyMask).toBeDefined();
                    t.expect(view.busyMask.isHidden()).toBe(false);
                    t.expect(view.getViewModel().get('isSending')).toBe(true);
                });
            });
        });


        t.it("onMailMessageBeforeSend() - cancelled", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);


            t.waitForMs(TIMEOUT, function() {
                view.render(document.body);
            t.isCalledOnce('showAddressMissingNotice', view);
            t.expect(controller.onMailMessageBeforeSend(view, view.getViewModel().get('messageDraft'))).toBe(false);

            t.waitForMs(TIMEOUT, function() {

            });});
        });


        t.it("Should make sure that onSendButtonClick works properly when no recipients are specified", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {
            view.render(document.body);
            view.down('#subjectField').setValue('SEND');
            view.down('cn_mail-mailmessageeditorhtmleditor').setValue('Test');

            t.isCalledNTimes('onMailMessageBeforeSave',             controller, 1);
            t.isCalledNTimes('onMailMessageSaveOperationComplete',  controller, 2);
            t.isCalledNTimes('onMailMessageSaveComplete',           controller, 1);
            t.isCalledNTimes('onMailMessageSaveOperationException', controller, 0);
            t.isCalledNTimes('onMailMessageBeforeSend',             controller, 1);
            t.isCalledNTimes('onMailMessageSendComplete',           controller, 0);
            t.isCalledNTimes('onMailMessageSendException',          controller, 0);

            controller.onSendButtonClick();

            // send / save both add defers with each appr. 750 ms
            // wait long enough here
            t.waitForMs(TIMEOUT + 1000, function() {
                // give enough time for the tests to finish
            });});
        });


        t.it("onMailMessageSendComplete()", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {
                view.render(document.body);

                t.isCalledNTimes('close', view, 1);
                controller.onMailMessageSendComplete();

                t.waitForMs(TIMEOUT + 500, function() {
                    // intentionally left blank
                });
            });

        });


        t.it('onMessageEditorAfterrender() - editMode: CREATE', function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller, null, Ext.create(
                        'conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig'));

            t.waitForMs(TIMEOUT, function() {

                let COMPOSED;
                view.showMessageDraftLoadingNotice = function(isComposed) {
                    COMPOSED = isComposed;
                };

                t.expect(COMPOSED).toBeUndefined();
                view.render(document.body);
                t.expect(COMPOSED).toBe(true);

                t.waitForMs(TIMEOUT, function(){
                    // intentionally left blank
                });
            });


        });


        t.it('onMessageEditorAfterrender() - editMode: EDIT', function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });

            view = createEditorForController(controller, null, createKeyForExistingMessage(1));

            t.waitForMs(TIMEOUT, function() {


                let COMPOSED;
                view.showMessageDraftLoadingNotice = function(isComposed) {
                    COMPOSED = isComposed;
                };

                t.expect(COMPOSED).toBeUndefined();
                view.render(document.body);
                t.expect(COMPOSED).toBe(false);

                t.waitForMs(TIMEOUT, function(){
                    // intentionally left blank
                });


           });

        });


        t.it('message editor isCreated argument - message created', function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                let CALLED = 0;
                view.on('cn_mail-mailmessagebeforesave', function(editor, messageDraft, isSending, isCreated) {
                    t.expect(editor).toBe(view);
                    t.expect(isCreated).toBe(true);
                    CALLED++;
                    //debugger;
                });

                t.expect(view.getViewModel().get('messageDraft').get('savedAt')).toBeFalsy();
                view.on('cn_mail-mailmessagesavecomplete', function(editor, messageDraft, operation, isSending, isCreated) {
                    t.expect(messageDraft.get('savedAt')).toBeTruthy();
                    t.expect(isCreated).toBe(true);
                    CALLED++;
                    //debugger;
                });

                t.isCalledOnce('applyAccountInformation', controller);

                t.waitForMs(TIMEOUT, function() {

                    t.expect(CALLED).toBe(0);
                    view.down('#subjectField').setValue('test');
                    view.down('#saveButton').fireEvent('click');

                    t.waitForMs(TIMEOUT, function() {
                        t.expect(CALLED).toBe(2);
                    });
                });

            });

        });


        t.it('message editor isCreated argument - message edited', function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });

            view = createEditorForController(controller, null, createKeyForExistingMessage(1));

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                let CALLED = 0;
                view.on('cn_mail-mailmessagebeforesave', function(editor, messageDraft, isSending, isCreated) {
                    t.expect(editor).toBe(view);
                    t.expect(isCreated).toBe(false);
                    CALLED++;
                    //debugger;
                });

                view.on('cn_mail-mailmessagesavecomplete', function(editor, messageDraft, operation, isSending, isCreated) {
                    t.expect(isCreated).toBe(false);
                    CALLED++;
                    //debugger;
                });


                t.waitForMs(TIMEOUT, function() {
                    t.expect(CALLED).toBe(0);
                    view.down('#saveButton').fireEvent('click');

                    t.waitForMs(TIMEOUT, function() {

                        t.expect(CALLED).toBe(2);

                    });
                });

            });

        });


        t.it('message editor isCreated argument - message edited exception', function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller, null, createKeyForExistingMessage(1));

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                let CALLED = 0;
                view.on('cn_mail-mailmessagebeforesave', function(editor, messageDraft, isSending, isCreated) {
                    t.expect(editor).toBe(view);
                    t.expect(isCreated).toBe(false);
                    CALLED++;
                    //debugger;
                });

                view.on('cn_mail-mailmessagesaveoperationexception', function(editor, messageDraft, operation, isSending, isCreated, batch) {
                    t.expect(isCreated).toBe(false);
                    CALLED++;
                    //debugger;
                });


                t.waitForMs(TIMEOUT, function() {
                    t.expect(CALLED).toBe(0);

                    view.down('#subjectField').setValue('TESTFAIL');

                    view.down('#saveButton').fireEvent('click');

                    t.waitForMs(TIMEOUT, function() {

                        t.expect(CALLED).toBe(2);

                        var yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);
                        t.click(yesButton[0], function() {

                            t.waitForMs(TIMEOUT, function() {
                                t.expect(CALLED).toBe(4);
                            });

                        });

                    });
                });

            });



        });


        t.it('message editor isCreated argument - message created failed', function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                let CALLED = 0;
                view.on('cn_mail-mailmessagebeforesave', function(editor, messageDraft, isSending, isCreated) {
                    t.expect(editor).toBe(view);
                    t.expect(isCreated).toBe(true);
                    CALLED++;
                    //debugger;
                });

                view.on('cn_mail-mailmessagesaveoperationexception', function(editor, messageDraft, operation, isSending, isCreated, batch) {
                    t.expect(isCreated).toBe(true);
                    CALLED++;
                    //debugger;
                });

                t.waitForMs(TIMEOUT, function() {

                    t.expect(CALLED).toBe(0);
                    view.down('#subjectField').setValue('TESTFAIL');
                    view.down('#saveButton').fireEvent('click');

                    t.waitForMs(TIMEOUT, function() {

                        t.expect(CALLED).toBe(2);

                        var yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);
                        t.click(yesButton[0], function() {
                            t.expect(CALLED).toBe(4);
                        });

                    });
                });

            });

        });


        t.it("\"draft\"-flag *NOT* removed from MessageDraft when sending succeeded", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.waitForMs(TIMEOUT, function() {
                    let messageDraft = view.getViewModel().get('messageDraft');

                    messageDraft.set('to', 'address@domain.tld');
                    messageDraft.set('subject', 'foo');
                    view.down('cn_mail-mailmessageeditorhtmleditor').setValue('Test');

                    t.waitForMs(TIMEOUT, function() {
                        t.expect(messageDraft.get('draft')).toBe(true);

                        controller.onSendButtonClick();

                        t.waitForMs(TIMEOUT, function() {
                            t.expect(messageDraft.get('draft')).toBe(true);
                        });

                    });
                });


            });


        });


        t.it("onMailMessageBeforeSave() - attachments committed before save app-cn_mail#75", function(t) {
            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                // t.isCalledNTimes('setBusy', view, 1);
                view.getViewModel().get('messageDraft').set('subject', 'foo');

                let attachment = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment'),
                    COMMITTED  = false;


                view.getViewModel().get('messageDraft').attachments().add(attachment);
                // fake CRUD state
                attachment.crudState = "U";
                attachment.commit = function(silent) {
                    COMMITTED = silent;
                    Ext.data.Model.prototype.commit.apply(attachment, arguments);
                };
                t.expect(attachment.modified.hasOwnProperty('messageItemId')).toBe(true);

                controller.onMailMessageBeforeSave(
                    view, view.getViewModel().get('messageDraft'), false, false);

                t.expect(COMMITTED).toBe(true);

                t.expect(attachment.modified).toBeFalsy();

            });


        });


        t.it("app-cn_mail#39 - getMailboxService()", function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                t.expect(controller.mailboxService).toBeFalsy();

                let ms = controller.getMailboxService();

                t.isInstanceOf(ms, 'conjoon.cn_mail.data.mail.service.MailboxService');
                t.expect(controller.mailboxService).toBe(ms);
                t.expect(controller.getMailboxService()).toBe(ms);
            });


        });


        t.it("app-cn_mail#39 - applyAccountInformation()", function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                let messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                    mailAccountId : 'dev_sys_conjoon_org'
                });

                t.expect(messageDraft.get('from')).toBeFalsy();
                t.expect(messageDraft.get('mailFolderId')).toBeFalsy();
                t.expect(messageDraft.get('date')).toBeFalsy();

                t.waitForMs(TIMEOUT, function() {
                    controller.applyAccountInformation(messageDraft);

                    t.expect(messageDraft.get('mailFolderId')).toBeTruthy();
                    t.expect(messageDraft.get('mailFolderId')).toBe(controller.getMailboxService().getMailFolderHelper().getMailFolderIdForType('dev_sys_conjoon_org', 'DRAFT'));

                    let acc = view.getViewModel().get('cn_mail_mailfoldertreestore').findRecord(
                        'id', 'dev_sys_conjoon_org'
                    );
                    let from = {name : acc.get('name'), address : acc.get('from')};
                    t.expect(messageDraft.get('from')).toEqual(from);

                    t.expect(messageDraft.get('from')).toBeTruthy();
                });

            });


        });


        t.it("applyAccountInformation() - no mailFolder set if already available in draft", function(t) {

            controller = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
                });
            view = createEditorForController(controller);

            let MAILFOLDERID = 'foo';

            t.waitForMs(TIMEOUT, function() {

                view.render(document.body);

                let messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                    mailAccountId : 'dev_sys_conjoon_org',
                    mailFolderId  : MAILFOLDERID
                });

                t.expect(messageDraft.get('mailFolderId')).toBe(MAILFOLDERID);

                t.waitForMs(TIMEOUT, function() {
                    controller.applyAccountInformation(messageDraft);

                    t.expect(messageDraft.get('mailFolderId')).toBe(MAILFOLDERID);
                    t.expect(messageDraft.get('mailFolderId')).not.toBe(controller.getMailboxService().getMailFolderHelper().getMailFolderIdForType('dev_sys_conjoon_org', 'DRAFT'));

                });

            });


        });


});});})