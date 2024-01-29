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

StartTest(t => {


    t.it("Should successfully create and test instance", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader", {

        });

        t.isInstanceOf(reader, "Ext.data.reader.Json");

        t.expect(reader.mailFolderModelClass).toBe("conjoon.cn_mail.model.mail.folder.MailFolder");

        t.expect(reader.alias).toContain("reader.cn_mail-mailfolderjsonreader");

    });


    t.it("applyCompoundKey - exception", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader"),
            exc, data;

        try{reader.applyCompoundKey(data);} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

        data = {data: ""};
        try{reader.applyCompoundKey(data);} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");

    });


    t.it("recurseChildren()", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader"),
            ret,
            data = {
                data: [{
                    id: "bar",
                    relationships: {
                        MailAccounts: {
                            data: {type: "MailAccount", id: "foo"}
                        }
                    }
                }, {
                    id: "bar2",
                    relationships: {
                        MailAccounts: {
                            data: {type: "MailAccount", id: "foo2"}
                        }
                    }
                }]
            }, result = {
                data: [{
                    modelType: "conjoon.cn_mail.model.mail.folder.MailFolder",
                    localId: "foo-bar",
                    id: "bar",
                    relationships: {
                        MailAccounts: {
                            data: {type: "MailAccount", id: "foo"}
                        }
                    }
                }, {
                    modelType: "conjoon.cn_mail.model.mail.folder.MailFolder",
                    localId: "foo2-bar2",
                    id: "bar2",
                    relationships: {
                        MailAccounts: {
                            data: {type: "MailAccount", id: "foo2"}
                        }
                    }
                }]
            };

        t.isCalled("recurseChildren", reader);

        ret = reader.applyCompoundKey(data);

        t.expect(ret).toEqual(result);
    });


    t.it("applyCompoundKey() - success false", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader");

        try {
            reader.applyCompoundKey({success: false});
            t.fail("Exception was never thrown.");
        } catch (e) {
            t.expect(e.msg).toContain("malformed");
        }

    });


    t.it("readRecords()", function (t){

        let reader = Ext.create("conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader");

        t.isCalledNTimes("applyCompoundKey", reader, 1);

        // exception is expected here and okay.
        t.throwsOk(function () {
            reader.readRecords();
        }, "malformed");
    });


});


