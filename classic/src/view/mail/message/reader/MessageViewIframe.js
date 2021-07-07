/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2019-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
Ext.define("conjoon.cn_mail.view.mail.message.reader.MessageViewIframe", {

    extend: "coon.comp.component.Iframe",

    alias: "widget.cn_mail-mailmessagereadermessageviewiframe",

    requires: [
        "coon.core.Template",
        "coon.core.ThemeManager",
        "coon.core.Environment",
        "coon.core.ConfigManager"
    ],

    publishes: [
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
    imagesAllowed: false,


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
     */
    async setSrcDoc (value, imagesAllowed = false) {

        const me = this;

        me.imagesAllowed = !!imagesAllowed;

        me.publishState("imagesAllowed", me.imagesAllowed);

        if (!value) {
            return me.callParent([value]);
        }

        const
            theme = coon.core.ThemeManager.getTheme(),
            themeConfig = theme.get(),
            tplPath = coon.core.Environment.getPathForResource(
                coon.core.ConfigManager.get("extjs-app-webmail", "resources.templates.html.reader"),
                "extjs-app-webmail"
            ),
            tpl = await coon.core.Template.load(tplPath);

        value = tpl.render({theme: themeConfig ? themeConfig : {}, reader: {body: value, imagesAllowed: me.imagesAllowed}});

        return me.callParent([value]);
    },


    /**
     * Returns this instance's value of imagesAllowed
     *
     * @param {Boolen} value
     */
    getImagesAllowed: function () {
        return this.imagesAllowed;
    }


});
