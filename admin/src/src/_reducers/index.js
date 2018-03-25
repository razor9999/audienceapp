import {combineReducers} from 'redux';

import {authentication} from './authentication.reducer';
import {events} from './events.reducer';
import {users} from './users.reducer';
import {alert} from './alert.reducer';
import {questions} from './questions.reducer';

const rootReducer = combineReducers({
    events,
    authentication,
    users,
    alert,
    questions
});

export default rootReducer;