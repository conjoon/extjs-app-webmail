/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2019-2022 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * Base HtmlEditor for the {@link conjoon.cn_mail.view.mail.message.editor.MessageEditor}.
 * Adds an "Add attachment"-button {@link coon.comp.form.field.FileButton} to
 * the toolbar of the editor.
 */
Ext.define("conjoon.cn_mail.view.mail.message.editor.HtmlEditor", {

    extend: "Ext.form.field.HtmlEditor",

    requires: [
        "coon.comp.form.field.FileButton",
        "coon.core.ThemeManager",
        "coon.core.Environment",
        "coon.core.ConfigManager",
        "coon.core.FileLoader",
        "coon.core.Template"
    ],

    alias: "widget.cn_mail-mailmessageeditorhtmleditor",

    /**
     * @private
     * @var editorHtmlTemplateTxt
     */


    /**
     * @inheritdoc
     */
    createToolbar: function (){

        var me   = this,
            tbar = me.callParent(arguments);

        tbar.add("-");
        tbar.add({
            xtype: "cn_comp-formfieldfilebutton",
            iconCls: "fas fa-paperclip",
            tooltip: {
                title: "Add Attachment(s)...",
                text: "Add one or more attachments to this message.",
                cls: Ext.baseCSSPrefix + "html-editor-tip"
            }
        });

        let overflowHandler = tbar.getLayout().overflowHandler;

        overflowHandler.addComponentToMenu = me.createOverflowHandlerInterceptor(overflowHandler.addComponentToMenu);

        return tbar;
    },


    /**
     * @see conjoon/extjs-app-webmail#68
     * @inheritdoc
     */
    getToolbarCfg: function (){
        const me  = this,
            cfg = me.callParent(arguments);

        cfg.listeners.click = function (evt, source) {
            if (source.className.indexOf("x-form-file-input") !== -1) {
                // if we prevent default when file button is clicked (see below),
                // no file dialog is shown. We have to exit here.
                return;
            }

            // default behavior as defined by ExtJS6.2.0
            evt.preventDefault();
        };

        return cfg;
    },


    /**
     * @inheritdoc
     */
    async initFrameDoc () {
        const me = this;

        // Destroying the component during initialization cancels initialization.
        if (me.destroying || me.destroyed) {
            return me.superclass.initFrameDoc.apply(me, arguments);
        }

        me.editorHtmlTemplateTxt = await me.loadMarkup();

        return me.superclass.initFrameDoc.apply(me, arguments);
    },


    /**
     * Makes sure the editor template is loaded and compiled with the theme'.
     *
     * @return {Promise<*>}
     */
    async loadMarkup () {
        const
            theme = coon.core.ThemeManager.getTheme(),
            tplPath = coon.core.Environment.getPathForResource(
                coon.core.ConfigManager.get("extjs-app-webmail", "resources.templates.html.editor"),
                "extjs-app-webmail"
            ),
            tpl = await coon.core.Template.load(tplPath);

        let html = tpl.render({theme: theme});

        return html;
    } ,


    /**
     * @inheritdoc
     */
    getDocMarkup () {

        const me = this;

        if (me.editorHtmlTemplateTxt) {
            return me.editorHtmlTemplateTxt;
        }

        return  [
            "<!DOCTYPE html>",
            "<html><head>",
            "<style type=\"text/css\">",
            "</style></head><body></body></html>"
        ].join("");
    },


    /**
     * Used to hide the Attachment-Button in the menu that gets rendered with the overflow-handler
     * of this editor's toolbar.
     * Creates an interceptor for the passed func that will not call the
     * passed func if teh component passed to it is of the type
     * coon.comp.form.field.FileButton.
     *
     * @private
     *
     * returns function
     */
    createOverflowHandlerInterceptor (func) {
        "use strict";

        return Ext.Function.createInterceptor(func, function (menu, component) {
            if (component instanceof coon.comp.form.field.FileButton) {
                return false;
            }
        });
    }


});
