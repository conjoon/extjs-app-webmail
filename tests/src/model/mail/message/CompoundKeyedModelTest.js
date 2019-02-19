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

        t.expect(model.compoundKeyFields).toEqual(['mailAccountId', 'mailFolderId', 'id']);

        t.expect(model.foreignKeyFields).toEqual(['mailAccountId', 'mailFolderId', 'id']);
    });

    t.it("idProperty", function(t) {
        t.expect(model.getIdProperty()).toBe("localId");
    });

    t.it("Test fields", function(t) {

        let fields = ["mailAccountId", "mailFolderId", "id"],
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



    t.it("erase() - phantom", function(t) {

        let exc, e;

        model.set('mailAccountId', "a");
        model.set('mailFolderId', "INBOX.Drafts");
        model.set('id', "31424");

        t.expect(model.phantom).toBe(true);
        t.isntCalled('checkForeignKeysForAction', model);
        t.expect(model.erase()).toBeTruthy();
    });


    t.it("erase()", function(t) {

        let exc, e;

        model.set('localId', "abcd");
        model.set('mailAccountId', "a");
        model.set('mailFolderId', "INBOX.Drafts");
        model.set('id', "31424");
        model.commit();

        t.expect(model.phantom).toBe(false);
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


    t.it("updateLocalId()", function(t) {

        let m = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
                id            : "foo-1",
                mailAccountId : "foo",
                mailFolderId  : "INBOX.Drafts"
            }),
            MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message
                .compoundKey.MessageEntityCompoundKey;

        let expected =
            MessageEntityCompoundKey.createFor(
                m.get('mailAccountId'),
                m.get('mailFolderId'),
                m.get('id')
            ).toLocalId();

        t.expect(m.getId()).not.toBe(expected);
        t.expect(m.updateLocalId()).toBe(expected);
        t.expect(m.modified).toBeFalsy();
        t.expect(m.getId()).toBe(expected);


        m = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel');
        expected = m.updateLocalId();
        t.expect(null).toBe(expected);

    });


    t.it("set()", function(t) {

        let modelLeft = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel'),
            modelRight = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel'),
            fields = {
                mailAccountId : 'foo',
                mailFolderId : 'bar',
                id : 'snafu'
            },
            CALLED = 0;

        modelRight.updateLocalId = function() {
            CALLED++;
        };

        modelRight.entityName = 'RIGHT';

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

        modelLeft.setId('NEWID');
        t.expect(CALLED).toBeGreaterThan(0);
        t.expect(modelLeft.getId()).toBe('NEWID');
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());

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
        t.expect(modelLeft.get('id')).toBe(modelRight.get('id'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());

        modelLeft = createModel({mailFolderId : '4', mailAccountId : '5', id : '6', localId : 'zzz'});
        modelRight = createModel({});
        modelLeft.compareAndApplyCompoundKeys(modelRight);
        t.expect(modelLeft.get('mailFolderId')).toBe(modelRight.get('mailFolderId'));
        t.expect(modelLeft.get('mailAccountId')).toBe(modelRight.get('mailAccountId'));
        t.expect(modelLeft.get('id')).toBe(modelRight.get('id'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());

        modelLeft = createModel({});
        modelRight = createModel({mailFolderId : '4', mailAccountId : '5', id : '6', localId : 'zzz'});
        modelLeft.compareAndApplyCompoundKeys(modelRight, false);
        t.expect(modelLeft.get('mailFolderId')).not.toBe(modelRight.get('mailFolderId'));
        t.expect(modelLeft.get('mailAccountId')).not.toBe(modelRight.get('mailAccountId'));
        t.expect(modelLeft.get('id')).not.toBe(modelRight.get('id'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());


    });


    t.it("isCompoundKeySet()", function(t) {
        let model;

        model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
        });

        t.expect(model.isCompoundKeySet()).toBe(false);

        model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            id : 1
        });
        t.expect(model.isCompoundKeySet()).toBe(false);

        model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            id : 1,
            mailAccountId : 'foo'
        });
        t.expect(model.isCompoundKeySet()).toBe(false);

        model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            id : 1,
            mailAccountId : 'foo',
            mailFolderId : undefined
        });
        t.expect(model.isCompoundKeySet()).toBe(false);


        model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            id : 1,
            mailAccountId : 'foo',
            mailFolderId : 'bar'
        });
        t.expect(model.isCompoundKeySet()).toBe(true);

    });


    t.it("set() with mapping for compoundKeyFields", function(t) {

        let modelLeft = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            }),
            modelRight = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            }),
            fields = {
                mailAccountId : 'foo',
                mailFolderId : 'bar',
                id : 'snafu'
            },
            targets = {
                mailAccountId : 'accountField',
                mailFolderId : 'folderField',
                id : 'idField'
            };

        modelRight.entityName = 'testModel';

        modelLeft.compoundKeyFields= {
            'testModel' : {
                mailAccountId : 'accountField',
                    mailFolderId : 'folderField',
                    id : 'idField'
            }
        };

        modelLeft.getAssociatedCompoundKeyedData = function() {
            return [modelRight];
        };

        for (var i in fields) {
            t.expect(modelRight.get(targets[i])).not.toBe(fields[i]);
            modelLeft.set(i, fields[i]);
            t.expect(modelRight.get(targets[i])).toBe(fields[i]);
            t.expect(modelLeft.get(i)).toBe(fields[i]);
            t.expect(modelRight.modified).toBeFalsy();
            t.expect(modelLeft.modified).toBeTruthy();
            t.expect(modelLeft.modified.hasOwnProperty(i)).toBe(true);
        }
    });


    t.it("compareAndApplyCompoundKeys() with mapping for compoundFields", function(t) {

        let mapping = {
            mailAccountId : 'accountField',
            mailFolderId : 'folderField',
            id : 'idField'
        };

        let createModel = function(fields, isRight) {

                let dir = isRight ? 'right' : 'left';

                if (dir === 'left') {

                    let modelLeft = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel',
                        Ext.apply({}, fields)
                    );

                    modelLeft.compoundKeyFields= {
                        'testModel' : {
                            mailAccountId : 'accountField',
                            mailFolderId : 'folderField',
                            id : 'idField'
                        }
                    };

                    return modelLeft;

                } else {

                    let modelRight = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel',
                        Ext.apply({}, fields)
                    );
                    modelRight.entityName = 'testModel';

                    return modelRight;
                }

            },
            field4 = {
                mailAccountId : 'foo',
                mailFolderId : 'bar',
                id : 'snafu',
                localId : 'NEWID'
            },
            field4_r = {
                accountField : 'foo',
                folderField : 'bar',
                idField : 'snafu',
                localId : 'NEWID'
            },
            field3 = {
                mailAccountId : 'foo',
                mailFolderId : 'bar',
                localId : 'NEWID'
            },
            field3_r = {
                accountField : 'foo',
                folderField : 'bar',
                localId : 'NEWID'
            },
            field2 = {
                mailAccountId : 'ACCOUNT',
                mailFolderId : 'FOLDER'
            },
            field2_r = {
                accountField : 'ACCOUNT',
                folderField : 'FOLDER'
            },
            field1 = {
                id : 'ID'
            },
            field1_r = {
                id : 'ID'
            },
            field0 = {},
            modelLeft, modelRight, newFields, exc, e;

        // left 4 right 4 fields same
        modelLeft = createModel(field4);
        modelRight = createModel(field4_r, true);
        t.expect(modelLeft.compareAndApplyCompoundKeys(modelRight, true)).toBe(true);

        // left 4 right 4 fields not same
        modelLeft = createModel(field4);
        modelRight = createModel(Ext.applyIf({folderField : 'meh.'}, field4_r), true);
        try{modelLeft.compareAndApplyCompoundKeys(modelRight, true);}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("compound key differs");
        exc = undefined;

        // left 4 right 4 fields same BUT localId
        modelLeft = createModel(field4);
        modelRight = createModel(Ext.applyIf({localId : 'meh.'}, field4_r), true);
        t.expect(modelLeft.compareAndApplyCompoundKeys(modelRight, true)).toBe(true);

        // left 2 right 2 not setting localId
        modelLeft = createModel(Ext.apply({localId : 'mmm'}, field2));
        modelRight = createModel(Ext.apply({localId : 'nnn'}, field2_r), true);
        t.expect(modelLeft.compareAndApplyCompoundKeys(modelRight, true)).toBe(true);
        t.expect(modelLeft.getId()).toBe('mmm');
        t.expect(modelRight.getId()).toBe('nnn');

        // left 2 right 1, presedence
        modelLeft = createModel(field2);
        modelRight = createModel(field1_r, true);
        modelLeft.compareAndApplyCompoundKeys(modelRight, true);
        for (let i in field2) {
            t.expect(modelRight.get(mapping[i])).toBe(modelLeft.get(i));
        }

        // left 2 right 1, not presedence
        modelLeft = createModel(field2);
        modelRight = createModel(field1_r, true);
        modelLeft.compareAndApplyCompoundKeys(modelRight, false);
        for (let i in field2) {
            t.expect(modelRight.get(mapping[i])).toBe(modelLeft.get(i));
        }

        // left 1 right 2, presedence
        modelLeft = createModel(field1);
        modelRight = createModel(field2_r, true);
        modelLeft.compareAndApplyCompoundKeys(modelRight, true);


        for (let i in field2) {
            t.expect(modelRight.get(mapping[i])).toBe(modelLeft.get(i));
        }

        // left 1 right 2, not presedence
        modelLeft = createModel(field1);
        modelRight = createModel(field2_r, true);
        modelLeft.compareAndApplyCompoundKeys(modelRight, false);
        for (let i in field1) {
            t.expect(modelRight.get(mapping[i])).toBe(modelLeft.get(i));
        }
        for (let i in field2) {
            t.expect(modelLeft.get(i)).not.toBe(modelRight.get(mapping[i]));
        }

        modelLeft = createModel({});
        modelRight = createModel({folderField : '4', accountField : '5', idField : '6', localId : 'zzz'}, true);
        modelLeft.compareAndApplyCompoundKeys(modelRight);
        t.expect(modelLeft.get('mailFolderId')).toBe(modelRight.get('folderField'));
        t.expect(modelLeft.get('mailAccountId')).toBe(modelRight.get('accountField'));
        t.expect(modelLeft.get('id')).toBe(modelRight.get('idField'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());

        modelLeft = createModel({mailFolderId : '4', mailAccountId : '5', id : '6', localId : 'zzz'});
        modelRight = createModel({}, true);
        modelLeft.compareAndApplyCompoundKeys(modelRight);
        t.expect(modelLeft.get('mailFolderId')).toBe(modelRight.get('folderField'));
        t.expect(modelLeft.get('mailAccountId')).toBe(modelRight.get('accountField'));
        t.expect(modelLeft.get('id')).toBe(modelRight.get('idField'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());

        modelLeft = createModel({});
        modelRight = createModel({folderField : '4', accountField : '5', idField : '6', localId : 'zzz'}, true);
        modelLeft.compareAndApplyCompoundKeys(modelRight, false);
        t.expect(modelLeft.get('mailFolderId')).not.toBe(modelRight.get('folderField'));
        t.expect(modelLeft.get('mailAccountId')).not.toBe(modelRight.get('accountField'));
        t.expect(modelLeft.get('id')).not.toBe(modelRight.get('idField'));
        t.expect(modelLeft.getId()).not.toBe(modelRight.getId());


    });


    t.it("processRecordAssociation()", function(t) {
        t.expect(model.processRecordAssociation).toBe(Ext.emptyFn);
    });


    t.it("compareAndApplyCompoundKeys() - entity mapping, but field is array", function(t) {

        let modelLeft = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            // enforcing a bug that should be fixed with this test
            '1' : 1
        });

        modelLeft.compoundKeyFields= {
            'foo' : {
                'bar' : 'x'
            },
            'testModel' : [
                'accountField',
                'folderField',
                'idField'
            ]
        };

        let modelRight = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            'accountField' : 'x',
            'folderField'  : 'y',
            'idField'      : 'z'
        });
        modelRight.entityName = 'testModel';

        t.expect(modelLeft.compareAndApplyCompoundKeys(modelRight, true)).toBe(true);

        t.expect(modelRight.get('accountField')).toBe('x');
        t.expect(modelRight.get('folderField')).toBe('y');
        t.expect(modelRight.get('idField')).toBe('z');

        t.expect(modelLeft.get('accountField')).toBe('x');
        t.expect(modelLeft.get('folderField')).toBe('y');
        t.expect(modelLeft.get('idField')).toBe('z');
    });


    t.it("getCompoundKey()", function(t) {

        let model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            'mailFolderId' : 'x',
            'mailAccountId'  : 'y',
            'id'      : 'z'
        });

        t.isCalledNTimes('checkForeignKeysModified', model, 1);

        t.isInstanceOf(model.getCompoundKey(), 'conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey');
    });


    t.it("save() - consider modified (UPDATE)", function(t) {

        let exc, e;

        model.set('mailAccountId', "a");
        model.set('mailFolderId', "INBOX.Drafts");
        model.set('id', "31424");

        model.commit();

        t.expect(model.phantom).toBe(false);

        // will use modified for keys
        model.set('mailFolderId', "meh.");
        model.set('mailFolderId', undefined);


        let ret = model.save();

        t.expect(ret).toBeTruthy();

        let jsonData = ret.getRequest().getJsonData();

        t.expect(jsonData.hasOwnProperty('mailFolderId')).toBe(true);
        t.expect(jsonData.mailFolderId).toBeUndefined();

        t.waitForMs(500, function() {

        });
    });


    t.it("save() - consider modified (CREATE)", function(t) {

        let exc, e;

        model.set('mailAccountId', "a");
        model.set('mailFolderId', "INBOX.Drafts");
        model.set('id', "31424");


        t.expect(model.phantom).toBe(true);
        model.set('mailFolderId', undefined);

        try{model.save();}catch(e){exc = e;}
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain("must be set");


        t.waitForMs(500, function() {

        });
    });


    t.it("erase() - consider modified (NO PHANTOM)", function(t) {

        let exc, e;

        model.set('mailAccountId', "a");
        model.set('mailFolderId', "INBOX.Drafts");
        model.set('id', "31424");

        model.commit();

        t.expect(model.phantom).toBe(false);

        // will use modified for keys
        model.set('mailFolderId', "meh.");
        model.set('mailFolderId', undefined);


        let ret = model.erase();

        t.expect(ret).toBeTruthy();

        t.waitForMs(500, function() {

        });
    });


    t.it("erase() - consider modified (PHANTOM) ", function(t) {

        let exc, e;

        model.set('mailAccountId', "a");
        model.set('mailFolderId', "INBOX.Drafts");
        model.set('id', "31424");


        t.expect(model.phantom).toBe(true);
        model.set('mailFolderId', undefined);

        try{model.save();}catch(e){exc = e;}
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg).toContain("must be set");


        t.waitForMs(500, function() {

        });
    });


    t.it("set/reject - association is also reset", function(t) {

        let modelL = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            mailAccountId : 'meh.'
        });


        let modelR = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
            mailFolderId : 'YO!',
            mailAccountId : 'snafu'
        });


        modelL.getAssociatedCompoundKeyedData = function() {
            return [modelR];
        };

        modelL.set('mailAccountId', 'foobar');

        t.expect(modelR.get('mailAccountId')).toBe('foobar');

        modelL.reject();

        t.expect(modelR.get('mailAccountId')).toBe('meh.');

    });


    t.it("checkForeignKeysModified()", function(t) {

        let exc, e,
            model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
                mailFolderId : 'foo'
            });

        model.set('mailFolderId', '3');
        t.expect(model.modified.hasOwnProperty('mailFolderId')).toBe(true);

        try{model.checkForeignKeysModified();}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("can not use current information");


    });


    t.it("getPreviousCompoundKey()", function(t) {

        let exc, e,
            model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
                mailFolderId  : 'foo',
                mailAccountId : 'bar',
                id            : 'snafu'
            });

        let ck1 = model.getCompoundKey();

        t.expect(ck1.equalTo(model.getPreviousCompoundKey())).toBe(true);
        t.expect(ck1.equalTo(model.getCompoundKey())).toBe(true);

        model.commit();
        model.set('mailAccountId', 'meh.');

        model.save();
        model.commit();

        t.expect(ck1.equalTo(model.getCompoundKey())).toBe(false);

        t.expect(ck1.equalTo(model.getPreviousCompoundKey())).toBe(true);



    });


    t.it("localId updated when compound key value changes", function(t) {

        let model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {
                localId : 'abc'
            });

        t.expect(model.getId()).toBe('abc');

        model.set('mailAccountId', 'foo');

        t.expect(model.getId()).toBe('abc');

        model.set('mailFolderId', 'bar');

        t.expect(model.getId()).toBe('abc');

        model.set('id', 'snafu');

        t.expect(model.getId()).toBe('foo-bar-snafu');
    });


    t.it("previousCompoundKey available upon reject()", function(t) {

        let model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {

        });

        model.set('mailAccountId', 'foo');
        model.set('mailFolderId', 'bar');
        model.set('id', 'snafu');

        model.commit();

        t.expect(model.getPreviousCompoundKey().toLocalId()).toBe('foo-bar-snafu');

        model.set('type', 'meh.');
        model.commit();
        model.set('type2', 'meh.');
        model.commit();

        t.expect(model.getPreviousCompoundKey().toLocalId()).toBe('foo-bar-snafu');

        model.set('mailAccountId', 'bla');
        model.commit();
        model.set('type2', 'meh.');
        model.commit();
        model.commit();

        t.expect(model.getPreviousCompoundKey().toLocalId()).toBe('foo-bar-snafu');

        model.set('mailAccountId', 'test23');
        model.commit();

        t.expect(model.getPreviousCompoundKey().toLocalId()).toBe('bla-bar-snafu');

        model.set('mailAccountId', 'sdfdgddggdsdg');


        model.reject();

        t.expect(model.getCompoundKey().toLocalId()).toBe('test23-bar-snafu');
        t.expect(model.getPreviousCompoundKey().toLocalId()).toBe('bla-bar-snafu');


        model.set('mailAccountId', 'bla1');
        model.commit();

        t.expect(model.getPreviousCompoundKey().toLocalId()).toBe('test23-bar-snafu');
        t.expect(model.getCompoundKey().toLocalId()).toBe('bla1-bar-snafu');


    });


    t.it("getRepresentingCompoundKeyClass", function(t) {

        let model = Ext.create('conjoon.cn_mail.model.mail.message.CompoundKeyedModel', {

        });

        t.expect(model.getRepresentingCompoundKeyClass()).toBe(
            conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey
        );

    });


});
