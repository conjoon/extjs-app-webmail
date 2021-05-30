/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 *  Extends livegrid by adding getRecordByCompoundKey() to the feature.
 *
 */
Ext.define("conjoon.cn_mail.view.mail.message.grid.feature.Livegrid", {

    extend: "coon.comp.grid.feature.Livegrid",

    requires: [
        "conjoon.cn_mail.data.mail.message.CompoundKey",
        "coon.core.data.pageMap.PageMapUtil"
    ],

    alias: "feature.cn_mail-mailmessagegridfeature-livegrid",

    /**
     * Helper function to find and return the record specified by the id.
     * Returns the record-instance or null if not found.
     *
     * @param {conjoon.cn_mail.data.mail.message.CompoundKey} compoundKey
     *
     * @return {Ext.data.Model|null}
     *
     * @see coon.core.data.pageMap.PageMapUtil#getRecordBy
     *
     * @throws if compoudnKey is not an instance of conjoon.cn_mail.data.mail.message.CompoundKey
     */
    getRecordByCompoundKey: function (compoundKey) {

        const me = this;

        if (!(compoundKey instanceof conjoon.cn_mail.data.mail.message.CompoundKey)) {
            Ext.raise({
                msg: "\"compoundKey\" must be an instance of conjoon.cn_mail.data.mail.message.CompoundKey",
                compoundKey: compoundKey
            });
        }

        return coon.core.data.pageMap.PageMapUtil.getRecordBy(
            function (rec) {
                return rec.getCompoundKey().equalTo(compoundKey) === true;
            }, me.pageMapFeeder
        );
    }


});