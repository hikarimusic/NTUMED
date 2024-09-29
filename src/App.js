import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function App() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newThread, setNewThread] = useState('');
  const [newPost, setNewPost] = useState('');
  const [postName, setPostName] = useState('');
  const [dailyCase, setDailyCase] = useState(null);
  const [topNews, setTopNews] = useState(null);

  useEffect(() => {
    fetchThreads();
    fetchDailyCase();
    fetchTopNews();
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

  async function fetchDailyCase() {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('title', 'THE CASE')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching daily case:', error);
      setDailyCase(null);
    } else {
      setDailyCase(data);
    }
  }

  async function fetchTopNews() {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('title', 'TOP NEWS')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching top news:', error);
      setTopNews(null);
    } else {
      setTopNews(data);
    }
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

    // Prevent users from creating "THE CASE" or "TOP NEWS" threads
    if (newThread.toUpperCase() === 'THE CASE' || newThread.toUpperCase() === 'TOP NEWS') {
      alert('Only administrators can create THE CASE or TOP NEWS threads.');
      return;
    }

    const { data, error } = await supabase
      .from('threads')
      .insert([{ title: newThread }])
      .select();

    if (error) {
      console.error('Error adding thread:', error);
    } else if (data && data[0]) {
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

  // Function to check for new daily case and top news
  async function checkForUpdates() {
    await fetchDailyCase();
    await fetchTopNews();
    fetchThreads(); // Refresh all threads to include any new special threads
  }

  // Call this function periodically or when the app regains focus
  useEffect(() => {
    const interval = setInterval(checkForUpdates, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">NTUMED 討論區</h1>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold mb-4">今日病例</h2>
              {dailyCase ? (
                <div 
                  onClick={() => setSelectedThread(dailyCase.id)}
                  className="p-2 bg-yellow-100 rounded cursor-pointer hover:bg-yellow-200"
                >
                  <strong>THE CASE</strong>
                  <p className="text-sm text-gray-600">
                    {new Date(dailyCase.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p>No case available today.</p>
              )}
            </div>
            <div className="bg-white shadow rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold mb-4">重要訊息</h2>
              {topNews ? (
                <div 
                  onClick={() => setSelectedThread(topNews.id)}
                  className="p-2 bg-yellow-100 rounded cursor-pointer hover:bg-yellow-200"
                >
                  <strong>TOP NEWS</strong>
                  <p className="text-sm text-gray-600">
                    {new Date(topNews.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p>No important news available.</p>
              )}
            </div>
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
                    {(thread.title === 'THE CASE' || thread.title === 'TOP NEWS') 
                      ? `${thread.title} [${new Date(thread.created_at).toLocaleDateString()}]`
                      : thread.title}
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
                  {(threads.find(t => t.id === selectedThread)?.title === 'THE CASE' || 
                    threads.find(t => t.id === selectedThread)?.title === 'TOP NEWS') && 
                    ` [${new Date(threads.find(t => t.id === selectedThread)?.created_at).toLocaleDateString()}]`}
                </h2>
                <div className="space-y-4 mb-6">
                  {posts.map((post, index) => (
                    <div key={post.id} className="border-b pb-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{index + 1}. {post.author_name}</span>
                        <span>{new Date(post.created_at).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {post.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handlePostSubmit} className="mt-6">
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
                    placeholder="寫下你的回覆... (支援 Markdown 語法)"
                    className="w-full p-2 border rounded h-24"
                  />
                  <button type="submit" className="mt-2 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
                    發布
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;