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

describe('conjoon.cn_mail.store.mail.message.MessageAttachmentStoreTest', function(t) {


    t.it("Should properly create the store and check for default config", function(t) {

        let store = Ext.create('conjoon.cn_mail.store.mail.message.MessageAttachmentStore');

        t.isInstanceOf(store, 'Ext.data.Store');

        t.expect(store.config.model).toBeUndefined();

        t.expect(store.alias).toContain('store.cn_mail-mailmessageattachmentstore');

        store.destroy();
        store = null;
    });


    t.it("load()", function(t) {

        let exc, e,
            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageAttachmentStore');

        store.addFilter([{
            property : 'mailFolderId',
            value    : "INBOX.Drafts"
        }], true);

        try{store.load();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("not set");
        t.expect(exc.msg.toLowerCase()).toContain("mailaccountid");
        t.expect(exc.msg.toLowerCase()).toContain("parentmessageitemid");
        t.expect(exc.msg.toLowerCase()).not.toContain("mailfolderid");
        exc = undefined;

        store.clearFilter(true);

        store.addFilter([{
            property : 'mailAccountId',
            value    : "foo"
        }], true);


        try{store.load();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("not set");
        t.expect(exc.msg.toLowerCase()).toContain("parentmessageitemid");
        t.expect(exc.msg.toLowerCase()).toContain("mailfolderid");
        t.expect(exc.msg.toLowerCase()).not.toContain("mailaccountid");
        exc = undefined;


        store.clearFilter(true);

        store.addFilter([{
            property : 'parentMessageItemId',
            value    : "foo"
        }], true);


        try{store.load();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("not set");
        t.expect(exc.msg.toLowerCase()).toContain("mailaccountid");
        t.expect(exc.msg.toLowerCase()).toContain("mailfolderid");
        t.expect(exc.msg.toLowerCase()).not.toContain("parentmessageitemid");

        exc = undefined;


    //---------------------

        store.clearFilter(true);

        store.addFilter([{
            property : 'mailAccountId',
            value    : ""
        }], true);


        try{store.load();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("no valid value");
        t.expect(exc.msg.toLowerCase()).toContain("mailaccountid");
        exc = undefined;


        store.clearFilter(true);

        store.addFilter([{
            property : 'mailFolderId',
            value    : ""
        }], true);


        try{store.load();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("no valid value");
        t.expect(exc.msg.toLowerCase()).toContain("mailfolderid");
        exc = undefined;

        store.clearFilter(true);

        store.addFilter([{
            property : 'parentMessageItemId',
            value    : ""
        }], true);


        try{store.load();} catch(e){exc=e};
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("no valid value");
        t.expect(exc.msg.toLowerCase()).toContain("parentmessageitemid");
        exc = undefined;

        store.clearFilter(true);

        store.addFilter([{
            property : 'mailFolderId',
            value    : "INBOX.Drafts"
        }, {
            property : 'mailAccountId',
            value    : "foo"
        }, {
            property : 'parentMessageItemId',
            value    : "1"
        }], true);

        t.expect(store.load()).toBeTruthy();

        store.destroy();
        store = null;
    });


});
