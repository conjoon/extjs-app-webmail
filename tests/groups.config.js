/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-dev-webmailsim
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

export default [{
    group: "universal",
    items: [{
        group: "_issues_",
        items: [{
            group: "feat",
            items: [{
                name: "conjoon/php-ms-imapuser#40",
                url: "src/_issues_/feat/php-ms-imapuser%2340.js"
            }, {
                name: "conjoon/extjs-app-webmail#194",
                url: "src/_issues_/refactor/extjs-app-webmail%23194.js"
            }]
        }, {
            group: "refactor",
            items: [{
                name: "conjoon/extjs-app-webmail#167",
                url: "src/_issues_/refactor/extjs-app-webmail%23167.js"
            }, {
                name: "conjoon/extjs-app-webmail#194",
                url: "src/_issues_/refactor/extjs-app-webmail%23194.js"
            }]
        }, {
            group: "fix",
            items: [{
                name: "conjoon/extjs-app-webmail#157",
                url: "src/_issues_/fix/extjs-app-webmail%23157.js"
            }, {
                name: "conjoon/extjs-app-webmail#196",
                url: "src/_issues_/fix/extjs-app-webmail%23196.js"
            }]
        }]

    }, {
        group: "app",
        items: [
            "src/app/PackageControllerTest.js",
            {
                group: "plugin",
                items: [
                    "src/app/plugin/NewMessagesNotificationPluginTest.js"
                ]
            }
        ]
    }, {
        group: "data",
        items: [{
            group: "mail",

            items: [
                "src/data/mail/MailboxRunnerTest.js",
                {
                    group: "account",
                    items: [{
                        group: "reader",
                        items: [
                            "src/data/mail/account/reader/MailAccountJsonReaderTest.js"
                        ]
                    }, {
                        group: "proxy",
                        items: [
                            "src/data/mail/account/proxy/MailAccountProxyTest.js"
                        ]
                    }]
                }, {
                    group: "folder",
                    items: [{
                        group: "compoundKey",
                        items: [
                            "src/data/mail/folder/compoundKey/MailFolderCompoundKeyTest.js"
                        ]
                    }, {
                        group: "reader",
                        items: [
                            "src/data/mail/folder/reader/MailFolderJsonReaderTest.js"
                        ]
                    },
                    "src/data/mail/folder/MailFolderTypesTest.js"
                    ]
                }, {
                    group: "message",
                    items: [{
                        group: "compoundKey",
                        items: [
                            "src/data/mail/message/compoundKey/MessageEntityCompoundKeyTest.js",
                            "src/data/mail/message/compoundKey/MessageItemChildCompoundKeyTest.js",
                            "src/data/mail/message/compoundKey/AttachmentItemCompoundKeyTest.js"
                        ]
                    }, {
                        group: "editor",
                        items: [
                            "src/data/mail/message/editor/MessageDraftConfigTest.js",
                            "src/data/mail/message/editor/MessageDraftCopierTest.js",
                            "src/data/mail/message/editor/MessageDraftCopyRequestTest.js"
                        ]
                    }, {
                        group: "proxy",
                        items: [
                            "src/data/mail/message/proxy/MessageEntityProxyTest.js",
                            "src/data/mail/message/proxy/AttachmentProxyTest.js",
                            "src/data/mail/message/proxy/UtilityMixinTest.js"
                        ]
                    },
                    {
                        group: "reader",
                        items: [
                            "src/data/mail/message/reader/MessageItemJsonReaderTest.js",
                            "src/data/mail/message/reader/MessageBodyJsonReaderTest.js",
                            "src/data/mail/message/reader/MessageItemChildJsonReaderTest.js",
                            "src/data/mail/message/reader/MessageEntityJsonReaderTest.js",
                            "src/data/mail/message/reader/MessageItemUpdaterTest.js"
                        ]
                    },
                    {
                        group: "session",
                        items: [
                            "src/data/mail/message/session/MessageCompoundBatchVisitorTest.js",
                            "src/data/mail/message/session/MessageDraftSessionTest.js"
                        ]
                    },
                    "src/data/mail/message/CompoundKeyTest.js",
                    "src/data/mail/message/EditingModesTest.js"
                    ]
                }, {
                    group: "service",
                    items: [{
                        group: "mailbox",
                        items: [
                            "src/data/mail/service/mailbox/OperationTest.js"
                        ]
                    },
                    "src/data/mail/service/MailFolderHelperTest.js",
                    "src/data/mail/service/MailboxServiceTest.js"
                    ]
                },
                "src/data/mail/BaseSchemaTest.js"
            ]
        }]
    }, {
        group: "model",
        items: [{
            group: "mail",
            items: [
                "src/model/mail/AbstractCompoundKeyedModelTest.js",
                "src/model/mail/AbstractCompoundKeyedTreeModelTest.js",
                "src/model/mail/BaseModelTest.js",
                "src/model/mail/BaseTreeModelTest.js",
                {
                    group: "account",
                    items: [
                        "src/model/mail/account/MailAccountTest.js"
                    ]
                },
                {
                    group: "folder",
                    items: [
                        "src/model/mail/folder/MailFolderTest.js"
                    ]
                }, {
                    group: "message",
                    items: [
                        "src/model/mail/message/AbstractMessageItemTest.js",
                        "src/model/mail/message/CompoundKeyedModelTest.js",
                        "src/model/mail/message/DraftAttachmentTest.js",
                        "src/model/mail/message/EmailAddressTest.js",
                        "src/model/mail/message/ItemAttachmentTest.js",
                        "src/model/mail/message/MessageBodyTest.js",
                        "src/model/mail/message/MessageItemTest.js",
                        "src/model/mail/message/MessageItemChildModelTest.js",
                        "src/model/mail/message/MessageDraftTest.js"
                    ]
                }]
        }]
    }, {
        group: "store",
        items: [{
            group: "mail",
            items: [{
                group: "folder",
                items: [
                    "src/store/mail/folder/MailFolderTreeStoreTest.js"
                ]
            }, {
                group: "message",
                items: [
                    "src/store/mail/message/MessageAttachmentStoreTest.js",
                    "src/store/mail/message/MessageItemStoreTest.js"
                ]
            }]
        }]
    }, {
        group: "text",
        items: [{
            group: "mail",
            items: [{
                group: "message",
                items: [{
                    group: "reader",
                    items: ["src/text/mail/message/reader/PlainReadableStrategyTest.js"]
                },
                "src/text/mail/message/CopyDecoratorTest.js",
                "src/text/mail/message/DecoratorFormatTest.js",
                "src/text/mail/message/ForwardMessageDecoratorTest.js",
                "src/text/mail/message/ReplyToMessageDecoratorTest.js",
                "src/text/mail/message/ReplyAllMessageDecoratorTest.js"
                ]
            }]
        },
        "src/text/QueryStringParserTest.js"
        ]
    }, {
        group: "view",
        items: [{
            group: "mail",
            items: [
                "src/view/mail/MailDesktopViewControllerTest_0.js",
                "src/view/mail/MailDesktopViewControllerTest_1.js",
                "src/view/mail/MailDesktopViewControllerTest_2.js",
                "src/view/mail/MailDesktopViewControllerTest_3.js",
                "src/view/mail/MailDesktopViewModelTest.js",
                {
                    group: "account",
                    items: [
                        "src/view/mail/account/MailAccountViewControllerTest.js",
                        "src/view/mail/account/MailAccountViewModelTest.js"
                    ]
                },
                {
                    group: "inbox",
                    items: [
                        "src/view/mail/inbox/InboxViewControllerTest.js",
                        "src/view/mail/inbox/InboxViewModelTest.js"
                    ]
                }, {
                    group: "message",
                    items: [
                        "src/view/mail/message/AbstractAttachmentListControllerTest.js",
                        {
                            group: "editor",
                            items: [
                                "src/view/mail/message/editor/AttachmentListControllerTest.js",
                                "src/view/mail/message/editor/MessageEditorViewControllerTest_01.js",
                                "src/view/mail/message/editor/MessageEditorViewControllerTest_02.js",
                                "src/view/mail/message/editor/MessageEditorViewControllerTest_03.js",
                                "src/view/mail/message/editor/MessageEditorViewModelTest.js"
                            ]
                        }, {
                            group: "reader",
                            items: [
                                "src/view/mail/message/reader/AttachmentListControllerTest.js",
                                "src/view/mail/message/reader/MessageViewControllerTest.js",
                                "src/view/mail/message/reader/MessageViewModelTest.js"
                            ]
                        }
                    ]
                }]
        }]
    }]
}, {
    group: "classic",
    items: [{
        group: "_issues_",
        items: [{
            group: "feat",
            items: [{
                name: "conjoon/extjs-app-webmail#112",
                url: "classic/_issues_/feat/extjs-app-webmail%23112.js"
            }]
        }, {
            group: "fix",
            items: [{
                name: "conjoon/extjs-app-webmail#135",
                url: "classic/_issues_/fix/extjs-app-webmail%23135.js"
            }, {
                name: "conjoon/extjs-app-webmail#147",
                url: "classic/_issues_/fix/extjs-app-webmail%23147.js"
            }, {
                name: "conjoon/extjs-app-webmail#186",
                url: "classic/_issues_/fix/extjs-app-webmail%23186.js"
            }, {
                name: "conjoon/php-ms-imapuser#49",
                url: "classic/_issues_/fix/php-ms-imapuser%2349.js"
            }]
        }]
    }, {
        group: "view",
        items: [{
            group: "mail",
            items: [{
                group: "account",
                items: [
                    "classic/src/view/mail/account/MailAccountViewTest.js",
                    "classic/src/view/mail/folder/MailFolderTreeTest.js"
                ]
            }, {
                group: "folder",
                items: [
                    "classic/src/view/mail/folder/MailFolderTreeColumnTest.js",
                    "classic/src/view/mail/folder/MailFolderTreeTest.js"
                ]
            }, {
                group: "inbox",
                items: [
                    "classic/src/view/mail/inbox/InboxViewTest.js"
                ]
            }, {
                group: "message",
                items: [
                    "classic/src/view/mail/message/AbstractAttachmentListTest.js",
                    "classic/src/view/mail/message/MessageGridTest.js", {
                        group: "editor",
                        items: [
                            "classic/src/view/mail/message/editor/AddressFieldTest.js",
                            "classic/src/view/mail/message/editor/AttachmentListTest.js",
                            "classic/src/view/mail/message/editor/HtmlEditorTest.js",
                            "classic/src/view/mail/message/editor/MessageEditorTest.js"
                        ]
                    }, {
                        group: "grid",
                        items: [{
                            group: "feature",
                            items: [
                                "classic/src/view/mail/message/grid/feature/LivegridTest.js",
                                "classic/src/view/mail/message/grid/feature/PreviewTextLazyLoadTest.js"
                            ]
                        }]
                    }, {
                        group: "reader",
                        items: [
                            "classic/src/view/mail/message/reader/AttachmentListTest.js",
                            "classic/src/view/mail/message/reader/MessageViewIframeTest.js",
                            "classic/src/view/mail/message/reader/MessageViewTest.js"

                        ]
                    }
                ]
            }, {
                group: "mixin",
                items: [
                    "classic/src/view/mail/mixin/DeleteConfirmDialogTest.js",
                    "classic/src/view/mail/mixin/LoadingFailedDialogTest.js"
                ]
            },
            "classic/src/view/mail/MailDesktopViewTest.js"
            ]
        }]
    }]
}];
