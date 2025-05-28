// app/components/dashboard/editors/link-page-editor.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Trash2, PlusCircle, Edit2, Eye, EyeOff, Save, ExternalLink, AlertCircle, Settings2, Palette as PaletteIcon, Type as TypeIcon, Droplets, ChevronsUpDownIcon, Link2Icon as LinkPageIcon, Globe2 as WebsiteIcon, CheckCircle, GripVertical // Keep GripVertical for non-DND hint
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { z } from 'zod';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// DND-Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableLinkItem } from './sortable-link-item'; // Our SortableLinkItem

// Types (LinkPageAppearanceSettings, ProjectDataForEditor, LinkItem - remain the same)
export interface LinkPageAppearanceSettings { /* ... same ... */ theme?: 'light' | 'dark' | 'custom'; backgroundColor?: string; textColor?: string; fontFamily?: 'Inter' | 'Manrope' | 'System UI' | 'Roboto' | 'Open Sans' | 'Poppins' | 'Lato'; buttonStyle?: 'rounded-full' | 'rounded-lg' | 'rounded-md' | 'square'; buttonColor?: string; buttonFontColor?: string; buttonHoverColor?: string; buttonHoverFontColor?: string; }
export interface ProjectDataForEditor { /* ... same ... */ id: string; title: string; project_type: 'Link Page' | 'Website'; status: string; url?: string | null; user_id: string; created_at: string; updated_at: string; appearance_settings?: LinkPageAppearanceSettings | null; }
export interface LinkItem { /* ... same ... */ id?: string; project_id: string; user_id: string; title: string; url: string; display_order: number; is_active: boolean; icon?: string | null; clicks?: number; created_at?: string; updated_at?: string; }

const fontHeading = "font-manrope";
const fontBody = "font-inter";

const LinkFormSchema = z.object({ /* ... same ... */ title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title cannot exceed 100 characters." }), url: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." }), is_active: z.boolean().default(true), icon: z.string().max(100, { message: "Icon input too long (e.g. emoji, class name, or short URL)." }).optional().nullable(), });
const defaultAppearanceSettings: LinkPageAppearanceSettings = { /* ... same ... */ theme: 'light', backgroundColor: '#F9FAFB', textColor: '#1F2937', fontFamily: 'Inter', buttonStyle: 'rounded-lg', buttonColor: '#4F46E5', buttonFontColor: '#FFFFFF', buttonHoverColor: '#4338CA', buttonHoverFontColor: '#FFFFFF',};


export interface LinkPageEditorProps {
  project: ProjectDataForEditor;
}

