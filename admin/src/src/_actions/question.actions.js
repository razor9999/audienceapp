import { questionConstants} from '../_constants';
import { questionService } from '../_services';
import { alertActions } from './';

export const questionActions = {
    clear,
    update,
    getAll
};

function update(question) {
    return dispatch => {
        dispatch(request({ question }));

        questionService.update(question)
            .then(
                question => {
                    dispatch(success(question));

                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(question) { return { type: questionConstants.UPDATE_REQUEST, question } }
    function success(question) { return { type: questionConstants.UPDATE_SUCCESS, question } }
    function failure(error) { return { type: questionConstants.UPDATE_FAILURE, error } }
}


function getAll(pagination) {
    return dispatch => {
        dispatch(request());

        questionService.getAll(pagination)
            .then(
                questions => dispatch(success(questions)),
                error => dispatch(failure(error))
            );
    };

    function request() { return { type: questionConstants.GETALL_REQUEST } }
    function success(questions) { return { type: questionConstants.GETALL_SUCCESS, questions } }
    function failure(error) { return { type: questionConstants.GETALL_FAILURE, error } }
}

function clear() {
    return { type: questionConstants.CLEAR };
}