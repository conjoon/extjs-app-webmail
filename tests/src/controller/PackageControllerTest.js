/**
 * conjoon
 * (c) 2007-2016 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2016 Thorsten Suckow-Homberg/conjoon.org
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

    var packageCtrl;

    t.afterEach(function() {
        if (packageCtrl) {
            packageCtrl.destroy();
            packageCtrl = null;
        }
    });


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
        packageCtrl.getMainPackageView = function() {
            return {
                getActiveTab : function() {
                    return {
                        cn_href : CN_HREF
                    };
                },
                showMailEditor : function() {
                }
            }
        };

        t.isCalledNTimes('showMailEditor', packageCtrl, 1);
        packageCtrl.showMailEditor();
    });


    t.it("message routes", function(t) {

        var CN_HREF = 'foo';

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMainPackageView = function() {
            return {
                getActiveTab : function() {
                    return {
                        cn_href : CN_HREF
                    };
                },
                showMailEditor : function() {
                }
            }
        };

        t.isCalledNTimes('showMailEditor', packageCtrl, 6);
        packageCtrl.onComposeMessageRoute();
        packageCtrl.onEditMessageRoute();
        packageCtrl.onReplyToRoute();
        packageCtrl.onReplyAllRoute();
        packageCtrl.onForwardRoute();
        packageCtrl.onComposeMailtoMessageRoute();

    });


    t.it("message edit buttons", function(t) {

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
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
                        getId : function() {
                            return 1;
                        }
                    }]
                }
            };
        };

        t.isCalledNTimes('showMailEditor', packageCtrl, 5);
        packageCtrl.onMessageComposeButtonClick();
        packageCtrl.onMessageEditButtonClick();
        packageCtrl.onReplyToButtonClick();
        packageCtrl.onReplyAllButtonClick();
        packageCtrl.onForwardButtonClick();
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
        t.expect(DESELECTED).toBe(1);
        t.expect(READINGPANEDISABLED).toBe(false);
        t.expect(TOGGLEGRIDDISABLED).toBe(false);
        packageCtrl.onMailFolderTreeSelectionChange(null, []);
        t.expect(READINGPANEDISABLED).toBe(true);
        t.expect(TOGGLEGRIDDISABLED).toBe(true);

    });


    t.it('onMailMessageGridDeselect()', function(t) {
        var DISABLED = {
            '#cn_mail-nodeNavEditMessage' : 0,
            '#cn_mail-nodeNavReplyTo'     : 0,
            '#cn_mail-nodeNavReplyAll'    : 0,
            '#cn_mail-nodeNavForward'     : 0
        };
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getNavigationToolbar = function() {
            return {
                down : function(id) {
                    if (id === '#cn_mail-nodeNavEditMessage' ||
                        id === '#cn_mail-nodeNavReplyTo' ||
                        id === '#cn_mail-nodeNavReplyAll' ||
                        id === '#cn_mail-nodeNavForward') {
                        return {
                            setDisabled : function(doIt) {
                                if (doIt === true) {
                                    DISABLED[id]++;
                                }
                            }
                        }
                    }
                    return {
                        setDisabled : Ext.emptyFn
                    }

                }
            };
        };


        t.expect(DISABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(DISABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(DISABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(DISABLED['#cn_mail-nodeNavForward']).toBe(0);
        packageCtrl.onMailMessageGridDeselect();
        t.expect(DISABLED['#cn_mail-nodeNavEditMessage']).toBe(1);
        t.expect(DISABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(DISABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(DISABLED['#cn_mail-nodeNavForward']).toBe(1);

    });

    t.it('onMailMessageGridSelect()', function(t) {
        var ENABLED = {
            '#cn_mail-nodeNavEditMessage' : 0,
            '#cn_mail-nodeNavReplyTo'     : 0,
            '#cn_mail-nodeNavReplyAll'    : 0,
            '#cn_mail-nodeNavForward'     : 0
            },
            NODETYPE,
            /**
             * Needed since disabling is usually done by the deselect listener
             */
            reset = function() {
                ENABLED = {
                    '#cn_mail-nodeNavEditMessage' : 0,
                    '#cn_mail-nodeNavReplyTo'     : 0,
                    '#cn_mail-nodeNavReplyAll'    : 0,
                    '#cn_mail-nodeNavForward'     : 0
                };
            };
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getNavigationToolbar = function() {
            return {
                down : function(id) {
                    if (id === '#cn_mail-nodeNavEditMessage' ||
                        id === '#cn_mail-nodeNavReplyTo' ||
                        id === '#cn_mail-nodeNavReplyAll' ||
                        id === '#cn_mail-nodeNavForward') {
                        return {
                            setDisabled : function(doIt) {
                                if (doIt === false) {
                                    ENABLED[id]++;
                                }
                            }
                        }
                    }
                    return {
                        setDisabled : Ext.emptyFn
                    }

                }
            };
        };
        packageCtrl.getMailFolderTree = function() {
            return {
                getSelection : function() {

                    return [{
                        get: function(name) {
                            if (name === 'type') {
                                return NODETYPE;
                            }
                            return null;
                        }
                    }]

                }
            };
        }

        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);

        NODETYPE = "DRAFT"
        packageCtrl.onMailMessageGridSelect();
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(0);
        reset();

        NODETYPE = "SENT"
        packageCtrl.onMailMessageGridSelect();
        t.expect(ENABLED['#cn_mail-nodeNavEditMessage']).toBe(0);
        t.expect(ENABLED['#cn_mail-nodeNavReplyTo']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavReplyAll']).toBe(1);
        t.expect(ENABLED['#cn_mail-nodeNavForward']).toBe(1);

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

});
