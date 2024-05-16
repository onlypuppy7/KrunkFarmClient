// ==UserScript==
// @name         Krunker Aimbot and ESP: KrunkFarm Client V1 - Wireframe & More
// @description  Fed up of dysfunctional scripts with 5 minutes of ads and trackers?
// @author       onlypuppy7, StateFarm Network
// @namespace    http://github.com/onlypuppy7/KrunkFarmClient/
// @supportURL   http://github.com/onlypuppy7/KrunkFarmClient/issues/
// @license      GPL-3.0
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_info
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @icon         https://raw.githubusercontent.com/onlypuppy7/KrunkFarmClient/main/krunkfarm-icon-384px.png

// @require      https://cdn.jsdelivr.net/npm/tweakpane@3.1.10/dist/tweakpane.min.js
// @require      https://unpkg.com/three@0.150.0/build/three.min.js

// version naming:
    //1.#.#-pre[number] for development versions, increment for every commit (not full release) note: please increment it
    //1.#.#-release for release (in the unlikely event that happens)
// this ensures that each version of the script is counted as different

// @version      1.0.0

// @match        *://krunker.io/*
// @match        *://browserfps.com/*
// @downloadURL  https://update.greasyfork.org/scripts/482982/StateFarm%20Client%20V3%20-%20Combat%2C%20Bloom%2C%20ESP%2C%20Rendering%2C%20Chat%2C%20Automation%2C%20Botting%2C%20Unbanning%20and%20more.user.js
// @updateURL    https://update.greasyfork.org/scripts/482982/StateFarm%20Client%20V3%20-%20Combat%2C%20Bloom%2C%20ESP%2C%20Rendering%2C%20Chat%2C%20Automation%2C%20Botting%2C%20Unbanning%20and%20more.meta.js
// ==/UserScript==

// {{CRACKEDSHELL}}
// require:"https://cdn.jsdelivr.net/npm/tweakpane@3.1.10/dist/tweakpane.min.js"
// require:"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"
// require:"https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js"
// {{!CRACKEDSHELL}}

let attemptedInjection = false;
console.log("StateFarm: running (before function)");

