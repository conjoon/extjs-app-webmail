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
       'cn_mail/message/edit/:id' : 'onEditMessageRoute',
       'cn_mail/message/read/:id' : 'onReadMessageRoute',
       'cn_mail/home'             : 'onHomeTabRoute'
    },

    control : {
        'cn_mail-maildesktopview > cn_mail-mailinboxview > cn_mail-mailfoldertree' : {
            selectionchange : 'onMailFolderTreeSelectionChange'
        },
        'cn_mail-maildesktopview > cn_mail-mailinboxview > panel > cn_mail-mailmessagegrid' : {
            deselect : 'onMailMessageGridDeselect',
            select   : 'onMailMessageGridSelect'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavCreateMessage' : {
            click : 'onMessageComposeButtonClick'
        },
        'cn_treenavviewport-tbar > #cn_mail-nodeNavEditMessage' : {
            click : 'onMessageEditButtonClick'
        }
    },

    refs : [{
        ref      : 'mailMessageGrid',
        selector : 'cn_mail-maildesktopview > cn_mail-mailinboxview > panel > cn_mail-mailmessagegrid'
    }, {
        ref      : 'mailFolderTree',
        selector : 'cn_mail-maildesktopview > cn_mail-mailinboxview > cn_mail-mailfoldertree'
    }, {
        ref      : 'navigationToolbar',
        selector : 'cn_treenavviewport-tbar'
    }],


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

        if (records.length !== 1) {
            Ext.raise({
                records : records,
                msg     : "unexpected multiple records"
            });
        }

        messageGrid.getSelectionModel().deselectAll();
    },


    /**
     * Callback for the MessageGrid's deselect event. Makes sure that editor-
     * related controls are disabled.
     *
     * @param selectionModel
     * @param record
     */
    onMailMessageGridDeselect : function(selectionModel, record) {

        var me = this;

        me.getNavigationToolbar().down('#cn_mail-nodeNavEditMessage').setDisabled(true);
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
            selectedNodes  = mailFolderTree.getSelection();

        if (selectedNodes[0].get('type') === 'DRAFT') {
            me.getNavigationToolbar().down('#cn_mail-nodeNavEditMessage').setDisabled(false);
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

        var me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.showMailEditor(id, 'compose');
    },


    /**
     * Action for cn_mail/message/compose/mailto%3A[id].
     *
     * @param {String} id the id to be able to track this MessageEditor instance
     */
    onComposeMailtoMessageRoute : function(id) {

        var me              = this,
            mailDesktopView = me.getMainPackageView();

        id = 'mailto%3A'  + id;

        mailDesktopView.showMailEditor(id, 'compose');
    },


    /**
     * Callback for the node navigation's "create new message button".
     *
     * @param {Ext.Button} btn
     */
    onMessageComposeButtonClick : function(btn) {
        var me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.showMailEditor(
            Ext.id().split('-').pop(),
            'compose'
        );
    },


    /**
     * Action for cn_mail/message/edit.
     *
     * @param {String} id the id of the message to edit
     */
    onEditMessageRoute : function(id) {

        var me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.showMailEditor(id, 'edit');
    },


    /**
     * Callback for the node navigation's "edit message button".
     *
     * @param {Ext.Button} btn
     */
    onMessageEditButtonClick : function(btn) {
        var me              = this,
            mailDesktopView = me.getMainPackageView(),
            sel             = me.getMailMessageGrid().getSelection(),
            id              = sel[0].getId();

        mailDesktopView.showMailEditor(id, 'edit');
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
                    tooltip  : {
                        title : 'Reply to message',
                        text  : 'Opens the editor for replying to the sender of the selected message.'
                    }
                }, {
                    xtype    : 'button',
                    iconCls  :'x-fa fa-mail-reply-all',
                    disabled : true,
                    tooltip  : {
                        title : 'Reply all to message',
                        text  : 'Opens the editor for replying to all recipients/senders of the selected message.'
                    }
                }, {
                    xtype    : 'button',
                    iconCls  : 'x-fa fa-mail-forward',
                    disabled : true,
                    tooltip  : {
                        title : 'Forward message',
                        text  : 'Opens the editor for forwarding the selected message.'
                    }
                }, {
                    xtype : 'tbseparator'
                }, {
                    xtype    : 'button',
                    iconCls  : 'x-fa fa-edit',
                    itemId   : 'cn_mail-nodeNavEditMessage',
                    disabled : true,
                    tooltip  : {
                        title : 'Edit message draft',
                        text  : 'Opens the editor for editing the selected message draft.'
                    }
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
    }

});