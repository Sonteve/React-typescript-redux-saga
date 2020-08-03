import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import rootReducer, { rootSaga } from './modules/';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';

// 미들웨어를 생성한다.
const sagaMiddleware = createSagaMiddleware();
// applyMiddleware를 사용하여 만든 미들웨어를 적용해준다.
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);
// 모듈 별 사가를 모아서 만든 rootSaga를 등록하여 실행한다.
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
