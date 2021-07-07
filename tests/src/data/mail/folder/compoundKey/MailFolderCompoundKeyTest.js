/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    const create = function (cfg) {
            return Ext.create("conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey", cfg);
        },
        MAILACCOUNTID = "foo",
        ID            = "foobar";


    t.it("constructor() / apply*()", t => {

        let key = create({mailAccountId: MAILACCOUNTID, id: ID});

        t.expect(key.getMailAccountId()).toBe(MAILACCOUNTID);
        t.expect(key.getId()).toBe(ID);

        t.isInstanceOf(key, "conjoon.cn_mail.data.mail.AbstractCompoundKey");
    });


    t.it("fromRecord()", t => {

        let key = conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey.fromRecord(Ext.create("Ext.data.Model", {
            mailAccountId: MAILACCOUNTID, id: ID
        }));

        t.isInstanceOf(key, "conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey");

    });


    t.it("createFor()", t => {

        let key = conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey.createFor(
            MAILACCOUNTID, ID
        );

        t.isInstanceOf(key, "conjoon.cn_mail.data.mail.folder.compoundKey.MailFolderCompoundKey");
    });
});