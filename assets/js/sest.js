/*!
 * SelfStyle 
 *
 * Copyright 2018 Joshua Balanuik
 * Released under the Apache License 2.0
 */

const GRADIENT_PREFIX = 'grad-';

function selfStyle(elem, prop, value) {
    var $elem = $(elem);
    $($elem.data('sel')).css(prop, value);
    $elem.data('val', value);
}

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

    selfStyle($elem, prop, value);
}

function updateJsColor(jsColorElem) {
    var $elem = $(jsColorElem.valueElement);
    var prop = $elem.data('prop');
    var value = '';

    switch(prop) {
        case 'color':
            value = jsColorElem.toHEXString();
            break;
        case 'grad-background':
            prop = prop.substring(GRADIENT_PREFIX.length);
            // Get the field group this color stop belongs to.
            let fgVal = $elem.data('fg');
            if (fgVal === undefined) return;
            let fg = $(".sest-field-group [data-fg=" + fgVal + "]");
            value = "linear-gradient(#"
            for (let i = 0; i < fg.length; i++) {
                value += fg[i].value;
                if(i !== fg.length-1) {
                    value += ", #"
                }
            }
            value += ")";
            break;
        default:
            break;
    }
    
    selfStyle($elem, prop, value);
}

$(".sest-form-row input[type=range]").on("change mousemove", function() {
    updateRange($(this));
});

function outputSeStPrefs() {
    var output = '';
    var $fields = $("#sest-form input.sest-field");
    for (let i = 0; i < $fields.length; i++) {
        var $e = $(fields[i]);
        output += $e.data('sel') + '/' + $e.data('prop') + '/' + $e.data('val');
        if (index !== $fields.length - 1) {
            output += '\\';
        }
    }
    var $fieldGroups = $("#sest-form .sest-field-group");
    if (output !== '' && $fieldGroups.length > 0) {
        output += '\\';
    }
    for (let i = 0; i < $fieldGroups.length; i++) {
        // TODO: Use field group elem to save properties and selectors?
        let $fields = $($fieldGroups[i]).find('input');
    }
    return output;
}

$("#sest-form").submit(function(event) {
    localStorage.setItem('sest-prefs', outputSeStPrefs());
    event.preventDefault();
});

$("#sest-form button[type='reset']").click(function(event) {
    event.preventDefault();
    $("#sest-form")[0].reset();
    refreshSeStPrefs();
});

function refreshSeStPrefs() {
    // TODO: Add any other input types.
    $(".sest-form-row input[type=range]").each(function(index, elem) {
        updateRange($(elem));
    });
}

function rangeSeStInput(input, prop, value) {
    var val = '';
    switch (prop) {
        case 'color':
            val = value.split(',')[1];
            break;
        default:
            break;
    }
    $(input).val(val);
}

function applySeStPrefs(prefs) {
    var rulesets = prefs.split('\\');
    rulesets.forEach(function(rs) {
        var r = rs.split('/');
        if (r[2] !== 'undefined') {
            $(r[0]).css(r[1], r[2]);
            var $sestInput = $("input[data-sel='" + r[0] + "'][data-prop='" + r[1] + "']");
            window[$sestInput.attr("type") + 'SeStInput']($sestInput, r[1], r[2]);
        }
    });
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
    })
});