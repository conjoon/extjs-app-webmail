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

/**
 * This is the package controller of the app-cn_mail package to be used with
 * {@link conjoon.cn_comp.app.Application}.
 *
 * This controller will hook into the launch-process of {@link conjoon.cn_comp.app.Application#launch},
 * and expose it's navigation info along with the view's class name to the application.
 *
 *      @example
 *      Ext.define('conjoon.Application', {
 *
 *          extend : 'conjoon.cn_comp.app.Application',
 *
 *          mainView : 'Ext.Panel',
 *
 *          controllers : [
 *              'conjoon.cn_mail.controller.PackageController'
 *          ]
 *
 *      });
 *
 */
Ext.define('conjoon.cn_mail.controller.PackageController', {

    extend : 'conjoon.cn_core.app.PackageController',

    requires : [
        'conjoon.cn_mail.view.mail.MailDesktopView'
    ],

    routes : {

        // route for generic compser instances
        'cn_mail/message/compose/:id'  : {
            action     : 'onComposeMessageRoute',
            conditions : {
                ':id' : '([0-9]+$)'
            },
            before : 'onBeforePackageRoute'
        },

        // route for "mailto"
        'cn_mail/message/compose/mailto%3A:id'  : {
            action     : 'onComposeMailtoMessageRoute',
            conditions : {
                ':id' : '(.+)'
            },
            before : 'onBeforePackageRoute'
        },
        'cn_mail/message/edit/:id'     : 'onEditMessageRoute',
        'cn_mail/message/replyTo/:id'  : 'onReplyToRoute',
        'cn_mail/message/replyAll/:id' : 'onReplyAllRoute',
        'cn_mail/message/forward/:id'  : 'onForwardRoute',
        'cn_mail/message/read/:id'     : 'onReadMessageRoute',
        'cn_mail/home'                 : 'onHomeTabRoute'
    },

    control : {
        'cn_mail-maildesktopview > cn_mail-mailinboxview > cn_mail-mailfoldertree' : {
            selectionchange : 'onMailFolderTreeSelectionChange'
        },
        'cn_mail-maildesktopview > cn_mail-mailinboxview' : {
            activate   : 'onMailInboxViewActivate',
            deactivate : 'onMailInboxViewDeactivate'
        },
        'cn_mail-maildesktopview > cn_mail-mailinboxview > panel > container > cn_mail-mailmessagegrid' : {
            deselect                            : 'onMailMessageGridDeselect',
            select                              : 'onMailMessageGridSelect',
            'cn_mail-mailmessagegridbeforeload' : 'onMailMessageGridBeforeLoad',
            'cn_mail-mailmessagegridload'       : 'onMailMessageGridLoad'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavCreateMessage' : {
            click : 'onMessageComposeButtonClick'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavEditMessage' : {
            click : 'onMessageEditButtonClick'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavReplyTo' : {
            click : 'onReplyToButtonClick'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavReplyAll' : {
            click : 'onReplyAllButtonClick'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavForward' : {
            click : 'onForwardButtonClick'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavReadingPane > menu > menucheckitem' : {
            checkchange : 'onReadingPaneCheckChange'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavToggleList' : {
            toggle : 'onToggleListViewButtonClick'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavToggleFolder' : {
            toggle : 'onToggleFolderViewButtonClick'
        }
    },

    refs : [{
        ref      : 'mailDesktopView',
        selector : 'cn_mail-maildesktopview'
    }, {
        ref      : 'mailInboxView',
        selector : 'cn_mail-maildesktopview > cn_mail-mailinboxview'
    }, {
        ref      : 'mailMessageGrid',
        selector : 'cn_mail-maildesktopview > cn_mail-mailinboxview > panel > container > cn_mail-mailmessagegrid'
    }, {
        ref      : 'gridContainer',
        selector : 'cn_mail-maildesktopview > cn_mail-mailinboxview > panel > container > cn_mail-mailmessagegridcontainer'
    }, {
        ref      : 'mailFolderTree',
        selector : 'cn_mail-maildesktopview > cn_mail-mailinboxview > cn_mail-mailfoldertree'
    }, {
        ref      : 'navigationToolbar',
        selector : 'cn_treenavviewport-tbar'
    }, {
        ref      : 'toggleGridListButton',
        selector : 'cn_treenavviewport-tbar > #cn_mail-nodeNavToggleList'
    }, {
        ref      : 'toggleMailFolderButton',
        selector : 'cn_treenavviewport-tbar > #cn_mail-nodeNavToggleFolder'
    }, {
        ref      : 'switchReadingPaneButton',
        selector : 'cn_treenavviewport-tbar > #cn_mail-nodeNavReadingPane'
    }],


    /**
     * Callback for the InboxView's activate event. Toggles grid-/inbox-view
     * related buttons.
     *
     * @param {conjoon.cn_mail.view.mail.inbox.InboxView} view
     */
    onMailInboxViewActivate : function(view) {
        var me = this;

        if (!me.getMailMessageGrid().getStore().isLoading()) {
            me.getToggleGridListButton().setDisabled(false);
        }

        me.getSwitchReadingPaneButton().setDisabled(false);
        me.getToggleMailFolderButton().setDisabled(false);
    },


    /**
     * Callback for the InboxView's activate event. Toggles grid-/inbox-view
     * related buttons.
     *
     * @param {conjoon.cn_mail.view.mail.inbox.InboxView} view
     */
    onMailInboxViewDeactivate : function(inboxView) {
        var me = this;

        me.getToggleGridListButton().setDisabled(true);
        me.getSwitchReadingPaneButton().setDisabled(true);
        me.getToggleMailFolderButton().setDisabled(true);
    },


    /**
     * Callback for the MessageGrid's cn_mail-mailmessagegridbeforeload event.
     * Sets the button for toggling the row preview disabled.
     *
     * @param {conjoon.cn_mail.store.mail.message.MessageItemStore} store
     */
    onMailMessageGridBeforeLoad : function(store) {
        var me = this;

        me.getToggleGridListButton().setDisabled(true);
    },


    /**
     * Callback for the MessageGrid's cn_mail-mailmessagegridbeforeload event.
     * Sets the button for toggling the row preview enabled.
     *
     * @param {conjoon.cn_mail.store.mail.message.MessageItemStore} store
     */
    onMailMessageGridLoad : function(store) {
        var me = this;

        if (me.getMailDesktopView().getLayout().getActiveItem() !== me.getMailInboxView()) {
            return;
        }

        me.getToggleGridListButton().setDisabled(false);
    },


    /**
     * Callback for the toggle event of the cn_mail-nodeNavToggleFolder button.
     * Will show/hide the mailFolderTree.
     *
     * @param {Ext.Button} btn
     * @param {Boolean}    pressed
     */
    onToggleFolderViewButtonClick : function(btn, pressed) {

        var me         = this,
            mailFolder = me.getMailFolderTree();

        if (pressed) {
            mailFolder.show();
        } else {
            mailFolder.hide();
        }

    },


    /**
     * Callback for the toggle event of the cn_mail-nodeNavToggleList button.
     * Will delegate to {conjoon.cn_mail.view.mail.message.MessageGrid#toggleGridView}
     *
     * @param {Ext.Button} btn
     * @param {Boolean}    pressed
     */
    onToggleListViewButtonClick : function(btn, pressed) {

        var me          = this,
            messageGrid = me.getMailMessageGrid();

        messageGrid.enableRowPreview(!pressed);
    },


    /**
     * Callback for the reading-pane menu's menuitems' checkchange event.
     * Will delegate to {conjoon.cn_mail.view.mail.inbox.InboxView#toggleReadingPane}
     *
     * @param {Ext.menu.CheckItem} menuItem
     * @param {boolean}            checked
     */
    onReadingPaneCheckChange : function(menuItem, checked) {

        // exit if checked is set to false. There will
        // follow an immediate call to this method with the
        // menuItem that was set to true instead
        if (!checked) {
            return;
        }

        var me            = this,
            mailInboxView = me.getMailInboxView(),
            menuItem      = menuItem.getItemId();


        switch (menuItem) {
            case 'right':
                return mailInboxView.toggleReadingPane('right');
            case 'bottom':
                return mailInboxView.toggleReadingPane('bottom');
            case 'hide':
                return mailInboxView.toggleReadingPane();
        }

    },


    /**
     * Callback for the MailFolderTree#s selectionchange event.
     * Will make sure that the listeners for the MessageGrid are properly
     * registered based on the currently selected node.
     *
     * @param {conjoon.cn_mail.view.mail.folder.MailFolderTree} treeListe
     * @param {conjoon.cn_mail.model.mail.folder.MailFolder[]} records
     *
     * @throws if this method was not called with exactly one record in records,
     * or if the mailMessageGrid was not found
     */
    onMailFolderTreeSelectionChange : function(treeList, records) {

        var me          = this,
            messageGrid = me.getMailMessageGrid();

        if (records.length > 1) {
            Ext.raise({
                records : records,
                msg     : "unexpected multiple records"
            });
        }

        me.getSwitchReadingPaneButton().setDisabled(records.length <= 0);
    },


    /**
     * Callback for the MessageGrid's deselect event. Makes sure that editor-
     * related controls are disabled.
     *
     * @param selectionModel
     * @param record
     */
    onMailMessageGridDeselect : function(selectionModel, record) {

        var me     = this,
            navBar = me.getNavigationToolbar();

        navBar.down('#cn_mail-nodeNavEditMessage').setDisabled(true);
        navBar.down('#cn_mail-nodeNavReplyTo').setDisabled(true);
        navBar.down('#cn_mail-nodeNavReplyAll').setDisabled(true);
        navBar.down('#cn_mail-nodeNavForward').setDisabled(true);
   },


    /**
     * Callback for the MessageGrid's select event. Makes sure that editor-
     * related controls are enabled.
     *
     * @param selectionModel
     * @param record
     */
    onMailMessageGridSelect : function(selectionModel, record) {

        var me             = this,
            mailFolderTree = me.getMailFolderTree(),
            type           = mailFolderTree.getSelection()[0].get('type'),
            navBar         = me.getNavigationToolbar();

        switch (type) {
            case 'DRAFT':
                navBar.down('#cn_mail-nodeNavEditMessage').setDisabled(false);
                break;

            default:
                navBar.down('#cn_mail-nodeNavReplyTo').setDisabled(false);
                navBar.down('#cn_mail-nodeNavReplyAll').setDisabled(false);
                navBar.down('#cn_mail-nodeNavForward').setDisabled(false);
                break;
        }

    },


    /**
     * Action for cn_mail/home.
     */
    onHomeTabRoute : function() {
        var me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.setActiveTab(mailDesktopView.down('cn_mail-mailinboxview'));
    },


    /**
     * Action for the cn_mail/message/read/:id route.
     *
     * @param messageId
     *
     * @see {conjoon.cn_mail.view.mail.MailDesktopView#showMailMessageViewFor}
     */
    onReadMessageRoute : function(messageId) {
        var me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.showMailMessageViewFor(messageId);
    },


    /**
     * Action for cn_mail/message/compose.
     *
     * @param {String} id the id to be able to track this MessageEditor instance
     */
    onComposeMessageRoute : function(id) {
        this.showMailEditor(id, 'compose');
    },


    /**
     * Action for cn_mail/message/compose/mailto%3A[id].
     *
     * @param {String} id the id to be able to track this MessageEditor instance
     */
    onComposeMailtoMessageRoute : function(id) {
        id = 'mailto%3A'  + id;
        this.showMailEditor(id, 'compose');
    },


    /**
     * Callback for the node navigation's "create new message button".
     *
     * @param {Ext.Button} btn
     */
    onMessageComposeButtonClick : function(btn) {
        this.showMailEditor(Ext.id().split('-').pop(), 'compose');
    },


    /**
     * Action for cn_mail/message/edit.
     *
     * @param {String} id the id of the message to edit
     */
    onEditMessageRoute : function(id) {
        this.showMailEditor(id, 'edit');
    },


    /**
     * Action for cn_mail/message/replyTo.
     *
     * @param {String} id the id of the message to edit
     */
    onReplyToRoute : function(id) {
        this.showMailEditor(id, 'replyTo');
    },


    /**
     * Action for cn_mail/message/replyAll.
     *
     * @param {String} id the id of the message to edit
     */
    onReplyAllRoute : function(id) {
        this.showMailEditor(id, 'replyAll');
    },


    /**
     * Action for cn_mail/message/forward.
     *
     * @param {String} id the id of the message to edit
     */
    onForwardRoute : function(id) {
        this.showMailEditor(id, 'forward');
    },


    /**
     * Callback for the node navigation's "edit message button".
     *
     * @param {Ext.Button} btn
     */
    onMessageEditButtonClick : function(btn) {
        var me              = this,
            sel             = me.getMailMessageGrid().getSelection(),
            id              = sel[0].getId();

        me.showMailEditor(id, 'edit');
    },


    /**
     * Callback for the node navigation's "replyTo message button".
     *
     * @param {Ext.Button} btn
     */
    onReplyToButtonClick : function(btn) {
        var me              = this,
            sel             = me.getMailMessageGrid().getSelection(),
            id              = sel[0].getId();

        me.showMailEditor(id, 'replyTo');
    },


    /**
     * Callback for the node navigation's "replyAll message button".
     *
     * @param {Ext.Button} btn
     */
    onReplyAllButtonClick : function(btn) {
        var me              = this,
            sel             = me.getMailMessageGrid().getSelection(),
            id              = sel[0].getId();

        me.showMailEditor(id, 'replyAll');
    },


    /**
     * Callback for the node navigation's "forward message button".
     *
     * @param {Ext.Button} btn
     */
    onForwardButtonClick : function(btn) {
        var me              = this,
            sel             = me.getMailMessageGrid().getSelection(),
            id              = sel[0].getId();

        me.showMailEditor(id, 'forward');
    },


    /**
     * @inheritdoc
     */
    postLaunchHook : function() {
        return {
            navigation  : [{
                text    : 'Email',
                route   : 'cn_mail/home',
                view    : 'conjoon.cn_mail.view.mail.MailDesktopView',
                iconCls : 'x-fa fa-send',
                nodeNav : [{
                    xtype   : 'button',
                    iconCls : 'x-fa fa-plus',
                    tooltip : {
                        title : 'Create new message',
                        text  : 'Opens the editor for writing a new message.'
                    },
                    itemId : 'cn_mail-nodeNavCreateMessage'
                }, {
                    xtype : 'tbseparator'
                }, {
                    xtype    : 'button',
                    iconCls  : 'x-fa fa-mail-reply',
                    disabled : true,
                    itemId   : 'cn_mail-nodeNavReplyTo',
                    tooltip  : {
                        title : 'Reply to message',
                        text  : 'Opens the editor for replying to the sender of the selected message.'
                    }
                }, {
                    xtype    : 'button',
                    iconCls  :'x-fa fa-mail-reply-all',
                    itemId   : 'cn_mail-nodeNavReplyAll',
                    disabled : true,
                    tooltip  : {
                        title : 'Reply all to message',
                        text  : 'Opens the editor for replying to all recipients/senders of the selected message.'
                    }
                }, {
                    xtype    : 'button',
                    iconCls  : 'x-fa fa-mail-forward',
                    itemId   : 'cn_mail-nodeNavForward',
                    disabled : true,
                    tooltip  : {
                        title : 'Forward message',
                        text  : 'Opens the editor for forwarding the selected message.'
                    }
                }, {
                    xtype    : 'button',
                    iconCls  : 'x-fa fa-edit',
                    itemId   : 'cn_mail-nodeNavEditMessage',
                    disabled : true,
                    tooltip  : {
                        title : 'Edit message draft',
                        text  : 'Opens the editor for editing the selected message draft.'
                    }
                }, {
                    xtype : 'tbseparator'
                }, {
                    xtype        : 'button',
                    iconCls      : 'x-fa fa-folder-o',
                    disabled     : false,
                    cls          : 'toggleFolderViewBtn',
                    itemId       : 'cn_mail-nodeNavToggleFolder',
                    enableToggle : true,
                    pressed      : true,
                    tooltip      : {
                        title : 'Hide/ show Mail Folder',
                        text  : 'Hides or shows the Mail Folder tree.'
                    }
                }, {
                    xtype        : 'button',
                    iconCls      : 'x-fa fa-list',
                    disabled     : true,
                    cls          : 'toggleGridViewBtn',
                    itemId       : 'cn_mail-nodeNavToggleList',
                    enableToggle : true,
                    tooltip      : {
                        title : 'Switch message list view',
                        text  : 'Switches between the message grid\'s preview- and detail-view.'
                    }
                }, {
                    xtype    : 'button',
                    disabled : true,
                    iconCls  : 'x-fa fa-columns',
                    itemId   : 'cn_mail-nodeNavReadingPane',
                    tooltip  : {
                        title : 'Change reading pane position',
                        text  : 'Switch the position of the reading pane or hide it.'
                    },
                    menu : [{
                        iconCls : 'x-fa fa-toggle-right',
                        text    : 'Right',
                        itemId  : 'right',
                        checked : true,
                        xtype   : 'menucheckitem',
                        group   : 'cn_mail-nodeNavReadingPaneRGroup'
                    }, {
                        iconCls : 'x-fa fa-toggle-down',
                        text    : 'Bottom',
                        itemId  : 'bottom',
                        xtype   : 'menucheckitem',
                        group   : 'cn_mail-nodeNavReadingPaneRGroup'
                    }, {
                        iconCls : 'x-fa fa-close',
                        text    : 'Hidden',
                        itemId  : 'hide',
                        xtype   : 'menucheckitem',
                        group   : 'cn_mail-nodeNavReadingPaneRGroup'
                    }]
                }]
            }]
        };
    },


    /**
     * Returns the main view for this package and creates it if not already
     * available.
     *
     * @return {conjoon.cn_mail.view.mail.MailDesktopView}
     */
    getMainPackageView : function() {
        var me  = this,
            app = me.getApplication();

        /**
         * @type {conjoon.cn_mail.view.mail.MailDesktopView}
         */
        return app.activateViewForHash('cn_mail/home');
    },


    privates : {

        /**
         * Opens the MaiLEditor for the specified id and the specified action (
         * one of edit, compose, replyTo, replyAll, forward).
         *
         * @param {String} id
         * @param {String type
         *
         * @private
         */
        showMailEditor : function(id, type) {
            var me              = this,
                mailDesktopView = me.getMainPackageView();

            mailDesktopView.showMailEditor(id, type);
        }

    }

});