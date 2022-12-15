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


    t.it("Should successfully create and test instance", t => {

        const proxy = Ext.create("conjoon.cn_mail.data.mail.BaseProxy");
        t.isInstanceOf(proxy, "Ext.data.proxy.Rest");

        t.expect(conjoon.cn_mail.data.mail.BaseProxy.required.requestConfigurator).toBe(
            "coon.core.data.request.Configurator"
        );

        t.expect(proxy.getAppendId()).toBe(false);
    });


    t.it("sendRequest()", t => {
        const
            requestConfigurator = Ext.create("coon.core.data.request.Configurator"),
            proxy = Ext.create("conjoon.cn_mail.data.mail.BaseProxy", {
                requestConfigurator
            }),
            fakeRequest = {},
            parentSpy = t.spyOn(proxy, "callParent").and.callFake(() => {}),
            cfgSpy = t.spyOn(requestConfigurator, "configure").and.callThrough();

        proxy.sendRequest(fakeRequest);

        t.expect(cfgSpy.calls.mostRecent().args[0]).toBe(fakeRequest);
        t.expect(parentSpy.calls.mostRecent().args[0][0]).toBe(cfgSpy.calls.mostRecent().returnValue);

        [cfgSpy, parentSpy].map(spy => spy.remove());
    });


});
