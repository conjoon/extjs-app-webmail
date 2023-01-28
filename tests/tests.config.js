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

/**
 *
 */
export default {

    name: "extjs-app-webmail",

    timeout: 750,

    loaderPath: {

        /**
         * Universal
         */
        "conjoon.cn_mail": "../src",
        "conjoon.cn_mail.view.mail.account.MailAccountViewModel": "../src/view/mail/account/MailAccountViewModel.js",
        "conjoon.cn_mail.view.mail.account.MailAccountViewController": "../src/view/mail/account/MailAccountViewController.js",
        "conjoon.cn_mail.view.mail.account.MailAccountWizardController": "../src/view/mail/account/MailAccountWizardController.js",
        "conjoon.cn_mail.view.mail.inbox.InboxViewModel": "../src/view/mail/inbox/InboxViewModel.js",
        "conjoon.cn_mail.view.mail.inbox.InboxViewController": "../src/view/mail/inbox/InboxViewController.js",
        "conjoon.cn_mail.view.mail.message.reader.MessageViewModel": "../src/view/mail/message/reader/MessageViewModel.js",
        "conjoon.cn_mail.view.mail.message.reader.MessageViewController": "../src/view/mail/message/reader/MessageViewController.js",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel": "../src/view/mail/message/editor/MessageEditorViewModel.js",
        "conjoon.cn_mail.view.mail.message.AbstractAttachmentListController": "../src/view/mail/message/AbstractAttachmentListController.js",
        "conjoon.cn_mail.view.mail.message.reader.AttachmentListController": "../src/view/mail/message/reader/AttachmentListController.js",
        "conjoon.cn_mail.view.mail.message.editor.AttachmentListController": "../src/view/mail/message/editor/AttachmentListController.js",
        "conjoon.cn_mail.view.mail.MailDesktopViewController": "../src/view/mail/MailDesktopViewController.js",
        "conjoon.cn_mail.view.mail.MailDesktopViewModel": "../src/view/mail/MailDesktopViewModel.js",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController": "../src/view/mail/message/editor/MessageEditorViewController.js",
        "conjoon.cn_mail.view.mail.message.editor.MessageEditorDragDropListener": "../src/view/mail/message/editor/MessageEditorDragDropListener.js",

        /**
         * Classic
         */
        "conjoon.cn_mail.view": "../classic/src/view",

        /**
         * Requirements
         */
        "coon.user": "../node_modules/@coon-js/extjs-app-user/src/",
        "coon.core": "../node_modules/@coon-js/extjs-lib-core/src/",
        "coon.comp": "../node_modules/@coon-js/extjs-lib-comp/classic/src",
        "conjoon.dev.cn_mailsim": "../node_modules/@conjoon/extjs-dev-webmailsim/src"

    },

    preload: {
        js: [
            "../node_modules/@l8js/l8/dist/l8.runtime.umd.js"
        ]
    }
};
