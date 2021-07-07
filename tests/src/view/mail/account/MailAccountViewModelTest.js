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

StartTest(t => {

    let createModel = function (id) {

            return Ext.create("conjoon.cn_mail.model.mail.account.MailAccount", {
                id: id ? id : undefined,
                name: "name",
                from: "from",
                replyTo: "replyTo",

                inbox_type: "inbox_type",
                inbox_address: "inbox_address",
                inbox_port: "inbox_port",
                inbox_ssl: true,
                inbox_user: "inbox_user",
                inbox_password: "inbox_password",

                outbox_type: "outbox_type",
                outbox_address: "outbox_address",
                outbox_port: "outbox_port",
                outbox_ssl: true,
                outbox_user: "outbox_user",
                outbox_password: "outbox_password"
            });

        }, decorateViewModel = function (viewModel) {

            let ma = {
                    from: {name: "fromfoo", address: "frombar"},
                    replyTo: {name: "foo", address: "bar"},
                    get: function (key) {
                        switch (key) {
                        case "from":
                            return this.from;

                        case "replyTo":
                            return this.replyTo;

                        }
                        Ext.raise("Invalid key " + key);
                    },
                    set: function (key, val) {
                        switch (key) {
                        case "mailAccount.from":
                        case "from":
                            this.from = val;
                            break;
                        case "mailAccount.replyTo":
                        case "replyTo":
                            this.replyTo = val;
                            break;
                        default:
                            Ext.raise("Invalid key " + key);
                        }

                    }
                },
                get = function (key) {
                    switch (key) {
                    case "mailAccount.replyTo":
                        return ma.get("replyTo");
                    case "mailAccount.from":
                        return ma.get("from");
                    case "mailAccount":
                        return ma;
                    }

                    Ext.raise("Invalid key " + key);
                };

            viewModel.get = get;
        };

    let viewModel;


    t.afterEach(function () {
        if (viewModel) {
            viewModel.destroy();
            viewModel = null;
        }

    });

    t.beforeEach(function () {


    });

    t.requireOk("conjoon.dev.cn_mailsim.data.mail.PackageSim", () => {

        t.it("Should create and show the MailAccountViewModel along with default config checks", t => {
            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");

            t.expect(viewModel instanceof Ext.app.ViewModel).toBeTruthy();

            t.expect(viewModel.alias).toContain("viewmodel.cn_mail-mailaccountviewmodel");

            t.expect(viewModel.saveOperations).toEqual({});
            t.expect(viewModel.sourceMailAccounts).toEqual({});

            t.expect(viewModel.get("mailAccount")).toBe(null);
        });


        t.it("setMailAccount()", t => {

            let exc;

            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");

            t.isCalled("cleanup", viewModel);

            t.expect(viewModel.sourceMailAccounts).toEqual({});

            try {
                viewModel.setMailAccount(null);
            } catch (e) {
                exc = e;
            }

            t.expect(exc).toBeDefined();
            t.expect(exc.msg).toBeDefined();
            t.expect(exc.msg.toLowerCase()).toContain("must be an instance of");

            let ma = createModel(),
                ma2 = viewModel.setMailAccount(ma);

            t.expect(viewModel.sourceMailAccounts[ma2.getId()]).toBe(ma);
            t.expect(ma2).not.toBe(ma);
            t.expect(ma2.data).toEqual(ma.data);
        });


        t.it("setMailAccount() with existing saveOperation", t => {

            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");

            let ma = createModel();

            let saveOperations = {};

            saveOperations[ma.getId()] = {
                getRecords: function () {
                    return [ma];
                }
            };

            viewModel.saveOperations = saveOperations;

            t.expect(viewModel.setMailAccount(ma)).toBe(ma);

        });


        t.it("cleanup()", t => {

            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");


            t.expect(viewModel.cleanup()).toBe(false);

            let ma = createModel(),
                id = ma.getId(),
                saveOperations = {};

            viewModel.set("mailAccount", {id: id});
            viewModel.sourceMailAccounts[id] = ma;

            saveOperations[id] = {
                getRecords: function () {
                    return [ma];
                },
                isComplete: function () {
                    return true;
                }
            };

            viewModel.saveOperations = saveOperations;

            t.expect(viewModel.cleanup()).toBe(true);

            t.expect(viewModel.saveOperations).toEqual({});
            t.expect(viewModel.sourceMailAccounts).toEqual({});

        });


        t.it("savePendingChanges()", t => {

            Ext.ux.ajax.SimManager.init({
                delay: Math.max(1, t.parent.TIMEOUT - 1000)
            });


            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");

            t.expect(viewModel.savePendingChanges()).toBe(null);

            let ma = createModel("snafu");

            viewModel.setMailAccount(ma);

            t.expect(viewModel.savePendingChanges()).toBe(null);

            viewModel.set("mailAccount.name", "foo");

            let CALLED = 0;
            viewModel.getView = function () {
                return {
                    fireEvent: function (evt) {
                        if (evt === "cn_mail-mailaccountbeforesave") {
                            CALLED++;
                        }
                    }
                };
            };

            t.isCalled("onSaveSuccess", viewModel);

            let op = viewModel.savePendingChanges();
            t.isInstanceOf(op, Ext.data.operation.Update);
            t.expect(CALLED).toBe(1);
            t.expect(viewModel.saveOperations[ma.getId()], op);

            t.waitForMs(t.parent.TIMEOUT, () => {
                Ext.ux.ajax.SimManager.init({
                    delay: Math.max(1, t.parent.TIMEOUT - 1000)
                });
            });

        });


        t.it("savePendingChanges() - failure", t => {

            Ext.ux.ajax.SimManager.init({
                delay: Math.max(1, t.parent.TIMEOUT - 1000)
            });


            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");

            let ma = createModel("snafu");

            viewModel.setMailAccount(ma);

            viewModel.set("mailAccount.name", "FAILURE");

            viewModel.getView = function () {
                return {
                    fireEvent: function (evt) {}
                };
            };

            t.isCalled("onSaveFailure", viewModel);

            viewModel.savePendingChanges();

            t.waitForMs(t.parent.TIMEOUT, () => {
                Ext.ux.ajax.SimManager.init({
                    delay: Math.max(1, t.parent.TIMEOUT - 1000)
                });
            });

        });


        t.it("onSaveSuccess()", t => {


            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");

            let ma = createModel(),
                id = ma.getId();

            viewModel.sourceMailAccounts[id] = ma;

            let fields = ["name",
                "from",
                "replyTo",

                "inbox_type",
                "inbox_address",
                "inbox_port",
                "inbox_ssl",
                "inbox_user",
                "inbox_password",

                "outbox_type",
                "outbox_address",
                "outbox_port",
                "outbox_ssl",
                "outbox_user",
                "outbox_password"];


            let record = {data: {}};
            record.getId = function () {
                return ma.getId();
            };

            for (let i = 0, len = fields.length; i < len; i++) {

                switch (fields[i]) {
                case "from":
                case "replyTo":
                    record.data[fields[i]] = {name: Ext.id(), address: Ext.id()};
                    break;

                default:
                    record.data[fields[i]] = fields[i].indexOf("_ssl") !== -1 ? true : Ext.id();
                    break;
                }
            }

            let CALLED = 0;
            viewModel.getView = function () {
                return {
                    fireEvent: function (evt) {
                        if (evt === "cn_mail-mailaccountsave") {
                            CALLED++;
                        }
                    }
                };
            };

            viewModel.onSaveSuccess(record);

            t.expect(CALLED).toBe(1);

            for (let i = 0, len = fields.length; i < len; i++) {

                switch (fields[i]) {
                case "from":

                    t.expect(record.data[fields[i]]).toEqual(
                        viewModel.sourceMailAccounts[id].data[fields[i]]
                    );
                    break;

                case "replyTo":
                    t.expect(record.data[fields[i]]).toEqual(
                        viewModel.sourceMailAccounts[id].data[fields[i]]
                    );
                    break;

                default:
                    t.expect(record.data[fields[i]]).toBe(viewModel.sourceMailAccounts[id].data[fields[i]]);
                    break;

                }


            }

            t.expect(viewModel.sourceMailAccounts[id].modified).toBeFalsy();
        });


        t.it("onSaveFailure", t => {

            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");

            let CALLED = 0;
            viewModel.getView = function () {
                return {
                    fireEvent: function (evt) {
                        if (evt === "cn_mail-mailaccountsavefailure") {
                            CALLED++;
                        }
                    }
                };
            };


            viewModel.onSaveFailure();

            t.expect(CALLED).toBe(1);
        });


        t.it("formulas - processReplyTo/processFrom", t => {

            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");
            decorateViewModel(viewModel);

            let ma         = viewModel.get("mailAccount"),
                oldReplyTo = ma.replyTo,
                replyTo    = {name: "foobar", address: "snafu"},
                oldFrom    = ma.from,
                from       = {name: "foobar", address: "snafu"};

            t.expect(viewModel.getFormulas().processReplyTo.get.apply(viewModel, [viewModel.get])).toBe(
                ma.get("replyTo").address);
            t.expect(viewModel.getFormulas().processFrom.get.apply(viewModel, [viewModel.get])).toBe(
                ma.get("from").address);

            viewModel.getFormulas().processReplyTo.set.apply(viewModel, [replyTo.address]);
            t.expect(ma.get("replyTo").address).toBe(replyTo.address);
            t.expect(ma.get("replyTo")).not.toBe(oldReplyTo);

            viewModel.getFormulas().processFrom.set.apply(viewModel, [from.address]);
            t.expect(ma.get("from").address).toBe(from.address);
            t.expect(ma.get("from")).not.toBe(oldFrom);

        });


        t.it("formulas - processUserName", t => {

            viewModel = Ext.create("conjoon.cn_mail.view.mail.account.MailAccountViewModel");
            decorateViewModel(viewModel);

            let ma         = viewModel.get("mailAccount"),
                oldReplyTo = ma.get("replyTo"),
                oldFrom    = ma.get("from"),
                newName    = Ext.id();

            t.expect(viewModel.getFormulas().processUserName.get.apply(viewModel, [viewModel.get])).toBe(
                ma.get("from").name);
            t.expect(viewModel.getFormulas().processUserName.get.apply(viewModel, [viewModel.get])).not.toBe(
                ma.get("replyTo").name);

            viewModel.getFormulas().processUserName.set.apply(viewModel, [newName]);
            t.expect(ma.get("replyTo").name).toBe(newName);
            t.expect(ma.get("from").name).toBe(newName);

            t.expect(ma.get("replyTo")).not.toBe(oldReplyTo);
            t.expect(ma.get("from")).not.toBe(oldFrom);
        });

    });});