/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2020-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewControllerTest_01', function(t) {
    createTemplateSpies(t, function (t) {
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


t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim',
            'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


// +----------------------------------------------------------------------------
// | SENDING
// +----------------------------------------------------------------------------


    t.it("getSendMessageDraftRequestConfig()", function(t) {
        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {
            });

        let messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
            mailAccountId : 1, mailFolderId : 1, id : 1
        });
        messageDraft.dirty = messageDraft.phantom = false;

        t.expect(
            controller.getSendMessageDraftRequestConfig(messageDraft)
        ).toEqual({
            url    : './cn_mail/SendMessage',
            params : messageDraft.getCompoundKey().toObject()
        })

        let tmp = Ext.Ajax.request;

        controller.getView = function() {
            return {
                getViewModel : function() {
                    return {
                        get : function() {
                            return messageDraft;
                        }
                    }
                },
                fireEvent : function() {

                }
            }
        };

        controller.getSendMessageDraftRequestConfig = function() {
            return {CALLED : true};
        }

        let REQUEST = false;
        Ext.Ajax.request = function(cfg) {
            REQUEST = true;
            t.expect(cfg).toEqual({CALLED : true});
            return Ext.Promise.resolve();
        };

        controller.sendMessage();

        t.expect(REQUEST).toBe(true);
        Ext.Ajax.request = tmp;
    });



    });});});