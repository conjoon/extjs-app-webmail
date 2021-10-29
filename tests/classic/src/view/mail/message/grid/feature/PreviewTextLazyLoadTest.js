/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
    "use strict";

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

            return Ext.create("Ext.grid.Panel", {

                renderTo: document.body,

                width: 510,
                height: 550,

                store: createStore(cfg),

                columns: [{
                    text: "id",
                    dataIndex: "id",
                    flex: 1
                }, {
                    text: "testProp",
                    dataIndex: "testProp",
                    flex: 1
                }]

            });
        };

    const createFeature = () => Ext.create("conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad");
    // +----------------------------------------------------------------------------
    // |                    =~. Tests .~=
    // +----------------------------------------------------------------------------

    t.requireOk(
        "conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad", () => {

            t.it("constructor()", t => {
                "use strict";

                let feature = createFeature();
                t.isInstanceOf(feature, "Ext.grid.feature.Feature");
                t.expect(feature.alias).toContain("feature.cn_webmailplug-previewtextlazyload");
            });


            t.it("init()", t => {
                "use strict";

                let
                    feature = createFeature(),
                    grid = {on: (evt, callback) => evt === "afterrender" ? callback() : ()=> {}},
                    spy = t.spyOn(feature, "installListeners").and.callFake(() => {});

                feature.init(grid);
                t.expect(spy.calls.count()).toBe(1);
            });


            t.it("installListeners() throws", t => {
                "use strict";

                let feature = createFeature();

                t.expect(feature.installed).not.toBe(true);
                feature.installed = true;

                let exc;
                try{
                    feature.installListeners();
                } catch (e) {
                    exc = e;
                }

                t.expect(exc.message).toContain("already installed");
            });


            t.it("installListeners()", t => {
                "use strict";

                let feature = createFeature(),
                    grid = getGrid();

                t.expect(feature.installed).not.toBe(true),
                feature.grid = grid;

                const previewfeature = {}, scrollMock ={};

                let getFeatureSpy, scrollableSpy, onSpy, monSpy;

                getFeatureSpy = t.spyOn(grid.view, "getFeature").and.callFake(id => {
                    if (id === "cn_mail-mailMessageFeature-messagePreview") {
                        return previewfeature;
                    }

                    return null;
                });

                scrollableSpy = t.spyOn(grid.view, "getScrollable").and.callFake(() => {
                    return scrollMock;
                });

                onSpy = t.spyOn(grid, "on").and.callFake(() => {});
                monSpy = t.spyOn(feature, "mon").and.callFake(() => {});

                feature.installListeners();

                // previewFeature rowBody
                t.expect(l8.isFunction(previewfeature.getPreviewTextRow)).toBe(true);
                t.expect(previewfeature.getPreviewTextRow({get: () => undefined})).toBe(
                    "<div class=\"previewText loading\"></div>"
                );
                t.expect(previewfeature.getPreviewTextRow({get: () => "foo"})).toBe(
                    "<div class=\"previewText\">foo</div>"
                );

                // grid.on "cn_mail-mailmessagegridbeforeload"
                t.expect(onSpy.calls.count()).toBe(1);
                t.expect(onSpy.calls.mostRecent().args[0]).toBe("cn_mail-mailmessagegridbeforeload");
                t.expect(onSpy.calls.mostRecent().args[2]).toBe(null);
                t.expect(onSpy.calls.mostRecent().args[3]).toEqual({single: true});
                let extraParamCall = onSpy.calls.mostRecent().args[1],
                    proxyMock = {extraParams: {}},
                    storeMock = {getProxy: () => proxyMock};
                extraParamCall(storeMock);
                t.expect(proxyMock.extraParams.attributes).toBe("*,previewText");

                // scrolable on scroll, load for store, prefetch for store observers
                t.expect(monSpy.calls.count()).toBe(3);
                [[scrollMock, "scroll"],
                    [grid, "cn_mail-mailmessagegridload"],
                    [grid, "cn_mail-mailmessagegridprefetch"]].forEach((test, index) => {
                    const call = monSpy.calls.all()[index];
                    t.expect(call.args[0]).toBe(test[0]);
                    t.expect(call.args[1]).toBe(test[1]);
                    t.expect(call.args[2]).toBe(feature.requestPreviewText);
                    t.expect(call.args[3]).toBe(feature);
                    t.expect(call.args[4]).toEqual({buffer: 500});
                });

                [getFeatureSpy, scrollableSpy, onSpy, monSpy].map(spy => spy.remove());

                t.expect(feature.installed).toBe(true);
            });


            t.it("requestPreviewText()", t => {

                "use strict";

                const
                    feature = createFeature(),
                    grid = getGrid(),
                    pagesToBrowseMock = {browse: [], pageMap: {}},
                    urlGroupsMock = {},
                    idsForUrlMock = {foo: []},
                    pendingLaziesMock = [1, 2];

                feature.grid = grid;

                feature.grid.getStore = () => null;
                t.expect(feature.requestPreviewText()).toBe(false);

                t.expect(feature.pendingLazies).toBeUndefined();
                feature.grid.getStore = () => ({});
                feature.getPagesToBrowse = () => null;
                t.expect(feature.requestPreviewText()).toBe(false);

                feature.getPagesToBrowse = () => pagesToBrowseMock;

                const
                    getUrlGroupsMock = t.spyOn(feature, "getUrlGroups").and.callFake(() => urlGroupsMock),
                    assembleUrlsMock = t.spyOn(feature, "assembleUrls").and.callFake(() => idsForUrlMock),
                    processRequestedIdsMock = t.spyOn(feature, "processRequestedIds").and.callFake(() => pendingLaziesMock);

                const res = feature.requestPreviewText();
                t.expect(res).toBe(feature.pendingLazies);

                t.expect(getUrlGroupsMock.calls.count()).toBe(1);
                t.expect(getUrlGroupsMock.calls.all()[0].args[0]).toBe(pagesToBrowseMock.browse);
                t.expect(getUrlGroupsMock.calls.all()[0].args[1]).toBe(pagesToBrowseMock.pageMap);

                t.expect(assembleUrlsMock.calls.count()).toBe(1);
                t.expect(assembleUrlsMock.calls.all()[0].args[0]).toBe(urlGroupsMock);

                t.expect(processRequestedIdsMock.calls.count()).toBe(1);
                t.expect(processRequestedIdsMock.calls.all()[0].args[0]).toBe(idsForUrlMock.foo);
                t.expect(processRequestedIdsMock.calls.all()[0].args[1]).not.toBe(feature.pendingLazies.foo);
                t.expect(processRequestedIdsMock.calls.all()[0].args[1]).toEqual([]);
                t.expect(processRequestedIdsMock.calls.all()[0].args[2]).toBe("foo");

                t.expect(feature.pendingLazies).toEqual({foo: [1, 2]});

            });


            t.it("computeIdsToLoad()", t => {
                "use strict";

                const feature = createFeature();

                t.expect(feature.computeIdsToLoad(
                    [1, 3, 4, 2], [3, 9, 2, 7, 100]
                )).toEqual({
                    ids: [1, 4],
                    pendingLazies: [ 3, 9, 2, 7, 100, 1, 4]
                });

                t.expect(feature.computeIdsToLoad(
                    [3, 9, 2, 7, 100],  [1, 3, 4, 2]
                )).toEqual({
                    ids: [9, 7, 100],
                    pendingLazies: [1, 3, 4, 2, 9, 7, 100]
                });

            });


            t.it("processRequestedIds() - sendRequest() not called", t => {
                "use strict";

                const
                    feature = createFeature(),
                    ids = [], pendings = [];

                let computeSpy = t.spyOn(feature, "computeIdsToLoad").and.callFake(() => null);
                t.isCalledNTimes("sendRequest", feature, 0);

                t.expect(feature.processRequestedIds(ids, pendings, "foo")).toEqual([]);

                t.expect(computeSpy.calls.count()).toBe(1);
                t.expect(computeSpy.calls.mostRecent().args[0]).toBe(ids);
                t.expect(computeSpy.calls.mostRecent().args[1]).toBe(pendings);

                computeSpy.remove();

            });


            t.it("processRequestedIds() - sendRequest()", t => {
                "use strict";

                const
                    feature = createFeature(),
                    ids = [],
                    pendings = [],
                    idsToLoad = {
                        ids: [4, 5, 6],
                        pendingLazies: [100, 101]
                    },
                    url = "foo";

                let computeSpy = t.spyOn(feature, "computeIdsToLoad").and.callFake(() => idsToLoad);
                let sendRequestSpy = t.spyOn(feature, "sendRequest").and.callFake(() => {});

                t.expect(feature.processRequestedIds(ids, pendings, url)).toEqual(idsToLoad.pendingLazies);

                t.expect(sendRequestSpy.calls.count()).toBe(1);
                t.expect(sendRequestSpy.calls.mostRecent().args[0]).toEqual(idsToLoad.ids);
                t.expect(sendRequestSpy.calls.mostRecent().args[1]).toBe(url);

                computeSpy.remove();
                sendRequestSpy.remove();
            });


            t.it("getPagesToBrowse()", t => {

                let currentViewRange = null;

                const mockViewRange = {
                    getStart: () => ({getPage: () => 1, getIndex: () => 5}),
                    getEnd: () => ({getPage: () => 3, getIndex: () => 8})
                };

                const
                    feature = createFeature(),
                    grid = getGrid(),
                    pageMapMock = {getPageSize: () => 21},
                    livegridMock = {
                        getCurrentViewRange: ()=> currentViewRange,
                        getPageMap: () => pageMapMock
                    };

                feature.grid = grid;
                grid.view = {getFeature: () => livegridMock};

                t.expect(feature.getPagesToBrowse()).toBe(false);

                currentViewRange = mockViewRange;

                t.expect(feature.getPagesToBrowse()).toEqual({
                    browse: [[1, 5, 20], [2, 0, 20], [3, 0, 8]],
                    pageMap: pageMapMock
                });

            });


            t.it("getUrlGroups()", t => {

                let indexCount = 0;

                const
                    feature = createFeature(),
                    browse = [[3, 4, 21], [4, 0, 21]],
                    getRecordAtSpy = t.spyOn(coon.core.data.pageMap.PageMapUtil, "getRecordAt").and.callFake(() => ({
                        get: () => indexCount++ % 2 === 0 ? undefined : "foo",
                        getCompoundKey: () => ({toArray: () => ["account", "folder", indexCount]})
                    })),
                    createSpy = t.spyOn(coon.core.data.pageMap.RecordPosition, "create").and.callFake(() => ({}));

                const groups = feature.getUrlGroups(browse, {});

                t.expect(getRecordAtSpy.calls.count()).toBe(40);
                t.expect(createSpy.calls.count()).toBe(40);

                t.expect(groups.account.folder.length).toBe(20);

                let chk = -1;
                groups.account.folder.forEach(id => t.expect(id).toBe(chk+=2));

                [getRecordAtSpy, createSpy].map(spy => spy.remove());
            });


            t.it("assembleUrls()", t => {
                const
                    feature = createFeature(),
                    grid = getGrid(),
                    mockStore = {
                        getProxy: () => ({
                            assembleUrl: (request) => `${request.getParams().mailAccountId}/${request.getParams().mailFolderId}`
                        })
                    };

                grid.getStore = () => mockStore;
                feature.grid = grid;

                const res = feature.assembleUrls({dev: {inbox: [1, 2, 3]}});

                t.expect(res["dev/inbox"]).toEqual([1, 2, 3]);
            });


            t.it("processLoadedPreviewText()", t => {
                const
                    feature = createFeature(),
                    livegridMock = {getRecordByCompoundKey: function () {}},
                    grid = getGrid();

                grid.view.getFeature = () => livegridMock;

                feature.grid = grid;
                feature.pendingLazies = {foo: ["4", "2", "100"]};

                let compoundKeySpy = t.spyOn(
                    conjoon.cn_mail.data.mail.message.CompoundKey,
                    "createFor"
                ).and.callFake(() => {});

                let mockRec = {
                    sets: [],
                    commits: 0,
                    set: function (field, value) {this.sets.push([field, value]);},
                    commit: function () {this.commits++;}
                };
                let getRecordByCompoundKeySpy = t.spyOn(livegridMock, "getRecordByCompoundKey").and.callFake(() => mockRec);

                feature.processLoadedPreviewText({
                    responseText: JSON.stringify({
                        data: [{previewText: 1}, {previewText: 2}]
                    }),
                    request: {
                        url: "foo",
                        params: {
                            ids: "1,2,3,4"
                        }
                    }
                });

                t.expect(compoundKeySpy.calls.count()).toBe(2);
                t.expect(getRecordByCompoundKeySpy.calls.count()).toBe(2);

                t.expect(mockRec.sets).toEqual([["previewText", 1], ["previewText", 2]]);
                t.expect(mockRec.commits).toBe(2);

                t.expect(feature.pendingLazies["foo"]).toEqual(["100", "1", "3"]);

                [getRecordByCompoundKeySpy, compoundKeySpy].map(spy => spy.remove());
            });


            t.it("sendRequest()", async t => {

                const
                    feature = createFeature(),
                    proxyMock = {headers: "bar"},
                    storeMock = {getProxy: () => proxyMock},
                    grid = getGrid();

                grid.getStore = () => storeMock;

                feature.grid = grid;

                let processLoadedPreviewTextSpy = t.spyOn(feature, "processLoadedPreviewText").and.callFake(() => {}),
                    requestSpy = t.spyOn(Ext.Ajax, "request").and.callFake(() => Promise.resolve("foobar"));

                await feature.sendRequest([1,2], "foo");

                t.expect(processLoadedPreviewTextSpy.calls.count()).toBe(1);
                t.expect(processLoadedPreviewTextSpy.calls.all()[0].args[0]).toBe("foobar");
                t.expect(requestSpy.calls.count()).toBe(1);
                let request = requestSpy.calls.all()[0];
                t.expect(request.args[0]).toEqual({
                    method: "get",
                    url: "foo",
                    headers: proxyMock.headers,
                    params: {
                        attributes: "previewText",
                        options: JSON.stringify({
                            previewText: {
                                plain: {
                                    precedence: true,
                                    length: 200
                                },
                                html: {
                                    length: 200
                                }
                            }
                        }),
                        target: "MessageItem",
                        ids: [1,2].join(",")
                    }
                });

                [requestSpy, processLoadedPreviewTextSpy].map(spy => spy.remove());


            });


        });
});
