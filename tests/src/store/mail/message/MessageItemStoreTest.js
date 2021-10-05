/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

import TestHelper from "/tests/lib/mail/TestHelper.js";

StartTest(async t => {

    const helper = l8.liquify(TestHelper.get(t, window));
    await helper.setupSimlets().mockUpMailTemplates().andRun((t) => {


        t.it("Should properly create the store and check for default config", t => {

            var store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore");

            t.expect(store instanceof Ext.data.BufferedStore).toBe(true);

            t.expect(store.config.model).toBe("conjoon.cn_mail.model.mail.message.MessageItem");

            t.expect(store.alias).toContain("store.cn_mail-mailmessageitemstore");

            t.expect(store.getPageSize()).toBe(50);

            t.expect(store.getAutoLoad()).toBeFalsy();

            t.expect(store.getRemoteFilter()).toBe(true);
            t.expect(store.getRemoteSort()).toBe(true);

            // proxy
            t.expect(store.getProxy() instanceof Ext.data.proxy.Rest).toBe(true);

            t.expect(store.getProxy().getReader().getRootProperty()).toBe("data");

            t.expect(store.getSorters().length).toBe(1);
            t.expect(store.getSorters().getAt(0).getProperty()).toBe("date");
            t.expect(store.getSorters().getAt(0).getDirection()).toBe("DESC");


            // data range
            store.load({
                params: {
                    mailAccountId: "dev_sys_conjoon_org",
                    mailFolderId: "INBOX"
                }
            });
            t.waitForMs(t.parent.TIMEOUT, () => {
                t.expect(store.getTotalCount()).toBeGreaterThan(0);
            });
        });


        t.it("applySorters()", t => {

            var store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore");

            var exc;
            try {
                store.setSorters([{property: "foo"}]);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("only one sorter allowed");

            store.setSorters([]);

            store.getSorters().clear();
            t.expect(store.getSorters().length).toBe(0);

            exc = undefined;
            try {
                store.setSorters([{property: "foo"}, {property: "bar"}]);
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("only one sorter allowed");


        });

        t.it("findByCompoundKey()", t => {

            let store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore");


            let exc;

            try{store.findByCompoundKey("foo");}catch(e){exc=e;}
            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

            store.load({
                params: {
                    mailAccountId: "dev_sys_conjoon_org",
                    mailFolderId: "INBOX"
                }
            });

            t.waitForMs(t.parent.TIMEOUT, () => {
                let draft = store.getAt(0);

                t.expect(draft).toBe(store.getAt(store.findByCompoundKey(
                    conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey.fromRecord(draft)
                )));
            });

        });


        t.it("extjs-app-webmail#81 - afterEdit() not called", t => {

            let store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore");

            t.isntCalled("fireEvent", store);

            store.afterEdit({}, null);

            store.afterEdit({}, ["foo"]);

            store.destroy;
            store = null;

        });


        t.it("extjs-app-webmail#81 / extjs-app-webmail#47 - afterEdit() called", t => {

            let testFor = function (t, types) {
                let store = Ext.create("conjoon.cn_mail.store.mail.message.MessageItemStore");
                let STORE, RECORD, TYPE, MODIFIED;
                let plannedRec      = {},
                    plannedModified = types;

                store.on("update", function (store, record, type, modified) {
                    STORE    = store;
                    RECORD   = record;
                    TYPE     = type;
                    MODIFIED = modified;
                });

                store.contains = function () {return true;};
                store.afterEdit(plannedRec, plannedModified);

                t.expect(STORE).toBe(store);
                t.expect(RECORD).toBe(plannedRec);
                t.expect(TYPE).toBe("edit");
                t.expect(MODIFIED).toBe(plannedModified);

                store.destroy;
                store = null;

            };

            testFor(t, ["cn_deleted"]);
            testFor(t, ["cn_moved"]);

            testFor(t, ["cn_moved", "cn_deleted"]);

            testFor(t, ["answered"]);

            testFor(t, ["cn_moved", "cn_deleted", "amswered"]);
        });


    });

});
