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
 * The default AttachmentList implementation for to be used with a
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.AttachmentList', {

    extend : 'conjoon.cn_mail.view.mail.message.AbstractAttachmentList',

    requires : [
        'conjoon.cn_mail.model.mail.message.AbstractAttachment',
        'conjoon.cn_mail.view.mail.message.editor.AttachmentListController',
        'coon.core.util.Mime'
    ],

    alias : 'widget.cn_mail-mailmessageeditorattachmentlist',

    controller : 'cn_mail-mailmessageeditorattachmentlistcontroller',

    config : {
        /**
         * @cfg {String="CREATE"} [editMode=null]
         * The editMode for this attachmentList. Either shows or hides additional
         * controls. Can be CREATE or EDIT which tells that this attachment
         * list provides a view on existing attachments of a message.
         * This property cannot be changed during runtime.
         */
        editMode : undefined
    },


    /**
     * Sets the editMode property of this instance initially. Cannot be changed
     * during runtime.
     *
     * @param value
     *
     * @throws exception if the editMode is changed during runtime, or if the
     * editMode equals to anything but EDIT or CREATE.
     */
    applyEditMode : function(value) {
        var me    = this,
            value = value === undefined ? 'CREATE' : value;

        if (Ext.Array.indexOf(['CREATE', 'EDIT'], value) === -1) {
            Ext.raise({
                source : Ext.getClassName(me),
                msg    : "editMode must be one of EDIT or CREATE"
            });
            return;
        }

        if (me.getEditMode() === undefined) {
            return value;
        } else {
            Ext.raise({
                source : Ext.getClassName(me),
                msg    : "Property editMode cannot be changed during runtime"
            });
        }
    },


    /**
     * Adds an attachment to the view#s store and renders it's template
     * accordingly.
     * Depending on the store's model the type of teh model retruned is either
     * {@link conjoon.cn_mail.model.mail.message.DraftAttachment} or
     * {@link conjoon.cn_mail.model.mail.message.ItemAttachment}.
     *
     * @param {File} file
     *
     * @return {conjoon.cn_mail.model.mail.message.AbstractAttachment}
     *
     * @see {conjoon.cn_mail.view.mail.message.AttachmentListController#addAttachment}
     *
     * @throws if file is not a native File-Object
     */
    addAttachment : function(file) {
        var me = this;

        return this.getController().addAttachment(file);
    },


    /**
     * @inheritdoc
     */
    displayButtonType : function(type) {
        return true;
    }

});