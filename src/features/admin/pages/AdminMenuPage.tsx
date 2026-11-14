import { toast } from "@/components/ui/toast"
import { errMsg } from "@/lib/api"
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
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <Input
                  placeholder="Group Name (e.g. Size, Add-on Cheese, Spice)"
                  value={group.name}
                  onChange={(e) => updateGroup(gIdx, { name: e.target.value })}
                  className="text-xs h-8 flex-1 min-w-[140px]"
                />
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
                  <select
                    value={group.type}
                    onChange={(e) => updateGroup(gIdx, { type: e.target.value as 'SINGLE' | 'MULTIPLE' })}
                    className="text-xs h-8 bg-zinc-900 border border-zinc-700 rounded-lg px-2 text-zinc-200"
                  >
                    <option value="SINGLE">Single Choice</option>
                    <option value="MULTIPLE">Multi Choice</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => updateGroup(gIdx, { isRequired: !group.isRequired })}
                    className={cn(
                      "px-2 py-1 rounded text-[11px] font-semibold border transition-colors min-h-[32px] sm:min-h-0",
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
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 min-h-[32px] sm:min-h-0 flex items-center justify-center"
                    title="Remove group"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
  const renameCategory = useAdminStore((s) => s.renameCategory)
  const deleteCategory = useAdminStore((s) => s.deleteCategory)
  const deleteMenuItem = useAdminStore((s) => s.deleteMenuItem)
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const [confirmDeleteDish, setConfirmDeleteDish] = useState(false)
  const [busyAction, setBusyAction] = useState(false)

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
      toast.error(errMsg(err, "Could not add the category"))
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
    setConfirmDeleteDish(false)
  }

  const handleDeleteDish = async () => {
    if (!editingDish) return
    setBusyAction(true)
    try {
      await deleteMenuItem(editingDish.id)
      toast.success(`${editingDish.name} deleted`)
      setEditingDish(null)
      setConfirmDeleteDish(false)
    } catch (err) {
      toast.error(errMsg(err, "Could not delete the dish"))
    } finally {
      setBusyAction(false)
    }
  }

  const handleRenameCategory = async () => {
    if (!renaming || !renaming.name.trim()) return
    setBusyAction(true)
    try {
      await renameCategory(renaming.id, renaming.name.trim())
      setRenaming(null)
    } catch (err) {
      toast.error(errMsg(err, "Could not rename the category"))
    } finally {
      setBusyAction(false)
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    setBusyAction(true)
    try {
      await deleteCategory(id)
      if (categoryFilter === id) setCategoryFilter("all")
      toast.success(`Category “${name}” deleted`)
    } catch (err) {
      toast.error(errMsg(err, "Could not delete the category"))
    } finally {
      setBusyAction(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 gap-3">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink className="text-zinc-500 dark:text-zinc-400">Admin</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="text-zinc-900 dark:text-zinc-100 font-medium">Menu & Modifiers</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">Menu Management</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
          <Button
            onClick={() => setShowCategoryDialog(true)}
            variant="outline"
            className="flex-1 sm:flex-none gap-1.5 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 text-xs font-semibold shadow-xs min-h-[36px]"
          >
            <FolderPlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Category</span>
          </Button>

          <Button
            onClick={() => {
              if (!newDish.categoryId && categories.length > 0) {
                setNewDish((d) => ({ ...d, categoryId: categories[0].id }))
              }
              setShowAddDialog(true)
            }}
            className="flex-1 sm:flex-none gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer min-h-[36px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Dish</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 space-y-4">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <Input
              placeholder="Search dishes..."
              className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-xs rounded-xl h-9 shadow-xs w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
                options={[{ value: "all", label: "All Categories" }, ...categoryOpts]}
                className="w-44 text-xs"
              />
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Data table / Mobile Cards */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow className="border-b border-zinc-200/80 dark:border-zinc-800/80 hover:bg-transparent">
                <TableHead className="w-10" />
                <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold text-xs">Item</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold text-xs">Category</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold text-xs">Price</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold text-xs">Modifiers</TableHead>
                <TableHead className="text-zinc-500 dark:text-zinc-400 font-semibold text-xs">Available</TableHead>
                <TableHead className="text-right text-zinc-500 dark:text-zinc-400 font-semibold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const catName = categoryNameMap[item.categoryId] || item.categoryId
                const modifierCount = item.modifiers?.length || 0

                return (
                  <TableRow key={item.id} className="border-b border-zinc-200/70 dark:border-zinc-800/60 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors">
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
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            {item.name}
                            {item.isPopular && <Star className="h-3 w-3 text-amber-500 fill-current" />}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-[220px]">{item.description}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
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
                            className="w-20 bg-white dark:bg-zinc-800 border border-emerald-500 rounded-lg px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
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
                          className="flex items-center gap-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group tabular-nums"
                        >
                          ₹{item.price}
                          <Pencil className="h-3 w-3 text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                        </button>
                      )}
                    </TableCell>

                    {/* Modifiers badge */}
                    <TableCell>
                      {modifierCount === 0 ? (
                        <span className="text-xs text-zinc-400 dark:text-zinc-600">—</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {modifierCount} {modifierCount === 1 ? "group" : "groups"}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]">
                            {item.modifiers.map((m) => m.name).filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </TableCell>

                    {/* Availability toggle */}
                    <TableCell>
                      <Switch
                        aria-label={`${item.name}: ${item.isAvailable ? "available, tap to hide" : "hidden, tap to make available"}`}
                        checked={item.isAvailable}
                        onCheckedChange={() => toggleMenuAvailability(item.id)}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <button
                        onClick={() => setEditingDish({ ...item, modifiers: item.modifiers || [] })}
                        title="Edit dish details & modifiers"
                        className="p-1.5 rounded-lg hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
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

          {/* Mobile Dishes Cards */}
          <div className="block md:hidden divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
            {filtered.map((item) => {
              const catName = categoryNameMap[item.categoryId] || item.categoryId
              const modifierCount = item.modifiers?.length || 0

              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl mt-0.5">{item.imageUrl}</span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div
                            className={cn(
                              "w-3 h-3 rounded border-2 flex items-center justify-center shrink-0",
                              item.isVeg ? "border-emerald-500" : "border-rose-500"
                            )}
                          >
                            <div className={cn("w-1 h-1 rounded-full", item.isVeg ? "bg-emerald-500" : "bg-rose-500")} />
                          </div>
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                            {item.name}
                            {item.isPopular && <Star className="h-3 w-3 text-amber-500 fill-current" />}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2">{item.description}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium shrink-0">
                      {catName}
                    </span>
                  </div>

                  {modifierCount > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <Layers className="h-3 w-3 shrink-0" />
                      <span className="font-semibold">{modifierCount} modifier{modifierCount > 1 ? "s" : ""}:</span>
                      <span className="truncate text-zinc-600 dark:text-zinc-400">
                        {item.modifiers.map((m) => m.name).filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-500 font-medium">Price:</span>
                      <button
                        onClick={() => setEditingPrice({ id: item.id, value: String(item.price) })}
                        className="font-bold text-sm text-zinc-900 dark:text-white tabular-nums flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700"
                      >
                        ₹{item.price}
                        <Pencil className="h-2.5 w-2.5 text-zinc-400" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-zinc-500">Live</span>
                        <Switch
                          aria-label={`${item.name}: ${item.isAvailable ? "available, tap to hide" : "hidden, tap to make available"}`}
                          checked={item.isAvailable}
                          onCheckedChange={() => toggleMenuAvailability(item.id)}
                        />
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingDish({ ...item, modifiers: item.modifiers || [] })}
                        className="h-8 text-xs px-2.5 border-zinc-200 dark:border-zinc-700"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="py-12 px-4 text-center text-zinc-500 space-y-2">
                <UtensilsCrossed className="h-8 w-8 mx-auto text-zinc-400 dark:text-zinc-600" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No dishes found</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  No dishes match your active filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Menu categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {categories.length > 0 && (
              <ul className="max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-zinc-800 p-2">
                {categories.map((c) => {
                  const count = menuItems.filter((m) => m.categoryId === c.id).length
                  return (
                    <li key={c.id} className="flex items-center gap-2">
                      {renaming?.id === c.id ? (
                        <>
                          <Input value={renaming.name} onChange={(e) => setRenaming({ id: c.id, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && void handleRenameCategory()} autoFocus className="h-10" aria-label={`Rename ${c.name}`} />
                          <Button size="sm" disabled={busyAction || !renaming.name.trim()} onClick={() => void handleRenameCategory()} className="h-10 bg-emerald-600 text-white hover:bg-emerald-500">Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setRenaming(null)} className="h-10 text-zinc-400">Cancel</Button>
                        </>
                      ) : (
                        <>
                          <span className="min-w-0 flex-1 truncate px-2 text-sm">{c.name} <span className="text-xs text-zinc-500">· {count} dish{count === 1 ? "" : "es"}</span></span>
                          <Button size="sm" variant="ghost" onClick={() => setRenaming({ id: c.id, name: c.name })} className="h-10 text-zinc-400 hover:text-white">Rename</Button>
                          <Button size="sm" variant="ghost" disabled={busyAction || count > 0} title={count > 0 ? "Move or delete its dishes first" : undefined} onClick={() => void handleDeleteCategory(c.id, c.name)} className="h-10 text-rose-400 hover:text-rose-300 disabled:opacity-30">Delete</Button>
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">New category name</label>
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
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl w-full max-h-[90dvh] overflow-y-auto">
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
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-xl w-full max-h-[90dvh] overflow-y-auto">
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

            <DialogFooter className="flex-wrap items-center">
              {confirmDeleteDish ? (
                <div className="mr-auto flex items-center gap-2 text-sm">
                  <span className="text-rose-300">Delete this dish?</span>
                  <Button size="sm" disabled={busyAction} onClick={() => void handleDeleteDish()} className="h-10 bg-rose-600 text-white hover:bg-rose-500">Yes, delete</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteDish(false)} className="h-10 text-zinc-400">No</Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmDeleteDish(true)} className="mr-auto h-10 text-rose-400 hover:text-rose-300">Delete dish</Button>
              )}
              <Button variant="ghost" onClick={() => { setEditingDish(null); setConfirmDeleteDish(false) }} className="text-zinc-400">
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
