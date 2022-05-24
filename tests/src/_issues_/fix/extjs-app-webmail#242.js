/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    t.diag("fix: request url not properly decoded extjs-app-webmail#242");

    t.requireOk("conjoon.cn_mail.view.mail.MailDesktopViewController", function () {


        t.it("MailFolder.toUrl()", t => {

            let accountNode =  Ext.create("conjoon.cn_mail.model.mail.folder.MailFolder", {
                localId: "123",
                id: "[label]/Entwürfe",
                mailAccountId: "foo@account"
            });

            t.expect(accountNode.toUrl()).toBe("cn_mail/folder/foo@account/[label]%2FEntwürfe");
        });


        t.it("MailDesktopViewController.processMailFolderSelectionForRouting()", t => {

            const
                fakeAccountNode = {
                    findChild: function () {
                        return {};
                    }
                },
                fakeTree = {getStore: function () {
                    return {
                        getRoot: function () {
                            return {
                                findChild: () => fakeAccountNode
                            };
                        }
                    };
                }},
                fakeScope = {
                    getView: function () {
                        return {
                            down: function (){
                                return {
                                    down: function (key) {
                                        return key === "cn_mail-mailfoldertree" ? fakeTree : {};
                                    }
                                };
                            }
                        };
                    }
                },
                accountNodeSpy = t.spyOn(fakeAccountNode, "findChild").and.callFake(() => false);

            conjoon.cn_mail.view.mail.MailDesktopViewController.prototype.processMailFolderSelectionForRouting.apply(
                fakeScope, 
                ["123", "[label]%2FEntwürfe"]
            );

            t.expect(accountNodeSpy.calls.mostRecent().args[1]).toBe("[label]/Entwürfe");

        
        });

        
        t.it("MailDesktopViewController.onMailMessageGridDoubleClick()", t => {

            const fakeScope = {
                    redirectTo: function (){}
                },
                redirectToSpy = t.spyOn(fakeScope, "redirectTo").and.callFake(() => {}),
                key = Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                    mailAccountId: 123,
                    mailFolderId: "[label]/Entwürfe",
                    id: "456"
                });

            conjoon.cn_mail.view.mail.MailDesktopViewController.prototype.onMailMessageGridDoubleClick.apply(
                fakeScope,
                [{}, key]
            );
            
            t.expect(redirectToSpy.calls.mostRecent().args[0]).toBe(
                "cn_mail/message/read/" +
                "123/[label]%2FEntwürfe/456"
            );

        });


        t.it("MailDesktopViewController.buildCnHref()", t => {

            const fakeScope = {
                    checkArgumentsForEditorOrView: () => true
                },
                id = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
                    .fromRecord(
                        Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                            mailAccountId: 123,
                            mailFolderId: "[label]/Entwürfe",
                            id: "456"
                        }));

            t.expect(conjoon.cn_mail.view.mail.MailDesktopViewController.prototype.buildCnHref.apply(
                fakeScope,
                [id, "read"]
            )).toBe(
                "cn_mail/message/read/" +
                "123/[label]%2FEntwürfe/456"
            );
        });


        t.it("MailDesktopViewController.redirectToEditorFromInboxMessageView()", t => {

            const fakeScope = {
                    redirectTo: function (){},
                    getCompoundKeyFromInboxMessageView: function () {
                        return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
                            .fromRecord(
                                Ext.create("conjoon.cn_mail.model.mail.message.MessageItem", {
                                    mailAccountId: 123,
                                    mailFolderId: "[label]/Entwürfe",
                                    id: "456"
                                }));

                    }
                },
                redirectToSpy = t.spyOn(fakeScope, "redirectTo").and.callFake(() => {});

            conjoon.cn_mail.view.mail.MailDesktopViewController.prototype.redirectToEditorFromInboxMessageView.apply(
                fakeScope,
                ["read"]
            );

            t.expect(redirectToSpy.calls.mostRecent().args[0]).toBe(
                "cn_mail/message/read/" +
                "123/[label]%2FEntwürfe/456"
            );

        });


    }); 
});