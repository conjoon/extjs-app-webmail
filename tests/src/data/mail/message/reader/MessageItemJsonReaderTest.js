/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe('conjoon.cn_mail.view.mail.message.reader.MessageItemJsonReaderTest', function(t) {


    t.it("Should successfully create and test instance", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader', {

        });

        t.isInstanceOf(reader, 'conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader');

        t.expect(reader.alias).toContain('reader.cn_mail-mailmessageitemjsonreader');

    });



    t.it("applyCompoundKey()", function(t) {

        const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

        let reader = Ext.create('conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader'),
            ret,
            keys = function(){return {
                mailAccountId : 'a',
                mailFolderId : 'b',
                id : 'c'
            };},
            data = function() {
                return {data : [keys()]};
            },
            result = function(){
                return {
                    data : [{
                        mailAccountId : 'a',
                        mailFolderId : 'b',
                        id : 'c',
                        messageBodyId : MessageEntityCompoundKey.createFor(keys().mailAccountId, keys().mailFolderId, keys().id).toLocalId()
                    }]
                };
            }, pResult, pData;


        // Array
        pData = data();
        ret = reader.applyCompoundKey(pData, "read");
        t.expect(ret.data[0].messageBodyId).not.toBeUndefined();
        t.expect(ret.data[0].messageBodyId).toBe(result().data[0].messageBodyId);
        t.expect(ret.data[0].localId).toBe(result().data[0].messageBodyId);

        // Object
        pData = data();
        pData = {data : pData.data[0]};
        ret = reader.applyCompoundKey(pData, "read");
        pResult = {data : result().data[0]};
        t.expect(ret.data.messageBodyId).not.toBeUndefined();
        t.expect(ret.data.messageBodyId).toBe(pResult.data.messageBodyId);
        t.expect(ret.data.localId).toBe(pResult.data.messageBodyId);

        let chkKeys = ["update", "create", "destroy", "read"];
        for (let i = 0, len = chkKeys.length; i < len; i++) {
            pData = data();
            ret = reader.applyCompoundKey(pData, chkKeys[i]);
            if (chkKeys[i] !== "read") {
                t.expect(ret.data[0].messageBodyId).toBeUndefined();
            } else {
                t.expect(ret.data[0].messageBodyId).toBeDefined();
            }

        }

    });


    t.it("applyCompoundKey() - success false", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.message.reader.MessageItemJsonReader');
        ret = reader.applyCompoundKey({success : false}, "read");
        t.expect(ret).toEqual({success : false})
    });


});


