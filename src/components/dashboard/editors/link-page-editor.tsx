// app/components/dashboard/editors/link-page-editor.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Trash2, PlusCircle, Edit2, GripVertical, Eye, EyeOff, Save, ExternalLink, AlertCircle, Settings2, Palette, Link2Icon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { z } from 'zod'; // For robust validation
import { useRouter } from 'next/navigation';

export interface LinkItem {
  id?: string;
  project_id: string;
  user_id: string;
  title: string;
  url: string;
  display_order: number;
  is_active: boolean;
  icon?: string | null;
  clicks?: number;
  created_at?: string;
  updated_at?: string;
}

// Types
export interface ProjectDataForEditor { // Ensure this matches the page component
  id: string;
  title: string;
  project_type: 'Link Page' | 'Website';
  status: string;
  url?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Add specific fields for Link Page appearance if they exist on the project table
  appearance_settings?: LinkPageAppearanceSettings; // Example
}

export interface LinkItem {
  id?: string;
  project_id: string;
  user_id: string;
  title: string;
  url: string;
  display_order: number;
  is_active: boolean;
  icon?: string | null;
  clicks?: number;
  created_at?: string;
  updated_at?: string;
}

// Example: Define what appearance settings might look like
interface LinkPageAppearanceSettings {
  backgroundColor?: string;
  fontFamily?: string;
  buttonStyle?: 'rounded' | 'square' | 'pill';
  // ... more settings
}

interface LinkPageEditorProps {
  project: ProjectDataForEditor;
}

const fontHeading = "font-manrope";
const fontBody = "font-inter";

// Zod Schema for Link Validation
const LinkFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title too long." }),
  url: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." }),
  is_active: z.boolean().default(true),
  // display_order can be handled separately or set default
});


