// app/dashboard/edit/[projectType]/[projectId]/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Your server client utility
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { AlertCircle, ArrowLeft, Edit } from 'lucide-react';
// You will eventually create specific editor components:
import LinkPageEditor from '../../../../../../components/dashboard/editors/link-page-editor'; // Adjust the import path as needed
import WebsiteEditor from '../../../../../../components/dashboard/editors/website-editor';

const fontHeading = "font-manrope";
const fontBody = "font-inter"; // Apply to body in layout

interface ProjectEditPageProps {
  params: {
    projectType: string; // e.g., "link-page" or "website"
    projectId: string;   // The UUID of the project
  };
}

// Define a more specific type for your fetched project data
interface ProjectData {
  id: string;
  title: string;
  project_type: string; // 'Link Page' or 'Website' from DB
  status: string;
  // Add other fields you expect to fetch for the editor
  // e.g., content: any; settings: any;
  user_id: string;
}


export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const searchParams = new URLSearchParams();
    searchParams.set('message', 'Please log in to edit projects.');
    searchParams.set('type', 'info');
    return redirect(`/login?${searchParams.toString()}`);
  }

  const { projectType, projectId } = params;

  // Fetch the specific project data from Supabase
  let project: ProjectData | null = null;
  let fetchError: string | null = null;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*') // Select all or specific fields needed for the editor
      .eq('id', projectId)
      .eq('user_id', user.id) // IMPORTANT: Ensure user can only edit their own projects
      .single(); // Expecting a single project

    if (error) {
      throw error;
    }
    project = data as ProjectData; // Cast if necessary, ensure data matches ProjectData interface
  } catch (error: any) {
    console.error("Error fetching project for editing:", error);
    fetchError = `Failed to load project data: ${error.message}. It might not exist or you may not have permission.`;
  }

  if (fetchError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading} font-semibold`}>Error Loading Project</AlertTitle>
            <AlertDescription>
              {fetchError || "The project could not be found or loaded."}
            </AlertDescription>
          </Alert>
          <Link href="/dashboard" className="mt-6 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Determine which editor component to render based on projectType
  // The projectType from the URL should match what's stored (e.g., "link-page", "website")
  // The project.project_type from the DB will be like "Link Page" or "Website"
  const editorTypeFromUrl = projectType.toLowerCase();
  const editorTypeFromDb = project.project_type.toLowerCase().replace(' ', '-');

  if (editorTypeFromUrl !== editorTypeFromDb) {
     // This indicates a mismatch, perhaps URL manipulation or an issue with how project types are stored/routed
     console.warn(`URL project type (${editorTypeFromUrl}) does not match DB project type (${editorTypeFromDb}) for project ID ${projectId}`);
     // Potentially redirect or show a more specific error
  }

  let EditorComponent;
  if (editorTypeFromUrl === 'link-page') {
    EditorComponent = <LinkPageEditor project={project} />; // You'll create this
    EditorComponent = <div>Placeholder for Link Page Editor for: {project.title}</div>;
  } else if (editorTypeFromUrl === 'website') {
    EditorComponent = <WebsiteEditor project={project} />; // You'll create this
    EditorComponent = <div>Placeholder for Website Editor for: {project.title}</div>;
  } else {
    EditorComponent = <div>Unknown project type. Cannot load editor.</div>;
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 ${fontBody}`}>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        {/* You might add a save button or other controls here, likely in a client component wrapper */}
      </div>

      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className={`text-3xl sm:text-4xl ${fontHeading} font-bold text-slate-900 dark:text-slate-50 flex items-center`}>
            <Edit className="mr-3 h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            Editing: {project.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Type: {project.project_type} | Status: <span className={project.status === 'Published' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>{project.status}</span>
          </p>
        </header>

        {/* Render the specific editor component */}
        <div className="bg-white dark:bg-slate-800/50 shadow-xl rounded-xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/80">
          {EditorComponent}
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 dark:text-slate-400 mt-12 py-6 border-t border-slate-200 dark:border-slate-800">
        <p>&copy; {new Date().getFullYear()} FlowFolio Inc. All rights reserved.</p>
        {/* You might want more specific context here if needed */}
      </footer>
    </div>
  );
}