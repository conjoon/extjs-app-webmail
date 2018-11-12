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

describe('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequestTest', function(t) {

t.requireOk('conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey', function() {

    const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

    t.it("constructor()", function(t) {

        var exc, e, config;

        let key = MessageEntityCompoundKey.createFor(1, 2, 3),
            key2 = MessageEntityCompoundKey.createFor(1, 2, 5);

        try {
            config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
            });
        } catch (e) {
            exc = e;
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"compoundKey\" must be specified");
        exc = e = undefined;

        try {
            config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                compoundKey : key
            });
        } catch (e) {
            exc = e
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"editMode\" must be specified");
        exc = e = undefined;


        try {
            config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                compoundKey : key,
                editMode : 'somemode'
            });
        } catch (e) {
            exc = e
        }

        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"editMode\" must be one of");
        exc = e = undefined;



        try {
            Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
                compoundKey : 'foo',
                editMode : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
            });
        } catch (e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("must be an instance of");
        exc = e = undefined;

        config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
            compoundKey : key,
            editMode : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO,
            defaultMailAccountId : 'foo',
            defaultMailFolderId : 'bar'
        });

        t.expect(config.isConfigured()).toBe(true);

        t.expect(config.getDefaultMailAccountId()).toBe('foo');
        t.expect(config.getDefaultMailFolderId()).toBe('bar');


        t.expect(config.getCompoundKey()).toBe(key);
        t.expect(config.getEditMode()).toBe(conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO);

        try {config.setCompoundKey(key2);} catch (e) {exc = e}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"compoundKey\" was already set");
        exc = e = undefined;

        try {config.setEditMode(conjoon.cn_mail.data.mail.message.EditingModes.REPLY_ALL);} catch (e) {exc = e}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"editMode\" was already set");
        exc = e = undefined;

        try {config.setDefaultMailAccountId('abc');} catch (e) {exc = e}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"defaultMailAccountId\" was already set");
        exc = e = undefined;

        try {config.setDefaultMailFolderId('abc');} catch (e) {exc = e}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("\"defaultMailFolderId\" was already set");
        exc = e = undefined;

        config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftCopyRequest', {
            compoundKey : key,
            editMode : conjoon.cn_mail.data.mail.message.EditingModes.REPLY_TO
        });

        t.expect(config.isConfigured()).toBe(false);

        config.setDefaultMailAccountId('abc');
        t.expect(config.isConfigured()).toBe(false);
        config.setDefaultMailFolderId('xyz');
        t.expect(config.isConfigured()).toBe(true);

        t.expect(config.getDefaultMailAccountId()).toBe('abc');
        t.expect(config.getDefaultMailFolderId()).toBe('xyz');

    });





});


});
