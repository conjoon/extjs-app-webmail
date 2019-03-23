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

describe('conjoon.cn_mail.view.mail.message.editor.AttachmentListTest', function(t) {

    var view,
        viewConfig,
        createFile = function() {
            return new File([{
                name : 'foo.png',
                type : 'text/plain'
            }], 'foo.png');
        };

    t.afterEach(function() {
       if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function() {

        viewConfig = {

        }
    });


    t.it("Should create and show the attachment list along with default config checks", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', viewConfig);

        t.expect(view instanceof Ext.view.View).toBeTruthy();

        t.expect(view.alias).toContain('widget.cn_mail-mailmessageeditorattachmentlist');

        t.expect(view.getController() instanceof conjoon.cn_mail.view.mail.message.editor.AttachmentListController).toBe(true);

        t.expect(view.getEditMode()).toBe('CREATE');
    });


    t.it("Should make sure editMode cannot be changed during runtime", function(t) {

        var view = Ext.create('conjoon.cn_mail.view.mail.message.editor.AttachmentList', {editMode : 'CREATE'});
        t.expect(view.getEditMode()).toBe('CREATE');
        view.destroy();
        view = null;

        var view = Ext.create('conjoon.cn_mail.view.mail.message.editor.AttachmentList',{editMode : 'EDIT'});
        t.expect(view.getEditMode()).toBe('EDIT');
        view.destroy();
        view = null;

        var view = Ext.create('conjoon.cn_mail.view.mail.message.editor.AttachmentList',{editMode : undefined});
        t.expect(view.getEditMode()).toBe('CREATE');
        var exc = null;
        try {view.setEditMode('EDIT');} catch (e) {exc = e;}
        t.expect(exc.msg).toBeDefined();
        view.destroy();
        view = null;

        var view = Ext.create('conjoon.cn_mail.view.mail.message.editor.AttachmentList',{editMode : 'CREATE'});
        t.expect(view.getEditMode()).toBe('CREATE');
        var exc = null;
        try {view.setEditMode('READ');} catch (e) {exc = e;}
        t.expect(exc.msg).toBeDefined();
        view.destroy();
        view = null;

        // create with anything but undefined, EDIT or CREATE
        var exc = null;
        try {
            var view = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.AttachmentList',
                {editMode : 'foo'});
            view.destroy();
            view = null;
        } catch (e) {exc = e;}
        t.expect(exc.msg).toBeDefined();



    });

    t.it("Should test displayButtonType properly", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', viewConfig);

        var tests = [{
            editMode       : 'foo',
            expectREMOVE   : true,
            expectDOWNLOAD : true
        }, {
            editMode       : null,
            expectREMOVE   : true,
            expectDOWNLOAD : true
        }, {
            editMode       : 'READ',
            expectREMOVE   : true,
            expectDOWNLOAD : true
        }, {
            editMode       : 'CREATE',
            expectREMOVE   : true,
            expectDOWNLOAD : true
        }, {
            editMode       : 'EDIT',
            expectREMOVE   : true,
            expectDOWNLOAD : true
        }];

        for (var i = 0, len = tests.length; i < len; i++) {
            t.expect(
                view.displayButtonType(tests[i]['editMode'], 'REMOVE')
            ).toBe(tests[i]['expectREMOVE']);

            t.expect(
                view.displayButtonType(tests[i]['editMode'], 'DOWNLOAD')
            ).toBe(tests[i]['expectDOWNLOAD']);
        }


    });


    t.it("Should throw if no valid argument passed to addAttachment", function(t) {

        view = Ext.create('conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
            editMode : 'CREATE'
        });

        var exc;
        try {
            view.addAttachment({});
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain('native file object');
        t.expect(exc.source).toBeDefined();

    });


    t.it("Should throw if store configured for attachment list has a model defined which is not a DraftAttachment.", function(t) {

        Ext.define('DummyModel', {
            extend : 'Ext.data.Model'
        });

        t.waitForMs(500, function() {
            view = Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                    renderTo : document.body,
                    editMode : 'CREATE',
                    store : {
                        model : 'DummyModel',
                        proxy : {
                            type : 'memory'
                        }
                    }
                });
            var file = createFile();
            var exc;
            try {
                view.addAttachment(file);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg).toContain('The store\'s model must be of type DraftAttachment.');
            t.expect(exc.source).toBeDefined();
        });
    });

    t.it("Should test addAttachment with store's model set to DraftAttachment properly", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                renderTo : document.body,
                editMode : 'CREATE',
                store : {
                    model : 'conjoon.cn_mail.model.mail.message.DraftAttachment',
                    proxy : {
                        type : 'memory'
                    }
                }
            });
        t.expect(view.el.selectNode('div.attachment')).toBe(null);
        var file = createFile(),
            rec = view.addAttachment(file);
        t.expect(rec instanceof conjoon.cn_mail.model.mail.message.DraftAttachment).toBe(true);
        t.expect(rec.$className).toBe(view.getStore().getModel().getName());
        t.expect(view.el.selectNode('div.attachment')).not.toBe(null);
    });


    t.it("Should process beforedestroy properly", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.AttachmentList', {
                renderTo : document.body,
                editMode : 'CREATE',
                store : {
                    model : 'conjoon.cn_mail.model.mail.message.DraftAttachment',
                    proxy : {
                        type : 'memory'
                    }
                }
            });

        t.isntCalled('getRange', view.getStore());

        view.getStore().destroy();
        view.destroy();

    });






});
