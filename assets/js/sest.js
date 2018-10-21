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
const FIELD_GROUP_PREFIX = 'fieldGroup[';

/**
 * @param {jQuery} elem - the jQuery-selected SeSt input element.
 * @param {string} prop - the css property to be modified.
 * @param {string} value - the css value to use for the given property - Note that this is not always the literal value contained within `elem`.
 * @param {boolean} assign - indicates whether or not the value should be saved as an HTML property in the input element. 
 *                           Should be `true` for single fields, and `false` for fields within a field group.
 */
function selfStyle(elem, prop, value, assign) {
    var $elem = $(elem);
    $($elem.data('sel')).css(prop, value);
    if (assign) {
        $elem.data('val', value);
    }
}

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
            break;
        default:
            break;
    }

    selfStyle($elem, prop, value, true);
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
            value = jsColorElem.toHEXString();
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
            assign = false;
            break;
        default:
            break;
    }

    selfStyle($elem, prop, value, assign);
}

function outputSeStPrefs() {
    var output = '';

    // Get individual SeSt input fields.
    var $fields = $("#sest-form input.sest-field");
    for (let i = 0; i < $fields.length; i++) {
        var $f = $($fields[i]);
        // e.g. '.header-block/background/#131313'
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
        // e.g. '.article-body .text-field/grad-background/'
        output += $($fgFields[0]).data('sel') + '/' + $($fgFields[0]).data('prop') + '/';

        for (let j = 0; j < $fgFields.length; j++) {
            output += $($fgFields[j]).data('val');
            if (j !== $fgFields.length - 1) {
                output += ',';
            }
        }

        // e.g. 'fieldGroup[.article-body .text-field/grad-background/#121212,#323232,#434343]'
        output += ']';

        if (i !== $fieldGroups.length - 1) {
            output += '\\';
        }
    }
    return output;
}

function refreshSeStPrefs() {
    // TODO: Add any other input types.
    $(".sest-form-row input[type=range]").each(function(index, elem) {
        updateRange($(elem));
    });
}

function applySeStPrefs(prefs) {
    var prefsArray = prefs.split('\\');
    for (let i = 0; i < prefsArray.length; i++) {
        let pref = prefsArray[i].split('/');

        if (pref[0].startsWith(FIELD_GROUP_PREFIX)) {
            // Remove the field group prefix and closing bracket.
            pref[0] = pref[0].substring(FIELD_GROUP_PREFIX.length, pref.length);
            pref[2] = pref[2].substring(0, pref[2].length-1);

            
        } else {
            $(pref[0]).css(pref[1], pref[2]);
            var $sestInput = $("input[data-sel='" + pref[0] + "'][data-prop='" + pref[1] + "']");
            window[$sestInput.attr("type") + 'SeStInput']($sestInput, pref[1], pref[2]);
        }
    }
}

$(function() {
    var loadedPrefs = localStorage.getItem('sest-prefs');
    if (loadedPrefs === null) {
        loadedPrefs = outputSeStPrefs();
    } else {
        refreshSeStPrefs();
    }
    applySeStPrefs(loadedPrefs);

    $(".sest-toggle").click(function() {
        $(".selfstyle").slideDown();
    });

    $("#sest-close-btn").click(function() {
        $(".selfstyle").slideUp();
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