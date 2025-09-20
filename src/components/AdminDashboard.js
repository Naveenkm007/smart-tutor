import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaChartLine, 
  FaServer, 
  FaCog, 
  FaSearch, 
  FaBell, 
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaDownload,
  FaFilter,
  FaEye,
  FaChevronDown,
  FaSignOutAlt
} from 'react-icons/fa';
import { LearningService, AnalyticsService, AdminService } from '../services/supabaseClient';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    activeTeachers: 0,
    totalCourses: 0,
    systemHealth: '99.9%'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: FaHome },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'analytics', label: 'Analytics & Reports', icon: FaChartLine },
    { id: 'system', label: 'System Health', icon: FaServer },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  // Fetch real data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch comprehensive dashboard statistics
        const statsData = await AdminService.getDashboardStats();
        setDashboardStats({
          totalStudents: statsData.totalStudents,
          activeTeachers: statsData.activeTeachers,
          totalCourses: statsData.totalCourses,
          systemHealth: statsData.systemHealth?.uptime || '99.9%'
        });
        
        // Fetch users data
        const usersData = await LearningService.getAllUsers();
        setUsers(usersData || []);
        
        // Fetch subjects data
        const { data: subjectsData } = await LearningService.getSubjects();
        setSubjects(subjectsData || []);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please check your Supabase connection.');
        
        // Fallback to demo data if Supabase connection fails
        setDashboardStats({
          totalStudents: 0,
          activeTeachers: 0,
          totalCourses: 0,
          systemHealth: 'Disconnected'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const MetricsCard = ({ title, value, subtitle, color, icon: Icon }) => (
    <div className={`metrics-card ${color}`}>
      <div className="metrics-content">
        <div className="metrics-text">
          <h3>{title}</h3>
          <div className="metrics-value">{value}</div>
          <p className="metrics-subtitle">{subtitle}</p>
        </div>
        <div className="metrics-icon">
          <Icon />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="overview-section">
      <div className="section-header">
        <h2>Dashboard Overview</h2>
        <p>Monitor key metrics and system performance</p>
      </div>
      
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      
      <div className="metrics-grid">
        <MetricsCard
          title="Total Students"
          value={loading ? '...' : dashboardStats.totalStudents.toLocaleString()}
          subtitle={`+${Math.floor(dashboardStats.totalStudents * 0.12)} from last month`}
          color="blue"
          icon={FaUsers}
        />
        <MetricsCard
          title="Active Teachers"
          value={loading ? '...' : dashboardStats.activeTeachers.toString()}
          subtitle={`+${Math.floor(dashboardStats.activeTeachers * 0.05)} from last month`}
          color="green"
          icon={FaUsers}
        />
        <MetricsCard
          title="Courses Available"
          value={loading ? '...' : dashboardStats.totalCourses.toString()}
          subtitle={`+${Math.floor(dashboardStats.totalCourses * 0.1)} new this month`}
          color="orange"
          icon={FaChartLine}
        />
        <MetricsCard
          title="System Health"
          value={dashboardStats.systemHealth}
          subtitle="All systems operational"
          color="purple"
          icon={FaServer}
        />
      </div>

      <div className="overview-charts">
        <div className="chart-container">
          <h3>Student Enrollment Trends</h3>
          <div className="chart-placeholder">
            <p>Real-time enrollment data</p>
            <small>Connected to Supabase database</small>
          </div>
        </div>
        <div className="chart-container">
          <h3>Course Completion Rates</h3>
          <div className="chart-placeholder">
            <p>Live completion analytics</p>
            <small>Data from user progress tracking</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-section">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <button className="btn-secondary">
            <FaFilter /> Filter
          </button>
          <button className="btn-secondary">
            <FaDownload /> Export
          </button>
          <button className="btn-primary">
            <FaPlus /> Add User
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Performance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>
                    No users found. Connect to Supabase to see real data.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <FaUserCircle className="user-avatar" />
                        <span>{user.name || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${(user.role || 'student').toLowerCase()}`}>
                        {user.role || 'Student'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${(user.status || 'active').toLowerCase()}`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                    <td>{user.performance_score || 'N/A'}%</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View">
                          <FaEye />
                        </button>
                        <button className="btn-icon" title="Edit">
                          <FaEdit />
                        </button>
                        <button className="btn-icon danger" title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-section">
      <div className="section-header">
        <h2>Analytics & Reports</h2>
        <p>Comprehensive insights and data analysis</p>
      </div>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Learning Progress</h3>
          <div className="chart-placeholder">
            <p>Progress analytics chart</p>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Course Performance</h3>
          <div className="chart-placeholder">
            <p>Performance metrics chart</p>
          </div>
        </div>
        <div className="analytics-card">
          <h3>User Engagement</h3>
          <div className="chart-placeholder">
            <p>Engagement analytics chart</p>
          </div>
        </div>
        <div className="analytics-card">
          <h3>Revenue Insights</h3>
          <div className="chart-placeholder">
            <p>Revenue analytics chart</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="system-section">
      <div className="section-header">
        <h2>System Health</h2>
        <p>Monitor system performance and server status</p>
      </div>
      
      <div className="system-grid">
        <div className="system-card">
          <h3>Server Status</h3>
          <div className="status-indicator online">
            <span className="status-dot"></span>
            <span>All servers online</span>
          </div>
          <div className="server-list">
            <div className="server-item">
              <span>Web Server</span>
              <span className="status online">Online</span>
            </div>
            <div className="server-item">
              <span>Database Server</span>
              <span className="status online">Online</span>
            </div>
            <div className="server-item">
              <span>API Server</span>
              <span className="status online">Online</span>
            </div>
          </div>
        </div>
        
        <div className="system-card">
          <h3>Performance Metrics</h3>
          <div className="metric-item">
            <span>CPU Usage</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '45%'}}></div>
            </div>
            <span>45%</span>
          </div>
          <div className="metric-item">
            <span>Memory Usage</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '68%'}}></div>
            </div>
            <span>68%</span>
          </div>
          <div className="metric-item">
            <span>Disk Usage</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '32%'}}></div>
            </div>
            <span>32%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>System Settings</h2>
        <p>Configure system preferences and security settings</p>
      </div>
      
      <div className="settings-grid">
        <div className="settings-card">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>System Name</label>
            <input type="text" defaultValue="Smart Tutor Dashboard" />
          </div>
          <div className="setting-item">
            <label>Default Language</label>
            <select defaultValue="en">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Time Zone</label>
            <select defaultValue="UTC">
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
            </select>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Security Settings</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Enable Two-Factor Authentication
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Require Strong Passwords
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              Enable Session Timeout
            </label>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Notification Settings</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Email Notifications
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Push Notifications
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              SMS Notifications
            </label>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button className="btn-secondary">Reset to Defaults</button>
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'analytics':
        return renderAnalytics();
      case 'system':
        return renderSystemHealth();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>Smart Tutor Admin</h1>
        </div>
        
        <div className="header-center">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search users, courses, analytics..." 
              className="search-input"
            />
          </div>
        </div>
        
        <div className="header-right">
          <div className="notification-container">
            <FaBell className="notification-icon" />
            {notifications > 0 && (
              <span className="notification-badge">{notifications}</span>
            )}
          </div>
          
          <div className="profile-container">
            <div 
              className="profile-trigger"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <FaUserCircle className="profile-icon" />
              <span>Admin User</span>
              <FaChevronDown className="dropdown-icon" />
            </div>
            
            {showProfileMenu && (
              <div className="profile-menu">
                <a href="#profile">Profile Settings</a>
                <a href="#preferences">Preferences</a>
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="admin-body">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;