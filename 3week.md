## TypeScript Redux-Saga

`Redux Saga는 redux-thunk같이 서버에 데이터를 요청하거나 보내는 비동기처리를 할때 많이 사용 되는 라이브러리이다. Redux-saga는 액션을 모니터링 하고있다가 그 액션이 발생하면 우리가 설정 해 놓은 특정 작업을 하는방식으로 사용된다.`

`saga는 generator함수로 되어있다. 간단하게 generator문법에 대해 보면`

```javascript
function* generatorFunc() {
  console.log('msg1');
  yield 1;
  console.log('msg2');
  yield 2;
  console.log('msg3');
  yield 3;
}

const generatorObj = generatorFunc(); //제너레이터 객체 생성
generatorObj.next(); // msg1, {value : 1, done : false}
//첫번째 yild까지 실행
generatorObj.next(); // msg2, {value : 2, done : false}
//두번째 yild까지 실행
generatorObj.next(); // msg3, {value : 3, done : false}
//세번째 yild까지 실행
generatorObj.next(); // msg3, {value : undefined, done : true}
//next를 했지만 yield가 없으므로 return값이 없고 함수는 종료
```

`처음에 generatorFunc()로 제너레이터 객체를 생성하면 이 함수는 대기상태가 된다. 제너레이터 객체의 내장메서드 next()를 하면 다음에 나오는 yield의 뒷부분까지의 코드를 실행시키고 그 yield뒤의 return값을 value에 담고 제너레이터의 종료 여부를 done에 담은 객체를 return 한다.`

`redux사가에 사용예제를 보면`

```typescript
const GET_DATA = 'data/GET_DATA'; // 액션명 정의
export const getData = (value) => {
  type: GET_DATA;
}; // 액션 생성함수

// 우리가 특정 액션 발생시 실행하고 싶은 비동기 로직함수
// 순서대로 api요청을 하고 데이터 로드성공시 success action을 dispatch 해준다.
//  여기서 call은 뒤의 함수를 실행시키는것이고, put은 dispatch와 같다고 보면된다.
function* asyncLogicFunc() {
  try {
    const reponse = yield call(apiFunc, param);
    yield put({
      type: GET_DATA_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: GET_DATA_FAILURE,
      payload: e,
      error: true,
    });
  }
}

// GET_DATA 액션이 발생하는지 모니터링하는 사가함수
// GET_DATA 액션이 발생하면 asyncLogicFunc에 해당 actionName에 해당하는 액션객체를 asyncLogicFunc에 파라미터로 전달하고 실행시킨다.

export function* testSaga() {
  yield takeLatest(GET_DATA, asyncLogicFunc);
}

// index.js의 rootSaga
// 액션을 모니터링하는 사가를 rootSaga에 등록 시켜놓는다.
// 이 saga함수를 rootSaga에 넣고 rootSaga를 sagaMiddleware에 넣고 실행시키면 rootSaga안의 모든 사가함수를 실행시켜서 액션 대기상태로 해준다.

import testSaga from './data';

function* rootSaga() {
  yield all([testSaga()]); // rootSaga가 실행되면 그 안의 saga함수들은 액션 대기상태가 된다.
}

// 이상태에서
import getData from './data';
dispatch(getData());

/*
 *이렇게 컴포넌트에서 액션을 생성함수를 호출하고 dispatch를 하면
 *{type:GET_DATA}라는 액션이 발생되고 이 액션은 리듀서에 전달 되기전에 testSaga안의 yield문에서 걸리고 asyncLogicFunc를 실행시켜서 비동기 요청을 하고 그 값을 성공,실패 여부 액션에 담아서 dispatch한다.
 */
```

`사가의 동작원리를 간단하게 설명하면 rootSaga에 해당 모듈에서 쓸 saga함수를 넣고 rootsaga를 미들웨어에 등록해놓으면 rootSaga는 그 안에있는 saga함수들을 실행시켜주고 그 saga함수들은 액션 대기상태가 된다. 그리고 그 saga함수에 해당하는 액션이 dispatch되면 그 액션을 중간에서 가로채서 그 해당액션에 대한 제너레이터 함수를 yield 순서대로 실행시켜준다.`
