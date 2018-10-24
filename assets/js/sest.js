/*!
 * SelfStyle (SeSt)
 *
 * Copyright 2018 Joshua Balanuik
 * Released under the Apache License 2.0
 */

/**
 * Prefix used for CSS properties that will have a gradient value. 
 * For example, a gradient background would be `grad-background`, 
 * a gradient border-image would be `grad-border-image`.
 */
const GRADIENT_PREFIX = 'grad-';

/**
 * Prefix used to indicate a saved SeSt preference is a field group.
 */
const FIELD_GROUP_PREFIX = 'fieldGroup:';

/**
 * Updates a `range`-type SeSt input element on request or in real-time.
 * 
 * @param {jQuery} rangeElem - the jQuery-selected SeSt `range`-type input element.
 */
function updateRange(rangeElem) {
    var $elem = $(rangeElem);
    var prop = $elem.data('prop');
    var value = '';
    switch (prop) {
        case 'color':
            // Used only to set brightness of 0 sat 0 hue colours.
            value = 'rgb(' + $elem.val() + ',' + $elem.val() + ',' + $elem.val() + ')';
            $elem.data('val', $elem.val());
            break;
        default:
            break;
    }

    $($elem.data('sel')).css(prop, value);
}

/**
 * Updates a jsColor (http://jscolor.com/) SeSt control element in real-time.
 * 
 * @param {jsColor} jsColorElem - the jsColor element as passed by the jsColor library.
 */
function updateJsColor(jsColorElem) {
    var $elem = $(jsColorElem.valueElement);
    var prop = $elem.data('prop');
    var value = '';
    let assign = true;

    switch (prop) {
        case 'color':
        case 'background':
            value = jsColorElem.toHEXString();
            $elem.data('val', value);
            break;
        case 'grad-background':
            prop = prop.substring(GRADIENT_PREFIX.length);
            // Get the field group this color stop belongs to.
            let fieldGroupIndex = $elem.data('fg');
            if (fieldGroupIndex === undefined) return;
            let fgFields = $(".sest-field-group [data-fg=" + fieldGroupIndex + "]");
            value = "linear-gradient(#";
            for (let i = 0; i < fgFields.length; i++) {
                let fgFieldValue = fgFields[i].value;
                value += fgFieldValue;
                $(fgFields[i]).data('val', fgFieldValue);
                if (i !== fgFields.length - 1) {
                    value += ", #"
                }
            }
            value += ")";
            break;
        default:
            break;
    }

    $($elem.data('sel')).css(prop, value);
}

/**
 * Returns a single string containing all SeSt preferences, to be saved in localstorage, 
 * or possibly exported/imported. Each SeSt preference string contains a CSS selector,
 * the name of the CSS property to be modified, and the value of the SeSt input(s).
 * Note that the value of the SeSt input is not necessarily a valid CSS property value.
 */
function outputSeStPrefs() {
    var output = '';

    // Get individual SeSt input fields.
    var $fields = $("#sest-form input.sest-field");
    for (let i = 0; i < $fields.length; i++) {
        var $f = $($fields[i]);
        // e.g. '.header-block/background/131313'
        output += $f.data('sel') + '/' + $f.data('prop') + '/' + $f.data('val');
        if (i !== $fields.length - 1) {
            output += '\\';
        }
    }

    // Get SeSt field groups.
    var $fieldGroups = $("#sest-form .sest-field-group");
    if (output !== '' && $fieldGroups.length > 0) {
        output += '\\';
    }
    for (let i = 0; i < $fieldGroups.length; i++) {
        output += FIELD_GROUP_PREFIX;

        // Get the array of fields within the field group
        let $fgFields = $($fieldGroups[i]).find('input');

        // use the data on the first input element to populate the first part of the SeSt preference
        // e.g. output = 'fieldGroup:.article-body .text-field/grad-background/'
        output += $($fgFields[0]).data('sel') + '/' + $($fgFields[0]).data('prop') + '/';

        for (let j = 0; j < $fgFields.length; j++) {
            output += '#' + $($fgFields[j]).data('val');
            if (j !== $fgFields.length - 1) {
                output += ',';
            }
        }
        // e.g. 'fieldGroup:.article-body .text-field/grad-background/#121212,#323232,#434343'
        if (i !== $fieldGroups.length - 1) {
            output += '\\';
        }
    }
    return output;
}

function refreshSeStPrefs() {
    // TODO: Add any other input types.
    let $sestForm = $("#sest-form");
    let $rangeElems = $sestForm.find("input[type=range]");
    for(let i = 0; i < $rangeElems.length; i++) {
        updateRange($($rangeElems[i]));
    }
    let $jscolorElems = $sestForm.find('input.jscolor');
    for(let i = 0; i < $jscolorElems.length; i++) {
        $jscolorElems[i].jscolor.fromString($jscolorElems[i].value);
        updateJsColor($jscolorElems[i].jscolor);
    }
}

function applySeStPrefs(prefs) {
    var prefsArray = prefs.split('\\');
    for (let i = 0; i < prefsArray.length; i++) {
        let pref = prefsArray[i].split('/');

        if (pref[0].startsWith(FIELD_GROUP_PREFIX)) {
            // Remove the field group prefix.
            pref[0] = pref[0].substring(FIELD_GROUP_PREFIX.length, pref[0].length);
            let $sestControl = $("input[data-sel='" + pref[0] + "'][data-prop='" + pref[1] + "']");
            switch (pref[1]) {
                case 'grad-background':
                    pref[1] = pref[1].substring(GRADIENT_PREFIX.length);
                    $(pref[0]).css(pref[1], 'linear-gradient(' + pref[2] + ')');
                    let fgVals = pref[2].split(',');
                    for (let j=0; j < fgVals.length; j++) {
                        let val = fgVals[j].substring(1);
                        $sestControl[j].jscolor.fromString(val);
                    }
                    break;
                default:
                    break;
            }
        } else {
            let $sestControl = $("input[data-sel='" + pref[0] + "'][data-prop='" + pref[1] + "']");
            if ($sestControl.attr('type') === 'range') {
                $sestControl.val(pref[2]);
                updateRange($sestControl);
            } else if ($sestControl.hasClass('jscolor')) {
                $sestControl[0].jscolor.fromString(pref[2]);
                updateJsColor($sestControl[0].jscolor);
            }
        }
    }
}

$(function() {
    var loadedPrefs = localStorage.getItem('sest-prefs');
    if (loadedPrefs !== null) {
        applySeStPrefs(loadedPrefs);
    }

    $("#sest-toggle").click(function() {
        $("#selfstyle").slideDown();
    });

    $("#sest-close-btn").click(function() {
        $("#selfstyle").slideUp();
    });

    $(".sest-form-row input[type=range]").on("change mousemove", function() {
        updateRange($(this));
    });

    $("#sest-form").submit(function(event) {
        localStorage.setItem('sest-prefs', outputSeStPrefs());
        event.preventDefault();
    });

    $("#sest-form button[type='reset']").click(function(event) {
        event.preventDefault();
        $("#sest-form")[0].reset();
        refreshSeStPrefs();
    });
});