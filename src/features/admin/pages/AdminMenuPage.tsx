import { useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { useAdminStore } from "@/stores/useAdminStore"
import { Search, Plus, Pencil, Leaf, Drumstick, Star, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { MOCK_CATEGORIES, CATEGORY_NAME_MAP } from "@/data/mockData"
import type { MenuItem } from "@/types/domain"

const CATEGORY_OPTS = MOCK_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))

export function AdminMenuPage() {
  const menuItems = useAdminStore((s) => s.menuItems)
  const toggleMenuAvailability = useAdminStore((s) => s.toggleMenuAvailability)
  const updateMenuPrice = useAdminStore((s) => s.updateMenuPrice)
  const addMenuItem = useAdminStore((s) => s.addMenuItem)

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null)

  const [newDish, setNewDish] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "cat-breakfast",
    isVeg: true,
    imageUrl: "🍽️",
  })

  const filtered = menuItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "all" || item.categoryId === categoryFilter
    return matchSearch && matchCategory
  })

  const handleSavePrice = (id: string) => {
    if (!editingPrice || editingPrice.id !== id) return
    const price = parseFloat(editingPrice.value)
    if (!isNaN(price) && price > 0) {
      updateMenuPrice(id, price)
    }
    setEditingPrice(null)
  }

  const handleCreateDish = () => {
    if (!newDish.name.trim() || !newDish.price) return
    const createdItem: MenuItem = {
      id: `item-${Date.now()}`,
      categoryId: newDish.categoryId,
      name: newDish.name,
      description: newDish.description,
      price: parseFloat(newDish.price) || 0,
      isVeg: newDish.isVeg,
      isAvailable: true,
      imageUrl: newDish.imageUrl || "🍽️",
      modifiers: [],
    }
    addMenuItem(createdItem)
    setShowAddDialog(false)
    setNewDish({
      name: "",
      description: "",
      price: "",
      categoryId: "cat-breakfast",
      isVeg: true,
      imageUrl: "🍽️",
    })
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-950">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink>Admin</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Menu & Modifiers</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-100 mt-1">Menu Management</h1>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25"
        >
          <Plus className="h-4 w-4" />
          Add New Dish
        </Button>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {/* Filters row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search dishes..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v)}
              options={[{ value: "all", label: "All Categories" }, ...CATEGORY_OPTS]}
              className="min-w-[180px]"
            />
          </div>

          <p className="text-xs text-zinc-500 ml-auto">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Data table */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Modifiers</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const catName = CATEGORY_NAME_MAP[item.categoryId] || item.categoryId

                return (
                  <TableRow key={item.id}>
                    {/* Emoji */}
                    <TableCell>
                      <span className="text-xl">{item.imageUrl}</span>
                    </TableCell>

                    {/* Name + dietary */}
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div
                          className={cn(
                            "mt-1 flex-shrink-0 w-3.5 h-3.5 rounded border-2 flex items-center justify-center",
                            item.isVeg ? "border-emerald-500" : "border-rose-500"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", item.isVeg ? "bg-emerald-500" : "bg-rose-500")} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100 flex items-center gap-1">
                            {item.name}
                            {item.isPopular && <Star className="h-3 w-3 text-amber-400 fill-current" />}
                          </p>
                          <p className="text-xs text-zinc-500 line-clamp-1 max-w-[220px]">{item.description}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400">
                        {catName}
                      </span>
                    </TableCell>

                    {/* Price inline edit */}
                    <TableCell>
                      {editingPrice?.id === item.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-400 text-sm">₹</span>
                          <input
                            type="number"
                            className="w-20 bg-zinc-800 border border-emerald-500 rounded-lg px-2 py-1 text-sm text-zinc-100 focus:outline-none"
                            value={editingPrice.value}
                            onChange={(e) => setEditingPrice({ id: item.id, value: e.target.value })}
                            onBlur={() => handleSavePrice(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSavePrice(item.id)
                              if (e.key === "Escape") setEditingPrice(null)
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingPrice({ id: item.id, value: String(item.price) })}
                          className="flex items-center gap-1 text-sm font-semibold text-zinc-200 hover:text-emerald-400 transition-colors group"
                        >
                          ₹{item.price}
                          <Pencil className="h-3 w-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                        </button>
                      )}
                    </TableCell>

                    {/* Modifier count */}
                    <TableCell>
                      <span className="text-xs text-zinc-500">
                        {item.modifiers.length === 0
                          ? "—"
                          : `${item.modifiers.length} group${item.modifiers.length > 1 ? "s" : ""}`}
                      </span>
                    </TableCell>

                    {/* Availability toggle */}
                    <TableCell>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => toggleMenuAvailability(item.id)}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <button className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add New Dish Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Dish Name *</label>
                <Input
                  placeholder="e.g., Shakshuka"
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Emoji Icon</label>
                <Input
                  placeholder="🍳"
                  value={newDish.imageUrl}
                  onChange={(e) => setNewDish({ ...newDish, imageUrl: e.target.value })}
                  className="text-center text-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Description</label>
              <Input
                placeholder="Short description..."
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Base Price (₹) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Category *</label>
                <Select
                  value={newDish.categoryId}
                  onValueChange={(v) => setNewDish({ ...newDish, categoryId: v })}
                  options={CATEGORY_OPTS}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Dietary Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewDish({ ...newDish, isVeg: true })}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                    newDish.isVeg
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  <Leaf className="h-3.5 w-3.5" />
                  Vegetarian
                </button>
                <button
                  type="button"
                  onClick={() => setNewDish({ ...newDish, isVeg: false })}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                    !newDish.isVeg
                      ? "border-rose-500 bg-rose-500/15 text-rose-400"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  <Drumstick className="h-3.5 w-3.5" />
                  Non-Veg
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="text-zinc-400">
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={handleCreateDish}
            >
              Add Dish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
