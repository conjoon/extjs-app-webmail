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

describe('conjoon.cn_mail.view.mail.message.editor.MessageEditorTest', function(t) {

    var view,
        viewConfig = {
            renderTo : document.body,
            width : 400,
            height : 400
        },
        createWithViewConfig = function(config) {
            return Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditor', config);
        },
        createWithMessageConfig = function(msgConfig) {
            return Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                    renderTo : document.body,
                    messageConfig : msgConfig
                });
        },
        checkConstructorCreateWithAddress = function(address, t, view) {
            t.expect(view.down('#toField').getValue()).toEqual(address);
            t.expect(view.down('#ccField').isHidden()).toBe(true);
            t.expect(view.down('#bccField').isHidden()).toBe(true);
            t.expect(view.editMode).toBe('CREATE');
            t.expect(view.down('cn_mail-mailmessageeditorattachmentlist').getEditMode()).toBe('CREATE');
        },
        expectCcsHidden = function(expect, t, view) {
            t.expect(view.down('#ccField').isHidden()).toBe(expect);
            t.expect(view.down('#bccField').isHidden()).toBe(expect);
        };

    t.afterEach(function() {
       if (view) {
            view.destroy();
            view = null;
        }
    });

    t.beforeEach(function() {
        viewConfig = {
            renderTo : document.body
        };
    });

