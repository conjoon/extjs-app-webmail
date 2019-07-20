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

describe('conjoon.cn_mail.view.mail.message.reader.MessageViewIframeTest', function(t) {


    let iframe;

    const META = {
            noimg : "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: 'self'; style-src * 'unsafe-inline';\">",
            img : "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: *; style-src * 'unsafe-inline';\">"
        },
        buildIframe = function() {
            iframe = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageViewIframe', {
                renderTo : document.body
            });
        };



    t.afterEach(function() {

        if (iframe) {
            iframe.destroy();
            iframe = null;
        }

    })


    t.it("config / default checks / setSrcDoc()", function (t) {
        buildIframe();

        t.isInstanceOf(iframe, 'coon.comp.component.Iframe');

        t.expect(iframe.alias).toContain('widget.cn_mail-mailmessagereadermessageviewiframe');

        let str = iframe.getDefaultCss();

        let policy = iframe.getContentSecurityPolicy();

        t.expect(Ext.isString(str)).toBe(true);
        t.expect(str.length).toBeGreaterThan(1);

        let val = "test";

        iframe.setSrcDoc(val);

        t.expect(iframe.getSrcDoc()).toBe(policy + str + val);

        iframe.setSrcDoc(null);

        t.expect(iframe.getSrcDoc()).toBe("");

        t.expect(iframe.getImagesAllowed()).toBe(false);

        t.expect(iframe.getPublishes().imagesAllowed).toBe(true);

    });


    t.it("getContentSecurityPolicy()", function(t) {

        buildIframe();

        t.expect(iframe.getContentSecurityPolicy()).toBe(META.noimg);

        t.expect(iframe.getContentSecurityPolicy(true)).toBe(META.img);
    });


    t.it("getImagesAllowed", function(t) {

        buildIframe();

        t.expect(iframe.getImagesAllowed()).toBe(false);
        iframe.imagesAllowed = true;
        t.expect(iframe.getImagesAllowed()).toBe(true);

    });


    t.it("setSrcDoc()", function(t) {

        buildIframe();

        let IMAGESALLOWED = null;

        let NOEXTERNALMETA = null;

        iframe.getContentSecurityPolicy = function(allowed) {
            EXTERNALMETA = allowed;
        };

        iframe.publishState = function(key, val) {
            if (key === "imagesAllowed") {
                IMAGESALLOWED = val;
            }
        }

        iframe.setSrcDoc("foo");
        t.expect(iframe.getImagesAllowed()).toBe(false);
        t.expect(IMAGESALLOWED).toBe(false);
        t.expect(EXTERNALMETA).toBe(false);

        iframe.setSrcDoc("foo", true);
        t.expect(iframe.getImagesAllowed()).toBe(true);
        t.expect(IMAGESALLOWED).toBe(true)
        t.expect(EXTERNALMETA).toBe(true);

    });






});