export default function LinkPageEditor({ project: initialProjectData }: LinkPageEditorProps) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter(); // If needed for navigation after a major save

  const [project, setProject] = useState<ProjectDataForEditor>(initialProjectData);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isSavingProject, setIsSavingProject] = useState(false);

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [currentEditingLink, setCurrentEditingLink] = useState<Partial<LinkItem> | null>(null); // For add/edit dialog
  const [linkFormData, setLinkFormData] = useState<{ title: string; url: string; is_active: boolean }>({ title: '', url: '', is_active: true });
  const [linkFormErrors, setLinkFormErrors] = useState<z.ZodFormattedError<z.infer<typeof LinkFormSchema>> | null>(null);
  const [isSavingLink, setIsSavingLink] = useState(false);


  const fetchLinks = useCallback(async () => {
    if (!project.id) return;
    setIsLoadingLinks(true);
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('project_id', project.id)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching links:', error);
      toast.error("Failed to load links.", { description: error.message });
      setLinks([]);
    } else {
      setLinks(data || []);
    }
    setIsLoadingLinks(false);
  }, [supabase, project.id]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Update project state if initialProjectData changes (e.g. after a global save)
  useEffect(() => {
    setProject(initialProjectData);
  }, [initialProjectData]);


  const handleOpenNewLinkDialog = () => {
    setCurrentEditingLink(null); // Clear any previous editing state
    setLinkFormData({ title: '', url: '', is_active: true }); // Reset form
    setLinkFormErrors(null);
    setIsLinkDialogOpen(true);
  };

  const handleOpenEditLinkDialog = (link: LinkItem) => {
    setCurrentEditingLink(link); // Set the link being edited
    setLinkFormData({ title: link.title, url: link.url, is_active: link.is_active }); // Populate form
    setLinkFormErrors(null);
    setIsLinkDialogOpen(true);
  };

  const handleLinkDialogFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinkFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkDialogActiveToggle = (checked: boolean) => {
    setLinkFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleSaveLinkDialog = async () => {
    const validationResult = LinkFormSchema.safeParse(linkFormData);
    if (!validationResult.success) {
      setLinkFormErrors(validationResult.error.format());
      return;
    }

    setLinkFormErrors(null);
    setIsSavingLink(true);

    const { title, url, is_active } = validationResult.data;

    const linkDataToSave = {
      project_id: project.id,
      user_id: project.user_id,
      title: title,
      url: url,
      is_active: is_active,
      display_order: currentEditingLink?.id ? currentEditingLink.display_order : links.length, // Keep order if editing, else append
      icon: currentEditingLink?.icon || null, // Preserve icon if editing
    };

    let opError;
    let successMessage = "";

    if (currentEditingLink?.id) { // Editing existing link
      const { error } = await supabase
        .from('links')
        .update(linkDataToSave)
        .eq('id', currentEditingLink.id)
        .eq('user_id', project.user_id);
      opError = error;
      successMessage = "Link updated successfully!";
    } else { // Adding new link
      const { error } = await supabase
        .from('links')
        .insert(linkDataToSave);
      opError = error;
      successMessage = "Link added successfully!";
    }

    setIsSavingLink(false);

    if (opError) {
      console.error('Error saving link:', opError);
      toast.error(`Failed to ${currentEditingLink?.id ? 'update' : 'add'} link.`, { description: opError.message });
    } else {
      setIsLinkDialogOpen(false);
      setCurrentEditingLink(null);
      fetchLinks();
      toast.success(successMessage);
    }
  };

  const handleDeleteLink = async (linkId: string, linkTitle: string) => {
    toast.warning(`Delete "${linkTitle}"?`, {
      action: { label: "Delete", onClick: async () => {
        setIsLoadingLinks(true); // Indicate activity on the list
        const { error } = await supabase.from('links').delete().eq('id', linkId).eq('user_id', project.user_id);
        setIsLoadingLinks(false);
        if (error) {
          toast.error("Failed to delete link.", { description: error.message });
        } else {
          fetchLinks(); toast.success("Link deleted.");
        }
      }},
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  };

  const handleToggleLinkActiveOnList = async (link: LinkItem) => {
    const newActiveState = !link.is_active;
    // Optimistic UI update
    const originalLinks = links;
    setLinks(prevLinks => prevLinks.map(l => l.id === link.id ? { ...l, is_active: newActiveState } : l));

    const { error } = await supabase
      .from('links')
      .update({ is_active: newActiveState })
      .eq('id', link.id!)
      .eq('user_id', project.user_id);

    if (error) {
      toast.error("Failed to update link status.", { description: error.message });
      setLinks(originalLinks); // Revert optimistic update on error
    } else {
      toast.success(`Link status updated.`);
      // fetchLinks(); // Optionally re-fetch for absolute consistency, or rely on optimistic.
    }
  };

  // Placeholder for saving overall project settings (e.g., title, appearance)
  const handleSaveProjectSettings = async () => {
    setIsSavingProject(true);
    toast.info("Saving project settings...");
    // Example: update project title (if editable on this page)
    // const { error } = await supabase
    //   .from('projects')
    //   .update({ title: project.title, appearance_settings: project.appearance_settings })
    //   .eq('id', project.id)
    //   .eq('user_id', project.user_id);
    //
    // if (error) {
    //   toast.error("Failed to save project settings.", { description: error.message });
    // } else {
    //   toast.success("Project settings saved!");
    //   router.refresh(); // To update server component data like page title
    // }
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate save
    toast.success("Project settings saved (mock)!");
    setIsSavingProject(false);
  };


  // Memoize link items to prevent unnecessary re-renders of individual links if parent re-renders
  const memoizedLinks = useMemo(() => links.map((link) => (
    <Card key={link.id} className={`p-3 sm:p-4 border dark:border-slate-700/80 flex items-center justify-between rounded-lg transition-opacity duration-300 ${!link.is_active ? 'opacity-50 bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800/70 shadow-sm'}`}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <GripVertical className="h-5 w-5 text-slate-400 dark:text-slate-500 cursor-grab flex-shrink-0" aria-label="Drag to reorder" />
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 truncate" title={link.title}>{link.title}</p>
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate block" title={link.url} onClick={(e) => e.stopPropagation()}>
            {link.url} <ExternalLink className="inline-block h-3 w-3 ml-0.5" />
          </a>
        </div>
      </div>
      <div className="flex items-center space-x-1.5 sm:space-x-2 ml-2 flex-shrink-0">
        <TooltipProvider><Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => handleToggleLinkActiveOnList(link)} className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            {link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </TooltipTrigger><TooltipContent><p>{link.is_active ? "Deactivate" : "Activate"}</p></TooltipContent></Tooltip></TooltipProvider>
        <TooltipProvider><Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => handleOpenEditLinkDialog(link)} className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            <Edit2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger><TooltipContent><p>Edit Link</p></TooltipContent></Tooltip></TooltipProvider>
        <TooltipProvider><Tooltip><TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id!, link.title)} className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30">
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger><TooltipContent><p>Delete Link</p></TooltipContent></Tooltip></TooltipProvider>
      </div>
    </Card>
  )), [links, handleToggleLinkActiveOnList, handleOpenEditLinkDialog, handleDeleteLink]); // Add dependencies


  if (isLoadingLinks && links.length === 0) { // Show initial full loader only if no links are shown yet
    return <div className="text-center p-10 text-slate-600 dark:text-slate-400">Loading your links...</div>;
  }

  return (
    <div className={`space-y-8 ${fontBody}`}>
      {/* Section for Managing Links */}
      <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 rounded-xl">
        <CardHeader>
          <CardTitle className={`${fontHeading} text-2xl text-slate-900 dark:text-slate-50`}>Manage Your Links</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Add, edit, and arrange the links that will appear on your "<span className="font-medium text-indigo-600 dark:text-indigo-400">{project.title}</span>" page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenNewLinkDialog} className="mb-6 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Link
          </Button>

          {links.length === 0 && !isLoadingLinks && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
              <Link2Icon className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
              <p className={`${fontHeading} text-lg mb-1`}>No links created yet.</p>
              <p className="text-sm">Click "Add New Link" to populate your page!</p>
            </div>
          )}

          {links.length > 0 && (
            <div className="space-y-3">
              {/* Render memoized links */}
              {memoizedLinks}
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                Drag <GripVertical className="inline h-3 w-3" /> to reorder links (reordering coming soon).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="sm:max-w-[520px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className={`${fontHeading} text-xl text-slate-900 dark:text-slate-50`}>
              {currentEditingLink?.id ? 'Edit Link' : 'Add New Link'}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Provide a title and a full URL (e.g., https://example.com).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4"> {/* Increased gap */}
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
              <Label htmlFor="link-title-dialog" className="text-right text-sm text-slate-700 dark:text-slate-300">Title</Label>
              <div className="col-span-3">
                <Input id="link-title-dialog" name="title" value={linkFormData.title} onChange={handleLinkDialogFormChange} className="bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700" placeholder="e.g., My Portfolio"/>
                {linkFormErrors?.title?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{linkFormErrors.title._errors[0]}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-1">
              <Label htmlFor="link-url-dialog" className="text-right text-sm text-slate-700 dark:text-slate-300">URL</Label>
              <div className="col-span-3">
                <Input id="link-url-dialog" name="url" type="url" value={linkFormData.url} onChange={handleLinkDialogFormChange} className="bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700" placeholder="https://example.com" />
                {linkFormErrors?.url?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{linkFormErrors.url._errors[0]}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-x-4">
              <Label htmlFor="link-active-dialog" className="text-right text-sm text-slate-700 dark:text-slate-300">Active</Label>
              <div className="col-span-3 flex items-center"><Switch id="link-active-dialog" checked={linkFormData.is_active} onCheckedChange={handleLinkDialogActiveToggle} /></div>
            </div>
            {/* General form error (not field specific) from server can go here */}
            {linkFormErrors?._errors?.length && !linkFormErrors.title && !linkFormErrors.url && !linkFormErrors.is_active && (
                 <p className="col-span-4 text-sm text-red-600 dark:text-red-400 text-center pt-2">{linkFormErrors._errors.join(', ')}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">Cancel</Button></DialogClose>
            <Button onClick={handleSaveLinkDialog} disabled={isSavingLink} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
              {isSavingLink ? ( /* ... loading SVG ... */ 'Saving...') : ( <><Save className="mr-2 h-4 w-4" /> Save Link</> )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section for Appearance Settings */}
      <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 rounded-xl">
        <CardHeader>
          <div className="flex items-center">
            <Palette className="mr-3 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className={`${fontHeading} text-2xl text-slate-900 dark:text-slate-50`}>Appearance Settings</CardTitle>
          </div>
          <CardDescription className="text-slate-600 dark:text-slate-400 pt-1">
            Customize the theme, background, fonts, and button styles for this link page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement Appearance Settings Form */}
          <div className="text-center text-slate-500 dark:text-slate-400 py-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <Settings2 className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
            <p className={`${fontHeading} text-lg mb-1`}>Appearance Customization</p>
            <p className="text-sm">Coming soon!</p>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSaveProjectSettings} disabled={isSavingProject} className="w-full sm:w-auto ml-auto bg-green-600 hover:bg-green-700 text-white">
                {isSavingProject ? ( /* ... loading SVG ... */ 'Saving Appearance...' ) : ( <><Save className="mr-2 h-4 w-4" /> Save Appearance</> )}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Helper to get useRouter (if not already globally available or passed via props)
// This is usually not needed as 'use client' components can import it directly.
// import { useRouter as useNextRouter } from 'next/navigation';
// function useRouter() { return useNextRouter(); }