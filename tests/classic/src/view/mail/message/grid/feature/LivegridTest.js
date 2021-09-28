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

StartTest(t => {

    Ext.define("MockModel", {
        extend: "Ext.data.Model",

        fields: [{
            name: "testProp",
            type: "int"
        }]
    });

    var createStore = function (cfg) {

            cfg = cfg || {};

            return Ext.create("Ext.data.BufferedStore", {

                model: "MockModel",

                type: "buffered",
                fields: ["id", "testProp"],
                pageSize: 100,
                autoLoad: cfg.autoLoad ? cfg.autoLoad : undefined,
                sorters: cfg.sorters
                    ? cfg.sorters
                    : undefined,
                proxy: {
                    type: "rest",
                    url: "cn_comp/fixtures/Livegrid",
                    reader: {
                        type: "json",
                        rootProperty: "data"
                    }
                }
            });

        },
        getGrid = function (cfg) {

            cfg = cfg || {};

            var featureCfg = {
                ftype: "cn_mail-mailmessagegridfeature-livegrid",
                id: "livegrid"
            };


            return Ext.create("Ext.grid.Panel", {

                renderTo: document.body,

                width: 510,
                height: 550,

                features: [featureCfg],

                multiColumnSort: cfg.multiColumnSort ? cfg.multiColumnSort : false,

                store: createStore(cfg),


                columns: [{
                    text: "id",
                    dataIndex: "id",
                    flex: 1
                }, {
                    text: "subject",
                    dataIndex: "subject",
                    flex: 1
                }, {
                    text: "date",
                    dataIndex: "date",
                    flex: 1
                }, {
                    text: "from",
                    dataIndex: "from",
                    flex: 1
                }, {
                    text: "testProp",
                    dataIndex: "testProp",
                    flex: 1
                }]

            });
        };


    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk("coon.comp.grid.feature.Livegrid", () => {


        t.it("constructor()", function (t){

            let feature = Ext.create("conjoon.cn_mail.view.mail.message.grid.feature.Livegrid");

            t.isInstanceOf(feature, "coon.comp.grid.feature.Livegrid");

            t.expect(feature.alias).toContain("feature.cn_mail-mailmessagegridfeature-livegrid");

        });


        t.it("getRecordByCompoundKey()", t => {

            let grid           = getGrid({sorters: {property: "testProp", dir: "ASC"}, autoLoad: true}),
                feature        = grid.view.getFeature("livegrid"),
                PageMapUtil    = coon.core.data.pageMap.PageMapUtil,
                exc;


            t.waitForMs(t.parent.TIMEOUT, () => {

                t.isCalledOnce("getRecordBy", PageMapUtil);

                try{feature.getRecordByCompoundKey("1");}catch(e){exc=e;}
                t.expect(exc.msg).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

                let ck = conjoon.cn_mail.data.mail.message.CompoundKey.createFor(1, 2, 3);

                feature.getRecordByCompoundKey(ck);

                t.waitForMs(t.parent.TIMEOUT, () => {
                    grid.destroy();
                    grid = null;
                });
            });
        });


    });
});