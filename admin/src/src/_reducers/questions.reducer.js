import {questionConstants} from '../_constants';

export function questions(state = {
    behavior: '',
    questions: {},
    question: {},
    loading: false,
    error: {},
    items: []
}, action) {
    console.log("question reducer");
    console.log(action);
    switch (action.type) {
        case questionConstants.GETALL_REQUEST:
            return Object.assign({}, state, {
                behavior: questionConstants.GETALL_REQUEST,
                loading: true
            });
        case questionConstants.GETALL_SUCCESS:
            console.log("questionConstants.GETALL_SUCCESS xxxx")
            return Object.assign({}, state, {
                behavior: questionConstants.GETALL_SUCCESS,
                questions:action.questions
            });

        case questionConstants.CREATE_SUCCESS:
            return Object.assign({}, state, {
                behavior: questionConstants.CREATE_SUCCESS,
                question:action.question
            });
        case questionConstants.UPDATE_SUCCESS:
            return Object.assign({}, state, {
                behavior: questionConstants.UPDATE_SUCCESS,
                question:action.question
            });

        case questionConstants.GETALL_FAILURE:
            return Object.assign({}, state, {
                behavior: questionConstants.GETALL_FAILURE,
                error: action.error
            });
        case questionConstants.CLEAR:
            return Object.assign({}, state, {
                behavior: '',
            });
        default:
            return state
    }
}