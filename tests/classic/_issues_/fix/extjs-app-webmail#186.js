/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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


StartTest(async t => {


    // +-----------------------------------------
    // | Tests
    // +-----------------------------------------
    t.diag("fix: add attachment button in menu does not work (conjoon/extjs-app-webmail#186)");


    t.it("createOverflowHandlerInterceptor()", t => {

        const
            func = function () { return true;},
            cmp = Ext.create("conjoon.cn_mail.view.mail.message.editor.HtmlEditor"),
            cfg = cmp.createOverflowHandlerInterceptor(func);

        t.expect(cfg({}, Ext.create("coon.comp.form.field.FileButton"))).toBe(null);
        t.expect(cfg({}, {})).toBe(true);

        cmp.destroy();
    });


    t.it("createToolbar()", t => {

        const
            cmp = Ext.create("conjoon.cn_mail.view.mail.message.editor.HtmlEditor"),
            interceptSpy = t.spyOn(cmp, "createOverflowHandlerInterceptor").and.callFake(() => "intercepted"),
            tbar = cmp.createToolbar(),
            overflowHandler = tbar.getLayout().overflowHandler;

        t.expect(interceptSpy.calls.all()[0].args[0]).toBe(
            Ext.layout.container.boxOverflow.Menu.prototype.addComponentToMenu
        );
        t.expect(overflowHandler.addComponentToMenu).toBe("intercepted");


        cmp.destroy();
    });

});
