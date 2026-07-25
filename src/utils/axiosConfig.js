import axios from 'axios';

// Thiết lập cấu hình mặc định cho Axios để Laravel Sanctum nhận diện Cookie XSRF-TOKEN
axios.defaults.withCredentials = true;

// Nếu backend bạn ở port 8000, bạn có thể thiết lập baseURL luôn để code gọn hơn, nhưng mình giữ nguyên
// axios.defaults.baseURL = 'http://127.0.0.1:8000';

export default axios;
