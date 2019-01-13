/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.model.mail.BaseModelTest', function(t) {

    t.requireOk('conjoon.cn_mail.model.mail.BaseModel', function() {

        Ext.define('conjoon.cn_mail.model.mail.BaseModelExtended', {
            extend     : 'conjoon.cn_mail.model.mail.BaseModel',
            idProperty : 'foo'
        });

        Ext.define('conjoon.cn_mail.model.mail.BaseModelExtendedNoId', {
            extend : 'conjoon.cn_mail.model.mail.BaseModel'
        });

        var model;


        t.afterEach(function() {
            model = null;
        });


// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

        t.it("Should not work without setting idProperty in subclass", function(t) {

            let exc, e;
            try{Ext.create('conjoon.cn_mail.model.mail.BaseModel');}catch(e){exc=e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("needs to be explicitly set");
            exc = undefined;

            try{Ext.create('conjoon.cn_mail.model.mail.BaseModel', {idProperty : 'foo'});}catch(e){exc=e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("needs to be explicitly set");
            exc = undefined;


            try{Ext.create('conjoon.cn_mail.model.mail.BaseModelExtendedNoId');}catch(e){exc=e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("needs to be explicitly set");
            exc = undefined;

            try{Ext.create('conjoon.cn_mail.model.mail.BaseModelExtendedNoId', {idProperty : 'foo'});}catch(e){exc=e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("needs to be explicitly set");
            exc = undefined;

        });


        t.it("constructor", function(t) {

            model = Ext.create('conjoon.cn_mail.model.mail.BaseModelExtended', {
                id : 1
            });

            t.expect(model instanceof conjoon.cn_core.data.BaseModel).toBe(true);

            t.expect(model.getIdProperty()).toBe("foo");

        });


        t.it("Test Schema", function(t) {
            model = Ext.create('conjoon.cn_mail.model.mail.BaseModelExtended', {
                id : 1
            });

            t.expect(
                model.schema instanceof conjoon.cn_mail.data.mail.BaseSchema
            ).toBeTruthy();
        });



        t.it("Test Proxy", function(t) {

            t.expect(conjoon.cn_mail.model.mail.BaseModel.getProxy() instanceof Ext.data.proxy.Rest).toBe(true);
        });



    });


});
