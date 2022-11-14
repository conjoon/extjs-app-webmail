/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    let  plugin;


    const create = (cfg) => {
        let plugin = Ext.create("conjoon.cn_mail.app.plugin.MailtoProtocolHandlerPlugin", cfg || {});

        return plugin;
    };


    t.beforeEach(() => {
        plugin = create();


    });

    t.afterEach(() => {
        if (plugin) {
            plugin.destroy();
            plugin = null;
        }
    });

    // +-------------------------------------------
    // | Tests
    // +-------------------------------------------

    t.it("constructor()", t => {
        t.isInstanceOf(plugin,  "coon.core.app.plugin.ControllerPlugin");
    });


    t.it("run()", t => {

        const
            ctrl = Ext.create("conjoon.cn_mail.app.PackageController");


        let registerProtocolHandler = function (){};

        navigator.registerProtocolHandler = registerProtocolHandler;

        let registerSpy = t.spyOn(navigator, "registerProtocolHandler").and.callFake(() => {});

        t.expect(plugin.run(ctrl)).toBe(true);

        t.expect(registerSpy.calls.mostRecent().args).toEqual([
            "mailto",
            window.location.origin + "/#cn_mail/message/compose/%s",
            "mailto handler"
        ]);

        registerSpy.remove();
    });

});
