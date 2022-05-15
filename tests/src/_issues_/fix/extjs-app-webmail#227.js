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

    t.diag("fix: closing email message using container mask triggers error #227");


    t.it("onMailMessageEditorBeforeDestroy()", t => {

        let ctrl = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditorViewController");

        const
            viewMock = {loadingFailedMask: {destroy: function () {}}},
            destroySpy = t.spyOn(viewMock.loadingFailedMask, "destroy");

        ctrl.getView = () => viewMock;

        t.expect(viewMock.loadingFailedMask).not.toBe(null);
        ctrl.onMailMessageEditorBeforeDestroy();
        t.expect(destroySpy.calls.count()).toBe(1);
        t.expect(viewMock.loadingFailedMask).toBe(null);

        destroySpy.remove();

        ctrl = null;

    });


});