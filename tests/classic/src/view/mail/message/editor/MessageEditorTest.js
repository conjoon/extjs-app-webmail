/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
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
        createWithViewConfig = function(config) {
            return Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditor', config);
        },
        createWithMessageConfig = function(msgConfig) {
            return Ext.create(
                'conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                    renderTo     : document.body,
                    width        : 400,
                    height       : 400,
                    messageDraft : msgConfig
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

        viewConfig = null;
    });

    t.beforeEach(function() {
        viewConfig = {
            renderTo     : document.body,
            width        : 400,
            height       : 400,
            messageDraft : Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig')
        };
    });

t.requireOk('conjoon.cn_mail.data.mail.PackageSim', function() {

    Ext.ux.ajax.SimManager.init({
        delay: 1
    });


// +---------------------------------------------------------------------------
// | BASIC BEHAVIOR
// +---------------------------------------------------------------------------
    t.it("constructor() - no config", function(t) {
        var exc, e;

        try {
            view = createWithViewConfig();
        } catch (e) {
            exc = e;
        }


        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("must be set");
    });


    t.it("constructor() - no config.messageDraft", function(t) {
        var exc, e;

        try {
            view = createWithViewConfig({});
        } catch (e) {
            exc = e;
        }


        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("must be set");
    });

    t.it("constructor() - with ViewModel", function(t) {
        var exc, e;

        try {
            view = createWithViewConfig({messageDraft : '1', viewModel : {}});
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("Cannot set");
    });

    t.it("Should create and show the view along with default config checks", function(t) {
        view = createWithViewConfig(viewConfig);


        // configs
        t.expect(view instanceof Ext.form.Panel).toBe(true);
        t.expect(view.alias).toContain('widget.cn_mail-mailmessageeditor');
        t.expect(view.closable).toBe(false);
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
        var messageDraftConfig = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
            to : 'name@domain.tld'
        });
        view = createWithViewConfig({
            editMode : 'CREATE',
            renderTo : document.body,
            messageDraft : messageDraftConfig
        });

        t.waitForMs(500, function() {
            checkConstructorCreateWithAddress(['name@domain.tld'], t, view);
        });
    });

    t.it("Should create empty message with specified to-address (array, 1)", function(t) {
        var messageDraftConfig = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
            to : [{name : 'Peter', address : 'name@domain.tld'}]
        });
        view = createWithMessageConfig(messageDraftConfig, 'CREATE');

        t.waitForMs(500, function() {
            checkConstructorCreateWithAddress(['name@domain.tld'], t, view);
        });
    });

    t.it("Should create empty message with specified to-address (array, 2)", function(t) {
        var messageDraftConfig = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
            to : [
                {name : 'Peter', address : 'name@domain.tld'},
                {name : 'Peter2', address : 'name2@domain.tld'}
            ]
        });
        view = createWithMessageConfig(messageDraftConfig, 'CREATE');

        t.waitForMs(500, function() {
            checkConstructorCreateWithAddress(
                ['name@domain.tld', 'name2@domain.tld'], t, view);
        });
    });


    t.it("Should throw exception when called with viewModel and messageDraft", function(t) {
        var messageDraftConfig = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
            to : [
                {name : 'Peter', address : 'name@domain.tld'},
                {name : 'Peter2', address : 'name2@domain.tld'}
            ]
        });
        var exc = undefined;
        try {
            view = createWithViewConfig({
                viewModel : {data : {foo : 'bar'}},
                messageDraft : messageDraftConfig,
                editMode : 'CREATE'
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).not.toBeUndefined();
        t.expect(exc.msg).toContain("Cannot set");
    });


    t.it("Should be okay when called with viewConfig", function(t) {

        var exc = undefined;
        try {
            view = createWithViewConfig({
                messageDraft : {},
                viewModel    : {data : {foo : 'bar'}}
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).not.toBeUndefined();
        t.expect(exc.msg).toContain("Cannot set");
    });

    t.it("Should create message with to, cc, bcc, subject and textHtml", function(t) {
        var messageDraftConfig = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
            to : [
                {name : 'Peter', address : 'name@domain.tld'},
                {name : 'Peter2', address : 'name2@domain.tld'}
            ],
            cc       : 'cc@ccdomain.tld',
            bcc      : 'bcc@bccdomain.tld',
            subject  : 'foo',
            textHtml : 'bar'
        });
        view = createWithMessageConfig(messageDraftConfig, 'CREATE');

        t.waitForMs(500, function() {
            t.expect(view.down('cn_mail-mailmessageeditorhtmleditor').getValue()).toBe('bar');

            t.expect(view.down('#toField').getValue()).toEqual(['name@domain.tld', 'name2@domain.tld']);

            expectCcsHidden(false, t, view);

            t.expect(view.down('#ccField').getValue()).toEqual(['cc@ccdomain.tld']);
            t.expect(view.down('#bccField').getValue()).toEqual(['bcc@bccdomain.tld']);
            t.expect(view.down('#subjectField').getValue()).toBe('foo');
        });
    });

