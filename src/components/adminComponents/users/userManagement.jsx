'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Edit,
  Trash2,
  Search,
  Mail,
  Calendar,
  RefreshCw,
  Filter
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Import UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import auth utility
import { getUserData } from '@/utils/auth';

// Import API routes from route file
import { 
  GET_ALL_USERS, 
  GET_USER_BY_ID, 
  UPDATE_USER, 
  DELETE_USER 
} from '@/utils/routes/adminRoutes';

export default function UserManagement() {
  const router = useRouter();
  
  // State for users data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for modals
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Fetch users on component mount and when filters or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, statusFilter]);
  
  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  // Fetch users with authentication
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Create request params with correct status filter
      const requestData = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || '',
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      // Make authenticated request
      const response = await axios.post(GET_ALL_USERS, requestData, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      // Filter users based on status if needed
      let filteredUsers = response.data.users;
      if (statusFilter === 'active') {
        filteredUsers = filteredUsers.filter(user => user.isActive === true);
      } else if (statusFilter === 'inactive') {
        filteredUsers = filteredUsers.filter(user => user.isActive === false);
      }
      
      setUsers(filteredUsers);
      setPagination({
        ...pagination,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / pagination.limit)
      });
    } catch (err) {
      // Handle unauthorized error
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      setError(err.response?.data?.message || 'Error fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination({ ...pagination, page: 1 });
  };
  
  // Handle edit user
  const handleEditUser = async (user) => {
    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Fetch complete user data
      const response = await axios.get(GET_USER_BY_ID(user.id), {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      setCurrentUser(response.data);
      setOpenUserDialog(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err.response?.data?.message || 'Error fetching user details');
    }
  };
  
  // Handle update user
  const handleUpdateUser = async (userData) => {
    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      // Format request body according to API requirements
      const requestData = {
        userId: userData.id, // Required - ID of user to update
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        isActive: userData.isActive
        // Removed role from the requestData since it cannot be changed
      };
      
      await axios.post(UPDATE_USER, requestData, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      setOpenUserDialog(false);
      setSuccessMessage('User updated successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Error updating user');
    }
  };
  
  // Handle delete user dialog
  const handleDeleteClick = (user) => {
    setCurrentUser(user);
    setOpenDeleteDialog(true);
  };
  
  // Handle delete user confirmation
  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      // Get authentication data
      const auth = getUserData();
      if (!auth || !auth.token) {
        router.push('/login');
        return;
      }
      
      await axios.delete(DELETE_USER(currentUser.id), {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      
      setOpenDeleteDialog(false);
      setSuccessMessage('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Error deleting user');
    }
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
  };
  
  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get the appropriate badge color based on user status
  const getStatusBadge = (isActive) => {
    if (isActive === true) {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (isActive === false) {
      return <Badge className="bg-yellow-500">Inactive</Badge>;
    } else {
      return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            View and manage user accounts and permissions
          </p>
        </div>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* User management header and filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>View and manage customer accounts</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleStatusFilterChange('all')}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleStatusFilterChange('active')}
              >
                Active
              </Button>
              <Button 
                variant={statusFilter === 'inactive' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleStatusFilterChange('inactive')}
              >
                Inactive
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSearch}
                className="ml-2"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-8 w-8 mb-4 text-indigo-500" />
                <p>Loading user data...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center text-center">
                <User className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No users found</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  No users match your current search criteria or filter. Try adjusting your search or filter options.
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Edit User Dialog */}
      <Dialog open={openUserDialog} onOpenChange={setOpenUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              {currentUser && `Update information for ${currentUser.firstName} ${currentUser.lastName}`}
            </DialogDescription>
          </DialogHeader>
          
          {currentUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input 
                    placeholder="First name" 
                    value={currentUser.firstName || ''}
                    onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input 
                    placeholder="Last name" 
                    value={currentUser.lastName || ''}
                    onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  placeholder="Email address" 
                  value={currentUser.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                    <span className="text-sm text-gray-600">Customer</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={currentUser.isActive ? 'active' : 'inactive'}
                    onValueChange={(value) => setCurrentUser({...currentUser, isActive: value === 'active'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleUpdateUser(currentUser)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {currentUser && `This will permanently delete ${currentUser.firstName} ${currentUser.lastName}'s account and remove all their data from the system. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}