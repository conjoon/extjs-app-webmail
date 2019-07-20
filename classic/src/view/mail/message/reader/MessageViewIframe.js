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


    publishes : [
        /**
         * Property to indicate whether this Iframe allows loading of
         * External images.
         * This value is set and published by calling setSrcDoc with a
         * second argument, defaulting to the value of this class'
         * property "imagesAllowed".
         *
         * @type {Boolean} imagesAllowed
         */
        "imagesAllowed"
    ],

    /**
     * Whether this iframe allows loading of external resources.
     * Set with setSrcDoc
     *
     * @type {Boolean} imagesAllowed
     *
     * @private
     *
     * @see setSrcDoc
     */
    imagesAllowed : false,


    /**
     * Overridden to make sure the return value of #getDefaultBodyCss is
     * prepended to the value that gets set, along with the "Content-Security-Policy"
     * meta-tag.
     * Will not prepend the value if an empty string or a falsy value was
     * submitted.
     * Additionally, the "imagesAllowed"-property can be passed with indicates
     * whether images are allowed in the value passed to the iframe's src doc.
     * The state of this property will be published with the "imagesAllowed" property.
     *
     * @param {String} value
     * @param {Boolean} imagesAllowed
     *
     * @return {String}
     *
     * @inheritdoc
     *
     * @see getContentSecurityPolicy
     * @see getDefaultCss
     */
    setSrcDoc : function(value, imagesAllowed = false) {

        const me = this,
              head = [];

        me.imagesAllowed = !!imagesAllowed;

        me.publishState("imagesAllowed", me.imagesAllowed);

        head.push(me.getContentSecurityPolicy(me.imagesAllowed), me.getDefaultCss());

        value = value ? head.join("") + value : value;

        return me.callParent([value]);
    },


    /**
     * Returns the meta tag with the http-equiv "Content-Security-Policy" defaulting to
     * content="default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: 'self'; style-src * 'unsafe-inline';"
     * If the argument imagesAllowed is set to true, the img-src is set to "data: *" to make sure
     * external image loading is allowed.
     *
     * @param {Boolean} withImages
     *
     *
     * @returns {string}
     */
    getContentSecurityPolicy : function(imagesAllowed = false) {

        if (imagesAllowed === true) {
            return "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: *; style-src * 'unsafe-inline';\">";

        }
        return "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: 'self'; style-src * 'unsafe-inline';\">";

    },


    /**
     * Returns a default css to style the content of this iframe
     *
     * @returns {string}
     */
    getDefaultCss : function() {

        return [
            "<style type=\"text/css\">",
            " html, body {",
            "margin:0px;",
            "padding:0px;",
            "}",
            "p {margin:0px; margin-block-start:0px;margin-block-end: 0px;}",
            "body {",
            "min-height:fit-content;;",
            "min-width:fit-content;",
            "width:100%;",
            "height:100%;",
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
    },


    /**
     * Returns this instance's value of imagesAllowed
     *
     * @param {Boolen} value
     */
    getImagesAllowed : function() {
        return this.imagesAllowed;
    }


});
