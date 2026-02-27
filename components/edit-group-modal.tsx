"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Fuse from "fuse.js"

interface Props {
  conversationId: Id<"conversations">
  meId: Id<"users">
  currentName: string
  currentMembers: Array<{ _id: string; name: string; image?: string }>
  onClose: () => void
}

export default function EditGroupModal({
  conversationId,
  meId,
  currentName,
  currentMembers,
  onClose,
}: Props) {
  const [groupName, setGroupName] = useState(currentName)
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(currentMembers.map((m) => m._id).filter((id) => id !== meId))
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const users = useQuery(api.users.getUsers)
  const updateGroup = useMutation(api.messages.updateGroupConversation)

  const otherUsers = users?.filter((u) => u._id !== meId) ?? []

  const filteredUsers = search.trim()
    ? new Fuse(otherUsers, { keys: ["name"], threshold: 0.4 })
        .search(search)
        .map((r) => r.item)
    : otherUsers

  function toggleUser(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const hasChanges =
    groupName.trim() !== currentName ||
    (() => {
      const prev = new Set(currentMembers.map((m) => m._id).filter((id) => id !== meId))
      if (prev.size !== selectedIds.size) return true
      for (const id of selectedIds) if (!prev.has(id)) return true
      return false
    })()

  async function handleSave() {
    if (!groupName.trim()) { setError("Group name cannot be empty"); return }
    if (selectedIds.size < 1) { setError("Group must have at least 1 other member"); return }

    setIsSaving(true)
    setError("")

    try {
      await updateGroup({
        conversationId,
        requesterId: meId,
        name: groupName.trim(),
        memberIds: [...selectedIds] as Id<"users">[],
      })
      onClose()
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  const selectedUsers = otherUsers.filter((u) => selectedIds.has(u._id))
  // Also show current members even if not in otherUsers list (edge case)
  const removedMembers = currentMembers.filter(
    (m) => m._id !== meId && !selectedIds.has(m._id)
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-popover shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Edit Group</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Update name or members</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Group name */}
        <div className="px-5 py-4 border-b border-border">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            Group Name
          </label>
          <Input
            placeholder="Group name…"
            value={groupName}
            onChange={(e) => { setGroupName(e.target.value); setError("") }}
            className="bg-elevated"
            maxLength={50}
          />
        </div>

        {/* Selected chips */}
        {selectedUsers.length > 0 && (
          <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-border">
            {/* Me chip (non-removable) */}
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              You
            </span>
            {selectedUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => toggleUser(u._id)}
                className="flex items-center gap-1.5 rounded-full bg-navy/10 dark:bg-cream/10 px-2.5 py-1 text-xs font-medium text-navy dark:text-parchment hover:bg-navy/20 dark:hover:bg-cream/20 transition-colors"
              >
                <Avatar className="h-4 w-4">
                  <AvatarImage src={u.image} />
                  <AvatarFallback className="text-[8px] bg-navy text-parchment dark:bg-cream dark:text-navy">
                    {u.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {u.name}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5 opacity-60">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-5 py-3 border-b border-border">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <Input
              placeholder="Search people to add…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-elevated border-border text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filteredUsers.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No users found</p>
          ) : (
            filteredUsers.map((u) => {
              const selected = selectedIds.has(u._id)
              const wasOriginalMember = currentMembers.some((m) => m._id === u._id)
              const isBeingRemoved = wasOriginalMember && !selected
              const isBeingAdded = !wasOriginalMember && selected

              return (
                <button
                  key={u._id}
                  onClick={() => toggleUser(u._id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                    selected
                      ? "bg-navy/10 dark:bg-cream/8 ring-1 ring-navy/20 dark:ring-cream/15"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9 ring-1 ring-border">
                      <AvatarImage src={u.image} alt={u.name} />
                      <AvatarFallback className="bg-navy text-parchment text-sm font-medium dark:bg-cream dark:text-navy">
                        {u.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {u.online && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-online-dot ring-2 ring-panel" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{u.name}</span>
                    {isBeingAdded && (
                      <span className="text-[10px] text-green-500 font-medium">Will be added</span>
                    )}
                    {isBeingRemoved && (
                      <span className="text-[10px] text-destructive font-medium">Will be removed</span>
                    )}
                    {wasOriginalMember && selected && !isBeingAdded && (
                      <span className="text-[10px] text-muted-foreground">Current member</span>
                    )}
                  </div>

                  {/* Checkbox */}
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    selected
                      ? "border-navy bg-navy dark:border-cream dark:bg-cream"
                      : "border-border bg-transparent"
                  }`}>
                    {selected && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5 text-parchment dark:text-navy">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-5 py-2">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border px-5 py-4 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {selectedIds.size + 1} member{selectedIds.size + 1 === 1 ? "" : "s"} total
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="h-9 text-sm">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !groupName.trim() || selectedIds.size < 1}
              className="h-9 text-sm"
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}