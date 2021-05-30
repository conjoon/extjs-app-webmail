/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019-2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * The default folder panel representing a mail inbox.
 * {@link conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn} is used to provide
 * extra visual information for the nodes found within the tree.
 */
Ext.define("conjoon.cn_mail.view.mail.folder.MailFolderTree", {

    extend: "Ext.tree.Panel",

    requires: [
        "conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn"
    ],

    alias: "widget.cn_mail-mailfoldertree",

    width: 240,

    cls: "cn_mail-mailfoldertree",

    useArrows: true,
    rootVisible: false,

    hideHeaders: true,

    selModel: {
        toggleOnClick: false
    },

    viewConfig: {
        outerRowTpl: [
            "<table id=\"{rowId}\" role=\"presentation\" ",
            "data-boundView=\"{view.id}\" ",
            "data-recordId=\"{record.internalId}\" ",
            "data-recordIndex=\"{recordIndex}\" ",
            "class=\"{[values.itemClasses.join(\" \")]} {[this.getOuterRowClass(values.record, values.view.dataSource)]}\" cellpadding=\"0\" cellspacing=\"0\" style=\"{itemStyle};width:0;\">",

            // Do NOT emit a <TBODY> tag in case the nextTpl has to emit a <COLGROUP> column sizer element.
            // Browser will create a tbody tag when it encounters the first <TR>
            "{%",
            "this.nextTpl.applyOut(values, out, parent)",
            "%}",
            "</table>",
            {
                getOuterRowClass: function (record, store) {

                    let type  = record.get("folderType").toLowerCase(),
                        cls   = "cn_" + (type === "folder" ? "generic" : type),
                        pn    = record.parentNode,
                        root  = store.getRoot(),
                        isSub = pn &&
                            pn !== root &&
                            pn.parentNode !== root;

                    if (!isSub && type !== "account") {
                        cls += " cn_folder";
                    }

                    if (type === "account" && !record.previousSibling) {
                        cls += " first";
                    } else if (isSub) {
                        cls += " cn_subfolder";
                    }

                    return cls;
                },
                priority: 9999
            }
        ]
    },


    columns: [{
        xtype: "cn_mail-mailfoldertreecolumn",
        dataIndex: "name",
        flex: 1,
        renderer: function (value, metaData, record) {
            var unreadCount = record.get("unreadCount");

            if (unreadCount > 0) {
                return value  + "<span class=\"badge-unreadcount\">" + unreadCount + "</span>";
            }
            return value;

        }
    }]


});