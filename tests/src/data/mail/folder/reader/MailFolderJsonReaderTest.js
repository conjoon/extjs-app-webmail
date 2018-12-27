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

describe('conjoon.cn_mail.view.mail.folder.reader.MailFolderJsonReaderTest', function(t) {


    t.it("Should successfully create and test instance", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader', {

        });

        t.isInstanceOf(reader, 'Ext.data.reader.Json');

        t.expect(reader.mailFolderModelClass).toBe('conjoon.cn_mail.model.mail.folder.MailFolder');

        t.expect(reader.alias).toContain('reader.cn_mail-mailfolderjsonreader');

    });


    t.it("applyCompoundKey - exception", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader'),
            exc, e, data;

        try{reader.applyCompoundKey(data);} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

        data = {data : ""};
        try{reader.applyCompoundKey(data);} catch(e) {exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("malformed");
        exc = undefined;

    });


    t.it("recurseChildren()", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader'),
            ret,
            data = {
                data : [{
                    mailAccountId : 'foo',
                    id            : 'bar'
                }, {
                    mailAccountId : 'foo2',
                    id            : 'bar2'
                }]
            }, result = {
                data : [{
                    modelType  : 'conjoon.cn_mail.model.mail.folder.MailFolder',
                    localId : 'foo-bar',
                    mailAccountId : 'foo',
                    id            : 'bar'
                }, {
                    modelType  : 'conjoon.cn_mail.model.mail.folder.MailFolder',
                    localId : 'foo2-bar2',
                    mailAccountId : 'foo2',
                    id            : 'bar2'
                }]
            };

        t.isCalled('recurseChildren', reader);

        ret = reader.applyCompoundKey(data);

        t.expect(ret).toEqual(result);
    });


    t.it("applyCompoundKey() - success false", function(t) {

        let reader = Ext.create('conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader');
        ret = reader.applyCompoundKey({success : false});
        t.expect(ret).toEqual({success : false})
    });


    t.it("readRecords()", function(t){

        let reader = Ext.create('conjoon.cn_mail.data.mail.folder.reader.MailFolderJsonReader');

        t.isCalledNTimes('applyCompoundKey', reader, 1);

        // exception is expected here and okay.
        try {reader.readRecords();}catch(e){}
    })


});


