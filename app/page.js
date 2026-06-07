'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const empty = { title: '', content: '', topic: '', tags: '' };

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const configured =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setNotes(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (configured) load();
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm() {
    setForm(empty);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return;

    const payload = {
      title: form.title.trim(),
      content: form.content.trim() || null,
      topic: form.topic.trim() || null,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    let res;
    if (editingId) {
      res = await supabase.from('notes').update(payload).eq('id', editingId);
    } else {
      res = await supabase.from('notes').insert(payload);
    }
    if (res.error) {
      setError(res.error.message);
      return;
    }
    resetForm();
    load();
  }

  function startEdit(note) {
    setEditingId(note.id);
    setForm({
      title: note.title || '',
      content: note.content || '',
      topic: note.topic || '',
      tags: (note.tags || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id) {
    if (!confirm('Xóa ghi chú này?')) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) setError(error.message);
    else load();
  }

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return (
      !q ||
      n.title?.toLowerCase().includes(q) ||
      n.content?.toLowerCase().includes(q) ||
      n.topic?.toLowerCase().includes(q) ||
      (n.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="container">
      <header>
        <h1>📚 Knowledge Management</h1>
        <p>Lưu trữ và quản lý kiến thức, ghi chú của bạn</p>
      </header>

      {!configured && (
        <div className="banner">
          Chưa cấu hình Supabase. Hãy tạo file <b>.env.local</b> với
          NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY (xem README).
        </div>
      )}

      <form className="card" onSubmit={handleSubmit}>
        <div className="row">
          <label>Tiêu đề *</label>
          <input
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="VD: Cách hoạt động của React Hooks"
            required
          />
        </div>
        <div className="grid-2 row">
          <div>
            <label>Chủ đề</label>
            <input
              value={form.topic}
              onChange={(e) => update('topic', e.target.value)}
              placeholder="VD: Lập trình"
            />
          </div>
          <div>
            <label>Tags (phân cách bằng dấu phẩy)</label>
            <input
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="react, frontend, hooks"
            />
          </div>
        </div>
        <div className="row">
          <label>Nội dung</label>
          <textarea
            value={form.content}
            onChange={(e) => update('content', e.target.value)}
            placeholder="Nội dung ghi chú..."
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={!configured}>
            {editingId ? 'Cập nhật' : 'Thêm ghi chú'}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={resetForm}>
              Hủy
            </button>
          )}
        </div>
      </form>

      {error && <div className="banner">Lỗi: {error}</div>}

      <div className="toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm kiếm theo tiêu đề, nội dung, chủ đề, tag..."
        />
        <button className="secondary" onClick={load} disabled={!configured}>
          Tải lại
        </button>
      </div>

      {loading ? (
        <p className="empty">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="empty">Chưa có ghi chú nào.</p>
      ) : (
        filtered.map((n) => (
          <div className="note" key={n.id}>
            <h3>{n.title}</h3>
            <div className="meta">
              {n.topic ? `${n.topic} · ` : ''}
              {new Date(n.created_at).toLocaleString('vi-VN')}
            </div>
            {n.content && <div className="body">{n.content}</div>}
            {n.tags?.length > 0 && (
              <div className="tags">
                {n.tags.map((t) => (
                  <span className="tag" key={t}>
                    #{t}
                  </span>
                ))}
              </div>
            )}
            <div className="actions">
              <button className="link" onClick={() => startEdit(n)}>
                Sửa
              </button>
              <button className="danger" onClick={() => remove(n.id)}>
                Xóa
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
