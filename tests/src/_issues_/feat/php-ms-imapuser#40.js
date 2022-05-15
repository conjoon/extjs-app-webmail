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


    // +----------------------------------------------------------------------------
    // |                    =~. Unit Tests .~=
    // +----------------------------------------------------------------------------


    t.it("Test write records with Ext.data.Request", t => {
        const
            writer = Ext.create("conjoon.cn_mail.data.mail.message.writer.AttachmentWriter"),
            request = Ext.create("Ext.data.Request", {
                action: "delete",
                operation: Ext.create("Ext.data.operation.Operation", {
                    records: [{}]
                })
            });

        t.expect(writer.writeRecords(request, []) instanceof coon.core.data.FormDataRequest).toBe(false);
    });


    t.it("MessageCompoundBatchVisitor.seedRetrievedKey() expects MessageKey instead of MessageItemChildCompoundKey ", t => {

        const
            messageDraft = Ext.create("conjoon.cn_mail.model.mail.message.MessageDraft", {
                subject: "test",
                mailFolderId: "1",
                mailAccountId: "3"
            }),
            visitor = Ext.create("conjoon.cn_mail.data.mail.message.session.MessageCompoundBatchVisitor"),
            operation = Ext.create("Ext.data.operation.Operation", {
                action: "destroy",
                response: {
                    responseType: "json",
                    responseJson: {
                        data: {
                            id: "newId"
                        }
                    }
                },
                records: [{entityName: "DraftAttachment"}]
            });

        visitor.setMessageDraft(messageDraft);
        t.expect(visitor.seedRetrievedKey(operation)).toBe(true);
        t.expect(messageDraft.get("id")).toBe("newId");
    });

});
