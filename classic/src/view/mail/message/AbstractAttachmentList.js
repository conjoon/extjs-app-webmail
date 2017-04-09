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
Ext.define('conjoon.cn_mail.view.mail.message.AbstractAttachmentList', {

    extend : 'Ext.view.View',

    requires : [
        'conjoon.cn_mail.model.mail.message.AbstractAttachment',
        'conjoon.cn_core.util.Mime'
    ],

    cls : 'cn_mail-attachment-list',

    overItemCls : 'over',

    selectedItemCls : 'selected',

    itemSelector : 'div.attachment',

    tpl: [
        '<tpl for=".">',
           '<div target="_blank" class="attachment {[this.getPreviewCssClass(values.type, values.previewImgSrc)]}" ',
               'style="background-image:url({previewImgSrc})">',
             '<div class="imagecont">',
               '<span class="mimetype fa {[this.getMimeTypeIcon(values.type)]}"></span>',
             '</div>',
             '<div class="actioncont">',
               '<div class="attachmenticon fa fa-download"></div>',
               '<div class="linkcont">',
                  '<div class="filename">{text}</div>',
                  '<div class="filesize">{size}</div>',
                  '<div class="attachmentaction">',
                   '<tpl if="this.displayButtonType(\'DOWNLOAD\')">',
                        '<a role="link" href="{downloadUrl}" class="downloadbutton fa fa-arrow-down" download="{text}"></a>',
                    '</tpl>',
                    '<tpl if="this.displayButtonType(\'REMOVE\')">',
                        '<a class="removebutton fa fa-close"></a>',
                    '</tpl>',
                  '</div>',
                '</div>',
              '</div>',
           '</div>',
        '</tpl>'
    ],


    /**
     * @inheritdoc
     *
     * Makes sure template related emthods are bound to the tpl used by this
     * view.
     */
    initComponent : function() {

        var me = this;

        me.tpl = me.tpl.concat([{
            displayButtonType  : me.displayButtonType.bind(me),
            getPreviewCssClass : me.getPreviewCssClass.bind(me),
            getMimeTypeIcon    : me.getMimeTypeIcon.bind(me)
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
    getPreviewCssClass : function(type, src) {
        return conjoon.cn_core.util.Mime.isImage(type) && src ? "preview" : ""
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
    displayButtonType : Ext.emptyFn,


    /**
     * Returns a fa icon for the specified mimetype. Returns a default icon
     * if the mime type could not be matched. This method is guaranteed
     * to always return a valid string, regardless of the specified argument.
     *
     * @param type
     * @returns {string}
     */
    getMimeTypeIcon : function(type) {

        type = type + '';

        switch(type.toLowerCase()) {
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/gif':
            case 'image/png':
            case 'image':
                return 'fa-file-image-o';

            case 'audio':
                return 'fa-file-audio-o';

            case 'video':
                return 'fa-file-video-o';

            case 'application/pdf':
                return 'fa-file-pdf-o';

            case 'text/plain':
                return  'fa-file-text-o';

            case 'text/html':
            case 'application/json':
                return 'fa-file-code-o';

            case 'application/gzip':
            case 'application/zip':
            case 'application/x-rar-compressed':
                return 'fa-file-archive-o';

        }

        return 'fa-file-o';
    }


});