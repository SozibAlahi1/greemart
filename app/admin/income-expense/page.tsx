'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Trash2, TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/app/components/Toast';
import { useSettings } from '@/lib/useSettings';
import { ModuleGuard } from '@/components/modules/ModuleGuard';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string;
  reference?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  incomeCount: number;
  expenseCount: number;
  totalCount: number;
}

const INCOME_CATEGORIES = [
  'Sales',
  'Services',
  'Investment',
  'Rental',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Supplies',
  'Rent',
  'Utilities',
  'Salaries',
  'Marketing',
  'Transportation',
  'Maintenance',
  'Other Expense',
];

export default function IncomeExpense() {
  const { showToast, ToastComponent } = useToast();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: '',
    tags: '',
  });

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchTransactions();
    }
  }, [filterType, filterCategory, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const response = await fetch(`/api/admin/transactions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setSummary(data.summary || null);
      } else {
        showToast('Failed to load transactions', 'error');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: new Date(transaction.date).toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod || '',
        reference: transaction.reference || '',
        tags: transaction.tags?.join(', ') || '',
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        reference: '',
        tags: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
      };

      const url = editingTransaction
        ? `/api/admin/transactions/${editingTransaction._id}`
        : '/api/admin/transactions';
      const method = editingTransaction ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast(
          editingTransaction ? 'Transaction updated successfully' : 'Transaction created successfully',
          'success'
        );
        handleCloseDialog();
        fetchTransactions();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save transaction', 'error');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      showToast('Failed to save transaction', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Transaction deleted successfully', 'success');
        fetchTransactions();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to delete transaction', 'error');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showToast('Failed to delete transaction', 'error');
    }
  };

  const formatCurrency = (value: number) =>
    `${settings.currencySymbol || '৳'}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  const uniqueCategories = Array.from(new Set(allCategories));

  if (loading && !summary) {
    return (
      <ModuleGuard moduleId="income-expense">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Income Expense</h1>
            <p className="text-muted-foreground">
              Track and manage your income and expense transactions
            </p>
          </div>
          <TableSkeleton />
        </div>
      </ModuleGuard>
    );
  }

  return (
    <ModuleGuard moduleId="income-expense">
      <div className="space-y-6">
        {ToastComponent}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Income Expense</h1>
            <p className="text-muted-foreground">
              Track and manage your income and expense transactions
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.incomeCount} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpense)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.expenseCount} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.netAmount >= 0 ? 'Profit' : 'Loss'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All transactions
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found for the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={transaction.type === 'income' ? 'default' : 'secondary'}
                            className={transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}
                          >
                            {transaction.type === 'income' ? 'Income' : 'Expense'}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell
                          className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{transaction.paymentMethod || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(transaction)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(transaction._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction
                  ? 'Update the transaction details below.'
                  : 'Enter the details for the new transaction.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => {
                      setFormData({ ...formData, type: value, category: '' });
                    }}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    placeholder="e.g., Cash, Bank Transfer, Card"
                  />
                </div>
                <div>
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Invoice number, receipt number, etc."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., urgent, recurring, tax-deductible"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTransaction ? 'Update' : 'Create'} Transaction
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleGuard>
  );
}

