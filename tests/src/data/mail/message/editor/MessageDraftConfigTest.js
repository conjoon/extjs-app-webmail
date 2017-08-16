/**
 * conjoon
 * (c) 2007-2017 conjoon.org
 * licensing@conjoon.org
 *
 * app-cn_mail
 * Copyright (C) 2017 Thorsten Suckow-Homberg/conjoon.org
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

describe('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfigTest', function(t) {


    t.it("constructor()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        t.expect(config.getTo()).toBeUndefined();
        t.expect(config.getCc()).toBeUndefined();
        t.expect(config.getBcc()).toBeUndefined();
        t.expect(config.getSubject()).toBeUndefined();
        t.expect(config.getTextPlain()).toBeUndefined();
        t.expect(config.getTextHtml()).toBeUndefined();
        t.expect(config.getAttachments()).toBeUndefined();
    });


    t.it("applyAddressFactory()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });

        var tests = [{
            args     : [[{name : 'Peter', address : 'name@domain.tld'}], 'to'],
            expected : [{
                name    : 'Peter',
                address : 'name@domain.tld'
            }]
        }, {
            args     : ['name@domain.tld', 'to'],
            expected : [{
                name    : 'name@domain.tld',
                address : 'name@domain.tld'
            }]
        }, {
            args     : [['name@domain.tld'], 'cc'],
            expected : [{
                name    : 'name@domain.tld',
                address : 'name@domain.tld'
            }]
        }, {
            args     : [['name@domain.tld', 'somename@somedomain.tld'], 'bcc'],
            expected : [{
                name    : 'name@domain.tld',
                address : 'name@domain.tld'
            }, {
                name    : 'somename@somedomain.tld',
                address : 'somename@somedomain.tld'
            }]
        }, {
            args     : ['name@domain.tld', 'to'],
            expected : 'Exception'
        }, {
            args     : ['name@domain.tld', 'cc'],
            expected : 'Exception'
        }, {
            args     : ['name@domain.tld', 'bcc'],
            expected : 'Exception'
        }], test, exc, e, tCount = 0;

        for (var i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            if (test.expected == 'Exception') {
                continue;
            }
            t.expect(
                config.applyAddressFactory.apply(config, test.args)
            ).toEqual(
                test.expected
            );
            tCount++;
        }

        t.expect(tCount).toBe(4);

        config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
            to  : 'name.to@domain.tld',
            cc  : 'name.cc@domain.tld',
            bcc : 'name.bcc@domain.tld'
        });

        var excCount = 0;
        for (var i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            exc = e = undefined;
            if (test.expected == 'Exception') {
                try{
                    config.applyAddressFactory.apply(config, test.args);
                } catch(e){
                    exc = e;
                }
                t.expect(exc).toBeDefined();
                t.expect(exc.msg).toContain("is immutable");
                excCount++;
            }
        }

        t.expect(excCount).toBe(3);

    });

    t.it("applyTo()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        t.isCalledOnce('applyAddressFactory', config);
        t.isArray(config.applyTo('name@domain.tld'));
    });


    t.it("applyCc()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        t.isCalledOnce('applyAddressFactory', config)
        t.isArray(config.applyCc('name@domain.tld'));
    });


    t.it("applyBcc()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        t.isCalledOnce('applyAddressFactory', config)
        t.isArray(config.applyBcc('name@domain.tld'));
    });


    t.it("applyAttachments()", function(t) {
        var config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });

        var attachments = [{
            type           : 'TYPE1',
            text           : 'TEXT1',
            size           : 1111,
            sourceId       : '51',
            previewImgSrc  : 'PREVIEWIMGSRC1',
            downloadImgUrl : 'DOWNLOADIMGURL1'
        }, {
            type           : 'TYPE12',
            text           : 'TEXT2',
            size           : 1112,
            sourceId       : '52',
            previewImgSrc  : 'PREVIEWIMGSRC2',
            downloadImgUrl : 'DOWNLOADIMGURL2'
        }];

        var result    = config.applyAttachments(attachments),
            propCount = 0;

        t.isArray(result);
        t.expect(result.length).toBe(2);

        // test properties
        for (var i = 0, len = result.length; i < len; i++) {
            propCount = 0;
            for (var prop in result[i]) {
                if (!result[i].hasOwnProperty(prop)) {
                    continue;
                }
                t.expect(result[i][prop]).toBe(attachments[i][prop]);
                propCount++;
            }
            t.expect(propCount).toBe(6);
        }

        // test references
        t.expect(result[0]['text']).toBe(attachments[0]['text']);
        attachments[0]['text'] = "NEWTEXT";
        t.expect(result[0]['text']).not.toBe(attachments[0]['text']);

        // test exceptions
        var exc, e;
        config.setAttachments([]);
        try{config.applyAttachments([]);}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("is immutable");

        exc = e = undefined;
        var config2 = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig', {
        });
        try{config2.applyAttachments('foo');}catch(e){exc = e;}
        t.expect(exc).toBeDefined();
        t.expect(exc.msg).toContain("must be an array");
    });


    t.it("toObject()", function(t) {

        var config,
            tests = [{
                args : {
                    to  : 'name.to@domain.tld',
                    cc  : 'name.cc@domain.tld',
                    bcc : 'name.bcc@domain.tld'
                },
                expected : {
                    to  : [{name : 'name.to@domain.tld',  address : 'name.to@domain.tld'}],
                    cc  : [{name : 'name.cc@domain.tld',  address : 'name.cc@domain.tld'}],
                    bcc : [{name : 'name.bcc@domain.tld', address : 'name.bcc@domain.tld'}]
                }
            }, {
                args : {
                    textHtml  : 'foo',
                    textPlain : 'bar'
                },
                expected : {
                    messageBody : {
                        textHtml  : 'foo',
                        textPlain : 'bar'
                    }
                }
            }, {
                args : {
                    subject : 'foobar'
                },
                expected : {
                    subject  : 'foobar'
                }
            }, {
                args : {
                    attachments : [{
                        type           : 'TYPE1',
                        text           : 'TEXT1',
                        size           : 1111,
                        sourceId       : '51',
                        previewImgSrc  : 'PREVIEWIMGSRC1',
                        downloadImgUrl : 'DOWNLOADIMGURL1'
                    }, {
                        type           : 'TYPE12',
                        text           : 'TEXT2',
                        size           : 1112,
                        sourceId       : '52',
                        previewImgSrc  : 'PREVIEWIMGSRC2',
                        downloadImgUrl : 'DOWNLOADIMGURL2'
                    }]
                },
                expected : {
                    attachments : [{
                        type           : 'TYPE1',
                        text           : 'TEXT1',
                        size           : 1111,
                        sourceId       : '51',
                        previewImgSrc  : 'PREVIEWIMGSRC1',
                        downloadImgUrl : 'DOWNLOADIMGURL1'
                    }, {
                        type           : 'TYPE12',
                        text           : 'TEXT2',
                        size           : 1112,
                        sourceId       : '52',
                        previewImgSrc  : 'PREVIEWIMGSRC2',
                        downloadImgUrl : 'DOWNLOADIMGURL2'
                    }]
                }
            }], test;

        for (var i = 0, len = tests.length; i < len; i++) {
            test = tests[i];
            config = Ext.create('conjoon.cn_mail.data.mail.message.editor.MessageDraftConfig',
                test.args
            );
            t.expect(config.toObject()).toEqual(test.expected);
        }
    });



});
