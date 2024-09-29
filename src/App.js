import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newThread, setNewThread] = useState('');
  const [newPost, setNewPost] = useState('');
  const [postName, setPostName] = useState('');

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchPosts(selectedThread);
    }
  }, [selectedThread]);

  async function fetchThreads() {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching threads:', error);
    else setThreads(data);
  }

  async function fetchPosts(threadId) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at');
    
    if (error) console.error('Error fetching posts:', error);
    else setPosts(data);
  }

  async function handleThreadSubmit(e) {
    e.preventDefault();
    if (!newThread.trim()) return;

    const { data, error } = await supabase
      .from('threads')
      .insert([{ title: newThread }]);

    if (error) console.error('Error adding thread:', error);
    else {
      setNewThread('');
      fetchThreads();
    }
  }

  async function handlePostSubmit(e) {
    e.preventDefault();
    if (!newPost.trim() || !selectedThread) return;

    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        content: newPost, 
        thread_id: selectedThread,
        author_name: postName.trim() || 'Anonymous'
      }]);

    if (error) console.error('Error adding post:', error);
    else {
      setNewPost('');
      fetchPosts(selectedThread);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">NTUMED 討論區</h1>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">討論串</h2>
              <form onSubmit={handleThreadSubmit} className="mb-4">
                <input
                  type="text"
                  value={newThread}
                  onChange={(e) => setNewThread(e.target.value)}
                  placeholder="新增討論串..."
                  className="w-full p-2 border rounded"
                />
                <button type="submit" className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                  新增討論串
                </button>
              </form>
              <ul className="space-y-2">
                {threads.map((thread) => (
                  <li 
                    key={thread.id}
                    onClick={() => setSelectedThread(thread.id)}
                    className={`p-2 rounded cursor-pointer ${selectedThread === thread.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    {thread.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedThread && (
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">
                  {threads.find(t => t.id === selectedThread)?.title}
                </h2>
                <form onSubmit={handlePostSubmit} className="mb-4">
                  <input
                    type="text"
                    value={postName}
                    onChange={(e) => setPostName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full p-2 border rounded mb-2"
                  />
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="寫下你的回覆..."
                    className="w-full p-2 border rounded h-24"
                  />
                  <button type="submit" className="mt-2 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
                    發布
                  </button>
                </form>
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <div key={post.id} className="border-b pb-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{index + 1}. {post.author_name}</span>
                        <span>{new Date(post.created_at).toLocaleString()}</span>
                      </div>
                      <p className="mt-1">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;