t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {


// +---------------------------------------------------------------------------
// | BASIC BEHAVIOR
// +---------------------------------------------------------------------------
    t.it("Should create and show the view along with default config checks", function(t) {
        view = createWithViewConfig(viewConfig);

        // configs
        t.expect(view instanceof Ext.form.Panel).toBe(true);
        t.expect(view.alias).toContain('widget.cn_mail-mailmessageeditor');
        t.expect(view.closable).toBe(true);
        t.expect(view.getSession()).toBeTruthy();
        t.expect(view.getSession().getSchema() instanceof conjoon.cn_mail.data.mail.BaseSchema).toBe(true);
        t.expect(view.getController() instanceof conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController).toBe(true);
        t.expect(view.getViewModel() instanceof conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel).toBe(true);

        // components
        t.expect(view.down('cn_mail-mailmessageeditorattachmentlist') instanceof conjoon.cn_mail.view.mail.message.editor.AttachmentList).toBe(true);
        t.expect(view.down('#showCcBccButton') instanceof Ext.Button).toBe(true);
        t.expect(view.down('#toField') instanceof conjoon.cn_mail.view.mail.message.editor.AddressField).toBe(true);
        t.expect(view.down('#ccField') instanceof conjoon.cn_mail.view.mail.message.editor.AddressField).toBe(true);
        t.expect(view.down('#bccField') instanceof conjoon.cn_mail.view.mail.message.editor.AddressField).toBe(true);
        t.expect(view.down('#subjectField') instanceof Ext.form.field.Text).toBe(true);
        t.expect(view.down('cn_mail-mailmessageeditorhtmleditor') instanceof conjoon.cn_mail.view.mail.message.editor.HtmlEditor).toBe(true);

        t.expect(view.down('#attachmentListWrap') instanceof Ext.Container).toBe(true);

        t.expect(view.down('cn_mail-mailmessageeditorattachmentlist').getEditMode()).toBe('CREATE');
        t.expect(view.editMode).toBe('CREATE');

    });

    /**
     * since conjoon/app-cn_mail/1 the attachmentList is always visible
     */
    t.it("Should create with empty messageItem and show/hide attachmentList properly", function(t) {
        view = createWithViewConfig(viewConfig);

        // wait for bindings
        t.waitForMs(500, function() {
            t.expect(view.down('cn_mail-mailmessageeditorattachmentlist').isHidden()).toBe(false);
            view.down('cn_mail-mailmessageeditorattachmentlist').getStore().add({text : 'dummfile'});
            t.expect(view.down('cn_mail-mailmessageeditorattachmentlist').isHidden()).toBe(false);
            view.down('cn_mail-mailmessageeditorattachmentlist').getStore().removeAll();
            t.expect(view.down('cn_mail-mailmessageeditorattachmentlist').isHidden()).toBe(false);
        });
    });


    t.it("Should return default subject for emptyMessage", function(t) {
        view = createWithViewConfig(viewConfig);
        // wait for bindings
        t.waitForMs(500, function() {
            t.expect(view.getTitle().toLowerCase()).toBe('(no subject)');
        });
    });

// +---------------------------------------------------------------------------
// | CONSTRUCTOR CHECKS
// +---------------------------------------------------------------------------
    t.it("Should create empty message with specified to-address (string)", function(t) {
        view = createWithViewConfig({
            editMode : 'EDIT',
            renderTo : document.body,
            messageConfig : {
                to : 'name@domain.tld'
            }
        });

        t.waitForMs(500, function() {
            checkConstructorCreateWithAddress(['name@domain.tld'], t, view);
        });
    });

    t.it("Should create empty message with specified to-address (array, 1)", function(t) {
        view = createWithMessageConfig({
            to : [{name : 'Peter', address : 'name@domain.tld'}]
        });

        t.waitForMs(500, function() {
            checkConstructorCreateWithAddress(['name@domain.tld'], t, view);
        });
    });

    t.it("Should create empty message with specified to-address (array, 2)", function(t) {
        view = createWithMessageConfig({
            to : [
                {name : 'Peter', address : 'name@domain.tld'},
                {name : 'Peter2', address : 'name2@domain.tld'}
        ]});

        t.waitForMs(500, function() {
            checkConstructorCreateWithAddress(
                ['name@domain.tld', 'name2@domain.tld'], t, view);
        });
    });


    t.it("Should create empty message with specified to-address (EmailAddress)", function(t) {
        view = createWithMessageConfig({
            to : Ext.create(
                'conjoon.cn_mail.model.mail.message.EmailAddress',
                {address : 'name3@domain.tld'}
            )
        });

        t.waitForMs(500, function() {
            checkConstructorCreateWithAddress(
                ['name3@domain.tld'], t, view);
        });
    });


    t.it("Should throw exception when called with viewModel and messageConfig", function(t) {

        var exc = undefined;
        try {
            view = createWithViewConfig({
                viewModel : {data : {foo : 'bar'}},
                messageConfig : {to : Ext.create(
                    'conjoon.cn_mail.model.mail.message.EmailAddress',
                    {address : 'name3@domain.tld'}
                )}
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).not.toBeUndefined();
        t.expect(exc.msg).toContain("Can only set");
    });


    t.it("Should be okay when called with viewConfig", function(t) {

        var exc = undefined;
        try {
            view = createWithViewConfig({
                viewModel : {data : {foo : 'bar'}}
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeUndefined();
    });


// +---------------------------------------------------------------------------
// | initComponent Check
// +---------------------------------------------------------------------------

    t.it("Should throw exception when called with items without attachmentList", function(t) {

        var exc = undefined;
        try {
            view = createWithViewConfig({
                items : [{xtype :'panel'}]
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).not.toBeUndefined();
        t.expect(exc.msg).toContain("MessageEditor needs to have");
    });


// +---------------------------------------------------------------------------
// | showBcCcFields
// +---------------------------------------------------------------------------

    t.it("Should test showCcBccFields properly", function(t) {

        view = createWithViewConfig(viewConfig);

        // give the ViewModel bindings some time
        t.waitForMs(500, function() {
            t.expect(view.down('#ccField').isHidden()).toBe(true);
            t.expect(view.down('#bccField').isHidden()).toBe(true);
            t.expect(view.showCcBccFields(true)).toBe(view);
            t.expect(view.down('#ccField').isHidden()).toBe(false);
            t.expect(view.down('#bccField').isHidden()).toBe(false);
            t.expect(view.showCcBccFields()).toBe(view);
            t.expect(view.down('#ccField').isHidden()).toBe(false);
            t.expect(view.down('#bccField').isHidden()).toBe(false);
            t.expect(view.showCcBccFields(false)).toBe(view);
            t.expect(view.down('#ccField').isHidden()).toBe(true);
            t.expect(view.down('#bccField').isHidden()).toBe(true);
            view.showCcBccFields();
            t.expect(view.down('#ccField').isHidden()).toBe(false);
            t.expect(view.down('#bccField').isHidden()).toBe(false);
        });

    });


// +---------------------------------------------------------------------------
// | CC / BCC FIELD BEHAVIOR
// +---------------------------------------------------------------------------

        t.it("Should load message from backend", function(t) {
            view = createWithMessageConfig({id : 1});

            t.waitForMs(500, function() {
                t.expect(view.editMode).toBe('EDIT');
                t.expect(view.down('cn_mail-mailmessageeditorattachmentlist').getEditMode()).toBe('EDIT');
                t.expect(view.down('cn_mail-mailmessageeditorhtmleditor').getValue()).toBeTruthy();

                t.expect(view.down('#toField').getValue().length).toBe(2);

                expectCcsHidden(false, t, view);

                t.expect(view.down('#ccField').getValue().length).toBe(2);
                t.expect(view.down('#bccField').getValue().length).toBe(2);
            });
        });


        t.it("Should load message from backend and not hide cc/bcc if fields are cleared", function(t) {
            view = createWithMessageConfig({id : 1});

            t.waitForMs(500, function() {
                t.expect(view.editMode).toBe('EDIT');
                t.expect(view.down('cn_mail-mailmessageeditorhtmleditor').getValue()).toBeTruthy();

                t.expect(view.down('#toField').getValue().length).toBe(2);

                expectCcsHidden(false, t, view);

                view.getViewModel().set('messageDraft.cc', []);
                view.getViewModel().set('messageDraft.bcc', []);

                t.waitForMs(500, function() {
                    t.expect(view.down('#ccField').getValue().length).toBe(0);
                    t.expect(view.down('#bccField').getValue().length).toBe(0);

                    expectCcsHidden(false, t, view);
                });

            });
        });


        t.it("Should load message from backend and showHide ccbcc button depending on the values of the cc bcc fields", function(t) {
            view = createWithMessageConfig({id : 1});

            t.waitForMs(500, function() {
                t.expect(view.editMode).toBe('EDIT');
                t.expect(view.down('cn_mail-mailmessageeditorhtmleditor').getValue()).toBeTruthy();

                t.expect(view.down('#toField').getValue().length).toBe(2);

                t.expect(view.down('#showCcBccButton').isHidden()).toBe(true);

                view.getViewModel().set('messageDraft.cc', []);
                view.getViewModel().set('messageDraft.bcc', []);

                t.waitForMs(500, function() {
                    t.expect(view.down('#showCcBccButton').isHidden()).toBe(false);
                });

            });
        });


    t.it("Should load message from backend, cc and bcc field hidden", function(t) {

        view = createWithMessageConfig({id : 2});

        t.waitForMs(500, function() {
            expectCcsHidden(true, t, view);

            t.expect(view.down('#ccField').getValue().length).toBe(0);
            t.expect(view.down('#bccField').getValue().length).toBe(0);
        });
    });

    t.it("Typing into cc/bcc field and then click showCcBccButton should not add value (createNewOnBlur setting)", function(t) {

        view = createWithViewConfig(viewConfig);

        t.waitForMs(500, function() {
            expectCcsHidden(true, t, view);

            view.down('#showCcBccButton').setUI('default');
            t.click(view.down('#showCcBccButton'));
            expectCcsHidden(false, t, view);
            view.down('#ccField').focus();
            view.down('#ccField').el.dom.getElementsByTagName('input')[0].value = 'aaaaaaaaaaaaa';
            t.click(view.down('#showCcBccButton'));
            t.waitForMs(500, function() {
                expectCcsHidden(true, t, view);
                t.expect(view.down('#showCcBccButton').isHidden()).toBe(false);
            });

        });
    });

});
});
