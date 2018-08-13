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
        var exc, e;

        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        try{view.showMailEditor(1)}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain('is not a valid value');

    });


    t.it("showMailEditor()", function(t) {
        var editor1, editor2;

        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        t.isCalledNTimes('showMailEditor', view.getController(), 4);

        editor1 = view.showMailEditor(1, 'edit');
        t.isInstanceOf(editor1, 'conjoon.cn_mail.view.mail.message.editor.MessageEditor')

        editor2 = view.showMailEditor(2, 'edit');
        t.expect(editor1).not.toBe(editor2);

        editor2 = view.showMailEditor(1, 'edit');
        t.expect(editor1).toBe(editor2);

        t.expect(view.showMailEditor(1, 'compose')).not.toBe(editor1);
    });


    t.it("showInboxViewFor()", function(t) {

        let inb1, inb2;

        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        t.isCalledNTimes('showInboxViewFor', view.getController(), 2);

        inb1 = view.showInboxViewFor("foo", "1");
        t.isInstanceOf(inb1, 'conjoon.cn_mail.view.mail.inbox.InboxView');

        inb2 = view.showInboxViewFor("foo", "2");

        t.expect(inb1).toBe(inb2);
    });


    t.it("showMessageCannotBeDeletedWarning()", function(t) {

        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        let toast = view.showMessageCannotBeDeletedWarning();

        t.isInstanceOf(toast, 'conjoon.cn_comp.window.Toast');

        t.expect(toast.context).toBe("warning");

    });


    t.it("showMessageMovedInfo()", function(t) {


        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        let toast = view.showMessageMovedInfo(
            null, null, {get : function() {return 'text';}}
        );

        t.isInstanceOf(toast, 'conjoon.cn_comp.window.Toast');

        t.expect(toast.context).toBe("info");

    });

});
