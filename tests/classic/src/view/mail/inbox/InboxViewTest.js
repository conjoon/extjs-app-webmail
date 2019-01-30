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

describe('conjoon.cn_mail.view.mail.message.MessageViewTest', function(t) {


    const TIMEOUT = 1250,

        getChildAt = function(panel, rootId, index, shouldBe, t) {

            let root = panel.down('cn_mail-mailfoldertree').getStore().getRoot().findChild('id', rootId),
                c    = root.getChildAt(index);

            if (shouldBe && t) {
                t.expect(c.get('id')).toBe(shouldBe);
            }

            return c;
        },
        selectMailFolder = function(panel, storeAt, shouldBeId, t) {

            let folder = storeAt instanceof Ext.data.TreeModel
                         ? storeAt
                         : panel.down('cn_mail-mailfoldertree').getStore().getAt(storeAt);

            let p = folder.parentNode;

            while (p) {
                p.expand();
                p = p.parentNode;
            }

            panel.down('cn_mail-mailfoldertree').getSelectionModel()
                .select(folder);

            if (shouldBeId && t) {
                t.expect(folder.get('id')).toBe(shouldBeId);
            }

            return folder;

        },
        discardView = function(t) {

            t.waitForMs(1, function() {
                if (view) {

                    view.destroy();
                    view = null;

                    t.waitForMs(1, function() {});
                }
            });
        };

    let view;

    t.afterEach(function() {


    });

    t.beforeEach(function() {

        viewConfig = {
            viewModel : {
                type : 'cn_mail-mailinboxviewmodel',
                stores : {
                    'cn_mail-mailfoldertreestore' : {
                        type : 'cn_mail-mailfoldertreestore',
                        autoLoad : true
                    }
                }
            },
            width    : 800,
            height   : 600,
            renderTo : document.body
        }
    });

t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {
t.requireOk('conjoon.cn_mail.store.mail.folder.MailFolderTreeStore', function() {

    Ext.ux.ajax.SimManager.init({
        delay: 1
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

        discardView(t);

    });

    t.it("Should select folder and messageItem properly create and show the inbox view along with default config checks", function(t) {


        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        var grid           = view.down('cn_mail-mailmessagegrid'),
            tree           = view.down('cn_mail-mailfoldertree'),
            gridMessageBox = view.down('#msgIndicatorBox'),
            messageView    = view.down('cn_mail-mailmessagereadermessageview');

        t.expect(tree.getStore().getRange().length).toBe(0);
        t.expect(grid.getStore().getRange().length).toBe(0);
        t.expect(messageView.getViewModel().get('messageItem')).toBeFalsy();

        t.waitForMs(TIMEOUT, function(){
            t.expect(messageView.isVisible()).toBe(false);
            t.expect(gridMessageBox.isVisible()).toBe(true);
            t.expect(grid.isVisible()).toBe(false);

            t.waitForMs(TIMEOUT, function(){
                var mailFolder = getChildAt(view, 'dev_sys_conjoon_org', 0, 'INBOX', t),
                    unreadCount =  mailFolder.get('unreadCount');

                t.expect(unreadCount).not.toBe(0);
                tree.getSelectionModel().select(mailFolder);

                t.expect(grid.representedFolderType).toBeFalsy();

                t.waitForMs(TIMEOUT, function(){

                    t.expect(grid.representedFolderType).toBe('INBOX');

                    t.expect(messageView.isVisible()).toBe(true);
                    t.expect(gridMessageBox.isVisible()).toBe(false);
                    t.expect(grid.isVisible()).toBe(true);

                    var messageItem = grid.getStore().getAt(0);
                    t.expect(grid.getStore().getTotalCount()).not.toBe(0);
                    messageItem.set('seen', false);
                    t.expect(messageItem.get('seen')).toBe(false);
                    grid.getSelectionModel().select(messageItem);

                    t.waitForMs(TIMEOUT, function(){
                        t.expect(messageView.getViewModel().get('messageItem')).toBe(messageItem);

                        t.expect(mailFolder.get('unreadCount')).toBe(unreadCount - 1);

                        discardView(t);
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

        t.expect(messageView.isVisible()).toBe(false);
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


        discardView(t);
    });


    t.it("Selection after switching between folders in grid is still available", function(t) {


        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        var grid           = view.down('cn_mail-mailmessagegrid'),
            tree           = view.down('cn_mail-mailfoldertree'),
            gridMessageBox = view.down('#msgIndicatorBox'),
            messageView    = view.down('cn_mail-mailmessagereadermessageview');


        t.waitForMs(TIMEOUT, function(){

            t.waitForMs(TIMEOUT, function(){

                var mailFolder1 = getChildAt(view, 'dev_sys_conjoon_org', 0, 'INBOX', t),
                    mailFolder2 = getChildAt(view, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts', t);

                tree.getSelectionModel().select(mailFolder1);

                t.waitForMs(TIMEOUT, function(){

                    var messageItem = grid.getStore().getAt(0);

                    grid.getSelectionModel().select(messageItem);

                    t.expect(grid.getSelection()[0]).toBe(messageItem);

                    grid.view.getScrollable().scrollTo(0, 100000);

                    grid.getStore().getData().removeAtKey(1);
                    t.expect(grid.getStore().getData().map[1]).toBeUndefined();

                    t.expect(grid.getSelection()[0]).toBe(messageItem);

                    tree.getSelectionModel().select(mailFolder2);

                    t.waitForMs(TIMEOUT, function(){


                        t.expect(grid.getSelection()[0]).toBe(messageItem);

                        var messageItem2 = grid.getStore().getAt(0);

                        grid.getSelectionModel().select(messageItem2);

                        t.expect(grid.getSelection()[0]).toBe(messageItem2);

                        tree.getSelectionModel().select(mailFolder2);

                        t.waitForMs(TIMEOUT, function(){
                            t.expect(grid.getSelection()[0]).toBe(messageItem2);

                            discardView(t);
                        });


                    });

                });
            });
        });


    });



    t.it("should trigger onRowFlyMenuItemClick()", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        let grid = view.down('cn_mail-mailmessagegrid');

        t.isCalledNTimes('onRowFlyMenuItemClick', view.getController(), 1)
        grid.fireEvent('cn_comp-rowflymenu-itemclick');

        discardView(t);

    });


    t.it("should trigger onRowFlyMenuBeforeShow()", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        let grid = view.down('cn_mail-mailmessagegrid');

        t.isCalledNTimes('onRowFlyMenuBeforeShow', view.getController(), 1)
        grid.fireEvent('cn_comp-rowflymenu-beforemenushow', null, 1, {get : Ext.emptyFn});

        discardView(t);
    });


    t.it("reply all / edit draft / delete draft button is there", function(t) {


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


        t.waitForMs(TIMEOUT, function(){

            t.waitForMs(TIMEOUT, function(){

                var mailFolder = getChildAt(view, 'dev_sys_conjoon_org', 0, 'INBOX', t);
                tree.getSelectionModel().select(mailFolder);

                t.waitForMs(TIMEOUT, function(){

                    var messageItem = grid.getStore().getAt(0);
                    messageItem.set('draft', false);
                    grid.getSelectionModel().select(messageItem);

                    t.waitForMs(TIMEOUT, function(){

                        t.expect(messageView.down('#btn-replyall').isVisible()).toBe(true);
                        t.expect(messageView.down('#btn-editdraft').isVisible()).toBe(false);
                        t.expect(messageView.down('#btn-deletedraft').isVisible()).toBe(false);

                        messageItem = grid.getStore().getAt(1);
                        messageItem.set('draft', true);
                        grid.getSelectionModel().select(messageItem);

                        t.waitForMs(TIMEOUT, function(){
                            t.expect(messageView.down('#btn-replyall').isVisible()).toBe(false);
                            t.expect(messageView.down('#btn-editdraft').isVisible()).toBe(true);
                            t.expect(messageView.down('#btn-deletedraft').isVisible()).toBe(true);

                            discardView(t);
                        });

                    });

                });
            });
        });

    });


    t.it("showMessageDeleteConfirmDialog()", function(t) {

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
        t.waitForMs(TIMEOUT, function() {
            t.expect(obj.CALLED).toBe(1);
            t.expect(view.deleteMask).toBe(null);

            discardView(t);
        });

    });


    t.it("updateViewForCreatedDraft() - delegates to controller", function(t){

        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        t.isCalledOnce('updateViewForCreatedDraft', view.getController());

        view.updateViewForCreatedDraft(Ext.create(
            'conjoon.cn_mail.model.mail.message.MessageDraft', {id : 'foo'}
        ));

        discardView(t);
    });


    t.it("confirmDialogMask mixin", function(t){
        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        t.expect(view.mixins["conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog"]).toBeTruthy();
        t.expect(view.canCloseAfterDelete).toBe(false);

        discardView(t);
    });


    t.it("app-cn_mail#83 - MailAccountView should be shown when folder representing MailAccount is selected", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        let vm = view.getViewModel();

        t.waitForMs(TIMEOUT, function() {

            let mailAccountView = view.down('cn_mail-mailaccountview'),
                accountNode1    = function() {selectMailFolder(view, 0, 'dev_sys_conjoon_org', t);vm.notify();},
                accountNode2    = function() {selectMailFolder(view, 6, 'mail_account', t);vm.notify();},
                draftNode       = function() {selectMailFolder(view, getChildAt(view, 'dev_sys_conjoon_org', 3, 'INBOX.Drafts'));vm.notify();};

            t.expect(mailAccountView.isVisible()).toBe(false);

            accountNode1();

            t.expect(mailAccountView.isVisible()).toBe(true);


            draftNode();

            t.expect(mailAccountView.isVisible()).toBe(false);

            accountNode2();

            t.expect(mailAccountView.isVisible()).toBe(true);

            discardView(t);
        });

    });


    t.it("app-cn_mail#83 - showMailAccountIsBeingEditedNotice()", function(t) {


        view = Ext.create('conjoon.cn_mail.view.mail.inbox.InboxView', viewConfig);

        let iconCls        = view.getIconCls(),
            mailFolderTree = view.down('cn_mail-mailfoldertree'),
            REJECTED = 0;

        t.waitForMs(TIMEOUT, function() {

            view.down('cn_mail-mailaccountview').rejectPendingChanges = function() {
                REJECTED++;
            };

            let mailFolder1 = selectMailFolder(view, 0, 'dev_sys_conjoon_org'),
                mailFolder2 =  selectMailFolder(view, 1, 'mail_account');

            let mask = view.showMailAccountIsBeingEditedNotice(mailFolder1);

            t.isInstanceOf(mask, 'conjoon.cn_comp.component.MessageMask');
            t.expect(mask.isVisible()).toBe(true);

            let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom),
                noButton  = Ext.dom.Query.select("span[data-ref=noButton]", view.el.dom);

            t.expect(yesButton.length).toBe(1);
            t.expect(yesButton[0].parentNode.style.display).not.toBe('none');
            t.expect(noButton.length).toBe(1);
            t.expect(noButton[0].parentNode.style.display).not.toBe('none');

            t.expect(view.getIconCls()).not.toBe(iconCls);

            t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(mailFolder2);
            t.click(noButton[0], function() {
                t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(mailFolder2);

                view.showMailAccountIsBeingEditedNotice(mailFolder1);
                t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(1);

                yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);

                t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(mailFolder2);
                t.click(yesButton[0], function() {
                    t.expect(mailFolderTree.getSelectionModel().getSelection()[0]).toBe(mailFolder1);

                    t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);

                    t.expect(view.getIconCls()).toBe(iconCls);

                    t.expect(REJECTED).toBe(1);

                    discardView(t);
                });

            });

        });

    });


});});});