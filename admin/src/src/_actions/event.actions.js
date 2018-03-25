import { eventConstants} from '../_constants';
import { eventService } from '../_services';
import { alertActions } from './';

export const eventActions = {
    clear,
    create,
    update,
    getAll
};

function create(code, from,to, title) {
    return dispatch => {
        dispatch(request({ code }));

        eventService.create(code, from,to,title)
            .then(
                event => {
                    dispatch(success(event));

                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(event) { return { type: eventConstants.CREATE_REQUEST, event } }
    function success(event) { return { type: eventConstants.CREATE_SUCCESS, event } }
    function failure(error) { return { type: eventConstants.CREATE_FAILURE, error } }
}

function update() {

    eventService.logout();

    return { type: eventConstants.LOGOUT };
}

function getAll(pagination) {
    return dispatch => {
        dispatch(request());

        eventService.getAll(pagination)
            .then(
                events => dispatch(success(events)),
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: eventConstants.GETALL_REQUEST } }
    function success(events) { return { type: eventConstants.GETALL_SUCCESS, events } }
    function failure(error) { return { type: eventConstants.GETALL_FAILURE, error } }
}

function clear() {
    return { type: eventConstants.CLEAR };
}