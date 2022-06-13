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
 * The default folder column to display entries in a
 * {@link conjoon.cn_mail.view.mail.FolderTree}.
 *
 * The {@link #tpl} config is a customized template which is capable of
 * displaying a badge representing the unreadMessages property of the record
 * currently being rendered. Ideally, the record type being used with this
 * column is the {@link conjoon.cn_mail.model.mail.folder.MailFolder}.
 *
 * The {@link #initTemplateRendererData} method is overriden to choose an icon
 * for the displayed folder. Icons are mapped against the following values found
 * in any model's "folderType" property:
 * INBOX
 * SENT
 * DRAFT
 * JUNK
 * TRASH
 * FOLDER
 *
 */
Ext.define("conjoon.cn_mail.view.mail.folder.MailFolderTreeColumn", {

    extend: "Ext.tree.Column",

    alias: "widget.cn_mail-mailfoldertreecolumn",


    cellTpl: [
        "<tpl for=\"lines\">",
        "<div class=\"{parent.childCls} {parent.elbowCls}-img ",
        "{parent.elbowCls}-<tpl if=\".\">line<tpl else>empty</tpl>\" role=\"presentation\"></div>",
        "</tpl>",
        "<tpl if=\"glyph\">",
        "<span class=\"{baseIconCls}\" ",
        "<tpl if=\"glyphFontFamily\">",
        "style=\"font-family:{glyphFontFamily}\"",
        "</tpl>",
        ">{glyph}</span>",
        "<tpl else>",

        "<tpl if=\"iconCls\">",
        "<tpl if=\"icon\">",
        "<img src=\"{blankUrl}\"",
        "<tpl else>",
        "<div",
        "</tpl>",
        " role=\"presentation\" class=\"{childCls} {baseIconCls} {customIconCls} ",
        "{baseIconCls}-<tpl if=\"leaf\">leaf<tpl else><tpl if=\"expanded\">parent-expanded<tpl else>parent</tpl></tpl> {iconCls}\" ",
        "<tpl if=\"icon\">style=\"background-image:url({icon})\"/>" +
            "<tpl else>" +
            "></div>" +
        "</tpl>",
        "</tpl>",
        "</tpl>",
        "<tpl if=\"href\">",
        "<a href=\"{href}\" role=\"link\" target=\"{hrefTarget}\" class=\"{textCls} {childCls}\">{value}</a>",
        "<tpl else>",
        "<span class=\"{textCls} {childCls}\">{value}</span>",
        "</tpl>",
        "<div class=\"{childCls} {elbowCls}-img {elbowCls}",
        "<tpl if=\"isLast\">-end</tpl>" +
        "<tpl if=\"expandable\">-plus {expanderCls}</tpl>\" role=\"presentation\"></div>"
    ],


    /**
     * @inheritdoc
     *
     * @see #getIconClsForMailFolderType
     */
    initTemplateRendererData: function (value, metaData, record, rowIdx, colIdx, store, view) {

        const me   = this,
            type = record.get("folderType");

        let ret;

        ret = Ext.tree.Column.prototype.initTemplateRendererData.apply(this, arguments);

        // do not set record data via set() as it seems to trigger
        // immediate update which calls this method in return (?)
        if (ret.lines.length <= 1) {
            // we could also assign a type-property to ret, but a blank space will do
            // to properly render ACCOUNT nodes with the given template
            record.data.iconCls = ret.lines.length === 0 ? " " : me.getIconClsForMailFolderType(type);
        } else {
            record.data.iconCls = "";
        }

        if (ret.lines && ret.lines.length < 2) {
            ret.lines = [];
        }

        return ret;
    },


    /**
     * Returns an iconCls to visually represent the specified folder type.
     * Considered type-values can be found in {@link conjoon.cn_mail.model.mail.folder.MailFolder}
     * in the field "folderType".
     *
     * @param {String} type
     *
     * @returns {string}
     *
     * @protected
     */
    getIconClsForMailFolderType: function (type) {

        var iconCls = "fas fa-folder";

        switch (type) {
        case "INBOX":
            iconCls = "fas fa-inbox";
            break;
        case "DRAFT":
            iconCls = "fas fa-edit";
            break;
        case "JUNK":
            iconCls = "fas fa-recycle";
            break;
        case "TRASH":
            iconCls = "fas fa-trash";
            break;
        case "SENT":
            iconCls = "fas fa-paper-plane";
            break;
        }

        return iconCls;
    }

});
