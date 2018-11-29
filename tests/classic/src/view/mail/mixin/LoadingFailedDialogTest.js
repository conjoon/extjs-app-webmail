/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
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

        t.isInstanceOf(mask, 'conjoon.cn_comp.component.MessageMask');
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


        t.click(okButton[0]);
        t.waitForMs(250, function() {
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
        t.isInstanceOf(view.showToast(), 'conjoon.cn_comp.window.Toast');

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
