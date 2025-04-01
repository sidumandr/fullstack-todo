import { useState, useEffect } from "react";
import { Trash2, Edit, Check } from "lucide-react";
import mainLogo from "./assets/mainLogo.png";

export default function ToDoList() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState([5]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Görevleri getir
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/tasks', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (error) {
      console.error('Görevler yüklenirken hata:', error);
      setError('Görevler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (task.trim() === "") return;
    
    const taskData = { task, description, priority: priority[0], completed: false };
    
    try {
      if (editIndex !== null) {
        // Görevi güncelle
        const response = await fetch(`http://localhost:8000/api/tasks/${tasks[editIndex]._id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Görev güncellenirken bir hata oluştu');
        const updatedTask = await response.json();
        
        const updatedTasks = [...tasks];
        updatedTasks[editIndex] = updatedTask;
        setTasks(updatedTasks);
      } else {
        // Yeni görev ekle
        const response = await fetch('http://localhost:8000/api/tasks', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Görev eklenirken bir hata oluştu');
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
      }
      
      setTask("");
      setDescription("");
      setPriority([5]);
      setEditIndex(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Görev silinirken bir hata oluştu');
      setTasks(tasks.filter(task => task._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const editTask = (index) => {
    setTask(tasks[index].task);
    setDescription(tasks[index].description);
    setPriority([tasks[index].priority]);
    setEditIndex(index);
  };

  const toggleComplete = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      const response = await fetch(`http://localhost:8000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !task.completed })
      });
      
      if (!response.ok) throw new Error('Görev güncellenirken bir hata oluştu');
      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task._id === id ? updatedTask : task
      ));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container">Yükleniyor...</div>;
  if (error) return <div className="container">Hata: {error}</div>;

  return (
    <div className="container">
      {/* Logo */}
      <div className="logo-area">
        <div className="logo-box">          
          <img className="logo-img" src={mainLogo} alt="mainLogo" />
        </div>
        <h1 className="title">To-Do List</h1>
        <p className="subtitle">Görevlerinizi organize edin</p>
      </div>

      {/* Görev Ekleme Formu */}
      <div className="form-card">
        <div className="form-group">
          <label className="label">Görev Adı</label>
          <input
            type="text"
            className="input"
            placeholder="Görev adını girin"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="label">Açıklama</label>
          <textarea
            className="textarea"
            placeholder="Görev açıklamasını girin"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="label">Önem Derecesi: {priority[0]}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={priority[0]}
            onChange={(e) => setPriority([parseInt(e.target.value)])}
            className="input"
          />
        </div>
        <button onClick={addTask} className="button">
          {editIndex !== null ? "Görevi Güncelle" : "Yeni Görev Ekle"}
        </button>
      </div>

      {/* Görev Listesi */}
      <div>
        {tasks.map((t, index) => (
          <div key={t._id} className={`task-card ${t.completed ? 'completed' : ''}`}>
            <div className="task-header">
              <div className="task-content">
                <h3 className="task-title">{t.task}</h3>
                <p className="task-description">{t.description}</p>
                <div className="priority-container">
                  <span className="priority-label">Önem:</span>
                  <div className="priority-dots">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`priority-dot ${i < t.priority ? "active" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="button-group">
                <button
                  className="icon-button complete"
                  onClick={() => toggleComplete(t._id)}
                  title={t.completed ? "Görevi Tamamlanmadı Olarak İşaretle" : "Görevi Tamamlandı Olarak İşaretle"}
                >
                  <Check size={16} />
                </button>
                <button
                  className="icon-button edit"
                  onClick={() => editTask(index)}
                  title="Görevi Düzenle"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="icon-button delete"
                  onClick={() => deleteTask(t._id)}
                  title="Görevi Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
