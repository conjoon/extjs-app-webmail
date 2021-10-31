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
 * A grid feature for {conjoon.cn_mail.view.mail.message.MessageGrid} that takes care of lazy loading PreviewTexts.
 * Since previewText are generated by reading out the html/plain content-parts of an email,
 * the lookup involved with this may be expensive.
 * By adding this feature to teh MessageGrid, the requested endpoint for the MessageItems will be queried with
 * a request to return all attributes except for the previewText. This makes sure that the
 * initial list of MessageItems is built up from the base envelope information available only.
 * The feature will then subsequently compute the items which are in the visible range of the MessageGrid,
 * and requests the previewText-attributes exclusively for this set of data.
 *
 */
Ext.define("conjoon.cn_mail.view.mail.message.grid.feature.PreviewTextLazyLoad", {

    extend: "Ext.grid.feature.Feature",

    alias: "feature.cn_webmailplug-previewtextlazyload",

    requires: [
        // @define
        "l8",
        "conjoon.cn_mail.data.mail.message.CompoundKey",
        "coon.core.data.pageMap.PageMapUtil",
        "coon.core.data.pageMap.RecordPosition"
    ],

    /**
     * @type {Object} pendingLazies
     * @private
     */

    /**
     * @type {Boolean} installed
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
     * @see #installListeners
     */
    init (grid) {
        "use strict";

        const me = this;
        grid.on("afterrender", me.installListeners, me, {single: true});
    },


    /**
    *
     *
     * @param {conjoon.cn_mail.view.mail.message.MessageGrid} grid
     */
    installListeners () {
        "use strict";

        const
            me = this,
            grid = me.grid;

        if (me.installed) {
            throw new Error("The listeners for this feature were already installed");
        }

        const feat = grid.view.getFeature("cn_mail-mailMessageFeature-messagePreview");

        // set store's extraParams to all attributes excluding previewText (see conjoon/rest-api-email)
        grid.on(
            "cn_mail-mailmessagegridbeforeload",
            store => store.getProxy().extraParams.attributes = "*,previewText",
            null,
            {single: true}
        );

        // change the previewText to include
        feat.getPreviewTextRow = record => {
            let txt = record.get("previewText");
            return `<div class="previewText${(txt === undefined ? " loading" : "")}">`+
                    (txt !== undefined ? Ext.util.Format.nbsp(txt) : "") +
                    "</div>";
        };

        // register for scroll, load and prefetch
        const
            requestor = me.requestPreviewText,
            opts = {buffer: 500},
            scroll = grid.view.getScrollable();

        me.mon(scroll, "scroll", requestor, me, opts);
        me.mon(grid,   "cn_mail-mailmessagegridload", requestor, me, opts);
        me.mon(grid,   "cn_mail-mailmessagegridprefetch", requestor, me, opts);

        me.installed = true;
    },


    /**
     * Computes the rows in the visible rect and sends queries to the backend to load the
     * previewText attribute of the records the rows represent.
     *
     * @returns {Object} The current pending lazies
     */
    requestPreviewText () {
        "use strict";

        const
            me = this,
            grid = me.grid,
            store = grid.getStore();

        if (!store) {
            return false;
        }

        const pages = me.getPagesToBrowse();
        if (!pages) {
            return false;
        }

        if (!me.pendingLazies) {
            me.pendingLazies = {};
        }

        const
            urlGroups = me.getUrlGroups(pages.browse, pages.pageMap),
            idsForUrl = me.assembleUrls(urlGroups);

        Object.keys(idsForUrl).forEach(url => {
            me.pendingLazies[url] = me.processRequestedIds(
                idsForUrl[url],
                me.pendingLazies[url] ? me.pendingLazies[url] : [],
                url
            );
        });

        return me.pendingLazies;
    },

    /**
     * Returns an Object where the property "browse" is an array with page information to browse.
     * First index is the page,  second and third are start and end index, representing pages currently loaded
     * into the store for which previewTexts should eventually get loaded.
     * The property "pageMap" holds the pageMap of the BuffferedStore.
     *
     * @return {Object} Returns false if no currentViewRange can be coimputed by the livegrid.
     */
    getPagesToBrowse () {

        const
            me = this,
            grid = me.grid,
            livegrid = grid.view.getFeature("cn_mail-mailMessageFeature-livegrid"),
            pageMap = livegrid.getPageMap(),
            pageSize = pageMap.getPageSize(),
            browse = [],
            range = livegrid.getCurrentViewRange();

        if (!range) {
            return false;
        }

        const
            pages = l8.createRange(range.getStart().getPage(), range.getEnd().getPage()),
            startIndex = range.getStart().getIndex(),
            endIndex = range.getEnd().getIndex();

        pages.forEach ((page, index, pages) => {
            browse.push([
                page,
                index === 0 ? startIndex : 0,
                index === pages.length - 1 ? endIndex : pageSize - 1
            ]);
        });

        return {
            browse: browse,
            pageMap: pageMap
        };
    },


    /**
     * Returns assembled urls to be called with the ids as params.
     * The returned object is keyed with a unique url and its values are
     * all the ids that should be considered for lazy loading loading.
     *
     * @param {Object} urlGroups
     *
     * @return {Object}
     */
    assembleUrls (urlGroups) {

        const
            me = this,
            idsForUrl = Object.create(null),
            requestTemplate = Ext.create("Ext.data.Request", {
                action: "read"
            }),
            grid = me.grid,
            store = grid.getStore(),
            proxy = store.getProxy();

        let url = "";

        Object.keys(urlGroups).forEach(mailAccountId => {
            Object.keys(urlGroups[mailAccountId]).forEach(mailFolderId => {
                requestTemplate.setParams({
                    mailAccountId,
                    mailFolderId
                });
                url = proxy.assembleUrl(requestTemplate);

                idsForUrl[url] = urlGroups[mailAccountId][mailFolderId];
            });
        });

        return idsForUrl;
    },

    /**
     * Returns a group of urls that should be queried. Each top level group has a mail account id
     * as its key, its value is an object with all the mail folders that should be queried. each
     * mail folder has an array of ids that should be queried for their previewText, if and only
     * if that previewText is undefined.
     *
     * @example
     *    this.getUrlGroups([[1, 1, 4]], pageMap);
     *    // {"dev" : {"INBOX": [1,2,3,4]}}
     *
     *
     * @param {Array} browse An array of pages to browse. Each page itself is a numeric array
     * containing  the page number, the start and the end index ([page, start, end]))
     * @param {Ext.data.PageMap} pageMap
     *
     * @returns {{}}
     *
     * @private
     */
    getUrlGroups (browse, pageMap) {
        "use strict";

        const
            groups = {},
            PageMapUtil = coon.core.data.pageMap.PageMapUtil,
            RecordPosition = coon.core.data.pageMap.RecordPosition;

        browse.forEach(pageConf => {
            for (let i = pageConf[1], len = pageConf[2]; i <= len; i++) {
                let rec = PageMapUtil.getRecordAt(
                    RecordPosition.create(pageConf[0], i),
                    pageMap
                );

                if (rec.get("previewText") === undefined) {
                    let ck = rec.getCompoundKey().toArray();
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

        return groups;
    },


    /**
     * Processes the requested ids by comparing them against the list of pending lazies
     * submitted. Will then re-compute the pending lazies and return them, after the request
     * for the ids not pending is sent.
     * The returned array may be empty.
     *
     * @param {Array} ids
     * @param {Array} pendingLazies
     * @param {String} url The url that should be requested
     *
     * @param idsForUrl
     */
    processRequestedIds (ids, pendingLazies, url) {

        const me = this;

        let idsToLoad = me.computeIdsToLoad(ids, pendingLazies);

        if (idsToLoad !== null) {
            me.sendRequest(idsToLoad.ids, url);
            return idsToLoad.pendingLazies;
        }

        return [];
    },


    /**
     * Returns the ids that need to be loaded. If any id is found in pendingLazies,
     * it will not be included in the set.
     * All ids that are not included in the pendingLazies will get registered in this object
     * for the specified url.
     *
     *  @example
     *    me.pendingLazies["foo"] = [1, 3, 4, 2];
     *
     *    computeIdsToLoad([3, 9, 2, 7, 100],  [1, 3, 4, 2]);
     *    // returns {ids : [9, 7, 100],
     *    //          pendingLazies : [1, 3, 4, 2, 9, 7, 100]}
     *
     *
     *
     * @param {Array} ids The precomputed ids that need to be checked agains the pendingLazies
     * that may or may not exist.
     * @param {Array} pendingLazies The current set of pending ids
     *
     * @return {?Object}
     */
    computeIdsToLoad (ids, pendingLazies) {

        let idsToLoad = ids.filter(item => pendingLazies.indexOf(item) === -1);
        pendingLazies = pendingLazies.concat(idsToLoad);

        if (!idsToLoad.length) {
            return null;
        }

        return {
            ids: idsToLoad,
            pendingLazies: pendingLazies
        };
    },


    /**
     * Processes the loaded response, parses it and applies the previewText to the records in the
     * store, if still available. Adjusts the pending lazies for the loaded url to filter the
     * loaded ids out.
     *
     * @param {Object} response
     *
     * @private
     */
    processLoadedPreviewText (response) {

        const
            me = this,
            url = response.request.url,
            loadedIds = response.request.params.ids.split(","),
            livegrid = me.grid.view.getFeature("cn_mail-mailMessageFeature-livegrid");

        me.pendingLazies[url] = l8.extract(me.pendingLazies[url].concat(loadedIds));

        let data = JSON.parse(response.responseText);

        data.data.forEach(item => {
            let rec = livegrid.getRecordByCompoundKey(conjoon.cn_mail.data.mail.message.CompoundKey.createFor(
                item.mailAccountId, item.mailFolderId, item.id
            ));

            rec.set("previewText", item.previewText ? item.previewText : "");
            rec.commit();
        });
    },


    /**
     * Sends a request to the backend to load the previewTexts for the specified ids.
     *
     * @param {Array} idsToLoad
     * @param {String} url
     *
     * @see #processLoadedPreviewText
     */
    sendRequest (idsToLoad, url) {

        const
            me = this,
            grid = me.grid,
            store = grid.getStore(),
            proxy = store.getProxy();

        Ext.Ajax.request({
            method: "get",
            url,
            headers: proxy.headers,
            params: {
                attributes: "previewText",
                options: JSON.stringify(proxy.getDefaultParameters("ListMessageItem.options")),
                target: "MessageItem",
                ids: idsToLoad.join(",")
            }
        }).then(me.processLoadedPreviewText.bind(me));
    }

});
