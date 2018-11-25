/**
 * conjoon
 * (c) 2007-2018 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2018 Thorsten Suckow-Homberg/conjoon.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

describe('conjoon.cn_mail.controller.PackageControllerTest', function(t) {

t.requireOk('conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey', function() {

    var packageCtrl;

    const configureButtonMockCaller = function() {
            return {
                '#cn_mail-nodeNavEditMessage'   : 0,
                '#cn_mail-nodeNavReplyTo'       : 0,
                '#cn_mail-nodeNavReplyAll'      : 0,
                '#cn_mail-nodeNavForward'       : 0,
                '#cn_mail-nodeNavDeleteMessage' : 0
            };
        },
        configurePackageCtrlWithButtonMocks = function(packageCtrl, ENABLED) {
            packageCtrl.getReplyToButton = function() {
                return {setDisabled: function (doIt) {
                    if (doIt !== true) {ENABLED['#cn_mail-nodeNavReplyTo']++;}
                }
                }
            };
            packageCtrl.getReplyAllButton = function() {
                return {setDisabled: function (doIt) {
                    if (doIt !== true) {ENABLED['#cn_mail-nodeNavReplyAll']++;}
                }
                }
            };
            packageCtrl.getForwardButton = function() {
                return {setDisabled: function (doIt) {
                    if (doIt !== true) {ENABLED['#cn_mail-nodeNavForward']++;}
                }
                }
            };
            packageCtrl.getEditButton = function() {
                return {setDisabled: function (doIt) {
                    if (doIt !== true) {ENABLED['#cn_mail-nodeNavEditMessage']++;}
                }
                }
            };
            packageCtrl.getDeleteButton = function() {
                return {setDisabled: function (doIt) {
                    if (doIt !== true) {ENABLED['#cn_mail-nodeNavDeleteMessage']++;}
                }
                }
            };

        };

    t.afterEach(function() {
        if (packageCtrl) {
            packageCtrl.destroy();
            packageCtrl = null;
        }
    });

    const MessageEntityCompoundKey = conjoon.cn_mail.data.mail.message.compoundKey.MessageEntityCompoundKey;

    t.it("Should create the Controller", function(t) {
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        t.expect(packageCtrl instanceof conjoon.cn_core.app.PackageController).toBe(true);

    });


    t.it("postLaunchHook should return valid object", function(t) {
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        var ret = packageCtrl.postLaunchHook();


        t.isObject(ret)

    });


    t.it("showMailEditor()", function(t) {

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        let mvp = {
            getActiveTab : function() {
                return {
                    cn_href : CN_HREF
                };
            },
            showMailEditor : function() {
            }
        };
        packageCtrl.getMainPackageView = function() {
            return mvp;
        };

        t.isCalledNTimes('showMailEditor', mvp, 1);

        packageCtrl.showMailEditor('a', 'compose');

        let exc, e;
        try {packageCtrl.showMailEditor();}catch(e){exc=e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("expects an instance");

    });


    t.it("message routes", function(t) {

        var CN_HREF = 'foo';

        let mpv = {
            getActiveTab : function() {
                return {
                    cn_href : CN_HREF
                };
            },
            showMailEditor : function() {
            },

            showMailMessageViewFor : function() {
            }
        };

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMainPackageView = function() {
            return mpv;
        };

        t.isCalledNTimes('showMailMessageViewFor',  mpv, 1);
        t.isCalledNTimes('showMailEditor', packageCtrl, 6);
        packageCtrl.onComposeMessageRoute('a');
        packageCtrl.onEditMessageRoute(1, 2, 3);
        packageCtrl.onReplyToRoute(1, 2, 3);
        packageCtrl.onReplyAllRoute(1, 2, 3);
        packageCtrl.onForwardRoute(1, 2, 3);
        packageCtrl.onComposeMailtoMessageRoute('b');


        packageCtrl.onReadMessageRoute(1, 2, 3);

    });


    t.it("message edit buttons", function(t) {

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        let activeTab = null;

        packageCtrl.getMailDesktopView = function() {

            return {
                getActiveTab : function() {
                    return activeTab;
                }
            }

        };

        packageCtrl.getMainPackageView = function() {
            return {
                showMailEditor : function() {
                }
            }
        };
        packageCtrl.getMailMessageGrid = function() {
            return {
                getSelection : function() {
                    return [{
                        getCompoundKey : function() {
                            return MessageEntityCompoundKey.createFor(1, 2, 3);
                        }
                    }]
                }
            };
        };

        activeTab = {};

        packageCtrl.getMailInboxView = function() {
            return activeTab;
        };

        t.isCalledNTimes('showMailEditor', packageCtrl, 5);
        packageCtrl.onMessageComposeButtonClick();
        packageCtrl.onMessageEditButtonClick();
        packageCtrl.onReplyToButtonClick();
        packageCtrl.onReplyAllButtonClick();
        packageCtrl.onForwardButtonClick();
    });


    t.it("message delete button", function(t) {

        let CALLED = 0;
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMailInboxView = function() {
            return {
                getController : function() {
                    return {
                        moveOrDeleteMessage : function() {
                            CALLED++;
                        }
                    }
                }
            }
        };
        packageCtrl.getMailMessageGrid = function() {
            return {
                getSelection : function() {
                    return [{
                        getId : function() {
                            return 1;
                        }
                    }]
                }
            };
        };

        packageCtrl.getMailDesktopView = function() {
            return {
                getActiveTab : function() {

                }
            }
        };

        packageCtrl.getItemOrDraftFromActiveView = function() {
            return 'foo';
        }

        t.expect(CALLED).toBe(0);
        packageCtrl.onMessageDeleteButtonClick();
        t.expect(CALLED).toBe(1);
    });


    t.it('onMailFolderTreeSelectionChange()', function(t) {

        var DESELECTED = 0, exc, e, READINGPANEDISABLED, TOGGLEGRIDDISABLED;
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getSwitchReadingPaneButton = function(){
            return {
                setDisabled : function(disabled) {
                    READINGPANEDISABLED = disabled;
                }
            };
        };
        packageCtrl.getToggleGridListButton = function(){
            return {
                setDisabled : function(disabled) {
                    TOGGLEGRIDDISABLED = disabled;
                }
            };
        };
        packageCtrl.getMailMessageGrid = function() {
            return {
                getSelectionModel : function() {
                    return {
                        deselectAll : function() {
                            DESELECTED++;
                        }
                    }
                }
            };
        };

        try {packageCtrl.onMailFolderTreeSelectionChange(null, [1, 2]);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg.toLowerCase()).toContain("unexpected multiple records")

        t.expect(READINGPANEDISABLED).toBeUndefined();
        t.expect(TOGGLEGRIDDISABLED).toBeUndefined();
        t.expect(DESELECTED).toBe(0);
        packageCtrl.onMailFolderTreeSelectionChange(null, [1]);
        t.expect(DESELECTED).toBe(0);
        t.expect(READINGPANEDISABLED).toBe(false);
        t.expect(TOGGLEGRIDDISABLED).toBeUndefined();
        packageCtrl.onMailFolderTreeSelectionChange(null, []);
        t.expect(READINGPANEDISABLED).toBe(true);
        t.expect(TOGGLEGRIDDISABLED).toBeUndefined();

    });


    t.it('onMailMessageGridDeselect()', function(t) {
        var DISABLED = {
            '#cn_mail-nodeNavEditMessage'   : 0,
            '#cn_mail-nodeNavReplyTo'       : 0,
            '#cn_mail-nodeNavReplyAll'      : 0,
            '#cn_mail-nodeNavForward'       : 0,
            '#cn_mail-nodeNavDeleteMessage' : 0
        };
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        let ACTIVETAB     = 1,
            MAILINBOXVIEW = 2;

        packageCtrl.getMailDesktopView = function() {
            return {
                getActiveTab : function() {
                    return ACTIVETAB;
                }
            }
        };

        packageCtrl.getMailInboxView = function() {
            return MAILINBOXVIEW;
        };

        packageCtrl.getReplyToButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt === true) {DISABLED['#cn_mail-nodeNavReplyTo']++;}
            }
            }
        };
        packageCtrl.getReplyAllButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt === true) {DISABLED['#cn_mail-nodeNavReplyAll']++;}
            }
            }
        };
        packageCtrl.getForwardButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt === true) {DISABLED['#cn_mail-nodeNavForward']++;}
            }
            }
        };
        packageCtrl.getEditButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt === true) {DISABLED['#cn_mail-nodeNavEditMessage']++;}
            }
            }
        };
        packageCtrl.getDeleteButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt === true) {DISABLED['#cn_mail-nodeNavDeleteMessage']++;}
            }
            }
        };


        t.isCalledOnce('disableEmailActionButtons', packageCtrl);
        t.isCalledOnce('disableEmailEditButtons', packageCtrl);

        packageCtrl.onMailMessageGridDeselect();

        t.expect(DISABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(DISABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(DISABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(DISABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(DISABLED['#cn_mail-nodeNavDeleteMessage']).toBe(0);

        MAILINBOXVIEW = ACTIVETAB;

        packageCtrl.onMailMessageGridDeselect();
        t.expect(DISABLED['#cn_mail-nodeNavEditMessage']).toBe(1);
        t.expect(DISABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(DISABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(DISABLED['#cn_mail-nodeNavForward']).toBe(1);
        t.expect(DISABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);

    });

    t.it('onMailMessageGridSelect()', function(t) {
        var ENABLED = {
                '#cn_mail-nodeNavEditMessage'   : 0,
                '#cn_mail-nodeNavReplyTo'       : 0,
                '#cn_mail-nodeNavReplyAll'      : 0,
                '#cn_mail-nodeNavForward'       : 0,
                '#cn_mail-nodeNavDeleteMessage' : 0
            },
            ISDRAFT,
            //
            // Needed since disabling is usually done by the deselect listener
            //
                reset = function() {
                ENABLED = {
                    '#cn_mail-nodeNavEditMessage'   : 0,
                    '#cn_mail-nodeNavReplyTo'       : 0,
                    '#cn_mail-nodeNavReplyAll'      : 0,
                    '#cn_mail-nodeNavForward'       : 0,
                    '#cn_mail-nodeNavDeleteMessage' : 0
                };
            };
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getReplyToButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt !== true) {ENABLED['#cn_mail-nodeNavReplyTo']++;}
            }
            }
        };
        packageCtrl.getReplyAllButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt !== true) {ENABLED['#cn_mail-nodeNavReplyAll']++;}
            }
            }
        };
        packageCtrl.getForwardButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt !== true) {ENABLED['#cn_mail-nodeNavForward']++;}
            }
            }
        };
        packageCtrl.getEditButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt !== true) {ENABLED['#cn_mail-nodeNavEditMessage']++;}
            }
            }
        };
        packageCtrl.getDeleteButton = function() {
            return {setDisabled: function (doIt) {
                if (doIt !== true) {ENABLED['#cn_mail-nodeNavDeleteMessage']++;}
            }
            }
        };
        let rec = {
            get : function() {
                return ISDRAFT;
            }
        };

        t.isCalled('activateButtonsForMessageItem', packageCtrl);

        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(0);

        ISDRAFT = true;
        packageCtrl.onMailMessageGridSelect(null, rec);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);
        reset();

        ISDRAFT = false;
        packageCtrl.onMailMessageGridSelect(null, rec);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);

    });


    t.it('onReadingPaneCheckChange()', function(t) {
        var DIRECTION = null,
            menuItem1 = {getItemId : function() {return 'right'}},
            menuItem2 = {getItemId : function() {return 'bottom'}},
            menuItem3 = {getItemId : function() {return 'hide';}};

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMailInboxView = function() {
            return {
                toggleReadingPane : function(dir) {
                    DIRECTION = dir;
                }
            };
        };


        t.expect(DIRECTION).toBe(null);
        packageCtrl.onReadingPaneCheckChange(menuItem1, false);
        t.expect(DIRECTION).toBe(null);
        packageCtrl.onReadingPaneCheckChange(menuItem1, true);
        t.expect(DIRECTION).toBe('right');
        packageCtrl.onReadingPaneCheckChange(menuItem2, true);
        t.expect(DIRECTION).toBe('bottom');
        packageCtrl.onReadingPaneCheckChange(menuItem3, true);
        t.expect(DIRECTION).toBeUndefined();
    });


    t.it('onToggleListViewButtonClick()', function(t) {

        var ENABLED;

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMailMessageGrid = function() {
            return {
                enableRowPreview : function(pressed) {
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


    t.it('onToggleFolderViewButtonClick()', function(t) {

        var HIDDEN;

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMailFolderTree = function() {
            return {
                show : function() {
                    HIDDEN = false;
                },
                hide : function() {
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


    t.it('onMailMessageGridBeforeLoad() / onMailMessageGridLoad()', function(t) {

        var TOGGLEGRIDDISABLED, ISSAME_LEFT = false, ISSAME_RIGHT = false;
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        packageCtrl.getMailInboxView = function() {
            return ISSAME_LEFT;
        };
        packageCtrl.getMailDesktopView = function() {
            return {
                getLayout : function() {
                    return {
                        getActiveItem : function() {
                            return ISSAME_RIGHT;
                        }
                    }
                }
            }
        };

        packageCtrl.getToggleGridListButton = function(){
            return {
                setDisabled : function(disabled) {
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

    t.it('onMailInboxViewActivate() / onMailInboxViewDeactivate()', function(t) {

        var TOGGLEGRIDDISABLED, SWITCHREADINGPANEDISABLED,
            TOGGLEMAILFOLDERDISABLED, ISLOADING;
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        packageCtrl.getMailMessageGrid = function() {
            return {
                getStore : function() {
                    return {
                        isLoading : function() {
                            return ISLOADING;
                        }
                    }
                }
            }
        };
        packageCtrl.getSwitchReadingPaneButton = function(){
            return {
                setDisabled : function(disabled) {
                    SWITCHREADINGPANEDISABLED = disabled;
                }
            };
        };
        packageCtrl.getToggleMailFolderButton = function(){
            return {
                setDisabled : function(disabled) {
                    TOGGLEMAILFOLDERDISABLED = disabled;
                }
            };
        };

        packageCtrl.getToggleGridListButton = function(){
            return {
                setDisabled : function(disabled) {
                    TOGGLEGRIDDISABLED = disabled;
                }
            };
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

    });


    t.it("mailfolder route", function(t) {

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        let pv = {
            showInboxViewFor : function() {}
        };
        packageCtrl.getMainPackageView = function() {
            return pv;
        };

        t.isCalledNTimes('showInboxViewFor', packageCtrl.getMainPackageView(), 1);
        packageCtrl.onMailFolderRoute();

    });


    t.it("disableEmailActionButtons()", function(t){

        let ENABLED = configureButtonMockCaller();

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

        packageCtrl.disableEmailActionButtons(true);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(0);

        packageCtrl.disableEmailActionButtons(false);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(0);
    });


    t.it("disableEmailEditButtons()", function(t){

        let ENABLED = configureButtonMockCaller();

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

        packageCtrl.disableEmailEditButtons(true);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(0);

        packageCtrl.disableEmailEditButtons(false);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);

        packageCtrl.disableEmailEditButtons(false, false);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(2);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(2);

        packageCtrl.disableEmailEditButtons(true, false);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(2);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(3);

        packageCtrl.disableEmailEditButtons(false, true);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(3);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(3);
    });


    t.it("activateButtonsForMessageItem()", function(t) {

        let ENABLED = configureButtonMockCaller();

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);


        let ISDRAFT,
            rec = {
                get : function() {
                    return ISDRAFT;
                }
            };

        ISDRAFT = false;
        packageCtrl.activateButtonsForMessageItem(rec);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);

        ISDRAFT = true;
        packageCtrl.activateButtonsForMessageItem(rec);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(2);

    });


    t.it("onMailDesktopViewTabChange() - panel is MessageView", function(t) {

        let ISDRAFT,
            ENABLED = configureButtonMockCaller(),
            panel,
            activatedPanel;

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

        activatedPanel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');

        activatedPanel.getViewModel = function() {
            return {
                get : function() {
                    return {
                        get : function() {
                            return ISDRAFT;
                        }
                    }
                }
            }
        };

        ISDRAFT = false;

        packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);
    });


    t.it("onMailDesktopViewTabChange() - panel is MessageView with loading item", function(t) {

        let ISDRAFT,
            ENABLED = configureButtonMockCaller(),
            panel, rec,
            activatedPanel;

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

        activatedPanel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');

        activatedPanel.loadingItem = {};


        ISDRAFT = true;
        rec = {
            get : function() {
                return ISDRAFT;
            }
        };

        t.isCalled('onMailMessageItemLoadForActivatedView', packageCtrl);
        packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

        activatedPanel.fireEvent('cn_mail-messageitemload', activatedPanel, rec);

        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);
    });


    t.it("onMailDesktopViewTabChange() - panel is MessageView with loading item, panel switched before loading finishes", function(t) {

        let ISDRAFT,
            ENABLED = configureButtonMockCaller(),
            panel, rec,
            activatedPanel, otherPanel;

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);

        activatedPanel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');
        otherPanel = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');

        activatedPanel.loadingItem = {};

        // we add a loading item here so we can check that
        // onMailMessageItemLoadForActivatedView is never called
        otherPanel.loadingItem = {};


        ISDRAFT = false;
        rec = {
            get : function() {
                return ISDRAFT;
            }
        };

        t.isntCalled('onMailMessageItemLoadForActivatedView', packageCtrl);
        packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);
        packageCtrl.onMailDesktopViewTabChange(null, otherPanel);

        activatedPanel.fireEvent('cn_mail-messageitemload', activatedPanel, rec);

        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(0);
    });


    t.it("onMailDesktopViewTabChange() - panel is MailInboxView with selection", function(t) {

        let ENABLED = configureButtonMockCaller(),
            panel,
            ISDRAFT = false,
            rec = {
                get : function() {
                    return ISDRAFT;
                }
            },
            activatedPanel = {

            };

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        packageCtrl.getMailInboxView = function() {
            return activatedPanel;
        };

        packageCtrl.getMailMessageGrid = function() {
            return {
                getSelection : function() {
                    return [
                        rec
                    ];
                }
            }
        };

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);


        packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);
    });


    t.it("onMailDesktopViewTabChange() - panel is MailInboxView with no selection", function(t) {

        let ENABLED = configureButtonMockCaller(),
            panel,
            ISDRAFT = false,
            rec = {
                get : function() {
                    return ISDRAFT;
                }
            },
            activatedPanel = {

            };

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        packageCtrl.getMailInboxView = function() {
            return activatedPanel;
        };

        packageCtrl.getMailMessageGrid = function() {
            return {
                getSelection : function() {
                    return [];
                }
            }
        };

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);
        packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(0);
    });


    t.it("onMailDesktopViewTabChange() - panel is MessageEditor", function(t) {

        let ENABLED = configureButtonMockCaller(),
            panel,
            activatedPanel = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
                messageDraft : {
                    id : '1'
                }
            });

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);
        packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(1);
    });


    t.it("onMailDesktopViewTabChange() - no familiar panel", function(t) {

        let ENABLED = configureButtonMockCaller(),
            panel,
            activatedPanel = Ext.create('Ext.Panel');

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        configurePackageCtrlWithButtonMocks(packageCtrl, ENABLED);
        packageCtrl.onMailDesktopViewTabChange(null, activatedPanel);

        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavDeleteMessage']).toBe(0);
    });


    t.it("onEditMessageButtonClick() - active tab is MessageView", function(t) {

        t.it("message edit buttons", function(t) {

            packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

            let activeTab = null, ID = null,
                COMPOUNDKEY = MessageEntityCompoundKey.createFor(
                    1, 2, 3), SETKEY = null;

            packageCtrl.getMailDesktopView = function() {
                return {
                    getActiveTab : function() {
                        return activeTab;
                    }
                }
            };

            packageCtrl.getMainPackageView = function() {
                return {
                    showMailEditor : function(key) {
                        SETKEY = key;
                    }
                }
            };

            activeTab = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');
            activeTab.getMessageItem = function() {
                return {
                    getCompoundKey : function() {
                        return COMPOUNDKEY;
                    }
                }
            };
            packageCtrl.getMailInboxView = function() {
                return activeTab;
            };

            t.isCalledOnce('getCompoundKeyFromGridOrMessageView', packageCtrl);

            t.expect(SETKEY).toBe(null);
            packageCtrl.onMessageEditButtonClick();
            t.expect(SETKEY).toBe(COMPOUNDKEY);

        });
    });


    t.it("onReplyToButtonClick() - active tab is MessageView", function(t) {

        t.it("message edit buttons", function(t) {

            packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

            let activeTab = null, KEY = null,
                SETKEY = MessageEntityCompoundKey.createFor(1, 2, 3);

            packageCtrl.getMailDesktopView = function() {
                return {
                    getActiveTab : function() {
                        return activeTab;
                    }
                }
            };

            packageCtrl.getMainPackageView = function() {
                return {
                    showMailEditor : function(key) {
                        KEY = key;
                    }
                }
            };

            activeTab = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');
            activeTab.getMessageItem = function() {
                return {
                    getCompoundKey : function() {
                        return SETKEY;
                    }
                }
            };
            packageCtrl.getMailInboxView = function() {
                return activeTab;
            };

            t.isCalledOnce('getCompoundKeyFromGridOrMessageView', packageCtrl);

            t.expect(KEY).toBe(null);
            packageCtrl.onReplyToButtonClick();
            t.expect(KEY).toBe(SETKEY);

        });
    });


    t.it("onReplyAllButtonClick() - active tab is MessageView", function(t) {

        t.it("message edit buttons", function(t) {

            packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

            let activeTab = null, KEY = null,
                SETKEY = MessageEntityCompoundKey.createFor(1, 2, 3);

            packageCtrl.getMailDesktopView = function() {
                return {
                    getActiveTab : function() {
                        return activeTab;
                    }
                }
            };

            packageCtrl.getMainPackageView = function() {
                return {
                    showMailEditor : function(id) {
                        KEY = id;
                    }
                }
            };

            activeTab = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');
            activeTab.getMessageItem = function() {
                return {
                    getCompoundKey : function() {
                        return SETKEY;
                    }
                }
            };
            packageCtrl.getMailInboxView = function() {
                return activeTab;
            };

            t.isCalledOnce('getCompoundKeyFromGridOrMessageView', packageCtrl);

            t.expect(KEY).toBe(null);
            packageCtrl.onReplyAllButtonClick();
            t.expect(KEY).toBe(SETKEY);

        });
    });


    t.it("onForwardButtonClick() - active tab is MessageView", function(t) {

        t.it("message edit buttons", function(t) {

            packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

            let activeTab = null, KEY = null,
                SETKEY = MessageEntityCompoundKey.createFor(1, 2, 3);

            packageCtrl.getMailDesktopView = function() {
                return {
                    getActiveTab : function() {
                        return activeTab;
                    }
                }
            };

            packageCtrl.getMainPackageView = function() {
                return {
                    showMailEditor : function(id) {
                        KEY = id;
                    }
                }
            };

            activeTab = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');
            activeTab.getMessageItem = function() {
                return {
                    getCompoundKey : function() {
                        return SETKEY;
                    }
                }
            };
            packageCtrl.getMailInboxView = function() {
                return activeTab;
            };

            t.isCalledOnce('getCompoundKeyFromGridOrMessageView', packageCtrl);

            t.expect(KEY).toBe(null);
            packageCtrl.onForwardButtonClick();
            t.expect(KEY).toBe(SETKEY);

        });
    });


    t.it("getItemOrDraftFromActiveView()", function(t) {

        let ACTIVETAB = "", MAILINBOXVIEW = "";

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        packageCtrl.getMailDesktopView = function() {
            return {
                getActiveTab : function() {
                    return ACTIVETAB;
                }
            }
        };

        packageCtrl.getMailInboxView = function() {
            return 3;
        };

        packageCtrl.getMailMessageGrid = function() {
            return {
                getSelection : function() {
                    return [4];
                }
            };
        };

        ACTIVETAB = Ext.create('conjoon.cn_mail.view.mail.message.editor.MessageEditor', {
            messageDraft : 1
        });
        ACTIVETAB.getMessageDraft = function() { return 1};
        t.expect(packageCtrl.getItemOrDraftFromActiveView()).toBe(1);

        ACTIVETAB = Ext.create('conjoon.cn_mail.view.mail.message.reader.MessageView');
        ACTIVETAB.getMessageItem = function() { return 2};
        t.expect(packageCtrl.getItemOrDraftFromActiveView()).toBe(2);

        ACTIVETAB = 3;
        t.expect(packageCtrl.getItemOrDraftFromActiveView()).toBe(4);

        ACTIVETAB = 4;
        t.expect(packageCtrl.getItemOrDraftFromActiveView()).toBe(null);
    });


    t.it("app-cn_mail#69", function(t) {

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        let REPLYALLROUTE = 0;

        packageCtrl.onBeforePackageRoute = function() {
            let action = arguments[arguments.length - 1];
            action.resume();
        };

        packageCtrl.onReplyAllRoute = function() {
            REPLYALLROUTE++;
        }


        t.expect(REPLYALLROUTE).toBe(0);
        Ext.util.History.add('cn_mail/message/replyAll/foo/test/bar');

        t.waitForMs(750, function() {

            t.expect(REPLYALLROUTE).toBe(1);

        });

    });


    t.it("app-cn_mail#79", function(t) {

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');

        let ck = packageCtrl.createCompoundKeyFromUrlFragments('a%20b', 'foo', 'ba%20r');

        t.expect(ck.toLocalId()).toBe('a b-foo-ba r')

        packageCtrl.showMailEditor = Ext.emptyFn;

        t.isCalledNTimes('createCompoundKeyFromUrlFragments', packageCtrl, 4);

        packageCtrl.onEditMessageRoute('a', 'b', 'c');
        packageCtrl.onReplyToRoute('a', 'b', 'c');
        packageCtrl.onReplyAllRoute('a', 'b', 'c');
        packageCtrl.onForwardRoute('a', 'b', 'c');

    });


});});
