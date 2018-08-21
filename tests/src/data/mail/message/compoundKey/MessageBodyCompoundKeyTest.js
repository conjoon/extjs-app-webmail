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

describe('conjoon.cn_mail.data.mail.message.compoundKey.MessageBodyCompoundKeyTest', function(t) {

    const create = function(cfg) {
            return Ext.create('conjoon.cn_mail.data.mail.message.compoundKey.MessageBodyCompoundKey', cfg);
        },
        MAILACCOUNTID       = "foo",
        MAILFOLDERID        = "bar",
        PARENTMESSAGEITEMID = "barfoo",
        ID                  = "foobar";


    t.it("constructor() / apply*()", function(t) {

        let key = create({
            mailAccountId       : MAILACCOUNTID,
            mailFolderId        : MAILFOLDERID,
            parentMessageItemId : PARENTMESSAGEITEMID,
            id                  : ID
        });

        t.expect(key.getMailAccountId()).toBe(MAILACCOUNTID);
        t.expect(key.getMailFolderId()).toBe(MAILFOLDERID);
        t.expect(key.getParentMessageItemId()).toBe(PARENTMESSAGEITEMID);
        t.expect(key.getId()).toBe(ID);

        t.isInstanceOf(key, 'conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey');

    });


    t.it("fromRecord()", function(t) {

        let key = conjoon.cn_mail.data.mail.message.compoundKey.MessageBodyCompoundKey.fromRecord(Ext.create('Ext.data.Model', {
            mailAccountId : MAILACCOUNTID, mailFolderId : MAILFOLDERID, parentMessageItemId : PARENTMESSAGEITEMID, id : ID
        }));

        t.isInstanceOf(key, 'conjoon.cn_mail.data.mail.message.compoundKey.MessageBodyCompoundKey');

    });


    t.it("createFor()", function(t) {

        let key = conjoon.cn_mail.data.mail.message.compoundKey.MessageBodyCompoundKey.createFor(
            MAILACCOUNTID, MAILFOLDERID, PARENTMESSAGEITEMID, ID
        );

        t.isInstanceOf(key, 'conjoon.cn_mail.data.mail.message.compoundKey.MessageBodyCompoundKey');
    });

});