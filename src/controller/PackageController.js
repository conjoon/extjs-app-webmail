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

       'cn_mail/message/read/:id' : 'onReadMessageRoute',
       'cn_mail/home'             : 'onHomeTabRoute'
    },

    control : {
        'cn_treenavviewport-tbar > #cn_mail-nodeNavCreateMessage' : {
            click : 'onMessageComposeButtonClick'
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

        id = me.prepareIdForComposeRoute(id);

        mailDesktopView.showMailEditor(id);
    },


    /**
     * Action for cn_mail/message/compose/mailto%3A[id].
     *
     * @param {String} id the id to be able to track this MessageEditor instance
     */
    onComposeMailtoMessageRoute : function(id) {

        var me              = this,
            mailDesktopView = me.getMainPackageView();

        id = me.prepareIdForComposeRoute(id, true);

        mailDesktopView.showMailEditor(id);
    },

    /**
     * Callback for the node navigation's "create new message button"
     * Will redirect to cn_mail/message/compose/[autoId], triggering the routing.
     *
     * @param {Ext.Button} btn
     */
    onMessageComposeButtonClick : function(btn) {
        var me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.showMailEditor(Ext.id().split('-').pop());
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
    },


    /**
     * Parses the specified string. Returns an integer if the string contained
     * only digits, or the string itself with a trailing "mailto3%A".
     *
     * @param {String} id
     *
     * @returns {Number/String/*}
     *
     * @private
     */
    prepareIdForComposeRoute : function(id, isMailto) {

        if (Ext.isString(id)) {
            if (isMailto !== true) {
                if ((/^\d+$/).test(id)) {
                    id = parseInt(id, 10);
                } else {
                    Ext.raise({
                        id  : id,
                        msg : "Unexpected value for \"id\""
                    })
                }
            } else {
                id = 'mailto%3A' + id;
            }
        }

        return id;
    }

});