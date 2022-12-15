/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.registerIoC().setupSimlets().mockUpMailTemplates().load(
        "conjoon.cn_mail.data.mail.message.EditingModes",
        "conjoon.cn_mail.data.mail.BaseSchema",
        "coon.core.data.Session",
        "conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel"
    ).andRun((t) => {


        var viewModel;

        var view,
            createKey = function (id1, id2, id3) {
                return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
            },
            getMessageItemAt = function (messageIndex) {
                return conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(messageIndex);
            },
            getFirstAttachmentIndex = function (){
                let item;
                for (let i = 0, len = 100; i < len; i++) {
                    item = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(i);
                    if (item.hasAttachments) {
                        return i;
                    }
                }

                return -1;
            },
            createKeyForExistingMessage = function (messageIndex){
                let item = conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(messageIndex);

                let key = createKey(
                    item.mailAccountId, item.mailFolderId, item.id
                );

                return key;
            },
            createSession = function () {
                return Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession");
            },
            createWithSession = function () {
                return Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                    messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig"),
                    session: createSession()
                });
            },
            testEditorMode = function (t, editMode) {
                view = Ext.create("Ext.Panel");
                let messageIndex = 1;
                var draft;
                for (let i = 1, len = conjoon.dev.cn_mailsim.data.table.MessageTable.ITEM_LENGTH; i < len; i++) {
                    let item = getMessageItemAt(i);
                    if (item.hasAttachments) {
                        messageIndex = i;
                        draft = conjoon.cn_mail.model.mail.message.MessageDraft.loadEntity(createKeyForExistingMessage(i));
                        break;
                    }
                }

                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                    view: view,
                    session: createSession(),
                    messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                        editMode: editMode,
                        compoundKey: createKeyForExistingMessage(messageIndex),
                        defaultMailAccountId: "foo",
                        defaultMailFolderId: "bar"
                    })
                });


                t.waitForMs(t.parent.TIMEOUT, () => {
                    var body = draft.loadMessageBody();
                    draft.loadAttachments();
                    t.waitForMs(t.parent.TIMEOUT, () => {
                        var attachments = draft.attachments().getRange();
                        var messageDraft = viewModel.get("messageDraft");
                        var messageBody  = viewModel.get("messageDraft.messageBody");

                        t.expect(messageDraft).not.toBe(draft);
                        t.expect(messageBody).not.toBe(body);

                        t.expect(messageDraft).toBeDefined();
                        t.expect(messageDraft.phantom).toBe(true);
                        t.expect(messageDraft.getId()).not.toBe(draft.getId());

                        t.expect(messageBody).toBeDefined();
                        t.expect(messageBody.phantom).toBe(true);
                        t.expect(messageBody.getId()).not.toBe(body.getId());

                        t.expect(messageDraft.get("subject")).toContain(draft.get("subject"));

                        if (editMode !== conjoon.cn_mail.data.mail.message.EditingModes.FORWARD) {
                            t.expect(messageDraft.get("to")[0].name).toBe(draft.get("from").name);
                            t.expect(messageDraft.get("to")[0].address).toBe(draft.get("from").address);
                        }
                        t.expect(messageBody.get("textHtml")).toContain(body.get("textHtml"));

                        // only Forwarded mails have their attachments copied.
                        // this should be put into a separate test class dealing
                        // with the copier, but we'll leave it in here for now
                        if (editMode === conjoon.cn_mail.data.mail.message.EditingModes.FORWARD) {
                            var draftAttachments = messageDraft.attachments().getRange();
                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(attachments.length).toBe(draftAttachments.length);
                                t.expect(attachments.length).toBeGreaterThan(0);

                                for (var i = 0, len = draftAttachments.length; i < len; i++) {
                                    t.expect(draftAttachments[i].getId()).not.toBe(attachments[i].getId());
                                    var cmp1 = Ext.copy({}, draftAttachments[i].data, "sourceId,size,text,type");
                                    var cmp2 = Ext.copy({}, attachments[i].data, "sourceId,size,text,type");
                                    t.expect(cmp1).toEqual(cmp2);
                                }

                            });
                        } else {
                            t.expect(messageDraft.attachments().getRange().length).toBe(0);
                        }

                    }) ;
                });
            };

        t.afterEach(function () {
            if (viewModel) {
                viewModel.destroy();
                viewModel = null;
            }

            if (view) {
                view.destroy();
                view = null;
            }

            Ext.ux.ajax.SimManager.init({
                delay: 1
            });


        });


        t.requireOk("conjoon.cn_mail.data.mail.message.EditingModes", function (){
            t.requireOk("conjoon.cn_mail.data.mail.BaseSchema", function (){
                t.requireOk("coon.core.data.Session", function (){
                    t.requireOk("conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor", function (){
                        t.requireOk("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", () => {

                            t.it("constructor() - exception", t => {

                                var exc,
                                    cls = "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel";

                                try {Ext.create(cls);} catch (e) {exc = e;}
                                t.expect(exc).toBeDefined();
                                t.expect(exc.msg).toContain("must be set");

                                exc = undefined;

                                try {Ext.create(cls, {});} catch (e) {exc = e;}
                                t.expect(exc).toBeDefined();
                                t.expect(exc.msg).toContain("must be set");

                                try {Ext.create(cls, {messageDraft: 1});} catch (e) {exc = e;}
                                t.expect(exc).toBeDefined();
                                t.expect(exc.msg).toContain("MessageDraftSession");


                                try {Ext.create(cls, {
                                    messageDraft: 1,
                                    session: createSession()
                                });} catch (e) {exc = e;}
                                t.expect(exc).toBeDefined();
                                t.expect(exc.msg).toContain("must either be an instance");

                            });


                            t.it("constructor() - messageDraft is messageDraftConfig", t => {

                                t.isCalledOnce("createDraftFromData", conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype);

                                Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: createSession(),
                                    messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig")
                                });

                            });


                            t.it("constructor() - messageDraft is MessageDraftCopyRequest", t => {

                                Ext.ux.ajax.SimManager.init({
                                    delay: Math.max(1, t.parent.TIMEOUT - 1000)
                                });

                                t.isCalledOnce("onMessageDraftCopyLoad", conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype);
                                t.isCalled("processPendingCopyRequest", conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype);

                                let exc, tmp = conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView;
                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = function (){return{fireEvent: Ext.emptyFn};};

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: createSession(),
                                    messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                                        compoundKey: createKeyForExistingMessage(1),
                                        editMode: conjoon.cn_mail.data.mail.message.EditingModes.FORWARD,
                                        defaultMailAccountId: "foo",
                                        defaultMailFolderId: "bar"
                                    })
                                });
                                viewModel.createDraftFromData = Ext.emptyFn;
                                t.expect(viewModel.hasPendingCopyRequest()).toBe(false);

                                try{viewModel.processPendingCopyRequest();}catch(e){exc=e;}
                                t.expect(exc.msg).toBeDefined();
                                t.expect(exc.msg).toContain("is not available");

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.isInstanceOf(viewModel.messageDraftCopier, conjoon.cn_mail.data.mail.message.editor.MessageDraftCopier);
                                    conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = tmp;

                                });

                            });


                            t.it("constructor() - MessageDraftCopyRequest is not properly configured", t => {

                                t.isntCalled("onMessageDraftCopyLoad", conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype);

                                let request = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                                        compoundKey: createKeyForExistingMessage(1),
                                        editMode: conjoon.cn_mail.data.mail.message.EditingModes.FORWARD
                                    }), exc;

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: createSession(),
                                    messageDraft: request
                                });

                                t.expect(viewModel.hasPendingCopyRequest()).toBe(true);
                                t.expect(viewModel.pendingCopyRequest).toBe(request);

                                try{viewModel.processPendingCopyRequest();}catch(e){exc=e;}
                                t.expect(exc.msg).toBeDefined();
                                t.expect(exc.msg).toContain("is not properly configured");

                                try{viewModel.processPendingCopyRequest("foo");}catch(e){exc=e;}
                                t.expect(exc.msg).toBeDefined();
                                t.expect(exc.msg).toContain("is not properly configured");

                                try{viewModel.processPendingCopyRequest(null, "foo");}catch(e){exc=e;}
                                t.expect(exc.msg).toBeDefined();
                                t.expect(exc.msg).toContain("is not properly configured");
                            });


                            t.it("constructor() - MessageDraftCopyRequest is not properly configured, processing manually", t => {

                                t.isCalled("onMessageDraftCopyLoad", conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype);

                                const messageIndex = getFirstAttachmentIndex();

                                let request = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest", {
                                    compoundKey: createKeyForExistingMessage(messageIndex),
                                    editMode: conjoon.cn_mail.data.mail.message.EditingModes.FORWARD
                                });

                                let tmp = conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView;
                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = function (){return{fireEvent: Ext.emptyFn};};

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: createSession(),
                                    messageDraft: request
                                });

                                t.expect(viewModel.hasPendingCopyRequest()).toBe(true);
                                t.expect(viewModel.pendingCopyRequest).toBe(request);

                                viewModel.processPendingCopyRequest("foo", "bar");

                                t.expect(viewModel.hasPendingCopyRequest()).toBe(false);

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(viewModel.get("messageDraft").get("mailAccountId")).toBe("foo");
                                    t.expect(viewModel.get("messageDraft").get("mailFolderId")).toBe("bar");
                                    conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = tmp;

                                });

                            });


                            t.it("constructor() - messageDraft is compound key", t => {

                                let index = 1;

                                let tmp = conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView;
                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = function (){return{fireEvent: Ext.emptyFn};};

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: createSession(),
                                    messageDraft: createKeyForExistingMessage(index)
                                });

                                let messageItem = getMessageItemAt(index);

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(viewModel.get("messageDraft").get("id")).toBe(messageItem.id);
                                    t.expect(viewModel.get("messageDraft").get("mailAccountId")).toBe(messageItem.mailAccountId);
                                    t.expect(viewModel.get("messageDraft").get("mailFolderId")).toBe(messageItem.mailFolderId);

                                    conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = tmp;

                                });

                            });


                            t.it("createDraftFromData()", t => {

                                viewModel = createWithSession(false);

                                var exc;

                                try{viewModel.createDraftFromData();} catch(e){exc = e;}
                                t.expect(exc).toBeDefined();
                                t.expect(exc.msg).toContain("must be an instance of");

                                var c = Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                                    subject: "SUBJECT",
                                    textHtml: "TEXTHTML"
                                });
                                t.isCalledOnce("toObject", c);
                                t.isCalledOnce("linkTo", viewModel);

                                // force reset of private property
                                viewModel.getSession()._messageDraft = undefined;
                                viewModel.createDraftFromData(c);

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(viewModel.get("messageDraft.subject")).toBe("SUBJECT");
                                    t.expect(viewModel.get("messageDraft.messageBody.textHtml")).toBe("TEXTHTML");
                                });

                            });


                            t.it("onMessageDraftCopyLoad()", t => {

                                let tmp = conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView;
                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = function (){return{fireEvent: Ext.emptyFn};};

                                viewModel = createWithSession();

                                // force reset of private property
                                viewModel.getSession()._messageDraft = undefined;
                                t.isCalledOnce("createDraftFromData", viewModel);

                                viewModel.onMessageDraftCopyLoad(null, Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig"));

                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = tmp;

                            });


                            t.it("Should create the ViewModel", t => {
                                viewModel = createWithSession();

                                t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);
                                t.expect(viewModel.emptySubjectText).toBeDefined();
                                t.expect(viewModel.alias).toContain("viewmodel.cn_mail-mailmessageeditorviewmodel");

                                t.expect(viewModel.get("isSaving")).toBe(false);
                                t.expect(viewModel.get("isSending")).toBe(false);
                                t.expect(viewModel.get("isSubjectRequired")).toBe(true);

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    var formulas = viewModel.getFormulas(),
                                        expected = [
                                            "addressStoreData", "getBcc", "getCc",
                                            "getSubject", "getTo", "isCcOrBccValueSet", "isMessageBodyLoading",
                                            "isAccountAndFolderSet", "isPhantom", "lastSavedMessage"
                                        ],
                                        expectedCount = expected.length,
                                        count = 0;

                                    for (var i in formulas) {
                                        t.expect(expected).toContain(i);
                                        count++;
                                    }
                                    t.expect(count).toBe(expectedCount);

                                    t.expect(viewModel.getStore("addressStore")).toBeDefined();
                                    t.expect(viewModel.getStore("addressStore").getModel().getName()).toBe(
                                        "conjoon.cn_mail.model.mail.message.EmailAddress");
                                    t.expect(viewModel.get("messageDraft")).toBeDefined();
                                    t.expect(viewModel.get("messageDraft").phantom).toBe(true);
                                });
                            });


                            t.it("Should create the ViewModel with data from the backend", t => {

                                let tmp = conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView;
                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = function (){return{fireEvent: Ext.emptyFn};};


                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: createSession(),
                                    messageDraft: createKeyForExistingMessage(1)
                                });

                                let item = getMessageItemAt(1);

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(viewModel.get("messageDraft")).toBeDefined();
                                    t.expect(viewModel.get("messageDraft").phantom).toBe(false);
                                    t.expect(viewModel.get("messageDraft").get("id")).toBe(item.id);

                                    conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = tmp;

                                });
                            });


                            t.it("Should make sure that getAddressValuesFromDraft works properly", t => {
                                viewModel = createWithSession();

                                var addresses = [{
                                        address: "a",
                                        name: "a"
                                    }, {
                                        address: "b",
                                        name: "b"
                                    }],
                                    expected = ["a", "b"];

                                t.expect(viewModel.getAddressValuesFromDraft("to", {to: addresses})).toEqual(expected);
                                t.expect(viewModel.getAddressValuesFromDraft("cc", {cc: addresses})).toEqual(expected);
                                t.expect(viewModel.getAddressValuesFromDraft("bcc", {bcc: addresses})).toEqual(expected);
                                t.expect(viewModel.getAddressValuesFromDraft("to", {bcc: addresses})).toEqual([]);
                            });


                            t.it("Should make sure that setAddressesForDraft works properly", t => {
                                viewModel = createWithSession();

                                var addresses = [{
                                        address: "a",
                                        name: "foo"
                                    }, {
                                        address: "b",
                                        name: "bar"
                                    }],
                                    values   = ["a", "b", "c"],
                                    expected = [{
                                        address: "a",
                                        name: "foo"
                                    }, {
                                        address: "b",
                                        name: "bar"
                                    }, {
                                        address: "c",
                                        name: "c"
                                    }];

                                t.waitForMs(t.parent.TIMEOUT, () => {

                                    t.expect(viewModel.get("messageDraft.to")).toEqual([]);
                                    t.expect(viewModel.get("messageDraft.cc")).toEqual([]);
                                    t.expect(viewModel.get("messageDraft.bcc")).toEqual([]);

                                    viewModel.getStore("addressStore").add(addresses);

                                    viewModel.setAddressesForDraft("to", values);
                                    viewModel.setAddressesForDraft("cc", values);
                                    viewModel.setAddressesForDraft("bcc", values);

                                    t.waitForMs(t.parent.TIMEOUT, () => {
                                        t.expect(viewModel.get("messageDraft.to")).toEqual(expected);
                                        t.expect(viewModel.get("messageDraft.cc")).toEqual(expected);
                                        t.expect(viewModel.get("messageDraft.bcc")).toEqual(expected);
                                    });

                                });
                            });


                            t.it("Should make sure that addressStoreDate works properly", t => {
                                viewModel = createWithSession();

                                var formulas = viewModel.getFormulas(),
                                    data     = {
                                        to: [{
                                            address: "a"
                                        }],
                                        cc: [{
                                            address: "b"
                                        }],
                                        bcc: [{
                                            address: "c"
                                        }]
                                    },
                                    expected = [{address: "a"}, {address: "b"}, {address: "c"}];

                                t.expect(formulas.addressStoreData.set).toBeUndefined();
                                t.expect(formulas.addressStoreData.single).toBe(true);
                                t.expect(formulas.addressStoreData.get(data)).toEqual(expected);
                            });


                            t.it("Should make sure that isCcOrBccValueSet works properly", t => {
                                viewModel = createWithSession();

                                var formulas = viewModel.getFormulas(),
                                    data     = {
                                        cc: [{
                                            address: "b"
                                        }],
                                        bcc: [{
                                            address: "c"
                                        }]
                                    };


                                t.expect(formulas.isCcOrBccValueSet.set).toBeUndefined();
                                t.expect(formulas.isCcOrBccValueSet.single).not.toBe(true);
                                t.expect(formulas.isCcOrBccValueSet.get(data)).toBe(true);

                                t.expect(formulas.isCcOrBccValueSet.get({})).toBe(false);
                                t.expect(formulas.isCcOrBccValueSet.get({
                                    cc: [{
                                        address: "b"
                                    }]
                                })).toBe(true);
                                t.expect(formulas.isCcOrBccValueSet.get({
                                    bcc: [{
                                        address: "b"
                                    }]
                                })).toBe(true);
                                t.expect(formulas.isCcOrBccValueSet.get({
                                    bcc: []
                                })).toBe(false);

                            });


                            t.it("Should make sure that getSubject works properly", t => {
                                viewModel = createWithSession();

                                var formulas       = viewModel.getFormulas(),
                                    defaultSubject = viewModel.emptySubjectText;

                                t.expect(formulas.getSubject.set).toBeDefined();
                                t.expect(formulas.getSubject.single).not.toBe(true);
                                t.expect(formulas.getSubject.get.apply(viewModel, [{}])).toBe(defaultSubject);
                                t.expect(formulas.getSubject.get.apply(viewModel, [{subject: ""}])).toBe(defaultSubject);

                                formulas.getSubject.set.apply(viewModel);
                                t.expect(viewModel.get("messageDraft.subject")).toBe(defaultSubject);
                                formulas.getSubject.set.apply(viewModel, ["test"]);
                                t.expect(viewModel.get("messageDraft.subject")).toBe("test");
                            });


                            t.it("Should make sure that isMessageBodyLoading works properly", t => {
                                viewModel = createWithSession();

                                var formulas = viewModel.getFormulas();

                                t.expect(formulas.isMessageBodyLoading).toBeDefined();
                                t.expect(formulas.isMessageBodyLoading.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);

                                viewModel.set(
                                    "messageDraft.messageBody",
                                    viewModel.getSession().createRecord("MessageBody", {prop: "foo"})
                                );

                                t.expect(formulas.isMessageBodyLoading.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);

                                viewModel.get("messageDraft.messageBody").loading = true;

                                t.expect(formulas.isMessageBodyLoading.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(true);

                            });


                            t.it("Should make sure that isAccountAndFolderSet works properly", t => {
                                viewModel = createWithSession();

                                var formulas = viewModel.getFormulas();

                                t.expect(formulas.isAccountAndFolderSet).toBeDefined();
                                t.expect(formulas.isAccountAndFolderSet.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);

                                viewModel.get("messageDraft").set("mailAccountId", "foo");

                                t.expect(formulas.isAccountAndFolderSet.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);

                                viewModel.get("messageDraft").set("mailFolderId", "bar");

                                t.expect(formulas.isAccountAndFolderSet.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(true);

                            });


                            t.it("Should make sure that isPhantom works properly", t => {
                                viewModel = createWithSession();

                                var formulas = viewModel.getFormulas();

                                viewModel.get("messageDraft").pantom = true;
                                viewModel.set("messageDraft.savedAt", "");

                                t.expect(formulas.isPhantom).toBeDefined();
                                t.expect(formulas.isPhantom.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(true);

                                viewModel.set("messageDraft.savedAt", new Date());

                                t.expect(formulas.isPhantom.apply(viewModel, [Ext.Function.bindCallback(viewModel.get, viewModel)])).toBe(false);
                            });


                            t.it("Should create the ViewModel with data from the backend - replyTo", t => {
                                testEditorMode(t, conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO);
                            });


                            t.it("Should create the ViewModel with data from the backend - replyAll", t => {
                                testEditorMode(t, conjoon.cn_mail.data.mail.message.EditingModes.REPLY_ALL);
                            });


                            t.it("Should create the ViewModel with data from the backend - forward", t => {
                                testEditorMode(t, conjoon.cn_mail.data.mail.message.EditingModes.FORWARD);
                            });


                            t.it("constructor() - messageDraft is compound key, but message cannot be found conjoon/extjs-app-webmail#64", t => {

                                let CK       = createKey(1, 2, 3),
                                    session  = createSession(),
                                    existing = createKeyForExistingMessage(1),
                                    draft;

                                let tmp = conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView;
                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = function (){
                                    return{fireEvent: Ext.emptyFn, showLoadingFailedDialog: Ext.emptyFn};};

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: session,
                                    messageDraft: CK
                                });


                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(viewModel.get("messageDraft")).toBeFalsy();
                                    t.expect(session.peekRecord("MessageDraft", CK.toLocalId())).toBeFalsy();


                                    let newVm = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                        session: session,
                                        messageDraft: existing
                                    });

                                    t.waitForMs(t.parent.TIMEOUT, () => {

                                        // test loading of compoundKey and makse sure session is
                                        // set properly
                                        t.expect(newVm.get("messageDraft")).toBeTruthy();
                                        t.expect(session.peekRecord("MessageDraft", existing.toLocalId())).toBe(newVm.get("messageDraft"));
                                        newVm.destroy();
                                        newVm = null;

                                        session  = createSession(),
                                        draft    = Ext.create(
                                            "conjoon.cn_mail.model.mail.message.MessageDraft",
                                            Ext.applyIf({localId: existing.toLocalId()}, Ext.apply({}, getMessageItemAt(1))));
                                        existing = createKeyForExistingMessage(1);

                                        t.expect(draft.getCompoundKey().equalTo(existing)).toBe(true);
                                        t.expect(draft.getId()).toBe(existing.toLocalId());
                                        session.adopt(draft);

                                        newVm = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                            session: session,
                                            messageDraft: existing
                                        });

                                        // make sure record will be re-used if found in session
                                        t.expect(newVm.get("messageDraft")).toBeTruthy();
                                        t.expect(session.peekRecord("MessageDraft", existing.toLocalId())).toBe(newVm.get("messageDraft"));

                                        conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = tmp;
                                    });

                                });

                            });


                            t.it("conjoon/extjs-app-webmail#66 - cn_mail-messagedraftload event fired from draft load", t => {

                                let session  = createSession(),
                                    CK = createKeyForExistingMessage(1),
                                    CALLED = 0, EVTSOURCE, EVTDRAFT;

                                Ext.ux.ajax.SimManager.init({
                                    delay: Math.max(1, t.parent.TIMEOUT - 1000)
                                });


                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: session,
                                    messageDraft: CK
                                });

                                let VIEWMOCK = {
                                    fireEvent: function (evtName, view, draft) {
                                        if (evtName !== "cn_mail-messagedraftload") {
                                            return;
                                        }
                                        CALLED++;
                                        EVTSOURCE = view;
                                        EVTDRAFT = draft;
                                    }
                                };

                                t.expect(viewModel.loadingDraft).toBeTruthy();

                                viewModel.getView = function (){return VIEWMOCK;};


                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(viewModel.loadingDraft).toBeFalsy();
                                    t.expect(CALLED).toBe(1);
                                    t.expect(EVTSOURCE).toBe(VIEWMOCK);
                                    t.expect(EVTDRAFT.getCompoundKey().toObject()).toEqual(CK.toObject());

                                });

                            });


                            t.it("conjoon/extjs-app-webmail#66 - failure registered", t => {

                                let session  = createSession(),
                                    CK = createKey(1, 2, 3),
                                    CALLED = 0;

                                Ext.ux.ajax.SimManager.init({
                                    delay: Math.max(1, t.parent.TIMEOUT - 1000)
                                });

                                let tmp = conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.processMessageDraftLoadFailure;

                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.processMessageDraftLoadFailure = function () {
                                    CALLED++;
                                };
                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: session,
                                    messageDraft: CK
                                });

                                t.expect(CALLED).toBe(0);


                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(CALLED).toBe(1);

                                    conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.processMessageDraftLoadFailure = tmp;


                                });
                            });


                            t.it("conjoon/extjs-app-webmail#66 - processMessageDraftLoadFailure", t => {

                                let session  = createSession(),
                                    CALLED = 0;

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: session,
                                    messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig")
                                });


                                viewModel.loadingFailed = false;
                                viewModel.loadingDraft  = {};

                                viewModel.getView = function () {
                                    return {
                                        showLoadingFailedDialog: function () {
                                            CALLED++;
                                            return {};
                                        }
                                    };
                                };

                                t.expect(CALLED).toBe(0);


                                t.expect(viewModel.processMessageDraftLoadFailure({}, {})).toBeTruthy();

                                t.expect(viewModel.loadingFailed).toBe(true);
                                t.expect(viewModel.loadingDraft).toBe(null);
                                t.expect(CALLED).toBe(1);


                                viewModel.loadingFailed = false;
                                viewModel.loadingDraft  = {};


                                t.expect(viewModel.processMessageDraftLoadFailure({}, {error: {status: -1}})).toBe(null);

                                t.expect(viewModel.loadingFailed).toBe(true);
                                t.expect(viewModel.loadingDraft).toBe(null);
                                t.expect(CALLED).toBe(1);

                            });


                            t.it("conjoon/extjs-app-webmail#66 - onMessageDraftCopyLoad, success false/true", t => {

                                let session  = createSession(),
                                    CALLED = 0, FIRED = 0;

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: session,
                                    messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig")
                                });
                                let VIEWMOCK = {
                                    fireEvent: function (evtName, view, draft) {
                                        if (evtName !== "cn_mail-messagedraftload") {
                                            return;
                                        }
                                        FIRED++;
                                    }
                                };
                                viewModel.getView = function (){return VIEWMOCK;};
                                viewModel.createDraftFromData = function (){};
                                viewModel.processMessageDraftLoadFailure = function (){
                                    CALLED++;
                                };

                                t.expect(CALLED).toBe(0);

                                viewModel.onMessageDraftCopyLoad({}, {}, false, {});

                                t.expect(CALLED).toBe(1);
                                t.expect(FIRED).toBe(0);

                                viewModel.onMessageDraftCopyLoad({}, {}, true, {});

                                t.expect(CALLED).toBe(1);
                                t.expect(FIRED).toBe(1);

                            });


                            t.it("conjoon/extjs-app-webmail#39 - mailAccountStore", t => {

                                let session = createSession();

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: session,
                                    messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig")
                                });

                                viewModel.set("cn_mail_mailfoldertreestore", Ext.create("conjoon.cn_mail.store.mail.folder.MailFolderTreeStore"));

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    t.expect(viewModel.get("mailAccountStore")).toBeTruthy();

                                    t.isInstanceOf(viewModel.get("mailAccountStore"), "Ext.data.ChainedStore");

                                    t.expect(viewModel.get("mailAccountStore").getSource()).toBe(viewModel.get("cn_mail_mailfoldertreestore"));
                                    viewModel.get("mailAccountStore").getFilters();

                                    t.expect(viewModel.get("mailAccountStore").getFilters().items[0].getProperty()).toBe("folderType");
                                    t.expect(viewModel.get("mailAccountStore").getFilters().items[0].getValue()).toBe("ACCOUNT");

                                });
                            });


                            t.it("make sure messageDraft is in session before messagebody gets loaded", t => {

                                let index = 1;

                                let tmp = conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView;
                                conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = function (){return{fireEvent: Ext.emptyFn};};

                                let session = createSession();
                                session.setMessageDraft  = function (record){
                                    t.expect(record._messageBody).toBeUndefined();
                                };

                                viewModel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                                    session: session,
                                    messageDraft: createKeyForExistingMessage(index)
                                });

                                t.waitForMs(t.parent.TIMEOUT, () => {
                                    conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel.prototype.getView = tmp;
                                });

                            });


                        });});});});});});});
