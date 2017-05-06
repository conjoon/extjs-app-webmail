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

describe('conjoon.cn_mail.view.mail.message.MessageViewTest', function(t) {


    var view;

    t.afterEach(function() {
        return;
        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function() {

        viewConfig = {
            width    : 800,
            height   : 600,
            renderTo : document.body
        }
    });



    t.it("Should create and show the inbox view along with default config checks", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        t.expect(view instanceof Ext.Panel).toBeTruthy();

        t.expect(view.alias).toContain('widget.cn_mail-mailinboxview');

        t.expect(view.closable).toBe(false);

        t.expect(
            view.getViewModel() instanceof conjoon.cn_mail.view.mail.inbox.InboxViewModel
        ).toBe(true);

        t.expect(
            view.getController() instanceof conjoon.cn_mail.view.mail.inbox.InboxViewController
        ).toBe(true);

        t.expect(view.getSession()).toBeFalsy();

        t.expect(view.down('cn_mail-mailfoldertree') instanceof conjoon.cn_mail.view.mail.folder.MailFolderTree).toBe(true);
        t.expect(view.down('cn_mail-mailmessagegrid') instanceof conjoon.cn_mail.view.mail.message.MessageGrid).toBe(true);
        t.expect(view.down('cn_mail-mailmessagereadermessageview') instanceof conjoon.cn_mail.view.mail.message.reader.MessageView).toBe(true);

        view.destroy();

        view = null;

    });

    t.it("Should select folder and messageItem properly create and show the inbox view along with default config checks", function(t) {

        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

            view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

            var grid        = view.down('cn_mail-mailmessagegrid'),
                tree        = view.down('cn_mail-mailfoldertree'),
                messageView = view.down('cn_mail-mailmessagereadermessageview');

            t.expect(tree.getStore().getRange().length).toBe(0);
            t.expect(grid.getStore().getRange().length).toBe(0);
            t.expect(messageView.getViewModel().get('messageItem')).toBeFalsy();


            t.waitForMs(500, function(){
                var mailFolder = tree.getStore().getAt(0),
                   unreadCount =  mailFolder.get('unreadCount');

                t.expect(unreadCount).not.toBe(0);
                tree.getSelectionModel().select(mailFolder);

                t.waitForMs(750, function(){

                    var messageItem = grid.getStore().getAt(0);
                    t.expect(grid.getStore().getTotalCount()).not.toBe(0);
                    messageItem.set('isRead', false);
                    t.expect(messageItem.get('isRead')).toBe(false);
                    grid.getSelectionModel().select(messageItem);

                    t.waitForMs(500, function(){
                        t.expect(messageView.getViewModel().get('messageItem')).toBe(messageItem);

                        t.expect(mailFolder.get('unreadCount')).toBe(unreadCount - 1);
                    });

                });
            });









        });

    });



});
