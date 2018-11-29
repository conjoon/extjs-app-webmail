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
 * This is a mixin that allows for showing an info dialog when a MessageItem/Draft
 * could not be loaded.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.mixin.LoadingFailedDialog', {


    requires : [
        'conjoon.cn_comp.component.MessageMask',
        'conjoon.cn_comp.window.Toast'
    ],


    /**
     * @private
     */
    loadingFailedMask : null,


    /**
     * Shows a message dialog masking this view.
     * Will void if there is currently already a loadingFailedMask  shown.
     * Will set the title and iconCls accordingly and render a Toast-window
     * with an error message,
     *
     * @param {Ext.data.operation.Read} operation
     * @param {Function} cb
     * @param {Object} scope
     * @param {Boolean} allowClose whether or not the OK button for closing this
     * mask should be rendered
     *
     * @return {conjoon.cn_comp.component.MessageMask}
     *
     * @see updateTargetHeader
     */
    showLoadingFailedDialog : function(allowClose = true) {

        const me = this;

        if (me.loadingFailedMask) {
            return me.loadingFailedMask;
        }

        let mask = Ext.create('conjoon.cn_comp.component.MessageMask', {
            /**
             * @i18n
             */
            title    : "Loading failed",
            message  : "I'm sorry, I could not load the message.",
            buttons  : allowClose !== false
                       ? conjoon.cn_comp.component.MessageMask.OK
                       : undefined,
            target   : me,
            callback : allowClose !== false ? function() {me.close();} : undefined,
            scope    : me,
            icon     : conjoon.cn_comp.component.MessageMask.FAILURE,
            dialogStyle : false,
        });

        me.mon(mask, 'destroy', function() {this.loadingFailedMask = null}, me);
        mask.show();

        me.loadingFailedMask = mask;

        me.updateTargetHeader();
        me.showToast();

        return mask;
    },


    /**
     * Updated the title and the iconCls of the object requesting the mixin.
     *
     * @private
     */
    updateTargetHeader : function() {
        const me = this;

        /**
         * @i18n
         */
        me.setTitle("oops.");
        me.setIconCls("fa fa-frown-o");
    },


    /**
     * Shows a Toast with an error message.
     * @private
     */
    showToast : function() {
        return conjoon.Toast.fail(
            /**
             * @i18n
             */
            "The message could not be loaded."
        );
    }

});