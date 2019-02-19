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

describe('conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModelTest', function(t) {

    let model;

    t.beforeEach(function() {

        model = Ext.create('conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel', {
        });

        TMPFUNC = conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel.prototype.getRepresentingCompoundKeyClass;

        conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel.prototype.getRepresentingCompoundKeyClass = function() {
            return conjoon.cn_mail.data.mail.AbstractCompoundKey;
        };

    });

    t.afterEach(function() {
        model       = null;

        conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel.prototype.getRepresentingCompoundKeyClass = TMPFUNC;
    });



// +----------------------------------------------------------------------------
// |                    =~. Unit Tests .~=
// +----------------------------------------------------------------------------

    t.it("Should create instance", function(t) {
        t.isInstanceOf(model, 'conjoon.cn_mail.model.mail.BaseTreeModel');
    });

    t.it("idProperty", function(t) {
        t.expect(model.getIdProperty()).toBe("localId");
    });

    t.it("Test fields", function(t) {

        let fields = ["mailAccountId", "id"],
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

        t.expect(model.getField('__id__')).toBeFalsy();

    });

});
