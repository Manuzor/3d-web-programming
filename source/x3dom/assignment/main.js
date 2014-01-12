var zoomed = false;

function toggle(button) {
    var canvas = document.getElementById('canvas');

    var hideThis = document.getElementById('hideThis');
    var body  = document.getElementById('body');

    if (zoomed) {
        canvas.style.width = canvas.style.height = "50%";
        button.innerHTML = "Maximize";
        hideThis.style.display = "block";
        body.style.padding = '10px';
    } else {
        canvas.style.width = canvas.style.height = "100%";
        button.innerHTML = "Minimize";
        hideThis.style.display = "none";
        body.style.padding = '0';
    }

    zoomed = !zoomed;
}

function pick (object) {
    if (object.id == "theBall") {
        timer = document.getElementById("timer");
        if (timer.enabled == "true") {
            timer.enabled = "false";
        } else {
            timer.enabled = "true";
        };
    };
}

function playSound (a, b, c, d, e, f, g, h, i) {
    alert("yay!")
}

function changeColor (color) {
    tex = document.getElementById('IM_soccerball_png');
    tex.url = color;
}

// Misc helpers
function toggle_info_section(id) {
    var e = document.getElementById(id);
    if(e.style.display == 'none') {
        e.style.display = 'block';
    } else {
        e.style.display = 'none';
    }
}
