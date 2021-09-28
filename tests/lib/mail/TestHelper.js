/**
 * conjoon
 * extjs-app-webmail
 * Copyright (C) 2017-2021 Thorsten Suckow-Homberg https://github.com/conjoon/extjs-app-webmail
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
 * TestHelper for wrapping mail-tests with mocked environments and providing common utility
 * functionality.
 *
 */
export default class TestHelper {


    /**
     * Returns an instance of TestHelper.
     *
     * @param siestaTest
     * @param owningWindow
     * @return {TestHelper}
     */
    static get (siestaTest, owningWindow) {
        let stat = new TestHelper;
        stat.siestaTest = siestaTest;
        stat.owningWindow = owningWindow;
        return stat;
    }


    /**
     * Calls the submitted callable.
     *
     * @param cb
     * @return {TestHelper}
     */
    andRun (cb) {
        cb(this.siestaTest);
        return this;
    }


    /**
     * Loads the specified files.
     *
     * @param files
     * @return {Promise<TestHelper>}
     */
    async load (...files) {

        const t = this.siestaTest;

        await new Promise((resolve, reject) => {
            t.requireOk(files, () => {
                resolve(" -> load");
            });

        });

        return this;
    }


    /**
     * Creates mocked Templating environment to be used with tests that involve
     * the MessageReader and MessageEditor.
     * Needs the current test instance to make sure environment is mocked properly
     * and accessible.
     *
     * @param t The current test instance
     */
    async mockUpMailTemplates () {

        const me = this, t = this.siestaTest;

        await new Promise(function (resolve, reject) {

            t.requireOk(
                "coon.core.ThemeManager",
                "coon.core.Environment",
                "coon.core.Template",
                "coon.core.ConfigManager", function ()  {
                    me.prepare();
                    resolve("-> temp");
                });
        });

        return this;
    }


    /**
     * Send out the spies!
     */
    prepare () {
        let t = this.siestaTest;

        let win = this.owningWindow,
            coon = win.coon;

        t.beforeEach(t => {

            t.THEME_MOCK = new coon.core.Theme({modes: {blue: {default: true, config: {blue: "blue"}}}});
            t.THEME_SPY = t.spyOn(coon.core.ThemeManager, "getTheme").and.callFake(() => t.THEME_MOCK);
            t.TPL_SPY = t.spyOn(l8.template.esix.StringTemplate.prototype, "render");
            t.TEMPLATE_SPY = t.spyOn(coon.core.Template, "load");
            t.ENVIRONMENT_SPY = t.spyOn(coon.core.Environment, "getPathForResource").and.callFake((resource) => resource);
            t.CONFIG_SPY = t.spyOn(coon.core.ConfigManager, "get").and.callFake((path, config) => {
                if (config.indexOf("editor") !== -1) {
                    return "../resources/resources/templates/html/editor.html.tpl";
                }
                return "../resources/resources/templates/html/reader.html.tpl";
            });

        });

        t.afterEach(t => {

            t.TEMPLATE_SPY.remove();
            t.ENVIRONMENT_SPY.remove();
            t.CONFIG_SPY.remove();
            t.TPL_SPY.remove();
            t.THEME_SPY.remove;

        });

    }

}