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

    t.requireOk(
        "conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey",
        "conjoon.cn_mail.data.mail.service.MailFolderHelper", () => {

            var packageCtrl;

            const configureButtonMockCaller = function () {
                    return {
                        "#cn_mail-nodeNavEditMessage": 0,
                        "#cn_mail-nodeNavReplyTo": 0,
                        "#cn_mail-nodeNavReplyAll": 0,
                        "#cn_mail-nodeNavForward": 0,
                        "#cn_mail-nodeNavDeleteMessage": 0
                    };
                },
                configurePackageCtrlWithButtonMocks = function (packageCtrl, ENABLED) {
                    packageCtrl.getReplyToButton = function () {
                        return {setDisabled: function (doIt) {
                            ENABLED["#cn_mail-nodeNavReplyTo"] = doIt !== true ? 1 : 0;
                        }
                        };
                    };
                    packageCtrl.getReplyAllButton = function () {
                        return {setDisabled: function (doIt) {
                            ENABLED["#cn_mail-nodeNavReplyAll"] = doIt !== true ? 1 : 0;
                        }
                        };
                    };
                    packageCtrl.getForwardButton = function () {
                        return {setDisabled: function (doIt) {
                            ENABLED["#cn_mail-nodeNavForward"] = doIt !== true ? 1 : 0;
                        }
                        };
                    };
                    packageCtrl.getEditButton = function () {
                        return {setDisabled: function (doIt) {
                            ENABLED["#cn_mail-nodeNavEditMessage"] = doIt !== true ? 1 : 0;
                        }
                        };
                    };
                    packageCtrl.getDeleteButton = function () {
                        return {setDisabled: function (doIt) {
                            ENABLED["#cn_mail-nodeNavDeleteMessage"] = doIt !== true ? 1 : 0;
                        }
                        };
                    };

                };

            t.afterEach(function () {
                Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore") &&
            Ext.data.StoreManager.unregister("cn_mail-mailfoldertreestore");

                if (packageCtrl) {
                    packageCtrl.destroy();
                    packageCtrl = null;
                }
            });

            const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

            t.it("constructor / init()", t => {
                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                t.expect(packageCtrl instanceof coon.core.app.PackageController).toBe(true);

                let exc;
                try {
                    packageCtrl.init({getPackageConfig: (ctrl, path) => {}});
                } catch (e) {
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc).toContain("no configured \"base\"-address found");

                // since conjoon/extjs-app-webmail#140 the baseAddress of the service is used as the prefix for the
                // schema
                t.expect(Ext.data.schema.Schema.get("cn_mail-mailbaseschema").getUrlPrefix()).toBe("cn_mail");
                packageCtrl.init({getPackageConfig: (ctrl, path) => "host:///endpoint//"});
                t.expect(Ext.data.schema.Schema.get("cn_mail-mailbaseschema").getUrlPrefix()).toBe("host://endpoint/");

            });


            t.it("postLaunchHook should create MailFolderTreeStore and return valid object", t => {

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                t.expect(Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore")).toBeUndefined();
                const  ret = packageCtrl.postLaunchHook();
                t.isObject(ret);
                t.expect(Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore")).toBeDefined();
                t.expect(Ext.data.StoreManager.lookup("cn_mail-mailfoldertreestore")).toBe(
                    conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance()
                );
            });


            t.it("postLaunchHook should load MailFolderTreeStore", t => {

                const loadSpy = t.spyOn(conjoon.cn_mail.store.mail.folder.MailFolderTreeStore.getInstance(), "load");

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                t.expect(loadSpy.calls.count()).toBe(0);
                packageCtrl.postLaunchHook();
                t.expect(loadSpy.calls.count()).toBe(1);

                loadSpy.remove();
            });


            t.it("showMailEditor()", t => {

                let CN_HREF = "foo";

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                let mvp = {
                    getActiveTab: function () {
                        return {
                            cn_href: CN_HREF
                        };
                    },
                    showMailEditor: function () {
                    }
                };
                packageCtrl.getMainPackageView = function () {
                    return mvp;
                };

                t.isCalledNTimes("showMailEditor", mvp, 1);

                packageCtrl.showMailEditor("a", "compose");

                let exc;
                try {packageCtrl.showMailEditor();}catch(e){exc=e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain("expects an instance");

            });


            t.it("message routes", t => {

                var CN_HREF = "foo";

                let mpv = {
                    getActiveTab: function () {
                        return {
                            cn_href: CN_HREF
                        };
                    },
                    showMailEditor: function () {
                    },

                    showMailMessageViewFor: function () {
                    }
                };

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                packageCtrl.getMainPackageView = function () {
                    return mpv;
                };

                t.isCalledNTimes("showMailMessageViewFor",  mpv, 1);
                t.isCalledNTimes("showMailEditor", packageCtrl, 6);
                packageCtrl.onComposeMessageRoute("a");
                packageCtrl.onEditMessageRoute(1, 2, 3);
                packageCtrl.onReplyToRoute(1, 2, 3);
                packageCtrl.onReplyAllRoute(1, 2, 3);
                packageCtrl.onForwardRoute(1, 2, 3);
                packageCtrl.onComposeMailtoMessageRoute("b");


                packageCtrl.onReadMessageRoute(1, 2, 3);

            });


            t.it("message edit buttons", t => {

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                let activeTab = null;

                packageCtrl.getMailDesktopView = function () {

                    return {
                        getActiveTab: function () {
                            return activeTab;
                        }
                    };

                };

                packageCtrl.getMainPackageView = function () {
                    return {
                        showMailEditor: function () {
                        }
                    };
                };
                packageCtrl.getMailMessageGrid = function () {
                    return {
                        getSelection: function () {
                            return [{
                                getCompoundKey: function () {
                                    return MessageEntityCompoundKey.createFor(1, 2, 3);
                                }
                            }];
                        }
                    };
                };

                activeTab = {};

                packageCtrl.getMailInboxView = function () {
                    return activeTab;
                };

                t.isCalledNTimes("showMailEditor", packageCtrl, 5);
                packageCtrl.onMessageComposeButtonClick();
                packageCtrl.onMessageEditButtonClick();
                packageCtrl.onReplyToButtonClick();
                packageCtrl.onReplyAllButtonClick();
                packageCtrl.onForwardButtonClick();
            });


            t.it("message delete button", t => {

                let CALLED = 0;
                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                packageCtrl.getMailInboxView = function () {
                    return {
                        getController: function () {
                            return {
                                moveOrDeleteMessage: function () {
                                    CALLED++;
                                }
                            };
                        }
                    };
                };
                packageCtrl.getMailMessageGrid = function () {
                    return {
                        getSelection: function () {
                            return [{
                                getId: function () {
                                    return 1;
                                }
                            }];
                        }
                    };
                };

                packageCtrl.getMailDesktopView = function () {
                    return {
                        getActiveTab: function () {

                        }
                    };
                };

                packageCtrl.getItemOrDraftFromActiveView = function () {
                    return "foo";
                };

                t.expect(CALLED).toBe(0);
                packageCtrl.onMessageDeleteButtonClick();
                t.expect(CALLED).toBe(1);
            });


            t.it("onMailFolderTreeSelectionChange()", t => {

                var ITEMS = [], DESELECTED = 0, exc, READINGPANEDISABLED, TOGGLEGRIDDISABLED,
                    FORWARDDISABLED,
                    REPLYTODISABLED,
                    REPLYALLDISABLED, EDITDISABLED, DELETEDISABLED, TOGGLEMAILFOLDERDISABLED;

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                packageCtrl.getSwitchReadingPaneButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            READINGPANEDISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getToggleMailFolderButton = function () {
                    return {
                        setDisabled: function (disabled) {
                            TOGGLEMAILFOLDERDISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getToggleGridListButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            TOGGLEGRIDDISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getReplyToButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            REPLYTODISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getReplyAllButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            REPLYALLDISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getForwardButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            FORWARDDISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getEditButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            EDITDISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getDeleteButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            DELETEDISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getMailMessageGrid = function () {
                    return {
                        getSelection: function () {
                            return ITEMS;
                        },
                        getSelectionModel: function () {
                            return {
                                deselectAll: function () {
                                    DESELECTED++;
                                }
                            };
                        }
                    };
                };

                let rec1 = {get: function (){}},
                    rec2 = {get: function (){return "ACCOUNT";}};

                try {packageCtrl.onMailFolderTreeSelectionChange(null, [rec1, rec2]);}catch(e){exc = e;}
                t.expect(exc).toBeDefined();
                t.expect(exc.msg.toLowerCase()).toContain("unexpected multiple records");

                t.expect(READINGPANEDISABLED).toBeUndefined();
                t.expect(TOGGLEGRIDDISABLED).toBeUndefined();
                t.expect(DESELECTED).toBe(0);
                packageCtrl.onMailFolderTreeSelectionChange(null, []);
                t.expect(READINGPANEDISABLED).toBe(true);
                t.expect(TOGGLEGRIDDISABLED).toBe(true);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(true);
                packageCtrl.onMailFolderTreeSelectionChange(null, [rec1]);
                t.expect(DESELECTED).toBe(0);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(false);
                t.expect(READINGPANEDISABLED).toBe(false);
                t.expect(TOGGLEGRIDDISABLED).toBe(false);
                t.expect(REPLYTODISABLED).toBe(true);
                t.expect(REPLYALLDISABLED).toBe(true);
                t.expect(FORWARDDISABLED).toBe(true);
                t.expect(DELETEDISABLED).toBe(true);
                t.expect(EDITDISABLED).toBe(true);

                //extjs-app-webmail#83
                packageCtrl.onMailFolderTreeSelectionChange(null, [rec2]);
                t.expect(READINGPANEDISABLED).toBe(true);
                t.expect(TOGGLEGRIDDISABLED).toBe(true);
                t.expect(REPLYTODISABLED).toBe(true);
                t.expect(REPLYALLDISABLED).toBe(true);
                t.expect(FORWARDDISABLED).toBe(true);
                t.expect(DELETEDISABLED).toBe(true);
                t.expect(EDITDISABLED).toBe(true);

                ITEMS = [{get: function () {return true;}}];
                packageCtrl.onMailFolderTreeSelectionChange(null, [rec1]);

                t.expect(READINGPANEDISABLED).toBe(false);
                t.expect(TOGGLEGRIDDISABLED).toBe(false);
                t.expect(REPLYTODISABLED).toBe(true);
                t.expect(REPLYALLDISABLED).toBe(true);
                t.expect(FORWARDDISABLED).toBe(true);
                t.expect(DELETEDISABLED).toBe(false);
                t.expect(EDITDISABLED).toBe(false);
            });


            t.it("onMailMessageGridDeselect()", t => {
                var DISABLED = {
                    "#cn_mail-nodeNavEditMessage": 0,
                    "#cn_mail-nodeNavReplyTo": 0,
                    "#cn_mail-nodeNavReplyAll": 0,
                    "#cn_mail-nodeNavForward": 0,
                    "#cn_mail-nodeNavDeleteMessage": 0
                };
                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                let ACTIVETAB     = 1,
                    MAILINBOXVIEW = 2;

                packageCtrl.getMailDesktopView = function () {
                    return {
                        getActiveTab: function () {
                            return ACTIVETAB;
                        }
                    };
                };

                packageCtrl.getMailInboxView = function () {
                    return MAILINBOXVIEW;
                };

                packageCtrl.getReplyToButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt === true) {DISABLED["#cn_mail-nodeNavReplyTo"]++;}
                    }
                    };
                };
                packageCtrl.getReplyAllButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt === true) {DISABLED["#cn_mail-nodeNavReplyAll"]++;}
                    }
                    };
                };
                packageCtrl.getForwardButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt === true) {DISABLED["#cn_mail-nodeNavForward"]++;}
                    }
                    };
                };
                packageCtrl.getEditButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt === true) {DISABLED["#cn_mail-nodeNavEditMessage"]++;}
                    }
                    };
                };
                packageCtrl.getDeleteButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt === true) {DISABLED["#cn_mail-nodeNavDeleteMessage"]++;}
                    }
                    };
                };


                t.isCalledOnce("disableEmailActionButtons", packageCtrl);
                t.isCalledOnce("disableEmailEditButtons", packageCtrl);

                packageCtrl.onMailMessageGridDeselect();

                t.expect(DISABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(DISABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(DISABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(DISABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(DISABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);

                MAILINBOXVIEW = ACTIVETAB;

                packageCtrl.onMailMessageGridDeselect();
                t.expect(DISABLED["#cn_mail-nodeNavEditMessage"]).toBe(1);
                t.expect(DISABLED["#cn_mail-nodeNavReplyTo"]).toBe(1);
                t.expect(DISABLED["#cn_mail-nodeNavReplyAll"]).toBe(1);
                t.expect(DISABLED["#cn_mail-nodeNavForward"]).toBe(1);
                t.expect(DISABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);

            });

            t.it("onMailMessageGridSelect()", t => {
                var ENABLED = {
                        "#cn_mail-nodeNavEditMessage": 0,
                        "#cn_mail-nodeNavReplyTo": 0,
                        "#cn_mail-nodeNavReplyAll": 0,
                        "#cn_mail-nodeNavForward": 0,
                        "#cn_mail-nodeNavDeleteMessage": 0
                    },
                    ISDRAFT,
                    //
                    // Needed since disabling is usually done by the deselect listener
                    //
                    reset = function () {
                        ENABLED = {
                            "#cn_mail-nodeNavEditMessage": 0,
                            "#cn_mail-nodeNavReplyTo": 0,
                            "#cn_mail-nodeNavReplyAll": 0,
                            "#cn_mail-nodeNavForward": 0,
                            "#cn_mail-nodeNavDeleteMessage": 0
                        };
                    };
                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                packageCtrl.getReplyToButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt !== true) {ENABLED["#cn_mail-nodeNavReplyTo"]++;}
                    }
                    };
                };
                packageCtrl.getReplyAllButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt !== true) {ENABLED["#cn_mail-nodeNavReplyAll"]++;}
                    }
                    };
                };
                packageCtrl.getForwardButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt !== true) {ENABLED["#cn_mail-nodeNavForward"]++;}
                    }
                    };
                };
                packageCtrl.getEditButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt !== true) {ENABLED["#cn_mail-nodeNavEditMessage"]++;}
                    }
                    };
                };
                packageCtrl.getDeleteButton = function () {
                    return {setDisabled: function (doIt) {
                        if (doIt !== true) {ENABLED["#cn_mail-nodeNavDeleteMessage"]++;}
                    }
                    };
                };
                let rec = {
                    get: function () {
                        return ISDRAFT;
                    }
                };

                t.isCalled("activateButtonsForMessageItem", packageCtrl);

                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);

                ISDRAFT = true;
                packageCtrl.onMailMessageGridSelect(null, rec);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);
                reset();

                ISDRAFT = false;
                packageCtrl.onMailMessageGridSelect(null, rec);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);

            });


            t.it("onReadingPaneCheckChange()", t => {
                var DIRECTION = null,
                    menuItem1 = {getItemId: function () {return "right";}},
                    menuItem2 = {getItemId: function () {return "bottom";}},
                    menuItem3 = {getItemId: function () {return "hide";}};

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                packageCtrl.getMailInboxView = function () {
                    return {
                        toggleReadingPane: function (dir) {
                            DIRECTION = dir;
                        }
                    };
                };


                t.expect(DIRECTION).toBe(null);
                packageCtrl.onReadingPaneCheckChange(menuItem1, false);
                t.expect(DIRECTION).toBe(null);
                packageCtrl.onReadingPaneCheckChange(menuItem1, true);
                t.expect(DIRECTION).toBe("right");
                packageCtrl.onReadingPaneCheckChange(menuItem2, true);
                t.expect(DIRECTION).toBe("bottom");
                packageCtrl.onReadingPaneCheckChange(menuItem3, true);
                t.expect(DIRECTION).toBeUndefined();
            });


            t.it("onToggleListViewButtonClick()", t => {

                var ENABLED;

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                packageCtrl.getMailMessageGrid = function () {
                    return {
                        enableRowPreview: function (pressed) {
                            ENABLED = pressed;
                        }
                    };
                };

                t.expect(ENABLED).toBeUndefined();
                packageCtrl.onToggleListViewButtonClick(null, true);
                t.expect(ENABLED).toBe(false);
                packageCtrl.onToggleListViewButtonClick(null, false);
                t.expect(ENABLED).toBe(true);
            });


            t.it("onToggleFolderViewButtonClick()", t => {

                var HIDDEN;

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                packageCtrl.getMailFolderTree = function () {
                    return {
                        show: function () {
                            HIDDEN = false;
                        },
                        hide: function () {
                            HIDDEN = true;
                        }
                    };
                };

                t.expect(HIDDEN).toBeUndefined();
                packageCtrl.onToggleFolderViewButtonClick(null, true);
                t.expect(HIDDEN).toBe(false);
                packageCtrl.onToggleFolderViewButtonClick(null, false);
                t.expect(HIDDEN).toBe(true);

            });


            t.it("onMailMessageGridBeforeLoad() / onMailMessageGridLoad()", t => {

                var TOGGLEGRIDDISABLED, ISSAME_LEFT = false, ISSAME_RIGHT = false;
                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                packageCtrl.getMailInboxView = function () {
                    return ISSAME_LEFT;
                };
                packageCtrl.getMailDesktopView = function () {
                    return {
                        getLayout: function () {
                            return {
                                getActiveItem: function () {
                                    return ISSAME_RIGHT;
                                }
                            };
                        }
                    };
                };

                packageCtrl.getToggleGridListButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            TOGGLEGRIDDISABLED = disabled;
                        }
                    };
                };


                t.expect(TOGGLEGRIDDISABLED).toBeUndefined();
                packageCtrl.onMailMessageGridBeforeLoad(null, null);

                t.expect(TOGGLEGRIDDISABLED).toBe(true);
                packageCtrl.onMailMessageGridLoad(null, null);
                t.expect(TOGGLEGRIDDISABLED).toBe(false);

                TOGGLEGRIDDISABLED = true;
                packageCtrl.onMailMessageGridLoad(null, null);
                t.expect(TOGGLEGRIDDISABLED).toBe(false);

                TOGGLEGRIDDISABLED = true;
                ISSAME_LEFT = true;
                packageCtrl.onMailMessageGridLoad(null, null);
                t.expect(TOGGLEGRIDDISABLED).toBe(true);

                ISSAME_LEFT = false;
                packageCtrl.onMailMessageGridLoad(null, null);
                t.expect(TOGGLEGRIDDISABLED).toBe(false);

            });


            t.it("onMailInboxViewActivate() / onMailInboxViewDeactivate()", t => {

                var TOGGLEGRIDDISABLED, SWITCHREADINGPANEDISABLED,
                    TOGGLEMAILFOLDERDISABLED, ISLOADING, FOLDERTYPE = "INBOX",
                    SELECTIONDEFAULT = [{
                        get: function () {
                            return FOLDERTYPE;
                        }}],
                    SELECTION = SELECTIONDEFAULT, SELECTIONEMPTY = [],
                    EMAILACTIONBUTTONSDISABLED = false,
                    EMAILEDITBUTTONSDISABLED = false,
                    MESSAGEGRIDBUTTONSACTIVATED = true;

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                packageCtrl.getMailFolderTree = function (){
                    return {
                        getSelection: function () {
                            return SELECTION;                }
                    };
                };

                packageCtrl.getMailMessageGrid = function () {
                    return {
                        getStore: function () {
                            return {
                                isLoading: function () {
                                    return ISLOADING;
                                }
                            };
                        }
                    };
                };
                packageCtrl.getSwitchReadingPaneButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            SWITCHREADINGPANEDISABLED = disabled;
                        }
                    };
                };
                packageCtrl.getToggleMailFolderButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            TOGGLEMAILFOLDERDISABLED = disabled;
                        }
                    };
                };

                packageCtrl.getToggleGridListButton = function (){
                    return {
                        setDisabled: function (disabled) {
                            TOGGLEGRIDDISABLED = disabled;
                        }
                    };
                };

                packageCtrl.disableEmailActionButtons = function (disabled) {
                    EMAILACTIONBUTTONSDISABLED = disabled;
                };

                packageCtrl.disableEmailEditButtons = function (disabled) {
                    EMAILEDITBUTTONSDISABLED = disabled;
                };

                packageCtrl.activateButtonsForMessageGrid = function () {
                    MESSAGEGRIDBUTTONSACTIVATED = true;
                };

                t.expect(ISLOADING).toBeUndefined();
                t.expect(SWITCHREADINGPANEDISABLED).toBeUndefined();
                t.expect(TOGGLEMAILFOLDERDISABLED).toBeUndefined();
                t.expect(TOGGLEGRIDDISABLED).toBeUndefined();

                // test with activating
                packageCtrl.onMailInboxViewActivate(null);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(false);
                t.expect(SWITCHREADINGPANEDISABLED).toBe(false);
                t.expect(TOGGLEGRIDDISABLED).toBe(false);
                t.expect(MESSAGEGRIDBUTTONSACTIVATED).toBe(true);

                // deactivating
                packageCtrl.onMailInboxViewDeactivate(null);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(true);
                t.expect(SWITCHREADINGPANEDISABLED).toBe(true);
                t.expect(TOGGLEGRIDDISABLED).toBe(true);

                // test with loading
                ISLOADING = true;
                packageCtrl.onMailInboxViewActivate(null);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(false);
                t.expect(SWITCHREADINGPANEDISABLED).toBe(false);
                t.expect(TOGGLEGRIDDISABLED).toBe(true);

                ISLOADING = false;
                packageCtrl.onMailInboxViewActivate(null);
                t.expect(TOGGLEGRIDDISABLED).toBe(false);

                // SELECTION LENGTH
                SELECTION = SELECTIONEMPTY;
                ISLOADING = false;
                packageCtrl.onMailInboxViewActivate(null);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(true);
                t.expect(SWITCHREADINGPANEDISABLED).toBe(true);
                t.expect(TOGGLEGRIDDISABLED).toBe(true);

                SELECTION = SELECTIONDEFAULT;
                ISLOADING = true;
                packageCtrl.onMailInboxViewActivate(null);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(false);
                t.expect(SWITCHREADINGPANEDISABLED).toBe(false);
                t.expect(TOGGLEGRIDDISABLED).toBe(true);

                SELECTION = SELECTIONDEFAULT;
                ISLOADING = false;
                packageCtrl.onMailInboxViewActivate(null);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(false);
                t.expect(SWITCHREADINGPANEDISABLED).toBe(false);
                t.expect(TOGGLEGRIDDISABLED).toBe(false);

                FOLDERTYPE = "ACCOUNT";
                SELECTION = SELECTIONDEFAULT;
                ISLOADING = false;
                packageCtrl.onMailInboxViewActivate(null);
                t.expect(TOGGLEMAILFOLDERDISABLED).toBe(false);
                t.expect(SWITCHREADINGPANEDISABLED).toBe(true);
                t.expect(TOGGLEGRIDDISABLED).toBe(true);
                t.expect(EMAILACTIONBUTTONSDISABLED).toBe(true);
                t.expect(EMAILEDITBUTTONSDISABLED).toBe(true);

            });


            t.it("mailfolder route", t => {

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                let pv = {
                    showInboxViewFor: function () {}
                };
                packageCtrl.getMainPackageView = function () {
                    return pv;
                };

                t.isCalledNTimes("showInboxViewFor", packageCtrl.getMainPackageView(), 1);
                packageCtrl.onMailFolderRoute();

            });


            t.it("disableEmailActionButtons()", function (t){

                let ENABLED = configureButtonMockCaller();

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

                packageCtrl.disableEmailActionButtons(true);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);

                packageCtrl.disableEmailActionButtons(false);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);
            });


            t.it("disableEmailEditButtons()", function (t){

                let ENABLED = configureButtonMockCaller();

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

                packageCtrl.disableEmailEditButtons(true);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);

                packageCtrl.disableEmailEditButtons(false);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);

                packageCtrl.disableEmailEditButtons(false, false);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);

                packageCtrl.disableEmailEditButtons(true, false);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);

                packageCtrl.disableEmailEditButtons(false, true);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);
            });


            t.it("activateButtonsForMessageItem()", t => {

                let ENABLED = configureButtonMockCaller();

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);


                let ISDRAFT,
                    rec = {
                        get: function () {
                            return ISDRAFT;
                        }
                    };

                ISDRAFT = false;
                packageCtrl.activateButtonsForMessageItem(rec);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);

                ISDRAFT = true;
                packageCtrl.activateButtonsForMessageItem(rec);
                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);

            });


            t.it("onMailDesktopViewTabChange() - panel is MessageView", t => {

                let ISDRAFT,
                    ENABLED = configureButtonMockCaller(),
                    activatedPanel;

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

                activatedPanel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");

                activatedPanel.getViewModel = function () {
                    return {
                        get: function () {
                            return {
                                get: function () {
                                    return ISDRAFT;
                                }
                            };
                        }
                    };
                };

                ISDRAFT = false;

                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);
            });


            t.it("onMailDesktopViewTabChange() - panel is MessageView with loading item", t => {

                let ISDRAFT,
                    ENABLED = configureButtonMockCaller(),
                    rec,
                    activatedPanel;

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

                activatedPanel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");

                activatedPanel.loadingItem = {};


                ISDRAFT = true;
                rec = {
                    get: function () {
                        return ISDRAFT;
                    }
                };

                t.isCalled("onMailMessageItemLoadForActivatedView", packageCtrl);
                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

                activatedPanel.fireEvent("cn_mail-messageitemload", activatedPanel, rec);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(1);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);
            });


            t.it("onMailDesktopViewTabChange() - panel is MessageView with loading item, panel switched before loading finishes", t => {

                let ISDRAFT,
                    ENABLED = configureButtonMockCaller(),
                    rec,
                    activatedPanel, otherPanel;

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

                activatedPanel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");
                otherPanel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");

                activatedPanel.loadingItem = {};

                // we add a loading item here so we can check that
                // onMailMessageItemLoadForActivatedView is never called
                otherPanel.loadingItem = {};


                ISDRAFT = false;
                rec = {
                    get: function () {
                        return ISDRAFT;
                    }
                };

                t.isntCalled("onMailMessageItemLoadForActivatedView", packageCtrl);
                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);
                packageCtrl.onMailDesktopViewTabChange(null, otherPanel);

                activatedPanel.fireEvent("cn_mail-messageitemload", activatedPanel, rec);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);
            });


            t.it("onMailDesktopViewTabChange() - panel is MailInboxView with selection", t => {

                let activatedPanel = {

                };

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                packageCtrl.getMailInboxView = function () {
                    return activatedPanel;
                };


                t.expect(packageCtrl.onMailDesktopViewTabChange(null, activatedPanel)).toBe(false);
            });


            t.it("onMailDesktopViewTabChange() - panel is MailInboxView with no selection", t => {

                let ENABLED = configureButtonMockCaller(),
                    activatedPanel = {

                    };

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                packageCtrl.getMailInboxView = function () {
                    return activatedPanel;
                };

                packageCtrl.getMailMessageGrid = function () {
                    return {
                        getSelection: function () {
                            return [];
                        }
                    };
                };

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);
                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);
            });


            t.it("onMailDesktopViewTabChange() - panel is MessageEditor", t => {

                let ENABLED = configureButtonMockCaller(),
                    activatedPanel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                        messageDraft: Ext.create(
                            "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig")
                    });

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);
                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);
            });


            t.it("onMailDesktopViewTabChange() - no familiar panel", t => {

                let ENABLED = configureButtonMockCaller(),
                    activatedPanel = Ext.create("Ext.Panel");

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);
                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);
            });


            t.it("onEditMessageButtonClick() - active tab is MessageView", t => {

                t.it("message edit buttons", t => {

                    packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                    let activeTab = null,
                        COMPOUNDKEY = MessageEntityCompoundKey.createFor(
                            1, 2, 3), SETKEY = null;

                    packageCtrl.getMailDesktopView = function () {
                        return {
                            getActiveTab: function () {
                                return activeTab;
                            }
                        };
                    };

                    packageCtrl.getMainPackageView = function () {
                        return {
                            showMailEditor: function (key) {
                                SETKEY = key;
                            }
                        };
                    };

                    activeTab = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");
                    activeTab.getMessageItem = function () {
                        return {
                            getCompoundKey: function () {
                                return COMPOUNDKEY;
                            }
                        };
                    };
                    packageCtrl.getMailInboxView = function () {
                        return activeTab;
                    };

                    t.isCalledOnce("getCompoundKeyFromGridOrMessageView", packageCtrl);

                    t.expect(SETKEY).toBe(null);
                    packageCtrl.onMessageEditButtonClick();
                    t.expect(SETKEY).toBe(COMPOUNDKEY);

                });
            });


            t.it("onReplyToButtonClick() - active tab is MessageView", t => {

                t.it("message edit buttons", t => {

                    packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                    let activeTab = null, KEY = null,
                        SETKEY = MessageEntityCompoundKey.createFor(1, 2, 3);

                    packageCtrl.getMailDesktopView = function () {
                        return {
                            getActiveTab: function () {
                                return activeTab;
                            }
                        };
                    };

                    packageCtrl.getMainPackageView = function () {
                        return {
                            showMailEditor: function (key) {
                                KEY = key;
                            }
                        };
                    };

                    activeTab = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");
                    activeTab.getMessageItem = function () {
                        return {
                            getCompoundKey: function () {
                                return SETKEY;
                            }
                        };
                    };
                    packageCtrl.getMailInboxView = function () {
                        return activeTab;
                    };

                    t.isCalledOnce("getCompoundKeyFromGridOrMessageView", packageCtrl);

                    t.expect(KEY).toBe(null);
                    packageCtrl.onReplyToButtonClick();
                    t.expect(KEY).toBe(SETKEY);

                });
            });


            t.it("onReplyAllButtonClick() - active tab is MessageView", t => {

                t.it("message edit buttons", t => {

                    packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                    let activeTab = null, KEY = null,
                        SETKEY = MessageEntityCompoundKey.createFor(1, 2, 3);

                    packageCtrl.getMailDesktopView = function () {
                        return {
                            getActiveTab: function () {
                                return activeTab;
                            }
                        };
                    };

                    packageCtrl.getMainPackageView = function () {
                        return {
                            showMailEditor: function (id) {
                                KEY = id;
                            }
                        };
                    };

                    activeTab = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");
                    activeTab.getMessageItem = function () {
                        return {
                            getCompoundKey: function () {
                                return SETKEY;
                            }
                        };
                    };
                    packageCtrl.getMailInboxView = function () {
                        return activeTab;
                    };

                    t.isCalledOnce("getCompoundKeyFromGridOrMessageView", packageCtrl);

                    t.expect(KEY).toBe(null);
                    packageCtrl.onReplyAllButtonClick();
                    t.expect(KEY).toBe(SETKEY);

                });
            });


            t.it("onForwardButtonClick() - active tab is MessageView", t => {

                t.it("message edit buttons", t => {

                    packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                    let activeTab = null, KEY = null,
                        SETKEY = MessageEntityCompoundKey.createFor(1, 2, 3);

                    packageCtrl.getMailDesktopView = function () {
                        return {
                            getActiveTab: function () {
                                return activeTab;
                            }
                        };
                    };

                    packageCtrl.getMainPackageView = function () {
                        return {
                            showMailEditor: function (id) {
                                KEY = id;
                            }
                        };
                    };

                    activeTab = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");
                    activeTab.getMessageItem = function () {
                        return {
                            getCompoundKey: function () {
                                return SETKEY;
                            }
                        };
                    };
                    packageCtrl.getMailInboxView = function () {
                        return activeTab;
                    };

                    t.isCalledOnce("getCompoundKeyFromGridOrMessageView", packageCtrl);

                    t.expect(KEY).toBe(null);
                    packageCtrl.onForwardButtonClick();
                    t.expect(KEY).toBe(SETKEY);

                });
            });


            t.it("getItemOrDraftFromActiveView()", t => {

                let ACTIVETAB = "";

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                packageCtrl.getMailDesktopView = function () {
                    return {
                        getActiveTab: function () {
                            return ACTIVETAB;
                        }
                    };
                };

                packageCtrl.getMailInboxView = function () {
                    return 3;
                };

                packageCtrl.getMailMessageGrid = function () {
                    return {
                        getSelection: function () {
                            return [4];
                        }
                    };
                };

                ACTIVETAB = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                    messageDraft: 1
                });
                ACTIVETAB.getMessageDraft = function () { return 1;};
                t.expect(packageCtrl.getItemOrDraftFromActiveView()).toBe(1);

                ACTIVETAB = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");
                ACTIVETAB.getMessageItem = function () { return 2;};
                t.expect(packageCtrl.getItemOrDraftFromActiveView()).toBe(2);

                ACTIVETAB = 3;
                t.expect(packageCtrl.getItemOrDraftFromActiveView()).toBe(4);

                ACTIVETAB = 4;
                t.expect(packageCtrl.getItemOrDraftFromActiveView()).toBe(null);
            });


            t.it("extjs-app-webmail#69", t => {

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                let REPLYALLROUTE = 0;

                packageCtrl.onBeforePackageRoute = function () {
                    let action = arguments[arguments.length - 1];
                    action.resume();
                };

                packageCtrl.onReplyAllRoute = function () {
                    REPLYALLROUTE++;
                };


                t.expect(REPLYALLROUTE).toBe(0);
                Ext.util.History.add("cn_mail/message/replyAll/foo/test/bar");

                t.waitForMs(t.parent.TIMEOUT, () => {

                    t.expect(REPLYALLROUTE).toBe(1);

                });

            });


            t.it("extjs-app-webmail#79", t => {

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                let ck = packageCtrl.createCompoundKeyFromUrlFragments("a%20b", "foo", "ba%20r");

                t.expect(ck.toLocalId()).toBe("a b-foo-ba r");

                packageCtrl.showMailEditor = Ext.emptyFn;

                t.isCalledNTimes("createCompoundKeyFromUrlFragments", packageCtrl, 4);

                packageCtrl.onEditMessageRoute("a", "b", "c");
                packageCtrl.onReplyToRoute("a", "b", "c");
                packageCtrl.onReplyAllRoute("a", "b", "c");
                packageCtrl.onForwardRoute("a", "b", "c");

            });


            t.it("extjs-app-webmail#66 - messageEditorIsActivatedTab()", t => {

                let ENABLED = configureButtonMockCaller();

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);
                packageCtrl.messageEditorIsActivatedTab();

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);
            });


            const testForEditorLoading = function (t, type)  {

                let ENABLED = configureButtonMockCaller(),
                    activatedPanel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                        messageDraft: Ext.create(
                            "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig")
                    });

                switch (type) {

                case "LOADINGDRAFT":
                    activatedPanel.getViewModel().loadingDraft = true;
                    break;

                case "LOADINGFAILED":
                    activatedPanel.getViewModel().loadingFailed = true;
                    break;

                case "MESSAGEBODYLOADING":
                    activatedPanel.getViewModel().set("isMessageBodyLoading", true);
                    break;

                case "HASPENDINGCOPYREQUEST":
                    activatedPanel.getViewModel().hasPendingCopyRequest = function () {
                        return true;
                    };
                    break;
                }

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);
                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);

            };


            t.it("extjs-app-webmail#66 - onMailDesktopViewTabChange() - panel is MessageEditor, ViewModel has loadingDraft", t => {

                testForEditorLoading(t, "LOADINGDRAFT");
            });


            t.it("extjs-app-webmail#66 - onMailDesktopViewTabChange() - panel is MessageEditor, ViewModel has isMessageBodyLoading ", t => {

                testForEditorLoading(t, "MESSAGEBODYLOADING");
            });


            t.it("extjs-app-webmail#66 - onMailDesktopViewTabChange() - panel is MessageEditor, ViewModel hasPendingCopyRequest ", t => {

                testForEditorLoading(t, "HASPENDINGCOPYREQUEST");
            });

            t.it("extjs-app-webmail#66 - onMailDesktopViewTabChange() - panel is MessageEditor, ViewModel loadingFailed ", t => {

                testForEditorLoading(t, "LOADINGFAILED");
            });


            t.it("extjs-app-webmail#66 - onMailDesktopViewTabChange() - panel is MessageView with loading item, panel switched before loading finishes", t => {

                let ENABLED = configureButtonMockCaller(),
                    activatedPanel, otherPanel;

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

                activatedPanel = Ext.create("conjoon.cn_mail.view.mail.message.editor.MessageEditor", {
                    messageDraft: Ext.create(
                        "conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig")
                });

                activatedPanel.getViewModel().hasPendingCopyRequest = function () {
                    return true;
                };

                otherPanel = Ext.create("conjoon.cn_mail.view.mail.message.reader.MessageView");

                // we add a loading item here so we can check that
                // onMailMessageItemLoadForActivatedView is never called
                otherPanel.loadingItem = {};


                t.isCalled("messageEditorIsActivatedTab", packageCtrl);
                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);
                packageCtrl.onMailDesktopViewTabChange(null, otherPanel);

                activatedPanel.fireEvent("cn_mail-messagedraftload", activatedPanel);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(0);


                activatedPanel.getViewModel().hasPendingCopyRequest = function () {
                    return false;
                };

                packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

                t.expect(ENABLED["#cn_mail-nodeNavReplyTo"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavReplyAll"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavForward"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavEditMessage"]).toBe(0);
                t.expect(ENABLED["#cn_mail-nodeNavDeleteMessage"]).toBe(1);


            });


            t.it("extjs-app-webmail#83 - mailaccount route", t => {

                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");
                let pv = {
                    showMailAccountFor: function () {}
                };
                packageCtrl.getMainPackageView = function () {
                    return pv;
                };

                t.isCalledNTimes("showMailAccountFor", packageCtrl.getMainPackageView(), 1);
                packageCtrl.onMailAccountRoute();

            });


            t.it("Route configs - extjs-app-webmail#111", t => {
                packageCtrl = Ext.create("conjoon.cn_mail.app.PackageController");

                let routes = packageCtrl.config.routes,
                    exp = {
                        "cn_mail/message/compose/:id": {
                            action: "onComposeMessageRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/message/compose/mailto%3A:id": {
                            action: "onComposeMailtoMessageRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/message/edit/:mailAccountId/:mailFolderId/:id": {
                            action: "onEditMessageRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/message/replyTo/:mailAccountId/:mailFolderId/:id": {
                            action: "onReplyToRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/message/replyAll/:mailAccountId/:mailFolderId/:id": {
                            action: "onReplyAllRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/message/forward/:mailAccountId/:mailFolderId/:id": {
                            action: "onForwardRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/message/read/:mailAccountId/:mailFolderId/:id": {
                            action: "onReadMessageRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/folder/:mailAccountId/:id": {
                            action: "onMailFolderRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/account/:mailAccountId": {
                            action: "onMailAccountRoute",
                            before: "onBeforePackageRoute"
                        },
                        "cn_mail/home": {
                            action: "onHomeTabRoute",
                            before: "onBeforePackageRoute"
                        }
                    };

                for (let i in routes) {
                    t.expect(exp[i]).toBeDefined();
                    t.expect(exp[i].before).toBe(routes[i].before);
                    t.expect(exp[i].action).toBe(routes[i].action);
                }

            });

        });});
