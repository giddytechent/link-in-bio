// app/components/dashboard/create-project-form.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlusCircle, AlertCircle, CheckCircle, Link2Icon, Globe2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { z } from 'zod';

const fontHeading = "font-manrope";

// Define the allowed project types for better type safety
type ProjectTypeValue = 'Link Page' | 'Website';

// Zod Schema for Create Project Validation
// Note: The schema field name 'projectType' is for the form state.
// We will map it to 'project_type' when sending to Supabase.
const CreateProjectSchema = z.object({
  title: z.string().min(3, { message: "Project title must be at least 3 characters." }).max(100, { message: "Project title must be 100 characters or less." }).trim(),
  projectType: z.enum(['Link Page', 'Website'], { required_error: "Please select a project type." }),
});

interface CreateProjectFormProps {
  userId: string;
}

export function CreateProjectForm({ userId }: CreateProjectFormProps) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [title, setTitle] = useState('');
  const [projectTypeUI, setProjectTypeUI] = useState<ProjectTypeValue | ''>(''); // State for UI select component

  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodFormattedError<z.infer<typeof CreateProjectSchema>> | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleProjectTypeChange = (value: string) => {
    setProjectTypeUI(value as ProjectTypeValue); // This is what the Select component will pass
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setFormErrors(null);
    setServerError(null);

    const validationResult = CreateProjectSchema.safeParse({
      title,
      projectType: projectTypeUI, // Validate with the UI state value
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error.format());
      setIsLoading(false);
      return;
    }

    const { title: validatedTitle, projectType: validatedProjectType } = validationResult.data;

    try {
      const newProjectData = {
        user_id: userId,
        title: validatedTitle,
        project_type: validatedProjectType, // Map to 'project_type' for Supabase
        status: 'Draft',
        // Add default values for other NOT NULL columns if they don't have DB defaults
        // For example, if 'views' is NOT NULL and has no DB default:
        // views: 0,
        // If 'url' is NOT NULL, you might want to auto-generate it here or make it nullable in DB.
        // url: validatedTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };

      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert(newProjectData)
        .select('id, title, project_type') // Select specifically, using 'project_type'
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        // Check for specific errors, e.g., unique constraint violation for URL slug if you add it
        if (insertError.message.includes("duplicate key value violates unique constraint")) {
            setServerError("A project with a similar identifier (like URL slug) might already exist. Please try a different title or slug.");
        } else {
            setServerError(insertError.message || "Failed to create project. Please try again.");
        }
      } else if (newProject) {
        console.log('Project created:', newProject);
        router.refresh();
        // Redirect to the editor or dashboard. Using project_type from returned data.
        const typeForUrl = (newProject.project_type as string).toLowerCase().replace(' ', '-');
        router.push(`/dashboard/edit/${typeForUrl}/${newProject.id}`);
      } else {
        setServerError("Project created, but no data returned. Please check the dashboard.");
      }
    } catch (err: any) {
      console.error("Unexpected error creating project:", err);
      setServerError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Title */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-medium">Project Title</Label>
        <Input
          type="text" id="title" name="title"
          placeholder="e.g., My Awesome Portfolio"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={` ${formErrors?.title ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
          disabled={isLoading}
        />
        {formErrors?.title?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.title._errors[0]}</p>}
      </div>

      {/* Project Type */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="projectType" className="text-slate-700 dark:text-slate-300 font-medium">Project Type</Label>
        <Select value={projectTypeUI} onValueChange={handleProjectTypeChange} disabled={isLoading} name="projectType"> {/* Name matches Zod schema field */}
          <SelectTrigger
            id="projectType"
            className={`w-full ${formErrors?.projectType ? 'border-red-500 dark:border-red-500 focus-visible:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500'} bg-white dark:bg-slate-800/50`}
          >
            <SelectValue placeholder="Select a project type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Link Page">
              <div className="flex items-center">
                <Link2Icon className="mr-2 h-4 w-4 text-sky-600 dark:text-sky-400" /> Link Page (Link-in-bio)
              </div>
            </SelectItem>
            <SelectItem value="Website">
              <div className="flex items-center">
                <Globe2 className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" /> Website / Landing Page
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {formErrors?.projectType?._errors[0] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.projectType._errors[0]}</p>}
      </div>

      {/* Optional: URL Slug Input can be added here if needed */}

      {serverError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className={`${fontHeading}`}>Creation Failed</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-base py-3 mt-4 rounded-lg shadow-md hover:shadow-indigo-500/30 dark:hover:shadow-indigo-400/30 transition-all duration-300 group"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Project...
          </>
        ) : (
          <>
            Create Project <PlusCircle className="ml-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </>
        )}
      </Button>
    </form>
  );
}