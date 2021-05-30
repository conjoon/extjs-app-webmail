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

StartTest(async t => {

    const helper =  t.l8.liquify(t.TestHelper.get(t, window));
    await helper.mockUpMailTemplates().andRun((t) => {
        
        t.requireOk("conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", function () {

            const TIMEOUT = 1250;


            var viewConfig,
                view,
                createKey = function (id1, id2, id3) {
                    return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
                },
                getMessageItemAt = function (messageIndex) {
                    return conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);
                },
                createKeyForExistingMessage = function (messageIndex){
                    let item = getMessageItemAt(messageIndex);

                    let key = createKey(
                        item.mailAccountId, item.mailFolderId, item.id
                    );

                    return key;
                },
                createWithViewConfig = function (config) {
                    return Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditor", config);
                },
                createWithMessageConfig = function (msgConfig) {
                    return Ext.create(
                        "conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                            renderTo: document.body,
                            width: 400,
                            height: 400,
                            messageDraft: msgConfig
                        });
                },
                checkConstructorCreateWithAddress = function (address, t, view) {
                    t.expect(view.down("#toField").getValue()).toEqual(address);
                    t.expect(view.down("#ccField").isHidden()).toBe(true);
                    t.expect(view.down("#bccField").isHidden()).toBe(true);
                    t.expect(view.editMode).toBe("CREATE");
                    t.expect(view.down("cn_mail-mailmessageeditorattachmentlist").getEditMode()).toBe("CREATE");
                },
                expectCcsHidden = function (expect, t, view) {
                    t.expect(view.down("#ccField").isHidden()).toBe(expect);
                    t.expect(view.down("#bccField").isHidden()).toBe(expect);
                },
                createMessageItem = function (index, mailFolderId) {

                    index = index === undefined ? 1 : index;

                    let mi = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(index);

                    if (mailFolderId) {
                        let i = index >= 0 ? index : 0, upper = 10000;

                        for (; i <= upper; i++) {
                            mi = conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(i);
                            if (mi.mailFolderId === mailFolderId) {
                                break;
                            }
                        }

                    }

                    return Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                        localId: [mi.mailAccountId, mi.mailFolderId, mi.id].join("-"),
                        id: mi.id,
                        mailAccountId: mi.mailAccountId,
                        mailFolderId: mi.mailFolderId
                    });
                };

            t.afterEach(function () {
                if (view) {
                    view.destroy();
                    view = null;
                }

                viewConfig = null;

            });

            t.beforeEach(function () {
                viewConfig = {
                    renderTo: document.body,
                    width: 400,
                    height: 400,
                    messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig",
                        createMessageItem(undefined, "INBOX").data
                    )
                };
            });

            t.requireOk("conjoon.dev.cn_mailsim.data.mail.PackageSim", function () {

                Ext.ux.ajax.SimManager.init({
                    delay: 1
                });


                // +---------------------------------------------------------------------------
                // | BASIC BEHAVIOR
                // +---------------------------------------------------------------------------
                t.it("constructor() - no config", function (t) {
                    var exc;

                    try {
                        view = createWithViewConfig();
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toContain("must be set");
                });


                t.it("constructor() - no config.messageDraft", function (t) {
                    var exc;

                    try {
                        view = createWithViewConfig({});
                    } catch (e) {
                        exc = e;
                    }


                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toContain("must be set");
                });

                t.it("constructor() - with ViewModel", function (t) {
                    var exc;

                    try {
                        view = createWithViewConfig({messageDraft: createKeyForExistingMessage(1), viewModel: {}});
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toContain("Cannot set");
                });

                t.it("Should create and show the view along with default config checks", function (t) {
                    view = createWithViewConfig(viewConfig);

                    t.expect(view.isCnMessageEditor).toBe(true);

                    // configs
                    t.expect(view instanceof Ext.form.Panel).toBe(true);
                    t.expect(view.alias).toContain("widget.cn_mail-mailmessageeditor");
                    t.expect(view.closable).toBe(false);
                    t.expect(view.getSession()).toBeTruthy();
                    t.expect(view.getSession().getSchema() instanceof conjoon.cn_mail.data.mail.BaseSchema).toBe(true);
                    t.expect(view.getController() instanceof conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController).toBe(true);
                    t.expect(view.getViewModel() instanceof conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel).toBe(true);

                    // components
                    t.expect(view.down("cn_mail-mailmessageeditorattachmentlist") instanceof conjoon.cn_mail.view.mail.message.editor.AttachmentList).toBe(true);
                    t.expect(view.down("#showCcBccButton") instanceof Ext.Button).toBe(true);
                    t.expect(view.down("#toField") instanceof conjoon.cn_mail.view.mail.message.editor.AddressField).toBe(true);
                    t.expect(view.down("#ccField") instanceof conjoon.cn_mail.view.mail.message.editor.AddressField).toBe(true);
                    t.expect(view.down("#bccField") instanceof conjoon.cn_mail.view.mail.message.editor.AddressField).toBe(true);
                    t.expect(view.down("#subjectField") instanceof Ext.form.field.Text).toBe(true);
                    t.expect(view.down("cn_mail-mailmessageeditorhtmleditor") instanceof conjoon.cn_mail.view.mail.message.editor.HtmlEditor).toBe(true);

                    t.expect(view.down("#attachmentListWrap") instanceof Ext.Container).toBe(true);

                    t.expect(view.down("cn_mail-mailmessageeditorattachmentlist").getEditMode()).toBe("CREATE");
                    t.expect(view.editMode).toBe("CREATE");

                });

                //
                // since conjoon/app-cn_mail/1 the attachmentList is always visible
                //
                t.it("Should create with empty messageItem and show/hide attachmentList properly", function (t) {
                    view = createWithViewConfig(viewConfig);

                    // wait for bindings
                    t.waitForMs(500, function () {
                        t.expect(view.down("cn_mail-mailmessageeditorattachmentlist").isHidden()).toBe(false);
                        view.down("cn_mail-mailmessageeditorattachmentlist").getStore().add({text: "dummfile"});
                        t.expect(view.down("cn_mail-mailmessageeditorattachmentlist").isHidden()).toBe(false);
                        view.down("cn_mail-mailmessageeditorattachmentlist").getStore().removeAll();
                        t.expect(view.down("cn_mail-mailmessageeditorattachmentlist").isHidden()).toBe(false);
                    });
                });


                t.it("Should return default subject for emptyMessage", function (t) {
                    view = createWithViewConfig(viewConfig);
                    // wait for bindings
                    t.waitForMs(500, function () {
                        t.expect(view.getTitle().toLowerCase()).toBe("(no subject)");
                    });
                });

                // +---------------------------------------------------------------------------
                // | CONSTRUCTOR CHECKS
                // +---------------------------------------------------------------------------
                t.it("Should create empty message with specified to-address (string)", function (t) {
                    var messageDraftConfig = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                        to: "name@domain.tld"
                    });
                    view = createWithViewConfig({
                        editMode: "CREATE",
                        renderTo: document.body,
                        messageDraft: messageDraftConfig
                    });

                    t.waitForMs(500, function () {
                        checkConstructorCreateWithAddress(["name@domain.tld"], t, view);
                    });
                });

                t.it("Should create empty message with specified to-address (array, 1)", function (t) {
                    var messageDraftConfig = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                        to: [{name: "Peter", address: "name@domain.tld"}]
                    });
                    view = createWithMessageConfig(messageDraftConfig, "CREATE");

                    t.waitForMs(500, function () {
                        checkConstructorCreateWithAddress(["name@domain.tld"], t, view);
                    });
                });

                t.it("Should create empty message with specified to-address (array, 2)", function (t) {
                    var messageDraftConfig = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                        to: [
                            {name: "Peter", address: "name@domain.tld"},
                            {name: "Peter2", address: "name2@domain.tld"}
                        ]
                    });
                    view = createWithMessageConfig(messageDraftConfig, "CREATE");

                    t.waitForMs(500, function () {
                        checkConstructorCreateWithAddress(
                            ["name@domain.tld", "name2@domain.tld"], t, view);
                    });
                });


                t.it("Should throw exception when called with viewModel and messageDraft", function (t) {
                    var messageDraftConfig = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                        to: [
                            {name: "Peter", address: "name@domain.tld"},
                            {name: "Peter2", address: "name2@domain.tld"}
                        ]
                    });
                    var exc = undefined;
                    try {
                        view = createWithViewConfig({
                            viewModel: {data: {foo: "bar"}},
                            messageDraft: messageDraftConfig,
                            editMode: "CREATE"
                        });
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).not.toBeUndefined();
                    t.expect(exc.msg).toContain("Cannot set");
                });


                t.it("Should be okay when called with viewConfig", function (t) {

                    var exc = undefined;
                    try {
                        view = createWithViewConfig({
                            messageDraft: {},
                            viewModel: {data: {foo: "bar"}}
                        });
                    } catch (e) {
                        exc = e;
                    }

                    t.expect(exc).not.toBeUndefined();
                    t.expect(exc.msg).toContain("Cannot set");
                });

                t.it("Should create message with to, cc, bcc, subject and textHtml", function (t) {
                    var messageDraftConfig = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                        to: [
                            {name: "Peter", address: "name@domain.tld"},
                            {name: "Peter2", address: "name2@domain.tld"}
                        ],
                        cc: "cc@ccdomain.tld",
                        bcc: "bcc@bccdomain.tld",
                        subject: "foo",
                        textHtml: "bar"
                    });
                    view = createWithMessageConfig(messageDraftConfig, "CREATE");

                    t.waitForMs(500, function () {
                        t.expect(view.down("cn_mail-mailmessageeditorhtmleditor").getValue()).toBe("bar");

                        t.expect(view.down("#toField").getValue()).toEqual(["name@domain.tld", "name2@domain.tld"]);

                        expectCcsHidden(false, t, view);

                        t.expect(view.down("#ccField").getValue()).toEqual(["cc@ccdomain.tld"]);
                        t.expect(view.down("#bccField").getValue()).toEqual(["bcc@bccdomain.tld"]);
                        t.expect(view.down("#subjectField").getValue()).toBe("foo");
                    });
                });

                // +---------------------------------------------------------------------------
                // | initComponent Check
                // +---------------------------------------------------------------------------

                t.it("Should throw exception when called with items without attachmentList", function (t) {

                    var exc = undefined;
                    try {
                        view = createWithViewConfig({
                            messageDraft: createKeyForExistingMessage(1),
                            items: [{xtype: "panel"}]
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

                t.it("Should test showCcBccFields properly", function (t) {

                    view = createWithViewConfig(viewConfig);

                    // give the ViewModel bindings some time
                    t.waitForMs(500, function () {
                        t.expect(view.down("#ccField").isHidden()).toBe(true);
                        t.expect(view.down("#bccField").isHidden()).toBe(true);
                        t.expect(view.showCcBccFields(true)).toBe(view);
                        t.expect(view.down("#ccField").isHidden()).toBe(false);
                        t.expect(view.down("#bccField").isHidden()).toBe(false);
                        t.expect(view.showCcBccFields()).toBe(view);
                        t.expect(view.down("#ccField").isHidden()).toBe(false);
                        t.expect(view.down("#bccField").isHidden()).toBe(false);
                        t.expect(view.showCcBccFields(false)).toBe(view);
                        t.expect(view.down("#ccField").isHidden()).toBe(true);
                        t.expect(view.down("#bccField").isHidden()).toBe(true);
                        view.showCcBccFields();
                        t.expect(view.down("#ccField").isHidden()).toBe(false);
                        t.expect(view.down("#bccField").isHidden()).toBe(false);
                    });

                });


                //  +---------------------------------------------------------------------------
                //  | CC / BCC FIELD BEHAVIOR
                //  +---------------------------------------------------------------------------

                t.it("Should load message from backend", function (t) {
                    // anything but 1 returns cc/bcc which is needed for this test
                    view = createWithMessageConfig(createKeyForExistingMessage(2));

                    t.waitForMs(500, function () {
                        t.expect(view.editMode).toBe("EDIT");
                        t.expect(view.down("cn_mail-mailmessageeditorattachmentlist").getEditMode()).toBe("EDIT");
                        t.expect(view.down("cn_mail-mailmessageeditorhtmleditor").getValue()).toBeTruthy();

                        t.expect(view.down("#toField").getValue().length).toBe(2);

                        expectCcsHidden(false, t, view);

                        t.expect(view.down("#ccField").getValue().length).toBe(2);
                        t.expect(view.down("#bccField").getValue().length).toBe(2);
                    });
                });

                t.it("Should load message from backend and not hide cc/bcc if fields are cleared", function (t) {
                    view = createWithMessageConfig(createKeyForExistingMessage(2));

                    t.waitForMs(750, function () {
                        t.expect(view.editMode).toBe("EDIT");
                        t.expect(view.down("cn_mail-mailmessageeditorhtmleditor").getValue()).toBeTruthy();

                        t.expect(view.down("#toField").getValue().length).toBe(2);

                        expectCcsHidden(false, t, view);

                        view.getViewModel().set("messageDraft.cc", []);
                        view.getViewModel().set("messageDraft.bcc", []);

                        t.waitForMs(500, function () {
                            t.expect(view.down("#ccField").getValue().length).toBe(0);
                            t.expect(view.down("#bccField").getValue().length).toBe(0);

                            expectCcsHidden(false, t, view);
                        });

                    });
                });


                t.it("Should load message from backend and showHide ccbcc button depending on the values of the cc bcc fields", function (t) {
                    view = createWithMessageConfig(createKeyForExistingMessage(2));

                    t.waitForMs(500, function () {
                        t.expect(view.editMode).toBe("EDIT");
                        t.expect(view.down("cn_mail-mailmessageeditorhtmleditor").getValue()).toBeTruthy();

                        t.expect(view.down("#toField").getValue().length).toBe(2);

                        t.expect(view.down("#showCcBccButton").isHidden()).toBe(true);

                        view.getViewModel().set("messageDraft.cc", []);
                        view.getViewModel().set("messageDraft.bcc", []);

                        t.waitForMs(500, function () {
                            t.expect(view.down("#showCcBccButton").isHidden()).toBe(false);
                        });

                    });
                });


                t.it("Should load message from backend, cc and bcc field hidden", function (t) {

                    view = createWithMessageConfig(createKeyForExistingMessage(1));

                    t.waitForMs(500, function () {
                        expectCcsHidden(true, t, view);

                        t.expect(view.down("#ccField").getValue().length).toBe(0);
                        t.expect(view.down("#bccField").getValue().length).toBe(0);
                    });
                });

                t.it("Typing into cc/bcc field and then click showCcBccButton should not add value (createNewOnBlur setting)", function (t) {

                    view = createWithViewConfig(viewConfig);

                    t.waitForMs(TIMEOUT, function () {
                        expectCcsHidden(true, t, view);

                        view.down("#showCcBccButton").setUI("default");
                        t.click(view.down("#showCcBccButton"), function () {
                            expectCcsHidden(false, t, view);
                            view.down("#ccField").focus();
                            view.down("#ccField").el.dom.getElementsByTagName("input")[0].value = "aaaaaaaaaaaaa";
                            t.click(view.down("#showCcBccButton"), function () {
                                expectCcsHidden(true, t, view);
                                t.expect(view.down("#showCcBccButton").isHidden()).toBe(false);
                            });
                        });
                    });
                });


                t.it("closable mvvm", function (t) {
                    view = createWithViewConfig(viewConfig);
                    t.waitForMs(200, function () {
                        t.expect(view.getClosable()).toBe(true);

                        view.getViewModel().set("isSaving", true);
                        t.waitForMs(200, function () {
                            t.expect(view.getClosable()).toBe(false);
                            view.getViewModel().set("isSaving", false);
                            t.waitForMs(200, function () {
                                t.expect(view.getClosable()).toBe(true);
                                view.getViewModel().set("isSending", true);
                                t.waitForMs(200, function () {
                                    t.expect(view.getClosable()).toBe(false);
                                    view.getViewModel().set("isSending", false);
                                    t.waitForMs(200, function () {
                                        t.expect(view.getClosable()).toBe(true);
                                    });
                                });
                            });
                        });
                    });
                });


                t.it("iconCls mvvm", function (t) {
                    view = createWithViewConfig(viewConfig);
                    t.waitForMs(200, function () {
                        var iconCls = view.getIconCls();

                        t.expect(iconCls).toBeTruthy();

                        view.getViewModel().set("isSaving", true);
                        t.waitForMs(200, function () {
                            t.expect(view.getIconCls()).not.toBe(iconCls);
                            view.getViewModel().set("isSaving", false);
                            t.waitForMs(200, function () {
                                t.expect(view.getIconCls()).toBe(iconCls);
                                view.getViewModel().set("isSending", true);
                                t.waitForMs(200, function () {
                                    t.expect(view.getIconCls()).not.toBe(iconCls);
                                    view.getViewModel().set("isSending", false);
                                    t.waitForMs(200, function () {
                                        t.expect(view.getIconCls()).toBe(iconCls);
                                    });
                                });
                            });
                        });
                    });
                });


                t.it("setBusy()", function (t) {
                    view = createWithViewConfig(viewConfig);

                    t.expect(view.busyMask).toBeFalsy();

                    t.expect(view.setBusy(false)).toBe(view);
                    t.expect(view.busyMask).toBeFalsy();

                    var exc;
                    try {
                        view.setBusy("text");
                    } catch(e) {
                        exc = e;
                    }
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg).toContain("must either be");

                    view.setBusy({msgAction: "foo"});
                    t.isInstanceOf(view.busyMask, "coon.comp.component.LoadMask");
                    t.expect(view.busyMask).toBeTruthy();
                    t.expect(view.busyMask.isHidden()).toBe(false);

                    t.expect(view.setBusy(false)).toBe(view);
                    t.expect(view.busyMask).toBeTruthy();
                    t.expect(view.busyMask.isHidden()).toBe(true);

                    t.isCalledNTimes("loopProgress",    view.busyMask, 2);
                    t.isCalledNTimes("updateActionMsg", view.busyMask, 2);
                    t.isCalledNTimes("updateProgress",  view.busyMask, 1);
                    t.isCalledNTimes("updateMsg",       view.busyMask, 1);

                    t.expect(view.setBusy({msgAction: "text"})).toBe(view);
                    t.expect(view.busyMask).toBeTruthy();
                    t.expect(view.busyMask.isHidden()).toBe(false);

                    t.expect(view.setBusy({msg: "text"})).toBe(view);
                    t.expect(view.setBusy({msgAction: "text", progress: 1})).toBe(view);
                    t.expect(view.busyMask).toBeTruthy();
                    t.expect(view.busyMask.isHidden()).toBe(false);
                });


                t.it("showAddressMissingNotice()", function (t) {
                    let view = createWithViewConfig(viewConfig);

                    view.getViewModel().notify();

                    var iconCls = view.getIconCls();

                    t.expect(view.getClosable()).toBe(true);

                    t.click(view.down("#subjectField"), () => {

                        t.expect(view.down("#subjectField").hasFocus).toBe(true);

                        view.showAddressMissingNotice();

                        var okButton = Ext.dom.Query.select("span[data-ref=okButton]", view.el.dom);

                        var mask = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom);

                        t.expect(mask.length).toBe(1);
                        t.expect(okButton.length).toBe(1);
                        t.expect(okButton[0].parentNode.style.display).not.toBe("none");

                        t.expect(view.getIconCls()).not.toBe(iconCls);
                        t.expect(view.getClosable()).toBe(false);

                        t.click(okButton[0], function () {
                            t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);

                            t.expect(view.getIconCls()).toBe(iconCls);
                            t.expect(view.getClosable()).toBe(true);

                            t.expect(view.down("#toField").hasFocus).toBe(true);
                            view.hide();// destroying the view trigegrs error with Siesta 5.3.1,
                            // wrong implementation of overrides for parentNode.removeChild
                            // and synthetic mouse events?
                        });
                    });
                });


                t.it("showSubjectMissingNotice()", function (t) {
                    view = createWithViewConfig(viewConfig);

                    view.getViewModel().notify();

                    var VALUE, BUTTONID, SCOPE,
                        iconCls = view.getIconCls(),
                        func    = function (btnId, value) {
                            SCOPE    = this;
                            VALUE    = value;
                            BUTTONID = btnId;
                        };
                    t.expect(view.getClosable()).toBe(true);

                    view.showSubjectMissingNotice(view.getViewModel().get("messageDraft"), func);

                    var okButton     = Ext.dom.Query.select("span[data-ref=okButton]", view.el.dom),
                        cancelButton = Ext.dom.Query.select("span[data-ref=cancelButton]", view.el.dom),
                        mask         = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom),
                        inputField   = Ext.dom.Query.select("input[type=text]", mask);

                    t.expect(mask.length).toBe(1);
                    t.expect(okButton.length).toBe(1);
                    t.expect(okButton[0].parentNode.style.display).not.toBe("none");
                    t.expect(cancelButton.length).toBe(1);
                    t.expect(cancelButton[0].parentNode.style.display).not.toBe("none");
                    t.expect(inputField.length).toBe(1);
                    t.expect(inputField.length).toBe(1);
                    t.expect(inputField[0].value).toBeFalsy();

                    t.expect(view.getIconCls()).not.toBe(iconCls);
                    t.expect(view.getClosable()).toBe(false);

                    // OKBUTTON
                    inputField[0].value = "foobar";

                    t.click(okButton[0], function () {
                        t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);
                        t.expect(view.getIconCls()).toBe(iconCls);
                        t.expect(view.getClosable()).toBe(true);

                        t.expect(VALUE).toBe("foobar");
                        t.expect(BUTTONID).toBe("okButton");
                        t.expect(SCOPE).toBe(view);
                        view.getViewModel().notify();
                        t.expect(view.down("#subjectField").getValue()).toBe("foobar");

                        // CANCELBUTTON
                        VALUE    = "";
                        BUTTONID = "";
                        view.showSubjectMissingNotice(view.getViewModel().get("messageDraft"), func);

                        cancelButton = Ext.dom.Query.select("span[data-ref=cancelButton]", view.el.dom);
                        mask         = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom);
                        inputField   = Ext.dom.Query.select("input[type=text]", mask);

                        inputField[0].value = "SNAFU";
                        t.click(cancelButton[0], function () {
                            t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);
                            t.expect(view.getIconCls()).toBe(iconCls);
                            t.expect(view.getClosable()).toBe(true);

                            t.expect(VALUE).toBe("SNAFU");
                            t.expect(BUTTONID).toBe("cancelButton");
                            view.getViewModel().notify();
                            t.expect(view.down("#subjectField").getValue()).not.toBe("SNAFU");
                        });


                    });


                });


                t.it("showMailMessageSaveFailedNotice()", function (t) {
                    view = createWithViewConfig(viewConfig);

                    view.getViewModel().notify();

                    var BUTTONID, SCOPE,
                        iconCls = view.getIconCls(),
                        func    = function (btnId) {
                            SCOPE    = this;
                            BUTTONID = btnId;
                        };
                    t.expect(view.getClosable()).toBe(true);

                    view.showMailMessageSaveFailedNotice(view.getViewModel().get("messageDraft"), null, func);

                    var yesButton  = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom),
                        noButton   = Ext.dom.Query.select("span[data-ref=noButton]", view.el.dom),
                        mask       = Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom);

                    t.expect(mask.length).toBe(1);
                    t.expect(yesButton.length).toBe(1);
                    t.expect(yesButton[0].parentNode.style.display).not.toBe("none");
                    t.expect(noButton.length).toBe(1);
                    t.expect(noButton[0].parentNode.style.display).not.toBe("none");

                    t.expect(view.getIconCls()).not.toBe(iconCls);
                    t.expect(view.getClosable()).toBe(false);

                    // OKBUTTON
                    t.click(yesButton[0], function () {
                        t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);
                        t.expect(view.getIconCls()).toBe(iconCls);
                        t.expect(view.getClosable()).toBe(true);

                        t.expect(BUTTONID).toBe("yesButton");
                        t.expect(SCOPE).toBe(view);
                        view.getViewModel().notify();


                        // CANCELBUTTON
                        BUTTONID = "";
                        view.showMailMessageSaveFailedNotice(view.getViewModel().get("messageDraft"), null, func);

                        noButton = Ext.dom.Query.select("span[data-ref=noButton]", view.el.dom);

                        t.click(noButton[0], function () {
                            t.expect(Ext.dom.Query.select("div[class*=cn_comp-messagemask]", view.el.dom).length).toBe(0);
                            t.expect(view.getIconCls()).toBe(iconCls);
                            t.expect(view.getClosable()).toBe(true);

                            t.expect(BUTTONID).toBe("noButton");
                        });

                    });


                });


                t.it("showMessageDraftLoadingNotice()", function (t) {
                    view = createWithViewConfig(viewConfig);

                    t.expect(view.loadingMask).toBeTruthy();

                    t.waitForMs(750, function () {

                        t.expect(view.loadingMask).toBeFalsy();

                        view.showMessageDraftLoadingNotice();

                        t.isInstanceOf(view.loadingMask, "Ext.LoadMask");
                        t.expect(view.loadingMask.isHidden()).toBe(false);

                        t.isCalledOnce("destroy", view.loadingMask);
                        view.loadingMask.hide();
                        t.expect(view.loadingMask).toBe(null);

                    });

                });


                t.it("showMessageDraftLoadingNotice() - vm isMessageBodyLoading", function (t) {
                    Ext.ux.ajax.SimManager.init({
                        delay: 500
                    });

                    var modes = [
                            Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                                compoundKey: createKeyForExistingMessage(1),
                                editMode: "REPLY_TO",
                                defaultMailAccountId: "foo",
                                defaultMailFolderId: "bar"
                            }),
                            Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                                compoundKey: createKeyForExistingMessage(1),
                                editMode: "REPLY_ALL",
                                defaultMailAccountId: "foo",
                                defaultMailFolderId: "bar"
                            }),
                            Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                                compoundKey: createKeyForExistingMessage(1),
                                editMode: "FORWARD",
                                defaultMailAccountId: "foo",
                                defaultMailFolderId: "bar"
                            })
                        ],

                        func = function (t, i) {

                            if (!modes[i]) {
                                return;
                            }

                            let view = createWithMessageConfig(modes[i]);

                            t.expect(view.editMode).toBe(modes[i].getEditMode());

                            t.waitForMs(250, function () {
                                t.isInstanceOf(view.loadingMask, "Ext.LoadMask");
                                t.expect(view.loadingMask.isHidden()).toBe(false);
                                t.isCalledOnce("destroy", view.loadingMask);

                                t.waitForMs(1500, function () {
                                    t.expect(view.loadingMask).toBe(null);
                                    view.hide();// destroying the view trigegrs error with Siesta 5.3.1,
                                    // wrong implementation of overrides for parentNode.removeChild
                                    // and synthetic mouse events?
                                    view = null;
                                    func(t, ++i);
                                });
                            });

                        };


                    func(t, 0);

                });


                t.it("getMessageDraft()", function (t){
                    Ext.ux.ajax.SimManager.init({
                        delay: 1
                    });

                    view = createWithViewConfig(viewConfig);

                    t.waitForMs(250, function () {

                        t.expect(view.getMessageDraft()).toBeTruthy();
                        t.expect(view.getMessageDraft()).toBe(view.getViewModel().get("messageDraft"));

                    });
                });


                t.it("confirmDialogMask mixin", function (t){
                    Ext.ux.ajax.SimManager.init({
                        delay: 1
                    });

                    view = createWithViewConfig(viewConfig);

                    t.expect(view.mixins.deleteConfirmDialog.$className).toBe("conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog");
                    t.expect(view.canCloseAfterDelete).toBe(true);
                });


                t.it("app-cn_mail#65", function (t) {

                    let item  = createMessageItem(1, "INBOX.Drafts"),
                        editor;


                    item.loadAttachments();

                    t.waitForMs(750, function () {

                        t.expect(item.attachments().getRange().length).toBeGreaterThan(0);


                        editor = createWithMessageConfig(item.getCompoundKey());


                        t.waitForMs(750, function () {

                            t.expect(editor.getViewModel().get("messageDraft.attachments").getRange().length).toBeGreaterThan(0);

                            editor.destroy();
                            editor = null;

                        });


                    });
                });


                t.it("app-cn_mail#67", function (t) {

                    let item  = createMessageItem(1, "INBOX.Drafts"),
                        editor;


                    item.loadAttachments();

                    t.waitForMs(750, function () {

                        t.expect(item.attachments().getRange().length).toBeGreaterThan(0);


                        editor = createWithMessageConfig(item.getCompoundKey());

                        let store = Ext.create(
                            "conjoon.cn_mail.store.mail.folder.MailFolderTreeStore"
                        );
                        store.load();
                        editor.getViewModel().set("cn_mail_mailfoldertreestore", store);

                        t.waitForMs(750, function () {

                            let prev = editor.getViewModel().get("messageDraft.attachments").getRange().length;
                            t.expect(prev).toBeGreaterThan(0);

                            editor.getViewModel().get("messageDraft.attachments").removeAt(0);

                            let newCount = editor.getViewModel().get("messageDraft.attachments").getRange().length;
                            t.expect(newCount).toBe(prev - 1);

                            editor.getController().configureAndStartSaveBatch();


                            t.waitForMs(750, function () {

                                editor.destroy();
                                editor = null;

                            });


                        });


                    });
                });


                t.it("app-cn_mail#66 - loadingFailedDialog mixin", function (t){
                    Ext.ux.ajax.SimManager.init({
                        delay: 1
                    });

                    view = createWithViewConfig(viewConfig);

                    t.expect(view.mixins.loadingFailedDialog.$className).toBe("conjoon.cn_mail.view.mail.mixin.LoadingFailedDialog");

                });


                t.it("app-cn_mail#66 - isDraftLoading()", function (t){
                    Ext.ux.ajax.SimManager.init({
                        delay: 1
                    });

                    view = createWithViewConfig(viewConfig);

                    let vm = view.getViewModel();

                    t.expect(view.isDraftLoading()).toBe(false);

                    vm.set("isMessageBodyLoading", true);

                    t.expect(view.isDraftLoading()).toBe(true);

                    vm.set("isMessageBodyLoading", false);

                    t.expect(view.isDraftLoading()).toBe(false);


                    vm.pendingCopyRequest = {};
                    t.expect(view.isDraftLoading()).toBe(true);
                    vm.pendingCopyRequest = null;

                    t.expect(view.isDraftLoading()).toBe(false);

                    vm.loadingDraft = {};

                    t.expect(view.isDraftLoading()).toBe(true);

                });


                t.it("app-cn_mail#66 - hasLoadingFailed()", function (t) {
                    view = createWithViewConfig(viewConfig);

                    let vm = view.getViewModel();

                    t.expect(view.hasLoadingFailed()).toBe(false);

                    vm.loadingFailed = true;

                    t.expect(view.hasLoadingFailed()).toBe(true);

                });


                t.it("app-cn_mail#66 - showLoadingFailedDialog()", function (t) {
                    view = createWithViewConfig(viewConfig);


                    t.expect(view.getClosable()).toBe(false);

                    view.showLoadingFailedDialog();

                    t.expect(view.getClosable()).toBe(true);

                });


                t.it("app-cn_mail#39 - combobox with default value", function (t) {

                    view = createWithViewConfig(viewConfig);

                    let combo = view.down("#accountCombo");

                    t.expect(combo).toBeTruthy();

                    t.waitForMs(750, function () {

                        t.expect(view.getViewModel().get("messageDraft.mailAccountId")).toBeTruthy();

                        t.expect(combo.getValue()).toBe(view.getViewModel().get("messageDraft.mailAccountId"));

                    });

                });


            });});});});
