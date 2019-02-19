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