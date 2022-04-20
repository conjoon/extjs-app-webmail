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


StartTest(async t => {

    t.diag("fix: Saving a message and immediate closing triggers close confirm dialog #208");

    t.it("isDraftDirty()", t => {

        const vm = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewModel", {
                messageDraft: Ext.create("conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig"),
                session: Ext.create("conjoon.cn_mail.data.mail.message.session.MessageDraftSession")
            }),
            ignore = ["id", "localId", "mailAccountId", "mailFolderId", "messageBodyId", "messageDraftId"],
            messageBody = vm.get("messageDraft").getMessageBody();
            
            
        ignore.forEach(key => {
            messageBody.modified ={};
            messageBody.modified[key] = key;
            t.expect(vm.isDraftDirty()).toBe(false);    
        });

        messageBody.modified = {};
        ignore.forEach(key => {
            messageBody.modified[key]  = undefined;
            t.expect(vm.isDraftDirty()).toBe(false);
        });

        messageBody.modified = {"id": "iho", "mailFolderId": "khh"};
        t.expect(vm.isDraftDirty()).toBe(false);
        messageBody.modified.teextHtml = "text";

        t.expect(vm.isDraftDirty()).toBe(true);
    });


});