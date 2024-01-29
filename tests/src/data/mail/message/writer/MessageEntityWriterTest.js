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

    const
        className = "conjoon.cn_mail.data.mail.message.writer.MessageEntityWriter",
        create = () => Ext.create(className);


    t.it("Should successfully create and test instance", t => {
        let writer = create();

        t.isInstanceOf(writer, "Ext.data.writer.Json");

        t.expect(writer.alias).toContain("writer.cn_mail-mailmessageentitywriter");
    });


    t.it("writeRecords()", t => {

        let writer = create(),
            proxy = {
                entityName: "entityName"
            },
            request = Ext.create("Ext.data.Request", {
                records: []
            }),
            defaultData = {
                messageBodyId: "messagebodyId",
                mailAccountId: "dev",
                mailFolderId: "INBOX.Drafts",
                id: "123",
                subject: "Hello World",
                date: "123445565"
            },
            resultJson = {
                data: {
                    type: "entityName",
                    id: "123",
                    attributes: {
                        subject: "Hello World",
                        date: "123445565"
                    }
                }
            },
            getProxySpy = t.spyOn(request, "getProxy").and.callFake(() => proxy),
            map = (en) => {
                let m = {
                    "MessageBodyDraft": "MessageBody",
                    "MessageDraft": "MessageItem"
                };

                return m[en] ? m[en] : en;
            };

        ["entityName", "MessageBodyDraft", "MessageDraft"].forEach(en => {

            proxy.entityName = en;
            resultJson.data.type = map(en);

            request.setJsonData(defaultData);
            request = writer.writeRecords(request, {});
            t.expect(request.getJsonData()).toEqual(resultJson);
        });


        request.setJsonData(defaultData);

        // this is the value from the "modified"-object, which will be re-written
        // into the data.mailFolderId. It denotes the source folder. The actual value will
        // be written into the relationships object.
        l8.chain("data.relationships.MailFolder.data.id", resultJson, defaultData.mailFolderId);
        resultJson.data.relationships.MailFolder.data.type = "MailFolder";

        t.spyOn(request, "getOperation").and.callFake(() => ({
            getRecords: () => [{modified: {mailFolderId: "sourceMailFolder"}}]
        }));
        request = writer.writeRecords(request, {});

        t.expect(request.getJsonData()).toEqual(resultJson);

        request.setParams({
            action: "move"
        });
        request.setJsonData(defaultData);
        request = writer.writeRecords(request, {});

        t.expect(request.getParams().action).toBeUndefined();

        getProxySpy.remove();

    });

});