(function () {
    console.log("KrunkFarm: running (after function)");
    //script info
    const name = "KrunkFarm Client";
    const version = typeof (GM_info) !== 'undefined' ? GM_info.script.version : "3";
    const menuTitle = name + " v" + version;
    //INIT WEBSITE LINKS: store them here so they are easy to maintain and update!
    const discordURL = "https://dsc.gg/sfnetwork";
    const githubURL = "https://github.com/onlypuppy7/KrunkFarmClient";
    const featuresGuideURL = "https://github.com/onlypuppy7/KrunkFarmClient/tree/main?tab=readme-ov-file#-features";
    const violentmonkeyURL = "https://violentmonkey.github.io/get-it/";

    const sfChatURL = "https://raw.githack.com/OakSwingZZZ/StateFarmChatFiles/main/index.html";

    //startup sequence
    const startUp = function () {
        F.log("StateFarm: mainLoop()");
        mainLoop();
        document.addEventListener("DOMContentLoaded", function () {
            onContentLoaded();
            F.log("StateFarm: DOMContentLoaded, ran onContentLoaded");
        });
    };
    //INIT VARS
    let ss = {}; //game vars
    let L = {}; //libraries
    L.THREE = THREE;
    delete unsafeWindow.THREE; //hide from global scope, idk if it even was but eh
    const tp = {}; // <-- tp = tweakpane
    const F = { //stuff that gets deleted for some reason
        log: console.log,
        window: window,
        push: Array.prototype.push,
        requestAnimationFrame: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { return setTimeout(callback, 1000 / 60); },
        mod: (e,t) => {var i=e%t;return i>=0?i:i+t},
    };

    const inbuiltPresets = {
    };
    const presetStorageLocation = "KrunkFarmUserPresets";
    let hudElementPositions = {};
    let sfChatIframe;
    let sfChatContainer;
    let sfChatUsername;
    let presetIgnore = ['sfChatUsername', 'otherSettingYouMightWantNotToBeExported'];
    const storageKey = "KrunkFarm_" + (unsafeWindow.document.location.host.replaceAll(".", "")) + "_";
    F.log("Save key:", storageKey);
    let binding = false;
    let targetingComplete = false;
    const allModules = [];
    const allFolders = [];
    const isKeyToggled = {};
    let ESPArray = [];
    let bindsArray = {};
    // blank variables
    let msgElement, menuInitiated, resetModules, startUpComplete, coordElement, playerstatsElement, crosshairsPosition;
    let scrambledMsgEl, newGame, playerLookingAt, ranEverySecond, currentlyTargeting, ranOneTime, configMain;

    let isLeftButtonDown = false;
    let isRightButtonDown = false;
    const monitorObjects = {};

    const getScrambled = () => Array.from({ length: 10 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

    //menu interaction functions
    //menu extraction
    const extract = function (variable, shouldUpdate) {
        if (shouldUpdate) { updateConfig() };
        return configMain[variable];
    };
    const extractDropdownList = function (variable) {
        return tp[variable + "Button"].controller_.binding.value.constraint_.constraints[0].options;
    };
    const extractAsDropdownInt = function (variable) {
        const options = extractDropdownList(variable);
        const state = extract(variable);
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === state) {
                return i;
            };
        };
    };

    const beginBinding = function (value) {
        if (binding == false) {
            binding = value;
            tp[binding + "BindButton"].title = "PRESS KEY";
        };
    };
    //one day i should make this unshit. dom is not the correct way to go about this.
    //unfortunately tweakpane is a pain in the ass and has barely anything for actually extracting/changing vars
    //a way it could be done is export preset => change value => import preset
    //but doesnt account for it being a button... and dropdowns wouldnt switch properly too. laziness. the problem is that this works fine.
    //suppose i could always just log the type of module and refer to it later. you can also get the parent object from the tp object, that would save iterating over everything.
    const change = function (module, newValue) { //its important to note that every module must have a unique name (the title of the module, NOT the storeAs)
        const labels = document.querySelectorAll('.tp-lblv_l');
        const moduleButton = module + "Button";
        const moduleLabel = tp[moduleButton].label;
        for (const label of labels) {
            if (label.textContent.includes(moduleLabel)) {
                const inputContainer = label.nextElementSibling;
                const currentValue = extract(module);
                // check for checkbox
                const checkbox = inputContainer.querySelector('.tp-ckbv_i');
                if (checkbox) {
                    if (newValue == undefined) {
                        newValue = (!currentValue);
                    };
                    if (newValue !== (!!currentValue)) {
                        checkbox.click(); // Toggle checkbox
                    };
                    F.log(module, "checkbox", currentValue, newValue);
                    return extract(module, true);
                };
                // check for button
                const button = inputContainer.querySelector('.tp-btnv_b');
                if (button) {
                    button.click(); // Trigger button click
                    F.log(module, "button", currentValue, newValue);
                    return ("NOMSG"); //no change of state, dont show pop up message
                };
                // check for dropdown
                const dropdown = inputContainer.querySelector('.tp-lstv_s');
                if (dropdown) {
                    if (newValue == undefined) { //if youre going to set a list to a certain value, use the int value of the list item
                        newValue = (dropdown.selectedIndex + 1) % dropdown.options.length;
                    };
                    dropdown.selectedIndex = newValue;
                    dropdown.dispatchEvent(new Event('change')); // trigger change event for dropdown
                    F.log(module, "dropdown", currentValue, newValue);
                    return extract(module, true);
                };
                // check for text input
                const textInput = inputContainer.querySelector('.tp-txtv_i');
                if (textInput) {
                    textInput.value = newValue;
                    textInput.dispatchEvent(new Event('change')); // trigger change event for dropdown
                    return extract(module, true);
                };
            };
        };
    };
    document.addEventListener('pointerdown', function (event) {
        F.log(isRightButtonDown, event.button, event);
        if (event.button === 2) {
            isRightButtonDown = true; F.log(1);
        } else if (event.button === 0) {
            isLeftButtonDown = true;
        };
    });
    document.addEventListener('pointerup', function (event) {
        F.log(event.button, event);
        if (isRightButtonDown, event.button === 2) {
            isRightButtonDown = false; F.log(2);
        } else if (event.button === 0) {
            isLeftButtonDown = false;
        };
    });
    //menu
    document.addEventListener("keydown", function (event) {
        event = (event.code.replace("Key", ""));
        isKeyToggled[event] = true;
        if (event == "Escape") { noPointerPause = false; unsafeWindow.document.onpointerlockchange() };
    });
    document.addEventListener("keyup", function (event) {
        event = (event.code.replace("Key", ""));
        isKeyToggled[event] = false;
        if (document.activeElement && document.activeElement.tagName === 'INPUT') {
            return;
        } else if (binding != false) {
            if (event == "Delete") { event = "Set Bind" };
            tp[binding + "BindButton"].title = event;
            bindsArray[binding] = event;
            save(binding + "Bind", event);
            createPopup("Binded " + tp[binding + "Button"].label + " to key: " + event);
            binding = false;
        } else {
            Object.keys(bindsArray).forEach(function (module) {
                if ((bindsArray[module] == event) && module != "zoom") {
                    let state = change(module)
                    let popupText = state
                    if (state != "NOMSG") {
                        if (state === true || state === false || state === undefined) { state = (state ? "ON" : "OFF") };
                        popupText = "Set " + module + " to: " + state;
                        if (extract("announcer")) {
                            sendChatMessage("I just set " + module + " to " + state + "!");
                        };
                    } else {
                        switch (module) {
                            case ("hide"):
                                popupText = "Toggled StateFarm Panel"; break;
                            case ("sfChatShowHide"):
                                popupText = "Toggled SFC Chat"; break;
                            case ("panic"):
                                popupText = "Exiting to set URL..."; break;
                        };
                    };
                    createPopup(popupText);
                };
            });
        };
    });
    const initTabs = function (tab, guideData) {
        tp[tab.storeAs] = tab.location.addTab({
            pages: [
                { title: 'Modules' },
                { title: 'Binds' },
                { title: 'Guide' },
            ],
        });
        if (guideData) {
            const thePages = [];
            guideData.forEach(aPage => {
                thePages.push({ title: aPage.title });
            });
            tp[tab.storeAs + "Guide"] = tp[tab.storeAs].pages[2].addTab({ pages: thePages }); //is there a one liner for this? uhhh probabyl
            //tp[tab.storeAs + "Guide"] = tab.location.addTab({ thePages: guideData.map(page => ({ title: page.title })) });
            for (let i = 0; i < guideData.length; i++) {
                const storeAs = tab.storeAs + "Guide" + i;
                const text = (guideData[i].content || "Not set up correctly lmao");
                initModule({ location: tp[tab.storeAs + "Guide"].pages[i], storeAs: storeAs, monitor: (text.split('\n').length + 0.25), });
                monitorObjects[storeAs] = text;
                const infoElement = tp[storeAs + "Button"].controller_.view.element.children[1].children[0];
                infoElement.style.width = "270px";
                infoElement.style.setProperty("margin-left", "-110px", "important");
            };
        };
    };
    const initFolder = function (folder) {
        tp[folder.storeAs] = folder.location.addFolder({
            title: folder.title,
            expanded: load(folder.storeAs) !== null ? load(folder.storeAs) : false
        });
        allFolders.push(folder.storeAs);
    };
    const initModule = function (module) {
        if (module.requirements) {

        };

        const value = {};
        value[module.storeAs] = (module.defaultValue !== undefined ? module.defaultValue : false);

        tp[module.storeAs + "TiedModules"] = {
            showConditions: (module.showConditions || false),
            hideConditions: (module.hideConditions || false),
            enableConditions: (module.enableConditions || false),
            disableConditions: (module.disableConditions || false), //why have disable when there is already enable? enable acts like an AND operator, whereas having conditions for the opposite allows for an OR operation. it is messy, but hey it works lmao?
        };

        if (!(module.slider && module.slider.step)) { module.slider = {} };
        const config = {
            label: module.title,
            options: module.dropdown,
            min: module.slider.min,
            max: module.slider.max,
            step: module.slider.step,
            title: module.button,
        };
        if (module.button) {
            tp[(module.storeAs + "Button")] = module.location.addButton({
                label: module.title,
                title: module.button,
            }).on("click", (value) => {
                if (module.clickFunction !== undefined) { module.clickFunction(value) };
            });
        } else if (module.monitor) {
            monitorObjects[module.storeAs] = "Text Goes Here";
            tp[(module.storeAs + "Button")] = module.location.addMonitor(monitorObjects, module.storeAs, {
                label: '',
                expanded: true,
                multiline: true,
                lineCount: module.monitor,
            });
            setInterval(() => {
                tp[(module.storeAs + "Button")].refresh();
            }, 1000);
        } else {
            tp[module.storeAs + "Button"] = module.location.addInput(value, module.storeAs, config
            ).on("change", (value) => {
                if (module.changeFunction !== undefined) { module.changeFunction(value) };
                setTimeout(() => {
                    if (startUpComplete) {
                    };
                    updateHiddenAndDisabled();
                    saveConfig();
                }, 150);
            });
        };
        allModules.push(module.storeAs);
        if (module.bindLocation) { initBind(module) };
    };
    const initBind = function (module) {
        if (resetModules) { remove(module.storeAs + "Bind") };
        const theBind = (load(module.storeAs + "Bind") || module.defaultBind || "Set Bind");
        tp[(module.storeAs + "BindButton")] = module.bindLocation.addButton({
            label: module.title,
            title: theBind,
        }).on("click", (value) => {
            beginBinding(module.storeAs);
        });
        bindsArray[module.storeAs] = theBind;
    };
    const initMenu = function (reset) {
        //INIT MENU
        //init tp.mainPanel

        resetModules = reset;
        menuInitiated = false;

        if (tp.mainPanel) { tp.mainPanel.dispose() };

        tp.mainPanel = new Tweakpane.Pane(); // eslint-disable-line
        tp.mainPanel.title = menuTitle;
        //SFC CHAT
        initFolder({ location: tp.mainPanel, title: "StateFarm Chat", storeAs: "sfChatFolder", });
        initTabs({ location: tp.sfChatFolder, storeAs: "sfChatTab" }, [
            {
                title: "WIP", content:
`Sorry! No guide yet!`},
        ]);
            initModule({ location: tp.sfChatTab.pages[0], title: "Username", storeAs: "sfChatUsername", defaultValue: ("Guest" + (Math.floor(Math.random() * 8999) + 1000)), });
            tp.sfChatTab.pages[0].addSeparator();
            initModule({
                location: tp.sfChatTab.pages[0], title: "Show/Hide", storeAs: "sfChatShowHide", button: "Show/Hide", bindLocation: tp.sfChatTab.pages[1], defaultBind: "K", clickFunction: function () {
                    if (sfChatContainer != undefined) {
                        if (sfChatContainer.style.display == "none") {
                            sfChatContainer.style.display = "block";
                        } else {
                            sfChatContainer.style.display = "none";
                        };
                    } else {
                        startStateFarmChat(); //its just easier this way imo
                    };
                },
            });
            tp.sfChatTab.pages[0].addSeparator();
            initModule({ location: tp.sfChatTab.pages[0], title: "Notifications", storeAs: "sfChatNotifications", bindLocation: tp.sfChatTab.pages[1], });
            initModule({ location: tp.sfChatTab.pages[0], title: "Auto Start Chat", storeAs: "sfChatAutoStart", bindLocation: tp.sfChatTab.pages[1], });
        //COMBAT MODULES
        initFolder({ location: tp.mainPanel, title: "Combat", storeAs: "combatFolder", });
        initTabs({ location: tp.combatFolder, storeAs: "combatTab" }, [
            {
                title: "WIP", content:
`Sorry! No guide yet!`},
        ]);
            initModule({ location: tp.combatTab.pages[0], title: "Aimbot", storeAs: "aimbot", bindLocation: tp.combatTab.pages[1], defaultBind: "V", });
            initFolder({ location: tp.combatTab.pages[0], title: "Aimbot Options", storeAs: "aimbotFolder", });
                initModule({ location: tp.aimbotFolder, title: "TargetMode", storeAs: "aimbotTargetMode", bindLocation: tp.combatTab.pages[1], defaultBind: "T", dropdown: [{ text: "Pointing At", value: "pointingat" }, { text: "Nearest", value: "nearest" }], defaultValue: "pointingat", enableConditions: [["aimbot", true]], });
                tp.aimbotFolder.addSeparator();
                initModule({ location: tp.aimbotFolder, title: "ToggleRM", storeAs: "aimbotRightClick", bindLocation: tp.combatTab.pages[1], enableConditions: [["aimbot", true]], });
                tp.aimbotFolder.addSeparator();
                initModule({ location: tp.aimbotFolder, title: "AntiSwitch", storeAs: "antiSwitch", bindLocation: tp.combatTab.pages[1], enableConditions: [["aimbot", true]], });
                initModule({ location: tp.aimbotFolder, title: "1 Kill", storeAs: "oneKill", bindLocation: tp.combatTab.pages[1], enableConditions: [["aimbot", true]], });
                tp.aimbotFolder.addSeparator();
                initModule({ location: tp.aimbotFolder, title: "MinAngle", storeAs: "aimbotMinAngle", slider: { min: 0.05, max: 360, step: 1 }, defaultValue: 360, enableConditions: [["aimbot", true]], });
                initModule({ location: tp.aimbotFolder, title: "AntiSnap", storeAs: "aimbotAntiSnap", slider: { min: 0, max: 0.99, step: 0.01 }, defaultValue: 0, enableConditions: [["aimbot", true]], });
                tp.aimbotFolder.addSeparator();
                initModule({ location: tp.aimbotFolder, title: "ESPColor", storeAs: "aimbotColor", defaultValue: "#0000ff", enableConditions: [["aimbot", true]] });
        //RENDER MODULES
        initFolder({ location: tp.mainPanel, title: "Render", storeAs: "renderFolder", });
        initTabs({ location: tp.renderFolder, storeAs: "renderTab" }, [
            {
                title: "WIP", content:
`Sorry! No guide yet!`},
        ]);
            initModule({ location: tp.renderTab.pages[0], title: "PlayerESP", storeAs: "playerESP", bindLocation: tp.renderTab.pages[1], });
            initModule({ location: tp.renderTab.pages[0], title: "Tracers", storeAs: "tracers", bindLocation: tp.renderTab.pages[1], });
            tp.renderTab.pages[0].addSeparator();
            initFolder({ location: tp.renderTab.pages[0], title: "Player ESP/Tracers Options", storeAs: "tracersFolder", });
                initModule({ location: tp.tracersFolder, title: "Type", storeAs: "tracersType", bindLocation: tp.renderTab.pages[1], dropdown: [{ text: "Static", value: "static" }, { text: "Proximity", value: "proximity" }], defaultValue: "static", disableConditions: [["tracers", false], ["playerESP", false]], });
                initModule({ location: tp.tracersFolder, title: "Color 1", storeAs: "tracersColor1", defaultValue: "#ff0000", disableConditions: [["tracers", false], ["playerESP", false]], });
                initModule({ location: tp.tracersFolder, title: "Color 2", storeAs: "tracersColor2", defaultValue: "#00ff00", disableConditions: [["tracers", false], ["playerESP", false]], hideConditions: [["tracersType", "static"]], });
                initModule({ location: tp.tracersFolder, title: "Color 3", storeAs: "tracersColor3", defaultValue: "#ffffff", disableConditions: [["tracers", false], ["playerESP", false]], showConditions: [["tracersType", "proximity"]], });
                initModule({ location: tp.tracersFolder, title: "Dist 1->2", storeAs: "tracersColor1to2", slider: { min: 0, max: 30, step: 0.25 }, defaultValue: 5, showConditions: [["tracersType", "proximity"]], disableConditions: [["tracers", false], ["playerESP", false]], });
                initModule({ location: tp.tracersFolder, title: "Dist 2->3", storeAs: "tracersColor2to3", slider: { min: 0, max: 30, step: 0.25 }, defaultValue: 15, showConditions: [["tracersType", "proximity"]], disableConditions: [["tracers", false], ["playerESP", false]], });
            tp.renderTab.pages[0].addSeparator();
            initModule({ location: tp.renderTab.pages[0], title: "Wireframe", storeAs: "wireframe", bindLocation: tp.renderTab.pages[1], });
        //HUD MODULES
        initFolder({ location: tp.mainPanel, title: "HUD", storeAs: "hudFolder", });
        initTabs({ location: tp.hudFolder, storeAs: "hudTab" }, [
            {
                title: "WIP", content:
`Sorry! No guide yet!`},
        ]);
            initModule({ location: tp.hudTab.pages[0], title: "Co-ords", storeAs: "showCoordinates", bindLocation: tp.hudTab.pages[1], });
            initModule({ location: tp.hudTab.pages[0], title: "HP Display", storeAs: "playerStats", bindLocation: tp.hudTab.pages[1], });
            // initModule({ location: tp.hudTab.pages[0], title: "PlayerInfo", storeAs: "playerInfo", bindLocation: tp.hudTab.pages[1], });
            // initModule({ location: tp.hudTab.pages[0], title: "GameInfo", storeAs: "gameInfo", bindLocation: tp.hudTab.pages[1], });
        //THEMING MODULES
        initFolder({ location: tp.mainPanel, title: "Theming", storeAs: "themingFolder", });
        initTabs({ location: tp.themingFolder, storeAs: "themingTab" }, [
            {
                title: "WIP", content:
`Sorry! No guide yet!`},
        ]);
            initModule({ location: tp.themingTab.pages[0], title: "Client Theme", storeAs: "themeType", bindLocation: tp.themingTab.pages[1], dropdown: [
                {text: "Default", value: "defaultTheme"},
                {text: "Iceberg", value: "icebergTheme"},
                {text: "Jet Black", value: "jetblackTheme"},
                {text: "Light", value: "lightTheme"},
                {text: "Retro", value: "retroTheme"},
                {text: "Translucent", value: "translucentTheme"},
                {text: "StateFarmer", value: "statefarmerTheme"},
                {text: "Blurple", value: "blurpleTheme"},
                {text: "ShellFarm", value: "shellFarmTheme"},
            ], defaultValue: "defaultTheme", changeFunction: function(value) {
                applyTheme(value.value);
            }});
        //MISC MODULES
        initFolder({ location: tp.mainPanel, title: "Misc", storeAs: "miscFolder", });
        initTabs({ location: tp.miscFolder, storeAs: "miscTab" }, [
            {
                title: "WIP", content:
`Sorry! No guide yet!`},
        ]);
            initModule({ location: tp.miscTab.pages[0], title: "Custom Macro", storeAs: "customMacro", defaultValue: "F.log('cool');" });
            initModule({ location: tp.miscTab.pages[0], title: "Execute Macro", storeAs: "executeMacro", bindLocation: tp.miscTab.pages[1], button: "EXECUTE", clickFunction: function(){
                //use at your own risk, i guess. but is this really any more dangerous than pasting something into console? not really.
                (async () => {
                    try {
                        F.log(extract("customMacro"));
                        // stay safe out there. this runs in the **userscript** environment. make sure to use unsafeWindow for whatever reason you may need the window object.
                        await eval(extract("customMacro")); // eslint-disable-line
                    } catch (error) {
                        console.error("Error executing code:", error);
                    }
                })();
            },}); //but yes, as you can see "macros" are just scripts you can execute for whatever purposes you need. reminds me of userscripts...
            initModule({ location: tp.miscTab.pages[0], title: "Do At Startup", storeAs: "autoMacro", bindLocation: tp.miscTab.pages[1],});
            tp.miscTab.pages[0].addSeparator();
            initFolder({ location: tp.miscTab.pages[0], title: "Seizure Options", storeAs: "seizureFolder", });
                initModule({ location: tp.seizureFolder, title: "SeizureX", storeAs: "enableSeizureX", bindLocation: tp.miscTab.pages[1], });
                initModule({ location: tp.seizureFolder, title: "X Amount", storeAs: "amountSeizureX", slider: { min: -6.283185307179586, max: 6.283185307179586, step: Math.PI / 280 }, defaultValue: 2, });
                initModule({ location: tp.seizureFolder, title: "SeizureY", storeAs: "enableSeizureY", bindLocation: tp.miscTab.pages[1], });
                initModule({ location: tp.seizureFolder, title: "Y Amount", storeAs: "amountSeizureY", slider: { min: -6.283185307179586, max: 6.283185307179586, step: Math.PI / 280 }, defaultValue: 2, });
        //CLIENT MODULES
        initFolder({ location: tp.mainPanel, title: "Client & About", storeAs: "clientFolder", });
        initTabs({ location: tp.clientFolder, storeAs: "clientTab" }, [
            {
                title: "WIP", content:
`Sorry! No guide yet!`},
        ]);
            initModule({ location: tp.clientTab.pages[0], title: "Hide GUI", storeAs: "hide", bindLocation: tp.clientTab.pages[1], button: "Hide!", clickFunction: function () { tp.mainPanel.hidden = !tp.mainPanel.hidden }, defaultBind: "H", });
            initModule({ location: tp.clientTab.pages[0], title: "Hide at Startup", storeAs: "hideAtStartup", bindLocation: tp.clientTab.pages[1], defaultValue: false,});
            initModule({ location: tp.clientTab.pages[0], title: "Pop-ups", storeAs: "popups", bindLocation: tp.clientTab.pages[1], defaultValue: true, });
            tp.clientTab.pages[0].addSeparator();
            initModule({ location: tp.clientTab.pages[0], title: "Panic", storeAs: "panic", bindLocation: tp.clientTab.pages[1], button: "EXIT!", clickFunction: function () { if (extract("enablePanic")) { unsafeWindow.location.replace(extract("panicURL")) } }, defaultBind: "X", enableConditions: [["enablePanic", true]], });
            initFolder({ location: tp.clientTab.pages[0], title: "Panic Options", storeAs: "panicFolder", });
                initModule({ location: tp.panicFolder, title: "Enable", storeAs: "enablePanic", bindLocation: tp.clientTab.pages[1], defaultValue: true, });
                initModule({ location: tp.panicFolder, title: "Set URL", storeAs: "panicURL", defaultValue: "https://classroom.google.com/", enableConditions: [["enablePanic", true]], });
            tp.clientTab.pages[0].addSeparator();
            let presetList = [];
            Object.entries(inbuiltPresets).forEach(([key, value]) => {//Get all presets from inbuilt presets var
                let options = {};
                options.text = key;//not the best way to add things to a dictionary, but the only way i could get to work
                options.value = key; // idiot could've not violated eslint smfh
                presetList.push(options);
            });
            //PRESETS: OakSwingZZZ 😎
            initFolder({ location: tp.clientTab.pages[0], title: "Presets", storeAs: "presetFolder",});
                initModule({ location: tp.presetFolder, title: "Preset List", storeAs: "selectedPreset", defaultValue: "onlypuppy7's Config", bindLocation: tp.clientTab.pages[1], dropdown: presetList, });
                initModule({ location: tp.presetFolder, title: "Apply", storeAs: "applyPreset", button: "Apply Preset", clickFunction: function () {
                    const userConfirmed = confirm( "Are you sure you want to continue? This will replace most of your current config." );
                        if (userConfirmed) { applySettings(inbuiltPresets[extract("selectedPreset")], true); };
                    },
                });
                tp.presetFolder.addSeparator();
                initModule({ location: tp.presetFolder, title: "Save", storeAs: "savePreset", button: "Save As Preset", clickFunction: function () {
                    // F.log("Config Main: ", configMain);
                    let saveString = '';
                    const addParam = function(module,setTo) {saveString=saveString+module+">"+JSON.stringify(setTo)+"<"};
                    Object.entries(configMain).forEach(([key, value]) => {
                        F.log(key, value);
                        if (typeof(value) == 'string') {
                            try {
                                let dropdown = extractAsDropdownInt(key)
                                value = dropdown;
                            } catch (error) {
                                //dont care lmaoooo
                            };
                        };
                        if (!presetIgnore.includes(key)){
                            addParam(key, value);
                        }
                    });
                    saveString = saveString.substring(0, saveString.length - 1);
                    let presetName = prompt("Name of preset:"); // asks user for name of preset
                    if (presetName == "" || presetName == null) {
                        F.log("User cancelled save");
                    } else {
                        let result = saveUserPreset(presetName, saveString);//saves user preset
                        addUserPresets(loadUserPresets()); //updates inbuiltPresets to include
                        F.log("Saved Preset: ", saveString);
                        F.log("User Preset Result: ", result);
                    };
                    F.log("InbuiltPrests:");
                    F.log(inbuiltPresets);
                    initMenu(false); //Reloads menu to add to dropdown list
                },});
                initModule({ location: tp.presetFolder, title: "Delete", storeAs: "deletePreset", button: "Remove Preset", clickFunction: function () { // Function won't do anything if they select a preset that was loaded in the gamecode
                    let currUserPresets = loadUserPresets(); //gets current presets from storage
                    delete currUserPresets[extract("selectedPreset")];//deletes
                    delete inbuiltPresets[extract("selectedPreset")];//deletes
                    save(presetStorageLocation, currUserPresets); // saves cnages to file.
                    F.log("Current User Presets: ",currUserPresets);
                    initMenu(false); //reloads menu
                },});
                tp.presetFolder.addSeparator();
                initModule({ location: tp.presetFolder, title: "Import", storeAs: "importPreset", button: "Import Preset", clickFunction: function () {
                    let preset = prompt("Paste preset here:"); // asks user to paste preset
                    if (preset == "" || preset == null) {
                        F.log("User cancelled save");
                    } else {
                        const pattern = /([a-zA-Z]*>[^<]*<)+[a-zA-Z]*>[^<]*/;
                        if (pattern.test(preset)){
                            let presetName = prompt("Name of preset:"); // asks user for name of preset
                            if (presetName == "" || presetName == null) {
                                F.log("User cancelled save");
                            } else {
                                let result = saveUserPreset(presetName, preset);//saves user preset
                                addUserPresets(loadUserPresets()); //updates inbuiltPresets to include
                                F.log("Saved Preset: ", preset);
                                F.log("User Preset Result: ", result);
                            }
                        } else {
                            alert("Not A Valid Preset!");
                            F.log("Preset Not Valid");
                        };
                        initMenu(false);
                    };
                },});
                initModule({ location: tp.presetFolder, title: "Export", storeAs: "exportPreset", button: "Copy To Clipboard", clickFunction: function () {
                    let saveString = '';
                    const addParam = function(module,setTo) {saveString=saveString+module+">"+JSON.stringify(setTo)+"<"};
                    Object.entries(configMain).forEach(([key, value]) => {
                        F.log(key, value);
                        if (typeof(value) == 'string') {
                            try {
                                let dropdown = extractAsDropdownInt(key)
                                value = dropdown;
                            } catch (error) {
                                //dont care lmaoooo
                            };
                        };
                        if (!presetIgnore.includes(key)){
                            addParam(key, value);
                        }
                    });
                    saveString = saveString.substring(0, saveString.length - 1);
                    GM_setClipboard(saveString, "text", () => F.log("Clipboard set!"));
                    createPopup("Preset copied to clipboard...");
                },});
            tp.clientTab.pages[0].addSeparator();
            initFolder({ location: tp.clientTab.pages[0], title: "Creator's Links", storeAs: "linksFolder",});
                initModule({ location: tp.linksFolder, title: "Discord", storeAs: "discord", button: "Link", clickFunction: () => GM_openInTab(discordURL, { active: true }) });
                initModule({ location: tp.linksFolder, title: "GitHub", storeAs: "github", button: "Link", clickFunction: () => GM_openInTab(githubURL, { active: true }) });
            tp.clientTab.pages[0].addSeparator();
            initModule({ location: tp.clientTab.pages[0], title: "Reset", storeAs: "clear", button: "DELETE", clickFunction: function(){
                const userConfirmed=confirm("Are you sure you want to continue? This will clear all stored module states and keybinds.");
                if (userConfirmed) {
                    initMenu(true);
                    alert("Reset to defaults.");
                };
            },});
            initModule({ location: tp.clientTab.pages[0], title: "Debug", storeAs: "debug", bindLocation: tp.clientTab.pages[1], });
        tp.mainPanel.addSeparator();
        initModule({ location: tp.mainPanel, title: "Guide", storeAs: "documentation", button: "Link", clickFunction: () => GM_openInTab(featuresGuideURL, { active: true }) });

        if (!load("KrunkFarmConfigMainPanel") || reset) {
            saveConfig();
        } else {
            F.log("##############################################")
            tp.mainPanel.importPreset(load("KrunkFarmConfigMainPanel"));
        };

        updateConfig();

        menuInitiated = true;

        makeDraggable(tp.mainPanel.containerElem_);
    };
    const onContentLoaded = function () {
        F.log("StateFarm: initMenu()");
        initMenu();
        F.log("StateFarm: applyStylesAddElements()");
        applyStylesAddElements(); //set font and change menu cass, and other stuff to do with the page
        const intervalId1 = setInterval(everySecond, 1000);
        const intervalId2 = setInterval(everyDecisecond, 100);
    };
    //visual functions
    const createPopup = function (text, type) {
        F.log("Creating Popup Type:", type, "With Text:", text);
        try {
            if (extract("popups")) {
                const messageContainer = document.getElementById('message-container');
                const messages = messageContainer.getElementsByClassName(scrambledMsgEl);
                if (messages.length > 5) {
                    messageContainer.removeChild(messages[0]);
                };
                const clonedMsgElement = msgElement.cloneNode(true);
                clonedMsgElement.innerText = text;
                switch (type) {
                    case ("success"):
                        clonedMsgElement.style.border = '2px solid rgba(0, 255, 0, 0.5)'; break;
                    case ("error"):
                        clonedMsgElement.style.border = '2px solid rgba(255, 0, 0, 0.5)'; break;
                };
                clonedMsgElement.style.display = 'none';
                const messageOffset = (messages.length + 1) * 50;
                clonedMsgElement.style.bottom = messageOffset + "px";
                void clonedMsgElement.offsetWidth;
                clonedMsgElement.style.display = '';
                messageContainer.appendChild(clonedMsgElement);
                //reorder such that newest is lowest
                for (let i = messages.length - 1; i >= 0; i--) {
                    messages[i].style.bottom = (((messages.length - i) * 50) - 40) + "px";
                };
            };
        } catch (error) {
            // Handle the error and display an error message onscreen
            console.error("An error occurred:", error);
            alert("Bollocks! If you're getting this message, injection probably failed. To solve this, perform CTRL+F5 - this performs a hard reload. If this does not work, contact the developers.");
        };
    };
    //StateFarmChat functions
    const sfChatUsernameSet = function () {
        let tagAdded = `[Krunker] ${extract("sfChatUsername")}`;
        if (sfChatUsername != tagAdded && sfChatIframe != undefined) {
            sfChatUsername = tagAdded; F.log(sfChatUsername);
            sfChatIframe.contentWindow.postMessage("SFCHAT-UPDATE" + JSON.stringify({ name: sfChatUsername }), "*");
        };
    };
    const startStateFarmChat = function (startHidden) {
        //UnsafewindowVars
        const makeChatDragable = function (element) {
            if (element.getAttribute("drag-true") != "true") {
                element.addEventListener("mousedown", function (e) {
                    let offsetX = e.clientX - parseInt(window.getComputedStyle(this).left);
                    let offsetY = e.clientY - parseInt(window.getComputedStyle(this).top);
                    function mouseMoveHandler(e) {
                        let newX = e.clientX - offsetX;
                        let newY = e.clientY - offsetY;
                        if (newX >= 0 && newX + element.getBoundingClientRect().width <= window.innerWidth) {
                            element.style.left = newX + "px";
                        }
                        if (newY >= 0 && newY + element.getBoundingClientRect().height <= window.innerHeight) {
                            element.style.top = newY + "px";
                        }
                    }

                    function reset() {
                        window.removeEventListener("mousemove", mouseMoveHandler);
                        window.removeEventListener("mouseup", reset);
                    }

                    window.addEventListener("mousemove", mouseMoveHandler);
                    window.addEventListener("mouseup", reset);
                });

                element.setAttribute("drag-true", "true");
            };
        };

        sfChatContainer = document.createElement("div");
        sfChatContainer.style.padding = "1px";
        let title = document.createElement("p");
        title.style.fontSize = "medium";
        title.style.color = "#D6D6D6";
        title.innerHTML = "StateFarm Chat";
        sfChatContainer.appendChild(title);
        sfChatContainer.style.backgroundColor = "#555";
        sfChatContainer.style.position = "absolute";
        sfChatContainer.style.borderRadius = "10px";
        sfChatContainer.style.textAlign = "center";
        sfChatContainer.style.top = "20px";
        sfChatContainer.style.left = "20px";
        sfChatContainer.style.zIndex = 100000000;
        if (startHidden){
            sfChatContainer.style.display = 'none';
        }

        const sendSettings = function () {
            let settings = GM_getValue("SFCHAT-SETTINGS");
            if (settings) {
                sfChatIframe.contentWindow.postMessage("SFCHAT-SETTINGS" + settings, "*");
            } else {
                sfChatIframe.contentWindow.postMessage("SFCHAT-SETTINGS", "*");
            };
        };

        makeChatDragable(sfChatContainer);
        sfChatIframe = document.createElement("iframe");
        sfChatIframe.setAttribute(
            "src", sfChatURL
        );
        sfChatIframe.id = "sfChat-iframe";
        sfChatIframe.setAttribute("style", "width: 600px; height:700px; z-index: 10000;");
        sfChatContainer.appendChild(sfChatIframe);
        document.getElementsByTagName("body")[0].appendChild(sfChatContainer);

        const startTimeout = setTimeout(function () {
            F.log("settings");
            sendSettings();
            let nameChange = setTimeout(function () {
                sfChatUsername = `[Krunker] ${extract("sfChatUsername")}`;
                sfChatIframe.contentWindow.postMessage("SFCHAT-UPDATE" + JSON.stringify({ name: sfChatUsername }), "*");
            }, 500);
        }, 1000);

        unsafeWindow.addEventListener("message", (e) => {
            if (typeof e.data == "string"){
                if (e.data.startsWith("SFCHAT-UPDATE")) {
                    GM_setValue("SFCHAT-SETTINGS", e.data.replace(/SFCHAT-UPDATE/gm, ""));
                }
                if (e.data.startsWith("SFCHAT-REQUEST")) {
                    sendSettings();
                };
                if (e.data.startsWith("SFCHAT-MESSAGE")) {
                    let stringMessage = e.data.replace(/SFCHAT-MESSAGE/gm, "");
                    let message = JSON.parse(stringMessage);
                    if (extract("sfChatNotifications") && message.user && message.message && (sfChatContainer.style.display == "none")){
                        if (message.message.length <= 50){
                            createPopup(message.user.name + ": " + message.message);
                        }else{
                            createPopup(message.user.name + ": " + message.message.substring(0, 50) + "...");
                        }
                    }
                }
            }
        });
    };

    const applyStylesAddElements = function (themeToApply = "null") {

        //menu customisation (apply font, button widths, adjust checkbox right slightly, make menu appear on top, add anim to message)
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @font-face {
                font-family: "Bahnschrift";
                src: url("https://db.onlinewebfonts.com/t/0a6ee448d1bd65c56f6cf256a7c6f20a.eot");
                src: url("https://db.onlinewebfonts.com/t/0a6ee448d1bd65c56f6cf256a7c6f20a.eot?#iefix")format("embedded-opentype"),
                url("https://db.onlinewebfonts.com/t/0a6ee448d1bd65c56f6cf256a7c6f20a.woff2")format("woff2"),
                url("https://db.onlinewebfonts.com/t/0a6ee448d1bd65c56f6cf256a7c6f20a.woff")format("woff"),
                url("https://db.onlinewebfonts.com/t/0a6ee448d1bd65c56f6cf256a7c6f20a.ttf")format("truetype"),
                url("https://db.onlinewebfonts.com/t/0a6ee448d1bd65c56f6cf256a7c6f20a.svg#Bahnschrift")format("svg");
            }
            .tp-dfwv, .tp-sglv_i, .tp-rotv_t, .tp-fldv_t, .tp-ckbv_l, .tp-txtv_i, .tp-lblv_l, .tp-tbiv_t, .coords, .playerstats {
                font-family: 'Bahnschrift', sans-serif !important;
                font-size: 16px;
                z-index: 9999 !important;
            }
            .tp-rotv_m, .tp-fldv_m {
                display: none;
            }
            .tp-dfwv {
                min-width: 300px;
            }
            .tp-rotv_t {
                cursor: move;
                user-select: none;
                color: #FFFFFF;
            }
            .tp-fldv_t {
                color: #FFFFFF;
            }
            .tp-tbiv_t {
                font-family: 'Bahnschrift';
                font-size: 13px;
            }
            .tp-lblv_v, .tp-lstv, .tp-btnv_b, .tp-btnv_t {
                font-family: 'Bahnschrift';
                font-size: 12px;
            }
            .tp-mllv {
                font-family: 'Bahnschrift';
                font-size: 12px;
                letter-spacing: -1px;
                width: 290px;
                margin-left: -130px !important;
            }
            .tp-mllv_i::-webkit-scrollbar-thumb {
                background-color: #888; /* Adjust the color as needed */
                border: 2px solid #555; /* Change the color of the border and adjust the width as needed */
            }
            .tp-mllv_i::-webkit-scrollbar-track {
                background-color: #000; /* Change the color as needed */
            }
            .tp-lblv_l {
                font-size: 14px;
                letter-spacing: -1px;
            }
            .tp-btnv {
                width: 100px;
                margin-left: 60px !important;
            }
            .tp-ckbv_w {
                margin-left: 4px !important;
            }
            .tp-dfwv, .tp-rotv, .tp-rotv_c, .tp-fldv, .tp-fldv_c, .tp-lblv, .tp-lstv, .tp-btnv, .tp-sldv {
                z-index: 99999 !important;
                white-space: nowrap !important;
            }
            @keyframes msg {
                from {
                    transform: translate(-120%, 0);
                    opacity: 0;
                }
                to {
                    transform: none;
                    opacity: 1;
                }
            }
        `;

        document.head.appendChild(styleElement);
        applyTheme();

        //initiate message div and css and shit
        msgElement = document.createElement('div'); // create the element directly
        scrambledMsgEl = getScrambled();
        msgElement.classList.add(scrambledMsgEl);
        msgElement.setAttribute('style', `
            position: absolute;
            left: 10px;
            color: #fff;
            background: rgba(0, 0, 0, 0.7);
            font-weight: normal;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.5);
            animation: msg 0.5s forwards, msg 0.5s reverse forwards 3s;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            font-family: 'Bahnschrift', sans-serif !important;
            font-size: 16px;
            z-index: 9999 !important;
        `);
        document.body.appendChild(msgElement);
        msgElement.style.display = 'none';
        const messageContainer = document.createElement('div'); //so it can be cloned. i think.
        messageContainer.id = 'message-container';
        document.body.appendChild(messageContainer);
        //initiate coord div and css and shit
        coordElement = document.createElement('div'); // create the element directly
        coordElement.classList.add('coords');
        coordElement.setAttribute('style', `
            position: fixed;
            top: 0px;
            left: 0px;
            height: auto;
            max-height: 30px;
            min-height: 30px;
            text-wrap: nowrap;
            color: #fff;
            background: rgba(0, 0, 0, 0.6);
            font-weight: bolder;
            padding: 2px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.5);
            z-index: 999999;
        `);
        document.body.appendChild(coordElement);
        coordElement.style.display = 'none';
        //initiate hp div and css and shit
        playerstatsElement = document.createElement('div'); // create the element directly
        playerstatsElement.classList.add('playerstats');
        playerstatsElement.setAttribute('style', `
            position: absolute;
            top: 20px;
            left: 280px;
            height: auto;
            min-height: 30px;
            text-wrap: nowrap;
            color: #fff;
            background: rgba(0, 0, 0, 0.6);
            font-weight: bolder;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.5);
            z-index: 999999;
        `);
        document.body.appendChild(playerstatsElement);
        playerstatsElement.style.display = 'none';

        if (load("HUD-Positions") == null) {
            hudElementPositions.coordElement = { top: coordElement.getBoundingClientRect().top, left: coordElement.getBoundingClientRect().left };
            hudElementPositions.playerstatsElement = { top: playerstatsElement.getBoundingClientRect().top, left: playerstatsElement.getBoundingClientRect().left };
            save("HUD-Positions", hudElementPositions);
        } else {
            hudElementPositions = load("HUD-Positions");

            coordElement.style.top = hudElementPositions.coordElement.top + "px";
            playerstatsElement.style.top = hudElementPositions.playerstatsElement.top + "px";

            coordElement.style.left = hudElementPositions.coordElement.left + "px";
            playerstatsElement.style.left = hudElementPositions.playerstatsElement.left + "px";
        };
    };

    const makeDraggable = function (element, notMenu) {
        if (element) {
            let offsetX, offsetY;
            element.addEventListener('mousedown', function (e) {
                const dragElement = function (e) {
                    const x = (e.clientX - offsetX) / unsafeWindow.innerWidth * 100;
                    const y = (e.clientY - offsetY) / unsafeWindow.innerHeight * 100;
                    const maxX = 100 - (element.offsetWidth / unsafeWindow.innerWidth * 100);
                    const maxY = 100 - (element.offsetHeight / unsafeWindow.innerHeight * 100);
                    element.style.left = `${Math.max(0, Math.min(x, maxX))}%`;
                    element.style.top = `${Math.max(0, Math.min(y, maxY))}%`;
                };
                if (notMenu || e.target.classList.contains('tp-rotv_t')) {
                    offsetX = e.clientX - element.getBoundingClientRect().left;
                    offsetY = e.clientY - element.getBoundingClientRect().top;
                    document.addEventListener('mousemove', dragElement);
                    document.addEventListener('mouseup', function () {
                        document.removeEventListener('mousemove', dragElement);
                    });
                    e.preventDefault(); // Prevent text selection during drag
                };
            });
        };
    };

    const makeHudElementDragable = function (element) {
        if (element.getAttribute("drag-true") != "true") {
            element.addEventListener("mousedown", function (e) {
                let offsetX = e.clientX - parseInt(window.getComputedStyle(this).left);
                let offsetY = e.clientY - parseInt(window.getComputedStyle(this).top);

                function mouseMoveHandler(e) {
                    let newX = e.clientX - offsetX;
                    let newY = e.clientY - offsetY;
                    if (newX >= 0 && newX + element.getBoundingClientRect().width <= window.innerWidth) {
                        element.style.left = newX + "px";
                    };
                    if (newY >= 0 && newY + element.getBoundingClientRect().height <= window.innerHeight) {
                        element.style.top = newY + "px";
                    };
                };

                function reset() {
                    window.removeEventListener("mousemove", mouseMoveHandler);
                    window.removeEventListener("mouseup", reset);

                    //saves new positions
                    hudElementPositions.coordElement = { "top": coordElement.getBoundingClientRect().top, "left": coordElement.getBoundingClientRect().left };
                    hudElementPositions.playerstatsElement = { "top": playerstatsElement.getBoundingClientRect().top, "left": playerstatsElement.getBoundingClientRect().left };
                    save("HUD-Positions", hudElementPositions);
                };

                window.addEventListener("mousemove", mouseMoveHandler);
                window.addEventListener("mouseup", reset);
            });

            element.setAttribute("drag-true", "true");
        };
    };

    const applyTheme = function (setTheme) {
        setTheme = (setTheme || extract("themeType") || "defaultTheme");
        let rootTheme
        switch (setTheme) {
            case ("defaultTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(230, 7%, 17%, 1.00);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
                --tp-button-background-color: hsla(230, 7%, 70%, 1.00);
                --tp-button-background-color-active: hsla(230, 7%, 85%, 1.00);
                --tp-button-background-color-focus: hsla(230, 7%, 80%, 1.00);
                --tp-button-background-color-hover: hsla(230, 7%, 75%, 1.00);
                --tp-button-foreground-color: hsla(230, 7%, 17%, 1.00);
                --tp-container-background-color: hsla(230, 7%, 75%, 0.10);
                --tp-container-background-color-active: hsla(230, 7%, 75%, 0.25);
                --tp-container-background-color-focus: hsla(230, 7%, 75%, 0.20);
                --tp-container-background-color-hover: hsla(230, 7%, 75%, 0.15);
                --tp-container-foreground-color: hsla(230, 7%, 75%, 1.00);
                --tp-groove-foreground-color: hsla(230, 7%, 75%, 0.10);
                --tp-input-background-color: hsla(230, 7%, 75%, 0.10);
                --tp-input-background-color-active: hsla(230, 7%, 75%, 0.25);
                --tp-input-background-color-focus: hsla(230, 7%, 75%, 0.20);
                --tp-input-background-color-hover: hsla(230, 7%, 75%, 0.15);
                --tp-input-foreground-color: hsla(230, 7%, 75%, 1.00);
                --tp-label-foreground-color: hsla(230, 7%, 75%, 0.70);
                --tp-monitor-background-color: hsla(230, 7%, 0%, 0.20);
                --tp-monitor-foreground-color: hsla(230, 7%, 75%, 0.70);`; break;
            case ("icebergTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(230, 20%, 11%, 1.00);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
                --tp-button-background-color: hsla(230, 10%, 80%, 1.00);
                --tp-button-background-color-active: hsla(230, 10%, 95%, 1.00);
                --tp-button-background-color-focus: hsla(230, 10%, 90%, 1.00);
                --tp-button-background-color-hover: hsla(230, 10%, 85%, 1.00);
                --tp-button-foreground-color: hsla(230, 20%, 11%, 1);
                --tp-container-background-color: hsla(230, 25%, 16%, 1.00);
                --tp-container-background-color-active: hsla(230, 25%, 31%, 1.00);
                --tp-container-background-color-focus: hsla(230, 25%, 26%, 1.00);
                --tp-container-background-color-hover: hsla(230, 25%, 21%, 1.00);
                --tp-container-foreground-color: hsla(230, 10%, 80%, 1.00);
                --tp-groove-foreground-color: hsla(230, 20%, 8%, 1.00);
                --tp-input-background-color: hsla(230, 20%, 8%, 1.00);
                --tp-input-background-color-active: hsla(230, 28%, 23%, 1.00);
                --tp-input-background-color-focus: hsla(230, 28%, 18%, 1.00);
                --tp-input-background-color-hover: hsla(230, 20%, 13%, 1.00);
                --tp-input-foreground-color: hsla(230, 10%, 80%, 1.00);
                --tp-label-foreground-color: hsla(230, 12%, 48%, 1.00);
                --tp-monitor-background-color: hsla(230, 20%, 8%, 1.00);
                --tp-monitor-foreground-color: hsla(230, 12%, 48%, 1.00);`; break;
            case ("jetblackTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(0, 0%, 0%, 1.00);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
                --tp-button-background-color: hsla(0, 0%, 70%, 1.00);
                --tp-button-background-color-active: hsla(0, 0%, 85%, 1);
                --tp-button-background-color-focus: hsla(0, 0%, 80%, 1.00);
                --tp-button-background-color-hover: hsla(0, 0%, 75%, 1.00);
                --tp-button-foreground-color: hsla(0, 0%, 0%, 1.00);
                --tp-container-background-color: hsla(0, 0%, 10%, 1.00);
                --tp-container-background-color-active: hsla(0, 0%, 25%, 1.00);
                --tp-container-background-color-focus: hsla(0, 0%, 20%, 1.00);
                --tp-container-background-color-hover: hsla(0, 0%, 15%, 1.00);
                --tp-container-foreground-color: hsla(0, 0%, 50%, 1.00);
                --tp-groove-foreground-color: hsla(0, 0%, 10%, 1.00);
                --tp-input-background-color: hsla(0, 0%, 10%, 1.00);
                --tp-input-background-color-active: hsla(0, 0%, 25%, 1.00);
                --tp-input-background-color-focus: hsla(0, 0%, 20%, 1.00);
                --tp-input-background-color-hover: hsla(0, 0%, 15%, 1.00);
                --tp-input-foreground-color: hsla(0, 0%, 70%, 1.00);
                --tp-label-foreground-color: hsla(0, 0%, 50%, 1.00);
                --tp-monitor-background-color: hsla(0, 0%, 8%, 1.00);
                --tp-monitor-foreground-color: hsla(0, 0%, 48%, 1.00);`; break;
            case ("lightTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(230, 5%, 90%, 1.00);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.10);
                --tp-button-background-color: hsla(230, 7%, 75%, 1.00);
                --tp-button-background-color-active: hsla(230, 7%, 60%, 1.00);
                --tp-button-background-color-focus: hsla(230, 7%, 65%, 1.00);
                --tp-button-background-color-hover: hsla(230, 7%, 70%, 1.00);
                --tp-button-foreground-color: hsla(230, 10%, 30%, 1.00);
                --tp-container-background-color: hsla(230, 15%, 30%, 0.20);
                --tp-container-background-color-active: hsla(230, 15%, 30%, 0.32);
                --tp-container-background-color-focus: hsla(230, 15%, 30%, 0.28);
                --tp-container-background-color-hover: hsla(230, 15%, 30%, 0.24);
                --tp-container-foreground-color: hsla(230, 10%, 30%, 1.00);
                --tp-groove-foreground-color: hsla(230, 15%, 30%, 0.10);
                --tp-input-background-color: hsla(230, 15%, 30%, 0.10);
                --tp-input-background-color-active: hsla(230, 15%, 30%, 0.22);
                --tp-input-background-color-focus: hsla(230, 15%, 30%, 0.18);
                --tp-input-background-color-hover: hsla(230, 15%, 30%, 0.14);
                --tp-input-foreground-color: hsla(230, 10%, 30%, 1.00);
                --tp-label-foreground-color: hsla(230, 10%, 30%, 0.70);
                --tp-monitor-background-color: hsla(230, 15%, 30%, 0.10);
                --tp-monitor-foreground-color: hsla(230, 10%, 30%, 0.50);`; break;
            case ("retroTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(40, 3%, 90%, 1.00);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.30);
                --tp-button-background-color: hsla(40, 3%, 70%, 1.00);
                --tp-button-background-color-active: hsla(40, 3%, 55%, 1.00);
                --tp-button-background-color-focus: hsla(40, 3%, 60%, 1.00);
                --tp-button-background-color-hover: hsla(40, 3%, 65%, 1.00);
                --tp-button-foreground-color: hsla(40, 3%, 20%, 1.00);
                --tp-container-background-color: hsla(40, 3%, 70%, 1.00);
                --tp-container-background-color-active: hsla(40, 3%, 55%, 1.00);
                --tp-container-background-color-focus: hsla(40, 3%, 60%, 1.00);
                --tp-container-background-color-hover: hsla(40, 3%, 65%, 1.00);
                --tp-container-foreground-color: hsla(40, 3%, 20%, 1.00);
                --tp-groove-foreground-color: hsla(40, 3%, 40%, 1.00);
                --tp-input-background-color: hsla(120, 3%, 20%, 1.00);
                --tp-input-background-color-active: hsla(120, 3%, 35%, 1.00);
                --tp-input-background-color-focus: hsla(120, 3%, 30%, 1.00);
                --tp-input-background-color-hover: hsla(120, 3%, 25%, 1.00);
                --tp-input-foreground-color: hsla(120, 40%, 60%, 1.00);
                --tp-label-foreground-color: hsla(40, 3%, 50%, 1.00);
                --tp-monitor-background-color: hsla(120, 3%, 20%, 1.00);
                --tp-monitor-foreground-color: hsla(120, 40%, 60%, 0.80);`; break;
            case ("translucentTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(0, 0%, 10%, 0.80);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.20);
                --tp-button-background-color: hsla(0, 0%, 80%, 1.00);
                --tp-button-background-color-active: hsla(0, 0%, 100%, 1.00);
                --tp-button-background-color-focus: hsla(0, 0%, 95%, 1.00);
                --tp-button-background-color-hover: hsla(0, 0%, 85%, 1.00);
                --tp-button-foreground-color: hsla(0, 0%, 0%, 0.80);
                --tp-container-background-color: hsla(0, 0%, 0%, 0.30);
                --tp-container-background-color-active: hsla(0, 0%, 0%, 0.60);
                --tp-container-background-color-focus: hsla(0, 0%, 0%, 0.50);
                --tp-container-background-color-hover: hsla(0, 0%, 0%, 0.40);
                --tp-container-foreground-color: hsla(0, 0%, 100%, 0.50);
                --tp-groove-foreground-color: hsla(0, 0%, 0%, 0.20);
                --tp-input-background-color: hsla(0, 0%, 0%, 0.30);
                --tp-input-background-color-active: hsla(0, 0%, 0%, 0.60);
                --tp-input-background-color-focus: hsla(0, 0%, 0%, 0.50);
                --tp-input-background-color-hover: hsla(0, 0%, 0%, 0.40);
                --tp-input-foreground-color: hsla(0, 0%, 100%, 0.50);
                --tp-label-foreground-color: hsla(0, 0%, 100%, 0.50);
                --tp-monitor-background-color: hsla(0, 0%, 0%, 0.30);
                --tp-monitor-foreground-color: hsla(0, 0%, 100%, 0.30);`; break;
            case ("statefarmerTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(0, 80%, 40%, 1.00);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
                --tp-button-background-color: hsla(0, 0%, 100%, 1.00);
                --tp-button-background-color-active: hsla(0, 0%, 85%, 1.00);
                --tp-button-background-color-focus: hsla(0, 0%, 90%, 1.00);
                --tp-button-background-color-hover: hsla(0, 0%, 95%, 1.00);
                --tp-button-foreground-color: hsla(230, 20%, 11%, 1.00);
                --tp-container-background-color: hsla(0, 0%, 0%, 0.20);
                --tp-container-background-color-active: hsla(0, 0%, 0%, 0.35);
                --tp-container-background-color-focus: hsla(0, 0%, 0%, 0.30);
                --tp-container-background-color-hover: hsla(0, 0%, 0%, 0.25);
                --tp-container-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-groove-foreground-color: hsla(0, 0%, 0%, 0.50);
                --tp-input-background-color: hsla(0, 0%, 0%, 0.50);
                --tp-input-background-color-active: hsla(0, 0%, 0%, 0.65);
                --tp-input-background-color-focus: hsla(0, 0%, 0%, 0.60);
                --tp-input-background-color-hover: hsla(0, 0%, 0%, 0.55);
                --tp-input-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-label-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-monitor-background-color: hsla(0, 0%, 0%, 0.50);
                --tp-monitor-foreground-color: hsla(0, 0%, 100%, 0.50);`; break;
            case ("blurpleTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(255, 68%, 39%, 1.00);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
                --tp-button-background-color: hsla(0, 0%, 100%, 1.00);
                --tp-button-background-color-active: hsla(0, 0%, 85%, 1.00);
                --tp-button-background-color-focus: hsla(0, 0%, 90%, 1.00);
                --tp-button-background-color-hover: hsla(0, 0%, 95%, 1.00);
                --tp-button-foreground-color: hsla(230, 20%, 11%, 1.00);
                --tp-container-background-color: hsla(0, 0%, 0%, 0.20);
                --tp-container-background-color-active: hsla(0, 0%, 0%, 0.35);
                --tp-container-background-color-focus: hsla(0, 0%, 0%, 0.30);
                --tp-container-background-color-hover: hsla(0, 0%, 0%, 0.25);
                --tp-container-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-groove-foreground-color: hsla(0, 0%, 0%, 0.50);
                --tp-input-background-color: hsla(0, 0%, 0%, 0.50);
                --tp-input-background-color-active: hsla(0, 0%, 0%, 0.65);
                --tp-input-background-color-focus: hsla(0, 0%, 0%, 0.60);
                --tp-input-background-color-hover: hsla(0, 0%, 0%, 0.55);
                --tp-input-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-label-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-monitor-background-color: hsla(0, 0%, 0%, 0.50);
                --tp-monitor-foreground-color: hsla(0, 0%, 100%, 0.50);`; break;
            case ("shellFarmTheme"):
                rootTheme = `
                --tp-base-background-color: hsla(198, 100%, 50%, 1.00);
                --tp-base-shadow-color: hsla(0, 0%, 0%, 0.2);
                --tp-button-background-color: hsla(0, 0%, 100%, 1.00);
                --tp-button-background-color-active: hsla(0, 0%, 85%, 1.00);
                --tp-button-background-color-focus: hsla(0, 0%, 90%, 1.00);
                --tp-button-background-color-hover: hsla(0, 0%, 95%, 1.00);
                --tp-button-foreground-color: hsla(230, 20%, 11%, 1.00);
                --tp-container-background-color: hsla(0, 0%, 0%, 0.20);
                --tp-container-background-color-active: hsla(0, 0%, 0%, 0.35);
                --tp-container-background-color-focus: hsla(0, 0%, 0%, 0.30);
                --tp-container-background-color-hover: hsla(0, 0%, 0%, 0.25);
                --tp-container-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-groove-foreground-color: hsla(0, 0%, 0%, 0.50);
                --tp-input-background-color: hsla(0, 0%, 0%, 0.50);
                --tp-input-background-color-active: hsla(0, 0%, 0%, 0.65);
                --tp-input-background-color-focus: hsla(0, 0%, 0%, 0.60);
                --tp-input-background-color-hover: hsla(0, 0%, 0%, 0.55);
                --tp-input-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-label-foreground-color: hsla(0, 0%, 100%, 0.90);
                --tp-monitor-background-color: hsla(0, 0%, 0%, 0.50);
                --tp-monitor-foreground-color: hsla(0, 0%, 100%, 0.50);`; break;
        };

        //menu customisation (apply font, button widths, adjust checkbox right slightly, make menu appear on top, add anim to message)
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            :root { ${rootTheme} }
        `;
        document.head.appendChild(styleElement);
    };
    //1337 H4X
    const hexToRgb = function (hex) {
        hex = hex.replace(/^#/, '');
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r / 255, g / 255, b / 255];
    };
    const fadeBetweenColors = function (color1, color2, progress) {
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);
        const resultRgb = [
            rgb1[0] + (rgb2[0] - rgb1[0]) * progress,
            rgb1[1] + (rgb2[1] - rgb1[1]) * progress,
            rgb1[2] + (rgb2[2] - rgb1[2]) * progress
        ];
        return resultRgb;
    };
    const distancePlayers = function (player) {
        return player.position.distanceTo(ss.MYPLAYER.position);
    };
    const calculateYaw = function (pos) {
        return F.mod(Math.atan2(pos.x, pos.z), Math.PI2);
    };
    const calculatePitch = function (pos) {
        return -Math.atan2(pos.y, Math.hypot(pos.x, pos.z)) % 1.5;
    };
    const getAngularDifference = function (obj1, obj2) { //this is super scuffed
        return Math.abs(obj1.rotation.y - obj2.yawReal) + Math.abs(obj1.children[0].rotation.x - obj2.pitchReal);
    };
    const getDirectionVectorFacingTarget = function (target, vectorPassed, offsetY) {
        if (vectorPassed || (target && target.position)) { //in case of zizzy's weird error
            target = vectorPassed ? target : target.position;
            offsetY = offsetY || 0;
            return {
                x: target.x - ss.MYPLAYER.position.x,
                y: target.y - ss.MYPLAYER.position.y + offsetY,
                z: target.z - ss.MYPLAYER.position.z,
            };
        } else { //we really dont want this happening tho
            F.log("fuck");
            // F.log(vectorPassed);
            // F.log(target);
            // console.trace();
            return {
                x: 0,
                y: 0,
                z: 0,
            };
        };
    };
    const deg2rad = function (deg) {
        return deg * (Math.PI / 180);
    };
    const isPartialMatch = function (array, searchString) {
        return array.some(item => item !== "" && searchString.toLowerCase().includes(item.toLowerCase()));
    };
    const playerMatchesList = function (array, player) {
        let nameMatched = isPartialMatch(array, player.name);
        let idMatched = isPartialMatch(array, player.uniqueId);
        return nameMatched || idMatched;
    };
    const randomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const radianAngleDiff = function (angle1, angle2) {
        const fullCircle = 2 * Math.PI;
        // Normalize angles to be within [0, 2π)
        angle1 = (angle1 % fullCircle + fullCircle) % fullCircle;
        angle2 = (angle2 % fullCircle + fullCircle) % fullCircle;
        // Find the absolute angular difference
        let diff = Math.abs(angle1 - angle2);
        // Ensure the difference is within [0, π)
        diff = Math.min(diff, fullCircle - diff);
        // Determine the sign of the difference correctly
        if ((angle1 - angle2 + fullCircle) % fullCircle > Math.PI) {
            return -diff;
        } else {
            return diff;
        };
    };
    const updateOrCreateLinesESP = function (object, type, color) {
        let newPosition, newScene, newParent
        if (type == "playerESP") {
            newPosition = object[H.actor][H.mesh].position;
            newScene = object[H.actor].scene;
            newParent = object[H.actor][H.mesh];
        } else if(type == "pPredESP"){ //objects will be player.pred
            newPosition = object.position;
            newScene = object.scene;
            newParent = object.mesh;
        }  else {
            newPosition = object.position;
            newScene = object._scene;
            newParent = object;
        };
        if (!object.generatedESP) {
            //tracers
            const tracerLines = L.BABYLON.MeshBuilder.CreateLines("tracerLines", { points: [newPosition, crosshairsPosition] }, newScene);
            tracerLines.color = new L.BABYLON.Color3(1, 1, 1);
            tracerLines.renderingGroupId = 1;
            object.tracerLines = tracerLines;
            //ESP
            //FUCK WIREFRAME BOXES! LIBERTYMUTUAL dictates we making our own MANUALLY bitch! to hell with those diagonal lines
            const boxSize = {
                playerESP: { width: 0.5, height: 0.75, depth: 0.5 },
                pPredESP: { width: 0.5, height: 0.75, depth: 0.5 },
                ammoESP: { width: 0.25, height: 0.35, depth: 0.25 },
            };
            const boxOffset = {
                playerESP: 0,
                pPredESP: 0,
                ammoESP: -0.05,
            };
            const vertices = [
                new L.BABYLON.Vector3(-boxSize[type].width / 2, boxOffset[type], -boxSize[type].depth / 2),
                new L.BABYLON.Vector3(boxSize[type].width / 2, boxOffset[type], -boxSize[type].depth / 2),
                new L.BABYLON.Vector3(boxSize[type].width / 2, boxOffset[type] + boxSize[type].height, -boxSize[type].depth / 2),
                new L.BABYLON.Vector3(-boxSize[type].width / 2, boxOffset[type] + boxSize[type].height, -boxSize[type].depth / 2),
                new L.BABYLON.Vector3(-boxSize[type].width / 2, boxOffset[type], boxSize[type].depth / 2),
                new L.BABYLON.Vector3(boxSize[type].width / 2, boxOffset[type], boxSize[type].depth / 2),
                new L.BABYLON.Vector3(boxSize[type].width / 2, boxOffset[type] + boxSize[type].height, boxSize[type].depth / 2),
                new L.BABYLON.Vector3(-boxSize[type].width / 2, boxOffset[type] + boxSize[type].height, boxSize[type].depth / 2),
            ];
            const lines = [];
            for (let i = 0; i < 4; i++) {
                lines.push([vertices[i], vertices[(i + 1) % 4]]);
                lines.push([vertices[i + 4], vertices[(i + 1) % 4 + 4]]);
                lines.push([vertices[i], vertices[i + 4]]);
            };
            const box = L.BABYLON.MeshBuilder.CreateLineSystem(getScrambled(), { lines }, newScene);
            box.color = new L.BABYLON.Color3(1, 1, 1);
            box.position.y = boxOffset[type];
            box.renderingGroupId = 1;
            box.parent = newParent;
            object.box = box;
            //TARGETS
            let target
            if (type == "playerESP") {
                target = L.BABYLON.MeshBuilder.CreateSphere(getScrambled(), { diameter: 0.05 }, newScene);
                target.material = new L.BABYLON.StandardMaterial(getScrambled(), newScene);
                target.material.diffuseColor = new L.BABYLON.Color3(1, 0, 0);
                target.material.alpha = 0.5;
                target.position.y = 0.3;
                target.renderingGroupId = 1;
                target.parent = newParent;
                object.target = target;
            };
            //stuff
            object.generatedESP = true;
            ESPArray.push([object, tracerLines, box, target]);
        };
        object.tracerLines.setVerticesData(L.BABYLON.VertexBuffer.PositionKind, [crosshairsPosition.x, crosshairsPosition.y, crosshairsPosition.z, newPosition.x, newPosition.y, newPosition.z]);
          object.tracerLines.color = new L.BABYLON.Color3(...color);
          object.box.color = new L.BABYLON.Color3(...color);
    };
    const everySecond = function () {
        if (extract("debug")) {
            unsafeWindow.globalSS = {};
            unsafeWindow.globalSS.ss = ss;
            unsafeWindow.globalSS.F = F;
            unsafeWindow.globalSS.L = L;
            unsafeWindow.globalSS.tp = tp;
            unsafeWindow.globalSS.initMenu = initMenu;
            unsafeWindow.globalSS.extractAsDropdownInt = extractAsDropdownInt;
            unsafeWindow.globalSS.extract = extract;
            unsafeWindow.globalSS.extractDropdownList = extractDropdownList;
            unsafeWindow.globalSS.save = save;
            unsafeWindow.globalSS.load = load;
            unsafeWindow.globalSS.GM_listValues = GM_listValues;
            unsafeWindow.globalSS.GM_getValue = GM_getValue;
            unsafeWindow.globalSS.GM_setValue = GM_setValue;
            unsafeWindow.globalSS.createPopup = createPopup;
            unsafeWindow.globalSS.remove = remove;
        };

        sfChatUsernameSet();

        allFolders.forEach(function (name) {
            save(name, tp[name].expanded);
        });

        coordElement.style.display = "none";
        playerstatsElement.style.display = "none";
        makeHudElementDragable(coordElement);
        makeHudElementDragable(playerstatsElement);

        if ((!ranEverySecond) && startUpComplete) {
            updateAccountRecords();
            if (extract("autoMacro")) {
                F.log("automatically do your macro");
                change("executeMacro");
            };
            ranEverySecond = true;
        };
    };
    const everyDecisecond = function () {
        updateConfig();
        
        if (ss && ss.MYPLAYER) {
            //innertext stuff, fairly resource intensive. disable these for performance
            if (extract("playerStats")) {
                let playerStates = "";
                ss.PLAYERS.forEach(player => {
                    if (player && (player !== ss.MYPLAYER) && (player[H.hp] > 0) && ((!ss.MYPLAYER.team) || (player.team !== ss.MYPLAYER.team))) {
                        playerStates = playerStates + player.name + ": " + Math.round(player[H.hp]) + " HP\n";
                    };
                });
                if (playerStates == "") { playerStates = "No Enemy Players" };
                playerstatsElement.innerText = playerStates;
                void playerstatsElement.offsetWidth;
                playerstatsElement.style.display = '';
            };
            if (ss.MYPLAYER && ss.MYPLAYER.position && ss.MYPLAYER.rotation && extract("showCoordinates")) {
                const conv = function (input) { return Number((input).toFixed(3)) };
                const posx = conv(ss.MYPLAYER.position.x);
                const posy = conv(ss.MYPLAYER.position.y);
                const posz = conv(ss.MYPLAYER.position.z);
                const rotx = conv(ss.MYPLAYER.children[0].rotation.x);
                const roty = conv(ss.MYPLAYER.rotation.y);
                const personalCoordinate = `XYZ: ${posx}, ${posy}, ${posz} Rot: ${rotx}, ${roty}`;
                coordElement.innerText = personalCoordinate;
                void coordElement.offsetWidth;
                coordElement.style.display = '';
            };
        };
    };
    const updateConfig = function () {
        configMain = tp.mainPanel.exportPreset();
    };
    const updateHiddenAndDisabledHelper = function (array) { //determines if all conditions are met
        let conditionMet = false;
        array.forEach(condition => {
            if ((extract(condition[0]) ? extract(condition[0]) : false) !== condition[1]) {
                conditionMet = true;
                return;
            };
        });
        return conditionMet;
    }
    const updateHiddenAndDisabled = function () {
        //the format for hidden/disabled modules is as follows:
        //hidden/disabled is an array of arrays. within each of the items, there is the condition required for the module to be shown
        //eg: [["aimbot",true],...] (will only be shown if extract("aimbot")==true)
        if (menuInitiated) {
            allModules.forEach(module => {
                const tiedModules = tp[module + "TiedModules"];
                if (tiedModules) {
                    if (tiedModules.showConditions) {
                        tp[module + "Button"].hidden = updateHiddenAndDisabledHelper(tiedModules.showConditions);
                    };
                    if (tiedModules.hideConditions) {
                        tp[module + "Button"].hidden = !updateHiddenAndDisabledHelper(tiedModules.hideConditions);
                    };
                    if (tiedModules.enableConditions) {
                        tp[module + "Button"].disabled = updateHiddenAndDisabledHelper(tiedModules.enableConditions);
                    };
                    if (tiedModules.disableConditions) {
                        tp[module + "Button"].disabled = !updateHiddenAndDisabledHelper(tiedModules.disableConditions);
                    };
                };
            });
        };
    };
    const saveConfig = function () {
        save("KrunkFarmConfigMainPanel", tp.mainPanel.exportPreset());
    };
    const save = function (key, value) {
        if (JSON.parse(localStorage.getItem(key)) !== undefined) { localStorage.removeItem(key) }; //dont need that anymore lmao
        GM_setValue(storageKey + key, value);
    };
    const load = function (key) {
        return GM_getValue(storageKey + key) || JSON.parse(localStorage.getItem(key)); //localstorage is for legacy purposes *only*
    };
    const remove = function (key) {
        GM_deleteValue(storageKey + key);
        if (JSON.parse(localStorage.getItem(key)) !== undefined) { localStorage.removeItem(key) }; //legacy
    };
    const addUserPresets = function (presets) { //adds presets from dict to inbilt presets, can be called multiple times to update
        if (presets != null) {
            Object.entries(presets).forEach(([key, value]) => {
                inbuiltPresets[key] = value;
            });
        };
    };
    const loadUserPresets = function () { //gets user presets
        let result = load(presetStorageLocation);
        F.log("Loaded StateFarmUserPresets: ", result);
        return load(presetStorageLocation);
    };
    const saveUserPreset = function (presetName, preset) {
        let currentPresets = loadUserPresets(); //gets current saved presets
        if (currentPresets == null) { // if it does not exist, makes it
            let presets = {};
            presets[presetName] = preset;
            save(presetStorageLocation, presets);
            return presets;
        } else { //otherwise it appends it
            currentPresets[presetName] = preset;
            save(presetStorageLocation, currentPresets);
            return currentPresets;
        };
    };
    //Updates inbuiltPresets to include user presets
    addUserPresets(loadUserPresets());
    const getAimbot = function (target) {
        let directionVector = getDirectionVectorFacingTarget(target);

        let direction = {
            yawReal: calculateYaw(directionVector),
            pitchReal: calculatePitch(directionVector),
        };

        return direction;
    };
    const applySettings = function (receivedConfig, reset, secondPassThru) {
        let settings = receivedConfig.split("<");
        if (reset) { initMenu(true); F.log("KrunkFarm: clearing before applying settings") };
        settings.forEach(element => {
            element = element.split(">");
            if (element[0] == "customMacro") {element[1] = element[1].replaceAll("{less}","<").replaceAll("{greater}",">")};
            F.log(change(element[0], JSON.parse(element[1])));
        });
        createPopup("Custom KrunkFarm Settings Applying...");
        if (!secondPassThru) {
            setTimeout(() => {
                if (receivedConfig) {
                    applySettings(receivedConfig, false, true);
                };
            }, 150);
        };
    };

    const findKeyWithProperty = function (obj, propertyToFind) {
        for (const key in obj) {
            if (obj[key] === null || obj[key] === undefined) {
                continue;
            };
            if (!!obj[key] && (typeof (obj[key]) == 'object' || typeof (obj[key]) == 'function') && obj[key].hasOwnProperty(propertyToFind)) {
                return key;
            };
        };
        // Property not found
        return null;
    };

    const findStringInLists = function (dictWithLists, str) {
        for (const key in dictWithLists) {
            if (dictWithLists.hasOwnProperty(key)) {
                const list = dictWithLists[key];
                if (list.includes(str)) {
                    return key; // Return the key where the string is found
                };
            };
        };
        return null; // Return null if the string is not found in any list
    };

    const mainLoop = function () {
        const initVars = function () {

        };
        const updateLinesESP = function () {
            const objExists = Date.now();

            //update playerESP boxes, tracer lines, colors
            ss.PLAYERS.forEach(player => {
                if (player && (player !== ss.MYPLAYER) && player[H.playing] && (player[H.hp] > 0) && ((!ss.MYPLAYER.team) || (player.team !== ss.MYPLAYER.team))) {
                    const whitelisted = (extract("whitelistESPType") == "highlight" || !extract("enableWhitelistTracers") || playerMatchesList(whitelistPlayers, player));
                    const blacklisted = (extract("blacklistESPType") == "justexclude" && extract("enableBlacklistTracers") && playerMatchesList(blacklistPlayers, player));
                    const passedLists = whitelisted && (!blacklisted);
                    const tracersType = extract("tracersType");

                    let color, progress;
                    if (extract("enableWhitelistTracers") && extract("whitelistESPType") == "highlight" && playerMatchesList(whitelistPlayers, player)) {
                        color = hexToRgb(extract("whitelistColor"));
                    } else if (extract("enableBlacklistTracers") && extract("blacklistESPType") == "highlight" && playerMatchesList(blacklistPlayers, player)) {
                        color = hexToRgb(extract("blacklistColor"));
                    } else if (tracersType == "proximity") {
                        const distance = distancePlayers(player);
                        if (distance < extract("tracersColor1to2")) { //fade between first set
                            progress = (distance / extract("tracersColor1to2"));
                            color = fadeBetweenColors(extract("tracersColor1"), extract("tracersColor2"), progress);
                        } else if (distance < extract("tracersColor2to3")) { //fade between second set
                            progress = ((distance - extract("tracersColor1to2")) / (extract("tracersColor2to3") - extract("tracersColor1to2")));
                            color = fadeBetweenColors(extract("tracersColor2"), extract("tracersColor3"), progress);
                        } else {
                            color = hexToRgb(extract("tracersColor3"));
                        };
                    } else if (tracersType == "static") {
                        color = hexToRgb(extract("tracersColor1"));
                    } else if (tracersType == "visibility") {
                        color = getLineOfSight(player) ? hexToRgb(extract("tracersColor2")) : hexToRgb(extract("tracersColor1"))
                    };
                    updateOrCreateLinesESP(player, "playerESP", color);

                    player.tracerLines.visibility = player[H.playing] && extract("tracers") && passedLists;
                    player.box.visibility = extract("playerESP") && passedLists;
                    // player.target.visibility = extract("targets") && passedLists;
                    player.target.visibility = false;

                    if (player[H.actor]) {
                        let eggSize = extract("eggSize")
                        player[H.actor][H.bodyMesh].scaling = { x: eggSize, y: eggSize, z: eggSize }
                    };

                    player[H.actor][H.bodyMesh].renderingGroupId = extract("chams") ? 1 : 0;

                    player.exists = objExists;
                };
                if (player) {
                    if (extract("nametags") && player[H.actor] && player[H.actor].nameSprite) { //taken from shellshock.js, so var names are weird
                        player[H.actor].nameSprite._manager.renderingGroupId = 1;
                        player[H.actor].nameSprite.renderingGroupId = 1;
                        var h = Math.length3(player[H.x] - ss.MYPLAYER[H.x], player[H.y] - ss.MYPLAYER[H.y], player[H.z] - ss.MYPLAYER[H.z]),
                            d = Math.pow(h, 1.25) * 2;
                        player[H.actor].nameSprite.width = d / 10 + .6;
                        player[H.actor].nameSprite.height = d / 20 + .3;
                        ss.MYPLAYER[H.actor].scene.activeCamera.fov = 0.75
                    };
                    if (!player.logged) {
                        player.logged = true;
                        if (extract("debug")) {
                            playerLogger.push(player);
                            F.log("Logged player: " + player.name, player)
                        }; //if youre a l33t kiddy who did a search for the term "logger", this does not in fact log any of the user's info. it just keeps track of players who joined and prints them to console.
                        if (extract("joinMessages") && (!newGame)) {
                            if (extract("publicBroadcast")) {
                                sendChatMessage((extract("joinLeaveBranding") ? "[SFC] " : "") + player.name + " joined.")
                            } else {
                                processChatItem("joined.", player.name, player.team, "rgba(0, 255, 0, 0.2)");
                            };
                        };
                    };
                    player.isOnline = objExists;
                };
            });

            for (let i = 0; i < ESPArray.length; i++) {
                if (ESPArray[i][0] && ESPArray[i][0].exists == objExists) { //obj still exists and still relevant
                    //do nothing, lol
                } else {
                    if (ESPArray[i][0]) { //obj still exists but no longer relevant
                        F.log('%cRemoving tracer line due to irrelevant object', 'color: white; background: red');
                        ESPArray[i][0].generatedESP = false;
                    } else { //obj no longer exists
                        F.log('%cRemoving tracer line due to no longer exists', 'color: white; background: red');
                    };
                    ESPArray[i][1].dispose(); //tracer
                    ESPArray[i][2].dispose(); //esp box
                    if (ESPArray[i][3]) { ESPArray[i][3].dispose() }; //target
                    ESPArray.splice(i, 1);
                };
            }; newGame = false;
        };
        const injectScript = function (input) {
            if (input?.parent?.type && input.parent.type == "Scene" && input.parent.name == "Main") {
                ss.SCENE = input.parent;
                Array.prototype.push = F.push;
            };
            return F.push.apply(this, arguments);
        };
        const KRUNKFARM = function () {
            F.requestAnimationFrame.call( F.window, KRUNKFARM );
    
            if (typeof (L.THREE) !== 'undefined') {
                if (!ss.SCENE) {
                    F.window.setTimeout(() => {
                        Array.prototype.push = injectScript;
                    }, 2500);
                } else if (menuInitiated) {
                    ss.PLAYERS = [];
                    ss.SCENE.children.forEach(child => {
                        if (child.type == 'Object3D') {
                            try {
                                let cam = child.children && child.children[0] && child.children[0].children && child.children[0].children[0];
                                if (cam && cam.type == "PerspectiveCamera") {
                                    ss.MYPLAYER = child;
                                } else {
                                    ss.PLAYERS.push(child);
                                };
                            } catch (error) {
                                
                            };
                        };
                        if (child.material) child.material.wireframe = extract("wireframe");
                    });

                    // initVars();
                    // updateLinesESP();
    
                    let playerLookingAtMinimum = 999999;
                    playerLookingAt = undefined; //used for player info
    
                    let previousTarget = currentlyTargeting;
    
                    let selectNewTarget = (!extract("antiSwitch") || !currentlyTargeting);
                    let isDoingAimbot = (extract("aimbot") && (extract("aimbotRightClick") ? isRightButtonDown : true));
    
                    const targetType = extract("aimbotTargetMode");
    
                    let enemyMinimumValue = deg2rad(extract("aimbotMinAngle")); //used for selecting target (either pointingat or nearest)
    
                    let didAimbot
                    const candidates = [];
    
                    ss.PLAYERS.forEach(player => { //iterate over all players to filter some out
                        if (player && (player !== ss.MYPLAYER)) {
                            const directionVector = getDirectionVectorFacingTarget(player);
                            let angleDiff = getAngularDifference(ss.MYPLAYER, { yawReal: calculateYaw(directionVector), pitchReal: calculatePitch(directionVector) });
    
                            if (angleDiff < playerLookingAtMinimum) {
                                playerLookingAtMinimum = angleDiff;
                                playerLookingAt = player;
                            };
    
                            if (isDoingAimbot) { //is doing aimbot and we care about getting a new target
                                if (selectNewTarget) {
                                    candidates.push(player);
                                };
                            };
                        };
                    });
    
                    candidates.forEach(player => {
                        const directionVector = getDirectionVectorFacingTarget(player);
                        const angleDiff = getAngularDifference(ss.MYPLAYER, { yawReal: calculateYaw(directionVector), pitchReal: calculatePitch(directionVector) });
                        const valueToUse = ((targetType == "nearest" && distancePlayers(player)) || (targetType == "pointingat" && angleDiff));
                        if (valueToUse < enemyMinimumValue) {
                            enemyMinimumValue = valueToUse;
                            currentlyTargeting = player;
                        };
                    });

                    if (isDoingAimbot) F.log(currentlyTargeting);
                    F.log(isRightButtonDown, isDoingAimbot);
    
                    if (isDoingAimbot) {
                        if (currentlyTargeting && currentlyTargeting.position && currentlyTargeting.rotation) { //found a target
                            didAimbot = true;
                            // if (extract("tracers")) {
                            //     currentlyTargeting.tracerLines.color = new L.BABYLON.Color3(...hexToRgb(extract("aimbotColor")));
                            // };
                            // if (extract("playerESP")) {
                            //     currentlyTargeting.box.color = new L.BABYLON.Color3(...hexToRgb(extract("aimbotColor")));
                            // };
                            const directionVector = getDirectionVectorFacingTarget(currentlyTargeting);
                            const angleDiff = getAngularDifference(ss.MYPLAYER, { yawReal: calculateYaw(directionVector), pitchReal: calculatePitch(directionVector) });
                            if ((targetingComplete || (deg2rad(extract("aimbotMinAngle")) > angleDiff))) {
                                const distanceBetweenPlayers = distancePlayers(currentlyTargeting);
    
                                const aimbot = getAimbot(currentlyTargeting);
    
                                const antiSnap = (1 - (extract("aimbotAntiSnap") || 0));
    
                                if (previousTarget !== currentlyTargeting) { targetingComplete = false };
    
                                const lerp = function (start, end, alpha) {
                                    let value = (1 - alpha) * start + alpha * end;
                                    if ((Math.abs(end - start) < (0.2 / (distanceBetweenPlayers))) || (targetingComplete)) {
                                        value = end; targetingComplete = true;
                                    };
                                    return value;
                                };
    
                                // Exponential lerp towards the target rotation
                                ss.MYPLAYER.children[0].rotation.x = lerp(ss.MYPLAYER.children[0].rotation.x, aimbot.pitchReal, antiSnap);
                                ss.MYPLAYER.rotation.y = lerp(ss.MYPLAYER.rotation.y, aimbot.yawReal, antiSnap);
                            };
                        } else {
                            if (extract("oneKill")) {
                                currentlyTargeting = "dead";
                            } else {
                                currentlyTargeting = false;
                            };
                        };
                    } else {
                        currentlyTargeting = false;
                        targetingComplete = false;
                        if (extract("enableSeizureX")) {
                            ss.MYPLAYER.children[0].rotation.x += extract("amountSeizureX")
                        };
                        if (extract("enableSeizureY")) {
                            ss.MYPLAYER.rotation.y += extract("amountSeizureY")
                        };
                    };
    
                    return;
                };
            };
        };
        KRUNKFARM();
    };

    //start init thingamajigs
    F.log("KrunkFarm: startUp()", attemptedInjection);
    startUp();
    F.log("KrunkFarm: after startUp()", attemptedInjection);

    if (typeof GM_info !== 'undefined' && GM_info?.scriptHandler == "Tampermonkey") {
        let count = GM_getValue("StateFarm_TampermonkeyWarnings") || 0;
        count++;
        if (count <= 3) {
            let userConfirmed = confirm("StateFarm Client: Tampermonkey detected! StateFarm Client does not support this manager, use Violentmonkey instead. Press OK to be redirected to the Violentmonkey website. You can continue to use Tampermonkey, but expect unreliable results. For more information, visit our Discord server: "+discordURL);
            if (userConfirmed) {
                GM_openInTab(violentmonkeyURL, { active: true });
            };
            alert(`This alert will show three times in total. Please install Violentmonkey before reporting issues. ${3-count} more warnings.`);
        };
        GM_setValue("StateFarm_TampermonkeyWarnings", count); //continue counting for the lulz
    };
})();
console.log("KrunkFarm: after function", attemptedInjection);
