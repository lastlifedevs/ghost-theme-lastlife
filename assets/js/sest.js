/*!
 * SelfStyle 
 *
 * Copyright 2018 Joshua Balanuik
 * Released under the Apache License 2.0
 */

function selfStyle(elem, prop, value) {
    var $elem = $(elem);
    $($elem.attr("data-sel")).css(prop, value);
    $elem.attr("data-val", value);
}

function updateRange(rangeElem) {
    var $elem = $(rangeElem);
    var prop = $elem.attr("data-prop");
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

function updateMultiRange(rangeGroupElem) {
    var $ranges = $(rangeGroupElem);
    var prop = $ranges.attr("data-prop");
    var value = '';

    // Assuming we'll get ranges as an array. Make sure to actually do this.
    switch (prop) {
        case 'color':
        case 'background':
            value += 'rgb(' + $ranges[0].val() + ',' + $ranges[1].val() + ',' + $ranges[2].val() + ')';
            break;
        case 'alpha-color':
        case 'alpha-background':
            value += 'rgba(' + $ranges[0].val() + ',' + $ranges[1].val() + ',' + $ranges[2].val() + ',' + $ranges[3].val() + ')';
            prop = prop.substring(6);
            break;
        default:
            break;
    }

    selfStyle($ranges, prop, value);
}

$(".sest-form-row input[type=range]").on("change mousemove", function() {
    updateRange($(this));
});

function outputSeStPrefs() {
    var output = '';
    var $inputs = $(".sest-form-row input");
    $inputs.each(function(index) {
        var $e = $(this);
        output += $e.attr("data-sel") + '/' + $e.attr("data-prop") + '/' + $e.attr("data-val");
        if (index !== $inputs.length - 1) {
            output += '\\';
        }
    });
    return output;
}

$("#sest-form").submit(function(event) {
    localStorage.setItem('sest-prefs', outputSeStPrefs());
    event.preventDefault();
})

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