export default function LinkPageEditor({ project: initialProjectData }: LinkPageEditorProps) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [project, setProject] = useState<ProjectDataForEditor>(initialProjectData);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isSavingProjectSettings, setIsSavingProjectSettings] = useState(false);

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentEditingLink, setCurrentEditingLink] = useState<Partial<LinkItem> | null>(null);
  const [linkFormData, setLinkFormData] = useState<{ title: string; url: string; is_active: boolean; icon?: string | null }>({
    title: '', url: '', is_active: true, icon: '',
  });
  const [linkFormErrors, setLinkFormErrors] = useState<z.ZodFormattedError<z.infer<typeof LinkFormSchema>> | null>(null);
  const [isSavingLink, setIsSavingLink] = useState(false);

  const [appearanceSettings, setAppearanceSettings] = useState<LinkPageAppearanceSettings>(
    { ...defaultAppearanceSettings, ...(initialProjectData.appearance_settings || {}) }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchLinks = useCallback(async () => { /* ... same ... */
    if (!project.id) return; setIsLoadingLinks(true);
    const { data, error } = await supabase.from('links').select('*').eq('project_id', project.id).order('display_order', { ascending: true });
    if (error) { console.error('Error fetching links:', error); toast.error("Failed to load links.", { description: error.message }); setLinks([]);
    } else { setLinks(data || []); } setIsLoadingLinks(false);
  }, [supabase, project.id]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);
  useEffect(() => { setProject(initialProjectData); setAppearanceSettings({ ...defaultAppearanceSettings, ...(initialProjectData.appearance_settings || {}) }); }, [initialProjectData]);

  const handleOpenNewLinkDialog = () => { /* ... same ... */ };
  const handleOpenEditLinkDialog = (link: LinkItem) => { /* ... same ... */ };
  const handleLinkDialogFormChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... same ... */ };
  const handleLinkDialogActiveToggle = (checked: boolean) => { /* ... same ... */ };
  const validateLinkURL = (url: string): boolean => { /* ... same ... */ return true;}; // Placeholder, use original logic
  const handleSaveLinkDialog = async () => { /* ... same logic using LinkFormSchema and Supabase ... */ };
  const handleDeleteLink = (linkId: string, linkTitle: string) => { /* ... same logic using toast.warning ... */ };
  const handleToggleLinkActiveOnList = async (link: LinkItem) => { /* ... same optimistic update logic ... */ };
  // Removed handleReorderLink as dnd-kit handles it now

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldLinks = [...links];
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedLinks = arrayMove(links, oldIndex, newIndex);
      const updatedLinksWithNewOrder = reorderedLinks.map((link, index) => ({
        ...link,
        display_order: index,
      }));
      setLinks(updatedLinksWithNewOrder);

      setIsLoadingLinks(true); // Use general loading indicator for link list operations
      const updates = updatedLinksWithNewOrder.map(link => ({
        id: link.id!, // id is guaranteed here
        display_order: link.display_order,
        // Only include fields that might change or are needed for matching
        // user_id is good for RLS if policies are complex, but id should be primary matcher
      }));

      // For simplicity, we'll update each link individually.
      // For many links, a batch update via a Supabase function would be more efficient.
      const promises = updates.map(linkUpdate =>
        supabase
          .from('links')
          .update({ display_order: linkUpdate.display_order })
          .eq('id', linkUpdate.id)
          .eq('user_id', project.user_id) // RLS also handles this
      );

      try {
        const results = await Promise.all(promises);
        const anyError = results.some(res => res.error);
        if (anyError) {
          const errorMessages = results.map(res => res.error?.message).filter(Boolean).join('; ');
          throw new Error(errorMessages || "Some link order updates failed.");
        }
        toast.success("Link order saved!");
        // fetchLinks(); // Re-fetch for absolute consistency if desired, but optimistic update is fast
      } catch (e: any) {
        toast.error("Failed to save new link order.", { description: e.message });
        setLinks(oldLinks); // Revert to old order on error
      } finally {
        setIsLoadingLinks(false);
      }
    }
  };

  const handleAppearanceChange = (settingName: keyof LinkPageAppearanceSettings, value: any) => { /* ... same ... */ };
  const handleSaveAppearance = async () => { /* ... same ... */ };

  // Link items are no longer memoized here directly because SortableLinkItem handles its own memoization if needed.
  // If SortableLinkItem is very simple, memoizing the map here might still be useful if LinkPageEditor re-renders often.
  // For now, we'll map directly.

  if (isLoadingLinks && links.length === 0) { /* ... same loading state ... */ }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={`space-y-8 ${fontBody}`}>
        <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 rounded-xl">
          <CardHeader>
            <CardTitle className={`${fontHeading} text-2xl text-slate-900 dark:text-slate-50`}>Manage Your Links</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Drag the <GripVertical className="inline h-4 w-4 text-slate-500 dark:text-slate-400" /> handle to reorder. Add, edit, and manage links for "<span className="font-medium text-indigo-600 dark:text-indigo-400">{project.title}</span>".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleOpenNewLinkDialog} className="mb-6 ...">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Link
            </Button>

            {links.length === 0 && !isLoadingLinks && (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                <p>No links yet. Click <span className="font-medium text-indigo-600 dark:text-indigo-400">Add New Link</span> to get started!</p>
              </div>
            )}

            {links.length > 0 && (
              <SortableContext items={links.map(link => link.id!)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2"> {/* Reduced space between sortable items */}
                  {links.map((link) => (
                    <SortableLinkItem key={link.id!} id={link.id!} isOpacityReduced={!link.is_active}>
                      {/* The actual Link Card content. SortableLinkItem now provides the drag handle externally. */}
                      <Card className={`p-3 border dark:border-slate-700/80 flex items-center justify-between rounded-lg transition-opacity duration-300 ${!link.is_active ? '' : 'bg-white dark:bg-slate-800/70 shadow-sm'}`}>
                        {/* GripVertical is now part of SortableLinkItem's structure, not directly in this Card */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {link.icon && <span className="text-lg flex-shrink-0 select-none" role="img" aria-label="Link icon">{link.icon}</span>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 truncate" title={link.title}>{link.title}</p>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate block" title={link.url} onClick={(e) => e.stopPropagation()}>
                              {link.url} <ExternalLink className="inline-block h-3 w-3 ml-0.5" />
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-1.5 ml-2 flex-shrink-0">
                          {/* Action buttons: Toggle Active, Edit, Delete. Reorder buttons are gone. */}
                          <TooltipProvider><Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleToggleLinkActiveOnList(link)} disabled={isLoadingLinks} className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">{link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
                          </TooltipTrigger><TooltipContent><p>{link.is_active ? "Deactivate" : "Activate"}</p></TooltipContent></Tooltip></TooltipProvider>
                          <TooltipProvider><Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditLinkDialog(link)} disabled={isLoadingLinks} className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Edit2 className="h-4 w-4" /></Button>
                          </TooltipTrigger><TooltipContent><p>Edit Link</p></TooltipContent></Tooltip></TooltipProvider>
                          <TooltipProvider><Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id!, link.title)} disabled={isLoadingLinks} className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"><Trash2 className="h-4 w-4" /></Button>
                          </TooltipTrigger><TooltipContent><p>Delete Link</p></TooltipContent></Tooltip></TooltipProvider>
                        </div>
                      </Card>
                    </SortableLinkItem>
                  ))}
                </div>
              </SortableContext>
            )}
             {links.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-4 text-center">
                    Use the <GripVertical className="inline h-3 w-3" /> handle next to each link to drag and reorder.
                </p>
             )}
          </CardContent>
        </Card>

        {/* Add/Edit Link Dialog (same as previous, ensure form fields and Zod schema match) */}
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            {/* ... DialogContent for links, including icon input. Ensure input names match linkFormData keys ... */}
        </Dialog>

        {/* Appearance Settings Card (same as previous with expanded controls) */}
        <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 rounded-xl">
            {/* ... Appearance Card Header, Content with new inputs, and Footer ... */}
        </Card>
      </div>
    </DndContext>
  );
}