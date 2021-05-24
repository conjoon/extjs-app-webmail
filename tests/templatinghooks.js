/**
 * conjoon
 * app-cn_mail
 * Copyright (C) 2021 Thorsten Suckow-Homberg https://github.com/conjoon/app-cn_mail
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

const createTemplateSpies = function (t, cb) {

    t.requireOk("coon.core.ThemeManager", "coon.core.Environment", "coon.core.Template", "coon.core.ConfigManager", function () {

        const THEME_MOCK = new coon.core.Theme({modes : {blue : {default : true, config : {blue: "blue"}}}});

        t.beforeEach(function(t) {
            t.THEME_SPY = t.spyOn(coon.core.ThemeManager, "getTheme").and.callFake(() => THEME_MOCK);
            t.TPL_SPY = t.spyOn(coon.core.template.javaScript.StringTemplate.prototype, "render");
            t.TEMPLATE_SPY = t.spyOn(coon.core.Template, "load");
            t.ENVIRONMENT_SPY = t.spyOn(coon.core.Environment, "getPathForResource").and.callFake((resource) => resource);
            t.CONFIG_SPY = t.spyOn(coon.core.ConfigManager, "get").and.callFake((path, config) => {
                if (config.indexOf("editor") !== -1) {
                    return "../resources/resources/templates/html/editor.html.tpl"
                }
                return "../resources/resources/templates/html/reader.html.tpl"
            });

        });

        t.afterEach(function(t) {

            t.TEMPLATE_SPY.remove();
            t.ENVIRONMENT_SPY.remove();
            t.CONFIG_SPY.remove();
            t.TPL_SPY.remove();
            t.THEME_SPY.remove;

        });

        cb.call(t, t);

    })


};