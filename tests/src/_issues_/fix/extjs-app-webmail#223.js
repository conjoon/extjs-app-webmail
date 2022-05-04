/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

StartTest(t => {

    t.diag("fix: updating only a message triggers request for saving the MessageBody conjoon/extjs-app-webmail#223");


    t.it("onMailMessageBeforeSave()", t => {

        const
            controller = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController"),
            messageDraft = Ext.create(
                "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig", {
                    subject: "Test Email",
                    mailAccountId: "dev_sys_conjoon_org",
                    mailFolderId: "INBOX"
                }),
            editor = Ext.create(
                "conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                    renderTo: document.body,
                    controller,
                    messageDraft
                });

        let messageBody = editor.getViewModel().get("messageDraft.messageBody"),
            commitSpy = t.spyOn(messageBody, "commit").and.callThrough();

        messageBody.modified = {"messageBodyId": true};
        messageBody.crudState = "U";

        controller.onMailMessageBeforeSave(
            editor, editor.getViewModel().get("messageDraft"), false, false
        );

        t.expect(commitSpy.calls.count()).toBe(1);

        t.expect(messageBody.modified).toBeFalsy();

        commitSpy.remove();

        editor.destroy();
    });


});