/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

StartTest(t => {

    const create = () => {
        return Ext.create("conjoon.cn_mail.view.mail.account.MailAccountWizardController");
    };

    let ctrl;

    t.afterEach(function () {
        if (ctrl) {
            ctrl.destroy();
            ctrl = null;
        }
    });

    t.beforeEach(function () {


    });


    t.it("validates default config for\"other imap account\"", t => {
        ctrl = create();

        const cfg = ctrl.prepareConfig([]).pop();

        t.expect(cfg).toEqual({
            displayName: "... other IMAP account",
            name: "Email Account",
            config: {
                "inbox_type": "IMAP",
                "inbox_port": 993,
                "inbox_ssl": true,
                "outbox_port": 587,
                "outbox_secure": "tls",
                "subscriptions": ["INBOX"]
            }
        });
    });


    t.it("makeAccountModel()", t => {
        ctrl = create();

        const address = "user@tld.com";
        const name = "username";

        const mailAccount = ctrl.makeAccountModel({
            config: {}, accountName: "email account", name, address
        });

        t.expect(mailAccount.get("inbox_user")).toBe(address);
        t.expect(mailAccount.get("outbox_user")).toBe(address);
        t.expect(mailAccount.get("active")).toBe(true);
        t.expect(mailAccount.get("from")).toEqual({name, address});
        t.expect(mailAccount.get("replyTo")).toEqual({name, address});
    });


});
