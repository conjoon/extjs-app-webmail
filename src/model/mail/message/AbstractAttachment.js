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
 * Base model for app-cn_mail representing an attachment.
 * The schema used by this model is {@link conjoon.cn_mail.data.mail.BaseSchema}
 *
 */
Ext.define('conjoon.cn_mail.model.mail.message.AbstractAttachment', {

    extend : 'conjoon.cn_mail.model.mail.message.MessageItemChildModel',

    requires : [
        'coon.core.data.field.FileSize',
        'coon.core.data.field.CompoundKeyField'
    ],

    fields : [{
        name : 'type',
        type : 'string'
    }, {
        name : 'text',
        type : 'string'
    }, {
        name    : 'size',
        type    : 'int',
        persist : false
    }, {
        /**
         * previewImgSrc property for base64 strings to preview attachments on the client
         * (FileReader).
         */
        name    : 'previewImgSrc',
        type    : 'string',
        persist : false
    }, {
        name    : 'downloadUrl',
        type    : 'string',
        persist : false
    }]



});