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
  Trash2, PlusCircle, Edit2, GripVertical, Eye, EyeOff, Save, ExternalLink, AlertCircle, Settings2, Palette as PaletteIcon, Type as TypeIcon, Droplets, ChevronsUpDownIcon, Link2Icon as LinkPageIcon, Globe2 as WebsiteIcon, CheckCircle
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
import { SortableLinkItem } from './sortable-link-item'; // Ensure this path is correct
import { LinkPagePreview } from './link-page-preview';   // Ensure this path is correct

// Types
export interface LinkPageAppearanceSettings {
  theme?: 'light' | 'dark' | 'custom';
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: 'Inter' | 'Manrope' | 'System UI' | 'Roboto' | 'Open Sans' | 'Poppins' | 'Lato';
  buttonStyle?: 'rounded-full' | 'rounded-lg' | 'rounded-md' | 'square';
  buttonColor?: string;
  buttonFontColor?: string;
  buttonHoverColor?: string;
  buttonHoverFontColor?: string;
}

export interface ProjectDataForEditor {
  id: string;
  title: string;
  project_type: 'Link Page' | 'Website';
  status: string;
  url?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  appearance_settings?: LinkPageAppearanceSettings | null;
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

interface LinkPageEditorProps {
  project: ProjectDataForEditor;
}

const fontHeading = "font-manrope";
const fontBody = "font-inter";

const LinkFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title cannot exceed 100 characters." }),
  url: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)." }),
  is_active: z.boolean().default(true),
  icon: z.string().max(100, { message: "Icon input too long (e.g. emoji, class name, or short URL)." }).optional().nullable(),
});

