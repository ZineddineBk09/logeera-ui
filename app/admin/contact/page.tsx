'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import useSWR from 'swr';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  priority: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminContactPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [response, setResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  // Fetch contact submissions
  const {
    data: submissionsData,
    error,
    isLoading,
    mutate,
  } = useSWR(
    `/api/admin/contact?search=${searchQuery}&status=${statusFilter}&category=${categoryFilter}`,
    () =>
      api(`/api/admin/contact?search=${searchQuery}&status=${statusFilter}&category=${categoryFilter}`).then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load contact submissions');
      }),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const submissions = submissionsData?.submissions || [];

  const handleViewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setResponse(submission.response || '');
    setShowResponseDialog(true);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await api(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        mutate();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedSubmission || !response.trim()) {
      toast.error('Please provide a response');
      return;
    }

    setIsResponding(true);
    try {
      const apiResponse = await api(`/api/admin/contact/${selectedSubmission.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          response: response.trim(),
          status: 'RESOLVED',
        }),
      });

      if (apiResponse.ok) {
        toast.success('Response sent successfully');
        setShowResponseDialog(false);
        setSelectedSubmission(null);
        setResponse('');
        mutate();
      } else {
        const errorData = await apiResponse.json();
        toast.error(errorData.error || 'Failed to send response');
      }
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsResponding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="destructive">Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'RESOLVED':
        return <Badge variant="default">Resolved</Badge>;
      case 'CLOSED':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary">Medium</Badge>;
      case 'LOW':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SAFETY':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'TECHNICAL':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contact Management</h1>
            <p className="text-muted-foreground">
              Manage customer inquiries and support requests
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="SAFETY">Safety</SelectItem>
                    <SelectItem value="BILLING">Billing</SelectItem>
                    <SelectItem value="FEEDBACK">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Submissions ({submissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load submissions</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No contact submissions found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission: ContactSubmission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{submission.name}</div>
                          <div className="text-muted-foreground text-sm">{submission.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={submission.subject}>
                          {submission.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(submission.category)}
                          <span className="capitalize">{submission.category.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(submission.priority)}</TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {submission.status === 'OPEN' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(submission.id, 'IN_PROGRESS')}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Response Dialog */}
        <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Submission Details</DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-6">
                {/* Submission Details */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From</label>
                    <div>
                      <div className="font-medium">{selectedSubmission.name}</div>
                      <div className="text-muted-foreground text-sm">{selectedSubmission.email}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Details</label>
                    <div className="flex gap-2">
                      {getPriorityBadge(selectedSubmission.priority)}
                      {getStatusBadge(selectedSubmission.status)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <div>{selectedSubmission.subject}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Submitted</label>
                    <div className="text-sm">
                      {new Date(selectedSubmission.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>

                {/* Previous Response */}
                {selectedSubmission.response && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Previous Response</label>
                    <div className="rounded-lg border p-4 bg-green-50">
                      <p className="text-sm whitespace-pre-wrap">{selectedSubmission.response}</p>
                      {selectedSubmission.respondedAt && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Responded on {new Date(selectedSubmission.respondedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Response Form */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedSubmission.response ? 'Update Response' : 'Response'}
                  </label>
                  <Textarea
                    placeholder="Type your response here..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-32 resize-none"
                    maxLength={2000}
                  />
                  <div className="text-right text-xs text-muted-foreground">
                    {response.length}/2000
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResponseDialog(false);
                  setSelectedSubmission(null);
                  setResponse('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResponse}
                disabled={!response.trim() || isResponding}
              >
                {isResponding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Response'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
