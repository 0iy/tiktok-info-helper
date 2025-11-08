// ==UserScript==
// @name         TikTok Info Helper
// @namespace    https://github.com/0iy/tiktok-info-helper
// @version      1.0
// @description  A simple script to fetch all TikTok session data, including HttpOnly cookies (requires Tampermonkey Beta).
// @author       0iy
// @match        *://www.tiktok.com/*
// @grant        GM_cookie
// @run-at       document-idle
// @license      MIT
// @supportURL   https://github.com/0iy/tiktok-info-helper/issues
// @homepageURL  https://github.com/0iy/tiktok-info-helper
// ==/UserScript==

(function() {
    'use strict';

    /**
     * A simple, prefixed logger to make console output readable and distinct.
     */
    const Logger = {
        prefix: '[TikTok Info Helper]',
        log: (...args) => console.log(Logger.prefix, ...args),
        info: (...args) => console.info(Logger.prefix, ...args),
        warn: (...args) => console.warn(Logger.prefix, ...args),
        error: (...args) => console.error(Logger.prefix, ...args),
    };

    /**
     * Main module for extracting TikTok information.
     */
    const TikTokInfoExtractor = {
        /**
         * The main function exposed to the user.
         */
        getInfo: async function() {
            Logger.log('Function ttGetInfos() called. Starting autonomous data extraction...');

            try {
                await this.utils.waitForPageReady();
                const info = await this.utils.extractAllInfo();

                Logger.info("--- TikTok Session Information ---");

                // Critical check for sessionid, which requires HttpOnly access.
                if (!info.session_cookies.sessionid) {
                    Logger.error("CRITICAL: 'sessionid' (an HttpOnly cookie) could not be found.");
                    Logger.warn("This usually means you are NOT using Tampermonkey BETA. The stable version cannot access HttpOnly cookies.");
                    Logger.warn("Please install the BETA version from https://www.tampermonkey.net and try again.");
                } else {
                    Logger.log("%c✅ Successfully retrieved all information, including HttpOnly cookies.", "color: #00FF00; font-weight: bold;");
                }

                console.log(JSON.stringify(info, null, 2));

            } catch (error) {
                Logger.error('An unexpected error occurred:', error);
            }
        },

        /**
         * A collection of utility functions.
         */
        utils: {
            /**
             * Polls the DOM until the universal data object is available.
             */
            waitForPageReady: () => {
                const MAX_ATTEMPTS = 20; // 10 seconds
                const POLL_INTERVAL = 500;
                return new Promise((resolve, reject) => {
                    let attempts = 0;
                    const intervalId = setInterval(() => {
                        attempts++;
                        const userData = TikTokInfoExtractor.utils.getUserDataFromDOM();
                        if (userData && userData.uid) {
                            Logger.info(`User data found in DOM after ${attempts} attempt(s). Page is ready.`);
                            clearInterval(intervalId);
                            resolve();
                        } else if (attempts >= MAX_ATTEMPTS) {
                            clearInterval(intervalId);
                            reject(new Error('Timed out waiting for user data. Please ensure you are logged in and the page has fully loaded.'));
                        }
                    }, POLL_INTERVAL);
                });
            },

            /**
             * Promisified wrapper for GM_cookie.list to fetch a single cookie.
             */
            fetchCookie: (name) => {
                return new Promise((resolve) => {
                    // Note: GM_cookie requires Tampermonkey Beta to access httpOnly cookies.
                    GM_cookie.list({ name: name, domain: "tiktok.com" }, (cookies, error) => {
                        if (error || !cookies || cookies.length === 0) {
                            resolve(null);
                        } else {
                            resolve(cookies[0]);
                        }
                    });
                });
            },

            /**
             * Gathers all data points into a single object.
             */
            extractAllInfo: async () => {
                const info = {
                    sec_uid: null,
                    username: "Not Found",
                    ms_token: null,
                    session_cookies: {
                        sessionid: null,
                        ttwid: null,
                        tt_csrf_token: null,
                        sid_tt: null
                    }
                };

                const userData = TikTokInfoExtractor.utils.getUserDataFromDOM();
                if (userData) {
                    info.username = userData.uniqueId || "Not Found";
                    info.sec_uid = userData.secUid || null;
                }

                const cookieNames = ['msToken', 'sessionid', 'ttwid', 'tt_csrf_token', 'sid_tt'];
                const cookiePromises = cookieNames.map(name => TikTokInfoExtractor.utils.fetchCookie(name));
                const results = await Promise.all(cookiePromises);

                const cookieMap = {};
                results.forEach(cookie => {
                    if (cookie) {
                        cookieMap[cookie.name] = cookie.value;
                    }
                });

                info.ms_token = cookieMap.msToken || null;
                info.session_cookies.sessionid = cookieMap.sessionid || null;
                info.session_cookies.ttwid = cookieMap.ttwid || null;
                info.session_cookies.tt_csrf_token = cookieMap.tt_csrf_token || null;
                info.session_cookies.sid_tt = cookieMap.sid_tt || null;

                return info;
            },

            /**
             * Safely parses the __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON object.
             */
            getUserDataFromDOM: () => {
                try {
                    const el = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
                    if (!el) return null;
                    const data = JSON.parse(el.textContent);
                    return data?.__DEFAULT_SCOPE__?.['webapp.app-context']?.user || null;
                } catch (e) {
                    return null;
                }
            }
        }
    };

    // Expose the main function to the window object for console access.
    if (typeof unsafeWindow !== 'undefined') {
        unsafeWindow.ttGetInfos = TikTokInfoExtractor.getInfo.bind(TikTokInfoExtractor);
    } else {
        window.ttGetInfos = TikTokInfoExtractor.getInfo.bind(TikTokInfoExtractor);
    }

    Logger.info('TikTok Info Helper (v1.0) loaded. Type "ttGetInfos()" in the console to fetch your session data.');

})();