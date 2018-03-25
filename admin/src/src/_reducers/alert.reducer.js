import {alertConstants} from '../_constants';
import {message} from 'antd';

export function alert(state = {}, action) {
    switch (action.type) {
        case alertConstants.SUCCESS:
            message.success(action.message);

            return {
                type: 'alert-success',
                message: action.message
            };
        case alertConstants.ERROR:
            let {error,} = action;
            if (error.message !== undefined) {
                message.error(error.message);
                return {};

            }
            if (error[0] !== undefined) {
                let {0: error} = action.error;
                if (error.messages) {
                    let {0: text} = error.messages;
                    message.error(text);
                } else {
                    message.error("Sorry, We could not connect to server right now");
                }

            } else {
                message.error(action.error.message);

            }

            return {};
        case alertConstants.CLEAR:
            return {};
        default:
            return state
    }
}