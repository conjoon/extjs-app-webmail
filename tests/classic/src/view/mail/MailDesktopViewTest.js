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

describe('conjoon.cn_mail.view.mail.MailDesktopViewTest', function(t) {

    const TIMEOUT = 1250,
        createKey = function(id1, id2, id3) {
            return conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.createFor(id1, id2, id3);
        },
        getMessageItemAt = function(messageIndex) {
            return conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable.getMessageItemAt(messageIndex);
        },
        createKeyForExistingMessage = function(messageIndex){
            let item = getMessageItemAt(messageIndex);

            let key = createKey(
                item.mailAccountId, item.mailFolderId, item.id
            );

            return key;
        };

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

t.requireOk('conjoon.dev.cn_mailsim.data.mail.ajax.sim.message.MessageTable', function(){
    t.requireOk('conjoon.dev.cn_mailsim.data.mail.PackageSim', function(){

    t.it("Should create and show the view along with default config checks", function(t) {
        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        t.isInstanceOf(view, 'Ext.tab.Panel');
        t.expect(view.alias).toContain('widget.cn_mail-maildesktopview');

        t.isInstanceOf(view.getViewModel(), 'conjoon.cn_mail.view.mail.MailDesktopViewModel');
    });


    t.it("showMailEditor() (1)", function(t) {
        var exc, e;

        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        t.waitForMs(TIMEOUT, function() {
            try{view.showMailEditor(1)}catch(e){exc = e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toContain('is not a valid value');

            t.waitForMs(TIMEOUT, function() {

            });

        });

    });


    t.it("showMailEditor() (2)", function(t) {
        var editor1, editor2;

        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        t.isCalledNTimes('showMailEditor', view.getController(), 4);

        editor1 = view.showMailEditor(createKeyForExistingMessage(1), 'edit');
        t.isInstanceOf(editor1, 'conjoon.cn_mail.view.mail.message.editor.MessageEditor')

        editor2 = view.showMailEditor(createKeyForExistingMessage(2), 'edit');
        t.expect(editor1).not.toBe(editor2);

        editor2 = view.showMailEditor(createKeyForExistingMessage(1), 'edit');
        t.expect(editor1).toBe(editor2);

        t.expect(view.showMailEditor(1, 'compose')).not.toBe(editor1);

        t.waitForMs(TIMEOUT, function() {

        });
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

        t.isInstanceOf(toast, 'coon.comp.window.Toast');

        t.expect(toast.context).toBe("warning");

    });


    t.it("showMessageMovedInfo()", function(t) {

        /**
         * test for app-cn_mail#102
         */

        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        let myId = '____' + Ext.id() + Ext.id() + '____';

        let toast = view.showMessageMovedInfo(
            null, null, {get : function(field) {return field === 'name' ? myId : null;}}
        );

        t.expect(toast.body.dom.innerHTML).toContain(myId);
        t.isInstanceOf(toast, 'coon.comp.window.Toast');

        t.expect(toast.context).toBe("info");

    });


    t.it("showMailAccountFor()", function(t) {


        view = Ext.create(
            'conjoon.cn_mail.view.mail.MailDesktopView', viewConfig);

        let ctrl = view.getController();

        t.isCalled('showMailAccountFor', ctrl);

        let accountView = view.showMailAccountFor('dev_sys_conjoon_org');
        t.isInstanceOf(accountView, 'conjoon.cn_mail.view.mail.account.MailAccountView');

        t.waitForMs(TIMEOUT, function() {

        });

    });


});});});