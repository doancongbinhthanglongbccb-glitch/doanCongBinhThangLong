import { useCallback, useState } from 'react';

const DEFAULT_FIELDS = {
  username: '',
  password: '',
};

export const useLoginForm = (submitter) => {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback((field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
    }
  }, [error]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setError('');

    const username = fields.username.trim();
    const password = fields.password;

    if (!username || !password.trim()) {
      setError('Vui long nhap day du ten dang nhap va mat khau.');
      return false;
    }

    try {
      setIsLoading(true);
      await submitter({ username, password });
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Dang nhap that bai. Vui long kiem tra lai thong tin.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fields.password, fields.username, submitter]);

  return {
    fields,
    handleChange,
    handleSubmit,
    isLoading,
    error,
    showPassword,
    toggleShowPassword,
  };
};

export default useLoginForm;
