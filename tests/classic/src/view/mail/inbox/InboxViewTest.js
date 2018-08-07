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

describe('conjoon.cn_mail.view.mail.message.MessageViewTest', function(t) {


    var view;

    t.afterEach(function() {
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
        t.expect(view.down('#cn_mail-mailmessagegridcontainer') instanceof Ext.Container).toBe(true);
        t.expect(view.down('cn_mail-mailmessagegrid') instanceof conjoon.cn_mail.view.mail.message.MessageGrid).toBe(true);
        t.expect(view.down('cn_mail-mailmessagereadermessageview') instanceof conjoon.cn_mail.view.mail.message.reader.MessageView).toBe(true);

        view.destroy();

        view = null;

    });

    t.it("Should select folder and messageItem properly create and show the inbox view along with default config checks", function(t) {

        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
            view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

            var grid           = view.down('cn_mail-mailmessagegrid'),
                tree           = view.down('cn_mail-mailfoldertree'),
                gridMessageBox = view.down('#msgIndicatorBox'),
                messageView    = view.down('cn_mail-mailmessagereadermessageview');

            t.expect(tree.getStore().getRange().length).toBe(0);
            t.expect(grid.getStore().getRange().length).toBe(0);
            t.expect(messageView.getViewModel().get('messageItem')).toBeFalsy();

            t.waitForMs(500, function(){
                t.expect(messageView.isVisible()).toBe(false);
                t.expect(gridMessageBox.isVisible()).toBe(true);
                t.expect(grid.isVisible()).toBe(false);

                t.waitForMs(500, function(){
                    var mailFolder = tree.getStore().getAt(0),
                        unreadCount =  mailFolder.get('unreadCount');

                    t.expect(unreadCount).not.toBe(0);
                    tree.getSelectionModel().select(mailFolder);

                    t.waitForMs(750, function(){

                        t.expect(messageView.isVisible()).toBe(true);
                        t.expect(gridMessageBox.isVisible()).toBe(false);
                        t.expect(grid.isVisible()).toBe(true);

                        var messageItem = grid.getStore().getAt(0);
                        t.expect(grid.getStore().getTotalCount()).not.toBe(0);
                        messageItem.set('seen', false);
                        t.expect(messageItem.get('seen')).toBe(false);
                        grid.getSelectionModel().select(messageItem);

                        t.waitForMs(500, function(){
                            t.expect(messageView.getViewModel().get('messageItem')).toBe(messageItem);

                            t.expect(mailFolder.get('unreadCount')).toBe(unreadCount - 1);
                            view.destroy();
                        });

                    });
                });
            });


        });

    });

    t.it("toggleReadingPane()", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        var messageView = view.down('cn_mail-mailmessagereadermessageview'),
            bodyLayout  = view.down('#cn_mail-mailInboxViewPanelBody').getLayout();

        t.expect(messageView.isVisible()).toBe(true);
        t.expect(bodyLayout.getVertical()).toBe(false);

        view.toggleReadingPane('bottom');
        t.expect(messageView.isVisible()).toBe(true);
        t.expect(bodyLayout.getVertical()).toBe(true);

        view.toggleReadingPane('right');
        t.expect(messageView.isVisible()).toBe(true);
        t.expect(bodyLayout.getVertical()).toBe(false);

        view.toggleReadingPane();
        t.expect(messageView.isVisible()).toBe(false);

        view.toggleReadingPane('bottom');
        t.expect(messageView.isVisible()).toBe(true);
        t.expect(bodyLayout.getVertical()).toBe(true);


        view.destroy();
    });


    t.it("Selection after switching between folders in grid is still available", function(t) {

        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
            view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

            var grid           = view.down('cn_mail-mailmessagegrid'),
                tree           = view.down('cn_mail-mailfoldertree'),
                gridMessageBox = view.down('#msgIndicatorBox'),
                messageView    = view.down('cn_mail-mailmessagereadermessageview');


            t.waitForMs(500, function(){

                t.waitForMs(500, function(){
                    var mailFolder1 = tree.getStore().getAt(0),
                        mailFolder2 = tree.getStore().getAt(1);

                    tree.getSelectionModel().select(mailFolder1);

                    t.waitForMs(750, function(){

                        var messageItem = grid.getStore().getAt(0);

                        grid.getSelectionModel().select(messageItem);

                        t.expect(grid.getSelection()[0]).toBe(messageItem);

                        grid.view.getScrollable().scrollTo(0, 100000);

                        grid.getStore().getData().removeAtKey(1);
                        t.expect(grid.getStore().getData().map[1]).toBeUndefined();

                        t.expect(grid.getSelection()[0]).toBe(messageItem);

                        tree.getSelectionModel().select(mailFolder2);

                        t.waitForMs(750, function(){


                            t.expect(grid.getSelection()[0]).toBe(messageItem);

                            var messageItem2 = grid.getStore().getAt(0);

                            grid.getSelectionModel().select(messageItem2);

                            t.expect(grid.getSelection()[0]).toBe(messageItem2);

                            tree.getSelectionModel().select(mailFolder2);

                            t.waitForMs(750, function(){
                                t.expect(grid.getSelection()[0]).toBe(messageItem2);
                                view.destroy();
                            });


                        });

                    });
                });
            });


        });

    });


    t.it("should trigger onRowFlyMenuItemClick()", function(t) {

        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
            view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

            let grid = view.down('cn_mail-mailmessagegrid');

            t.isCalledNTimes('onRowFlyMenuItemClick', view.getController(), 1)
            grid.fireEvent('cn_comp-rowflymenu-itemclick');

        });

    });


    t.it("should trigger onRowFlyMenuBeforeShow()", function(t) {

        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
            view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

            let grid = view.down('cn_mail-mailmessagegrid');

            t.isCalledNTimes('onRowFlyMenuBeforeShow', view.getController(), 1)
            grid.fireEvent('cn_comp-rowflymenu-beforemenushow', null, 1, {get : Ext.emptyFn});

        });

    });


    t.it("reply all / edit draft / delete draft button is there", function(t) {

        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
            view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

            var grid           = view.down('cn_mail-mailmessagegrid'),
                tree           = view.down('cn_mail-mailfoldertree'),
                messageView    = view.down('cn_mail-mailmessagereadermessageview');

            t.expect(messageView.down('#btn-editdraft')).toBeTruthy();
            t.expect(messageView.down('#btn-deletedraft')).toBeTruthy();
            t.expect(messageView.down('#btn-replyall')).toBeTruthy();
            t.expect(messageView.down('#btn-replyall').getMenu()).toBeTruthy();

            t.expect(messageView.down('#btn-replyall').getMenu().down('#btn-forward')).toBeTruthy();
            t.expect(messageView.down('#btn-replyall').getMenu().down('#btn-reply')).toBeTruthy();

            t.expect(messageView.down('#btn-replyall').up('toolbar').isVisible()).toBe(false);

            t.waitForMs(500, function(){

                t.waitForMs(500, function(){
                    var mailFolder = tree.getStore().getAt(0);
                    t.expect(mailFolder.get('type')).not.toBe('DRAFT');
                    tree.getSelectionModel().select(mailFolder);

                    t.waitForMs(750, function(){

                        var messageItem = grid.getStore().getAt(0);
                        messageItem.set('draft', false);
                        grid.getSelectionModel().select(messageItem);

                        t.waitForMs(500, function(){
                            t.expect(messageView.down('#btn-replyall').up('toolbar').isVisible()).toBe(true);

                            t.expect(messageView.down('#btn-replyall').isVisible()).toBe(true);
                            t.expect(messageView.down('#btn-editdraft').isVisible()).toBe(false);
                            t.expect(messageView.down('#btn-deletedraft').isVisible()).toBe(false);

                            messageItem = grid.getStore().getAt(1);
                            messageItem.set('draft', true);
                            grid.getSelectionModel().select(messageItem);

                            t.waitForMs(250, function(){
                                t.expect(messageView.down('#btn-replyall').isVisible()).toBe(false);
                                t.expect(messageView.down('#btn-editdraft').isVisible()).toBe(true);
                                t.expect(messageView.down('#btn-deletedraft').isVisible()).toBe(true);

                                view.destroy();
                            });

                        });

                    });
                });
            });
        });
    });


    t.it("showMessageDeleteConfirmDialog()", function(t) {

        t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
            Ext.ux.ajax.SimManager.init({
                delay: 1
            });
            view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

            var grid           = view.down('cn_mail-mailmessagegrid'),
                tree           = view.down('cn_mail-mailfoldertree'),
                messageView    = view.down('cn_mail-mailmessagereadermessageview');

            let obj = { CALLED : 0},
                fn = function() {
                    this.CALLED++;
                };

            t.expect(obj.CALLED).toBe(0);
            let mask = view.showMessageDeleteConfirmDialog(null, fn, obj);
            t.isInstanceOf(mask, 'conjoon.cn_comp.component.MessageMask');
            t.expect(mask).toBe(view.deleteMask);
            t.expect(view.showMessageDeleteConfirmDialog(null, fn, obj)).toBe(mask);

            let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);
            t.click(yesButton[0]);
            t.waitForMs(250, function() {
                t.expect(obj.CALLED).toBe(1);
                t.expect(view.deleteMask).toBe(null);
            });


        });
    });


    t.it("updateViewForCreatedDraft() - delegates to controller", function(t){

        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        t.isCalledOnce('updateViewForCreatedDraft', view.getController());

        view.updateViewForCreatedDraft(Ext.create(
            'conjoon.cn_mail.model.mail.message.MessageDraft', {id : 'foo'}
        ));
    });


    t.it("updateViewForSentDraft() - delegates to controller", function(t){
        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        t.isCalledOnce('updateViewForSentDraft', view.getController())

        view.updateViewForSentDraft(Ext.create(
            'conjoon.cn_mail.model.mail.message.MessageDraft', {id : 'foo'}
        ));
    })


});
