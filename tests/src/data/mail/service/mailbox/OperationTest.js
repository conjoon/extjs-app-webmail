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

describe("conjoon.cn_mail.data.mail.service.mailbox.OperationTest", function (t) {

    const createOperation = function (request) {

        return Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
            request: request === false ? undefined : {type: "foo"}
        });
    };


    // -----------------------------------------------------------------------------
    // |   Tests
    // -----------------------------------------------------------------------------
    t.it("constructor()", function (t) {

        let exc,
            op = createOperation();
        t.isInstanceOf(op, "conjoon.cn_mail.data.mail.service.mailbox.Operation");
        t.expect(op.getRequest()).toEqual({type: "foo"});

        let coll = [
            conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE_OR_DELETE,
            conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
            conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
            conjoon.cn_mail.data.mail.service.mailbox.Operation.NOOP,
            conjoon.cn_mail.data.mail.service.mailbox.Operation.CANCELED,
            conjoon.cn_mail.data.mail.service.mailbox.Operation.INVALID_TARGET
        ];

        for (let i = 0, len = coll.length; i < len; i++) {
            t.expect(coll[i]).toBeTruthy();
        }

        let fin = coll.filter(function (item, pos, self) {
            return self.indexOf(item) === pos;
        });

        t.expect(fin).toEqual(coll);


        try{createOperation(false);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set");
        t.expect(exc.msg.toLowerCase()).toContain("request");
        exc = undefined;

        op.setResult({id: "foo"});
        t.expect(op.getResult()).toEqual({id: "foo"});
        try{op.setResult({foo: "bar"});}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        exc = undefined;

        try{op.setRequest({foo: "bar"});}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        exc = undefined;

        op = Ext.create("conjoon.cn_mail.data.mail.service.mailbox.Operation", {
            request: {type: "foo"},
            result: {foo: "bar"}
        });

        t.expect(op.getResult()).toEqual({foo: "bar"});
    });


});