/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * The default AttachmentList, giving a visual representation of all attachments
 * which can be found in an Email Message.
 * By default, the attachment list is not configured with a store. Implementing
 * views should take care of proper store setting, e.g. by binding this view's
 * store to the attachments store of a MessageItem.
 *
 * Take note that the type of attachments handled by this view can either be
 * {@link conjoon.cn_mail.model.mail.message.DraftAttachment} or
 * {@link conjoon.cn_mail.model.mail.message.ItemAttachment}. The type of
 * attachment created by the {@see #addAttachment} method depends on the type
 * of the model the associated store is using.
 *
 * @abstract
 */
Ext.define("conjoon.cn_mail.view.mail.message.AbstractAttachmentList", {

    extend: "Ext.view.View",

    requires: [
        "conjoon.cn_mail.model.mail.message.AbstractAttachment",
        "coon.core.util.Mime"
    ],

    cls: "cn_mail-attachment-list",

    overItemCls: "over",

    selectedItemCls: "selected",

    itemSelector: "div.attachment",

    tpl: [
        "<tpl for=\".\">",
        "<div target=\"_blank\" class=\"attachment {[this.getPreviewCssClass(values.type, values.previewImgSrc)]}\" ",
        "style=\"background-image:url({previewImgSrc})\">",
        "<div class=\"imagecont\">",
        "<span class=\"mimetype far {[this.getMimeTypeIcon(values.type)]}\"></span>",
        "</div>",
        "<div class=\"actioncont\">",
        "<div class=\"attachmenticon fa fa-download\"></div>",
        "<div class=\"linkcont\">",
        "<div class=\"filename\">{text}</div>",
        "<div class=\"filesize\">{[Ext.util.Format.fileSize(values.size)]}</div>",
        "<div class=\"attachmentaction\">",
        "<tpl if=\"this.displayButtonType('DOWNLOAD')\">",
        "<a role=\"link\" href=\"{downloadUrl}\" class=\"downloadbutton fa fa-arrow-down\" download=\"{text}\"></a>",
        "</tpl>",
        "<tpl if=\"this.displayButtonType('REMOVE')\">",
        "<a class=\"removebutton fa fa-times\"></a>",
        "</tpl>",
        "</div>",
        "</div>",
        "</div>",
        "</div>",
        "</tpl>"
    ],


    /**
     * @inheritdoc
     *
     * Makes sure template related emthods are bound to the tpl used by this
     * view.
     */
    initComponent: function () {

        var me = this;

        me.tpl = me.tpl.concat([{
            displayButtonType: me.displayButtonType.bind(me),
            getPreviewCssClass: me.getPreviewCssClass.bind(me),
            getMimeTypeIcon: me.getMimeTypeIcon.bind(me)
        }]);

        me.callParent(arguments);
    },


    /**
     * Template related methode. Returns the css class "preview" for the
     * attachment template if the type of the attachment matches "image" and
     * the src argument was not falsy, otherwise an empty string.
     *
     * @param type
     * @param src
     * @returns {string}
     */
    getPreviewCssClass: function (type, src) {
        return coon.core.util.Mime.isImage(type) && src ? "preview" : "";
    },


    /**
     * Template related methode. Checks whether DOWNLOAD and/or REMOVE button
     * should be displayed .
     * Returns true if the specified button type should be displayed,
     * otherwise false.
     *
     * @param {String} type
     *
     * @returns {boolean}
     *
     * @abstract
     */
    displayButtonType: Ext.emptyFn,


    /**
     * Returns a fa icon for the specified mimetype. Returns a default icon
     * if the mime type could not be matched. This method is guaranteed
     * to always return a valid string, regardless of the specified argument.
     *
     * @param type
     * @returns {string}
     */
    getMimeTypeIcon: function (type) {

        type = type + "";

        switch(type.toLowerCase()) {
        case "image/jpeg":
        case "image/jpg":
        case "image/gif":
        case "image/png":
        case "image":
            return "fa-file-image";

        case "audio":
            return "fa-file-audio";

        case "video":
            return "fa-file-video";

        case "application/pdf":
            return "fa-file-pdf";

        case "text/plain":
            return "fa-file-alt";

        case "text/html":
        case "application/json":
            return "fa-file-code";

        case "application/gzip":
        case "application/zip":
        case "application/x-rar-compressed":
        case "application/x-zip-compressed":
            return "fa-file-archive";

        }

        return "fa-file";
    }


});
