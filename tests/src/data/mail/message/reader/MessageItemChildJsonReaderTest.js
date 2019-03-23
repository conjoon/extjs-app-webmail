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

describe('conjoon.cn_mail.view.mail.message.reader.MessageItemChildJsonReaderTest', function(t) {

    const CLASSNAME = 'conjoon.cn_mail.data.mail.message.reader.MessageItemChildJsonReader';

    t.it("Should successfully create and test instance", function(t) {

        let reader = Ext.create(CLASSNAME, {

        });

        t.isInstanceOf(reader, 'conjoon.cn_mail.data.mail.message.reader.MessageEntityJsonReader');

        t.expect(reader.alias).toContain('reader.cn_mail-mailmessageitemchildjsonreader');

    });



    t.it("applyCompoundKey()", function(t) {

        const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey,
              MessageItemChildCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey;

        let reader = Ext.create(CLASSNAME),
            ret,
            keys = {
                mailAccountId : 'a',
                mailFolderId : 'b',
                parentMessageItemId : 'c',
                id : 'd',
                localId : 'f-t-l',
                messageItemId : 'l-t-f'
            },
            data = {
                data : [keys]
            },
            result = {
                data : [{
                    mailAccountId : 'a',
                    mailFolderId : 'b',
                    parentMessageItemId : 'c',
                    id : 'd',
                    localId : MessageItemChildCompoundKey.createFor(keys.mailAccountId, keys.mailFolderId, keys.parentMessageItemId, keys.id).toLocalId(),
                    messageItemId : MessageEntityCompoundKey.createFor(keys.mailAccountId, keys.mailFolderId, keys.parentMessageItemId).toLocalId()
                }]
            };

        ret = reader.applyCompoundKey(data);

        t.expect(ret.data[0].messageItemId).toBe(result.data[0].messageItemId);
        t.expect(ret.data[0].localId).toBe(result.data[0].localId);

        data = {data : data.data[0]};
        ret = reader.applyCompoundKey(data);
        result = {data : result.data[0]};
        t.expect(ret.data.messageItemId).toBe(result.data.messageItemId);
        t.expect(ret.data.localId).toBe(result.data.localId);
    });


    t.it("applyCompoundKey() - success false", function(t) {

        let reader = Ext.create(CLASSNAME);
        ret = reader.applyCompoundKey({success : false});
        t.expect(ret).toEqual({success : false})
    });


    t.it("app-cn_mail#67", function(t) {

        let reader = Ext.create(CLASSNAME);
        ret = reader.applyCompoundKey({success : true});
        t.expect(ret).toEqual({success : true})
    });

});


