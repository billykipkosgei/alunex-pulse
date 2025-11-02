import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleHelp = () => {
        // Will implement help modal later
        alert('Help system will be implemented');
    };

    // Get user initials for avatar
    const getInitials = () => {
        if (!user || !user.name) return 'U';
        return user.initials || user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <div className="logo-icon">A</div>
                <span>Alunex Project Management</span>
            </div>
            <div className="user-info">
                <button
                    className="btn btn-secondary help-btn"
                    onClick={handleHelp}
                    title="Help & Tutorials"
                >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </button>
                <div className="user-avatar" title={user?.name || 'User'}>
                    {getInitials()}
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
