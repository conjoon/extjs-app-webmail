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

describe('conjoon.cn_comp.grid.feature.LivegridTest', function(t) {

    Ext.define('MockModel', {
        extend : 'Ext.data.Model',

        fields : [{
            name : 'testProp',
            type : 'int'
        }]
    });

    var createStore = function(cfg) {

            cfg = cfg || {};

            return Ext.create('Ext.data.BufferedStore', {

                model : 'MockModel',

                type   : 'buffered',
                fields : ['id', 'testProp'],
                pageSize : 100,
                autoLoad : cfg.autoLoad ? cfg.autoLoad : undefined,
                sorters  : cfg.sorters
                    ? cfg.sorters
                    : undefined,
                proxy : {
                    type : 'rest',
                    url  : 'cn_comp/fixtures/Livegrid',
                    reader : {
                        type         : 'json',
                        rootProperty : 'data'
                    }
                }
            });

        },
        getGrid = function(cfg) {

            cfg = cfg || {};

            var featureCfg = {
                ftype : 'cn_mail-mailmessagegridfeature-livegrid',
                id    : 'livegrid'
            };


            return Ext.create('Ext.grid.Panel', {

                renderTo : document.body,

                width  : 510,
                height : 550,

                features : [featureCfg],

                multiColumnSort :  cfg.multiColumnSort ? cfg.multiColumnSort : false,

                store : createStore(cfg),


                columns : [{
                    text      : 'id',
                    dataIndex : 'id',
                    flex      : 1
                }, {
                    text      : 'subject',
                    dataIndex : 'subject',
                    flex      : 1
                }, {
                    text      : 'date',
                    dataIndex : 'date',
                    flex      : 1
                }, {
                    text      : 'from',
                    dataIndex : 'from',
                    flex      : 1
                }, {
                    text      : 'testProp',
                    dataIndex : 'testProp',
                    flex      : 1
                }]

            });
        };




// +----------------------------------------------------------------------------
// |                    =~. Tests .~=
// +----------------------------------------------------------------------------

    t.requireOk('conjoon.cn_comp.grid.feature.Livegrid', function() {


            t.it("constructor()", function(t){

                let feature = Ext.create('conjoon.cn_mail.view.mail.message.grid.feature.Livegrid');

                t.isInstanceOf(feature, 'conjoon.cn_comp.grid.feature.Livegrid');

                t.expect(feature.alias).toContain('feature.cn_mail-mailmessagegridfeature-livegrid');

            });


            t.it("getRecordByCompoundKey()", function(t) {

                let grid           = getGrid({sorters : {property : 'testProp', dir : 'ASC'}, autoLoad : true}),
                    feature        = grid.view.getFeature('livegrid'),
                    PageMapUtil    = conjoon.cn_core.data.pageMap.PageMapUtil;


                t.waitForMs(750, function() {

                    t.isCalledOnce('getRecordBy', PageMapUtil);

                    try{feature.getRecordByCompoundKey('1');}catch(e){exc=e;}
                    t.expect(exc.msg).toBeDefined();
                    t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

                    let ck = conjoon.cn_mail.data.mail.message.CompoundKey.createFor(1, 2, 3);

                    feature.getRecordByCompoundKey(ck);

                    t.waitForMs(750, function() {
                        grid.destroy();
                        grid = null;
                    });
                });
            });



});
});