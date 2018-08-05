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

describe('conjoon.cn_mail.view.mail.inbox.InboxViewControllerTest', function(t) {

    var panel;

    const selectMailFolder = function(panel, storeAt) {

        let folder = panel.down('cn_mail-mailfoldertree').getStore().getAt(storeAt);

        panel.down('cn_mail-mailfoldertree').getSelectionModel()
             .select(folder);

        return folder;

    }, selectMessage = function(panel, storeAt) {

        let message = panel.down('cn_mail-mailmessagegrid').getStore().getAt(storeAt);

        panel.down('cn_mail-mailmessagegrid').getSelectionModel()
            .select(message);

        return message;
    }, getMessageGridStore = function(panel) {

        return panel.down('cn_mail-mailmessagegrid').getStore();

    }, getSelectedMessage = function(panel) {

        return panel.down('cn_mail-mailmessagegrid').getSelection()
               ? panel.down('cn_mail-mailmessagegrid').getSelection()[0]
               : null;

    };


    t.afterEach(function() {
        if (panel) {
            panel.destroy();
        }
        panel = null;
    });

t.requireOk('conjoon.cn_mail.model.mail.message.MessageBody', function() {
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageDraftSim', function() {
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', function() {
t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.folder.MailFolderSim', function() {

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });


    t.it("Should create the ViewController", function(t) {

        var _testMailFolderId = {},
            viewController    = Ext.create(
                'conjoon.cn_mail.view.mail.inbox.InboxViewController'
            );

        t.expect(viewController.alias).toContain('controller.cn_mail-mailinboxviewcontroller');
        t.expect(viewController instanceof Ext.app.ViewController).toBe(true);

        panel = Ext.create('Ext.Panel', {
            controller : viewController,

            viewModel : {
                updateUnreadMessageCount : function(mailFolderId, unreadCount) {
                    _testMailFolderId[mailFolderId] = unreadCount;
                }
            },

            width  : 800,
            height : 600,

            items : [{
                xclass : 'conjoon.cn_mail.view.mail.message.reader.MessageView'
            }]
        });

        panel.down('cn_mail-mailmessagereadermessageview').fireEvent(
            'cn_mail-mailmessageitemread', [
            Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                mailFolderId : 1,
                isRead       : true
            }),
            Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                mailFolderId : 1,
                isRead       : false
            }),
            Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                mailFolderId : 2,
                isRead       : false
            }),
            Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                mailFolderId : 2,
                isRead       : true
            }),
            Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                mailFolderId : 2,
                isRead       : true
            })
        ]);


        t.expect(_testMailFolderId).toEqual({
            2 : -1
        })


    });


    t.it("onMailFolderTreeSelect", function(t) {

        const viewController = Ext.create(
                'conjoon.cn_mail.view.mail.inbox.InboxViewController'
            ),
            node = Ext.create('conjoon.cn_mail.model.mail.folder.MailFolder', {
                id : 2
            });

        t.isCalledNTimes('redirectTo', viewController, 1);

        viewController.onMailFolderTreeSelect(null, node);
    });


    t.it("onMessageItemRead()", function(t) {

        let CALLED = 0;

        const viewController = Ext.create(
            'conjoon.cn_mail.view.mail.inbox.InboxViewController',
            {
                view : {
                getViewModel : function() {
                    return {
                        updateUnreadMessageCount : function() {
                            CALLED++;
                        }
                    }
                }
            }}),
            node = Ext.create('conjoon.cn_mail.model.mail.folder.MailFolder', {
                id : 2
            });

        t.expect(CALLED).toBe(0);
        viewController.onMessageItemRead(Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            mailFolderId : 2,
            isRead       : false
        }));
        t.expect(CALLED).toBe(1);

        CALLED = 0;

        t.expect(CALLED).toBe(0);
        viewController.onMessageItemRead([Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            mailFolderId : 2,
            isRead       : false
        }), Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            mailFolderId : 3,
            isRead       : true
        })]);
        t.expect(CALLED).toBe(2);
    });


    t.it('onRowFlyMenuItemClick()', function(t) {

        const viewController = Ext.create(
            'conjoon.cn_mail.view.mail.inbox.InboxViewController');

        let rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                mailFolderId : 2,
                isRead       : true
            }),
            CALLED = 0;

        viewController.onMessageItemRead = function() {
            CALLED++;
        }

        t.expect(rec.get('isRead')).toBe(true);
        t.expect(CALLED).toBe(0);

        viewController.onRowFlyMenuItemClick(null, null, 'markunread', rec);

        t.waitForMs(250, function() {
            t.expect(rec.get('isRead')).toBe(false);
            t.expect(CALLED).toBe(1);
        });

    });


    t.it('onRowFlyMenuBeforeShow()', function(t) {

        let CALLED = 0;

        const viewController = Ext.create(
            'conjoon.cn_mail.view.mail.inbox.InboxViewController', {
                view : {
                    down : function() {
                        return {
                            updateRowFlyMenu : function() {
                                CALLED++;
                            }
                        }
                    }
                }});

        t.expect(CALLED).toBe(0);
        viewController.onRowFlyMenuBeforeShow(null, null, {get : function(){}});
        t.expect(CALLED).toBe(1);

    });


    t.it('getMailBoxMessageService()', function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {

            width    : 800,
            height   : 600,
            renderTo : document.body

        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {
            let service = viewController.getMailboxService();

            t.isInstanceOf(service, 'conjoon.cn_mail.data.mail.service.MailboxService');
            t.expect(service).toBe(viewController.getMailboxService());

            t.isInstanceOf(service.getMailFolderHelper(), 'conjoon.cn_mail.data.mail.service.MailFolderHelper');
            t.expect(service.getMailFolderHelper().getStore()).toBe(viewController.getView().down('cn_mail-mailfoldertree').getStore())

        });

    });


    t.it('onRowFlyMenuItemClick() - delete', function(t) {

        const viewController = Ext.create(
            'conjoon.cn_mail.view.mail.inbox.InboxViewController');

        viewController.getMailboxService = function() {
            return {
                moveToTrashOrDeleteMessage : function() {}
            }
        };

        let rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                mailFolderId : 2,
                isRead       : true
            });

        t.isCalled('moveOrDeleteMessage', viewController);
        viewController.onRowFlyMenuItemClick(null, null, 'delete', rec);
    });


    t.it('onRowFlyMenuBeforeShow() - cn_deleted / cn_moved', function(t) {

        let CALLED = 0;

        const viewController = Ext.create(
            'conjoon.cn_mail.view.mail.inbox.InboxViewController'
            );

        t.expect(viewController.onRowFlyMenuBeforeShow(null, null,  Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            mailFolderId : 1,
            cn_deleted : true
        }))).toBe(false);


        t.expect(viewController.onRowFlyMenuBeforeShow(null, null,  Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            mailFolderId : 1,
            cn_moved : true
        }))).toBe(false);
    });


    t.it("onBeforeMessageMoveOrDelete()", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 2);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                let op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                    request : {
                        type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                        record : messageItem
                    }
                });

                t.expect(messageItem.get('cn_moved')).toBe(false);
                t.expect(viewController.onBeforeMessageMoveOrDelete(op, true)).toBe(op);
                t.expect(messageItem.get('cn_moved')).toBe(true);

                messageItem = selectMessage(panel, 2);
                op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                    request : {
                        type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                        record : messageItem
                    }
                });

                t.isCalled('detachMenuAndUnset', viewController.getRowFlyMenu());
                t.expect(messageItem).toBeTruthy();
                t.expect(messageItem.get('cn_deleted')).toBe(false);
                t.expect(messageItem.store).toBe(getMessageGridStore(panel));
                t.expect(getSelectedMessage(panel)).toBe(messageItem);
                t.expect(viewController.onBeforeMessageMoveOrDelete(op, true)).toBe(op);
                t.expect(messageItem.get('cn_deleted')).toBe(true);
                t.expect(messageItem.store).toBeFalsy();
                t.expect(getSelectedMessage(panel)).toBeFalsy();
            });
        });
    });


    t.it("onMessageMovedOrDeletedFailure()", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 2);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                messageItem.unjoin(messageItem.store);
                messageItem.set('cn_moved',   true);


                let op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                    request : {
                        type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                        record : messageItem
                    }
                });

                t.expect(messageItem.get('cn_moved')).toBe(true);
                t.expect(viewController.onMessageMovedOrDeletedFailure(op)).toBe(op);
                t.expect(messageItem.get('cn_moved')).toBe(false);

                messageItem = selectMessage(panel, 2);
                messageItem.unjoin(messageItem.store);
                messageItem.set('cn_deleted', true);
                op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                    request : {
                        type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                        record : messageItem
                    }
                });

                t.isCalled('reject', messageItem);

                t.expect(messageItem).toBeTruthy();
                t.expect(messageItem.get('cn_deleted')).toBe(true);
                t.expect(messageItem.store).toBeFalsy();
                t.expect(viewController.onMessageMovedOrDeletedFailure(op)).toBe(op);
                t.expect(messageItem.get('cn_deleted')).toBe(false);
                t.expect(messageItem.store).toBe(getMessageGridStore(panel));
            });
        });
    });


    t.it("onMessageMovedOrDeleted() - MOVED - targetFolder not shown in messageGrid", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 2);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                messageItem.unjoin(messageItem.store);
                messageItem.set('cn_moved',   true);

                let op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                    request : {
                        type           : conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                        record         : messageItem,
                        targetFolderId : "5"
                    }
                });

                t.isCalled('remove', viewController.getLivegrid());
                t.isntCalled('add', viewController.getLivegrid());

                t.expect(messageItem.get('cn_moved')).toBe(true);
                t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                t.expect(messageItem.get('cn_moved')).toBe(false);
                t.expect(messageItem.store).toBe(getMessageGridStore(panel));
            });
        });
    });


    t.it("onMessageMovedOrDeleted() - MOVED - targetFolder shown in messageGrid", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 2);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                selectMailFolder(panel, 4);

                t.waitForMs(250, function() {
                    messageItem.unjoin(messageItem.store);
                    messageItem.set('cn_moved',   true);

                    let op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                        request : {
                            type           : conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
                            record         : messageItem,
                            targetFolderId : "5"
                        }
                    });

                    t.isntCalled('remove', viewController.getLivegrid());
                    t.isCalled('add', viewController.getLivegrid());

                    t.expect(messageItem.get('cn_moved')).toBe(true);
                    t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                    t.expect(messageItem.get('cn_moved')).toBe(false);
                    t.expect(messageItem.store).toBe(getMessageGridStore(panel));
                });
            });
        });
    });


    t.it("onMessageMovedOrDeleted() - DELETED - messageItems MailFolder not selected", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 2);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                selectMailFolder(panel, 4);

                t.waitForMs(250, function() {
                    messageItem.unjoin(messageItem.store);
                    messageItem.set('cn_deleted', true);

                    let op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                        request : {
                            type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                            record : messageItem
                        }
                    });

                    t.isntCalled('remove', viewController.getLivegrid());
                    t.isntCalled('add', viewController.getLivegrid());

                    t.expect(messageItem.get('cn_deleted')).toBe(true);
                    t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                    t.expect(messageItem.get('cn_deleted')).toBe(false);
                    t.expect(messageItem.store).toBeFalsy();
                });
            });
        });
    });


    t.it("onMessageMovedOrDeleted() - DELETED - messageItems MailFolder is selected", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 2);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                    messageItem.unjoin(messageItem.store);
                    messageItem.set('cn_deleted', true);

                    let op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
                        request : {
                            type   : conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
                            record : messageItem
                        }
                    });

                    t.isCalled('remove', viewController.getLivegrid());
                    t.isntCalled('add', viewController.getLivegrid());

                    t.expect(messageItem.get('cn_deleted')).toBe(true);
                    t.expect(viewController.onMessageMovedOrDeleted(op)).toBe(op);
                    t.expect(messageItem.get('cn_deleted')).toBe(false);
                    t.expect(messageItem.store).toBeFalsy();
            });
        });
    });


    t.it('moveOrDeleteMessage()', function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            // should be move operation since selected folder is not of type
            // TRASH
            t.expect(selectMailFolder(panel, 1).get('type')).not.toBe('TRASH');

            t.waitForMs(250, function() {
                let messageItem = panel.down('cn_mail-mailmessagegrid').getStore().getAt(0);

                t.isCalled('moveToTrashOrDeleteMessage', viewController.getMailboxService());
                t.isCalled('onBeforeMessageMoveOrDelete', viewController);
                t.isCalled('onMessageMovedOrDeleted', viewController);
                t.isntCalled('onMessageMovedOrDeletedFailure', viewController);

                t.isInstanceOf(viewController.moveOrDeleteMessage(messageItem, true), 'conjoon.cn_mail.data.mail.service.mailbox.Operation');

                t.waitForMs(250, function() {
                    // intentionally left empty
                })
            });
        });
    });


    t.it('moveOrDeleteMessage() - failure', function(t){

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let folder =  selectMailFolder(panel, 4);
            t.expect(folder.get('type')).toBe('TRASH');

            t.waitForMs(250, function() {
                let messageItem = Ext.create(
                    'conjoon.cn_mail.model.mail.message.MessageItem', {
                        id           : 'foobar',
                        mailFolderId : folder.getId()
                    });

                t.isCalled('onMessageMovedOrDeletedFailure', viewController);

                viewController.moveOrDeleteMessage(messageItem, true);

                t.waitForMs(250, function() {
                    // intentionally left empty
                })
            })
        });

    });


    t.it('callbacks registered for delete draft / delete buttons', function(t){

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        let messageView = panel.down('cn_mail-mailmessagereadermessageview');


        t.waitForMs(250, function() {

            t.isCalledNTimes('onDeleteClick', viewController, 2);
            t.isCalledNTimes('onDeleteClick', viewController, 2);



            selectMailFolder(panel, 4);

            t.waitForMs(250, function() {

                selectMessage(panel, 2);

                t.waitForMs(250, function() {

                    messageView.down('#btn-delete').fireEvent('click');

                    t.waitForMs(250, function() {

                        selectMessage(panel, 4);

                        t.waitForMs(250, function() {

                            messageView.down('#btn-deletedraft').fireEvent('click');


                            t.waitForMs(250, function() {
                                // intentionally left empty
                            });

                        });
                    });

                });
            });
        });
    });


    t.it("onBeforeMessageMoveOrDelete() - cancel delete", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 4);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                t.isntCalled('erase', messageItem);
                t.isntCalled('moveMessage', viewController.getMailboxService());

                let cb = function() {
                    return false;
                };

                Ext.GlobalEvents.on('cn_mail-beforemessageitemdelete', cb);

                let op = viewController.moveOrDeleteMessage(messageItem, true);

                t.expect(messageItem.dropped).toBe(false);
                t.expect(messageItem.get('cn_deleted')).toBe(false);
                t.expect(messageItem.get('cn_moved')).toBe(false);
                t.expect(messageItem.store).toBe(getMessageGridStore(panel));

                t.expect(op.getResult()).toBeDefined();
                t.expect(op.getResult().success).toBe(false);
                t.expect(op.getResult().code).toBe(conjoon.cn_mail.data.mail.service.mailbox.Operation.CANCELED);

                Ext.GlobalEvents.un('cn_mail-beforemessageitemdelete', cb);

            });
        });
    });



    t.it("moveOrDeleteMessage() - confirm dialog not shown", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 4);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                let cb = function() {
                    return false;
                };

                Ext.GlobalEvents.on('cn_mail-beforemessageitemdelete', cb);

                t.isntCalled('showMessageDeleteConfirmDialog', viewController.getView());
                viewController.moveOrDeleteMessage(messageItem);

                Ext.GlobalEvents.un('cn_mail-beforemessageitemdelete', cb);



            });
        });
    });


    t.it("moveOrDeleteMessage() - confirm dialog shown", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 4);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                let cb = function() {
                    return true;
                };

                Ext.GlobalEvents.on('cn_mail-beforemessageitemdelete', cb);

                t.isCalled('showMessageDeleteConfirmDialog', viewController.getView());
                t.isCalled('erase', messageItem);


                viewController.moveOrDeleteMessage(messageItem);

                let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                t.click(yesButton[0]);

                Ext.GlobalEvents.un('cn_mail-beforemessageitemdelete', cb);

                t.waitForMs(250, function() {
                    // intentionally left blank
                });


            });
        });
    });


    t.it("moveOrDeleteMessage() - confirm dialog shown while global event returned false again", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            let mailFolder = selectMailFolder(panel, 4);

            t.waitForMs(250, function() {

                let messageItem = selectMessage(panel, 3);

                let cbtrue = function() {
                    return true;
                },
                cbfalse = function() {
                    return false;
                };

                Ext.GlobalEvents.on('cn_mail-beforemessageitemdelete', cbtrue);

                t.isntCalled('erase', messageItem);
                t.isCalled('showMessageDeleteConfirmDialog', viewController.getView());
                viewController.moveOrDeleteMessage(messageItem);

                Ext.GlobalEvents.un('cn_mail-beforemessageitemdelete', cbtrue);

                Ext.GlobalEvents.on('cn_mail-beforemessageitemdelete', cbfalse);
                let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", viewController.getView().el.dom);
                t.click(yesButton[0]);

                Ext.GlobalEvents.un('cn_mail-beforemessageitemdelete', cbtrue);
                Ext.GlobalEvents.un('cn_mail-beforemessageitemdelete', cbfalse);

                t.waitForMs(250, function() {
                    // intentionally left blank
                });

            });
        });
    });


    t.it("updateViewForSentDraft() - no selection", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(250, function() {

            t.expect(viewController.updateViewForSentDraft(
                Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft')
            )).toBe(null);
        });
    });


    t.it("updateViewForSentDraft() - mail folder SENT selected", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(750, function() {

            // messageDrafts are sent once they have been moved to DRAFT folder
            let messageDraft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
                id           : '98970978',
                mailFolderId : viewController.getMailboxService().getMailFolderHelper().getMailFolderIdForType(conjoon.cn_mail.data.mail.folder.MailFolderTypes.DRAFT)
            });

            messageDraft.setMessageBody(Ext.create('conjoon.cn_mail.model.mail.message.MessageBody'));

            t.waitForMs(750, function() {

                let mailFolder = selectMailFolder(panel, 1);

                t.waitForMs(750, function() {

                    t.isCalledOnce('onBeforeMessageMoveOrDelete', viewController);
                    t.isCalledOnce('onMessageMovedOrDeleted', viewController);

                    let op = viewController.updateViewForSentDraft(messageDraft);

                    t.isInstanceOf(op, 'conjoon.cn_mail.data.mail.service.mailbox.Operation');

                    t.expect(op.getRequest().targetFolderId).toBe("2");

                    t.waitForMs(250, function() {
                        // intentionally left blank
                    });
                });
            });
        });
    });


    t.it("updateViewForSentDraft() - mail folder DRAFT selected", function(t) {

        panel = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', {
            width    : 800,
            height   : 600,
            renderTo : document.body
        });

        const viewController = panel.getController();

        t.waitForMs(750, function() {

            t.waitForMs(750, function() {

                let mailFolder = selectMailFolder(panel, 3);

                t.waitForMs(750, function() {

                    let messageItem  = selectMessage(panel, 0),
                        messageDraft = conjoon.cn_mail.model.mail.message.MessageDraft.load(messageItem.getId());

                    t.waitForMs(750, function() {

                        let op = viewController.updateViewForSentDraft(messageDraft);

                        t.isInstanceOf(op, 'conjoon.cn_mail.data.mail.service.mailbox.Operation');
                        t.expect(op.getRequest().targetFolderId).toBe("2");
                        t.expect(op.getRequest().sourceFolderId).toBe(mailFolder.getId());

                        t.waitForMs(250, function() {
                            // intentionally left blank
                        });
                    });
                });

            });
        });
    });


});});});});});
