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
 * This is a mixin that allows for showing an info dialog when a MessageItem/Draft
 * could not be loaded.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.mixin.LoadingFailedDialog', {


    requires : [
        'coon.comp.component.MessageMask',
        'coon.comp.window.Toast'
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
     * @return {coon.comp.component.MessageMask}
     *
     * @see updateTargetHeader
     */
    showLoadingFailedDialog : function(allowClose = true) {

        const me = this;

        if (me.loadingFailedMask) {
            return me.loadingFailedMask;
        }

        let mask = Ext.create('coon.comp.component.MessageMask', {
            /**
             * @i18n
             */
            title    : "Loading failed",
            message  : "I'm sorry, I could not load the message.",
            buttons  : allowClose !== false
                       ? coon.comp.component.MessageMask.OK
                       : undefined,
            target   : me,
            callback : allowClose !== false ? function() {me.close();} : undefined,
            scope    : me,
            icon     : coon.comp.component.MessageMask.FAILURE,
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
        me.setIconCls("far fa-frown");
    },


    /**
     * Shows a Toast with an error message.
     * @private
     */
    showToast : function() {
        return coon.Toast.fail(
            /**
             * @i18n
             */
            "The message could not be loaded."
        );
    }

});