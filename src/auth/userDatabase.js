// src/auth/userDatabase.js

/**
 * Local user database for the dashboard
 * In production, this would be replaced with actual backend authentication
 */

// Utility function to hash passwords (simple for demo - use bcrypt in production)
const hashPassword = (password) => {
  // This is a simple hash for demo purposes
  // In production, use proper password hashing like bcrypt
  return btoa(password).split('').reverse().join('');
};

// Initial users database
const defaultUsers = [
  {
    id: 'usr_001',
    email: 'sarah.johnson@company.com',
    passwordHash: hashPassword('SecurePass123!'),
    profile: {
      name: 'Sarah Johnson',
      role: 'admin',
      jobTitle: 'Chief Risk Officer',
      department: 'Risk Management',
      phone: '+44 20 7123 4567',
      location: 'London, UK',
      permissions: ['read', 'write', 'admin', 'manage_users'],
      twoFactorEnabled: true,
      lastLogin: null,
      createdAt: '2024-01-15T10:00:00Z'
    }
  },
  {
    id: 'usr_002',
    email: 'james.smith@company.com',
    passwordHash: hashPassword('RiskManager2024'),
    profile: {
      name: 'James Smith',
      role: 'manager',
      jobTitle: 'Senior Risk Analyst',
      department: 'IT Security',
      phone: '+44 20 7123 4568',
      location: 'London, UK',
      permissions: ['read', 'write', 'approve'],
      twoFactorEnabled: false,
      lastLogin: null,
      createdAt: '2024-02-01T09:00:00Z'
    }
  },
  {
    id: 'usr_003',
    email: 'emma.wilson@company.com',
    passwordHash: hashPassword('Analyst#456'),
    profile: {
      name: 'Emma Wilson',
      role: 'analyst',
      jobTitle: 'Risk Analyst',
      department: 'Compliance',
      phone: '+44 20 7123 4569',
      location: 'Manchester, UK',
      permissions: ['read', 'write'],
      twoFactorEnabled: false,
      lastLogin: null,
      createdAt: '2024-03-10T14:30:00Z'
    }
  },
  {
    id: 'usr_004',
    email: 'michael.brown@company.com',
    passwordHash: hashPassword('ViewOnly789'),
    profile: {
      name: 'Michael Brown',
      role: 'viewer',
      jobTitle: 'Compliance Officer',
      department: 'Compliance',
      phone: '+44 20 7123 4570',
      location: 'Edinburgh, UK',
      permissions: ['read'],
      twoFactorEnabled: false,
      lastLogin: null,
      createdAt: '2024-03-15T11:00:00Z'
    }
  },
  {
    id: 'usr_005',
    email: 'admin@company.com',
    passwordHash: hashPassword('AdminSecure2024!'),
    profile: {
      name: 'System Administrator',
      role: 'admin',
      jobTitle: 'Platform Administrator',
      department: 'IT',
      phone: '+44 20 7123 4571',
      location: 'London, UK',
      permissions: ['read', 'write', 'admin', 'manage_users', 'system_config'],
      twoFactorEnabled: true,
      lastLogin: null,
      createdAt: '2024-01-01T00:00:00Z'
    }
  }
];

// User management class
class UserDatabase {
  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    // Load users from localStorage or use defaults
    const storedUsers = localStorage.getItem('dashboard_users');
    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        this.users = [...defaultUsers];
        this.saveUsers();
      }
    } else {
      this.users = [...defaultUsers];
      this.saveUsers();
    }
  }

  saveUsers() {
    localStorage.setItem('dashboard_users', JSON.stringify(this.users));
  }

  // Authenticate user
  authenticate(email, password) {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const hashedInput = hashPassword(password);
    if (user.passwordHash !== hashedInput) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.profile.lastLogin = new Date().toISOString();
    this.saveUsers();

    // Return user data (excluding password hash)
    return {
      id: user.id,
      email: user.email,
      ...user.profile
    };
  }

  // Get all users (for admin panel)
  getAllUsers() {
    return this.users.map(user => ({
      id: user.id,
      email: user.email,
      ...user.profile
    }));
  }

  // Add new user
  addUser(email, password, profile) {
    // Check if user already exists
    if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      passwordHash: hashPassword(password),
      profile: {
        name: profile.name || email.split('@')[0],
        role: profile.role || 'viewer',
        jobTitle: profile.jobTitle || '',
        department: profile.department || '',
        phone: profile.phone || '',
        location: profile.location || '',
        permissions: profile.permissions || ['read'],
        twoFactorEnabled: false,
        lastLogin: null,
        createdAt: new Date().toISOString()
      }
    };

    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  // Update user
  updateUser(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update password if provided
    if (updates.password) {
      this.users[userIndex].passwordHash = hashPassword(updates.password);
      delete updates.password;
    }

    // Update email if provided
    if (updates.email) {
      // Check if new email is already taken
      const emailTaken = this.users.some(u => 
        u.id !== userId && u.email.toLowerCase() === updates.email.toLowerCase()
      );
      if (emailTaken) {
        throw new Error('Email already in use');
      }
      this.users[userIndex].email = updates.email;
      delete updates.email;
    }

    // Update profile fields
    if (updates.profile) {
      this.users[userIndex].profile = {
        ...this.users[userIndex].profile,
        ...updates.profile
      };
    }

    this.saveUsers();
    return this.users[userIndex];
  }

  // Delete user
  deleteUser(userId) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users.splice(userIndex, 1);
    this.saveUsers();
    return true;
  }

  // Reset to default users
  resetToDefaults() {
    this.users = [...defaultUsers];
    this.saveUsers();
    return true;
  }
}

// Export singleton instance
export const userDB = new UserDatabase();

// Export utility for displaying user credentials (development only)
export const getUserCredentials = () => {
  return [
    { email: 'sarah.johnson@company.com', password: 'SecurePass123!', role: 'Admin (CRO)' },
    { email: 'james.smith@company.com', password: 'RiskManager2024', role: 'Manager' },
    { email: 'emma.wilson@company.com', password: 'Analyst#456', role: 'Analyst' },
    { email: 'michael.brown@company.com', password: 'ViewOnly789', role: 'Viewer' },
    { email: 'admin@company.com', password: 'AdminSecure2024!', role: 'System Admin' }
  ];
};