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

/**
 * Base HtmlEditor for the {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 * Adds an "Add attachment"-button {@link conjoon.cn_comp.form.field.FileButton} to
 * the toolbar of the editor.
 */
Ext.define('conjoon.cn_mail.view.mail.message.editor.HtmlEditor', {

    extend : 'Ext.form.field.HtmlEditor',

    requires : [
        'conjoon.cn_comp.form.field.FileButton'
    ],

    alias : 'widget.cn_mail-mailmessageeditorhtmleditor',

    /**
     * @inheritdoc
     */
    createToolbar: function(){

        var me   = this,
            tbar = me.callParent(arguments);

        tbar.add('-');
        tbar.add({
            xtype   : 'cn_comp-formfieldfilebutton',
            iconCls : 'x-fa fa-paperclip',
            tooltip : {
                title : 'Add Attachment(s)...',
                text  : 'Add one or more attachments to this message.',
                cls   : Ext.baseCSSPrefix + 'html-editor-tip'
            }
        });

        return tbar;
    }

});
