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

describe('conjoon.cn_mail.view.mail.message.MessageGridTest', function(t) {

    var grid,
        gridConfig,
        prop = function(value, subject) {
            return Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                testProp    : value,
                subject     : subject,
                date        : new Date(),
                previewText : 'Random Text'
            });
        };

    t.afterEach(function() {
        if (grid) {
            grid.destroy();
            grid = null;
        }
    });

    t.beforeEach(function() {
        gridConfig = {
            renderTo : document.body
        }
    });

    t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', function() {
    t.requireOk('conjoon.cn_mail.model.mail.message.MessageItem', function() {
    t.requireOk('conjoon.cn_mail.store.mail.message.MessageItemStore', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it("Should create and show the grid along with default config checks", function(t) {
            grid = Ext.create(
                'conjoon.cn_mail.view.mail.message.MessageGrid', gridConfig);

            t.expect(grid instanceof Ext.grid.Panel).toBeTruthy();

            t.expect(grid.alias).toContain('widget.cn_mail-mailmessagegrid');

            let feature = grid.view.getFeature('cn_mail-mailMessageFeature-messagePreview');
            t.isInstanceOf(feature, 'conjoon.cn_comp.grid.feature.RowBodySwitch');
            t.expect(feature.disabled).toBeFalsy();

            t.isCalled('getHumanReadableDate', conjoon.cn_core.util.Date);
            feature.getAdditionalData(null, null, {get : function() {}}, null);

            feature = grid.view.getFeature('cn_mail-mailMessageFeature-livegrid');
            t.isInstanceOf(feature, 'conjoon.cn_comp.grid.feature.Livegrid');

            feature = grid.view.getFeature('cn_mail-mailMessageFeature-rowFlyMenu');
            t.isInstanceOf(feature, 'conjoon.cn_comp.grid.feature.RowFlyMenu');
            let MARKUNREAD = false;
            for (let i in feature.idToActionMap) {
                if (feature.idToActionMap[i] === 'markunread') {
                    MARKUNREAD = true;
                }
            }
            t.expect(MARKUNREAD).toBe(true);
        });


        t.it("enableRowPreview()", function(t) {
            grid = Ext.create(
                'conjoon.cn_mail.view.mail.message.MessageGrid', gridConfig);
            let feature    = grid.view.getFeature('cn_mail-mailMessageFeature-messagePreview'),
                rowFlyMenu = grid.view.getFeature('cn_mail-mailMessageFeature-rowFlyMenu');

            t.expect(feature.disabled).toBe(false);
            grid.enableRowPreview(false);
            t.expect(feature.disabled).toBe(true);
            t.expect(rowFlyMenu.disabled).toBe(true);
            grid.enableRowPreview();
            t.expect(feature.disabled).toBe(false);
            t.expect(rowFlyMenu.disabled).toBe(false);
            grid.enableRowPreview(false)
            t.expect(feature.disabled).toBe(true);
            t.expect(rowFlyMenu.disabled).toBe(true);
            grid.enableRowPreview(true);
            t.expect(feature.disabled).toBe(false);
            t.expect(rowFlyMenu.disabled).toBe(false);
        });


        t.it("enableRowPreview while store loads", function(t) {

            t.diag("upping SimManager delay to 1500");

            Ext.ux.ajax.SimManager.init({
                delay: 1500
            });

            var exc, e;

            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                store    : {
                    type     : 'cn_mail-mailmessageitemstore',
                    autoLoad : false,
                    sorters  : [{
                        property  : 'testProp',
                        direction : 'DESC'
                    }]
                },
                renderTo : document.body
            });

            grid.getStore().load();

            t.waitForMs(250, function() {
                try {
                    grid.enableRowPreview(true);
                } catch (e) {
                    exc = e;
                }

                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain("cannot call enablerowpreview");
            });

        });


        t.it("bindStore with exception and ext-empty-store", function(t) {
            var exc, e;

            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                renderTo : document.body
            });

            try {
                grid.setStore(Ext.create('Ext.data.Store'));
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("store must be an instance of");


            grid.setStore(Ext.data.StoreManager.lookup('ext-empty-store'));
            t.expect(grid.getStore()).toBe(Ext.data.StoreManager.lookup('ext-empty-store'));

            t.isCalledNTimes('onMessageItemStoreBeforeLoad', grid, 0);
            t.isCalledNTimes('onMessageItemStoreLoad', grid, 0);
            grid.getStore().load();

            t.waitForMs(500, function() {

            });
        });



        t.it("bindStore with proper store config and event behavior", function(t) {

            t.diag("downing SimManager delay to 1");

            Ext.ux.ajax.SimManager.init({
                delay: 1
            });

            var ULOAD = 0, UBEFORELOAD = 0, store;

            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                renderTo : document.body
            });

            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                autoLoad : false
            });

            grid.setStore(store);


            grid.on('cn_mail-mailmessagegridbeforeload', function() {UBEFORELOAD++;});
            grid.on('cn_mail-mailmessagegridload',       function() {ULOAD++;});

            t.expect(ULOAD).toBe(0);
            t.expect(UBEFORELOAD).toBe(0);

            store.load();

            t.waitForMs(850, function() {
                t.expect(ULOAD).toBe(1);
                t.expect(UBEFORELOAD).toBe(1);

                grid.unbindStore(store);

                store.reload();

                t.waitForMs(850, function() {
                    t.expect(ULOAD).toBe(1);
                    t.expect(UBEFORELOAD).toBe(1);
                });

            })
        });


        t.it("selection still available after pageremove", function(t) {
            let store;

            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                renderTo : document.body
            });

            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                autoLoad : false
            });

            grid.setStore(store);

            store.load();

            t.waitForMs(850, function() {

                let rec = store.getAt(0);

                grid.getSelectionModel().select(rec);

                grid.view.getScrollable().scrollTo(0, 100000);

                t.waitForMs(250, function() {

                    store.getData().removeAtKey(1);
                    t.expect(store.getData().map[1]).toBeUndefined();

                    t.expect(grid.getSelection()[0]).toBe(rec);
                });

            })
        });


        t.it("call to relayEvents properly registered", function(t) {
            let store;

            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                renderTo : document.body
            });

            let rowFlyMenu = grid.view.getFeature('cn_mail-mailMessageFeature-rowFlyMenu'),
                CALLED = 0,
                SHOWN  = 0;

            let fid = null;

            for (let i in rowFlyMenu.idToActionMap) {
                if (rowFlyMenu.idToActionMap[i] === 'markunread') {
                    fid = i;
                    break;
                }
            }

            t.expect(fid).toBeTruthy();

            t.expect(CALLED).toBe(0);

            grid.on('cn_comp-rowflymenu-beforemenushow', function(feature, item, action, record) {
                SHOWN++;
            });

            grid.on('cn_comp-rowflymenu-itemclick', function(feature, item, action, record) {
                CALLED++;
            });

            t.expect(SHOWN).toBe(0);
            rowFlyMenu.fireEvent('beforemenushow');
            t.expect(SHOWN).toBe(1);

            rowFlyMenu.onMenuClick(
                {stopEvent : Ext.emptyFn},
                {id : fid}
            );

            t.expect(CALLED).toBe(1);
        });


        t.it("updateRowFlyMenu()", function(t) {

            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                renderTo : document.body
            });

            let rowFlyMenu = grid.view.getFeature('cn_mail-mailMessageFeature-rowFlyMenu'),
                rec        = Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
                    mailFolderId : 2,
                    seen       : true
                }),
                getReadItem = function() {
                    return rowFlyMenu.menu.query('div[id=cn_mail-mailMessageFeature-rowFlyMenu-markUnread]', true)[0];
                };

            grid.updateRowFlyMenu(rec);

            t.expect(getReadItem().getAttribute('data-qtip').toLowerCase()).toBe("mark as unread");

            rec.set('seen', false);
            grid.updateRowFlyMenu(rec);

            t.expect(getReadItem().getAttribute('data-qtip').toLowerCase()).toBe("mark as read");


        });


        t.it("getRowClass()", function(t) {
            grid = Ext.create(
                'conjoon.cn_mail.view.mail.message.MessageGrid', gridConfig);

            let messageItem = prop();

            messageItem.set('seen', true);
            t.expect(grid.view.getRowClass(messageItem)).not.toContain('boldFont');
            t.expect(grid.view.getRowClass(messageItem)).not.toContain('cn-deleted');
            t.expect(grid.view.getRowClass(messageItem)).not.toContain('cn-moved');

            messageItem.set('seen', false);
            t.expect(grid.view.getRowClass(messageItem)).toContain('boldFont');
            t.expect(grid.view.getRowClass(messageItem)).not.toContain('cn-deleted');
            t.expect(grid.view.getRowClass(messageItem)).not.toContain('cn-moved');

            messageItem.set('cn_deleted', true);
            t.expect(grid.view.getRowClass(messageItem)).toContain('boldFont');
            t.expect(grid.view.getRowClass(messageItem)).toContain('cn-deleted');
            t.expect(grid.view.getRowClass(messageItem)).not.toContain('cn-moved');

            messageItem.set('cn_moved', true);
            t.expect(grid.view.getRowClass(messageItem)).toContain('boldFont');
            t.expect(grid.view.getRowClass(messageItem)).toContain('cn-deleted');
            t.expect(grid.view.getRowClass(messageItem)).not.toContain('cn-moved');

            messageItem.set('cn_deleted', false);

            messageItem.set('cn_moved', true);
            t.expect(grid.view.getRowClass(messageItem)).toContain('boldFont');
            t.expect(grid.view.getRowClass(messageItem)).not.toContain('cn-deleted');
            t.expect(grid.view.getRowClass(messageItem)).toContain('cn-moved');


        });


        t.it("draft rendering", function(t) {
            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                renderTo : document.body
            });

            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                autoLoad : false
            });

            grid.setStore(store);

            store.load();

            t.waitForMs(1250, function() {

                let messageItem = grid.getStore().getAt(0);
                messageItem.set('draft', false);
                messageItem.commit();

                let subjectCont = Ext.dom.Query.select("div[class*=subject]", grid.el.dom)[0];
                t.expect(subjectCont.firstChild.tagName).toBeUndefined()

                messageItem.set('draft', true);
                messageItem.commit();

                subjectCont = Ext.dom.Query.select("div[class*=subject]", grid.el.dom)[0];
                t.expect(subjectCont.firstChild.tagName.toLowerCase()).toBe('span');
                t.expect(subjectCont.firstChild.className.toLowerCase()).toBe('draft');
            });

        });


        t.it("stringifyTo", function(t) {
            grid = Ext.create('conjoon.cn_mail.view.mail.message.MessageGrid', {
                width    : 400,
                height   : 400,
                renderTo : document.body
            });

            store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                autoLoad : false
            });

            grid.setStore(store);

            store.load();

            t.waitForMs(750, function() {

                t.expect(grid.stringifyTo([{
                    address : 'foobar',
                    name    : 'bar'
                }, {
                    address : 'barfoo',
                    name    : 'foo'
                }])).toBe('bar, foo');
            });

        });


    });})});});
