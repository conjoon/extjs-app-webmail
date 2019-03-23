/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2019 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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
 * Overridden coon.comp.component.Iframe-implementation to make sure a
 * CSS string is prepended before each message.
 *
 */
Ext.define('conjoon.cn_mail.view.mail.message.reader.MessageViewIframe', {

    extend: 'coon.comp.component.Iframe',

    alias : 'widget.cn_mail-mailmessagereadermessageviewiframe',

    /**
     * Overridden to make sure the return value of #getDefaultBodyCss is
     * prepended to the value that gets set.
     * Will not prepend the value if an empty string or a falsy value was
     * submitted.
     *
     * @inheritdoc
     */
    setSrcDoc : function(value) {

        const me = this;

        value = value ? me.getDefaultCss() + value : value;

        return me.callParent([value]);
    },


    getDefaultCss : function() {

        return ["<style type=\"text/css\">",
            " html, body {",
            " height:-moz-max-content;",
            " width:-moz-max-content;",
            " height:max-content;",
            " width:max-content;",
            "margin:0px;",
            "padding:0px;",
            "}",
            "body {",
            "text-align:justify;",
            "color: rgb(64, 64, 64);",
            " font-family: \"Open Sans\", \"Helvetica Neue\", helvetica, arial, verdana, sans-serif;",
            "font-size: 14px;",
            "font-weight: 400;",
            "line-height: 22.4px;",
            " }",
            "blockquote {",
            "margin-left:4px;",
            "padding-left:10px;",
            "border-left:4px solid #bee9fc;",
            "}",
            "</style>"].join('');
    }




});
