import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';

interface GithubInsertFormProps {
  handleSubmit: (username: string) => void;
}

function GithubInsertForm({ handleSubmit }: GithubInsertFormProps) {
  const [value, setValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

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
