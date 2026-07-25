import { useState, useEffect } from 'react';
import axios from 'axios';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const response = await axios.get('http://127.0.0.1:8000/api/my-notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`http://127.0.0.1:8000/api/my-notifications/${id}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setNotifications(notifications.map(n => 
          n.id_thongbao === id ? { ...n, da_doc: 1 } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put('http://127.0.0.1:8000/api/my-notifications/read-all', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setNotifications(notifications.map(n => ({ ...n, da_doc: 1 })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};

export default useNotifications;
