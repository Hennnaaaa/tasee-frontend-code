"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    UserCheck,
    UserX,
    Mail,
    Send,
    Paperclip,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SEND_NEWSLETTER, GET_NEWSLETTER_SUBSCRIBERS } from '@/utils/routes/adminRoutes';
import AdminLayout from '@/components/adminComponents/layout/AdminLayout';
import { getUserData } from '@/utils/auth';

const NewsletterAdmin = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check authentication on component mount
    useEffect(() => {
        const auth = getUserData();
        if (!auth || !auth.token || !auth.userData || auth.userData.role !== 'admin') {
            router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
            return;
        }
        
        fetchStats();
    }, [router]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            
            // Get authentication data
            const auth = getUserData();
            if (!auth || !auth.token) {
                router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
                return;
            }

            const response = await fetch(GET_NEWSLETTER_SUBSCRIBERS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}` // Add auth header
                }
            });

            if (!response.ok) {
                // Handle unauthorized error
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
                    return;
                }
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            console.log('Fetched stats:', data);

            if (data.success) {
                setStats({
                    total: data.data.total,
                    active: data.data.activeSubscribers,
                    inactive: data.data.inActiveSubscribers
                });
                setSubscribers(data.data.subscribers);
            } else {
                console.error('Failed to fetch stats:', data.message);
                alert('Failed to fetch stats');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Handle auth errors
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
                return;
            }
        } finally {
            setLoading(false);
        }
    };

    // Main newsletter content (what gets wrapped by AdminLayout)
    const newsletterContent = (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Newsletter Management</h1>
                <p className="text-muted-foreground">
                    Manage subscribers and send newsletters
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'dashboard'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('subscribers')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'subscribers'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Subscribers
                </button>
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'compose'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    Write Newsletter
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
                <DashboardTab stats={stats} setActiveTab={setActiveTab} />
            )}

            {activeTab === 'subscribers' && (
                <SubscribersTab subscribers={subscribers} loading={loading} />
            )}

            {activeTab === 'compose' && (
                <WriteNewsletterTab />
            )}
        </div>
    );

    // Wrap the content with AdminLayout (same pattern as categories)
    return <AdminLayout>{newsletterContent}</AdminLayout>;
};

// Dashboard Tab Component
const DashboardTab = ({ stats, setActiveTab }) => {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Subscribers</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Active Subscribers</p>
                            <p className="text-3xl font-bold text-green-600">{stats.active.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Inactive Subscribers</p>
                            <p className="text-3xl font-bold text-red-600">{stats.inactive.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <UserX className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    <button 
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => setActiveTab('compose')}
                    >
                        <Mail className="h-4 w-4" />
                        Write Newsletter
                    </button>
                    <button 
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={() => setActiveTab('subscribers')}
                    >
                        <Users className="h-4 w-4" />
                        View All Subscribers
                    </button>
                </div>
            </div>
        </div>
    );
};

// Subscribers Tab Component
const SubscribersTab = ({ subscribers, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredSubscribers = subscribers.filter(subscriber => {
        const matchesSearch =
            subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscriber.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscriber.lastName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && subscriber.isActive) ||
            (filterStatus === 'inactive' && !subscriber.isActive);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search subscribers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Subscribers Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-left text-sm font-medium text-gray-900">Subscriber</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-900">Status</th>
                            <th className="p-4 text-left text-sm font-medium text-gray-900">Subscription Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-gray-500">
                                    Loading subscribers...
                                </td>
                            </tr>
                        ) : filteredSubscribers.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-gray-500">
                                    No subscribers found
                                </td>
                            </tr>
                        ) : (
                            filteredSubscribers.map((subscriber) => (
                                <tr key={subscriber.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {subscriber.firstName} {subscriber.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">{subscriber.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            subscriber.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {subscriber.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(subscriber.subscriptionDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Write Newsletter Tab Component
const WriteNewsletterTab = () => {
    const router = useRouter();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [sending, setSending] = useState(false);
    const [activeFormats, setActiveFormats] = useState({});
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const executeCommand = (command, value = null) => {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        updateActiveFormats();
    };

    const updateActiveFormats = () => {
        const formats = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList')
        };
        setActiveFormats(formats);
    };

    const handleEditorClick = () => {
        setTimeout(updateActiveFormats, 10);
    };

    const handleEditorKeyUp = () => {
        setTimeout(updateActiveFormats, 10);
    };

    const insertLink = () => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        const url = prompt('Enter URL:', 'https://');

        if (url && url !== 'https://') {
            if (selectedText) {
                document.execCommand('createLink', false, url);
            } else {
                const linkText = prompt('Enter link text:', url);
                if (linkText) {
                    const linkHtml = `<a href="${url}" target="_blank">${linkText}</a>`;
                    document.execCommand('insertHTML', false, linkHtml);
                }
            }
            editorRef.current.focus();
            updateActiveFormats();
        }
    };

    const handleSendNewsletter = async () => {
        if (!subject || !content) {
            alert('Please fill in both subject and content');
            return;
        }

        setSending(true);
        
        try {
            // Get authentication data
            const auth = getUserData();
            if (!auth || !auth.token) {
                router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
                return;
            }

            // Create FormData to handle file uploads
            const formData = new FormData();
            formData.append('subject', subject);
            formData.append('content', content);
            
            // Add each attachment file to FormData
            attachments.forEach((file, index) => {
                formData.append('attachments', file);
            });

            const response = await fetch(SEND_NEWSLETTER, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}` // Add auth header
                },
                body: formData
            });

            if (!response.ok) {
                // Handle unauthorized error
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`);
                    return;
                }
                throw new Error('Failed to send newsletter');
            }

            const data = await response.json();
            if (data.success) {
                console.log('Newsletter sent successfully:', data);
                alert('Newsletter sent successfully!');
                // Reset form
                setSubject('');
                setContent('');
                setAttachments([]);
                setActiveFormats({});
                if (editorRef.current) {
                    editorRef.current.innerHTML = '';
                }
            }
        } catch (error) {
            alert('Failed to send newsletter');
            console.error('Error sending newsletter:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Compose Newsletter</h2>
            </div>

            <div className="p-6 space-y-6">
                {/* Subject */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Line *
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter your newsletter subject..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                </div>

                {/* Attachments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Paperclip className="h-4 w-4" />
                            Add Files
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>

                    {attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <button
                                        onClick={() => removeAttachment(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rich Text Editor */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                    </label>

                    {/* Toolbar */}
                    <div className="border border-gray-300 rounded-t-lg p-2 bg-gray-50 flex flex-wrap gap-1">
                        <button
                            type="button"
                            onClick={() => executeCommand('bold')}
                            className={`p-2 rounded transition-colors ${
                                activeFormats.bold
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'hover:bg-gray-200'
                            }`}
                            title="Bold"
                        >
                            <Bold className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => executeCommand('italic')}
                            className={`p-2 rounded transition-colors ${
                                activeFormats.italic
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'hover:bg-gray-200'
                            }`}
                            title="Italic"
                        >
                            <Italic className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => executeCommand('underline')}
                            className={`p-2 rounded transition-colors ${
                                activeFormats.underline
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'hover:bg-gray-200'
                            }`}
                            title="Underline"
                        >
                            <Underline className="h-4 w-4" />
                        </button>

                        <div className="w-px bg-gray-300 mx-1"></div>

                        <button
                            type="button"
                            onClick={() => executeCommand('insertUnorderedList')}
                            className={`p-2 rounded transition-colors ${
                                activeFormats.insertUnorderedList
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'hover:bg-gray-200'
                            }`}
                            title="Bullet List"
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => executeCommand('insertOrderedList')}
                            className={`p-2 rounded transition-colors ${
                                activeFormats.insertOrderedList
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'hover:bg-gray-200'
                            }`}
                            title="Numbered List"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </button>

                        <div className="w-px bg-gray-300 mx-1"></div>

                        <button
                            type="button"
                            onClick={() => executeCommand('justifyLeft')}
                            className={`p-2 rounded transition-colors ${
                                activeFormats.justifyLeft
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'hover:bg-gray-200'
                            }`}
                            title="Align Left"
                        >
                            <AlignLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => executeCommand('justifyCenter')}
                            className={`p-2 rounded transition-colors ${
                                activeFormats.justifyCenter
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'hover:bg-gray-200'
                            }`}
                            title="Align Center"
                        >
                            <AlignCenter className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => executeCommand('justifyRight')}
                            className={`p-2 rounded transition-colors ${
                                activeFormats.justifyRight
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'hover:bg-gray-200'
                            }`}
                            title="Align Right"
                        >
                            <AlignRight className="h-4 w-4" />
                        </button>

                        <div className="w-px bg-gray-300 mx-1"></div>

                        <button
                            type="button"
                            onClick={insertLink}
                            className="p-2 rounded hover:bg-gray-200 transition-colors"
                            title="Insert Link"
                        >
                            <Link className="h-4 w-4" />
                        </button>

                        <div className="w-px bg-gray-300 mx-1"></div>

                        <select
                            onChange={(e) => executeCommand('fontSize', e.target.value)}
                            className="px-2 py-1 text-sm border-0 bg-transparent rounded hover:bg-gray-200"
                            defaultValue="3"
                        >
                            <option value="1">Small</option>
                            <option value="3">Normal</option>
                            <option value="5">Large</option>
                            <option value="7">Huge</option>
                        </select>
                    </div>

                    {/* Editor */}
                    <div
                        ref={editorRef}
                        contentEditable
                        className="min-h-[300px] p-4 border border-t-0 border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ minHeight: '300px' }}
                        onInput={(e) => setContent(e.target.innerHTML)}
                        onClick={handleEditorClick}
                        onKeyUp={handleEditorKeyUp}
                        onFocus={updateActiveFormats}
                        suppressContentEditableWarning={true}
                        data-placeholder="Write your newsletter content here..."
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => {
                            setSubject('');
                            setContent('');
                            setAttachments([]);
                            setActiveFormats({});
                            if (editorRef.current) {
                                editorRef.current.innerHTML = '';
                            }
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleSendNewsletter}
                        disabled={sending}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                        <Send className="h-4 w-4" />
                        {sending ? 'Sending...' : 'Send Newsletter'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsletterAdmin;