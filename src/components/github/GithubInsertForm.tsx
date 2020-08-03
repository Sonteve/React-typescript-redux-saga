import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';

// 받아올 props에 대한 interface
interface GithubInsertFormProps {
  handleSubmit: (username: string) => void;
}

// user에게 github username을 입력받는 컴포넌트
function GithubInsertForm({ handleSubmit }: GithubInsertFormProps) {
  // 해당컴포넌트에서 input값을 관리하기위한 state
  const [value, setValue] = useState<string>('');
  // 유저이름 입력후 focus를 위한 useRef
  const inputRef = useRef<HTMLInputElement>(null);

  // input값이 바뀔때마다 setValue로 해당 컴포넌트의 value를 바꿔준다.
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  // username 입력후 검색버튼을 눌렀을때 상위 비동기 요청 시작을 위해 상위
  // 컴포넌트로 현재 컴포넌트의 value값을 넘겨주고 input을 비우고 focus한다.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(value);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        value={value}
        placeholder="Input github username"
        onChange={onChange}
      />
      <button type="submit">검색</button>
    </form>
  );
}

export default GithubInsertForm;
