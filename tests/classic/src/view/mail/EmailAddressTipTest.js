/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    const create = () => Ext.create("conjoon.cn_mail.view.mail.EmailAddressTip");

    const
        name = "Peter Parker",
        address = "peter.parker@dailybugle.com";

    t.it("test class", t => {

        const tip = create();

        t.isInstanceOf(tip, "Ext.tip.ToolTip");

        t.expect(tip.trackMouse).toBe(false);
        t.expect(tip.renderTo).toBe(Ext.getBody());
    });


    t.it("setAddress()", t => {

        const tip = create();
        const tpl = (name, address) => `${name} &lt;${address}&gt;`;

        const spy = t.spyOn(tip , "update");

        const result = tpl(name, address);

        t.expect(tip.setAddress({name, address})).toBe(result);

        t.expect(spy.calls.mostRecent().args).toEqual([result]);

        spy.remove();
    });


    t.it("queryAddress throws", t => {

        const tip = create();

        try {
            tip.queryAddress();
            t.fail("expection excepted");
        } catch (e) {
            t.expect(e.message).toContain("needs to be implemented");
        }
    });


    t.it("show()", t => {

        const tip = create();

        const querySpy = t.spyOn(tip, "queryAddress").and.callFake(node => ({name, address}));
        const setAddressSpy = t.spyOn(tip, "setAddress").and.callFake(() => {});

        const FAKE_NODE = {};
        tip.triggerElement = FAKE_NODE;

        tip.show("da");

        t.expect(querySpy.calls.mostRecent().args[0]).toBe(FAKE_NODE);
        t.expect(setAddressSpy.calls.mostRecent().args[0]).toBe(querySpy.calls.mostRecent().returnValue);

        [querySpy, setAddressSpy].map(spy => spy.remove());
    });

});
