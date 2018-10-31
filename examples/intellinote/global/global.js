const APP = {};

APP.signup = function(username, password, email, success, error) {
    const request = new XMLHttpRequest();
    request.onload = function() {
        if (this.status == 200) {
            if (success != null) success(this.response);
        } else {
            if (error != null) error(this.response);
        }
    };
    request.responseType = 'json';

    request.open('POST', '/signup?username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&email=' + encodeURIComponent(email));
    request.send();

    localStorage.pending = true;
    localStorage.email = email;
};

APP.confirm = function(id, success, error) {
    const request = new XMLHttpRequest();
    request.onload = function() {
        if (this.status == 200) {
            localStorage.pending = false;

            localStorage.userKey = this.response.key;
            localStorage.username = this.response.username;
            if (success != null) success(this.response);
        } else {
            if (error != null) error(this.response);
        }
    };
    request.responseType = 'json';

    request.open('POST', '/confirm?id=' + encodeURIComponent(id));
    request.send();
}

APP.login = function(email, password, success, error) {
    const request = new XMLHttpRequest();
    request.onload = function() {
        if (this.status == 200) {
            localStorage.userKey = this.response.key;
            localStorage.username = this.response.username;
            if (success != null) success(this.response);
        } else {
            if (error != null) error(this.response);
        }
    };
    request.responseType = 'json';

    request.open('GET', '/key?password=' + encodeURIComponent(password) + '&email=' + encodeURIComponent(email));
    request.send();
};

APP.logout = function(success, error) {
    const request = new XMLHttpRequest();
    request.onload = function() {
        if (this.status == 200) {
            if (success != null) success(this.response);
        } else {
            if (error != null) error(this.response);
        }

        localStorage.clear();
        window.location.reload();
    };
    request.responseType = 'json';

    request.open('GET', '/logout?key=' + encodeURIComponent(localStorage.userKey));
    request.send();
}

APP.read = function(success, error) {
    const request = new XMLHttpRequest();
    request.onload = function() {
        if (this.status == 200) {
            success(this.response);
        } else {
            if (error != null) error(this.response);
        }
    };
    request.responseType = 'json';

    request.open('GET', '/read?key=' + encodeURIComponent(localStorage.userKey));
    request.send();
}

APP.write = function(text, success, error) {
    const request = new XMLHttpRequest();
    request.onload = function() {
        if (this.status == 200) {
            if (success != null) success(this.response);
        } else {
            if (error != null) error(this.response);
        }
    };
    request.responseType = 'json';

    request.open('POST', '/write?key=' + encodeURIComponent(localStorage.userKey) + '&text=' + encodeURIComponent(text));
    request.send();
}

APP.pending = function(email, success, error) {
    const request = new XMLHttpRequest();
    request.onload = function() {
        if (this.status == 200) {
            if (success != null) success(this.response);
        } else {
            if (error != null) error(this.response);
        }
    };
    request.responseType = 'json';

    request.open('GET', '/pending?email=' + encodeURIComponent(email));
    request.send();
}