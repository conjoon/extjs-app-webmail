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

describe("conjoon.cn_mail.view.mail.message.AttachmentListControllerTest", function (t) {

    var view,
        controller,
        createFile = function (type) {

            return new File([{
                name: "foo.png",
                type: type ? type : "image/jpg"
            }], "foo.png");
        };

    t.afterEach(function () {
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


    t.it("Should make sure setting up controller works", function (t) {

        controller = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AttachmentListController", {
            });

        t.expect(controller instanceof conjoon.cn_mail.view.mail.message.AbstractAttachmentListController).toBe(true);

        t.expect(controller.alias).toContain("controller.cn_mail-mailmessageeditorattachmentlistcontroller");
    });


    t.it("Should register and catch the events properly", function (t) {

        var beforedestroy = 0;

        controller = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AttachmentListController", {
            });

        controller.onAttachmentListBeforeDestroy = function () {
            beforedestroy++;
        };

        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AttachmentList", {
                editMode: "CREATE",
                controller: controller,
                renderTo: document.body,
                store: {
                    proxy: {type: "memory"}
                }
            });

        t.expect(beforedestroy).toBe(0);
        view.destroy();
        view = null;
        t.expect(beforedestroy).toBe(1);
    });


    t.it("Should test addAttachment properly", function (t) {

        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AttachmentList", {
                editMode: "CREATE",
                renderTo: document.body,
                store: {
                    model: "conjoon.cn_mail.model.mail.message.DraftAttachment",
                    proxy: {type: "memory"}
                }
            });

        var file = createFile("text/plain"),
            rec = view.addAttachment(file);

        t.expect(rec instanceof conjoon.cn_mail.model.mail.message.DraftAttachment).toBe(true);
        t.expect(rec.get("file")).toBe(file);
        t.expect(view.getStore().getAt(0)).toBe(rec);
    });


    t.it("Should test onFileReaderLoad properly", function (t) {

        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AttachmentList", {
                editMode: "CREATE",
                renderTo: document.body,
                store: {
                    model: "conjoon.cn_mail.model.mail.message.DraftAttachment",
                    proxy: {type: "memory"}
                }
            });

        var file = createFile(),
            ctrl = view.getController(),
            rec  = ctrl.addAttachment(file),
            evt = {
                target: {
                    cn_id: rec.getId(),
                    result: "someurl"
                }
            };

        t.expect(view.getStore().getAt(0).get("previewImgSrc")).toBe("");
        ctrl.onFileReaderLoad(evt);
        t.expect(view.getStore().getAt(0).get("previewImgSrc")).toBe("someurl");
    });


    t.it("Should test onAttachmentItemClick properly", function (t) {

        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AttachmentList", {
                editMode: "CREATE",
                renderTo: document.body,
                store: {
                    model: "conjoon.cn_mail.model.mail.message.DraftAttachment",
                    proxy: {type: "memory"}
                }
            });

        var file = createFile(),
            ctrl = view.getController();

        ctrl.addAttachment(file);

        t.expect(view.getStore().getRange().length).toBe(1);
        t.click(view.el.selectNode("a.removebutton"), function () {
            t.expect(view.getStore().getRange().length).toBe(0);
        });

    });


    t.it("Should make sure that onAttachmenListStoreBeforeDestroy has access to records", function (t) {

        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AttachmentList", {
                editMode: "CREATE",
                renderTo: document.body,
                store: {
                    model: "conjoon.cn_mail.model.mail.message.DraftAttachment",
                    proxy: {type: "memory"}
                }
            });

        var destr = 0,
            file = createFile(),
            ctrl = view.getController();

        ctrl.addAttachment(file);

        t.expect(view.getStore().getRange().length).toBe(1);


        view.on("beforedestroy", function () {
            destr = 1;
            t.expect(view.getStore().getRange().length).toBe(1);
        });

        t.expect(destr).toBe(0);
        view.destroy();
        t.expect(destr).toBe(1);
        view = null;
    });


    t.it("app-cn_mail#76", function (t) {

        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AttachmentList", {
                editMode: "CREATE",
                renderTo: document.body,
                store: {
                    model: "conjoon.cn_mail.model.mail.message.DraftAttachment",
                    proxy: {type: "memory"}
                }
            });

        let tmpReader = window.FileReader;

        let currReader;
        window.FileReader = function () {
            currReader = this;
        };

        window.FileReader.prototype = {
            addEventListener: function () {

            },
            readAsDataURL: function () {

            }
        };


        let file1 = createFile("image/png"),
            file2 = createFile("image/png"),
            rec1, rec2,
            ctrl = view.getController();

        let tmpFn = coon.core.util.Mime.isImage;
        coon.core.util.Mime.isImage = function (){return true;};


        rec1 = ctrl.addAttachment(file1);
        let evt1 = {
            target: {
                cn_id: currReader.cn_id
            }
        };

        let foundRec = ctrl.onFileReaderLoad(evt1);

        t.expect(foundRec).toBe(rec1);

        rec2 = ctrl.addAttachment(file2);
        let evt2 = {
            target: {
                cn_id: currReader.cn_id
            }
        };

        foundRec = ctrl.onFileReaderLoad(evt2);

        coon.core.util.Mime.isImage = tmpFn;

        t.expect(foundRec).toBe(rec2);


        t.waitForMs(750, function () {
            window.FileReader = tmpReader;
        });
    });


});
