/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    await helper.registerIoC().setupSimlets().mockUpMailTemplates().andRun(t => {

        t.requireOk("coon.core.ServiceLocator", () => {

            const userImageService = Ext.create("coon.core.service.UserImageService");
            userImageService.getImageSrc = id => id;
            coon.core.ServiceLocator.register(
                "coon.core.service.UserImageService",
                userImageService
            );


            var viewModel;

            var vm,
                createKey = function (id1, id2, id3) {
                    return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
                },
                getMessageItemAt = function (messageIndex) {
                    return conjoon.dev.cn_mailsim.data.table.MessageTable.getMessageItemAt(messageIndex);
                },
                createKeyForExistingMessage = function (messageIndex){
                    let item = getMessageItemAt(messageIndex);

                    let key = createKey(
                        item.mailAccountId, item.mailFolderId, item.id
                    );

                    return key;
                },
                createMessageItem = function () {

                    let len, item, index, messageItem;

                    for (index = 0, len = 1000; index < len; index++) {
                        item = getMessageItemAt(index);
                        if (!item.seen && item.hasAttachments) {
                            break;
                        }
                    }

                    item.messageBodyId = createKeyForExistingMessage(index).toLocalId();

                    messageItem = Ext.create(
                        "conjoon.cn_mail.model.mail.message.MessageItem",
                        item
                    );
                    messageItem.commit(true);

                    return messageItem;
                },
                createMessageItemWoBody = function () {

                    var messageItem = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                        id: 2,
                        mailFolderId: "INBOX",
                        mailAccountId: "dev_sys_conjoon_org",
                        subject: "SUBJECT",
                        from: "FROM",
                        date: "DATE"
                    });

                    return messageItem;
                };

            t.afterEach(function () {
                if (vm) {
                    vm.destroy();
                    vm = null;
                }
            });


            t.requireOk("conjoon.cn_mail.model.mail.message.MessageBody", () => {

                t.it("1. Should create the ViewModel", t => {

                    let providerSpy = t.spyOn(coon.core.ServiceLocator, "resolve").and.callThrough();

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");
                    t.expect(viewModel instanceof Ext.app.ViewModel).toBe(true);

                    t.expect(providerSpy.calls.mostRecent().args[0]).toBe("coon.core.service.UserImageService");
                    t.expect(viewModel.userImageService).toBe(providerSpy.calls.mostRecent().returnValue);


                    t.expect(viewModel.alias).toContain("viewmodel.cn_mail-mailmessagereadermessageviewmodel");

                    providerSpy.remove();
                });


                t.it("2. Should trigger loading the messageBody along with a configured view for firing the event", t => {

                    var wasCalled = false,
                        view      = Ext.create("Ext.Component", {
                            listeners: {
                                "cn_mail-mailmessageitemread": function () {
                                    wasCalled = true;
                                }
                            }
                        });

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: view
                    });

                    Ext.ux.ajax.SimManager.init({
                        delay: Math.max(1, t.parent.TIMEOUT - 1000)
                    });

                    let msgItem = createMessageItem();

                    viewModel.setMessageItem(msgItem);

                    t.expect(viewModel.bodyLoadOperation.loadOperation.getParams()).toEqual({
                        mailAccountId: msgItem.get("mailAccountId"),
                        mailFolderId: msgItem.get("mailFolderId"),
                        id: msgItem.get("id")
                    });

                    t.expect(viewModel.bodyLoadOperation.loadOperation instanceof Ext.data.operation.Read).toBe(true);
                    t.expect(viewModel.bodyLoadOperation.messageBodyId).toBe(msgItem.get("messageBodyId"));
                    t.expect(viewModel.bodyLoadOperation.loadOperation.isRunning()).toBe(true);

                    t.expect(wasCalled).toBe(false);
                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(viewModel.bodyLoadOperation).toBe(null);

                        t.expect(wasCalled).toBe(true);
                        t.expect(viewModel.get("messageBody").getCompoundKey().equalTo(msgItem.getCompoundKey())).toBe(true);
                        t.expect(viewModel.get("messageBody").getId()).toBe(msgItem.get("messageBodyId"));
                        t.expect(viewModel.get("messageBody").get("textHtml")).toBeTruthy();
                        // we are working with cloned messageItem for the assoziations
                        t.expect(viewModel.get("messageItem").loadMessageBody()).not.toBe(viewModel.get("messageBody"));
                    });

                });


                t.it("3. Should abort loading the messageBody and reload later on properly", t => {

                    var view = Ext.create("Ext.Component", {
                        listeners: {
                            "cn_mail-mailmessageitemread": function () {

                            }
                        }});


                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: view
                    });

                    Ext.ux.ajax.SimManager.init({
                    // delay needs to be bigger than configured TIMEOUT to check the load operations
                        delay: t.parent.TIMEOUT + 500
                    });

                    let msgItem = createMessageItem();
                    viewModel.setMessageItem(msgItem);

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(viewModel.bodyLoadOperation.loadOperation instanceof Ext.data.operation.Read).toBe(true);
                        t.expect(viewModel.bodyLoadOperation.loadOperation.isRunning()).toBe(true);
                        t.expect(viewModel.abortedRequestMap).toEqual({});
                        viewModel.abortMessageBodyLoad();
                        let obj = {};
                        obj[msgItem.get("messageBodyId")] = true;
                        t.expect(viewModel.abortedRequestMap).toEqual(obj);
                        t.expect(viewModel.bodyLoadOperation).toBe(null);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(viewModel.get("messageItem")).not.toBe(null);
                            t.expect(viewModel.get("messageItem").getCompoundKey().equalTo(msgItem.getCompoundKey())).toBe(true);
                            t.expect(viewModel.get("messageItem").getId()).toBe(msgItem.getId());
                            t.expect(viewModel.get("messageBody")).toBe(null);

                            // aborted the load operation, messageItem will continue with
                            // dummy model
                            t.expect(viewModel.get("messageItem").loadMessageBody().get("textHtml")).toBe("");
                            t.expect(viewModel.get("messageItem").loadMessageBody()).not.toBe(null);
                            let mbLoad = viewModel.get("messageItem").loadMessageBody();
                            t.expect(mbLoad.getId()).toBe(msgItem.get("messageBodyId"));

                            Ext.ux.ajax.SimManager.init({
                                delay: Math.max(1, t.parent.TIMEOUT - 1000)
                            });

                            // and trigger reload
                            viewModel.setMessageItem(createMessageItem());
                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(viewModel.abortedRequestMap).toEqual({});
                                t.expect(viewModel.get("messageBody").get("textHtml")).not.toBe("");
                            });

                        });

                    });

                });


                t.it("4. Should not trigger an error if no message body was specified", t => {

                    var view = Ext.create("Ext.Component");

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: view
                    });

                    let item = createMessageItemWoBody();

                    viewModel.setMessageItem(item);


                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(viewModel.bodyLoadOperation).toBe(null);

                        t.expect(viewModel.get("messageItem").getCompoundKey().equalTo(item.getCompoundKey())).toBe(true);
                        t.expect(viewModel.get("messageItem").loadMessageBody()).toBe(null);
                        t.expect(viewModel.get("messageBody")).toEqual(null);
                    });

                });


                t.it("5. MessageItem's MessageBody/Attachments should not be loaded for the same Reference", t => {

                    var view = Ext.create("Ext.Component");

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: view
                    });
                    Ext.ux.ajax.SimManager.init({
                        delay: Math.max(1, t.parent.TIMEOUT - 1000)
                    });
                    viewModel.setMessageItem(createMessageItem());

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(viewModel.bodyLoadOperation).toBe(null);

                        t.expect(viewModel.get("messageBody")).toBeTruthy();
                        t.expect(viewModel.get("attachments")).toBeTruthy();

                        t.expect(viewModel.get("messageBody")).not.toBe(viewModel.get("messageItem").loadMessageBody());
                        // attachment store of original mesage item should not have been
                        // loaded, allthough we have access to attachment data. In
                        // this case, its from the internally cloned messageItem
                        t.expect(viewModel.get("messageItem").attachments().isLoaded()).toBe(false);


                    });

                });


                t.it("6. Should abort loading the attachments and reload later on properly", t => {

                    var view = Ext.create("Ext.Component");

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: view
                    });

                    Ext.ux.ajax.SimManager.init({
                    // delay needs to be bigger than configured TIMEOUT to check the load operations
                        delay: t.parent.TIMEOUT + 500
                    });

                    let msgItem = createMessageItem();
                    viewModel.setMessageItem(msgItem);

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        t.expect(viewModel.attachmentsLoadOperation instanceof Ext.data.operation.Read).toBe(true);
                        t.expect(viewModel.attachmentsLoadOperation.isRunning()).toBe(true);

                        let filters = viewModel.attachmentsLoadOperation.getFilters();

                        t.expect(filters.length).toBe(3);
                        let exp = [];
                        for (let i = 0, len = filters.length; i < len; i++) {
                            exp.push({property: filters[i].getProperty(), value: filters[i].getValue()});
                        }

                        t.expect(exp).toEqual([{
                            property: "mailAccountId", value: msgItem.get("mailAccountId")
                        }, {
                            property: "mailFolderId", value: msgItem.get("mailFolderId")
                        },{
                            property: "parentMessageItemId", value: msgItem.get("id")
                        }]);

                        viewModel.abortMessageAttachmentsLoad();
                        t.expect(viewModel.attachmentsLoadOperation).toBe(null);

                        t.waitForMs(t.parent.TIMEOUT, () => {
                            t.expect(viewModel.get("messageItem")).not.toBe(null);
                            t.expect(viewModel.get("messageItem").getCompoundKey().equalTo(msgItem.getCompoundKey())).toBe(true);
                            t.expect(viewModel.get("attachments")).toEqual([]);

                            Ext.ux.ajax.SimManager.init({
                                delay: Math.max(1, t.parent.TIMEOUT - 1000)
                            });

                            // and trigger reload
                            viewModel.setMessageItem(createMessageItem());
                            t.waitForMs(t.parent.TIMEOUT, () => {
                                t.expect(viewModel.abortedRequestMap).toEqual({});
                                t.expect(viewModel.get("attachments")).not.toEqual([]);
                            });

                        });

                    });

                });


                t.it("data.isLoading", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    t.expect(viewModel.get("isLoading")).toBe(false);
                });


                t.it("data.iframeLoaded", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    t.expect(viewModel.get("iframeLoaded")).toBe(false);
                });


                t.it("data.hasImages", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    t.expect(viewModel.get("hasImages")).toBe(false);
                });


                t.it("formula.getIndicatorText", t => {

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    var MESSAGEBODY = false,
                        MESSAGEITEM = false,
                        IFRAMELOADED = false,
                        formulas    = viewModel.getFormulas(),
                        get         = function (key) {
                            switch (key) {
                            case "messageBody":
                                return MESSAGEBODY;
                            case "messageItem":
                                return MESSAGEITEM;
                            case "iframeLoaded":
                                return IFRAMELOADED;
                            }
                        };

                    t.expect(formulas.getIndicatorText(get)).toContain("Select");
                    MESSAGEITEM = true;
                    t.expect(formulas.getIndicatorText(get)).toContain("Loading");
                    MESSAGEBODY = true;
                    t.expect(formulas.getIndicatorText(get)).toContain("Loading");
                    IFRAMELOADED = true;
                    t.expect(formulas.getIndicatorText(get)).toBe("");


                });


                t.it("formula.getIndicatorIcon", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    var MESSAGEBODY = false,
                        MESSAGEITEM = false,
                        IFRAMELOADED = false,
                        formulas    = viewModel.getFormulas(),
                        get         = function (key) {
                            switch (key) {
                            case "messageBody":
                                return MESSAGEBODY;
                            case "messageItem":
                                return MESSAGEITEM;
                            case "iframeLoaded":
                                return IFRAMELOADED;
                            }
                        };

                    t.expect(formulas.getIndicatorIcon(get)).toBeTruthy();
                    MESSAGEITEM = true;
                    t.expect(formulas.getIndicatorIcon(get)).toBeTruthy();
                    MESSAGEBODY = true;
                    t.expect(formulas.getIndicatorIcon(get)).toBeTruthy();
                    IFRAMELOADED = true;
                    t.expect(formulas.getIndicatorIcon(get)).toBe("");
                });


                t.it("stores.attachmentStore", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    viewModel.set("attachments", []);

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(viewModel.getStore("attachmentStore")).toBeDefined();
                        t.expect(viewModel.getStore("attachmentStore").model.$className).toBe("conjoon.cn_mail.model.mail.message.ItemAttachment");
                    });
                });


                t.it("updateMessageItem()", t => {

                    Ext.ux.ajax.SimManager.init({
                        delay: Math.max(1, t.parent.TIMEOUT - 1000)
                    });

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: Ext.create("Ext.Component")
                    });

                    var messageItem = createMessageItem(),
                        viewModelItem,
                        messageDraft, exc;

                    messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        localId: messageItem.getId(),
                        mailAccountId: messageItem.get("mailAccountId"),
                        mailFolderId: messageItem.get("mailFolderId"),
                        id: messageItem.get("id"),
                        subject: "subject",
                        date: "2017-07-30 23:45:00",
                        to: "test@testdomain.tld"
                    });

                    messageDraft.attachments().add(Ext.create("conjoon.cn_mail.model.mail.message.DraftAttachment", {
                        text: "myAttachment"
                    }));

                    messageDraft.setMessageBody(Ext.create("conjoon.cn_mail.model.mail.message.MessageBody", {
                        textHtml: "Html text",
                        textPlain: "Plain Text"
                    }));

                    try {viewModel.updateMessageItem(messageDraft);} catch (e) {exc = e;}
                    t.expect(exc).toBeDefined();
                    t.expect(exc.msg.toLowerCase()).toContain("no messageitem available");

                    viewModel.setMessageItem(createMessageItem());

                    t.waitForMs(t.parent.TIMEOUT, () => {

                        try {viewModel.updateMessageItem({});} catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

                        let mdCopy = messageDraft.copy(1000000);
                        mdCopy.set({mailAccountId: 1, mailFolderId: 2, id: 3}, {dirty: false});
                        try {viewModel.updateMessageItem(mdCopy);} catch (e) {exc = e;}
                        t.expect(exc).toBeDefined();
                        t.expect(exc.msg.toLowerCase()).toContain("does not equal to the accountid");

                        viewModelItem = viewModel.get("messageItem");

                        t.isCalledNTimes("updateItemWithDraft", conjoon.cn_mail.data.mail.message.reader.MessageItemUpdater, 1);

                        viewModel.updateMessageItem(messageDraft);
                        t.expect(viewModel.get("messageBody")).toBeTruthy();

                        t.expect(viewModel.get("attachments")[0].data).toEqual(messageDraft.attachments().getRange()[0].data);
                        t.expect(viewModel.get("attachments")[0]).not.toBe(messageDraft.attachments().getRange()[0]);

                        t.expect(viewModel.get("messageBody")).not.toBe(messageDraft.loadMessageBody());
                        t.expect(viewModel.get("messageBody").data).toEqual(messageDraft.loadMessageBody().data);

                        // was committed
                        t.expect(viewModelItem.dirty).toBe(false);
                    });
                });


                t.it("formula.getFormattedDate", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    var date        = new Date(),
                        expected    = Ext.util.Format.date(date, "H:i"),
                        formulas    = viewModel.getFormulas(),
                        get         = function () {
                            return date;
                        };

                    t.isCalled("getHumanReadableDate", coon.core.util.Date);

                    t.expect(formulas.getFormattedDate(get)).toBe(expected);
                });


                t.it("formula.getDisplayToAddress", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    var formulas    = viewModel.getFormulas(),
                        messageItem = {
                            get: function (value) {
                                if (value === "draft") {
                                    return false;
                                }
                            }
                        },
                        get  = function (value) {
                            if (value === "messageItem") {
                                return messageItem;
                            }

                            if (value === "messageItem.to") {
                                return [{name: "a", address: "b"}, {name: "c", address: "d"}];
                            }
                        };

                    t.expect(formulas.getDisplayToAddress(get)).toEqual(
                        [{name: "a", address: "b", index: 1}, {name: "c", address: "d", index: 2}]
                    );

                    messageItem = null;

                    t.expect(formulas.getDisplayToAddress(get)).toBe("");
                });


                t.it("formula.getDisplayFromAddress", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    var formulas    = viewModel.getFormulas(),
                        from        = {name: "a", address: "b"},
                        messageItem = {
                            get: function (value) {
                                if (value === "draft") {
                                    return false;
                                }
                            }
                        },
                        get  = function (value) {
                            if (value === "messageItem") {
                                return messageItem;
                            }

                            if (value === "messageItem.from") {
                                return from;
                            }
                        };

                    t.expect(formulas.getDisplayFromAddress(get)).toEqual({
                        name: "a", address: "b", index: 1
                    });

                    from = null;

                    t.expect(formulas.getDisplayFromAddress(get)).toBe("");

                    messageItem = null;

                    t.expect(formulas.getDisplayToAddress(get)).toBe("");

                });


                t.it("formula.getSubject", t => {
                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    const formulas       = viewModel.getFormulas(),
                        defaultSubject = viewModel.emptySubjectText;

                    t.expect(formulas.getSubject.set).not.toBeDefined();
                    t.expect(formulas.getSubject.get.apply(viewModel, [{}])).toBe(defaultSubject);
                    t.expect(formulas.getSubject.get.apply(viewModel, [{subject: ""}])).toBe(defaultSubject);
                    t.expect(formulas.getSubject.get.apply(viewModel, [{subject: "foo"}])).toBe("foo");
                });


                t.it("extjs-app-webmail#66 - onMessageBodyLoadFailure", t => {

                    let view = Ext.create("Ext.Component", {});

                    let CALLED = 0;

                    view.onMessageItemLoadFailure = function () {
                        CALLED = 1;
                    };

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: view
                    });

                    t.expect(CALLED).toBe(0);

                    t.isCalled("onMessageBodyLoadFailure", viewModel);

                    viewModel.loadMessageBodyFor(Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                        localId: "foo",
                        mailAccountId: "bar",
                        mailFolderId: "m",
                        id: "xyz",
                        messageBodyId: "foobar"
                    }));

                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(CALLED).toBe(1);
                    });


                });


                t.it("extjs-app-webmail#66 - onMessageBodyLoadFailure with error exiting", t => {

                    let view = Ext.create("Ext.Component", {});

                    let CALLED = 0;

                    view.onMessageItemLoadFailure = function () {
                        CALLED = 1;
                    };

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: view
                    });

                    t.expect(CALLED).toBe(0);

                    viewModel.onMessageBodyLoadFailure({}, {error: {status: -1}});


                    t.waitForMs(t.parent.TIMEOUT, () => {
                        t.expect(CALLED).toBe(0);
                    });
                });


                t.it("contextButtonsEnabled", t => {

                    let view = Ext.create("Ext.Component", {});

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel", {
                        view: view
                    });

                    t.expect(viewModel.get("contextButtonsEnabled")).toBe(false);

                });


                t.it("formula.textPlainToHtml", t => {
                    vm = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    const
                        formulas       = vm.getFormulas();

                    t.expect(vm.plainReadableStrategy).toBeUndefined();
                    t.expect(formulas.textPlainToHtml.set).toBeUndefined();
                    t.expect(vm.plainReadableStrategy).toBeUndefined();
                    t.expect(formulas.textPlainToHtml.get.apply(vm, [{textPlain: "foo"}])).toBe(vm.plainReadableStrategy.process("foo"));
                    t.expect(formulas.textPlainToHtml.get.apply(vm, [{}])).toBe("");

                    t.isInstanceOf(vm.plainReadableStrategy, "conjoon.cn_mail.text.mail.message.reader.PlainReadableStrategy");

                    let spy = t.spyOn(vm.plainReadableStrategy, "process");

                    formulas.textPlainToHtml.get.apply(vm, [{textPlain: "bar"}]);
                    t.expect(spy).toHaveBeenCalledWith("bar");

                });


                t.it("messageBodyLoaded() - recent", t => {

                    const mockItem = {
                        set: function (key, value) {
                            this[key] = value;
                        } ,
                        get: function (key) {
                            return this[key];
                        },
                        save: () => {}
                    };

                    vm = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");
                    vm.get = () => mockItem;
                    vm.abortedRequestMap = {};

                    t.expect(mockItem.get("recent")).toBeUndefined();
                    vm.messageBodyLoaded({getId: () => 1});
                    t.expect(mockItem.get("recent")).toBe(false);

                });


                t.it("formula.getSenderImage", t => {

                    viewModel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewModel");

                    let getSpy = t.spyOn(viewModel.userImageService, "getImageSrc").and.callFake(() => "img_src");

                    const formulas = viewModel.getFormulas();

                    t.expect(formulas.getSenderImage.bind.address).toBe("{messageItem.from.address}");

                    t.expect(formulas.getSenderImage.set).not.toBeDefined();
                    t.expect(formulas.getSenderImage.get.apply(viewModel, [{}])).toBe(getSpy.calls.mostRecent().returnValue);
                    t.expect(getSpy.calls.mostRecent().args[0]).toBeUndefined();

                    t.expect(formulas.getSenderImage.get.apply(viewModel, [{address: "tests@conjoon.org"}])).toBe(getSpy.calls.mostRecent().returnValue);
                    t.expect(getSpy.calls.mostRecent().args[0]).toBe("tests@conjoon.org");

                    getSpy.remove();
                });

            });});});});
