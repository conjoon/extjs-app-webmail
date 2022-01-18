/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    t.it("Sanitize the writer", t => {
        var writer = Ext.create("conjoon.cn_mail.data.mail.message.writer.AttachmentWriter");

        t.expect(writer instanceof coon.core.data.writer.FormData).toBe(true);
        t.expect(writer.alias).toContain("writer.cn_mail-mailmessageattachmentwriter");
    });


    t.it("make sure AttachmentProxy uses the writer", t => {
        const proxy = Ext.create("conjoon.cn_mail.data.mail.message.proxy.AttachmentProxy");

        t.isInstanceOf(proxy.getWriter(), "conjoon.cn_mail.data.mail.message.writer.AttachmentWriter");
    });


    t.it("Test writeRecords()", t => {
        const
            writer = Ext.create("conjoon.cn_mail.data.mail.message.writer.AttachmentWriter"),
            formData = new FormData(),
            blob1 = new Blob(["foo"], {type: "text/plain"}),
            blob2 = new Blob(["foo"], {type: "text/plain"});

        formData.set("data[0][fileName]", "snafu");
        formData.set("data[0][size]", 232);
        formData.set("file[0][0]", blob1);
        formData.set("data[1][size]", 123);
        formData.set("data[1][fileName]", "snafu2");
        formData.set("file[1][0]", blob2);
        const parentSpy = t.spyOn(writer, "callParent").and.callFake(() =>  {
            const req = Ext.create("coon.core.data.FormDataRequest");
            req.getFormData = () => formData;
            return req;
        });

        // spy takes care of the result
        const formDataResult = writer.writeRecords({
            setFormData: function (formData) {
                this.formData = formData;
            },
            getFormData: function () {
                return this.formData;
            }
        }).getFormData();

        const
            readerB1 = new FileReader(),
            readerB2 = new FileReader(),
            readerB1Form = new FileReader(),
            readerB2Form = new FileReader();
        t.expect(formDataResult.get("files[0][fileName]")).toBe("snafu");
        t.expect(formDataResult.get("files[1][fileName]")).toBe("snafu2");
        t.expect(formDataResult.get("files[0][size]")).toBe("232");
        t.expect(formDataResult.get("files[1][size]")).toBe("123");

        readerB1.readAsText(blob1);
        readerB2.readAsText(blob2);
        readerB1Form.readAsText(formDataResult.get("files[0][blob]"));
        readerB2Form.readAsText(formDataResult.get("files[1][blob]"));

        t.waitForMs(t.parent.TIMEOUT, () => {
            t.expect(readerB1.result).toBe(readerB1Form.result);
            t.expect(readerB2.result).toBe(readerB2Form.result);
            parentSpy.remove();
        });

    });


});
