/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe('conjoon.cn_mail.view.mail.mixin.LoadingFailedDialogTest', function(t) {

    t.diag("defining mock and waiting until complete...");

    Ext.define('mocked.TestPanel', {

        extend : 'Ext.Panel',

        mixins : [
            'conjoon.cn_mail.view.mail.mixin.LoadingFailedDialog'
        ]

    });

    const funcview = function(t, showButton) {


        let view = Ext.create('mocked.TestPanel', {
            width               : 800,
            height              : 600,
            renderTo            : document.body
        });

        let CALLED = 0, TOAST = 0;
        view.updateTargetHeader = function() {
            CALLED = 1;
        };
        view.showToast = function() {
            TOAST = 1;
        };

        let mask = view.showLoadingFailedDialog(showButton);

        t.isInstanceOf(mask, 'coon.comp.component.MessageMask');
        t.expect(mask).toBe(view.loadingFailedMask);
        t.expect(view.showLoadingFailedDialog(showButton)).toBe(mask);

        let okButton = Ext.dom.Query.select("span[data-ref=okButton]", view.el.dom);

        t.expect(okButton.length).toBe(1);
        t.expect(CALLED).toBe(1);
        t.expect(TOAST).toBe(1);

        if (!showButton) {
            t.expect(okButton[0].parentNode.style.display).toBe("none");
        } else {
            t.expect(okButton[0].parentNode.style.display).not.toBe("none");
        }
        if (!showButton) {
            view.destroy();
            view = null;
            return;
        }


        t.click(okButton[0], function() {
            t.expect(view.loadingFailedMask).toBe(null);
            t.expect(view.destroyed).toBe(true);
            view = null;
        });


    };

t.waitForMs(1000, function() {

    t.diag("Starting tests.");

    t.it("showToast()", function(t) {

        let view = Ext.create('mocked.TestPanel', {
            width    : 800,
            height   : 600,
            renderTo : document.body,
            header   : {title : 'foo'}
        });
        t.isInstanceOf(view.showToast(), 'coon.comp.window.Toast');

        view.destroy();
        view = null;
    })

    t.it("updateTargetHeader()", function(t) {

        let view = Ext.create('mocked.TestPanel', {
            width    : 800,
            height   : 600,
            renderTo : document.body,
            header   : {title : 'foo'}
        });

        let expTitle   = "oops.",
            expIconCls = "fa fa-frown-o";

        t.expect(view.getTitle()).not.toBe(expTitle);
        t.expect(view.getIconCls()).not.toBe(expIconCls);

        view.updateTargetHeader();

        t.expect(view.getTitle()).toBe(expTitle);
        t.expect(view.getIconCls()).toBe(expIconCls);

        view.destroy();
        view = null;
    });

    t.it("showLoadingFailedDialog() - show button, no header", function(t) {
        funcview(t, true);
    });

    t.it("showLoadingFailedDialog() - hide button, no header", function(t) {
        funcview(t, false);
    });



});


});
