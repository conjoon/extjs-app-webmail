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

    t.afterEach(function() {
        if (panel) {
            panel.destroy();
        }
        panel = null;
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
        viewController.onRowFlyMenuBeforeShow();
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

        let rec = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                mailFolderId : 2,
                isRead       : true
            }),
            CALLED = 0;

        viewController.getMailboxService = function() {
            return {
                moveToTrashOrDeleteMessage : function() {
                    CALLED++;
                }
            };
        }

        t.expect(CALLED).toBe(0);

        viewController.onRowFlyMenuItemClick(null, null, 'delete', rec);

        t.waitForMs(250, function() {
            t.expect(CALLED).toBe(1);
        });


    });




});
