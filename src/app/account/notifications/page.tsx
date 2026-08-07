"use client";
import { useState } from "react";
import { notifications as seed } from "@/data/account";
import { PageHeader } from "@/components/admin-ui";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const [list, setList] = useState(seed);
  const markAll = () => setList(list.map((n) => ({ ...n, read: true })));
  const toggle = (id: string) => setList(list.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  const unread = list.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle={`${unread} unread`} action={<Button variant="outline" onClick={markAll}>Mark all read</Button>} />
      <ul className="space-y-2">
        {list.map((n) => (
          <li key={n.id} className={cn("flex items-start gap-3 rounded-lg border p-4 transition", !n.read && "bg-secondary/60")}>
            <button onClick={() => toggle(n.id)} className="mt-1.5">
              <span className={cn("block h-2.5 w-2.5 rounded-full", n.read ? "bg-muted" : "bg-primary")} />
            </button>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{n.title}</p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{n.type}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
        <Bell size={16} /> Manage email preferences from <span className="underline">Account settings</span>.
      </div>
    </div>
  );
}
