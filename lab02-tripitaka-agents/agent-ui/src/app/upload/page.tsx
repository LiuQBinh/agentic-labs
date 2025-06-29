'use client'
import React, { useState } from 'react';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (url) {
        formData.append('url', url);
      }
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Tải lên thành công!');
      } else {
        setMessage(data.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      setMessage('Có lỗi xảy ra khi tải lên.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Upload PDF hoặc nhập URL PDF</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Chọn file PDF</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>
        <div className="flex items-center justify-center text-gray-500">Hoặc</div>
        <div>
          <label className="block mb-1 font-medium">Nhập URL PDF</label>
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/file.pdf"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || (!file && !url)}
        >
          {loading ? 'Đang tải lên...' : 'Tải lên'}
        </button>
        {message && <div className="mt-2 text-center text-green-600">{message}</div>}
      </form>
    </div>
  );
};

export default UploadPage; 