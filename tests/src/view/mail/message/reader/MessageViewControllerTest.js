/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2023 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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

import TestHelper from "/tests/lib/mail/TestHelper.js";

StartTest(async t => {

    const helper =  l8.liquify(TestHelper.get(t, window));
    await helper.mockUpMailTemplates().andRun((t) => {

        let controller;

        if (!Ext.manifest) {
            Ext.manifest = {};
        }

        if (!Ext.manifest.resources) {
            Ext.manifest.resources = {};
        }

        const createController = function () {
            return Ext.create(
                "conjoon.cn_mail.view.mail.message.reader.MessageViewController", {
                });
        };

        t.afterEach(function () {

            if (controller) {
                controller.destroy();
                controller = null;
            }

        });


        t.it("Should make sure setting up controller works", t => {

            controller = createController();

            t.isInstanceOf(controller, "Ext.app.ViewController");
        });


        t.it("extjs-app-webmail#88 - sanitizeLinks()", t => {

            let c, tests = [{
                has: {id: "cn_" + (++c), target: "_blank"},
                expected: {id: "cn_" + c, href: null, target: null}
            }, {
                has: {id: "cn_" + (++c), href: "#foobar", target: "_top"},
                expected: {id: "cn_" + c, href: null, target: null}
            }, {
                has: {id: "cn_" + (++c), href: "/#", target: "_top"},
                expected: {id: "cn_" + c, href: null, target: null}
            }, {
                has: {id: "cn_" + (++c), href: "mailto:foobar@check"},
                expected: {id: "cn_" + c, href: "#cn_mail/message/compose/" + encodeURIComponent("mailto:foobar@check"), target: "_top"}
            }, {
                has: {id: "cn_" + (++c), href: "url.domain.com"},
                expected: {id: "cn_" + c, href: null, target: null}
            }, {
                has: {id: "cn_" + (++c), href: "https://url.domain.com"},
                expected: {id: "cn_" + c, href: "https://url.domain.com", target: "_blank"}
            }, {
                has: {id: "cn_" + (++c), href: "http://url.domain.com"},
                expected: {id: "cn_" + c, href: "http://url.domain.com", target: "_blank"}
            }, {
                has: {id: "cn_" + (++c), href: "ftp://url.domain.com"},
                expected: {id: "cn_" + c, href: "ftp://url.domain.com", target: "_blank"}
            }];

            let elements = [], test;

            for (let i = 0, len = tests.length; i < len; i++) {
                test = tests[i];
                let el = document.createElement("a");
                if (test.has.href) {
                    el.setAttribute("href", test.has.href);
                }
                if (test.has.target) {
                    el.setAttribute("target", test.has.target);
                }

                el.setAttribute("id", test.has.id);
                elements.push(el);
            }

            controller = createController();

            controller.sanitizeLinks(elements);

            let i, len;
            for (i = 0, len = tests.length; i < len; i++) {
                test = tests[i];

                t.expect(test.expected.id).toBe(elements[i].getAttribute("id"));
                t.expect(test.expected.href).toBe(elements[i].getAttribute("href"));
                t.expect(test.expected.target).toBe(elements[i].getAttribute("target"));
            }

            t.expect(i).toBeGreaterThan(1);

        });


        t.it("onViewResize()", t => {

            controller = createController();

            t.expect(controller.getControl()["cn_mail-mailmessagereadermessageview"]).toEqual({
                resize: "onViewResize"
            });

            let CALLED = 0;

            controller.getIframe = function () {
                return {
                    getBody: function () {
                        return {};
                    },
                    setSize: function () {
                        CALLED++;
                    }
                };
            };

            t.expect(CALLED).toBe(0);
            controller.onViewResize();
            t.expect(CALLED).toBe(2);

        });


        t.it("onRemoteImageWarningAfterrender", t => {

            controller = createController();

            t.expect(controller.getControl()["#remoteImageWarning"]).toEqual({
                afterrender: "onRemoteImageWarningAfterrender"
            });

            let ARGS = [];

            let comp = {
                getEl: function () {
                    return {
                        on: function (name, fn, scope) {
                            ARGS = arguments;
                        }
                    };
                }
            };

            controller.onRemoteImageWarningAfterrender(comp);

            t.expect(ARGS.length).toBe(3);

            t.expect(ARGS[0]).toBe("click");
            t.expect(ARGS[1]).toBe(controller.reloadWithImages);
            t.expect(ARGS[2]).toBe(controller);
        });


        t.it("iframe related events", t => {

            controller = createController();

            t.expect(controller.getControl()["cn_mail-mailmessagereadermessageviewiframe"]).toEqual({
                load: "onIframeLoad",
                beforesrcdoc: "onBeforeSrcDoc"
            });

        });


        t.it("onBeforeSrcDoc()", t => {

            controller = createController();

            let KEY, VALUE;

            controller.getView = function () {
                return {
                    getViewModel: function () {
                        return {

                            set: function (key, value) {
                                KEY = key;
                                VALUE = value;
                            }

                        };
                    }
                };
            };

            t.expect(KEY).not.toBe("iframeLoaded");
            t.expect(VALUE).not.toBe(false);
            controller.onBeforeSrcDoc({}, "foo");
            t.expect(KEY).toBe("iframeLoaded");
            t.expect(VALUE).toBe(false);
        });


        t.it("onIframeLoad()", t => {

            controller = createController();

            let tmp = Ext.getScrollbarSize;

            Ext.getScrollbarSize = function () {
                return {width: 0, height: 0};
            };

            let VM = {};

            let IMAGESALLOWED;

            let TAGS = {
                a: [],
                img: []
            };

            let X, Y;
            let CNT = {
                getHeight: function () {return 1000;},
                getWidth: function () {return 1000;},
                setScrollX: function (v) {X=v;},
                setScrollY: function (v) {Y=v;}
            };

            let WIDTH, HEIGHT;
            let IFRAME = {
                setSize: function (width, height) {
                    WIDTH = width;
                    HEIGHT = height;
                },
                getBody: function () {
                    return {
                        scrollWidth: 1001,
                        scrollHeight: 1001
                    };
                },
                cn_iframeEl: {
                    dom: {
                        contentWindow: {
                            document: {
                                getElementsByTagName: function (tag) {
                                    return TAGS[tag];
                                }
                            }
                        }
                    }
                },
                getImagesAllowed: function (){
                    return IMAGESALLOWED;
                }
            };

            controller.getView = function () {
                return {
                    down: function (query) {
                        if (query === "#msgBodyContainer") {
                            return CNT;
                        }
                    },
                    getViewModel: function () {
                        return {
                            set: function (key, value) {
                                VM[key] = value;
                            },
                            notify: function () {}
                        };
                    }
                };
            };

            t.isCalledNTimes("sanitizeLinks", controller, 4);
            t.isCalledNTimes("sanitizeImages", controller, 1);

            IMAGESALLOWED = false;
            TAGS["img"] = [{setAttribute: function (){}, style: {}}];

            let sanitizeCssImagesSpy = t.spyOn(controller, "sanitizeCssImages").and.callFake(() => false);

            controller.onIframeLoad(IFRAME);

            t.expect(VM["hasImages"]).toBe(true);
            t.expect(VM["iframeLoaded"]).toBe(true);

            IMAGESALLOWED = true;
            TAGS["img"] = [];
            controller.onIframeLoad(IFRAME);
            t.expect(VM["hasImages"]).toBe(false);

            t.expect(X).toBe(0);
            t.expect(Y).toBe(0);

            t.expect(WIDTH).toBe(1001);
            t.expect(HEIGHT).toBe(1001);

            IMAGESALLOWED = true;
            TAGS["img"] = [{setAttribute: function (){}, style: {}}];
            controller.onIframeLoad(IFRAME);
            t.expect(VM["hasImages"]).toBe(true);

            sanitizeCssImagesSpy.remove();
            sanitizeCssImagesSpy = t.spyOn(controller, "sanitizeCssImages").and.callFake(() => true);

            IMAGESALLOWED = false;
            TAGS["img"] = [];
            t.expect(controller.cssImageCheck.finished).toBeUndefined();

            t.expect(controller.onIframeLoad(IFRAME)).toBe(controller.cssImageCheck);
            t.expect(controller.cssImageCheck.finished).toBe(true);
            t.expect(controller.cssImageCheck.result).toBe(true);

            t.expect(controller.onIframeLoad(IFRAME)).toBe(true);
            t.expect(controller.cssImageCheck).toEqual({});

            sanitizeCssImagesSpy.remove();
            Ext.getScrollbarSize = tmp;
        });


        t.it("reloadWithImages()", t => {

            controller = createController();

            let VALUE, ALLOW;

            controller.getIframe = function () {

                return {
                    setSrcDoc: function (val, allow) {
                        VALUE = val;
                        ALLOW = allow;
                    }
                };

            };

            controller.getViewModel = function () {
                return {
                    get: function (key) {
                        return key === "messageBody.textHtml" ? "foo" : null;
                    }
                };
            };

            controller.reloadWithImages();

            t.expect(VALUE).toBe("foo");
            t.expect(ALLOW).toBe(true);

        });


        t.it("sanitizeImages", t => {

            controller = createController();

            let IMAGES = [
                {setAttribute: function (attr, value){this[attr] = value;}, style: {}},
                {setAttribute: function (attr, value){this[attr] = value;}, style: {}}
            ];

            controller.sanitizeImages(IMAGES);

            t.expect(IMAGES[0].src).toBe("resources/images/img_block.png");
            t.expect(IMAGES[1].src).toBe("resources/images/img_block.png");

            t.expect(IMAGES[0].style.border).toBe("1px solid black");
            t.expect(IMAGES[1].style.border).toBe("1px solid black");
        });


        t.it("sanitizeCssImages", t => {

            controller = createController();

            let CSSIMAGES = [
                "A", "B"
            ];

            const FAKE_IFRAME = {
                getSrcDoc: () => "A aa B B C",
                setSrcDoc () {}
            };

            l8.chain("cn_iframeEl.dom.contentWindow", FAKE_IFRAME, {});
            const
                sanitizeSpy = t.spyOn(controller, "getCssImages").and.callFake(() => CSSIMAGES),
                getIframeSpy = t.spyOn(controller, "getIframe").and.callFake(() => FAKE_IFRAME),
                setSrcDocSpy = t.spyOn(FAKE_IFRAME, "setSrcDoc");

            t.expect(controller.sanitizeCssImages()).toBe(true);
            t.expect(setSrcDocSpy.calls.mostRecent().args).toEqual(
                [
                    [`${controller.getProxyImage()} `,
                        `${controller.getProxyImage()}${controller.getProxyImage()} `,
                        `${controller.getProxyImage()} ${controller.getProxyImage()} C`].join("")

                    , false]
            );

            [sanitizeSpy, getIframeSpy, setSrcDocSpy].map(spy => spy.remove);

        });


    });});
