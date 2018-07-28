/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

describe('conjoon.cn_mail.data.mail.service.mailbox.OperationTest', function(t) {

    const createOperation = function(request) {

        return Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
            request : request === false ? undefined : {type : 'foo'}
        });
    };


// -----------------------------------------------------------------------------
// |   Tests
// -----------------------------------------------------------------------------
    t.it("constructor()", function(t) {

        let exc, e,
            op = createOperation();
        t.isInstanceOf(op, 'conjoon.cn_mail.data.mail.service.mailbox.Operation');
        t.expect(op.getRequest()).toEqual({type : 'foo'});

        let coll = [
            conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE_OR_DELETE,
            conjoon.cn_mail.data.mail.service.mailbox.Operation.DELETE,
            conjoon.cn_mail.data.mail.service.mailbox.Operation.MOVE,
            conjoon.cn_mail.data.mail.service.mailbox.Operation.NOOP
        ];

        for (let i = 0, len = coll.length; i < len; i++) {
            t.expect(coll[i]).toBeTruthy();
        }

        let fin = coll.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        });

        t.expect(fin).toEqual(coll);


        try{createOperation(false);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("must be set");
        t.expect(exc.msg.toLowerCase()).toContain("request");
        exc = undefined;

        op.setResult({id : 'foo'});
        t.expect(op.getResult()).toEqual({id : 'foo'});
        try{op.setResult({foo : 'bar'});}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        exc = undefined;

        try{op.setRequest({foo : 'bar'});}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("already set");
        exc = undefined;

        op = Ext.create('conjoon.cn_mail.data.mail.service.mailbox.Operation', {
            request : {type : 'foo'},
            result  : {foo : 'bar'}
        });

        t.expect(op.getResult()).toEqual({foo : 'bar'});
    });




});