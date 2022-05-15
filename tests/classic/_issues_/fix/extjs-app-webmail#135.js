/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

    let cmp;

    t.beforeEach(t => {
        cmp = Ext.create("conjoon.cn_mail.view.mail.message.AbstractAttachmentList");
    });

    t.afterEach(t => {
        cmp.destroy();
        cmp = null;
    });

    // +-----------------------------------------
    // | Tests
    // +-----------------------------------------
    t.diag("fix: AttachmentList must show icons representing mime types (conjoon/extjs-app-webmail#135)");

    t.it("getMimeTypeIcon()", t => {

        t.expect(cmp.getMimeTypeIcon("unknown")).toBe("fa-file");
        t.expect(cmp.getMimeTypeIcon("application/x-zip-compressed")).toBe("fa-file-archive");

    });

});
