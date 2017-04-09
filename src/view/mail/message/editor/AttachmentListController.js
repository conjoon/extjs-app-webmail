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
 * This is the view controller for
 * {@link conjoon.cn_mail.view.mail.message.editor.AttachmentList}.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.AttachmentListController', {

    extend : 'conjoon.cn_mail.view.mail.message.AbstractAttachmentListController',

    requires : [
        'conjoon.cn_core.util.Mime',
        'conjoon.cn_mail.model.mail.message.DraftAttachment'
    ],

    alias : 'controller.cn_mail-mailmessageeditorattachmentlistcontroller',

    control : {
        'cn_mail-mailmessageeditorattachmentlist' : {
            'beforedestroy' : 'onAttachmentListBeforeDestroy'
        }
    },


    /**
     * Adds an attachment to this controller's view. The property
     * cn_id will be set to any created {FileReader} for mapping records with
     * loaded files, if any.
     *
     * @param {File}
     *
     * @return {conjoon.cn_mail.model.mail.message.DraftAttachment} the
     *          attachment that was generated
     *
     * @see #onFileReaderLoad
     *
     * @throws if file is not a native File-Object; if the model defined
     * for the store is not a
     * {@link conjoon.cn_mail.model.mail.message.DraftAttachment}.
     */
    addAttachment : function(file) {

        var me             = this,
            attachmentList = me.getView(),
            store          = attachmentList.getStore(),
            Model          = store.getModel().getName(),
            isDraft        = Model === 'conjoon.cn_mail.model.mail.message.DraftAttachment',
            file,
            reader,
            rec;

        if (!(file instanceof File)) {
            Ext.raise({
                source : Ext.getClassName(this),
                msg    : "argument for addAttachment must be a native File Object"
            })
        }

        if (!isDraft) {
            Ext.raise({
                source : Ext.getClassName(this),
                msg    : "The store's model must be of type DraftAttachment."
            })
        }

        rec = Ext.create(Model, {
            text        : file.name,
            size        : file.size,
            type        : file.type,
            downloadUrl : window.URL.createObjectURL(file),
            file        : file
        });

        store.add(rec);

        if (conjoon.cn_core.util.Mime.isImage(file.type))  {
            reader = new FileReader();

            reader.addEventListener(
                'load',
                me.onFileReaderLoad.bind(this),
                {once : true}
            );

            reader.cn_id = rec.get('id');

            reader.readAsDataURL(file);
        }

        return rec;
    },

    /**
     * Callback for a FileReader's load event to preview an image if possible
     * in the attachmentlist.
     *
     * @param {Event} evt
     */
    onFileReaderLoad : function(evt) {

        var me             = this,
            attachmentList = me.getView(),
            store          = attachmentList.getStore(),
            id             = evt.target.cn_id,
            rec;

        rec = store.findExact('id', id);

        if (rec === -1) {
            return;
        }

        rec = store.getAt(rec);

        rec.set('previewImgSrc', evt.target.result);

        delete evt;
    },


    /**
     * Callback {@link conjoon.cn_mail.view.mail.message.editor.AttachmentList} itemclick
     * event. Considers the click target and delegates appropriate event firing
     * to the AttachmentList.
     * The download of files will not be handled by this listener. Instead,
     * the template of an attachment in the view class should be configured as
     * an <a> tag with the "download" attribute set and the href to the local/remote
     * location of the file.
     *
     * @param view
     * @param record
     * @param item
     * @param index
     * @param e
     * @param eOpts
     */
    onAttachmentItemClick : function(view, record, item, index, e, eOpts) {
        if (e.target.className.indexOf('removebutton') !== -1) {
            view.getStore().remove(record);
        }
    },


    /**
     * Makes sure all associations to FileObjects are cleared when this component's
     * destroyed.
     *
     * @see #destroyFileAssociations
     */
    onAttachmentListBeforeDestroy : function(store) {

        var me      = this,
            store   = me.getView().getStore(),
            records = store ? store.getRange() : [];

        me.destroyFileAssociations(records);
    },

    privates : {

        /**
         * Revokes Object Urls for teh specified records.
         * @param records
         */
        destroyFileAssociations : function(records) {

            var me = this;

            for (var i = 0, len = records.length; i < len; i++) {
                window.URL.revokeObjectURL(records[i].get('downloadUrl'));
            }
        }
    }

});