const defaultAppearanceSettings: LinkPageAppearanceSettings = {
  theme: 'light',
  backgroundColor: '#F9FAFB',
  textColor: '#1F2937',
  fontFamily: 'Inter',
  buttonStyle: 'rounded-lg',
  buttonColor: '#4F46E5',
  buttonFontColor: '#FFFFFF',
  buttonHoverColor: '#4338CA',
  buttonHoverFontColor: '#FFFFFF',
};


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

  useEffect(() => {
    setProject(initialProjectData);
    setAppearanceSettings({ ...defaultAppearanceSettings, ...(initialProjectData.appearance_settings || {}) });
  }, [initialProjectData]);

  const handleOpenNewLinkDialog = () => {
    setCurrentEditingLink(null);
    setLinkFormData({ title: '', url: '', is_active: true, icon: '' });
    setLinkFormErrors(null);
    setIsLinkDialogOpen(true);
  };

  const handleOpenEditLinkDialog = (link: LinkItem) => {
    setCurrentEditingLink(link);
    setLinkFormData({ title: link.title, url: link.url, is_active: link.is_active, icon: link.icon || '' });
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

  const validateLinkURL = (url: string): boolean => {
    if (!url.toLowerCase().startsWith('http://') && !url.toLowerCase().startsWith('https://')) {
        setLinkFormErrors(prev => ({ ...prev, url: { _errors: ["URL must start with http:// or https://"] } } as any));
        return false;
    }
    try { new URL(url); return true; } catch (_) {
        setLinkFormErrors(prev => ({ ...prev, url: { _errors: ["Please enter a valid URL."] } } as any));
        return false;
    }
  }

  const handleSaveLinkDialog = async () => {
    const validationResult = LinkFormSchema.safeParse(linkFormData);
    if (!validationResult.success) {
      setLinkFormErrors(validationResult.error.format());
      return;
    }
    if (!validateLinkURL(linkFormData.url)) return;

    setLinkFormErrors(null);
    setIsSavingLink(true);
    const { title, url, is_active, icon } = validationResult.data;
    const newDisplayOrder = currentEditingLink?.id
      ? currentEditingLink.display_order
      : links.length > 0 ? Math.max(...links.map(l => l.display_order), -1) + 1 : 0;

    const linkDataToSave = {
      project_id: project.id,
      user_id: project.user_id,
      title: title.trim(),
      url: url.trim(),
      is_active: is_active,
      display_order: newDisplayOrder,
      icon: icon || null,
    };

    let opError; let successMsg = "";
    if (currentEditingLink?.id) {
      const { error } = await supabase.from('links').update(linkDataToSave).eq('id', currentEditingLink.id).eq('user_id', project.user_id);
      opError = error; successMsg = "Link updated!";
    } else {
      const { error } = await supabase.from('links').insert(linkDataToSave as Omit<LinkItem, 'id' | 'created_at' | 'updated_at' | 'clicks'>);
      opError = error; successMsg = "Link added!";
    }
    setIsSavingLink(false);
    if (opError) {
      toast.error(`Failed to ${currentEditingLink?.id ? 'update' : 'add'} link.`, { description: opError.message });
    } else {
      setIsLinkDialogOpen(false); setCurrentEditingLink(null); fetchLinks(); toast.success(successMsg);
    }
  };

  const handleDeleteLink = (linkId: string, linkTitle: string) => {
    toast.warning(`Delete "${linkTitle}"?`, {
      action: { label: "Delete", onClick: async () => {
        setIsLoadingLinks(true);
        const { error } = await supabase.from('links').delete().eq('id', linkId).eq('user_id', project.user_id);
        setIsLoadingLinks(false);
        if (error) toast.error("Failed to delete link.", { description: error.message });
        else { fetchLinks(); toast.success("Link deleted."); }
      }},
      cancel: { label: "Cancel", onClick: () => {} }, duration: 8000,
    });
  };

  const handleToggleLinkActiveOnList = async (link: LinkItem) => {
    const newActiveState = !link.is_active;
    const originalLinks = [...links];
    setLinks(prevLinks => prevLinks.map(l => l.id === link.id ? { ...l, is_active: newActiveState } : l));
    const { error } = await supabase.from('links').update({ is_active: newActiveState }).eq('id', link.id!).eq('user_id', project.user_id);
    if (error) { toast.error("Failed to update link status.", { description: error.message }); setLinks(originalLinks); }
    else { toast.success(`Link status updated.`); }
  };

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

      setIsLoadingLinks(true);
      const updates = updatedLinksWithNewOrder.map(link => ({
        id: link.id!,
        display_order: link.display_order,
      }));

      const promises = updates.map(linkUpdate =>
        supabase
          .from('links')
          .update({ display_order: linkUpdate.display_order })
          .eq('id', linkUpdate.id)
          .eq('user_id', project.user_id)
      );

      try {
        const results = await Promise.all(promises);
        const anyError = results.some(res => res.error);
        if (anyError) {
          const errorMessages = results.map(res => res.error?.message).filter(Boolean).join('; ');
          throw new Error(errorMessages || "Some link order updates failed.");
        }
        toast.success("Link order saved!");
      } catch (e: any) {
        toast.error("Failed to save new link order.", { description: e.message });
        setLinks(oldLinks);
      } finally {
        setIsLoadingLinks(false);
      }
    }
  };

  const handleAppearanceChange = (settingName: keyof LinkPageAppearanceSettings, value: any) => {
    setAppearanceSettings(prev => ({ ...prev, [settingName]: value }));
  };

  const handleSaveAppearance = async () => {
    setIsSavingProjectSettings(true);
    
    toast.promise(
      // Wrap Supabase query in a Promise
      new Promise(async (resolve, reject) => {
        try {
          const { data, error } = await supabase
            .from('projects')
            .update({ appearance_settings: appearanceSettings } as Partial<ProjectDataForEditor>)
            .eq('id', project.id)
            .eq('user_id', project.user_id)
            .select('appearance_settings')
            .single();

          if (error) throw error;
          
          const updatedSettings = data?.appearance_settings as LinkPageAppearanceSettings || appearanceSettings;
          setProject(prev => ({ ...prev, appearance_settings: updatedSettings }));
          resolve(data);
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: 'Saving appearance settings...',
        success: 'Appearance settings saved!',
        error: (error) => `Failed to save settings: ${error.message}`
      }
    );
  };

  if (isLoadingLinks && links.length === 0 && !initialProjectData.id) {
    return <div className="text-center p-20 text-slate-600 dark:text-slate-400">Loading Editor...</div>;
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 ${fontBody}`}>
      {/* Editor Controls Column */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 rounded-xl">
            <CardHeader>
              <CardTitle className={`${fontHeading} text-2xl text-slate-900 dark:text-slate-50`}>Manage Your Links</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Drag the <GripVertical className="inline h-4 w-4 text-slate-500 dark:text-slate-400 align-[-0.125em]" /> handle to reorder. Add, edit, and manage links for "<span className="font-medium text-indigo-600 dark:text-indigo-400">{project.title}</span>".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleOpenNewLinkDialog} className="mb-6 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Link
              </Button>

              {isLoadingLinks && links.length === 0 ? (
                 <div className="text-center p-10 text-slate-600 dark:text-slate-400">Loading links...</div>
              ) : links.length === 0 ? (
                <div className="text-center text-slate-500 dark:text-slate-400 py-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                  <LinkPageIcon className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
                  <p className={`${fontHeading} text-lg mb-1`}>No links created yet.</p>
                  <p className="text-sm">Click "Add New Link" to populate your page!</p>
                </div>
              ) : (
                <SortableContext items={links.map(link => link.id!)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {links.map((link) => (
                      <SortableLinkItem key={link.id!} id={link.id!} isOpacityReduced={!link.is_active}>
                        <Card className={`border dark:border-slate-700/80 flex items-center justify-between rounded-lg transition-opacity duration-300 ${!link.is_active ? '' : 'bg-white dark:bg-slate-800/70 shadow-sm'} w-full`}>
                           <div className="flex items-center space-x-3 flex-1 min-w-0 p-3 sm:p-4">
                            {link.icon && <span className="text-lg flex-shrink-0 select-none" role="img" aria-label="Link icon">{link.icon}</span>}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 truncate" title={link.title}>{link.title}</p>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate block" title={link.url} onClick={(e) => e.stopPropagation()}>
                                {link.url} <ExternalLink className="inline-block h-3 w-3 ml-0.5" />
                                </a>
                            </div>
                            </div>
                            <div className="flex items-center space-x-0.5 sm:space-x-1 p-1 sm:p-2 ml-1 sm:ml-2 flex-shrink-0 border-l dark:border-slate-700">
                                <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleToggleLinkActiveOnList(link)} disabled={isLoadingLinks} className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">{link.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent><p>{link.is_active ? "Deactivate" : "Activate"}</p></TooltipContent></Tooltip></TooltipProvider>
                                <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleOpenEditLinkDialog(link)} disabled={isLoadingLinks} className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Edit2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip></TooltipProvider>
                                <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id!, link.title)} disabled={isLoadingLinks} className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                        </Card>
                      </SortableLinkItem>
                    ))}
                  </div>
                </SortableContext>
              )}
              {links.length > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-4 text-center">
                      Use the <GripVertical className="inline h-3 w-3 align-[-0.125em]" /> handle next to each link to drag and reorder.
                  </p>
              )}
            </CardContent>
          </Card>
        </DndContext>

        {/* Appearance Settings Card */}
        <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800 rounded-xl">
          <CardHeader>
            <div className="flex items-center">
              <PaletteIcon className="mr-3 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className={`${fontHeading} text-2xl text-slate-900 dark:text-slate-50`}>Page Appearance</CardTitle>
            </div>
            <CardDescription className="text-slate-600 dark:text-slate-400 pt-1">
              Customize the theme, background, fonts, and button styles for this link page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <Label htmlFor="backgroundColor" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center md:col-span-1"><Droplets className="mr-2 h-4 w-4" /> Background</Label>
              <Input id="backgroundColor" type="color" value={appearanceSettings.backgroundColor || '#F9FAFB'} onChange={(e) => handleAppearanceChange('backgroundColor', e.target.value)} disabled={isSavingProjectSettings} className="md:col-span-2 w-full h-10 p-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <Label htmlFor="textColor" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center md:col-span-1"><TypeIcon className="mr-2 h-4 w-4" /> Page Text</Label>
              <Input id="textColor" type="color" value={appearanceSettings.textColor || '#1F2937'} onChange={(e) => handleAppearanceChange('textColor', e.target.value)} disabled={isSavingProjectSettings} className="md:col-span-2 w-full h-10 p-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <Label htmlFor="fontFamily" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center md:col-span-1"><ChevronsUpDownIcon className="mr-2 h-4 w-4" /> Font Family</Label>
              <Select value={appearanceSettings.fontFamily || 'Inter'} onValueChange={(value) => handleAppearanceChange('fontFamily', value as LinkPageAppearanceSettings['fontFamily'])} disabled={isSavingProjectSettings}>
                <SelectTrigger id="fontFamily" className="md:col-span-2 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup><SelectLabel>Common Fonts</SelectLabel><SelectItem value="Inter">Inter</SelectItem><SelectItem value="Manrope">Manrope</SelectItem><SelectItem value="Roboto">Roboto</SelectItem><SelectItem value="Open Sans">Open Sans</SelectItem><SelectItem value="Poppins">Poppins</SelectItem><SelectItem value="Lato">Lato</SelectItem><SelectItem value="System UI">System UI</SelectItem></SelectGroup></SelectContent>
              </Select>
            </div>
            <Separator className="my-6 dark:bg-slate-700" />
            <p className={`${fontHeading} text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2`}>Link Button Styling</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <Label htmlFor="buttonStyle" className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-1">Button Shape</Label>
              <Select value={appearanceSettings.buttonStyle || 'rounded-lg'} onValueChange={(value) => handleAppearanceChange('buttonStyle', value as LinkPageAppearanceSettings['buttonStyle'])} disabled={isSavingProjectSettings}>
                <SelectTrigger id="buttonStyle" className="md:col-span-2 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="rounded-full">Pill</SelectItem><SelectItem value="rounded-lg">Rounded (Large)</SelectItem><SelectItem value="rounded-md">Rounded (Medium)</SelectItem><SelectItem value="square">Square (Sharp)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <Label htmlFor="buttonColor" className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-1">Button Background</Label>
              <Input id="buttonColor" type="color" value={appearanceSettings.buttonColor || '#4F46E5'} onChange={(e) => handleAppearanceChange('buttonColor', e.target.value)} disabled={isSavingProjectSettings} className="md:col-span-2 w-full h-10 p-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <Label htmlFor="buttonFontColor" className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-1">Button Text</Label>
              <Input id="buttonFontColor" type="color" value={appearanceSettings.buttonFontColor || '#FFFFFF'} onChange={(e) => handleAppearanceChange('buttonFontColor', e.target.value)} disabled={isSavingProjectSettings} className="md:col-span-2 w-full h-10 p-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <Label htmlFor="buttonHoverColor" className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-1">Button Hover Bg</Label>
              <Input id="buttonHoverColor" type="color" value={appearanceSettings.buttonHoverColor || '#4338CA'} onChange={(e) => handleAppearanceChange('buttonHoverColor', e.target.value)} disabled={isSavingProjectSettings} className="md:col-span-2 w-full h-10 p-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
              <Label htmlFor="buttonHoverFontColor" className="text-sm font-medium text-slate-700 dark:text-slate-300 md:col-span-1">Button Hover Text</Label>
              <Input id="buttonHoverFontColor" type="color" value={appearanceSettings.buttonHoverFontColor || '#FFFFFF'} onChange={(e) => handleAppearanceChange('buttonHoverFontColor', e.target.value)} disabled={isSavingProjectSettings} className="md:col-span-2 w-full h-10 p-1 rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
            </div>
          </CardContent>
          <CardFooter>
              <Button onClick={handleSaveAppearance} disabled={isSavingProjectSettings} className="w-full sm:w-auto ml-auto bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md">
                  {isSavingProjectSettings ? ( <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" /* ... */ ></svg>Saving...</> ) : ( <><Save className="mr-2 h-4 w-4" /> Save Appearance</> )}
              </Button>
          </CardFooter>
        </Card>
      </div> {/* End Editor Controls Column */}

      {/* Live Preview Column */}
      <div className="lg:col-span-5 xl:col-span-4 h-fit lg:sticky lg:top-24">
        <Card className="shadow-2xl dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 rounded-2xl">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className={`${fontHeading} text-lg sm:text-xl text-slate-800 dark:text-slate-100 text-center`}>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <LinkPagePreview
              projectTitle={project.title}
              links={links}
              appearance={appearanceSettings}
            />
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        {/* ... DialogContent for links from previous versions ... */}
      </Dialog>
    </div>
  );
}