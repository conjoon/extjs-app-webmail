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
 * The default ViewController for
 * {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController', {

    extend : 'Ext.app.ViewController',

    alias : 'controller.cn_mail-mailmessageeditorviewcontroller',

    control : {
        'cn_mail-mailmessageeditorhtmleditor > toolbar > cn_comp-formfieldfilebutton' : {
            change : 'onFormFileButtonChange'
        },

        '#showCcBccButton' : {
            click : 'onShowCcBccButtonClick'
        },

        '#sendButton' : {
            click : 'onSendButtonClick'
        },

        '#saveButton' : {
            click : 'onSaveButtonClick'
        }
    },

    /**
     * Helper to indicate the number of times the attachmentlistWrap was entered/
     * leaved during the drag/drop process to properly add/remove styles.
     * @type {Integer=0} dragEnterCount
     * @private
     */
    dragEnterCount : 0,


    /**
     * Makes sure #installDragDropListeners is called as soon as the controller's
     * editor was rendered.
     */
    init : function() {
        var me   = this,
            view = me.getView();
        view.on('afterrender', me.installDragDropListeners, me, {single : true});
    },


    /**
     * Helper method to register the drag & drop listeners to the embedded
     * container wrapping the AttachmentList.
     *
     * @private
     */
    installDragDropListeners : function() {
        var me             = this,
            view           = me.getView(),
            attachmentWrap = view.down('#attachmentListWrap').el;

        view.mon(
            attachmentWrap, 'dragenter', me.onAttachmentListWrapDragEnter, me);
        view.mon(
            attachmentWrap, 'dragleave', me.onAttachmentListWrapDragLeave, me);
        view.mon(
            attachmentWrap, 'dragend',   me.onAttachmentListWrapDragEnd,   me);
        view.mon(
            attachmentWrap, 'drop',      me.onAttachmentListWrapDrop,      me);
    },


    /**
     * Helper function to add/remove the "hover" css class of the
     * attachmentListWrap.
     *
     * @param {Boolean} isHover true to add the css class, false to remove it.
     * @param {Boolean} forceReset true to reset #dragEnterCount to 0
     */
    registerAttachmentListWrapEnter : function(isHover, forceReset) {
        var me   = this,
            view = me.getView();

        if (isHover) {
            me.dragEnterCount++;
        } else {
            me.dragEnterCount--;
        }

        me.dragEnterCount = me.dragEnterCount < 0 || forceReset === true
                            ? 0
                            : me.dragEnterCount;

        view.down('#attachmentListWrap').el[
            me.dragEnterCount ? 'addCls' : 'removeCls'
        ]('hover')
    },


    /**
     * Callback for the dragenter event of the attachmentListWrap.
     * Makes sure the hoverAttachmentListWrap is being called.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragEnter : function(e) {
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
    onAttachmentListWrapDragLeave : function(e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(false);
    },


    /**
     * Callback for the attachmentListWrap's dragend event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDragEnd : function(e) {
        e.preventDefault();

        var me = this;
        me.registerAttachmentListWrapEnter(false, true);
    },


    /**
     * Callback for the attachmentListWrap's drop event.
     *
     * @param {Ext.util.Event} e
     */
    onAttachmentListWrapDrop : function(e) {
        e.preventDefault();

        var me           = this,
            dataTransfer = e.event.dataTransfer;

        me.registerAttachmentListWrapEnter(false, true);

        if (dataTransfer && dataTransfer.files) {
            me.addAttachmentsFromFileList(dataTransfer.files);
        }
    },


    /**
     * Adds the files available in fileList to the editor#s attachmentList.
     *
     * @param {FileList} fileList
     *
     * @private
     */
    addAttachmentsFromFileList : function(fileList) {
        var me             = this,
            view           = me.getView(),
            attachmentList = view.down('cn_mail-mailmessageeditorattachmentlist');

        for (var i = 0, len = fileList.length; i < len; i++) {
            attachmentList.addAttachment(fileList[i]);
        }
    },


    /**
     * Callback for the change event of this view's {@link conjoon.cn_comp.form.FileButton}.
     *
     * @param {conjoon.cn_comp.form.FileButton} fileButton
     * @param {Ext.event.Event} evt
     * @param {String} value
     * @param {FileList} fileList
     *
     * @see conjoon.cn_mail.view.mail.message.editor.AttachmentList#addAttachment
     */
    onFormFileButtonChange : function(fileButton, evt, value, fileList) {
        var me = this;
        me.addAttachmentsFromFileList(fileList);
    },


    /**
     * Delegates showing the CC/BCC fields to the view.
     *
     * @param {Ext.Button}
     */
    onShowCcBccButtonClick : function(btn) {

        var me   = this,
            view = me.getView();

        view.showCcBccFields(view.down('#ccField').isHidden());
    },


    /**
     * Saves the current MessageDraft.
     *
     * @param {Ext.Button} btn
     */
    onSaveButtonClick : function(btn) {

        var me           = this,
            view         = me.getView(),
            vm           = view.getViewModel();
            session      = view.getSession(),
            messageDraft = vm.get('messageDraft');


        var saveBatch = session.getSaveBatch();

        if (saveBatch) {

            var operations = saveBatch.getOperations();

            for (var i = 0, len = operations.length; i < len; i++) {
                if (operations[i].getAction() == 'create' &&
                    operations[i].entityType.entityName == 'DraftAttachment') {
                    operations[i].setProgressCallback(function() {
                        console.log("!!! PROGRESS", arguments);
                    });
                }
            }
            //return;
            saveBatch.on('exception', function() {
                console.log("exception", arguments);
            });
            saveBatch.on('complete', function() {
                console.log("complete, message saved in folder id", messageDraft.get('mailFolderId'));
            });
            saveBatch.start();
        }


    },


    /**
     *
     * @param btn
     */
    onSendButtonClick : function(btn) {

        /*Ext.raise({
            source : Ext.getClassName(this),
            msg    : 'Not implemented yet'
        });*/

        var me             = this,
            view           = me.getView(),
            attachmentList = view.down('cn_mail-mailmessageattachmentlist'),
            store          = attachmentList.getStore(),
            recs           = store.getRange(),
            file,
            xhr;

        if (!attachmentList.hasLocalFiles()) {
            Ext.raise({
                msg    : "localFileList is empty",
                source : Ext.getClassName(this)
            })
        }

        // Don't even start if file is missing
        for (var i = 0, len = recs.length; i < len; i++) {
            file = attachmentList.getLocalFileObject(recs[i].get('localId'));

            if (!file) {
                Ext.raise({
                    msg    : "localFileList missing info for file " + recs[i].get('localId'),
                    source : Ext.getClassName(this)
                })
            }
        }

        for (var i = 0, len = recs.length; i < len; i++) {
            file = attachmentList.getLocalFileObject(recs[i].get('localId'));

            var fd = new FormData();
            fd.append("file", file);
            fd.append("messageId", "101");

             Ext.Ajax.request({
                 url : 'someurl.php',
                 /*params : {
                     messageId : 101
                 },*/
                 jsonData : false,
                 rawData : fd
             });

            /*var request = {
             url: 'http://localhost/scout/webroot/img/pic/getfile.php',
             method: 'POST',
             xhr2: true,
             requestHeader:{

             },
             progress:progressIndicator,
             success: function(response) {
             var out = Ext.getCmp("output");
             response = Ext.JSON.decode(response.responseText, true);
             out.setHtml(response.message);
             },
             failure: function(response) {
             var out = Ext.getCmp("output");
             out.setHtml(response.message);
             }
             };


             Ext.Viewport.add(progressIndicator);
             var files = input.dom.files;

             if (files.length) {
             request.binaryData = files[0];
             console.log(request.binaryData.name);
             console.log(request);
             request.setRequestHeader("X-File-Name", request.binaryData.name);
             Ext.Ajax.request(request);
             }else {
             Ext.Msg.alert("Please Select a JPG");
             }*/
return;
            xhr  = new XMLHttpRequest();

            var fd = new FormData();
            fd.append("file", file);
             fd.append("messageId", "101");
            var xhr = new XMLHttpRequest();
            // start upload
            xhr.open("POST", 'someurl.php', true);
            xhr.send(fd);//Ext.apply({file : file}, recs[i].data));
        }
    }
});