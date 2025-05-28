// app/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Use the utility

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LogoutButton } from '@/components/auth/logout-button'; // Ensure this path is correct
import {
  LayoutDashboard,
  Link2Icon,
  Globe2,
  BarChart3,
  Settings,
  PlusCircle,
  Search,
  Bell,
  MoreHorizontal,
  Edit3,
  Eye,
  Trash2,
  Copy,
  ChevronDown,
  Users,
  TrendingUp,
  MessageSquare,
  LayoutGrid,
} from 'lucide-react';

const fontHeading = "font-manrope"; // Ensure these are configured in tailwind.config.js
const fontBody = "font-inter";   // and app/layout.tsx

// Mock Data for Projects - REPLACE WITH ACTUAL DATA FETCHING LATER
// This structure should match what your actual 'projects' table returns
interface Project {
  id: string;
  type: 'Link Page' | 'Website'; // Use a union type for better type safety
  title: string;
  views: number;
  clicks?: number; // Optional for websites
  pages?: number; // Optional for link pages
  lastUpdated: string; // Consider using Date type and formatting it
  status: 'Published' | 'Draft'; // Union type
  url: string;
  previewImage?: string; // Optional
  user_id?: string; // Foreign key to auth.users.id
}

const mockProjects: Project[] = [
  { id: '1', user_id: 'mock-user-id', type: 'Link Page', title: 'My Awesome Links', views: 1256, clicks: 340, lastUpdated: '2h ago', status: 'Published', url: '/p/awesome-links', previewImage: 'https://via.placeholder.com/200/E0E7FF/4F46E5?text=Link+Bio' },
  { id: '2', user_id: 'mock-user-id', type: 'Website', title: 'My Startup Site', views: 8790, pages: 5, lastUpdated: '1d ago', status: 'Published', url: '/ws/startup-site', previewImage: 'https://via.placeholder.com/200/DBEAFE/1D4ED8?text=Website' },
  { id: '3', user_id: 'mock-user-id', type: 'Link Page', title: 'Creator Profile', views: 560, clicks: 120, lastUpdated: '5d ago', status: 'Draft', url: '#', previewImage: 'https://via.placeholder.com/200/FEF3C7/F59E0B?text=Draft+Bio' },
];

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient(); // Use the server client utility

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const params = new URLSearchParams();
    params.set('message', 'Authentication required. Please log in to access the dashboard.');
    params.set('type', 'error'); // You can use this type to style the message on the login page
    return redirect(`/login?${params.toString()}`);
  }

  // Derive user display information
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'FlowFolio User';
  const userAvatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&font-size=0.5&length=2`;
  const userInitial = displayName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  // Current time and location context
  const currentTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: true });
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Africa/Lagos' });
  const userLocation = "Lagos, Lagos, Nigeria";

  // TODO: Replace mockProjects with actual data fetching for the logged-in user
  let projects: Project[] = [];
  let projectsError: string | null = null;

  try {
    const { data: fetchedProjects, error } = await supabase
      .from('projects') // Replace 'projects' with your actual Supabase table name
      .select(`
        id,
        title,
        project_type,
        status,
        url,
        preview_image_url,
        updated_at,
        views,
        clicks,
        pages
      `) // Select specific columns
      .eq('user_id', user.id) // Filter by the logged-in user's ID
      .order('last_updated_at', { ascending: false }); // Example ordering

    if (error) {
      console.error('Error fetching projects:', error.message);
      projectsError = "Could not load your projects. " + error.message;
      // projects = []; // Or keep mock data for now if preferred on error
    } else {
      projects = fetchedProjects?.map(p => ({
        id: p.id,
        title: p.title,
        type: p.project_type as Project['type'], // Add type assertion
        status: p.status as Project['status'], // Add type assertion
        url: p.url || '#',
        previewImage: p.preview_image_url,
        lastUpdated: p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        views: p.views || 0,
        clicks: p.clicks,
        pages: p.pages,
      })) || [];
    }
    // Transform data if necessary (e.g., date formatting, type mapping)
    projects = fetchedProjects?.map(p => ({
      ...p,
      previewImage: p.preview_image_url, // map snake_case to camelCase if needed
      lastUpdated: p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
      // Ensure type and status are correctly mapped if they differ from the mock
      type: p.project_type === 'linkpage' ? 'Link Page' : p.project_type === 'website' ? 'Website' : p.project_type,
    })) || [];

  } catch (error: any) {
    console.error('Error fetching projects:', error.message);
    projectsError = "Could not load your projects at this time. Please try again later.";
    projects = mockProjects; // Fallback to mock data or empty array on error
  }

  return (
    <div className={`flex min-h-screen w-full bg-slate-100 dark:bg-slate-950 ${fontBody} selection:bg-indigo-500 selection:text-white`}>
      {/* Sidebar Navigation */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex">
        <Link href="/dashboard" className={`mb-6 flex items-center gap-2 text-2xl ${fontHeading} font-bold text-indigo-600 dark:text-indigo-400`}>
          <LayoutDashboard className="h-7 w-7" />
          FlowFolio
        </Link>
        <nav className="flex flex-col gap-1 text-sm font-medium">
          {[ /* ... Sidebar links ... */
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, current: true },
            { href: '/dashboard/links', label: 'My Link Pages', icon: Link2Icon },
            { href: '/dashboard/sites', label: 'My Websites', icon: Globe2 },
            { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all
                ${item.current
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg">
            <Link href="/dashboard/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Create New
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="sm:hidden">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
            <Link href="/dashboard" className={`sm:hidden text-xl ${fontHeading} font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1`}>
              <LayoutDashboard className="h-6 w-6" />
              <span className="hidden xs:inline">FlowFolio</span>
            </Link>
            <div className="relative hidden flex-1 sm:block max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <Input type="search" placeholder="Search projects..." className="w-full rounded-lg bg-white dark:bg-slate-800/70 pl-10 pr-4 py-2 text-sm border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {/* <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span> */}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Notifications</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400">
                  <Avatar className="h-8 w-8 border-2 border-transparent group-hover:border-indigo-300"><AvatarImage src={userAvatarUrl} alt={displayName} /><AvatarFallback>{userInitial}</AvatarFallback></Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className={`text-xs font-medium text-slate-700 dark:text-slate-200 ${fontHeading}`}>{displayName}</span>
                    <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className={`${fontHeading} text-sm`}>{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard/settings/profile" className="flex items-center w-full cursor-pointer"><Settings className="mr-2 h-4 w-4" /><span>Profile Settings</span></Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/support" className="flex items-center w-full cursor-pointer"><MessageSquare className="mr-2 h-4 w-4" /><span>Support</span></Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton asDropdownItem={true} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          <div className="space-y-1">
            <h1 className={`text-2xl sm:text-3xl ${fontHeading} font-bold text-slate-900 dark:text-slate-50`}>Welcome back, {displayName.split(' ')[0]}!</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Here's your FlowFolio overview. ({userLocation}).</p>
          </div>

          {projectsError && (
            <Card className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700/50">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300 text-base">Error Loading Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600 dark:text-red-400">{projectsError}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* ... Stats Cards (updated to use dynamic `projects` length) ... */}
            <Card className="bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${fontHeading} text-slate-700 dark:text-slate-300`}>Total Projects</CardTitle>
                <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projects.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active projects</p>
              </CardContent>
            </Card>
            {/* ... other stats cards - you'll need to aggregate these from 'projects' data ... */}
            <Card className="bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${fontHeading} text-slate-700 dark:text-slate-300`}>Total Views</CardTitle><Eye className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projects.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Across all projects</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${fontHeading} text-slate-700 dark:text-slate-300`}>Link Page Clicks</CardTitle><TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{projects.filter(p => p.type === 'Link Page').reduce((sum, p) => sum + (p.clicks || 0), 0).toLocaleString()}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">From link pages</p>
              </CardContent>
            </Card>
            <Card className="bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700/60 flex flex-col justify-center items-center p-4 hover:shadow-lg transition-shadow rounded-xl">
              <Button asChild size="lg" className="w-full h-full text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg">
                <Link href="/dashboard/create"><PlusCircle className="mr-2 h-5 w-5" /> Create New Project</Link>
              </Button>
            </Card>
          </div>

          {/* Projects List */}
          <div>
            {/* ... Tabs and project card mapping - ensure project object properties match your DB/mock ... */}
            {/* The mapping logic for project cards remains largely the same as before. */}
            {/* Ensure properties like project.previewImage, project.lastUpdated match the fetched data */}
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl sm:text-2xl ${fontHeading} font-semibold text-slate-900 dark:text-slate-50`}>My Projects</h2>
            </div>
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex mb-4 bg-slate-200 dark:bg-slate-800 rounded-lg">
                <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
                <TabsTrigger value="link_pages">Link Pages ({projects.filter(p => p.type === 'Link Page').length})</TabsTrigger>
                <TabsTrigger value="websites">Websites ({projects.filter(p => p.type === 'Website').length})</TabsTrigger>
              </TabsList>
              {['all', 'link_pages', 'websites'].map(tabValue => (
                <TabsContent key={tabValue} value={tabValue}>
                  {/* ... (Project card rendering logic - ensure this is robust) ... */}
                  {projects.filter(p => tabValue === 'all' || p.type.toLowerCase().replace(' ', '_') + 's' === tabValue).length > 0 ? (
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                      {projects
                        .filter(p => tabValue === 'all' || p.type.toLowerCase().replace(' ', '_') + 's' === tabValue)
                        .map((project) => (
                          <Card key={project.id} className="bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col rounded-xl overflow-hidden">
                            {/* ... project card content as before ... */}
                            {project.previewImage && (
                              <Link href={`/dashboard/edit/${project.type.toLowerCase().replace(' ', '-')}/${project.id}`} className="block aspect-[16/9] overflow-hidden border-b border-slate-200 dark:border-slate-700 group">
                                <img src={project.previewImage} alt={`Preview of ${project.title}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              </Link>
                            )}
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className={`text-lg ${fontHeading} font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate`}>
                                    <Link href={`/dashboard/edit/${project.type.toLowerCase().replace(' ', '-')}/${project.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                      {project.title}
                                    </Link>
                                  </CardTitle>
                                  {/* ... badges ... */}
                                </div>
                                {/* ... dropdown menu ... */}
                              </div>
                            </CardHeader>
                            <CardContent className="flex-grow pt-0">
                              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>Views: {(project.views || 0).toLocaleString()}</span>
                                {project.clicks !== undefined && <span>Clicks: {(project.clicks || 0).toLocaleString()}</span>}
                                {project.pages !== undefined && <span>Pages: {project.pages}</span>}
                              </div>
                            </CardContent>
                            <CardFooter className="pt-3 text-xs text-slate-500 dark:text-slate-400">
                              Last updated: {project.lastUpdated}
                            </CardFooter>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                      <p>No projects found in this category.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <footer className="mt-auto pt-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
            <p>&copy; {new Date().getFullYear()} FlowFolio Inc. All rights reserved.</p>
            <p>Dashboard loaded: {currentDate}, {currentTime} ({userLocation}).</p>
          </footer>
        </div>
      </div>
    </div>
  );
}