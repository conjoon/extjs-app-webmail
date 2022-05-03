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

StartTest(async t => {


    let mixin,
        initSubscriptionSpy,
        getSubscriptionIdSpy;

    const create = () => {
        mixin = Ext.create("conjoon.cn_mail.data.mail.MailboxSubscriptionMixin");
        initSubscriptionSpy = t.spyOn(mixin, "initSubscriptions").and.callThrough();
        getSubscriptionIdSpy = t.spyOn(mixin, "getSubscriptionId").and.callThrough();
        return mixin;
    };

    t.beforeEach(() => {
        mixin = create();
    });


    t.afterEach(() => {

        if (initSubscriptionSpy) {
            initSubscriptionSpy.remove();
            initSubscriptionSpy = null;
        }

        if (getSubscriptionIdSpy) {
            getSubscriptionIdSpy.remove();
            getSubscriptionIdSpy = null;
        }

        if (mixin) {
            mixin.destroy();
            mixin = null;
        }

    });


    t.it("initSubscriptions()", t => {

        t.expect(mixin.subscriptions).toBeUndefined();
        mixin.initSubscriptions();
        t.expect(mixin.subscriptions).toBeDefined();

        t.expect(initSubscriptionSpy.calls.count()).toBeGreaterThan(0);
    });


    t.it("getSubscriptionId()", t => {

        t.expect(mixin.getSubscriptionId({get: key => key === "id" ? "ID": null})).toBe("ID");
        t.expect(mixin.getSubscriptionId("STRING_ID")).toBe("STRING_ID");

        let exc;
        try {
            mixin.getSubscriptionId(1);
        } catch (e) {
            exc = e;
        }
        t.expect(exc).toBeDefined();
        t.expect(exc.message).toContain("Unexpected type");
    });


    t.it("addSubscription() / getSubscription()", t => {

        const subscription = {folder: "FOLDER"};

        t.expect(mixin.addSubscription("ID", subscription)).toBe(subscription);
        t.expect(getSubscriptionIdSpy.calls.all()[0].args[0]).toBe("ID");

        t.expect(mixin.getSubscription("ID")).toBe(subscription);

    });
});
