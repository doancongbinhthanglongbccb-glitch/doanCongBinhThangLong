import { useCallback, useState } from 'react';

export const useFallbackEditor = ({
  initialForm,
  onAdd,
  onSave,
  onDelete,
  getDeleteMessage,
  confirm,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const resetForm = useCallback(() => {
    setForm(initialForm);
  }, [initialForm]);

  const setFormField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
    }
  }, [error]);

  const handleEdit = useCallback((item, mapItemToForm) => {
    setEditingId(item.id);
    setError('');
    setForm(mapItemToForm ? mapItemToForm(item) : {
      ...initialForm,
      ...item,
    });
  }, [initialForm]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setError('');
    resetForm();
  }, [resetForm]);

  const handleAdd = useCallback(async () => {
    try {
      await onAdd(form);
      setError('');
      resetForm();
    } catch (err) {
      setError(err.message || 'Khong the them du lieu.');
    }
  }, [form, onAdd, resetForm]);

  const handleSave = useCallback(async () => {
    try {
      await onSave(editingId, form);
      setError('');
      setEditingId(null);
      resetForm();
    } catch (err) {
      setError(err.message || 'Khong the luu du lieu.');
    }
  }, [editingId, form, onSave, resetForm]);

  const handleDelete = useCallback(async (item) => {
    const message = getDeleteMessage ? getDeleteMessage(item) : 'Xac nhan xoa?';
    const accepted = await confirm({ message });
    if (!accepted) {
      return;
    }

    await onDelete(item);

    if (editingId === item.id) {
      setEditingId(null);
      resetForm();
    }
  }, [confirm, editingId, getDeleteMessage, onDelete, resetForm]);

  return {
    editingId,
    form,
    error,
    handleEdit,
    handleSave,
    handleAdd,
    handleCancel,
    handleDelete,
    setFormField,
  };
};

export default useFallbackEditor;
