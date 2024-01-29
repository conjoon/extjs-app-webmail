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

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader", {

        });

        t.isInstanceOf(reader, "Ext.data.reader.Json");

        t.expect(reader.getRootProperty()).toBe("data");

        t.expect(reader.alias).toContain("reader.cn_mail-mailmessageentityjsonreader");

    });


    t.it("applyCompoundKey - exception", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader"),
            exc, data;

        try{reader.applyCompoundKey(null, "read");} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

        data = {};
        try{reader.applyCompoundKey(data, "read");} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

        data = {data: ""};
        try{reader.applyCompoundKey(data, "read");} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

        data = {data: {}};
        try{reader.applyCompoundKey(data, "");} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected value for");
        exc = undefined;

    });


    t.it("applyCompoundKey()", t => {

        const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader"),
            ret,
            keys = () => ({
                id: "c",
                localId: "f-t-l"
            }),
            data = () => ({
                included: [{
                    type: "MailFolder",
                    id: "b",
                    relationships: {
                        MailAccount: {
                            data: {
                                id: "a",
                                type: "MailAccount"
                            }
                        }
                    }
                }],
                data: [keys()]
            }), result = [{
                mailAccountId: "a",
                mailFolderId: "b",
                id: "c",
                localId: MessageEntityCompoundKey.createFor("a", "b", "c").toLocalId()
            }];

        ret = reader.applyCompoundKey(data(), "read");

        t.expect(ret.data).toEqual(result);

        let tData = {included: data().included, data: data().data[0]};
        ret = reader.applyCompoundKey(tData, "read");
        t.expect(ret.data).toEqual(result[0]);


    });


    t.it("applyCompoundKey() - success false", t => {

        // not considered with conjoon/php-lib-conjoon#8 anymore
        try {
            let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader"),
                ret = reader.applyCompoundKey({success: false}, "read");
            t.expect(ret).toEqual({success: false});
            t.fail("Exception was never thrown");
        } catch (e) {
            t.expect(e).toBeDefined();
        }

    });


    t.it("readRecords()", function (t){

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader");

        t.isCalledNTimes("applyCompoundKey", reader, 1);

        // exception is expected here and okay.
        try {reader.readRecords();}catch(e){
            // intentionally left empty
        }
    });


    t.it("getResponseData()", function (t){

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader");

        let response = {responseText: "{}", request: {action: "create"}};

        t.expect(reader.getResponseData(response)).toEqual({metaData: {cn_action: "create"}});
    });


    t.it("readRecords() - argument check", function (t){

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader"),
            ACTION = "";

        reader.applyCompoundKey = function (data, action) {
            ACTION = action;
        };

        reader.readRecords({metaData: {cn_action: "update"}});
        t.expect(ACTION).toBe("update");

        reader.readRecords({});
        t.expect(ACTION).toBe("");
    });


    t.it("readRecords() - applyCompoundKey not called if action was DESTROY", function (t){

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader");

        t.isntCalled("applyCompoundKey", reader);

        reader.readRecords({metaData: {cn_action: "destroy"}});

    });

});


