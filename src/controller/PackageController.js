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
        'cn_mail/message/compose'  : 'onComposeMessageRoute',
        'cn_mail/message/read/:id' : 'onReadMessageRoute',
        'cn_mail/home'             : 'onHomeTabRoute'
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
     * Action for the cn_mail/message/read/:idroute.
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
     * Action for cn_mail/message/compose
     */
    onComposeMessageRoute : function() {
        var me              = this,
            mailDesktopView = me.getMainPackageView();

        mailDesktopView.showMailEditor();
    },


    /**
     * @inheritdoc
     */
    postLaunchHook : function() {
        return {
            navigation : [{
                text    : 'Email',
                route   : 'cn_mail/home',
                view    : 'conjoon.cn_mail.view.mail.MailDesktopView',
                iconCls : 'x-fa fa-send'
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
        var me       = this,
            app      = me.getApplication(),
            /**
             * guaranteed to be of type conjoon.cn_comp.container.Viewport
             * which allows for calling addViewForHash
             */
            appView = app.getMainView();

        /**
         * @type {conjoon.cn_mail.view.mail.MailDesktopView}
         */
        return appView.addViewForHash('cn_mail/home');
    }





});
