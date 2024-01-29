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

        let reader = Ext.create("conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader", {

        });

        t.isInstanceOf(reader, "Ext.data.reader.Json");

        t.expect(reader.getRootProperty()).toBe("data");

        t.expect(reader.getTypeProperty()).toBe("modelType");

        t.expect(reader.mailAccountModelClass).toBe("conjoon.cn_mail.model.mail.account.MailAccount");

        t.expect(reader.alias).toContain("reader.cn_mail-mailaccountjsonreader");

    });


    t.it("applyCompoundKey - exception", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader"),
            data;

        try {
            reader.applyModelTypes(data);
            t.fail("Exception was never thrown");
        } catch(e) {
            t.expect(e.msg.toLowerCase()).toContain("malformed");
        }

        data = {};
        try {
            reader.applyModelTypes(data);
            t.fail("Exception was never thrown");
        } catch(e) {
            t.expect(e.msg.toLowerCase()).toContain("malformed");
        }

        data = {data: ""};
        try {
            reader.applyModelTypes(data);
            t.fail("Exception was never thrown");
        } catch(e) {
            t.expect(e.msg.toLowerCase()).toContain("malformed");
        }
    });


    t.it("applyModelTypes()", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader"),
            ret,
            data = {
                data: [{
                }]
            }, result = {
                data: [{
                    modelType: "conjoon.cn_mail.model.mail.account.MailAccount",
                    attributes: {
                        folderType: conjoon.cn_mail.data.mail.folder.MailFolderTypes.ACCOUNT
                    }
                }]
            };

        ret = reader.applyModelTypes(data);

        t.expect(ret).toEqual(result);

        data.data[0] = {};

        data = {data: data.data[0]};
        ret = reader.applyModelTypes(data);
        result = {data: result.data[0]};
        t.expect(ret).toEqual(result);


    });


    t.it("applyCompoundKey() - success false", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader");

        try {
            reader.applyModelTypes({success: false});
            t.fail("Exception was never thrown");
        } catch(e) {
            t.expect(e.msg.toLowerCase()).toContain("malformed");
        }

    });


    t.it("processHybridData()", function (t){

        let reader = Ext.create("conjoon.cn_mail.data.mail.account.reader.MailAccountJsonReader"),
            data = {
                data: [{
                    id: "bar",
                    relationships: {
                        MailAccounts: {
                            data: {id: "foo", type: "MailAccount"}
                        }
                    }
                }]
            },
            result = {
                data: [{
                    modelType: "conjoon.cn_mail.model.mail.folder.MailFolder",
                    id: "bar",
                    localId: "foo-bar",
                    relationships: {
                        MailAccounts: {
                            data: {id: "foo", type: "MailAccount"}
                        }
                    }
                }]
            };

        t.isCalledNTimes("peekFolder", reader, 1);

        t.expect(reader.processHybridData(data)).toEqual(result);
    });


});


