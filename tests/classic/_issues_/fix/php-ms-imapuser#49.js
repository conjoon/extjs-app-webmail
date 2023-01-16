/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

import TestHelper from "/tests/lib/mail/TestHelper.js";

StartTest(async t => {

    const helper =  l8.liquify(TestHelper.get(t, window));
    await helper.setupSimlets().mockUpMailTemplates()
        .load("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController")
        .andRun((t) => {

            t.requireOk("conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey", () => {

                let view,
                    createWithViewConfig = function (config) {
                        return Ext.create(
                            "conjoon.cn_mail.view.mail.message.editor.MessageEditor", config);
                    };

                t.afterEach(function () {
                    registerMailAccountRelatedFunctionalitySpy.remove();
                    registerMailAccountRelatedFunctionalitySpy = null;
                    if (view) {
                        view.destroy();
                        view = null;
                    }
                });

                let registerMailAccountRelatedFunctionalitySpy;

                t.beforeEach(t => {
                    registerMailAccountRelatedFunctionalitySpy = t.spyOn(
                        conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController.prototype,
                        "registerMailAccountRelatedFunctionality"
                    ).and.callFake(() => {});

                    Ext.ux.ajax.SimManager.init({
                        delay: 1
                    });
                });


                t.it("seen/flag buttons", t => {

                    const mdConfig = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig");

                    view = createWithViewConfig({
                        renderTo: document.body,
                        width: 400,
                        height: 400,
                        messageDraft: mdConfig
                    });

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        const
                            md = view.getViewModel().get("messageDraft"),
                            flagButton = view.down("button[cls=flagButton]"),
                            seenButton = view.down("button[cls=seenButton]");


                        t.expect(seenButton.pressed).toBe(true);
                        t.expect(flagButton.pressed).toBe(false);

                        md.set("seen", false);
                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(seenButton.pressed).toBe(false);

                            md.set("flagged", true);
                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(flagButton.pressed).toBe(true);

                                // is: false
                                seenButton.toggle();
                                // is: true
                                flagButton.toggle();

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(md.get("seen")).toBe(true);
                                    t.expect(md.get("flagged")).toBe(false);
                                });

                            });
                        });
                    });
                });


                t.it("MessageDraft critical fields seen/flagged", t => {
                    const draft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft");

                    t.expect(draft.getField("seen").critical).toBe(true);
                    t.expect(draft.getField("flagged").critical).toBe(true);

                });


                t.it("lastSavedMessage", t => {

                    const mdConfig = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig");

                    view = createWithViewConfig({
                        renderTo: document.body,
                        width: 400,
                        height: 400,
                        messageDraft: mdConfig
                    });

                    t.expect(view.down("displayfield[cls=lastSavedDateField]").bind.value.stub.name).toBe("lastSavedMessage");

                    let viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                        messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig"),
                        session: Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession")
                    });

                    var formulas = viewModel.getFormulas();

                    viewModel.get("messageDraft").pantom = true;
                    viewModel.set("messageDraft.savedAt", "");

                    t.expect(formulas.lastSavedMessage).toBeDefined();
                    t.expect(formulas.lastSavedMessage.bind.date).toBe("{messageDraft.savedAt}");

                    t.expect(
                        formulas.lastSavedMessage.get({
                            date: viewModel.get("messageDraft.savedAt")
                        })
                    /**
                     * @i18n
                     */
                    ).toBe("Opened for editing");

                    viewModel.set("messageDraft.savedAt", new Date());

                    t.expect(
                        formulas.lastSavedMessage.get({
                            date: viewModel.get("messageDraft.savedAt")
                        })
                    /**
                     * @i18n
                     */
                    ).toContain("Last saved at");

                });

            });});});
