/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    var model;

    t.beforeEach(function () {
        model = Ext.create("conjoon.cn_mail.model.mail.account.MailAccount", {
            id: 1
        });
    });

    t.afterEach(function () {
        model = null;
    });


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------

    t.it("Should create instance and check basic configuration", t => {
        t.expect(model instanceof conjoon.cn_mail.model.mail.BaseTreeModel).toBe(true);

        t.expect(model.getIdProperty()).toBe("id");

    });

    t.it("Test Entity Name", t => {
        t.expect(
            model.entityName
        ).toBe("MailAccount");
    });

    t.it("toUrl()", t => {

        let model =  Ext.create("conjoon.cn_mail.model.mail.account.MailAccount", {
            id: "foo"
        });
        t.expect(model.toUrl()).toBe("cn_mail/account/foo");

    });


    t.it("Test Record Validity", t => {
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "Posteingang");
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "ACCOUNT");
        t.expect(model.isValid()).toBe(false);

        model.set("name", "foo");
        t.expect(model.isValid()).toBe(true);

        model.set("folderType", null);
        t.expect(model.isValid()).toBe(false);

        model.set("folderType", "ACCOUNT");
        t.expect(model.isValid()).toBe(true);
    });


    t.it("extjs-app-webmail#101", t => {
        t.isInstanceOf(model.getField("from"), "coon.core.data.field.EmailAddress");
        t.isInstanceOf(model.getField("replyTo"), "coon.core.data.field.EmailAddress");
    });


    t.it("test mappings php-lib-conjoon#8", t => {

        model.fields.forEach(field => {
            if (field.getName() !== "id" && Object.prototype.hasOwnProperty.call(field, "definedBy")) {
                t.expect(field.getMapping()).toBe(`attributes.${field.getName()}`);
            }
        });

    });

});
