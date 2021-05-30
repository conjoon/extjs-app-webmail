/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * This is the view controller for
 * {@link conjoon.cn_mail.view.mail.message.editor.AttachmentList}.
 *
 */
Ext.define("conjoon.cn_mail.view.mail.message.editor.AttachmentListController", {

    extend: "conjoon.cn_mail.view.mail.message.AbstractAttachmentListController",

    requires: [
        "coon.core.util.Mime",
        "conjoon.cn_mail.model.mail.message.DraftAttachment"
    ],

    alias: "controller.cn_mail-mailmessageeditorattachmentlistcontroller",

    control: {
        "cn_mail-mailmessageeditorattachmentlist": {
            "beforedestroy": "onAttachmentListBeforeDestroy"
        }
    },


    /**
     * Adds an attachment to this controller's view. The property
     * cn_id will be set to any created {FileReader} for mapping records with
     * loaded files, if any.
     *
     * @param {File}
     *
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
    addAttachment: function (file) {

        var me             = this,
            attachmentList = me.getView(),
            store          = attachmentList.getStore(),
            Model          = store.getModel().getName(),
            isDraft        = Model === "conjoon.cn_mail.model.mail.message.DraftAttachment",
            reader, rec;

        if (!(file instanceof File)) {
            Ext.raise({
                source: Ext.getClassName(this),
                msg: "argument for addAttachment must be a native File Object"
            });
        }

        if (!isDraft) {
            Ext.raise({
                source: Ext.getClassName(this),
                msg: "The store's model must be of type DraftAttachment."
            });
        }

        rec = Ext.create(Model, {
            text: file.name,
            size: file.size,
            type: file.type,
            downloadUrl: window.URL.createObjectURL(file),
            file: file
        });

        store.add(rec);

        if (coon.core.util.Mime.isImage(file.type))  {
            reader = new FileReader();

            reader.addEventListener(
                "load",
                me.onFileReaderLoad.bind(this),
                {once: true}
            );

            reader.cn_id = rec.getId();

            reader.readAsDataURL(file);

        }

        return rec;
    },

    /**
     * Callback for a FileReader's load event to preview an image if possible
     * in the attachmentlist.
     *
     * @param {Event} evt
     *
     * @return null or the record for which the data was loaded
     */
    onFileReaderLoad: function (evt) {

        var me             = this,
            attachmentList = me.getView(),
            store          = attachmentList.getStore(),
            id             = evt.target.cn_id,
            rec;

        rec = store.findExact("localId", id);

        if (rec === -1) {
            return;
        }

        rec = store.getAt(rec);

        rec.set("previewImgSrc", evt.target.result);

        evt = null;

        return rec;
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
    onAttachmentItemClick: function (view, record, item, index, e, eOpts) {
        if (e.target.className.indexOf("removebutton") !== -1) {
            view.getStore().remove(record);
        }
    },


    /**
     * Makes sure all associations to FileObjects are cleared when this component's
     * destroyed.
     *
     * @see #destroyFileAssociations
     */
    onAttachmentListBeforeDestroy: function () {

        var me    = this,
            store  = me.getView().getStore(),
            records = store && !store.destroyed ? store.getRange() : [];

        me.destroyFileAssociations(records);
    },

    privates: {

        /**
         * Revokes Object Urls for teh specified records.
         * @param records
         */
        destroyFileAssociations: function (records) {

            for (var i = 0, len = records.length; i < len; i++) {
                window.URL.revokeObjectURL(records[i].get("downloadUrl"));
            }
        }
    }

});
