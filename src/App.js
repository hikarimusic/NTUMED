import React, { useState, useEffect, useRef } from 'react';
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
  const [drawIt, setDrawIt] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAllThreads, setShowAllThreads] = useState(false);

  useEffect(() => {
    fetchThreads();
    fetchDailyCase();
    fetchTopNews();
    fetchDrawIt();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchPosts(selectedThread);
    }
  }, [selectedThread]);

  useEffect(() => {
    if (isDrawingMode && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      contextRef.current = ctx;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add touch event listeners
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchmove', handleTouchMove);
      canvas.addEventListener('touchend', handleTouchEnd);

      // Remove event listeners on cleanup
      return () => {
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDrawingMode]);

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

  async function fetchDrawIt() {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('title', 'DRAW IT')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching DRAW IT:', error);
      setDrawIt(null);
    } else {
      setDrawIt(data);
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

    const { data, error } = await supabase
      .from('threads')
      .insert([{ title: newThread }])
      .select();

    if (error) {
      console.error('Error adding thread:', error);
    } else if (data && data[0]) {
      setNewThread('');
      fetchThreads();
      if (newThread.toUpperCase() === 'DRAW IT') {
        fetchDrawIt();
      }
    }
  }

  async function handlePostSubmit(e) {
    e.preventDefault();
    if ((!newPost.trim() && !isDrawingMode) || !selectedThread) return;

    let content = newPost;
    if (isDrawingMode && canvasRef.current) {
      const canvas = canvasRef.current;
      content = canvas.toDataURL();
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        content: content, 
        thread_id: selectedThread,
        author_name: postName.trim() || 'Anonymous',
        is_drawing: isDrawingMode
      }]);

    if (error) console.error('Error adding post:', error);
    else {
      setNewPost('');
      setIsDrawingMode(false);
      fetchPosts(selectedThread);
    }
  }

  function handleDrawingModeToggle() {
    setIsDrawingMode(!isDrawingMode);
  }

  // Touch event handlers
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleTouchMove = (e) => {
    // if (!isDrawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // Mouse event handlers
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  async function checkForUpdates() {
    await fetchDailyCase();
    await fetchTopNews();
    await fetchDrawIt();
    fetchThreads();
  }

  useEffect(() => {
    const interval = setInterval(checkForUpdates, 60000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">NTUMED 討論區</h1>
          <nav>
            <button 
              onClick={() => setShowAllThreads(!showAllThreads)} 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {showAllThreads ? "回到最新討論" : "查看所有討論串"}
            </button>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            {!showAllThreads && (
              <>
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
                <div className="bg-white shadow rounded-lg p-4 mb-4">
                  <h2 className="text-xl font-semibold mb-4">你畫我猜</h2>
                  {drawIt ? (
                    <div 
                      onClick={() => setSelectedThread(drawIt.id)}
                      className="p-2 bg-yellow-100 rounded cursor-pointer hover:bg-yellow-200"
                    >
                      <strong>DRAW IT</strong>
                      <p className="text-sm text-gray-600">
                        {new Date(drawIt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p>No active drawing game.</p>
                  )}
                </div>
              </>
            )}
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">{showAllThreads ? "所有討論" : "最新討論"}</h2>
              <form onSubmit={handleThreadSubmit}>
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
              <ul className="space-y-2 mb-4">
                {(showAllThreads ? threads : threads.slice(0, 10)).map((thread) => (
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
                <div className="space-y-4 mb-6">
                  {posts.map((post, index) => (
                    <div key={post.id} className="border-b pb-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{index + 1}. {post.author_name}</span>
                        <span>{new Date(post.created_at).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 prose prose-sm max-w-none">
                        {post.is_drawing ? (
                          <img src={post.content} alt="User drawing" className="max-w-full h-auto" />
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content}
                          </ReactMarkdown>
                        )}
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
                  {isDrawingMode ? (
                    <div className="mb-2">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={300}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        className="border border-gray-300 touch-none"
                        style={{touchAction: 'none'}}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="寫下你的回覆... (支援 Markdown 語法)"
                      className="w-full p-2 border rounded h-24"
                    />
                  )}
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      onClick={handleDrawingModeToggle}
                      className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                    >
                      {isDrawingMode ? "Switch to Text" : "Switch to Drawing"}
                    </button>
                    <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                      發布
                    </button>
                  </div>
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