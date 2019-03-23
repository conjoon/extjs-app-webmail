/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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


    t.it("add()", function(t) {


        let exc, e,
            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageAttachmentStore'),
            ret, anon;;

        let att1  = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment'),
            att2  = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment'),
            att3  = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment'),
            att4  = Ext.create('conjoon.cn_mail.model.mail.message.DraftAttachment'),
            draft1 = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft'),
            item1 = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem');

        anon = Ext.create('Ext.data.Model');
        ret = store.add(anon);

        t.expect(Ext.isArray(ret)).toBe(true);
        t.expect(ret.length).toBe(1);
        t.expect(ret[0]).toBe(anon);

        t.isCalledNTimes('processRecordAssociation', draft1, 2);
        store.getAssociatedEntity = function() {
            return draft1;
        };

        store.add([att3, att4]);

        t.isntCalled('processRecordAssociation', item1);
        store.getAssociatedEntity = function() {
            return item1;
        };

        store.add([att3, att4]);


        store.destroy();
        store = null;
    });


    t.it("checkAndBuildCompoundKeyFilters() - associatedEntity available", function(t) {

        let exc, e,
            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageAttachmentStore');

        let draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            mailFolderId  : 'foo',
            mailAccountId : 'bar',
            id            : 'meh.'
        });

        store.getAssociatedEntity = function() {
            return draft;
        };

        store.addFilter({
            property : 'foo',
            value    : 'bar'
        }, true);

        store.addFilter({
            property : 'mailFolderId',
            value    : 'snafu'
        }, true);

        t.expect(store.checkAndBuildCompoundKeyFilters()).toBe(true);

        let filters = store.getFilters();

        let found = 0,
            exp = {
                mailFolderId        : 'foo',
                mailAccountId       : 'bar',
                parentMessageItemId : 'meh.'
            };

        for (let i = 0, len = filters.length; i < len; i++) {
            let filter = filters.getAt(i);
            if (['mailFolderId', 'mailAccountId', 'parentMessageItemId'].indexOf(filter.getProperty()) !== -1) {
                if (exp[filter.getProperty()] === filter.getValue()) {
                    found++;
                }
            }
        }

        t.expect(found).toBe(3);
        store.destroy();
        store = null;
    });


    t.it("checkAndBuildCompoundKeyFilters() - associatedEntity available", function(t) {

        let exc, e,
            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageAttachmentStore');

        let draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            mailFolderId  : 'foo',
            mailAccountId : 'bar',
            id            : 'meh.'
        });

        store.getAssociatedEntity = function() {
            return draft;
        };

        store.addFilter({
            property : 'foo',
            value    : 'bar'
        }, true);

        store.addFilter({
            property : 'mailFolderId',
            value    : 'snafu'
        }, true);

        t.expect(store.checkAndBuildCompoundKeyFilters()).toBe(true);

        let filters = store.getFilters();

        let found = 0,
            exp = {
                mailFolderId        : 'foo',
                mailAccountId       : 'bar',
                parentMessageItemId : 'meh.'
            };

        for (let i = 0, len = filters.length; i < len; i++) {
            let filter = filters.getAt(i);
            if (['mailFolderId', 'mailAccountId', 'parentMessageItemId'].indexOf(filter.getProperty()) !== -1) {
                if (exp[filter.getProperty()] === filter.getValue()) {
                    found++;
                }
            }
        }

        t.expect(found).toBe(3);
        store.destroy();
        store = null;
    });


    t.it("conjoon/app-cn_mail#65", function(t) {

        let exc, e,
            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageAttachmentStore');

        let draft = Ext.create('conjoon.cn_mail.model.mail.message.MessageDraft', {
            mailFolderId  : 'foo',
            mailAccountId : 'bar',
            id            : 'meh.'
        });

        store.getAssociatedEntity = function() {
            return draft;
        };

        store.addFilter({
            property : 'parentMessageItemId',
            value    : 'YO!'
        }, true);

        store.addFilter({
            property : 'messageItemId',
            value    : 'snafu'
        }, true);


        t.expect(store.checkAndBuildCompoundKeyFilters()).toBe(true);

        let filters = store.getFilters();

        let found = false,
            exp = {
                mailFolderId        : 'foo',
                mailAccountId       : 'bar',
                parentMessageItemId : 'meh.'
            };

        t.expect(filters.length).toBe(3);

        for (let i = 0, len = filters.length; i < len; i++) {
            let filter = filters.getAt(i);
            if (['mailFolderId', 'mailAccountId', 'parentMessageItemId'].indexOf(filter.getProperty()) !== -1) {
                if (exp[filter.getProperty()] === filter.getValue()) {
                    found++;
                }
            }
        }

        t.expect(found).toBe(3);
        store.destroy();
        store = null;

    });

});
