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

    t.diag("feat: title of app should be set once configuration is available conjoon/conjoon#7");


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------


    t.it("getMainPackageView()", t => {

        let FAKE_TITLE = "PACKAGE_TITLE";

        const
            ctrl = Ext.create("conjoon.cn_mail.app.PackageController"),
            fakeApp = {getPackageConfig: function (){return FAKE_TITLE;}, activateViewForHash: () => {}},
            spy = t.spyOn(fakeApp, "getPackageConfig"),
            fireSpy = t.spyOn(Ext, "fireEvent");
        
        ctrl.getApplication = () => fakeApp;
        
        ctrl.getMainPackageView();
        
        t.isDeeplyStrict(spy.calls.mostRecent().args, [ctrl, "title"]);
        t.isDeeplyStrict(fireSpy.calls.mostRecent().args, ["conjoon.application.TitleAvailable", ctrl, FAKE_TITLE]);

        FAKE_TITLE = undefined;

        ctrl.getMainPackageView();

        t.expect(fireSpy.calls.count()).toBe(1);

        [spy, fireSpy].map(spy => spy.remove());

    });


});
