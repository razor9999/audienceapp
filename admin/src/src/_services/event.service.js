import {authHeader} from '../_helpers';
import {configConstants} from '../_constants/config.constants';
const queryString = require('query-string');

export const eventService = {
    update,
    create,
    getAll
};

function create(code, from,to,title) {
    const requestOptions = {
        method: 'POST',
        headers: Object.assign({}, authHeader(), {
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({code, from,to,title})
    };

    return fetch(configConstants.SERVER_URL + '/events/create', requestOptions)
        .then(response => {
            if (!response.ok) {
                return response.json().then(({errors}) => {
                    // bad request vendor of server renders this
                    console.log(errors);
                    if (response.status === 400) {
                        return Promise.reject(errors);
                    }
                })

            }

            return response.json();
        })
        .then(event => {
            return event;
        });
}

function update() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function getAll(pagination) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    let url = configConstants.SERVER_URL + '/events?'+queryString.stringify({
        pageIndex:pagination.pageIndex,
        current:pagination.current,
        pageSize: pagination.pageSize,
        orders: JSON.stringify(pagination.orders),


    });
    return fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {

                return response.json().then(({error, message}) => {
                    // bad request vendor of server renders this
                    if (response.status === 400) {
                        return Promise.reject({message:message});
                    }
                    // custom validator response
                    if (response.status === 401) {
                        return Promise.reject(error);
                    }

                })

            }

            return response.json();
        })
        .then(events => {
            return events;
        });

}

