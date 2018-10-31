window.addEventListener('load', function() {
    const main = document.querySelector('.main');

    if (localStorage.username) {
        for (const element of document.querySelectorAll('.username')) {
            element.innerHTML = localStorage.username;
            element.href = 'javascript:APP.logout();';
        }
    }

    if (localStorage.email != null) {
        for (const element of document.querySelectorAll('.email')) {
            element.innerHTML = localStorage.email;
        }
    }

    if (localStorage.pending == 'true') {
        APP.pending(localStorage.email, function(json) {
            if (json.pending) {
                document.querySelector('.error-main').setAttribute('style', '');
            } else {
                localStorage.pending = 'false';
            }
        });
    }

    if (localStorage.userKey == null) {
        const element = document.createElement('p');
        element.innerHTML = 'You are not logged in. Click <b><a href="login.html" style="display: inline">here</a></b> to log in or create an account.'
        element.classList.add('center-full');
        element.style.textAlign = 'center'
        document.body.appendChild(element);

        main.setAttribute('style', 'display: none');
        document.querySelector('.logout').setAttribute('style', 'display: none');
    } else {
        main.addEventListener('input', function() {
            APP.write(main.value);
        });

        const websocket = new WebSocket('ws://192.168.0.11:1234');
        websocket.onmessage = function(data) {
            data = JSON.parse(data.data);

            if (data.success) {
                main.value = data.text;
            } else {
                const error = document.querySelector('.error-main');
                error.innerHTML = 'An error occurred when trying to read your data: <b>' + data.error + '</b>';
                error.setAttribute('style', '');
            }
        };

        websocket.onopen = function() {
            websocket.send(localStorage.userKey);
            setInterval(function() {
                websocket.send(localStorage.userKey);
            }, 100);
        };
    }
});