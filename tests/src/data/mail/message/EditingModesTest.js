/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

describe("conjoon.cn_mail.data.mail.message.EditingModesTest", function (t) {

    t.it("Should properly check variables", function (t) {

        Ext.require("conjoon.cn_mail.data.mail.message.EditingModes");

        t.waitForMs(500, function () {
            var EditingModes = conjoon.cn_mail.data.mail.message.EditingModes;

            t.expect(EditingModes.REPLY_TO).toBeTruthy();
            t.expect(EditingModes.REPLY_ALL).toBeTruthy();
            t.expect(EditingModes.FORWARD).toBeTruthy();
            t.expect(EditingModes.EDIT).toBeTruthy();
            t.expect(EditingModes.CREATE).toBeTruthy();

            var values = [
                EditingModes.REPLY_TO,
                EditingModes.REPLY_All,
                EditingModes.FORWARD,
                EditingModes.EDIT,
                EditingModes.CREATE
            ];

            t.expect(Array.from(new Set(values))).toEqual(values);

        });

    });


});