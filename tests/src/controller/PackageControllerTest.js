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


    t.it("onComposeMessageRoute()", function(t) {

        var SHOWN   = 0,
            CN_HREF = 'foo';

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMainPackageView = function() {
            return {
                getActiveTab : function() {
                    return {
                        cn_href : CN_HREF
                    };
                },
                showMailEditor : function() {
                    SHOWN++;
                }
            }
        };

        t.expect(SHOWN).toBe(0);
        packageCtrl.onComposeMessageRoute();
        t.expect(SHOWN).toBe(1);
        packageCtrl.onComposeMessageRoute();
        t.expect(SHOWN).toBe(2);

        packageCtrl.onComposeMessageRoute();
        t.expect(SHOWN).toBe(3);
        packageCtrl.onComposeMessageRoute();
        t.expect(SHOWN).toBe(4);

    });


    t.it("onMessageComposeButtonClick()", function(t) {

        var SHOWN = 0;

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMainPackageView = function() {
            return {
                showMailEditor : function() {
                    SHOWN++;
                }
            }
        };

        t.expect(SHOWN).toBe(0);
        packageCtrl.onMessageComposeButtonClick();
        t.expect(SHOWN).toBe(1);
        packageCtrl.onMessageComposeButtonClick();
        t.expect(SHOWN).toBe(2);
        packageCtrl.onMessageComposeButtonClick();
        t.expect(SHOWN).toBe(3);
    });


    t.it("onEditMessageRoute()", function(t) {

        var SHOWN   = 0,
            CN_HREF = 'foo';

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getMainPackageView = function() {
            return {
                getActiveTab : function() {
                    return {
                        cn_href : CN_HREF
                    };
                },
                showMailEditor : function() {
                    SHOWN++;
                }
            }
        };

        t.expect(SHOWN).toBe(0);
        packageCtrl.onEditMessageRoute();
        t.expect(SHOWN).toBe(1);
        packageCtrl.onEditMessageRoute();
        t.expect(SHOWN).toBe(2);

        packageCtrl.onEditMessageRoute();
        t.expect(SHOWN).toBe(3);
        packageCtrl.onEditMessageRoute();
        t.expect(SHOWN).toBe(4);
    });


    t.it("onMessageEditButtonClick()", function(t) {
        var SHOWN = 0;

        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
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
        packageCtrl.getMainPackageView = function() {
            return {
                showMailEditor : function() {
                    SHOWN++;
                }
            }
        };

        t.expect(SHOWN).toBe(0);
        packageCtrl.onMessageEditButtonClick();
        t.expect(SHOWN).toBe(1);
        packageCtrl.onMessageEditButtonClick();
        t.expect(SHOWN).toBe(2);
        packageCtrl.onMessageEditButtonClick();
        t.expect(SHOWN).toBe(3);
    });


    t.it('onMailFolderTreeSelectionChange()', function(t) {

        var DESELECTED = 0, exc, e;
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
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

        t.expect(DESELECTED).toBe(0);
        packageCtrl.onMailFolderTreeSelectionChange(null, [1]);
        t.expect(DESELECTED).toBe(1);

    });


    t.it('onMailMessageGridDeselect()', function(t) {
        var DISABLED = 0;
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getNavigationToolbar = function() {
            return {
                down : function(id) {
                    if (id === '#cn_mail-nodeNavEditMessage') {
                        return {
                            setDisabled : function(doIt) {
                                if (doIt === true) {
                                    DISABLED++;
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


        t.expect(DISABLED).toBe(0);
        packageCtrl.onMailMessageGridDeselect();
        t.expect(DISABLED).toBe(1);

    });

    t.it('onMailMessageGridSelect()', function(t) {
        var ENABLED = 0;
        packageCtrl = Ext.create('conjoon.cn_mail.controller.PackageController');
        packageCtrl.getNavigationToolbar = function() {
            return {
                down : function(id) {
                    if (id === '#cn_mail-nodeNavEditMessage') {
                        return {
                            setDisabled : function(doIt) {
                                if (doIt === false) {
                                    ENABLED++;
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
                                return 'DRAFT';
                            }
                            return null;
                        }
                    }]

                }
            };

        }

        t.expect(ENABLED).toBe(0);
        packageCtrl.onMailMessageGridSelect();
        t.expect(ENABLED).toBe(1);

    });


});
