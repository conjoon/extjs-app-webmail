/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
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