// +---------------------------------------------------------------------------
// | initComponent Check
// +---------------------------------------------------------------------------

    t.it("Should throw exception when called with items without attachmentList", function(t) {

        var exc = undefined;
        try {
            view = createWithViewConfig({
                messageDraft : '1',
                items        : [{xtype :'panel'}]
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


//  +---------------------------------------------------------------------------
//  | CC / BCC FIELD BEHAVIOR
//  +---------------------------------------------------------------------------

        t.it("Should load message from backend", function(t) {
            view = createWithMessageConfig('1');

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
            view = createWithMessageConfig('1');

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
            view = createWithMessageConfig('1');

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

        view = createWithMessageConfig('2');

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


    t.it("closable mvvm", function(t) {
        view = createWithViewConfig(viewConfig);
        t.waitForMs(200, function() {
            t.expect(view.getClosable()).toBe(true);

            view.getViewModel().set('isSaving', true);
            t.waitForMs(200, function() {
                t.expect(view.getClosable()).toBe(false);
                view.getViewModel().set('isSaving', false);
                t.waitForMs(200, function() {
                    t.expect(view.getClosable()).toBe(true);
                    view.getViewModel().set('isSending', true);
                    t.waitForMs(200, function() {
                        t.expect(view.getClosable()).toBe(false);
                        view.getViewModel().set('isSending', false);
                        t.waitForMs(200, function() {
                            t.expect(view.getClosable()).toBe(true);
                        })
                    })
                })
            })
        });
    });


    t.it("iconCls mvvm", function(t) {
        view = createWithViewConfig(viewConfig);
        t.waitForMs(200, function() {
            var iconCls = view.getIconCls();

            t.expect(iconCls).toBeTruthy();

            view.getViewModel().set('isSaving', true);
            t.waitForMs(200, function() {
                t.expect(view.getIconCls()).not.toBe(iconCls);
                view.getViewModel().set('isSaving', false);
                t.waitForMs(200, function() {
                    t.expect(view.getIconCls()).toBe(iconCls);
                    view.getViewModel().set('isSending', true);
                    t.waitForMs(200, function() {
                        t.expect(view.getIconCls()).not.toBe(iconCls);
                        view.getViewModel().set('isSending', false);
                        t.waitForMs(200, function() {
                            t.expect(view.getIconCls()).toBe(iconCls);
                        })
                    })
                })
            })
        });
    });


    t.it("setBusy()", function(t) {
        view = createWithViewConfig(viewConfig);

        t.expect(view.busyMask).toBeFalsy();

        t.expect(view.setBusy(false)).toBe(view);
        t.expect(view.busyMask).toBeFalsy();

        var exc, e;
        try {
            view.setBusy('text');
        } catch(e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain('must either be');

        view.setBusy({msgAction : 'foo'});
        t.isInstanceOf(view.busyMask, 'conjoon.cn_comp.component.LoadMask');
        t.expect(view.busyMask).toBeTruthy();
        t.expect(view.busyMask.isHidden()).toBe(false);

        t.expect(view.setBusy(false)).toBe(view);
        t.expect(view.busyMask).toBeTruthy();
        t.expect(view.busyMask.isHidden()).toBe(true);

        t.isCalledNTimes('loopProgress',    view.busyMask, 2);
        t.isCalledNTimes('updateActionMsg', view.busyMask, 2);
        t.isCalledNTimes('updateProgress',  view.busyMask, 1);
        t.isCalledNTimes('updateMsg',       view.busyMask, 1);

        t.expect(view.setBusy({msgAction : 'text'})).toBe(view);
        t.expect(view.busyMask).toBeTruthy();
        t.expect(view.busyMask.isHidden()).toBe(false);

        t.expect(view.setBusy({msg : 'text'})).toBe(view);
        t.expect(view.setBusy({msgAction : 'text', progress : 1})).toBe(view);
        t.expect(view.busyMask).toBeTruthy();
        t.expect(view.busyMask.isHidden()).toBe(false);
    });


    t.it("showAddressMissingNotice()", function(t) {
        view = createWithViewConfig(viewConfig);

        view.getViewModel().notify();

        var iconCls = view.getIconCls();

        t.expect(view.getClosable()).toBe(true);

        view.down('#subjectField').focus();
        t.expect(view.down('#subjectField').hasFocus).toBe(true);

        view.showAddressMissingNotice();

        var okButton = Ext.dom.Query.select("span[data-ref=okButton]", view.el.dom);

        var mask = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom);

        t.expect(mask.length).toBe(1);
        t.expect(okButton.length).toBe(1);
        t.expect(okButton[0].parentNode.style.display).not.toBe('none');

        t.expect(view.getIconCls()).not.toBe(iconCls);
        t.expect(view.getClosable()).toBe(false);

        t.click(okButton[0]);

        t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);

        t.expect(view.getIconCls()).toBe(iconCls);
        t.expect(view.getClosable()).toBe(true);

        t.expect(view.down('#toField').hasFocus).toBe(true);


    });


    t.it("showSubjectMissingNotice()", function(t) {
        view = createWithViewConfig(viewConfig);

        view.getViewModel().notify();

        var VALUE, BUTTONID, SCOPE,
            iconCls = view.getIconCls(),
            func    = function(btnId, value) {
                SCOPE    = this;
                VALUE    = value;
                BUTTONID = btnId;
            };
        t.expect(view.getClosable()).toBe(true);

        view.showSubjectMissingNotice(view.getViewModel().get('messageDraft'), func);

        var okButton     = Ext.dom.Query.select("span[data-ref=okButton]", view.el.dom),
            cancelButton = Ext.dom.Query.select("span[data-ref=cancelButton]", view.el.dom),
            mask         = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom),
            inputField   = Ext.dom.Query.select("input[type=text]", mask);

        t.expect(mask.length).toBe(1);
        t.expect(okButton.length).toBe(1);
        t.expect(okButton[0].parentNode.style.display).not.toBe('none');
        t.expect(cancelButton.length).toBe(1);
        t.expect(cancelButton[0].parentNode.style.display).not.toBe('none');
        t.expect(inputField.length).toBe(1);
        t.expect(inputField.length).toBe(1);
        t.expect(inputField[0].value).toBeFalsy();

        t.expect(view.getIconCls()).not.toBe(iconCls);
        t.expect(view.getClosable()).toBe(false);

        // OKBUTTON
        inputField[0].value = 'foobar';
        t.click(okButton[0]);

        t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);
        t.expect(view.getIconCls()).toBe(iconCls);
        t.expect(view.getClosable()).toBe(true);

        t.expect(VALUE).toBe('foobar');
        t.expect(BUTTONID).toBe('okButton');
        t.expect(SCOPE).toBe(view);
        view.getViewModel().notify();
        t.expect(view.down('#subjectField').getValue()).toBe('foobar');

        // CANCELBUTTON
        VALUE    = "";
        BUTTONID = "";
        view.showSubjectMissingNotice(view.getViewModel().get('messageDraft'), func);

        cancelButton = Ext.dom.Query.select("span[data-ref=cancelButton]", view.el.dom);
        mask         = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom);
        inputField   = Ext.dom.Query.select("input[type=text]", mask);

        inputField[0].value = 'SNAFU';
        t.click(cancelButton[0]);

        t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);
        t.expect(view.getIconCls()).toBe(iconCls);
        t.expect(view.getClosable()).toBe(true);

        t.expect(VALUE).toBe('SNAFU');
        t.expect(BUTTONID).toBe('cancelButton');
        view.getViewModel().notify();
        t.expect(view.down('#subjectField').getValue()).not.toBe("SNAFU");

    });


    t.it("showMailMessageSaveFailedNotice()", function(t) {
        view = createWithViewConfig(viewConfig);

        view.getViewModel().notify();

        var BUTTONID, SCOPE,
            iconCls = view.getIconCls(),
            func    = function(btnId) {
                SCOPE    = this;
                BUTTONID = btnId;
            };
        t.expect(view.getClosable()).toBe(true);

        view.showMailMessageSaveFailedNotice(view.getViewModel().get('messageDraft'), null, func);

        var yesButton  = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom),
            noButton   = Ext.dom.Query.select("span[data-ref=noButton]", view.el.dom),
            mask       = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom)

        t.expect(mask.length).toBe(1);
        t.expect(yesButton.length).toBe(1);
        t.expect(yesButton[0].parentNode.style.display).not.toBe('none');
        t.expect(noButton.length).toBe(1);
        t.expect(noButton[0].parentNode.style.display).not.toBe('none');

        t.expect(view.getIconCls()).not.toBe(iconCls);
        t.expect(view.getClosable()).toBe(false);

        // OKBUTTON
        t.click(yesButton[0]);

        t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);
        t.expect(view.getIconCls()).toBe(iconCls);
        t.expect(view.getClosable()).toBe(true);

        t.expect(BUTTONID).toBe('yesButton');
        t.expect(SCOPE).toBe(view);
        view.getViewModel().notify();


        // CANCELBUTTON
        VALUE    = "";
        BUTTONID = "";
        view.showMailMessageSaveFailedNotice(view.getViewModel().get('messageDraft'), null, func);

        noButton = Ext.dom.Query.select("span[data-ref=noButton]", view.el.dom);

        t.click(noButton[0]);

        t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);
        t.expect(view.getIconCls()).toBe(iconCls);
        t.expect(view.getClosable()).toBe(true);

        t.expect(BUTTONID).toBe('noButton');

    });


    t.it("showMessageDraftLoadingNotice()", function(t) {
        view = createWithViewConfig(viewConfig);

        t.expect(view.loadingMask).toBeFalsy();

        view.showMessageDraftLoadingNotice();

        t.isInstanceOf(view.loadingMask, 'Ext.LoadMask');
        t.expect(view.loadingMask.isHidden()).toBe(false);

        t.isCalledOnce('destroy', view.loadingMask);
        view.loadingMask.hide();
        t.expect(view.loadingMask).toBe(null);
    });


    t.it("showMessageDraftLoadingNotice() - vm isMessageBodyLoading", function(t) {
        Ext.ux.ajax.SimManager.init({
            delay: 500
        });

        var modes = [
                Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                    id       : '1',
                    editMode : 'REPLY_TO'
                }),
                Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                    id       : '1',
                    editMode : 'REPLY_ALL'
                }),
                Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                    id       : '1',
                    editMode : 'FORWARD'
                })
            ],
            i    = 0,
            func = function(t, i) {

                if (!modes[i]) {
                    return;
                }

                view = createWithMessageConfig(modes[i]);

                t.expect(view.editMode).toBe(modes[i].getEditMode());

                t.waitForMs(250, function() {
                    t.isInstanceOf(view.loadingMask, 'Ext.LoadMask');
                    t.expect(view.loadingMask.isHidden()).toBe(false);
                    t.isCalledOnce('destroy', view.loadingMask);

                    t.waitForMs(1500, function() {
                        t.expect(view.loadingMask).toBe(null);
                        view.destroy();
                        view = null;
                        func(t, ++i);
                    });
                });

            };


        func(t, 0);

    });


    t.it("getMessageDraft()", function(t){
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        view = createWithViewConfig(viewConfig);

        t.waitForMs(250, function() {

            t.expect(view.getMessageDraft()).toBeTruthy();
            t.expect(view.getMessageDraft()).toBe(view.getViewModel().get('messageDraft'));

        });
    })


    t.it("confirmDialogMask mixin", function(t){
        Ext.ux.ajax.SimManager.init({
            delay: 1
        });

        view = createWithViewConfig(viewConfig);

        t.expect(view.mixins["conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog"]).toBeTruthy();
        t.expect(view.canCloseAfterDelete).toBe(true);
    })

});
});
