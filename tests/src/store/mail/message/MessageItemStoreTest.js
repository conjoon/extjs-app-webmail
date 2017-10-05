/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.store.mail.message.MessageItemStoreTest', function(t) {

    var prop = function(testProperty) {
        return Ext.create('conjoon.cn_mail.model.mail.message.MessageItem', {
            testProp : testProperty
        });
    };

    t.requireOk('conjoon.cn_mail.data.mail.ajax.sim.message.MessageItemSim', function() {

        Ext.ux.ajax.SimManager.init({
            delay: 1
        });


        t.it("findInsertIndexInPagesForRecords() - page 1", function(t) {

            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                sorters : [{property : 'testProp', direction : 'DESC'}]
            });

            store.loadPage(1);
            t.waitForMs(550, function() {
                t.expect(store.getData().map[1]).toBeDefined();
                t.expect(store.findInsertIndexInPagesForRecord(prop(10000.5))).toEqual([1, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(-1))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(10000.5))).toEqual([1, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9999.5))).toEqual([1, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9999))).toEqual([1, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(10000))).toEqual([1, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9998))).toEqual([1, 1]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9997))).toEqual([1, 2]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9700))).toEqual([12, 24]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9700.5))).toEqual([12, 24]);
            });

        });


        t.it("findInsertIndexInPagesForRecords() - page 2", function(t) {
            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                sorters : [{property : 'testProp', direction : 'DESC'}]
            });

            store.loadPage(20);
            t.waitForMs(550, function() {
                t.expect(store.getData().map[1]).not.toBeDefined();
                t.expect(store.getData().map[18]).not.toBeDefined();
                t.expect(store.getData().map[19]).toBeDefined();
                t.expect(store.getData().map[31]).toBeDefined();
                t.expect(store.getData().map[32]).not.toBeDefined();
                // 19 - 31 available
                t.expect(store.findInsertIndexInPagesForRecord(prop(-1))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(0))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(1))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(26))).toEqual(null);

                t.expect(store.findInsertIndexInPagesForRecord(prop(9299))).toEqual([29, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9299.5))).toEqual([29, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9294.5))).toEqual([29, 5]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9274))).toEqual([30, 0]);
            });

        });


        t.it("findInsertIndexInPagesForRecords()", function(t) {
            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                sorters : [{property : 'testProp', direction : 'DESC'}]
            });

            store.loadPage(1);
            t.waitForMs(550, function() {
                t.expect(store.getData().map[1]).toBeDefined();
                t.expect(store.getData().map[13]).not.toBeDefined();
                t.expect(store.getData().map[11]).toBeDefined();
                t.expect(store.getData().map[12]).toBeDefined();

                t.expect(store.findInsertIndexInPagesForRecord(prop(9700))).toEqual([12, 24]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(9699))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(93))).toEqual(null);

                store.loadPage(10);
                t.waitForMs(550, function() {

                    store.loadPage(40);
                    t.waitForMs(550, function() {

                        t.expect(store.getData().map[22]).not.toBeDefined();
                        t.expect(store.getData().map[38]).not.toBeDefined();

                        // last page
                        t.expect(store.findInsertIndexInPagesForRecord(prop(9476))).toEqual([21, 23]);

                        // not in range page
                        t.expect(store.findInsertIndexInPagesForRecord(prop(9300))).toEqual(null);
                        t.expect(store.findInsertIndexInPagesForRecord(prop(9050))).toEqual(null);

                        // first page of existing range
                        t.expect(store.findInsertIndexInPagesForRecord(prop(9049))).toEqual([39, 0]);

                        // not in there
                        t.expect(store.findInsertIndexInPagesForRecord(prop(4000))).toEqual(null);
                    });

                });

            });

        });



        t.it("findInsertIndexInPagesForRecords() - page 1", function(t) {

            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                sorters : [{property : 'testProp', direction : 'ASC'}]
            });

            store.loadPage(1);
            t.waitForMs(550, function() {
                t.expect(store.getData().map[1]).toBeDefined();
                t.expect(store.findInsertIndexInPagesForRecord(prop(-1))).toEqual([1, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(0))).toEqual([1, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(1))).toEqual([1, 1]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(26))).toEqual([2, 1]);
             });

        });


        t.it("findInsertIndexInPagesForRecords() - page 2", function(t) {
            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                sorters : [{property : 'testProp', direction : 'ASC'}]
            });

            store.loadPage(20);
            t.waitForMs(550, function() {
                t.expect(store.getData().map[1]).not.toBeDefined();
                t.expect(store.getData().map[18]).not.toBeDefined();
                t.expect(store.getData().map[19]).toBeDefined();
                t.expect(store.getData().map[31]).toBeDefined();
                t.expect(store.getData().map[32]).not.toBeDefined();
                // 19 - 31 available
                t.expect(store.findInsertIndexInPagesForRecord(prop(-1))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(0))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(1))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(26))).toEqual(null);

                t.expect(store.findInsertIndexInPagesForRecord(prop(700))).toEqual([29, 0]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(700.5))).toEqual([29, 1]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(705))).toEqual([29, 5]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(725))).toEqual([30, 0]);
            });

        });


        t.it("findInsertIndexInPagesForRecords() - page 1, upper bounds", function(t) {
            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                sorters : [{property : 'testProp', direction : 'ASC'}]
            });

            store.loadPage(1);
            t.waitForMs(550, function() {
                t.expect(store.getData().map[1]).toBeDefined();
                t.expect(store.getData().map[13]).not.toBeDefined();
                t.expect(store.getData().map[11]).toBeDefined();
                t.expect(store.getData().map[12]).toBeDefined();

                t.expect(store.findInsertIndexInPagesForRecord(prop(299))).toEqual([12, 24]);
                t.expect(store.findInsertIndexInPagesForRecord(prop(300))).toEqual(null);
                t.expect(store.findInsertIndexInPagesForRecord(prop(400))).toEqual(null);

                store.loadPage(10);
                t.waitForMs(550, function() {

                    store.loadPage(40);
                    t.waitForMs(550, function() {
                        t.expect(store.getData().map[22]).not.toBeDefined();
                        t.expect(store.getData().map[38]).not.toBeDefined();

                        // last page
                        t.expect(store.findInsertIndexInPagesForRecord(prop(524))).toEqual([21, 24]);

                        // not in range page
                        t.expect(store.findInsertIndexInPagesForRecord(prop(528))).toEqual(null);

                        // first page of existing range
                        t.expect(store.findInsertIndexInPagesForRecord(prop(950))).toEqual([39, 0]);
                    });

                });

            });

        });


        t.it("Should properly create the store and check for default config", function(t) {

            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore');

            t.expect(store instanceof Ext.data.BufferedStore).toBe(true);

            t.expect(store.config.model).toBe('conjoon.cn_mail.model.mail.message.MessageItem');

            t.expect(store.alias).toContain('store.cn_mail-mailmessageitemstore');

            t.expect(store.getAutoLoad()).toBeFalsy();

            t.expect(store.getRemoteFilter()).toBe(true);
            t.expect(store.getRemoteSort()).toBe(true);

            // proxy
            t.expect(store.getProxy() instanceof Ext.data.proxy.Rest).toBe(true);

            t.expect(store.getProxy().getReader().getRootProperty()).toBe('data');

            t.expect(store.getSorters().length).toBe(1);
            t.expect(store.getSorters().getAt(0).getProperty()).toBe('date');
            t.expect(store.getSorters().getAt(0).getDirection()).toBe('DESC');


            // data range
            store.load();
            t.waitForMs(250, function() {
                t.expect(store.getTotalCount()).toBeGreaterThan(0);
            });
        })


        t.it("applySorters()", function(t) {

            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore');

            var exc, e;
            try {
                store.setSorters([{property : 'foo'}])
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("only one sorter allowed");

            store.setSorters([])

            store.getSorters().clear();
            t.expect(store.getSorters().length).toBe(0);

            exc = e = undefined;
            try {
                store.setSorters([{property : 'foo'}, {property : 'bar'}])
            } catch (e) {
                exc = e;
            }
            t.expect(exc).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("only one sorter allowed");


        });


        t.it("addSorted() - ASC", function(t) {
            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                    sorters : [{property : 'testProp', direction : 'ASC'}]
                }),
                newRec_1 = prop(1),
                newRec_15 = prop(1.5),
                newRec_inf = prop(877979071.5);

            store.loadPage(1);


            t.waitForMs(250, function() {

                t.expect(store.addSorted(newRec_1)).toBe(newRec_1);
                t.expect(store.getData().map[1].value.length).toBe(store.getPageSize());
                t.expect(store.getData().map[1].value[1]).toBe(newRec_1);

                t.expect(store.addSorted(newRec_15)).toBe(newRec_15);
                t.expect(store.getData().map[1].value.length).toBe(store.getPageSize());
                t.expect(store.getData().map[1].value[1]).toBe(newRec_1);
                t.expect(store.getData().map[1].value[2].get('testProp')).toBe(1);
                t.expect(store.getData().map[1].value[3]).toBe(newRec_15);

                t.expect(store.addSorted(newRec_inf)).toBe(null);


            });

        });


        t.it("addSorted() - DESC", function(t) {
            var store = Ext.create('conjoon.cn_mail.store.mail.message.MessageItemStore', {
                    sorters : [{property : 'testProp', direction : 'DESC'}]
                }),
                newRec_1    = prop(1),
                newRec_15   = prop(1.5),
                newRec_9998 = prop(9998),
                newRec_inf  = prop(877979071.5);

            store.loadPage(1);

            t.waitForMs(250, function() {

                t.expect(store.addSorted(newRec_1)).toBe(null);
                t.expect(store.addSorted(newRec_15)).toBe(null);

                t.expect(store.addSorted(newRec_inf)).toBe(newRec_inf);
                t.expect(store.getData().map[1].value.length).toBe(store.getPageSize());
                t.expect(store.getData().map[1].value[0]).toBe(newRec_inf);

                t.expect(store.addSorted(newRec_9998)).toBe(newRec_9998);
                t.expect(store.getData().map[1].value.length).toBe(store.getPageSize());
                t.expect(store.getData().map[1].value[2]).toBe(newRec_9998);
                t.expect(store.getData().map[1].value[3].get('testProp')).toBe(9998);

            });

        });



    });

});
