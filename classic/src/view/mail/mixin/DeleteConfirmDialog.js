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
 * This is a mixin that allows for showing a confirm dialog when a MessageItem/Draft
 * should get deleted and the user should confirm the action or cancel it.
 *
 *
 */
Ext.define('conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog', {


    requires : [
        'coon.comp.component.MessageMask'
    ],


    /**
     * @private
     */
    deleteMask : null,

    /**
     * @cfg {Boolean} canCloseAfterDelete true so that an immediate call to
     * closeAfterDelete from the API can close the implementing view safely.
     */
    canCloseAfterDelete : true,


    /**
     * Shows a confirm dialog masking this view, requesting the user interaction
     * regarding deleting of a message.
     * Will void if there is currently already a mask for confirming deletion of
     * a message shown.
     *
     * @param {conjoon.cn_mail.model.mail.message.AbstractMessageItem} messageItem
     * @param {Function} cb
     * @param {Object} scope
     *
     * @return {coon.comp.component.MessageMask}
     */
    showMessageDeleteConfirmDialog : function(messageItem, cb, scope) {

        const me = this;

        if (me.deleteMask) {
            return me.deleteMask;
        }

        let mask = Ext.create('coon.comp.component.MessageMask', {
            title    : "Delete Message",
            message  : "Are you sure you want to delete the message permanently?",
            target   : me,
            buttons  : coon.comp.component.MessageMask.YESNO,
            icon     : coon.comp.component.MessageMask.QUESTION,
            callback : cb,
            scope    : scope
        });

        me.mon(mask, 'destroy', function() {this.deleteMask = null}, me);
        mask.show();

        me.deleteMask = mask;

        return mask;
    },


    /**
     * Closes the view that uses this mixin, if and only if #canCloseAfterDelete
     * is set to true.
     *
     */
    closeAfterDelete : function() {

        const me = this;

        if (!me.canCloseAfterDelete) {
            return false;
        }

        if(me.deleteMask) {
            me.deleteMask.close();
        }
        me.close();

        return true;
    }

});