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

describe('conjoon.cn_mail.model.mail.CompoundKeyedModelTest', function(t) {

    var model,
        messageBody;

    t.beforeEach(function() {

        model = Ext.create('conjoon.cn_mail.model.mail.CompoundKeyedModel', {
        });


    });

    t.afterEach(function() {
        model       = null;
    });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it("Should create instance", function(t) {
        t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.BaseModel');
    });

    t.it("id", function(t) {
        t.expect(model.getIdProperty()).toBe("id");
    });


    t.it("Test fields", function(t) {

        let fields = ["mailAccountId", "mailFolderId", "originalId"],
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

        try{model.load();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set in params for load");
        exc = undefined;


        try{model.load({params : {mailFolderId : 'INBOX.Drafts'}});} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set in params for load");
        t.expect(exc.msg.toLowerCase()).toContain("mailaccountid");
        exc = undefined;

        try{model.load({params : {mailAccountId : 'foo'}});} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set in params for load");
        t.expect(exc.msg.toLowerCase()).toContain("mailfolderid");
        exc = undefined;

        t.expect(model.load({
            params : {
                mailAccountId : 'foo',
                mailFolderId : 'INBOX.Drafts'
            }
        })).toBeTruthy();

    });


    t.it("save()", function(t) {

        let exc, e;

        model.set('mailAccountId', "");
        model.set('mailFolderId', "INBOX.Drafts");

        try{model.save();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set before save");
        t.expect(exc.msg.toLowerCase()).toContain("mailaccountid");
        exc = undefined;


        model.set('mailAccountId', "foo");
        model.set('mailFolderId', "");

        try{model.save();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set before save");
        t.expect(exc.msg.toLowerCase()).toContain("mailfolderid");
        exc = undefined;


        model.set('mailAccountId', "foo");
        model.set('mailFolderId', "INBOX.Drafts");

        t.expect(model.save()).toBeTruthy();

        model.commit();
        t.expect(model.phantom).toBe(false);

        try{model.save();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set before save");
        t.expect(exc.msg.toLowerCase()).toContain("originalid");
        exc = undefined;


        model.set('originalId', "31424");

        t.expect(model.save()).toBeTruthy();


    });
});
