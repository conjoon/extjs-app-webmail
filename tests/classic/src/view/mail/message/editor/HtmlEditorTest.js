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

describe('conjoon.cn_mail.view.mail.message.editor.HtmlEditorTest', function(t) {

    var view;

    t.afterEach(function() {
        if (view) {
            view.destroy();
            view = null;
        }

    });

    t.beforeEach(function() {
        viewConfig = {
            renderTo : document.body
        }
    });


    t.it("Should create and show the HtmlEditor along with default config checks", function(t) {
        view = Ext.create(
             'conjoon.cn_mail.view.mail.message.editor.HtmlEditor', viewConfig);

        t.expect(view instanceof Ext.form.field.HtmlEditor).toBeTruthy();

        t.expect(view.alias).toContain('widget.cn_mail-mailmessageeditorhtmleditor');

        t.expect(view.down('cn_comp-formfieldfilebutton')).toBeTruthy();
    });


    /**
     * @see https://github.com/conjoon/app-cn_mail/issues/2
     */
    t.it("Should fix conjoon/app-cn_mail/issues/2", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.HtmlEditor', viewConfig);

        t.expect(view.down('cn_comp-formfieldfilebutton').tooltip).toBeDefined();
    });


    t.it("app-cn_mail#68", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.message.editor.HtmlEditor', viewConfig);

        let tbar             = view.down('toolbar'),
            DEFAULTPREVENTED = 0,
            listener         = tbar.managedListeners[6],
            preventDefault   = function() {DEFAULTPREVENTED++;},
            evt              = {preventDefault : preventDefault};

        //t.click(fileButton, function() {arguments; debugger;}, null, evt);

        t.expect(listener.ename).toBe("click");

        t.expect(DEFAULTPREVENTED).toBe(0);
        listener.fn(evt, {className : 'foo x-form-file-input stugg'});
        t.expect(DEFAULTPREVENTED).toBe(0);

        listener.fn(evt, {className : ''});
        t.expect(DEFAULTPREVENTED).toBe(1);
        listener.fn(evt, {className : ''});
        t.expect(DEFAULTPREVENTED).toBe(2);
        listener.fn(evt, {className : 'foo x-form-file-input stugg'});
        t.expect(DEFAULTPREVENTED).toBe(2);

    });
});
