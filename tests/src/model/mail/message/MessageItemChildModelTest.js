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

describe('conjoon.cn_mail.model.mail.message.MessageItemChildModelTest', function(t) {

    var model,
        messageBody;

    t.beforeEach(function() {

        model = Ext.create('conjoon.cn_mail.model.mail.message.MessageItemChildModel', {
        });


    });

    t.afterEach(function() {
        model       = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it("Should create instance", function(t) {
        t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.message.CompoundKeyedModel');

        t.expect(model.foreignKeyFields).toEqual(['mailAccountId', 'mailFolderId', 'parentMessageItemId', 'id']);
    });


    t.it("Test fields", function(t) {

        let fields = ["parentMessageItemId"],
            field;

        for (let i = 0, len = fields.length; i < len; i++) {

            field = fields[i];

            t.isInstanceOf(model.getField(field), 'coon.core.data.field.CompoundKeyField');

            t.expect(model.getField(field)).toBeTruthy();

            t.expect(model.getField(field).critical).toBe(true);

            model.set(field, "");
            t.expect(model.get(field)).toBeUndefined();

            model.set(field, 1);
            t.expect(model.get(field)).toBe("1");

            model.set(field, 0);
            t.expect(model.get(field)).toBe("0");
        }

    });


    t.it("load()", function(t) {

        let exc, e;

        try{model.load({
            params : {
                mailAccountId : 'a',
                mailFolderId  : 'b',
                id            : 'c'
            }
        });} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set");
        t.expect(exc.msg.toLowerCase()).toContain("parentmessageitemid");
        exc = undefined;

    });


    t.it("save()", function(t) {

        let exc, e;

        model.set({
            mailAccountId : 'a',
            mailFolderId  : 'b',
            id            : 'c'
        });

        try{model.save();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set");
        t.expect(exc.msg.toLowerCase()).toContain("parentmessageitemid");
        exc = undefined;

    });



    t.it("updateLocalId()", function(t) {

        let m = Ext.create('conjoon.cn_mail.model.mail.message.MessageItemChildModel', {
                id            : "foo-1",
                mailAccountId : "foo",
                mailFolderId  : "INBOX.Drafts",
                parentMessageItemId : 'bar'
            }),
            MessageItemChildCompoundKey = conjoon.cn_mail.data.mail.message
                .compoundKey.MessageItemChildCompoundKey;

        let expected =
            MessageItemChildCompoundKey.createFor(
                m.get('mailAccountId'),
                m.get('mailFolderId'),
                m.get('parentMessageItemId'),
                m.get('id')
            ).toLocalId();


        t.expect(m.getId()).not.toBe(expected);
        t.expect(m.updateLocalId()).toBe(expected);
        t.expect(m.modified).toBeFalsy();
        t.expect(m.getId()).toBe(expected);


        m = Ext.create('conjoon.cn_mail.model.mail.message.MessageItemChildModel');
        expected = m.updateLocalId();
        t.expect(null).toBe(expected);

    });


    t.it("getCompoundKey()", function(t) {

        let model = Ext.create('conjoon.cn_mail.model.mail.message.MessageItemChildModel', {
            'mailFolderId' : 'x',
            'mailAccountId'  : 'y',
            'parentMessageItemId' : 'v',
            'id'      : 'z'
        });

        t.isCalledNTimes('checkForeignKeysModified', model, 1);
        t.isInstanceOf(model.getCompoundKey(), 'conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey');
    });


    t.it("getRepresentingCompoundKeyClass", function(t) {

        let model = Ext.create('conjoon.cn_mail.model.mail.message.MessageItemChildModel', {

        });

        t.expect(model.getRepresentingCompoundKeyClass()).toBe(
            conjoon.cn_mail.data.mail.message.compoundKey.MessageItemChildCompoundKey
        );

    });


});
