/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe("conjoon.cn_mail.model.mail.message.ItemAttachmentTest", function (t) {

    var model;

    t.beforeEach(function () {
        model = Ext.create("conjoon.cn_mail.model.mail.message.ItemAttachment", {
            localId: 1,
            mailFolderId: 4,
            mailAccountId: 5,
            id: 1,
            parentMessageItemId: 1
        });
    });

    t.afterEach(function () {
        model = null;
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Should create instance", function (t) {
        t.isInstanceOf(model, "conjoon.cn_mail.model.mail.message.MessageItemChildModel");
        t.isInstanceOf(model, "conjoon.cn_mail.model.mail.message.AbstractAttachment");
    });

    t.it("Test Entity Name", function (t) {
        t.expect(
            model.entityName
        ).toBe("ItemAttachment");
    });

    t.it("Test Record Validity", function (t) {
        t.expect(model.isValid()).toBe(true);
    });

    t.it("Test mailFolderId", function (t) {
        t.expect(model.getField("mailFolderId")).toBeTruthy();
        t.expect(model.getField("mailFolderId").critical).toBe(true);
        t.isInstanceOf(model.getField("mailFolderId"), "coon.core.data.field.CompoundKeyField");
    });

    t.it("Test mailAccountId", function (t) {
        t.expect(model.getField("mailAccountId")).toBeTruthy();
        t.expect(model.getField("mailAccountId").critical).toBe(true);
        t.isInstanceOf(model.getField("mailAccountId"), "coon.core.data.field.CompoundKeyField");
    });

    t.it("localId", function (t) {
        t.expect(model.getIdProperty()).toBe("localId");
    });

    t.it("id", function (t) {
        t.expect(model.getField("id")).toBeTruthy();
        t.expect(model.getField("id").critical).toBe(true);
        t.isInstanceOf(model.getField("id"), "coon.core.data.field.CompoundKeyField");
    });

    t.it("parentMessageItemId", function (t) {
        t.expect(model.getField("parentMessageItemId")).toBeTruthy();
    });

});
