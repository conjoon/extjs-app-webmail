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

describe('conjoon.cn_mail.model.mail.message.CompoundKeyedModelTest', function(t) {

    var model,
        messageBody;

    t.beforeEach(function() {

        model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
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

        t.expect(model.suspendSetter).toBe(false);

        t.expect(model.compoundKeyFields).toEqual(['mailAccountId', 'mailFolderId', 'id', 'localId']);
    });

    t.it("idProperty", function(t) {
        t.expect(model.getIdProperty()).toBe("localId");
    });


    t.it("Test fields", function(t) {

        let fields = ["mailAccountId", "mailFolderId", "id"],
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

        t.isCalledNTimes('checkForeignKeysForAction', model, 1);

        model.load({
            params : {
                mailAccountId : 'foo',
                mailFolderId : 'INBOX.Drafts',
                id           : '1'
            }
        });


    });


    t.it("save()", function(t) {

        let exc, e;

        model.set('mailAccountId', "a");
        model.set('mailFolderId', "INBOX.Drafts");
        model.set('id', "31424");

        t.isCalledNTimes('checkForeignKeysForAction', model, 1);
        t.expect(model.save()).toBeTruthy();
    });

    t.it("erase()", function(t) {

        let exc, e;

        model.set('mailAccountId', "a");
        model.set('mailFolderId', "INBOX.Drafts");
        model.set('id', "31424");

        t.isCalled('checkForeignKeysForAction', model);
        t.expect(model.erase()).toBeTruthy();
    });


    t.it("loadEntity()", function(t) {

        let exc, e;

        try{conjoon.cn_mail.model.mail.message.CompoundKeyedModel.loadEntity('1');} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");
        exc = undefined;

        let key = Ext.create('conjoon.cn_mail.data.mail.message.CompoundKey', {
                mailAccountId : 'foo',
                mailFolderId  : 'bar',
                id            : '1'
            }),
            options = {};

        t.isInstanceOf(conjoon.cn_mail.model.mail.message.CompoundKeyedModel.loadEntity(key, options),
            'conjoon.cn_mail.model.mail.message.CompoundKeyedModel');

        t.expect(options.params).toBeDefined();

        t.expect(options.params).toEqual({
            mailAccountId : 'foo',
            mailFolderId  : 'bar',
            id            : '1'
        });

        options.params = {
            mailAccountId : '8',
            mailFolderId  : '1',
            id            : '1',
            foobar        : 'foo'
        };

        conjoon.cn_mail.model.mail.message.CompoundKeyedModel.loadEntity(key, options);

        t.expect(options.params).toBeDefined();

        t.expect(options.params).toEqual({
            mailAccountId : 'foo',
            mailFolderId  : 'bar',
            id            : '1',
            foobar        : 'foo'
        });

    });


    t.it("checkForeignKeysForAction()", function(t) {

         model.set('mailAccountId', "");
         model.set('mailFolderId', "INBOX.Drafts");

         try{model.checkForeignKeysForAction(model.data, 'save');} catch(e){exc=e};
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain("must be set");
         t.expect(exc.msg.toLowerCase()).toContain("mailaccountid");
         t.expect(exc.action).toBe("save");
         exc = undefined;


         model.set('mailAccountId', "foo");
         model.set('mailFolderId', "");

         try{model.checkForeignKeysForAction(model.data, 'save');} catch(e){exc=e};
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain("must be set");
         t.expect(exc.msg.toLowerCase()).toContain("mailfolderid");
         t.expect(exc.action).toBe("save");
         exc = undefined;


         model.set('mailAccountId', "foo");
         model.set('mailFolderId', "INBOX.Drafts");

         t.expect(model.save()).toBeTruthy();

         model.commit();
         t.expect(model.phantom).toBe(false);

         try{model.checkForeignKeysForAction(model.data, 'save');} catch(e){exc=e};
         t.expect(exc).toBeDefined();
         t.expect(exc.msg).toBeDefined();
         t.expect(exc.msg.toLowerCase()).toContain("must be set");
         t.expect(exc.msg.toLowerCase()).toContain("id");
         t.expect(exc.action).toBe("save");
         exc = undefined;

        t.expect(model.checkForeignKeysForAction({
            mailAccountId : 'foo',
            mailFolderId : 'INBOX.Drafts',
            id           : '1'
        }, 'read')).toBe(true);

    });


    t.it("getAssociatedCompoundKeyedData()", function(t){
        t.expect(model.getAssociatedCompoundKeyedData()).toEqual([]);

    });


    t.it("set()", function(t) {

        let modelLeft = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel'),
            modelRight = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel'),
            fields = {
                mailAccountId : 'foo',
                mailFolderId : 'bar',
                id : 'snafu',
                localId : 'NEWID'

            };

        modelLeft.getAssociatedCompoundKeyedData = function() {
            return [modelRight];
        };

        for (var i in fields) {
            t.expect(modelRight.get(i)).not.toBe(fields[i]);
            modelLeft.set(i, fields[i]);
            t.expect(modelRight.get(i)).toBe(fields[i]);
            t.expect(modelLeft.get(i)).toBe(fields[i]);
            t.expect(modelRight.modified).toBeFalsy();
            t.expect(modelLeft.modified).toBeTruthy();
            t.expect(modelLeft.modified.hasOwnProperty(i)).toBe(true);
        }

        t.expect(modelLeft.getId()).toBe(fields.localId);
        t.expect(modelLeft.getId()).toBe(modelRight.getId());

    });


    t.it("compareAndApplyCompoundKeys()", function(t) {

        let createModel = function(fields) {
                return Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel',
                    Ext.apply({}, fields)
                );
            },
            field4 = {
                mailAccountId : 'foo',
                mailFolderId : 'bar',
                id : 'snafu',
                localId : 'NEWID'
            },
            field3 = {
                mailAccountId : 'foo',
                mailFolderId : 'bar',
                localId : 'NEWID'
            },
            field2 = {
                mailAccountId : 'ACCOUNT',
                mailFolderId : 'FOLDER'
            },
            field1 = {
                id : 'ID'
            },
            field0 = {},
            modelLeft, modelRight, newFields, exc, e;

        // left 4 right 4 fields same
        modelLeft = createModel(field4);
        modelRight = createModel(field4);
        t.expect(modelLeft.compareAndApplyCompoundKeys(modelRight, true)).toBe(true);

        // left 4 right 4 fields not same
        modelLeft = createModel(field4);
        modelRight = createModel(Ext.applyIf({mailFolderId : 'meh.'}, field4));
        try{modelLeft.compareAndApplyCompoundKeys(modelRight, true);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("compound key differs");
        exc = undefined;

        // left 4 right 4 fields same BUT localId
        modelLeft = createModel(field4);
        modelRight = createModel(Ext.applyIf({localId : 'meh.'}, field4));
        t.expect(modelLeft.compareAndApplyCompoundKeys(modelRight, true)).toBe(true);

        // left 2 right 2 not setting localId
        modelLeft = createModel(Ext.apply({localId : 'mmm'}, field2));
        modelRight = createModel(Ext.apply({localId : 'nnn'}, field2));
        t.expect(modelLeft.compareAndApplyCompoundKeys(modelRight, true)).toBe(true);
        t.expect(modelLeft.getId()).toBe('mmm');
        t.expect(modelRight.getId()).toBe('nnn');

        // left 2 right 1, presedence
        modelLeft = createModel(field2);
        modelRight = createModel(field1);
        modelLeft.compareAndApplyCompoundKeys(modelRight, true);
        for (let i in field2) {
            t.expect(modelRight.get(i)).toBe(modelLeft.get(i));
        }

        // left 2 right 1, not presedence
        modelLeft = createModel(field2);
        modelRight = createModel(field1);
        modelLeft.compareAndApplyCompoundKeys(modelRight, false);
        for (let i in field2) {
            t.expect(modelRight.get(i)).toBe(modelLeft.get(i));
        }

        // left 1 right 2, presedence
        modelLeft = createModel(field1);
        modelRight = createModel(field2);
        modelLeft.compareAndApplyCompoundKeys(modelRight, true);
        for (let i in field2) {
            t.expect(modelRight.get(i)).toBe(modelLeft.get(i));
        }

        // left 1 right 2, not presedence
        modelLeft = createModel(field1);
        modelRight = createModel(field2);
        modelLeft.compareAndApplyCompoundKeys(modelRight, false);
        for (let i in field1) {
            t.expect(modelRight.get(i)).toBe(modelLeft.get(i));
        }
        for (let i in field2) {
            t.expect(modelLeft.get(i)).not.toBe(modelRight.get(i));
        }

        modelLeft = createModel({});
        modelRight = createModel({mailFolderId : '4', mailAccountId : '5', id : '6', localId : 'zzz'});
        modelLeft.compareAndApplyCompoundKeys(modelRight);
        t.expect(modelLeft.get('mailFolderId')).toBe(modelRight.get('mailFolderId'));
        t.expect(modelLeft.get('mailAccountId')).toBe(modelRight.get('mailAccountId'));
        t.expect(modelLeft.get('mailAccountId')).toBe(modelRight.get('mailAccountId'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());

        modelLeft = createModel({mailFolderId : '4', mailAccountId : '5', id : '6', localId : 'zzz'});
        modelRight = createModel({});
        modelLeft.compareAndApplyCompoundKeys(modelRight);
        t.expect(modelLeft.get('mailFolderId')).toBe(modelRight.get('mailFolderId'));
        t.expect(modelLeft.get('mailAccountId')).toBe(modelRight.get('mailAccountId'));
        t.expect(modelLeft.get('mailAccountId')).toBe(modelRight.get('mailAccountId'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());

        modelLeft = createModel({});
        modelRight = createModel({mailFolderId : '4', mailAccountId : '5', id : '6', localId : 'zzz'});
        modelLeft.compareAndApplyCompoundKeys(modelRight, false);
        t.expect(modelLeft.get('mailFolderId')).not.toBe(modelRight.get('mailFolderId'));
        t.expect(modelLeft.get('mailAccountId')).not.toBe(modelRight.get('mailAccountId'));
        t.expect(modelLeft.get('mailAccountId')).not.toBe(modelRight.get('mailAccountId'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());


    });




});
