/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.view.mail.MailDesktopViewTest', function(t) {

    var view,
        viewConfig = {
            renderTo : document.body,
            height   : 400,
            width    : 400
        };

    t.afterEach(function() {

        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function() {

    });


    t.it("Should create and show the view along with default config checks", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        t.isInstanceOf(view, 'Ext.tab.Panel');
        t.expect(view.alias).toContain('widget.cn_mail-maildesktopview');
    });


    t.it("showMailEditor()", function(t) {
        var editor1, editor2;

        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        t.isCalledNTimes('showMailEditor', view.getController(), 3);

        editor1 = view.showMailEditor(1);
        t.isInstanceOf(editor1, 'conjoon.cn_mail.view.mail.message.editor.MessageEditor')

        editor2 = view.showMailEditor(2);
        t.expect(editor1).not.toBe(editor2);

        editor2 = view.showMailEditor(1);
        t.expect(editor1).toBe(editor2);

    });

});
