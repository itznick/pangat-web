import { useState, useMemo } from "react"
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
import {
  Search,
  Plus,
  Pencil,
  Leaf,
  Drumstick,
  Star,
  Filter,
  UtensilsCrossed,
  FolderPlus,
  Trash2,
  X,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem, Modifier, ModifierOption } from "@/types/domain"

interface ModifierBuilderProps {
  modifiers: Modifier[]
  onChange: (modifiers: Modifier[]) => void
}

function ModifierBuilder({ modifiers, onChange }: ModifierBuilderProps) {
  const addGroup = () => {
    const newGroup: Modifier = {
      id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: "",
      type: "SINGLE",
      isRequired: false,
      options: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 30 },
      ],
    }
    onChange([...modifiers, newGroup])
  }

  const removeGroup = (index: number) => {
    onChange(modifiers.filter((_, i) => i !== index))
  }

  const updateGroup = (index: number, updated: Partial<Modifier>) => {
    onChange(
      modifiers.map((m, i) => (i === index ? { ...m, ...updated } : m))
    )
  }

  const addOption = (groupIndex: number) => {
    const group = modifiers[groupIndex]
    const nextOptions: ModifierOption[] = [...group.options, { name: "", price: 0 }]
    updateGroup(groupIndex, { options: nextOptions })
  }

  const updateOption = (groupIndex: number, optIndex: number, field: keyof ModifierOption, val: any) => {
    const group = modifiers[groupIndex]
    const nextOptions = group.options.map((opt, i) =>
      i === optIndex ? { ...opt, [field]: val } : opt
    )
    updateGroup(groupIndex, { options: nextOptions })
  }

  const removeOption = (groupIndex: number, optIndex: number) => {
    const group = modifiers[groupIndex]
    const nextOptions = group.options.filter((_, i) => i !== optIndex)
    updateGroup(groupIndex, { options: nextOptions })
  }

  return (
    <div className="space-y-3 pt-3 border-t border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-zinc-200">Customization & Modifiers</label>
          <p className="text-[11px] text-zinc-500">Configure size variants, add-on toppings, spice levels</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addGroup}
          className="text-xs h-7 border-zinc-700 hover:border-emerald-500 text-zinc-300 hover:text-emerald-400 gap-1"
        >
          <Plus className="h-3 w-3" />
          Add Modifier Group
        </Button>
      </div>

      {modifiers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-3 text-center text-xs text-zinc-500">
          No modifiers added yet. Click above to add portion sizes, add-ons, or custom choices.
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {modifiers.map((group, gIdx) => (
            <div key={group.id || gIdx} className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Group Name (e.g. Size, Add-on Cheese, Spice)"
                  value={group.name}
                  onChange={(e) => updateGroup(gIdx, { name: e.target.value })}
                  className="text-xs h-8 flex-1"
                />
                <select
                  value={group.type}
                  onChange={(e) => updateGroup(gIdx, { type: e.target.value as 'SINGLE' | 'MULTIPLE' })}
                  className="text-xs h-8 bg-zinc-900 border border-zinc-700 rounded-lg px-2 text-zinc-200"
                >
                  <option value="SINGLE">Single Choice (Radio)</option>
                  <option value="MULTIPLE">Multi Choice (Checkbox)</option>
                </select>
                <button
                  type="button"
                  onClick={() => updateGroup(gIdx, { isRequired: !group.isRequired })}
                  className={cn(
                    "px-2 py-1 rounded text-[11px] font-semibold border transition-colors",
                    group.isRequired
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "bg-zinc-800 border-zinc-700 text-zinc-500"
                  )}
                >
                  {group.isRequired ? "Required" : "Optional"}
                </button>
                <button
                  type="button"
                  onClick={() => removeGroup(gIdx)}
                  className="p-1 rounded text-zinc-500 hover:text-rose-400"
                  title="Remove group"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Options list */}
              <div className="space-y-1.5 pl-2 border-l-2 border-zinc-700/60">
                {group.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2 text-xs">
                    <Input
                      placeholder="Option (e.g., Large, Extra Pav)"
                      value={opt.name}
                      onChange={(e) => updateOption(gIdx, oIdx, 'name', e.target.value)}
                      className="text-xs h-7 flex-1"
                    />
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-zinc-500 text-xs">+₹</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={opt.price}
                        onChange={(e) => updateOption(gIdx, oIdx, 'price', parseFloat(e.target.value) || 0)}
                        className="text-xs h-7 w-16"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(gIdx, oIdx)}
                      className="p-1 text-zinc-500 hover:text-rose-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(gIdx)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 mt-1"
                >
                  <Plus className="h-3 w-3" /> Add Choice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminMenuPage() {
  const menuItems = useAdminStore((s) => s.menuItems)
  const categories = useAdminStore((s) => s.categories)
  const categoryNameMap = useAdminStore((s) => s.categoryNameMap)
  const toggleMenuAvailability = useAdminStore((s) => s.toggleMenuAvailability)
  const updateMenuPrice = useAdminStore((s) => s.updateMenuPrice)
  const addMenuItem = useAdminStore((s) => s.addMenuItem)
  const updateMenuItem = useAdminStore((s) => s.updateMenuItem)
  const addCategory = useAdminStore((s) => s.addCategory)

  const categoryOpts = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  )

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false)

  const [editingDish, setEditingDish] = useState<MenuItem | null>(null)
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null)

  const [newDish, setNewDish] = useState<{
    name: string
    description: string
    price: string
    categoryId: string
    isVeg: boolean
    imageUrl: string
    modifiers: Modifier[]
  }>({
    name: "",
    description: "",
    price: "",
    categoryId: categories[0]?.id || "",
    isVeg: true,
    imageUrl: "🍽️",
    modifiers: [],
  })

  const filtered = menuItems.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    setIsSubmittingCategory(true)
    try {
      const created = await addCategory(newCategoryName.trim())
      setNewCategoryName("")
      setShowCategoryDialog(false)
      if (created?.id && !newDish.categoryId) {
        setNewDish((d) => ({ ...d, categoryId: created.id }))
      }
    } catch (err) {
      console.error("Failed to add category:", err)
    } finally {
      setIsSubmittingCategory(false)
    }
  }

  const handleCreateDish = () => {
    if (!newDish.name.trim() || !newDish.price) return
    const createdItem: MenuItem = {
      id: `item-${Date.now()}`,
      categoryId: newDish.categoryId || (categories[0]?.id ?? "cat-01"),
      name: newDish.name,
      description: newDish.description,
      price: parseFloat(newDish.price) || 0,
      isVeg: newDish.isVeg,
      isAvailable: true,
      imageUrl: newDish.imageUrl || "🍽️",
      modifiers: newDish.modifiers || [],
    }
    addMenuItem(createdItem)
    setShowAddDialog(false)
    setNewDish({
      name: "",
      description: "",
      price: "",
      categoryId: categories[0]?.id ?? "",
      isVeg: true,
      imageUrl: "🍽️",
      modifiers: [],
    })
  }

  const handleSaveEditedDish = () => {
    if (!editingDish || !editingDish.name.trim()) return
    updateMenuItem(editingDish)
    setEditingDish(null)
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

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setShowCategoryDialog(true)}
            variant="outline"
            className="gap-1.5 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-zinc-900"
          >
            <FolderPlus className="h-4 w-4 text-emerald-400" />
            Add Category
          </Button>

          <Button
            onClick={() => {
              if (!newDish.categoryId && categories.length > 0) {
                setNewDish((d) => ({ ...d, categoryId: categories[0].id }))
              }
              setShowAddDialog(true)
            }}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25"
          >
            <Plus className="h-4 w-4" />
            Add New Dish
          </Button>
        </div>
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
              options={[{ value: "all", label: "All Categories" }, ...categoryOpts]}
              className="min-w-[180px]"
            />
          </div>

          <p className="text-xs text-zinc-500 ml-auto font-medium">
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
                const catName = categoryNameMap[item.categoryId] || item.categoryId
                const modifierCount = item.modifiers?.length || 0

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

                    {/* Modifiers badge */}
                    <TableCell>
                      {modifierCount === 0 ? (
                        <span className="text-xs text-zinc-600">—</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {modifierCount} {modifierCount === 1 ? "group" : "groups"}
                          </span>
                          <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                            {item.modifiers.map((m) => m.name).filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
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
                      <button
                        onClick={() => setEditingDish({ ...item, modifiers: item.modifiers || [] })}
                        title="Edit dish details & modifiers"
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <UtensilsCrossed className="h-8 w-8 mb-2 text-zinc-600" />
                      <p className="text-sm font-semibold text-zinc-300">No dishes found</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                        No dishes match your active filter. Try resetting your search or add a new dish to your menu.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSearch("")
                          setCategoryFilter("all")
                        }}
                        variant="outline"
                        className="mt-3 text-xs border-zinc-700 text-zinc-300"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add New Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Category Name *</label>
              <Input
                placeholder="e.g., Cold Beverages, Chai & Snacks, Desserts"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Categories group dishes on both customer digital menus and kitchen tickets.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCategoryDialog(false)} className="text-zinc-400">
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={!newCategoryName.trim() || isSubmittingCategory}
              onClick={handleCreateCategory}
            >
              {isSubmittingCategory ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Dish Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Dish Name *</label>
                <Input
                  placeholder="e.g., Misal Pav"
                  value={newDish.name}
                  onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Emoji Icon</label>
                <Input
                  placeholder="🍲"
                  value={newDish.imageUrl}
                  onChange={(e) => setNewDish({ ...newDish, imageUrl: e.target.value })}
                  className="text-center text-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Description</label>
              <Input
                placeholder="Spicy sprouted moth bean curry topped with farsan & lemon..."
                value={newDish.description}
                onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Base Price (₹) *</label>
                <Input
                  type="number"
                  placeholder="120"
                  value={newDish.price}
                  onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Category *</label>
                <Select
                  value={newDish.categoryId}
                  onValueChange={(v) => setNewDish({ ...newDish, categoryId: v })}
                  options={categoryOpts}
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

            {/* Modifiers Builder */}
            <ModifierBuilder
              modifiers={newDish.modifiers}
              onChange={(mods) => setNewDish({ ...newDish, modifiers: mods })}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="text-zinc-400">
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={handleCreateDish}
              disabled={!newDish.name.trim() || !newDish.price}
            >
              Add Dish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dish Dialog */}
      {editingDish && (
        <Dialog open={Boolean(editingDish)} onOpenChange={(open) => !open && setEditingDish(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Dish Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Dish Name *</label>
                  <Input
                    value={editingDish.name}
                    onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Emoji Icon</label>
                  <Input
                    value={editingDish.imageUrl}
                    onChange={(e) => setEditingDish({ ...editingDish, imageUrl: e.target.value })}
                    className="text-center text-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Description</label>
                <Input
                  value={editingDish.description}
                  onChange={(e) => setEditingDish({ ...editingDish, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Base Price (₹) *</label>
                  <Input
                    type="number"
                    value={String(editingDish.price)}
                    onChange={(e) => setEditingDish({ ...editingDish, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Category *</label>
                  <Select
                    value={editingDish.categoryId}
                    onValueChange={(v) => setEditingDish({ ...editingDish, categoryId: v })}
                    options={categoryOpts}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Dietary Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDish({ ...editingDish, isVeg: true })}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                      editingDish.isVeg
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                        : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                    )}
                  >
                    <Leaf className="h-3.5 w-3.5" />
                    Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDish({ ...editingDish, isVeg: false })}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                      !editingDish.isVeg
                        ? "border-rose-500 bg-rose-500/15 text-rose-400"
                        : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                    )}
                  >
                    <Drumstick className="h-3.5 w-3.5" />
                    Non-Veg
                  </button>
                </div>
              </div>

              {/* Modifiers Builder */}
              <ModifierBuilder
                modifiers={editingDish.modifiers || []}
                onChange={(mods) => setEditingDish({ ...editingDish, modifiers: mods })}
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingDish(null)} className="text-zinc-400">
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={handleSaveEditedDish}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
