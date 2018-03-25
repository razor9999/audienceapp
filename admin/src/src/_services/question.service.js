import {authHeader} from '../_helpers';
import {configConstants} from '../_constants/config.constants';
const queryString = require('query-string');

export const questionService = {
    update,
    getAll
};


function update(question) {
    // remove user from local storage to log user out
    console.log("Update ")
    const requestOptions = {
        method: 'PUT',
        headers: Object.assign({}, authHeader(), {
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(question)
    };

    return fetch(configConstants.SERVER_URL + '/questions/'+question.id, requestOptions)
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

function getAll(pagination) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    let url = configConstants.SERVER_URL + '/questions?'+queryString.stringify({
        pageIndex:pagination.pageIndex,
        current:pagination.current,
        pageSize: pagination.pageSize,
        orders: JSON.stringify(pagination.orders),
        code:pagination.code

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
        .then(questions => {
            return questions;
        });

}

