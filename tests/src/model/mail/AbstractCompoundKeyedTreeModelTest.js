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

    let model, TMPFUNC;

    t.beforeEach(function () {

        model = Ext.create("conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel", {
        });

        TMPFUNC = conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel.prototype.getRepresentingCompoundKeyClass;

        conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel.prototype.getRepresentingCompoundKeyClass = function () {
            return conjoon.cn_mail.data.mail.AbstractCompoundKey;
        };

    });

    t.afterEach(function () {
        model       = null;

        conjoon.cn_mail.model.mail.AbstractCompoundKeyedTreeModel.prototype.getRepresentingCompoundKeyClass = TMPFUNC;
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Should create instance", t => {
        t.isInstanceOf(model, "conjoon.cn_mail.model.mail.BaseTreeModel");
    });

    t.it("idProperty", t => {
        t.expect(model.getIdProperty()).toBe("localId");
    });

    t.it("Test fields", t => {

        let fields = ["mailAccountId", "id"],
            field;

        for (let i = 0, len = fields.length; i < len; i++) {

            field = fields[i];

            t.isInstanceOf(model.getField(field), "coon.core.data.field.CompoundKeyField");

            t.expect(model.getField(field)).toBeTruthy();

            t.expect(model.getField(field).critical).toBe(true);

            model.set(field, "");
            t.expect(model.get(field)).toBeUndefined();

            model.set(field, 1);
            t.expect(model.get(field)).toBe("1");

            model.set(field, 0);
            t.expect(model.get(field)).toBe("0");
        }

        t.expect(model.getField("__id__")).toBeFalsy();

    });

});
