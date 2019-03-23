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

describe('conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialogTest', function(t) {

    t.diag("defining mock and waiting until complete...");

    Ext.define('mocked.TestPanel', {

        extend : 'Ext.Panel',

        mixins : [
            'conjoon.cn_mail.view.mail.mixin.DeleteConfirmDialog'
        ]

    });

    const funcview = function(t, canCloseAfterDelete) {


        let view = Ext.create('mocked.TestPanel', {
            width               : 800,
            height              : 600,
            renderTo            : document.body,
            canCloseAfterDelete : canCloseAfterDelete
        });

        let obj = { CALLED : 0},
            fn = function() {
                this.CALLED++;
            };

        t.expect(obj.CALLED).toBe(0);
        let mask = view.showMessageDeleteConfirmDialog(null, fn, obj);
        t.isInstanceOf(mask, 'coon.comp.component.MessageMask');
        t.expect(mask).toBe(view.deleteMask);
        t.expect(view.showMessageDeleteConfirmDialog(null, fn, obj)).toBe(mask);

        let yesButton = Ext.dom.Query.select("span[data-ref=yesButton]", view.el.dom);
        t.click(yesButton[0], function() {
            t.expect(obj.CALLED).toBe(1);
            t.expect(view.deleteMask).toBe(null);

            t.expect(view.destroyed).toBe(false);
            t.expect(view.closeAfterDelete()).toBe(canCloseAfterDelete);
            t.expect(view.destroyed).toBe(canCloseAfterDelete);

            view.destroy();
            view = null;
        });


    };

t.waitForMs(1000, function() {

    t.diag("Starting tests.");

    t.it("showMessageDeleteConfirmDialog() - canCloseAfterDelete true", function(t) {
        funcview(t, true);
    });


    t.it("showMessageDeleteConfirmDialog() - canCloseAfterDelete false", function(t) {
        funcview(t, false);
    });



});


});
