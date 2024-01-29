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


    t.it("Should successfully create and test instance", t => {

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageBodyJsonReader", {

        });

        t.isInstanceOf(reader, "conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader");

        t.expect(reader.alias).toContain("reader.cn_mail-mailmessagebodyjsonreader");

    });


    t.it("applyCompoundKey()", t => {

        const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

        let reader = Ext.create("conjoon.cn_mail.data.mail.message.reader.MessageBodyJsonReader"),
            ret,
            keys = function (){return {
                id: "c"
            };},
            data = function () {
                return {
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
                };
            },
            result = function (){
                return {
                    data: [{
                        mailAccountId: "a",
                        mailFolderId: "b",
                        id: "c",
                        messageDraftId: MessageEntityCompoundKey.createFor(
                            "a", "b", "c").toLocalId()
                    }]
                };
            }, pResult, pData;

        t.expect(reader.foreignKeyProp).toBe("messageDraftId");

        // Array
        pData = data();
        ret = reader.applyCompoundKey(pData, "read");
        t.expect(ret.data[0].messageDraftId).not.toBeUndefined();
        t.expect(ret.data[0].messageDraftId).toBe(result().data[0].messageDraftId);
        t.expect(ret.data[0].localId).toBe(result().data[0].messageDraftId);

        // Object
        pData = data();
        pData = {included: pData.included, data: pData.data[0]};
        ret = reader.applyCompoundKey(pData, "read");
        pResult = {data: result().data[0]};
        t.expect(ret.data.messageDraftId).not.toBeUndefined();
        t.expect(ret.data.messageDraftId).toBe(pResult.data.messageDraftId);
        t.expect(ret.data.localId).toBe(pResult.data.messageDraftId);

        let chkKeys = ["update", "create", "destroy", "read"];
        for (let i = 0, len = chkKeys.length; i < len; i++) {
            pData = data();
            ret = reader.applyCompoundKey(pData, chkKeys[i]);
            if (chkKeys[i] !== "read") {
                t.expect(ret.data[0].messageDraftId).toBeUndefined();
            } else {
                t.expect(ret.data[0].messageDraftId).toBeDefined();
            }

        }

    });


});


