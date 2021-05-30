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

StartTest(async t => {

    const helper =  t.l8.liquify(t.TestHelper.get(t, window));
    await helper.mockUpMailTemplates().andRun((t) => {

        let iframe;

        const  META = {
                noimg: "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: 'self'; style-src * 'unsafe-inline';\">",
                img: "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'self'; connect-src 'self'; img-src data: *; style-src * 'unsafe-inline';\">"
            },
            buildIframe = function () {
                iframe = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageViewIframe", {
                    renderTo: document.body
                });
            };

        t.afterEach(function () {
            if (iframe) {
                iframe.destroy();
                iframe = null;
            }
        });


        t.it("config / default checks / setSrcDoc()", async function (t)  {


            buildIframe();

            t.isInstanceOf(iframe, "coon.comp.component.Iframe");

            t.expect(iframe.alias).toContain("widget.cn_mail-mailmessagereadermessageviewiframe");

            let val = "test";

            await iframe.setSrcDoc(val);
            t.expect(t.CONFIG_SPY).toHaveBeenCalledWith("app-cn_mail", "resources.templates.html.reader");
            t.expect(iframe.getSrcDoc()).toContain(META.noimg);
            t.expect(iframe.getSrcDoc()).not.toContain(META.img);

            t.expect(t.TPL_SPY.calls.mostRecent().args[0].theme).toBe(coon.core.ThemeManager.getTheme().get());
            t.expect(t.TPL_SPY.calls.mostRecent().args[0].reader).toEqual({imagesAllowed: false, body: "test"});

            iframe.setSrcDoc(null);

            t.expect(iframe.getSrcDoc()).toBe("");

            t.expect(iframe.getImagesAllowed()).toBe(false);
            t.expect(iframe.getPublishes().imagesAllowed).toBe(true);

            await iframe.setSrcDoc(val, true);
            t.expect(t.TPL_SPY.calls.mostRecent().args[0].reader).toEqual({imagesAllowed: true, body: "test"});
            t.expect(iframe.getSrcDoc()).not.toContain(META.noimg);
            t.expect(iframe.getSrcDoc()).toContain(META.img);
            t.expect(iframe.getImagesAllowed()).toBe(true);
        });


        t.it("getImagesAllowed", function (t) {

            buildIframe();

            t.expect(iframe.getImagesAllowed()).toBe(false);
            iframe.imagesAllowed = true;
            t.expect(iframe.getImagesAllowed()).toBe(true);

        });


        t.it("setSrcDoc()", async (t) => {

            buildIframe();

            let IMAGESALLOWED = null;

            iframe.publishState = function (key, val) {
                if (key === "imagesAllowed") {
                    IMAGESALLOWED = val;
                }
            };

            await iframe.setSrcDoc("foo");
            t.expect(iframe.getImagesAllowed()).toBe(false);
            t.expect(IMAGESALLOWED).toBe(false);

            await iframe.setSrcDoc("foo", true);
            t.expect(iframe.getImagesAllowed()).toBe(true);
            t.expect(IMAGESALLOWED).toBe(true);

        });

    });


});