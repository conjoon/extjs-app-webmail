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

            t.isInstanceOf(model.getField(field), 'conjoon.cn_core.data.field.CompoundKeyField');

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
