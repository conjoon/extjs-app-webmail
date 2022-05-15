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
            return Ext.create("conjoon.cn_mail.data.mail.message.CompoundKey", cfg);
        },
        MAILACCOUNTID = "foo",
        MAILFOLDERID  = "bar",
        ID            = "foobar";


    t.it("constructor() / apply*()", t => {

        let exc;
        try{create();}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an object containing the properties");
        exc = undefined;


        try{create({mailAccountId: MAILACCOUNTID});}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an object containing the properties");
        exc = undefined;


        try{create({mailAccountId: MAILACCOUNTID, mailFolderId: MAILFOLDERID});}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an object containing the properties");
        exc = undefined;


        try{create({mailAccountId: MAILACCOUNTID, mailFolderId: MAILFOLDERID, id: 0});}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an object containing the properties");
        exc = undefined;

        let key = create({mailAccountId: MAILACCOUNTID, mailFolderId: MAILFOLDERID, id: ID});
        t.isInstanceOf(key, "conjoon.cn_mail.data.mail.AbstractCompoundKey");
        t.expect(key.getMailAccountId()).toBe(MAILACCOUNTID);
        t.expect(key.getMailFolderId()).toBe(MAILFOLDERID);
        t.expect(key.getId()).toBe(ID);

        t.isInstanceOf(key, "conjoon.cn_mail.data.mail.message.CompoundKey");

        try{key.setMailAccountId("bar");}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        t.expect(exc.msg.toLowerCase()).toContain("mailaccountid");
        exc = undefined;


        try{key.setMailFolderId("foo");}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        t.expect(exc.msg.toLowerCase()).toContain("mailfolderid");
        exc = undefined;


        try{key.setId("barfoo");}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        t.expect(exc.msg.toLowerCase()).toContain("id");
        exc = undefined;

    });


    t.it("toObject()", t => {

        let key = create({mailAccountId: MAILACCOUNTID, mailFolderId: MAILFOLDERID, id: ID});

        t.expect(key.toObject()).toEqual({
            mailAccountId: MAILACCOUNTID,
            mailFolderId: MAILFOLDERID,
            id: ID
        });
    });


    t.it("toString() / decode", t => {

        const
            key = create({mailAccountId: MAILACCOUNTID, mailFolderId: MAILFOLDERID, id: ID}),
            encodedKey = encodeURIComponent(btoa(JSON.stringify({
                mailAccountId: MAILACCOUNTID,
                mailFolderId: MAILFOLDERID,
                id: ID
            })));

        t.expect(key.toString()).toBe(encodedKey);

        t.expect(conjoon.cn_mail.data.mail.message.CompoundKey.decode(encodedKey)).toEqual({
            mailAccountId: MAILACCOUNTID,
            mailFolderId: MAILFOLDERID,
            id: ID
        });
    });


    t.it("toArray()", t => {

        let key = create({mailAccountId: MAILACCOUNTID, mailFolderId: MAILFOLDERID, id: ID});

        t.expect(key.toArray()).toEqual([
            MAILACCOUNTID, MAILFOLDERID, ID
        ]);

    });


    t.it("toLocalId()", t => {

        let key = create({mailAccountId: MAILACCOUNTID, mailFolderId: MAILFOLDERID, id: ID});

        t.expect(key.toLocalId()).toBe(
            MAILACCOUNTID + "-" + MAILFOLDERID + "-" + ID
        );

    });


    t.it("fromRecord()", t => {

        let exc = undefined;
        try{conjoon.cn_mail.data.mail.message.CompoundKey.fromRecord({});}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        exc = undefined;


        let key = conjoon.cn_mail.data.mail.message.CompoundKey.fromRecord(Ext.create("Ext.data.Model", {
            mailAccountId: MAILACCOUNTID, mailFolderId: MAILFOLDERID, id: ID
        }));

        t.expect(key.getMailAccountId()).toBe(MAILACCOUNTID);
        t.expect(key.getMailFolderId()).toBe(MAILFOLDERID);
        t.expect(key.getId()).toBe(ID);

    });


    t.it("createFor()", t => {

        let key = conjoon.cn_mail.data.mail.message.CompoundKey.createFor(
            MAILACCOUNTID, MAILFOLDERID, ID
        );

        t.expect(key.getMailAccountId()).toBe(MAILACCOUNTID);
        t.expect(key.getMailFolderId()).toBe(MAILFOLDERID);
        t.expect(key.getId()).toBe(ID);
    });


    t.it("createFor() - exception", t => {

        let exc = undefined;
        try{conjoon.cn_mail.data.mail.message.CompoundKey.createFor(
            MAILACCOUNTID, MAILFOLDERID
        );}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an object");
        exc = undefined;
    });


    t.it("equalTo()", t => {

        let keyLeft = conjoon.cn_mail.data.mail.message.CompoundKey.createFor(
                MAILACCOUNTID, MAILFOLDERID, ID
            ),
            keyRightOk = conjoon.cn_mail.data.mail.message.CompoundKey.createFor(
                MAILACCOUNTID, MAILFOLDERID, ID
            ),
            keyRightFalse = conjoon.cn_mail.data.mail.message.CompoundKey.createFor(
                MAILACCOUNTID, Ext.id(), ID
            );

        t.isCalled("toLocalId", keyLeft);
        t.isCalled("toLocalId", keyRightOk);
        t.isCalled("toLocalId", keyRightFalse);

        t.expect(keyLeft.equalTo(keyRightOk)).toBe(true);
        t.expect(keyLeft.equalTo(keyRightFalse)).toBe(false);
        t.expect(keyLeft.equalTo({})).toBe(false);
        t.expect(keyLeft.equalTo("a")).toBe(false);
    });
});
