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

describe('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequestTest', function(t) {


    t.it("constructor()", function(t) {

        var exc, e, config;

        try {
            config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
            });
        } catch (e) {
            exc = e
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"id\" must be specified");
        exc = e = undefined;

        try {
            config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                id : 'foo'
            });
        } catch (e) {
            exc = e
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"editMode\" must be specified");
        exc = e = undefined;


        try {
            config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                id       : 'foo',
                editMode : 'somemode'
            });
        } catch (e) {
            exc = e
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"editMode\" must be one of");
        exc = e = undefined;


        t.isCalledNTimes('applyId', conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest.prototype, 2);
        t.isCalledNTimes('applyEditMode', conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest.prototype, 2);

        config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
            id       : 'foo',
            editMode : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
        });

        t.expect(config.getId()).toBe('foo');
        t.expect(config.getEditMode()).toBe(conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO);

        try {config.setId('bar');} catch (e) {exc = e}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"id\" was already set");
        exc = e = undefined;

        try {config.setEditMode(conjoon.cn_mail.data.mail.message.EditingModes.REPLY_ALL);} catch (e) {exc = e}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"editMode\" was already set");
        exc = e = undefined;
    });


});
