/**
 * conjoon
 * (c) 2007-2019 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg/conjoon.org
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
