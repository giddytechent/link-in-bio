// app/dashboard/edit/[projectType]/[projectId]/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button'; // For "Back to Dashboard" button
import { AlertCircle, ArrowLeft, Edit, Link2Icon, Globe2, Save, Eye } from 'lucide-react';

// Import your editor components (create these files if they don't exist)
import LinkPageEditor from '@/components/dashboard/editors/link-page-editor';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import WebsiteEditor from '@/components/dashboard/editors/website-editor'; // For when you build it

const fontHeading = "font-manrope";
const fontBody = "font-inter"; // Ensure this is applied via layout.tsx

interface ProjectEditPageProps {
  params: {
    projectType: string; // from URL: "link-page" or "website"
    projectId: string;   // from URL: The UUID of the project
  };
}

// Define a more specific type for your fetched project data from DB
// Ensure this matches your 'projects' table structure and what editors expect
export interface ProjectDataForEditor {
  id: string;
  title: string;
  project_type: 'Link Page' | 'Website'; // From DB, should match these exact strings
  status: string;
  url?: string | null; // The public URL/slug
  // Add other fields your editors might need, e.g.,
  // content: any; // For website builder content (JSONB)
  // appearance_settings: any; // For link page appearance (JSONB)
  user_id: string; // Crucial for passing to editor components for their Supabase calls
  created_at: string;
  updated_at: string;
}

// Dynamic metadata for the page title
export async function generateMetadata({ params }: ProjectEditPageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { title: "Edit Project | FlowFolio" }; // Generic title if user not found early
  }

  const { projectId } = params;
  let projectTitle = "Project"; // Default

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .eq('user_id', user.id) // Ensure user owns this project
      .single();

    if (project && !error) {
      projectTitle = project.title;
    }
  } catch (e) {
    // Error fetching title, use default
  }

  return {
    title: `Editing: ${projectTitle} | FlowFolio`,
  };
}


export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const searchParams = new URLSearchParams();
    searchParams.set('message', 'Please log in to edit projects.');
    searchParams.set('type', 'error'); // Changed to error for more emphasis
    return redirect(`/login?${searchParams.toString()}`);
  }

  const { projectType: projectTypeFromUrl, projectId } = params;

  let project: ProjectDataForEditor | null = null;
  let fetchError: string | null = null;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*') // Fetch all columns, or specify needed ones for the editor
      .eq('id', projectId)
      .eq('user_id', user.id) // Security: User can only fetch their own projects
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error code for "exact one row expected, but 0 rows found"
        fetchError = "Project not found or you do not have permission to access it.";
      } else {
        throw error; // Re-throw other errors to be caught by the generic catch block
      }
    }
    project = data as ProjectDataForEditor | null; // Cast to ensure type matches

  } catch (error: any) {
    console.error("Error fetching project for editing:", error.message);
    fetchError = `Failed to load project data: ${error.message}.`;
  }

  if (fetchError || !project) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 ${fontBody}`}>
        <div className="w-full max-w-lg text-center">
          <Card className="bg-white dark:bg-slate-900 shadow-xl border-slate-200 dark:border-slate-800/70">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className={`${fontHeading} text-2xl text-red-700 dark:text-red-400`}>
                Error Loading Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">
                {fetchError || "The project could not be found or loaded. It might have been deleted or you may not have permission to view it."}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Determine which editor component to render based on project.project_type from DB
  let EditorComponentToRender;
  let editorIcon = <Edit className="mr-3 h-7 w-7 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />;

  if (project.project_type === 'Link Page') {
    EditorComponentToRender = <LinkPageEditor project={project} />;
    editorIcon = <Link2Icon className="mr-3 h-7 w-7 sm:h-8 sm:w-8 text-sky-600 dark:text-sky-400" />;
  } else if (project.project_type === 'Website') {
    // EditorComponentToRender = <WebsiteEditor project={project} />; // You'll create this
    EditorComponentToRender = <div className="py-10 text-center text-slate-500 dark:text-slate-400">Placeholder for Website Editor for: <strong className="text-slate-700 dark:text-slate-200">{project.title}</strong></div>;
    editorIcon = <Globe2 className="mr-3 h-7 w-7 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />;
  } else {
    EditorComponentToRender = (
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className={`${fontHeading} font-semibold`}>Unknown Project Type</AlertTitle>
            <AlertDescription>
                Cannot load editor for project type: "{project.project_type}".
            </AlertDescription>
        </Alert>
    );
  }

  // Verify if projectTypeFromUrl matches project.project_type (after normalization)
  // This is a sanity check. The DB's project_type is the source of truth for which editor to load.
  const normalizedUrlType = projectTypeFromUrl.toLowerCase().replace('-', ' ');
  const normalizedDbType = project.project_type.toLowerCase();
  if (normalizedUrlType !== normalizedDbType) {
    console.warn(
      `URL project type parameter ("${projectTypeFromUrl}") does not match database project type ("${project.project_type}") for project ID ${projectId}. Loading editor based on DB type.`
    );
    // You might choose to redirect or show an error if this mismatch is critical,
    // but loading based on DB type is safer.
  }


  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 ${fontBody}`}>
      {/* Editor Page Header - Conceptual, could be a separate client component for interactivity */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500 transition-colors group">
            <ArrowLeft className="mr-1.5 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            {project.url && project.status === 'Published' && (
                <Button variant="outline" size="sm" asChild className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Link href={project.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-1.5 h-4 w-4" /> Preview Live
                    </Link>
                </Button>
            )}
            {/* Actual Save/Publish buttons would likely be part of the editor components or a shared editor layout */}
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
              <Save className="mr-1.5 h-4 w-4" /> Save Changes (Conceptual)
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto"> {/* Or wider depending on editor needs */}
          <div className="mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl ${fontHeading} font-bold text-slate-900 dark:text-slate-50 flex items-center`}>
              {editorIcon}
              Editing: {project.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Project ID: {project.id} | Type: {project.project_type} | Status: <span className={project.status === 'Published' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>{project.status}</span>
            </p>
          </div>

          {/* Render the specific editor component */}
          {/* The editor itself will be a client component handling its own state and save operations */}
          <div>
            {EditorComponentToRender}
          </div>
        </div>
      </main>
    </div>
  );
}