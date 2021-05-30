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
 * This is the view controller for {@link conjoon.cn_mail.view.mail.message.AttachmentList}.
 *
 * @abstract
 */
Ext.define("conjoon.cn_mail.view.mail.message.AbstractAttachmentListController", {

    extend: "Ext.app.ViewController",

    /**
     * @inheritdoc
     */
    init: function () {
        var me = this;
        me.mon(me.getView(), "itemclick", me.onAttachmentItemClick, me);
    },

    /**
     * Callback {@link conjoon.cn_mail.view.mail.message.AttachmentList} itemclick
     * event.
     *
     * @param view
     * @param record
     * @param item
     * @param index
     * @param e
     * @param eOpts
     *
     * @abstract
     */
    onAttachmentItemClick: Ext.emptyFn

});
