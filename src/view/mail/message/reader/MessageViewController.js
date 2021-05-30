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
 * This is the view controller for
 * {@link conjoon.cn_mail.view.mail.message.reader.MessageViewC}.
 * It takes care of resizing the view properly according to the contents of the
 * iframe.
 *
 */

Ext.define("conjoon.cn_mail.view.mail.message.reader.MessageViewController", {

    extend: "Ext.app.ViewController",

    alias: "controller.cn_mail-mailmessagereadermessageviewcontroller",

    requires: [
        "coon.core.Environment"
    ],

    control: {

        "cn_mail-mailmessagereadermessageviewiframe": {
            load: "onIframeLoad",
            beforesrcdoc: "onBeforeSrcDoc"
        },

        "#remoteImageWarning": {
            afterrender: "onRemoteImageWarningAfterrender"
        },

        "cn_mail-mailmessagereadermessageview": {
            resize: "onViewResize"
        }

    },


    /**
     * Callback for the view's resize method. Will resize the iframe accordingly.
     *
     * @param {Ext.Component} comp
     * @param {Number} width
     * @param {Number} height
     * @param {Number} oldWidth
     * @param {Number} oldHeight
     */
    onViewResize: function (comp, width, height, oldWidth, oldHeight) {

        const me = this,
            iframe = me.getIframe(),
            body = iframe.getBody(),
            bars = Ext.getScrollbarSize();

        iframe.setSize(width - bars.width, height - bars.height);
        iframe.setSize(body.scrollWidth, body.scrollHeight);
    },


    /**
     * Callback for the remoteImageWarning visual. Registers the click event on its element
     * to call #reloadWithImages
     *
     * @param {Ext.Component}  comp
     */
    onRemoteImageWarningAfterrender: function (comp) {
        const me = this;
        comp.getEl().on("click", me.reloadWithImages, me);
    },


    /**
     * Callback for the MessageView iframe's beforesrcdoc event.
     * Wil set the viewModel's iframeLoaded to false to make sure that the
     * iframe is currently processing.
     *
     * @param {conjoon.cn_mail.view.mail.message.reader.MessageViewIframe} iframe
     * @param {String} src
     */
    onBeforeSrcDoc: function (iframe, src) {
        const me = this;

        me.getView().getViewModel().set("iframeLoaded", false);
    },


    /**
     * Callback for the embedded iframe's load event. Recalculates the iframe's
     * size and resets scroll positions of the msgBodyContainer.
     * Will also make calls to sanitizeLinks and sanitizeImages.
     * sanitizeImages will only be called if the iframe's getImagesAllowed()-method returns
     * false.
     * Will set the viewodel's hasImages if any images where detected in the message's html.
     *
     * @param {conjoon.cn_mail.view.mail.message.reader.MessageViewIframe} iframe
     *
     * @see #sanitizeLinks
     * @see #sanitizeImages
     */
    onIframeLoad: function (iframe) {

        const me = this,
            view = me.getView(),
            vm   = view.getViewModel(),
            body = iframe.getBody(),
            cnt  = view.down("#msgBodyContainer"),
            bars = Ext.getScrollbarSize();

        me.sanitizeLinks(iframe.cn_iframeEl.dom.contentWindow.document.getElementsByTagName("a"));

        let imgs = iframe.cn_iframeEl.dom.contentWindow.document.getElementsByTagName("img");
        vm.set("hasImages", imgs.length > 0);

        if (!iframe.getImagesAllowed()) {
            me.sanitizeImages(imgs);
        }

        cnt.setScrollY(0);
        cnt.setScrollX(0);

        vm.set("iframeLoaded", true);
        vm.notify();

        iframe.setSize(cnt.getWidth() - bars.width, cnt.getHeight() - bars.height);
        iframe.setSize(body.scrollWidth, body.scrollHeight);
    },


    /**
     * Sanitizes all the links found in the passed Array and makes sure of the
     * following:
     * - if no href attribute is found, the target-attribute will be removed
     * - if the href-attribute is a local anchor, the target-attribute will be
     * removed to make sure the links is treated as anchor of the owning document
     * - if the href-attribute's value starts with "mailto:", the value will be
     * prepended with "#cn_mail/message/compose/" to make sure the routing of
     * the mail-module will process the link, and the target of the element will
     * be set to "_top"
     * - in every other case, the target of the link will be set to _blank
     *
     * @param {Array} an array of HTMLElements representing links (<a>).
     *
     * @private
     */
    sanitizeLinks: function (elements) {

        let a, href;

        for (let i = 0, len = elements.length; i < len; i++) {
            a = elements[i];
            href = a.getAttribute("href");

            if (!href || href.indexOf("#") === 0) {
                a.removeAttribute("target");
                continue;
            }

            if (href.indexOf("mailto:") === 0) {

                a.setAttribute("href", "#cn_mail/message/compose/" + encodeURIComponent(href));
                a.setAttribute("target", "_top");
                continue;
            }

            a.setAttribute("target", "_blank");
        }


    },


    /**
     * Calls this iframe's setSrcDoc and passes "true" as the secodn argument to indicate
     * that the iframe may load remote images.
     *
     */
    reloadWithImages: function () {

        const me = this,
            iframe = me.getIframe();

        iframe.setSrcDoc(me.getViewModel().get("messageBody.textHtml"), true);
    },


    /**
     * Sanitizes all the images found in the passed Array and makes sure of the
     * following:
     * - the images border ist set to 1px solid black
     * - the images src is set to img_block.png out of this package's resource path
     *
     * @param {Array} an array of HTMLElements representing links (<a>).
     *
     * @private
     */
    sanitizeImages: function (elements) {

        let img, i, len = elements.length;

        for (i = 0; i < len; i++) {
            img = elements[i];
            img.style.border = "1px solid black";

            // isolated tests will not have resources property set
            img.setAttribute(
                "src",
                coon.core.Environment.getPathForResource("resources/images/img_block.png","app-cn_mail")
            );

        }
    },


    /**
     * @private
     */
    getIframe: function () {
        const me = this,
            view = me.getView();

        return view.down("cn_mail-mailmessagereadermessageviewiframe");
    }
});
