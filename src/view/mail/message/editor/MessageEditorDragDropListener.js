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
 * Private listener class to be used with
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController}.
 * Makes sure the d&d events for the controller's view's embedded attachmentList
 * are registered.
 *
 * Note:
 * =====
 * init() needs to be called before the MessageEditor is rendered.
 *
 * @private
 */
Ext.define("conjoon.cn_mail.view.mail.message.editor.MessageEditorDragDropListener", {

    /**
     * Helper to indicate the number of times the attachmentlistWrap was entered/
     * leaved during the drag/drop process to properly add/remove styles.
     * @type {Integer=0} dragEnterCount
     * @private
     */
    dragEnterCount: 0,

    /**
     * @cfg {conjoon.cn_mail.view.mail.message.editor.MessageEditor} view
     */
    view: null,


    /**
     * Constructor.
     *
     * @param {Object} conf
     */
    constructor: function (conf) {

        var me = this;

        Ext.apply(me, conf);
    },


    /**
     * Makes sure #installDragDropListeners is called as soon as the controller's
     * editor was rendered.
     */
    init: function () {
        var me   = this,
            view = me.view;

        view.on("afterrender", me.installDragDropListeners, me, {single: true});
    },


    /**
     * Helper method to register the drag & drop listeners to the embedded
     * container wrapping the AttachmentList.
     *
     * @private
     */
    installDragDropListeners: function () {
        var me             = this,
            view           = me.view,
            attachmentWrap = view.down("#attachmentListWrap").el;

        view.mon(
            attachmentWrap, "dragenter", me.onAttachmentListWrapDragEnter, me);
        view.mon(
            attachmentWrap, "dragover",  me.onAttachmentListWrapDragOver, me);
        view.mon(
            attachmentWrap, "dragleave", me.onAttachmentListWrapDragLeave, me);
        view.mon(
            attachmentWrap, "dragend",   me.onAttachmentListWrapDragEnd,   me);
        view.mon(
            attachmentWrap, "drop",      me.onAttachmentListWrapDrop,      me);
    },


    /**
     * Helper function to add/remove the "hover" css class of the
     * attachmentListWrap.
     *
     * @param {Boolean} isHover true to add the css class, false to remove it.
     * @param {Boolean} forceReset true to reset #dragEnterCount to 0
     */
    registerAttachmentListWrapEnter: function (isHover, forceReset) {
        var me   = this,
            view = me.view;

        if (isHover) {
            me.dragEnterCount++;
        } else {
            me.dragEnterCount--;
        }

        me.dragEnterCount = me.dragEnterCount < 0 || forceReset === true
            ? 0
            : me.dragEnterCount;

        view.down("#attachmentListWrap").el[
            me.dragEnterCount ? "addCls" : "removeCls"
        ]("hover");
    },


    /**
     * Callback for the dragover event of the attachmentListWrap.
     * Makes sure the preventDefault is being called for the event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragOver: function (e) {
        e.preventDefault();
    },


    /**
     * Callback for the dragenter event of the attachmentListWrap.
     * Makes sure the hoverAttachmentListWrap is being called.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragEnter: function (e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(true);
    },


    /**
     * Callback for the dragleave event of the attachmentListWrap.
     * Makes sure the hoverAttachmentListWrap is being called if,
     * and only if dragEnterCount is equal or less than 0.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragLeave: function (e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(false);
    },


    /**
     * Callback for the attachmentListWrap's dragend event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragEnd: function (e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(false, true);
    },


    /**
     * Callback for the attachmentListWrap's drop event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDrop: function (e) {
        e.preventDefault();

        var me           = this,
            dataTransfer = e.event.dataTransfer,
            controller   = me.view.getController();

        me.registerAttachmentListWrapEnter(false, true);

        if (dataTransfer && dataTransfer.files) {
            controller.addAttachmentsFromFileList(dataTransfer.files);
        }
    }

});