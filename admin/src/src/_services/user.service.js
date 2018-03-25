import { authHeader } from '../_helpers';
import { configConstants } from '../_constants/config.constants';

export const userService = {
    login,
    logout,
    getAll
};

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    };

    return fetch(configConstants.SERVER_URL+'/users/login', requestOptions)
        .then(response => {
            if (!response.ok) {
                return response.json().then(({errors}) => {
                    console.log(errors);
                    return Promise.reject(errors);
                })


            }

            return response.json();
        })
        .then(user => {

            // login successful if there's a jwt token in the response
            if (user && user.token) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
            }

            return user;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch('/users', requestOptions).then(handleResponse);
}

function handleResponse(response) {
    if (!response.ok) {

        return response.json().then(({error}) => {
            return Promise.reject(error);
        })

    }

    return response.json();
}