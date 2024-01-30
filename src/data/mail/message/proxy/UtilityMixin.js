/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Mixin for proxies providing utility methods.
 *
 */
Ext.define("conjoon.cn_mail.data.mail.message.proxy.UtilityMixin", {


    /**
     * Looks up the values of keys in the  json-encoded source.filter property
     * and removes them while moving them into the source-object
     * Purging the filter considers the filter to be encoded according to
     * conjoon.cn_mail.data.jsonApi.PnFilterEncode#enocode
     *
     * @example:
     *
     *   let mixin = Ext.create("conjoon.cn_mail.data.mail.message.proxy.UtilityMixin");
     *
     *   // note characters may be unescaped for readability
     *   let params = {snafu:"a",filter:{"AND": [{"IN": {"mailAccountId": "dev"}}, {"=": {"foo": "bar"}}]
     *
     *   mixin.purgeFilter(params, ["mailAccountId", "mailFolderId", "parentMessageItemId"]);
     *
     *   // params is now:
     *   // {snafu:"a",mailAccountId:1,filter:"[{\"property\":\"foo\",\"value\":\"bar\"}]"}
     *
     * @param {Object} source
     * @param {Array} keys
     */
    purgeFilter: function (source, keys) {

        let fl = Ext.decode(source.filter),
            np = {}, nfl = [];

        if (fl.AND) {
            fl = fl.AND;
        } else {
            fl = [].concat(fl);
        }

        for (let i = 0, len = fl.length; i < len; i++) {

            // {"OP": {"field": "value"}}
            let vals = Object.entries(fl[i]),
                args = Object.entries(vals[0][1]),
                property = args[0][0], value = args[0][1];

            if (keys.indexOf(property) === -1) {
                nfl.push(fl[i]);
            } else {
                np[property] = value;
            }
        }
        source = Ext.apply(source, np);
        if (!nfl.length) {
            delete source.filter;
        } else {
            source.filter = nfl.length > 1 ? JSON.stringify({"AND": nfl}) : JSON.stringify(nfl[0]);
        }
    }


});
