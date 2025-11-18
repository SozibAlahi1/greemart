'use client';

import { useState, useEffect } from 'react';
import { Menu as MenuIcon, Plus, Edit, Trash2, ChevronDown, ChevronRight, GripVertical, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/app/components/Toast';

interface MenuItem {
  _id?: string;
  label: string;
  url: string;
  type: 'link' | 'category' | 'page';
  target?: string;
  icon?: string;
  order: number;
  parentId?: string | null;
  children?: MenuItem[];
}

interface Menu {
  _id: string;
  name: string;
  location: string;
  items: MenuItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMenus() {
  const { showToast, ToastComponent } = useToast();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<{ menuId: string; item: MenuItem | null; parentId?: string | null } | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [menuFormData, setMenuFormData] = useState({ name: '', location: '', isActive: true });
  const [itemFormData, setItemFormData] = useState<MenuItem>({
    label: '',
    url: '',
    type: 'link',
    order: 0,
    parentId: null,
  });
  const [saving, setSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/admin/menus');
      if (response.ok) {
        const data = await response.json();
        setMenus(data);
        if (data.length > 0 && !selectedMenu) {
          setSelectedMenu(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      showToast('Failed to load menus', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenMenuDialog = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuFormData({ name: menu.name, location: menu.location, isActive: menu.isActive });
    } else {
      setEditingMenu(null);
      setMenuFormData({ name: '', location: '', isActive: true });
    }
    setIsMenuDialogOpen(true);
  };

  const handleCloseMenuDialog = () => {
    setIsMenuDialogOpen(false);
    setEditingMenu(null);
    setMenuFormData({ name: '', location: '', isActive: true });
  };

  const handleOpenItemDialog = (menuId: string, item?: MenuItem, parentId?: string | null) => {
    if (item) {
      setEditingMenuItem({ menuId, item, parentId });
      setItemFormData({
        _id: item._id,
        label: item.label,
        url: item.url,
        type: item.type,
        target: item.target,
        icon: item.icon,
        order: item.order,
        parentId: item.parentId || parentId || null,
      });
    } else {
      setEditingMenuItem({ menuId, item: null, parentId });
      const menu = menus.find(m => m._id === menuId);
      const maxOrder = menu?.items.length || 0;
      setItemFormData({
        label: '',
        url: '',
        type: 'link',
        order: maxOrder,
        parentId: parentId || null,
      });
    }
    setIsItemDialogOpen(true);
  };

  const handleCloseItemDialog = () => {
    setIsItemDialogOpen(false);
    setEditingMenuItem(null);
    setItemFormData({
      label: '',
      url: '',
      type: 'link',
      order: 0,
      parentId: null,
    });
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingMenu
        ? `/api/admin/menus/${editingMenu._id}`
        : '/api/admin/menus';
      const method = editingMenu ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuFormData),
      });

      if (response.ok) {
        await fetchMenus();
        handleCloseMenuDialog();
        showToast(editingMenu ? 'Menu updated successfully' : 'Menu created successfully', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save menu', 'error');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      showToast('Error saving menu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;

    setSaving(true);

    try {
      const menu = menus.find(m => m._id === editingMenuItem.menuId);
      if (!menu) {
        showToast('Menu not found', 'error');
        return;
      }

      let updatedItems = [...menu.items];

      if (editingMenuItem.item) {
        // Update existing item
        const index = updatedItems.findIndex(item => item._id === editingMenuItem.item?._id);
        if (index !== -1) {
          updatedItems[index] = {
            ...itemFormData,
            _id: editingMenuItem.item._id,
          };
        }
      } else {
        // Add new item
        updatedItems.push({
          ...itemFormData,
          _id: undefined,
        });
      }

      // Reorder items
      updatedItems = updatedItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      const response = await fetch(`/api/admin/menus/${editingMenuItem.menuId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: updatedItems }),
      });

      if (response.ok) {
        await fetchMenus();
        if (selectedMenu?._id === editingMenuItem.menuId) {
          const updated = await response.json();
          setSelectedMenu(updated);
        }
        handleCloseItemDialog();
        showToast(editingMenuItem.item ? 'Menu item updated successfully' : 'Menu item added successfully', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save menu item', 'error');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      showToast('Error saving menu item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/menus/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMenus();
        if (selectedMenu?._id === id) {
          setSelectedMenu(null);
        }
        showToast('Menu deleted successfully', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to delete menu', 'error');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      showToast('Error deleting menu', 'error');
    }
  };

  const handleDeleteItem = async (menuId: string, itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    try {
      const menu = menus.find(m => m._id === menuId);
      if (!menu) return;

      const updatedItems = menu.items.filter(item => item._id !== itemId && item.parentId !== itemId);
      
      // Reorder items
      const reorderedItems = updatedItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: reorderedItems }),
      });

      if (response.ok) {
        await fetchMenus();
        if (selectedMenu?._id === menuId) {
          const updated = await response.json();
          setSelectedMenu(updated);
        }
        showToast('Menu item deleted successfully', 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to delete menu item', 'error');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast('Error deleting menu item', 'error');
    }
  };

  const handleMoveItem = async (menuId: string, itemId: string, direction: 'up' | 'down') => {
    const menu = menus.find(m => m._id === menuId);
    if (!menu) return;

    const items = [...menu.items];
    const index = items.findIndex(item => item._id === itemId);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [items[index], items[newIndex]] = [items[newIndex], items[index]];

    // Reorder items
    const reorderedItems = items.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    try {
      const response = await fetch(`/api/admin/menus/${menuId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: reorderedItems }),
      });

      if (response.ok) {
        await fetchMenus();
        if (selectedMenu?._id === menuId) {
          const updated = await response.json();
          setSelectedMenu(updated);
        }
      }
    } catch (error) {
      console.error('Error moving menu item:', error);
      showToast('Error moving menu item', 'error');
    }
  };

  const buildMenuTree = (items: MenuItem[]): MenuItem[] => {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // First pass: create map of all items
    items.forEach(item => {
      itemMap.set(item._id || '', { ...item, children: [] });
    });

    // Second pass: build tree
    items.forEach(item => {
      const menuItem = itemMap.get(item._id || '')!;
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(menuItem);
        } else {
          rootItems.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    // Sort by order
    const sortItems = (items: MenuItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => {
        if (item.children) {
          sortItems(item.children);
        }
      });
    };

    sortItems(rootItems);
    return rootItems;
  };

  const renderMenuItem = (item: MenuItem, menuId: string, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item._id || '');
    const menu = menus.find(m => m._id === menuId);
    const itemIndex = menu?.items.findIndex(i => i._id === item._id) || 0;

    return (
      <div key={item._id} className="border rounded-lg mb-2">
        <div className="flex items-center gap-2 p-3 bg-muted/50" style={{ paddingLeft: `${level * 24 + 12}px` }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              if (hasChildren) {
                const newExpanded = new Set(expandedItems);
                if (isExpanded) {
                  newExpanded.delete(item._id || '');
                } else {
                  newExpanded.add(item._id || '');
                }
                setExpandedItems(newExpanded);
              }
            }}
          >
            {hasChildren ? (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <div className="w-4" />}
          </Button>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium">{item.label}</div>
            <div className="text-sm text-muted-foreground">{item.url}</div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleMoveItem(menuId, item._id || '', 'up')}
              disabled={itemIndex === 0}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleMoveItem(menuId, item._id || '', 'down')}
              disabled={itemIndex === (menu?.items.length || 0) - 1}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenItemDialog(menuId, item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteItem(menuId, item._id || '')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="pl-4">
            {item.children?.map(child => renderMenuItem(child, menuId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl">Loading menus...</div>
      </div>
    );
  }

  const menuTree = selectedMenu ? buildMenuTree(selectedMenu.items) : [];

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
          <p className="text-muted-foreground">
            Manage your site navigation menus
          </p>
        </div>
        <Button onClick={() => handleOpenMenuDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Menus</CardTitle>
            <CardDescription>Select a menu to edit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menus.map((menu) => (
                <div
                  key={menu._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMenu?._id === menu._id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMenu(menu)}
                >
                  <div className="font-medium">{menu.name}</div>
                  <div className="text-sm opacity-80">{menu.location}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMenuDialog(menu);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMenu(menu._id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{selectedMenu?.name || 'No Menu Selected'}</CardTitle>
                <CardDescription>
                  {selectedMenu ? `Location: ${selectedMenu.location}` : 'Select a menu from the left'}
                </CardDescription>
              </div>
              {selectedMenu && (
                <Button onClick={() => handleOpenItemDialog(selectedMenu._id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedMenu ? (
              <div>
                {menuTree.length > 0 ? (
                  <div className="space-y-2">
                    {menuTree.map(item => renderMenuItem(item, selectedMenu._id))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No menu items. Click "Add Item" to get started.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a menu from the left to edit its items
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Menu Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Edit Menu' : 'Create Menu'}</DialogTitle>
            <DialogDescription>
              {editingMenu ? 'Update menu details' : 'Create a new menu'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMenuSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Menu Name</Label>
                <Input
                  id="name"
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                  placeholder="e.g., Main Menu"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={menuFormData.location}
                  onValueChange={(value) => setMenuFormData({ ...menuFormData, location: value })}
                  disabled={!!editingMenu}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseMenuDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingMenu ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMenuItem?.item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>
              {editingMenuItem?.item ? 'Update menu item details' : 'Add a new item to the menu'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleItemSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={itemFormData.label}
                  onChange={(e) => setItemFormData({ ...itemFormData, label: e.target.value })}
                  placeholder="e.g., Home, Products, About"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={itemFormData.type}
                  onValueChange={(value: 'link' | 'category' | 'page') => {
                    setItemFormData({
                      ...itemFormData,
                      type: value,
                      url: value === 'category' ? '' : itemFormData.url,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Custom Link</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {itemFormData.type === 'category' ? (
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={itemFormData.url}
                    onValueChange={(value) => setItemFormData({ ...itemFormData, url: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={itemFormData.url}
                    onChange={(e) => setItemFormData({ ...itemFormData, url: e.target.value })}
                    placeholder={itemFormData.type === 'page' ? '/about' : 'https://example.com or /page'}
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="target">Open in</Label>
                <Select
                  value={itemFormData.target || '_self'}
                  onValueChange={(value) => setItemFormData({ ...itemFormData, target: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Same Window</SelectItem>
                    <SelectItem value="_blank">New Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedMenu && selectedMenu.items.length > 0 && (
                <div>
                  <Label htmlFor="parent">Parent Item (Optional)</Label>
                  <Select
                    value={itemFormData.parentId || 'none'}
                    onValueChange={(value) => setItemFormData({ ...itemFormData, parentId: value === 'none' ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (Top Level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {selectedMenu.items
                        .filter(item => item._id && item._id !== editingMenuItem?.item?._id)
                        .map((item) => (
                          <SelectItem key={item._id} value={item._id!}>
                            {item.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseItemDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingMenuItem?.item ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {ToastComponent}
    </div>
  );
}

