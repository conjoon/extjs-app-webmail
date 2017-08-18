var harness = new Siesta.Harness.Browser.ExtJS();

harness.configure({
    title          : 'My Tests',
    disableCaching : true,
    loaderPath     : {

        /**
         * ux
         */
        'Ext.ux' : "../../../../ext/packages/ux/src/",////bryntum.com/examples/extjs-6.0.1/build/ext-all.js"

        /**
         * Universal
         */
        'conjoon.cn_mail'      : '../src',
        'conjoon.cn_mail.view.mail.inbox.InboxViewModel' : '../src/view/mail/inbox/InboxViewModel.js',
        'conjoon.cn_mail.view.mail.inbox.InboxViewController' : '../src/view/mail/inbox/InboxViewController.js',
        'conjoon.cn_mail.view.mail.message.reader.MessageViewModel' : '../src/view/mail/message/reader/MessageViewModel.js',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel' : '../src/view/mail/message/editor/MessageEditorViewModel.js',
        'conjoon.cn_mail.view.mail.message.AbstractAttachmentListController' : '../src/view/mail/message/AbstractAttachmentListController.js',
        'conjoon.cn_mail.view.mail.message.reader.AttachmentListController' : '../src/view/mail/message/reader/AttachmentListController.js',
        'conjoon.cn_mail.view.mail.message.editor.AttachmentListController' : '../src/view/mail/message/editor/AttachmentListController.js',
        'conjoon.cn_mail.view.mail.MailDesktopViewController' : '../src/view/mail/MailDesktopViewController.js',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController' : '../src/view/mail/message/editor/MessageEditorViewController.js',
        'conjoon.cn_mail.view.mail.message.editor.MessageEditorDragDropListener' : '../src/view/mail/message/editor/MessageEditorDragDropListener.js',

        /**
         * Classic
         */
        'conjoon.cn_mail.view' : '../classic/src/view',

        /**
         * Requirements
         */
        'conjoon.cn_core'   : '../../lib-cn_core/src/',
        'conjoon.cn_comp'   : '../../lib-cn_comp/classic/src'
    },
    preload        : [
        conjoon.tests.config.paths.extjs.css.url,
        conjoon.tests.config.paths.extjs.js.url
    ]
});

harness.start({
        group : 'universal',
        items : [{
            group : 'controller',
            items : [
                'src/controller/PackageControllerTest.js'
            ]
        }, {
            group : 'data',
            items : [{
                group : 'mail',
                items : [{
                    group : 'message',
                    items : [{
                        group : 'editor',
                        items : [
                            'src/data/mail/message/editor/MessageDraftConfigTest.js',
                            'src/data/mail/message/editor/MessageDraftCopyRequestTest.js'
                        ]
                    },
                    'src/data/mail/message/EditingModesTest.js'
                    ]
                },
                    'src/data/mail/BaseSchemaTest.js'
                ]
            }]
        }, {
            group : 'model',
            items : [{
                group : 'mail',
                items : [
                    'src/model/mail/BaseModelTest.js',
                    'src/model/mail/BaseTreeModelTest.js',
                    {
                    group : 'folder',
                    items : [
                        'src/model/mail/folder/MailFolderTest.js'
                    ]
                }, {
                    group : 'message',
                    items : [
                        'src/model/mail/message/AbstractMessageItemTest.js',
                        'src/model/mail/message/DraftAttachmentTest.js',
                        'src/model/mail/message/ItemAttachmentTest.js',
                        'src/model/mail/message/MessageBodyTest.js',
                        'src/model/mail/message/MessageItemTest.js',
                        'src/model/mail/message/MessageDraftTest.js'
                ]}]
            }]
        }, {
            group : 'store',
            items : [{
                group : 'mail',
                items : [{
                    group : 'folder',
                    items : [
                        'src/store/mail/folder/MailFolderStoreTest.js'
                    ]
                }, {
                    group : 'message',
                    items : [
                        'src/store/mail/message/MessageItemStoreTest.js'
                    ]
                }]
            }]
        }, {
            group : 'text',
            items : [
                'src/text/ForwardMessageTextDecoratorTest.js',
                'src/text/QueryStringParserTest.js'
            ]
        }, {
            group : 'view',
            items : [{
                group : 'mail',
                items : [
                    'src/view/mail/MailDesktopViewControllerTest.js',
                    {
                    group : 'inbox',
                    items : [
                        'src/view/mail/inbox/InboxViewControllerTest.js',
                        'src/view/mail/inbox/InboxViewModelTest.js'
                    ]
                    }, {
                    group : 'message',
                    items : [
                        'src/view/mail/message/AbstractAttachmentListControllerTest.js',
                        {
                        group : 'editor',
                        items : [
                            'src/view/mail/message/editor/AttachmentListControllerTest.js',
                            'src/view/mail/message/editor/MessageEditorViewControllerTest.js',
                            'src/view/mail/message/editor/MessageEditorViewModelTest.js'
                        ]
                    }, {
                        group : 'reader',
                        items : [
                            'src/view/mail/message/reader/AttachmentListControllerTest.js',
                            'src/view/mail/message/reader/MessageViewModelTest.js'
                        ]
                    }
                ]}]
            }]
        }]
    }, {
    group : 'classic',
    items : [{
        group : 'view',
        items : [{
            group : 'mail',
            items : [{
                group : 'folder',
                items : [
                    'classic/src/view/mail/folder/MailFolderTreeColumnTest.js',
                    'classic/src/view/mail/folder/MailFolderTreeTest.js'
                ]
            }, {
                group : 'inbox',
                items : [
                    'classic/src/view/mail/inbox/InboxViewTest.js'
                ]
            }, {
                group : 'message',
                items : [
                    'classic/src/view/mail/message/AbstractAttachmentListTest.js',
                    'classic/src/view/mail/message/MessageGridTest.js', {
                        group : 'editor',
                        items : [
                            'classic/src/view/mail/message/editor/AddressFieldTest.js',
                            'classic/src/view/mail/message/editor/AttachmentListTest.js',
                            'classic/src/view/mail/message/editor/HtmlEditorTest.js',
                            'classic/src/view/mail/message/editor/MessageEditorTest.js'
                        ]}, {
                        group : 'reader',
                        items : [
                            'classic/src/view/mail/message/reader/AttachmentListTest.js',
                            'classic/src/view/mail/message/reader/MessageViewTest.js'
                        ]}
                ]
            },
            'classic/src/view/mail/MailDesktopViewTest.js'
            ]
        }]
    }]
});
