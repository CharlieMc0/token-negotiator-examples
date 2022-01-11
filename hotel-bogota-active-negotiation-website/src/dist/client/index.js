var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { asyncHandle, requiredParams, attachPostMessageListener } from './../utils/index';
import { getChallengeSigned, validateUseEthKey, connectMetamaskAndGetAddress } from "../core/index";
import { createOverlayMarkup, createFabButton, createToken, issuerConnectTab, issuerConnectIframe } from './componentFactory';
import { tokenLookup } from './../tokenLookup';
import "./../theme/style.css";
import './../vendor/keyShape';
var Client = (function () {
    function Client(config) {
        var _this = this;
        this.eventSender = {
            emitAllTokensToClient: function (tokens) {
                _this.on("tokens", null, tokens);
            },
            emitSelectedTokensToClient: function () {
                _this.on("tokens-selected", null, { selectedTokens: window.negotiator.selectedTokens });
            },
            emitProofToClient: function (proof, issuer) {
                _this.on("token-proof", null, { proof: proof, issuer: issuer });
            }
        };
        this.eventReciever = function (event) {
            switch (event.data.evt) {
                case 'set-tab-issuer-tokens':
                    var issuer = event.data.issuer;
                    var childURL = tokenLookup[issuer].tokenOrigin;
                    var cUrl = new URL(childURL);
                    var childUrlOrigin = cUrl.origin;
                    if (event.origin != childUrlOrigin)
                        return;
                    _this.offChainTokens[issuer].tokens = event.data.tokens;
                    if (window.negotiator.issuerTabInstanceRefs[issuer]) {
                        window.negotiator.issuerTabInstanceRefs[issuer].close();
                        delete window.negotiator.issuerTabInstanceRefs[issuer];
                        _this.issuerConnected(issuer);
                    }
                    break;
                case 'set-iframe-issuer-tokens-active':
                    var issuer = event.data.issuer;
                    _this.offChainTokens[issuer].tokens = event.data.tokens;
                    _this.issuerConnected(issuer);
                    break;
                case 'proof-tab':
                    if (window.negotiator.issuerTabInstanceRefs && window.negotiator.issuerTabInstanceRefs[event.data.issuer] && !_this.iframeStorageSupport) {
                        window.negotiator.issuerTabInstanceRefs[event.data.issuer].close();
                        delete window.negotiator.issuerTabInstanceRefs[event.data.issuer];
                    }
                case 'proof-iframe':
                    _this.eventSender.emitProofToClient(event.data.proof, event.data.issuer);
                    break;
            }
        };
        var type = config.type, issuers = config.issuers, options = config.options, filter = config.filter;
        requiredParams(type, 'type is required.');
        requiredParams(issuers, 'issuers are missing.');
        this.tokenLookup = tokenLookup;
        this.type = type;
        this.options = options;
        this.filter = filter ? filter : {};
        this.issuers = issuers;
        this.offChainTokens = { tokenKeys: [] };
        this.onChainTokens = { tokenKeys: [] };
        this.selectedTokens = {};
        this.clientCallBackEvents = {};
        this.iframeStorageSupport = false;
        issuers.map(function (issuer) {
            if (tokenLookup[issuer].onChain === true) {
                _this.onChainTokens.tokenKeys.push(issuer);
                _this.onChainTokens[issuer] = { tokens: [] };
            }
            else {
                _this.offChainTokens.tokenKeys.push(issuer);
                _this.offChainTokens[issuer] = { tokens: [] };
            }
        });
        attachPostMessageListener(this.eventReciever);
    }
    Client.prototype.openIframe = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        var iframe = document.createElement('iframe');
                        iframe.src = url;
                        iframe.style.width = '1px';
                        iframe.style.height = '1px';
                        iframe.style.opacity = '0';
                        document.body.appendChild(iframe);
                        iframe.onload = function () {
                            resolve(iframe);
                        };
                    })];
            });
        });
    };
    Client.prototype.getTokensIframe = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var issuer, filter, tokensOrigin, negotiationType;
            var _this = this;
            return __generator(this, function (_a) {
                issuer = config.issuer, filter = config.filter, tokensOrigin = config.tokensOrigin, negotiationType = config.negotiationType;
                return [2, new Promise(function (resolve, reject) {
                        var listener = function (event) {
                            if (event.data.evt === 'set-iframe-issuer-tokens-passive') {
                                resolve(event.data.tokens);
                            }
                        };
                        attachPostMessageListener(listener);
                        _this.openIframe(tokensOrigin + "?action=get-iframe-issuer-tokens&type=" + negotiationType + "&filter=" + JSON.stringify(filter)).then(function (iframeRef) {
                            if (iframeRef) {
                                iframeRef.contentWindow.postMessage({
                                    evt: 'getTokens'
                                }, tokensOrigin);
                                if (!window.negotiator.issuerTabInstanceRefs) {
                                    window.negotiator.issuerTabInstanceRefs = {};
                                }
                                window.negotiator.issuerTabInstanceRefs[issuer] = iframeRef;
                            }
                        }).catch(function (error) { });
                    })];
            });
        });
    };
    Client.prototype.setPassiveNegotiationWebTokens = function (offChainTokens) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Promise.all(offChainTokens.tokenKeys.map(function (issuer) { return __awaiter(_this, void 0, void 0, function () {
                            var tokenOrigin, tokens;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tokenOrigin = tokenLookup[issuer].tokenOrigin;
                                        return [4, this.getTokensIframe({ issuer: issuer, filter: this.filter, tokensOrigin: tokenOrigin, negotiationType: 'passive' })];
                                    case 1:
                                        tokens = _a.sent();
                                        this.offChainTokens[issuer].tokens = tokens;
                                        return [2];
                                }
                            });
                        }); }))];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Client.prototype.setBlockChainTokens = function (onChainTokens) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2];
            });
        });
    };
    Client.prototype.negotiate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4, this.thirdPartyCookieSupportCheck(tokenLookup[this.offChainTokens.tokenKeys[0]].tokenOrigin)];
                    case 1:
                        _a.iframeStorageSupport = _b.sent();
                        if (!(this.type === 'active')) return [3, 2];
                        this.activeNegotiationStrategy();
                        return [3, 4];
                    case 2: return [4, this.passiveNegotiationStrategy()];
                    case 3: return [2, _b.sent()];
                    case 4: return [2];
                }
            });
        });
    };
    Client.prototype.activeNegotiationStrategy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.iframeStorageSupport) {
                    this.embedTokenConnectClientOverlayIframe();
                }
                else {
                    this.embedTokenConnectClientOverlayTab();
                }
                return [2];
            });
        });
    };
    Client.prototype.passiveNegotiationStrategy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var outputOnChain, outputOffChain;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.iframeStorageSupport) return [3, 2];
                        return [4, asyncHandle(this.setPassiveNegotiationWebTokens(this.offChainTokens))];
                    case 1:
                        _a.sent();
                        outputOnChain = this.onChainTokens;
                        delete outputOnChain.tokenKeys;
                        outputOffChain = this.offChainTokens;
                        delete outputOffChain.tokenKeys;
                        window.negotiator.eventSender.emitAllTokensToClient(__assign(__assign({}, outputOffChain), outputOnChain));
                        return [3, 3];
                    case 2:
                        console.log('Enable 3rd party cookies to use this negotiation type.');
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    Client.prototype.embedTokenConnectClientOverlayIframe = function () {
        var _this = this;
        setTimeout(function () {
            var _a, _b;
            var entryPointElement = document.querySelector(".overlay-tn");
            requiredParams(entryPointElement, 'No entry point element with the class name of .overlay-tn found.');
            if (entryPointElement) {
                entryPointElement.innerHTML += createOverlayMarkup((_b = (_a = _this.options) === null || _a === void 0 ? void 0 : _a.overlay) === null || _b === void 0 ? void 0 : _b.heading);
                entryPointElement.innerHTML += createFabButton();
                var refIssuerContainerSelector_1 = document.querySelector(".token-issuer-list-container-tn");
                refIssuerContainerSelector_1.innerHTML = "";
                _this.offChainTokens.tokenKeys.map(function (issuer) {
                    refIssuerContainerSelector_1.innerHTML += issuerConnectIframe(issuer);
                });
                _this.assignFabButtonAnimation();
                _this.addTheme();
            }
            window.tokenToggleSelection = _this.tokenToggleSelection;
            window.connectTokenIssuerWithIframe = _this.connectTokenIssuerWithIframe;
            window.navigateToTokensView = _this.navigateToTokensView;
        }, 0);
    };
    Client.prototype.embedTokenConnectClientOverlayTab = function () {
        var _this = this;
        setTimeout(function () {
            var _a, _b;
            var entryPointElement = document.querySelector(".overlay-tn");
            requiredParams(entryPointElement, 'No entry point element with the class name of .overlay-tn found.');
            if (entryPointElement) {
                entryPointElement.innerHTML += createOverlayMarkup((_b = (_a = _this.options) === null || _a === void 0 ? void 0 : _a.overlay) === null || _b === void 0 ? void 0 : _b.heading);
                entryPointElement.innerHTML += createFabButton();
                var refIssuerContainerSelector_2 = document.querySelector(".token-issuer-list-container-tn");
                refIssuerContainerSelector_2.innerHTML = "";
                _this.offChainTokens.tokenKeys.map(function (issuer) {
                    refIssuerContainerSelector_2.innerHTML += issuerConnectTab(issuer);
                });
                _this.assignFabButtonAnimation();
                _this.addTheme();
            }
            window.tokenToggleSelection = _this.tokenToggleSelection;
            window.connectTokenIssuerWithTab = _this.connectTokenIssuerWithTab;
            window.navigateToTokensView = _this.navigateToTokensView;
        }, 0);
    };
    Client.prototype.embedIframeClientOverlay = function () {
        var _this = this;
        var _a, _b;
        var _index = 0;
        var element = document.querySelector(".overlay-tn");
        requiredParams(element, 'No overlay element found.');
        if (element) {
            element.innerHTML += createOverlayMarkup((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.overlay) === null || _b === void 0 ? void 0 : _b.heading);
            element.innerHTML += createFabButton();
            var refTokenContainerSelector_1 = document.querySelector(".token-container-tn");
            this.offChainTokens.tokenKeys.map(function (issuer) {
                var i = _this.offChainTokens[issuer];
                if (i.tokens.length) {
                    refTokenContainerSelector_1.innerHTML = "";
                    i.tokens.map(function (t) {
                        var _a = tokenLookup[issuer], title = _a.title, emblem = _a.emblem;
                        refTokenContainerSelector_1.innerHTML += createToken({
                            data: t,
                            tokenIssuerKey: issuer,
                            index: _index,
                            title: title,
                            emblem: emblem
                        });
                        _index++;
                    });
                }
            });
            this.assignFabButtonAnimation();
            this.addTheme();
        }
        window.tokenToggleSelection = this.tokenToggleSelection;
    };
    Client.prototype.addTheme = function () {
        var _a, _b, _c, _d;
        var refTokenSelector = document.querySelector(".overlay-tn");
        refTokenSelector.classList.add(((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.overlay) === null || _b === void 0 ? void 0 : _b.theme) ? (_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.overlay) === null || _d === void 0 ? void 0 : _d.theme : 'light');
    };
    Client.prototype.assignFabButtonAnimation = function () {
        if (window.KeyshapeJS) {
            window.KeyshapeJS.globalPause();
            window.KeyshapeJS.animate("#svg-tn-left", [{ p: 'mpath', t: [0, 400], v: ['0%', '100%'], e: [[1, 0, 0, .6, 1], [0]], mp: "M13,28.5L27.1,28.1" }, { p: 'rotate', t: [0, 400], v: [0, 0], e: [[1, 0, 0, .6, 1], [0]] }, { p: 'scaleX', t: [0, 400], v: [1, 1], e: [[1, 0, 0, .6, 1], [0]] }, { p: 'scaleY', t: [0, 400], v: [1, 1], e: [[1, 0, 0, .6, 1], [0]] }, { p: 'anchorX', t: [0, 400], v: [-13, -17.1], e: [[1, 0, 0, .6, 1], [0]] }, { p: 'anchorY', t: [0, 400], v: [-13.5, -17.1], e: [[1, 0, 0, .6, 1], [0]] }, { p: 'd', t: [0, 400], v: ["path('M25.5,26C25.5,26,20.5,26,20.5,26C20.5,23.1,19.9,20.4,18.8,17.9C17.8,15.6,16.4,13.6,14.6,11.8C12.7,9.9,10.3,8.4,7.8,7.4C5.5,6.5,3,6,.5,6L.5,1C.5,1,.5,1,.5,1C.5,1,7.5,1,7.5,1L25.5,1L25.5,7.2C25.5,7.2,25.5,12.8,25.5,12.8C25.5,12.8,25.5,19,25.5,19Z')", "path('M31.8,32.8C31.5,33.2,30.9,33.4,30.4,33.4C29.9,33.4,29.4,33.2,29,32.8C29,32.8,1.4,5.2,1.4,5.2C1,4.8,.8,4.3,.8,3.8C.8,3.3,1,2.8,1.4,2.4L2.4,1.4C2.7,1,3.3,.8,3.8,.8C4.3,.8,4.8,1,5.2,1.4L5.2,1.4L32.8,29C33.2,29.4,33.4,29.9,33.4,30.4C33.4,30.9,33.2,31.5,32.8,31.8Z')"], e: [[1, 0, 0, .6, 1], [0]] }], "#svg-tn-right", [{ p: 'mpath', t: [0, 400], v: ['0%', '100%'], e: [[1, 0, 0, .6, 1], [0]], mp: "M41.5,28.7L27.1,28.1" }, { p: 'rotate', t: [0, 400], v: [0, 0], e: [[1, 0, 0, .6, 1], [0]] }, { p: 'anchorX', t: [0, 400], v: [-40.5, -17.1], e: [[1, 0, 0, .6, 1], [0]] }, { p: 'anchorY', t: [0, 400], v: [-13.5, -17.1], e: [[1, 0, 0, .6, 1], [0]] }, { p: 'd', t: [0, 400], v: ["path('M53,1C53,1,53,1,53,1C53,1,53,12.9,53,12.9L53,19C53,19,53,26,53,26C53,26,40.2,26,40.2,26L34.1,26C34.1,26,28,26,28,26C28,26,28,12.6,28,12.6L28,7.4C28,7.4,28,1,28,1C28,1,40.6,1,40.6,1C40.6,1,45.9,1,45.9,1Z')", "path('M29,1.4C29.4,1,29.9,.8,30.4,.8C30.9,.8,31.5,1,31.8,1.4L32.8,2.4C33.2,2.7,33.4,3.3,33.4,3.8C33.4,4.3,33.2,4.8,32.8,5.2L5.2,32.8C4.8,33.2,4.3,33.4,3.8,33.4C3.3,33.4,2.8,33.2,2.4,32.8L1.4,31.8C1,31.5,.8,30.9,.8,30.4C.8,29.9,1,29.4,1.4,29C1.4,29,29,1.4,29,1.4Z')"], e: [[1, 0, 0, .6, 1], [0]] }], { autoremove: false }).range(0, 400);
        }
    };
    Client.prototype.openOverlay = function (openOverlay) {
        var element = document.querySelector(".overlay-tn");
        requiredParams(element, 'No overlay element found.');
        element.classList.toggle("open");
        if (openOverlay) {
            element.classList.add("open");
            window.KeyshapeJS.timelines()[0].time(0);
            window.KeyshapeJS.globalPlay();
        }
        else {
            element.classList.remove("open");
            window.KeyshapeJS.timelines()[0].time(0);
            window.KeyshapeJS.globalPause();
        }
    };
    Client.prototype.overlayClickHandler = function () {
        var element = document.querySelector(".overlay-tn");
        requiredParams(element, 'No overlay element found.');
        var isOpen = element.classList.contains("open");
        element.classList.toggle("open");
        if (!isOpen) {
            this.openOverlay(true);
        }
        else {
            this.openOverlay(false);
        }
    };
    Client.prototype.issuerConnected = function (issuer) {
        var connectBtn = document.querySelector("[data-issuer*=\"" + issuer + "\"] .connect-btn-tn");
        var tokenBtn = document.querySelector("[data-issuer*=\"" + issuer + "\"] .tokens-btn-tn");
        connectBtn.style.display = "none";
        connectBtn.setAttribute('aria-hidden', true);
        tokenBtn.style.display = "block";
        tokenBtn.innerHTML = "View Tokens (" + this.offChainTokens[issuer].tokens.length + ")";
        tokenBtn.setAttribute('aria-hidden', false);
    };
    Client.prototype.navigateToTokensView = function (event) {
        var issuer = event.target.dataset.issuer;
        window.negotiator.embedTokensIntoView(issuer);
        window.negotiator.showTokenView(issuer);
    };
    Client.prototype.embedTokensIntoView = function (issuer) {
        var refTokenContainerSelector = document.getElementsByClassName("token-view-tn")[0];
        if (!issuer) {
            refTokenContainerSelector.style.display = 'none';
            return;
        }
        ;
        refTokenContainerSelector.style.display = 'block';
        refTokenContainerSelector.scrollTo(0, 0);
        var refTokenContainerSelector = document.getElementsByClassName("token-list-container-tn")[0];
        refTokenContainerSelector.innerHTML = "";
        var config = window.negotiator.tokenLookup[issuer];
        var location = config.onChain ? 'onChainTokens' : 'offChainTokens';
        document.getElementsByClassName("headline-tn token-name")[0].innerHTML = config.title;
        window.negotiator[location][issuer].tokens.map(function (t, i) {
            var _a;
            var _b = tokenLookup[issuer], title = _b.title, emblem = _b.emblem;
            var isSelected = false;
            (_a = window.negotiator.selectedTokens[issuer]) === null || _a === void 0 ? void 0 : _a.tokens.map(function (st, si) {
                if (t.toString() === st.toString())
                    isSelected = true;
            });
            refTokenContainerSelector.innerHTML += createToken({
                data: t,
                tokenIssuerKey: issuer,
                index: i,
                title: title,
                emblem: emblem,
                toggleState: isSelected
            });
        });
    };
    Client.prototype.showTokenView = function (issuer) {
        var element = document.getElementsByClassName("overlay-content-tn")[0];
        element.classList.toggle("open");
        if (issuer) {
            var connectBtn = document.querySelector("[data-issuer*=\"" + issuer + "\"] .connect-btn-tn");
            var tokenBtn = document.querySelector("[data-issuer*=\"" + issuer + "\"] .tokens-btn-tn");
            connectBtn.setAttribute('aria-expanded', true);
            tokenBtn.setAttribute('aria-expanded', true);
        }
        else {
            var connectBtns = document.querySelectorAll(".connect-btn-tn");
            var tokenBtns = document.querySelectorAll(".tokens-btn-tn");
            connectBtns.forEach(function (userItem) {
                userItem.setAttribute('aria-expanded', false);
            });
            tokenBtns.forEach(function (userItem) {
                userItem.setAttribute('aria-expanded', false);
            });
        }
    };
    Client.prototype.connectTokenIssuerWithIframe = function (event) {
        var issuer = event.currentTarget.dataset.issuer;
        var filter = window.negotiator.filter ? window.negotiator.filter : {};
        var tokensOrigin = window.negotiator.tokenLookup[issuer].tokenOrigin;
        window.negotiator.getTokensIframe({ issuer: issuer, filter: filter, tokensOrigin: tokensOrigin, negotiationType: 'active' });
    };
    Client.prototype.connectTokenIssuerWithTab = function (event) {
        var issuer = event.target.dataset.issuer;
        var filter = window.negotiator.filter ? JSON.stringify(window.negotiator.filter) : '{}';
        var tabRef = window.open(tokenLookup[issuer].tokenOrigin + "?action=get-tab-issuer-tokens&filter=" + filter, "win1", "left=0,top=0,width=320,height=320");
        if (!window.negotiator.issuerTabInstanceRefs) {
            window.negotiator.issuerTabInstanceRefs = {};
        }
        window.negotiator.issuerTabInstanceRefs[issuer] = tabRef;
    };
    Client.prototype.tokenToggleSelection = function () {
        window.negotiator.selectedTokens = {};
        document.querySelectorAll('.token-tn .mobileToggle-tn').forEach(function (token, index) {
            if (index === 0) {
                window.negotiator.selectedTokens[token.dataset.key] = {};
                window.negotiator.selectedTokens[token.dataset.key]['tokens'] = [];
            }
            if (token.checked === true) {
                var output = JSON.parse(token.dataset.token);
                window.negotiator.selectedTokens[token.dataset.key].tokens.push(output);
            }
        });
        window.negotiator.eventSender.emitSelectedTokensToClient();
    };
    Client.prototype.authenticate = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var issuer, unsignedToken, addressMatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        issuer = config.issuer, unsignedToken = config.unsignedToken;
                        requiredParams((issuer && unsignedToken), { status: false, useEthKey: null, proof: null });
                        return [4, this.checkPublicAddressMatch(issuer, unsignedToken)];
                    case 1:
                        addressMatch = _a.sent();
                        if (!addressMatch) {
                            return [2];
                        }
                        if (!(this.iframeStorageSupport === true)) return [3, 3];
                        return [4, this.getTokenProofIframe(issuer, unsignedToken)];
                    case 2:
                        _a.sent();
                        return [3, 4];
                    case 3:
                        this.getTokenProofTab(issuer, unsignedToken);
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    Client.prototype.checkPublicAddressMatch = function (issuer, unsignedToken) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, unEndPoint, onChain, useEthKey, attestedAddress, walletAddress, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = tokenLookup[issuer], unEndPoint = _a.unEndPoint, onChain = _a.onChain;
                        if (onChain === true || !unsignedToken || !unEndPoint)
                            return [2, { status: false, useEthKey: null, proof: null }];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4, getChallengeSigned(tokenLookup[issuer])];
                    case 2:
                        useEthKey = _b.sent();
                        return [4, validateUseEthKey(unEndPoint, useEthKey)];
                    case 3:
                        attestedAddress = _b.sent();
                        return [4, connectMetamaskAndGetAddress()];
                    case 4:
                        walletAddress = _b.sent();
                        if (walletAddress.toLowerCase() !== attestedAddress.toLowerCase())
                            throw new Error('useEthKey validation failed.');
                        return [2, true];
                    case 5:
                        e_1 = _b.sent();
                        requiredParams(null, "Could not authenticate token");
                        return [3, 6];
                    case 6: return [2];
                }
            });
        });
    };
    Client.prototype.getTokenProofIframe = function (issuer, unsignedToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        var iframe = document.createElement('iframe');
                        iframe.src = tokenLookup[issuer].tokenOrigin + "?action=get-token-proof&token=" + JSON.stringify(unsignedToken) + "&issuer=" + issuer + "&type=iframe";
                        iframe.style.width = '1px';
                        iframe.style.height = '1px';
                        iframe.style.opacity = '0';
                        document.body.appendChild(iframe);
                        iframe.onload = function () {
                            resolve(true);
                        };
                    })];
            });
        });
    };
    Client.prototype.getTokenProofTab = function (issuer, unsignedToken) {
        return __awaiter(this, void 0, void 0, function () {
            var tabRef;
            return __generator(this, function (_a) {
                tabRef = window.open(tokenLookup[issuer].tokenOrigin + "?action=get-token-proof&token=" + JSON.stringify(unsignedToken) + "&issuer=" + issuer + "&type=tab", "win1", "left=0,top=0,width=" + window.innerWidth + ",height=" + window.innerHeight);
                if (!window.negotiator.issuerTabInstanceRefs) {
                    window.negotiator.issuerTabInstanceRefs = {};
                }
                window.negotiator.issuerTabInstanceRefs[issuer] = tabRef;
                return [2];
            });
        });
    };
    Client.prototype.addTokenThroughTab = function (magicLink) {
        var tab = window.open(magicLink, "win1", "left=0,top=0,width=320,height=320");
        setTimeout(function () {
            tab === null || tab === void 0 ? void 0 : tab.close();
        }, 2500);
    };
    Client.prototype.addTokenThroughIframe = function (magicLink) {
        this.openIframe(magicLink);
    };
    Client.prototype.thirdPartyCookieSupportCheck = function (tokensOrigin) {
        return __awaiter(this, void 0, void 0, function () {
            var iframe;
            return __generator(this, function (_a) {
                iframe = document.createElement('iframe');
                iframe.src = tokensOrigin + '?action=cookie-support-check';
                iframe.style.width = '1px';
                iframe.style.height = '1px';
                iframe.style.opacity = '0';
                document.body.appendChild(iframe);
                return [2, new Promise(function (resolve) {
                        var listener = function (event) {
                            if (event.data.evt === 'cookie-support-check') {
                                resolve(event.data.thirdPartyCookies ? true : false);
                            }
                            setTimeout(function () {
                                resolve(false);
                            }, 10000);
                        };
                        attachPostMessageListener(listener);
                    })];
            });
        });
    };
    Client.prototype.on = function (type, callback, data) {
        requiredParams(type, "Event type is not defined");
        if (callback) {
            this.clientCallBackEvents[type] = callback;
        }
        else {
            if (this.clientCallBackEvents[type]) {
                return this.clientCallBackEvents[type].call(type, data);
            }
        }
    };
    return Client;
}());
export { Client };
//# sourceMappingURL=index.js.map