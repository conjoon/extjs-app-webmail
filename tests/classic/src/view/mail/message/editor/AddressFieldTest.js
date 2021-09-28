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

    var view, viewConfig;

    t.afterEach(function () {
        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function () {
        viewConfig = {
            renderTo: document.body
        };
    });


    t.it("Should create and show the AddressField along with default config checks", t => {
        view = Ext.create(
            "conjoon.cn_mail.view.mail.message.editor.AddressField", viewConfig);

        t.expect(view instanceof Ext.form.field.Tag).toBeTruthy();

        t.expect(view.alias).toContain("widget.cn_mail-mailmessageeditoraddressfield");

        t.expect(view.forceSelection).toBe(false);
        t.expect(view.triggerOnClick).toBe(false);
        t.expect(view.createNewOnEnter).toBe(true);
        t.expect(view.getHideTrigger()).toBe(true);
        t.expect(view.createNewOnBlur).toBe(false);

    });

});
