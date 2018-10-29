/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
            keys = {
                mailAccountId : 'a',
                mailFolderId : 'b',
                id : 'c'
            },
            data = {
                data : [keys]
            },
            result = {
                data : [{
                    mailAccountId : 'a',
                    mailFolderId : 'b',
                    id : 'c',
                    messageBodyId : MessageEntityCompoundKey.createFor(keys.mailAccountId, keys.mailFolderId, keys.id).toLocalId()
                }]
            };

        ret = reader.applyCompoundKey(data);

        t.expect(ret.data[0].messageBodyId).toBe(result.data[0].messageBodyId);
        t.expect(ret.data[0].localId).toBe(result.data[0].messageBodyId);

        data = {data : data.data[0]};
        ret = reader.applyCompoundKey(data);
        result = {data : result.data[0]};
        t.expect(ret.data.messageBodyId).toBe(result.data.messageBodyId);
        t.expect(ret.data.localId).toBe(result.data.messageBodyId);
    });


});


