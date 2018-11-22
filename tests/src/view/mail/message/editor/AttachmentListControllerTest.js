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

describe('conjoon.cn_mail.view.mail.message.AttachmentListControllerTest', function(t) {

    var view,
        viewConfig,
        controller,
        createFile = function(type) {

            return new File([{
                name : 'foo.png',
                type : type ? type : 'image/jpg'
            }], 'foo.png');
        };

    t.afterEach(function() {
        if (view) {
            view.destroy();
            view = null;
            controller = null;
        }

        if (controller) {
            controller.destroy();
            controller = null;
        }


    });

    t.beforeEach(function() {

        viewConfig = {

        }
    });


    t.it("Should make sure setting up controller works", function(t) {

        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentListController', {
            });

        t.expect(controller instanceof conjoon.cn_mail.view.mail.message.AbstractAttachmentListController).toBe(true);

        t.expect(controller.alias).toContain('controller.cn_mail-mailmessageeditorattachmentlistcontroller');
    });


    t.it("Should register and catch the events properly", function(t) {

        var beforedestroy = 0;

        controller = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentListController', {
            });

        controller.onAttachmentListBeforeDestroy = function() {
            beforedestroy++;
        };

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                editMode : 'CREATE',
                controller : controller,
                renderTo : document.body,
                store : {
                    proxy : {type : 'memory'}
                }
            });

        t.expect(beforedestroy).toBe(0);
        view.destroy();
        view = null;
        t.expect(beforedestroy).toBe(1);
    });


    t.it("Should test addAttachment properly", function(t) {

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                editMode : 'CREATE',
                renderTo : document.body,
                store : {
                    model : 'conjoon.cn_mail.model.mail.message.DraftAttachment',
                    proxy : {type : 'memory'}
                }
            });

        var file = createFile('text/plain'),
            rec,
            ctrl = view.getController();

        ctrl.onFileReaderLoad = function() {
            filereaderload++;
        };
        rec = view.addAttachment(file);

        t.expect(rec instanceof conjoon.cn_mail.model.mail.message.DraftAttachment).toBe(true);
        t.expect(rec.get('file')).toBe(file);
        t.expect(view.getStore().getAt(0)).toBe(rec);
    });


    t.it("Should test onFileReaderLoad properly", function(t) {

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                editMode : 'CREATE',
                renderTo : document.body,
                store : {
                    model : 'conjoon.cn_mail.model.mail.message.DraftAttachment',
                    proxy : {type : 'memory'}
                }
            });

        var file = createFile(),
            ctrl = view.getController(),
            rec  = ctrl.addAttachment(file),
            evt = {
                target : {
                    cn_id  : rec.getId(),
                    result : 'someurl'
                }
            };

        t.expect(view.getStore().getAt(0).get('previewImgSrc')).toBe("");
        ctrl.onFileReaderLoad(evt);
        t.expect(view.getStore().getAt(0).get('previewImgSrc')).toBe("someurl");
    });


    t.it("Should test onAttachmentItemClick properly", function(t) {

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                editMode : 'CREATE',
                renderTo : document.body,
                store : {
                    model : 'conjoon.cn_mail.model.mail.message.DraftAttachment',
                    proxy : {type : 'memory'}
                }
            });

        var file = createFile(),
            ctrl = view.getController(),
            rec  = ctrl.addAttachment(file);

        t.expect(view.getStore().getRange().length).toBe(1);
        t.click(view.el.selectNode('a.removebutton'));
        t.expect(view.getStore().getRange().length).toBe(0);
    });


    t.it("Should make sure that onAttachmenListStoreBeforeDestroy has access to records", function(t) {

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                editMode : 'CREATE',
                renderTo : document.body,
                store : {
                    model : 'conjoon.cn_mail.model.mail.message.DraftAttachment',
                    proxy : {type : 'memory'}
                }
            });

        var file = createFile(),
            ctrl = view.getController(),
            rec  = ctrl.addAttachment(file),
            destr = 0;

        t.expect(view.getStore().getRange().length).toBe(1);


        view.on('beforedestroy', function() {
            destr = 1;
            t.expect(view.getStore().getRange().length).toBe(1);
        });

        t.expect(destr).toBe(0);
        view.destroy();
        t.expect(destr).toBe(1);
        view = null;
    });


    t.it("app-cn_mail#76", function(t) {

        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                editMode : 'CREATE',
                renderTo : document.body,
                store : {
                    model : 'conjoon.cn_mail.model.mail.message.DraftAttachment',
                    proxy : {type : 'memory'}
                }
            });

        let tmpReader = window.FileReader;

        let currReader;
        window.FileReader = function() {
            currReader = this;
        };

        window.FileReader.prototype = {
            addEventListener : function() {

            },
            readAsDataURL : function() {

            }
        };


        let file1 = createFile('image/png'),
            file2 = createFile('image/png'),
            rec1, rec2,
            ctrl = view.getController();

        let tmpFn = conjoon.cn_core.util.Mime.isImage;
        conjoon.cn_core.util.Mime.isImage = function(){return true;};


        rec1 = ctrl.addAttachment(file1);
        let evt1 = {
            target : {
                cn_id : currReader.cn_id
            }
        };

        let foundRec = ctrl.onFileReaderLoad(evt1);

        t.expect(foundRec).toBe(rec1);

        rec2 = ctrl.addAttachment(file2);
        let evt2 = {
            target : {
                cn_id : currReader.cn_id
            }
        };

        foundRec = ctrl.onFileReaderLoad(evt2);

        conjoon.cn_core.util.Mime.isImage = tmpFn;

        t.expect(foundRec).toBe(rec2);


        t.waitForMs(750, function() {
            window.FileReader = tmpReader;
        });
    });


});
