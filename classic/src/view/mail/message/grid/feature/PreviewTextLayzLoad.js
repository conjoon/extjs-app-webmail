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


/**
 *
 */
Ext.define("conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad", {

    extend: "Ext.grid.feature.Feature",

    alias: "feature.cn_webmailplug-previewtextlazyload",

    requires: [
        // @define
        "l8",
        "conjoon.cn_mail.data.mail.message.CompoundKey"
    ],

    /**
    *  @type {Object} pendingLazies
     * @private
     */


    /**
     * Inits this plugin.
     * Updates the getPreviewTextRow() of the rowbodyswitch-feature to show a loading
     * indicator and changes the MessageItem's store proxy to send additional
     * "attributes"-query-param to the MessageItem-store to exclude the previewText from the
     * set of attributes.
     * Observer will then lazyLoad the previewText of items that are not in the view via
     * requestPreviewText().
     *
     * @param {conjoon.cn_mail.view.mail.message.MessageGrid} grid
     *
     * @see #requestPreviewText
     */
    init: function (grid) {
        "use strict";

        const me = this;

        grid.on("afterrender", () => {
            const feat = grid.view.getFeature("cn_mail-mailMessageFeature-messagePreview");

            grid.on("cn_mail-mailmessagegridbeforeload", store => store.getProxy().extraParams.attributes = "*,previewText", null, {single: true});

            feat.getPreviewTextRow = record => `<div class="previewText ${(record.get("previewText") === undefined ? "loading" : "")}">${Ext.util.Format.nbsp(record.get("previewText"))}</div>`;

            const
                requestor = () => me.requestPreviewText(),
                opts = {buffer: 500},
                scroll = grid.view.getScrollable();


            me.mon(scroll, "scroll", requestor, me, opts);
            me.mon(grid,   "cn_mail-mailmessagegridload", requestor, me, opts);
            me.mon(grid,   "cn_mail-mailmessagegridprefetch", requestor, me, opts);
        });

    },


    /**
     * Computes the rows in the visible rect and sends queries to the backend to load the
     * previewText attribute ogf the records the rows represent.
     *
     *
     * @returns {*}
     */
    requestPreviewText () {
        "use strict";

        const
            me = this,
            grid = me.grid,
            livegrid = grid.view.getFeature("cn_mail-mailMessageFeature-livegrid"),
            store = grid.getStore(),
            proxy = store.getProxy();

        const pageMap = livegrid.getPageMap();

        const
            pageSize = pageMap.getPageSize(),
            range = livegrid.getCurrentViewRange();

        if (!range) {
            return;
        }

        const
            pages = l8.createRange(range.getStart().getPage(), range.getEnd().getPage()),
            startIndex = range.getStart().getIndex(),
            endIndex = range.getEnd().getIndex(),
            PageMapUtil = coon.core.data.pageMap.PageMapUtil,
            RecordPosition = coon.core.data.pageMap.RecordPosition,
            browse = [],
            urls = Object.create(null),
            requestTemplate = Ext.create("Ext.data.Request", {
                action: "read"
            });

        if (!me.pendingLazies) {
            me.pendingLazies = {};
        }
        if (!me.lazyRequests) {
            me.lazyRequests = Object.create(null);
        }

        pages.forEach ((page, index, pages) => {
            browse.push([
                page,
                index === 0 ? startIndex : 0,
                index === pages.length - 1 ? endIndex : pageSize - 1
            ]);
        });

        let rec, url, ck, groups = Object.create(null);

        browse.forEach(pageConf => {
            for (let i = pageConf[1], len = pageConf[2]; i <= len; i++) {
                rec = PageMapUtil.getRecordAt(
                    RecordPosition.create(pageConf[0], i),
                    pageMap
                );

                if (rec.get("previewText") === undefined) {
                    ck = rec.getCompoundKey().toArray();
                    if (!groups[ck[0]]) {
                        groups[ck[0]] = {};
                    }
                    if (!groups[ck[0]][ck[1]]) {
                        groups[ck[0]][ck[1]] = [];
                    }
                    groups[ck[0]][ck[1]].push(ck[2]);
                }
            }
        });

        const toLoad = {};
        let idsToLoad;

        Object.keys(groups).forEach(mailAccountId => {
            Object.keys(groups[mailAccountId]).forEach(mailFolderId => {
                requestTemplate.setParams({
                    mailAccountId,
                    mailFolderId
                });
                url = proxy.assembleUrl(requestTemplate);

                urls[url] = groups[mailAccountId][mailFolderId];
            });
        });

        Object.keys(urls).forEach(url => {
            me.pendingLazies[url] = me.pendingLazies[url] ? me.pendingLazies[url] :  [];
            idsToLoad = urls[url].filter(item => me.pendingLazies[url].indexOf(item) === -1);
            me.pendingLazies[url] = me.pendingLazies[url].concat(idsToLoad);
            toLoad[url] = idsToLoad;

            if (!idsToLoad.length) {
                return;
            }

            Ext.Ajax.request({
                method: "get",
                url,
                headers: proxy.headers,
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
                    ids: idsToLoad.join(",")
                }
            }).then(response => {

                const
                    url = response.request.url,
                    loadedIds = response.request.params.ids.split(",");

                me.pendingLazies[url] = l8.extract(me.pendingLazies[url].concat(loadedIds));

                let data = JSON.parse(response.responseText);

                data.data.forEach(item => {
                    let rec = livegrid.getRecordByCompoundKey(conjoon.cn_mail.data.mail.message.CompoundKey.createFor(
                        item.mailAccountId, item.mailFolderId, item.id
                    ));

                    rec.set("previewText", item.previewText ?? "");
                    rec.commit();
                });
            });
        });


        return idsToLoad;

    }


});
