import {eventConstants} from '../_constants';

export function events(state = {
    behavior: '',
    event: {},
    loading: false,
    error: {},
    items: []
}, action) {
    console.log("event reducer");
    console.log(action);
    switch (action.type) {
        case eventConstants.GETALL_REQUEST:
            return Object.assign({}, state, {
                behavior: eventConstants.GETALL_REQUEST,
                loading: true
            });
        case eventConstants.GETALL_SUCCESS:
            return Object.assign({}, state, {
                behavior: eventConstants.GETALL_SUCCESS,
                events:action.events
            });

        case eventConstants.CREATE_SUCCESS:
            return Object.assign({}, state, {
                behavior: eventConstants.CREATE_SUCCESS,
                event:action.event
            });

        case eventConstants.GETALL_FAILURE:
            return Object.assign({}, state, {
                behavior: eventConstants.GETALL_FAILURE,
                error: action.error
            });
        case eventConstants.CLEAR:
            return Object.assign({}, state, {
                behavior: '',
            });
        default:
            return state
    }
}