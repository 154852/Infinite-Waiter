window.addEventListener('load', function() {
    const signupError = document.querySelector('.signup .error');
    const signupButton = document.querySelector('.signup .button');
    signupButton.addEventListener('click', function() {
        const data = {
            username: document.getElementsByName('username')[0].value,
            email: document.getElementsByName('cr-email')[0].value,
            password: document.getElementsByName('cr-password')[0].value,
            confirm: document.getElementsByName('confirm-password')[0].value
        };

        if (data.password != data.confirm) {
            signupError.setAttribute('style', '');
            signupError.innerHTML = 'The confirmed password must match the password.';
            return;
        }

        APP.signup(data.username, data.password, data.email, function() {
            window.open('index.html', '_self');
        }, function(json) {
            signupError.setAttribute('style', '');
            signupError.innerHTML = 'Sorry, there was an error creating your account. <b>' + json.error + '</b>';
        });
    });

    document.querySelector('.signup').addEventListener('keyup', function(event) {
        if (event.keyCode == 13) {
            signupButton.click();
        }
    });

    const loginError = document.querySelector('.login .error');
    const loginButton = document.querySelector('.login .button');
    loginButton.addEventListener('click', function() {
        const data = {
            email: document.getElementsByName('li-email')[0].value,
            password: document.getElementsByName('li-password')[0].value
        };

        APP.login(data.email, data.password, function() {
            window.open('index.html', '_self');
        }, function(json) {
            loginError.setAttribute('style', '');
            loginError.innerHTML = 'Sorry, there was an error logging into your account. <b>' + json.error + '</b>';
        });
    });

    document.querySelector('.login').addEventListener('keyup', function(event) {
        if (event.keyCode == 13) {
            loginButton.click();
        }
    });

    let open = 1;
    for (const element of document.querySelectorAll('.switch')) {
        element.addEventListener('click', function() {
            document.body.children[open + 1].setAttribute('style', 'display: none');
            open = (open + 1) % 2;
            document.body.children[open + 1].setAttribute('style', '');
        });;
    }
});