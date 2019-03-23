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
