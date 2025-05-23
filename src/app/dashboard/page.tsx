// app/dashboard/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  Activity,
  TrendingUp,
  MessageSquare, // For feedback or support
  LayoutGrid,
} from 'lucide-react';

// Typography Helpers (define these in tailwind.config.js or use directly)
const fontHeading = "font-manrope"; // Example: Manrope
const fontBody = "font-inter";   // Example: Inter

// Mock Data for Projects
const mockProjects = [
  { id: '1', type: 'Link Page', title: 'My Awesome Links', views: 1256, clicks: 340, lastUpdated: '2h ago', status: 'Published', url: '/p/awesome-links', previewImage: 'https://via.placeholder.com/150/E0E7FF/4F46E5?text=Link+Bio' },
  { id: '2', type: 'Website', title: 'My Startup Site', views: 8790, pages: 5, lastUpdated: '1d ago', status: 'Published', url: '/ws/startup-site', previewImage: 'https://via.placeholder.com/150/DBEAFE/1D4ED8?text=Website' },
  { id: '3', type: 'Link Page', title: 'Creator Profile', views: 560, clicks: 120, lastUpdated: '5d ago', status: 'Draft', url: '#', previewImage: 'https://via.placeholder.com/150/FEF3C7/F59E0B?text=Draft+Bio' },
  { id: '4', type: 'Website', title: 'Portfolio Showcase', views: 3200, pages: 8, lastUpdated: '1w ago', status: 'Published', url: '/ws/portfolio', previewImage: 'https://via.placeholder.com/150/D1FAE5/059669?text=Portfolio' },
  { id: '5', type: 'Link Page', title: 'Social Hub', views: 2100, clicks: 550, lastUpdated: '3h ago', status: 'Published', url: '/p/social-hub', previewImage: 'https://via.placeholder.com/150/FCE7F3/DB2777?text=Social' },
];

// Mock User Data
const mockUser = {
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg', // Replace with actual avatar logic
};

export default async function DashboardPage() {
  const currentTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: true });
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Africa/Lagos' });

  return (
    <div className={`flex min-h-screen w-full bg-slate-100 dark:bg-slate-950 ${fontBody} selection:bg-indigo-500 selection:text-white`}>
      {/* Sidebar Navigation (Conceptual - might be in a layout file) */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex">
        <div className={`mb-6 flex items-center gap-2 text-2xl ${fontHeading} font-bold text-indigo-600 dark:text-indigo-400`}>
          <LayoutDashboard className="h-7 w-7" />
          FlowFolio
        </div>
        <nav className="flex flex-col gap-1 text-sm font-medium">
          {[
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, current: true },
            { href: '/dashboard/links', label: 'My Link Pages', icon: Link2Icon },
            { href: '/dashboard/sites', label: 'My Websites', icon: Globe2 },
            { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
            { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Dashboard Header (Conceptual - might be in a layout file) */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
          {/* Mobile Nav Trigger & Search (Mobile) */}
          <div className="flex items-center gap-2 sm:hidden">
            <Button variant="outline" size="icon" className="sm:hidden">
              <LayoutDashboard className="h-5 w-5" /> {/* Or MenuIcon */}
            </Button>
             <div className={`text-xl ${fontHeading} font-bold text-indigo-600 dark:text-indigo-400`}>FlowFolio</div>
          </div>

          {/* Search (Desktop) */}
          <div className="relative hidden flex-1 sm:block max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
            <Input
              type="search"
              placeholder="Search projects, help..."
              className="w-full rounded-lg bg-white dark:bg-slate-800/70 pl-10 pr-4 py-2 text-sm border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
                    <AvatarFallback>{mockUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                     <span className={`text-xs font-medium text-slate-700 dark:text-slate-200 ${fontHeading}`}>{mockUser.name}</span>
                     <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className={`${fontHeading}`}>{mockUser.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Feedback & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/50">
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Welcome Header & Overview Stats */}
          <div className="space-y-2">
            <h1 className={`text-2xl sm:text-3xl ${fontHeading} font-bold text-slate-900 dark:text-slate-50`}>
              Welcome back, {mockUser.name.split(' ')[0]}!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Here's an overview of your projects and their performance. {currentDate} - {currentTime} (WAT).
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${fontHeading} text-slate-700 dark:text-slate-300`}>Total Projects</CardTitle>
                <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{mockProjects.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active projects</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${fontHeading} text-slate-700 dark:text-slate-300`}>Total Views</CardTitle>
                <Eye className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {mockProjects.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">+5.2% this month</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${fontHeading} text-slate-700 dark:text-slate-300`}>Total Clicks (Links)</CardTitle>
                <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {mockProjects.filter(p => p.type === 'Link Page').reduce((sum, p) => sum + (p.clicks || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">From link pages</p>
              </CardContent>
            </Card>
             <Card className="bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700/60 flex flex-col justify-center items-center p-4 hover:shadow-lg transition-shadow">
                <Button size="lg" className="w-full h-full text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create New Project
                </Button>
             </Card>
          </div>

          {/* Projects List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl sm:text-2xl ${fontHeading} font-semibold text-slate-900 dark:text-slate-50`}>My Projects</h2>
              <div className="flex items-center gap-2">
                <Input type="search" placeholder="Filter projects..." className="hidden md:block h-9 w-56 bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-700" />
                 {/* Theme Toggle Button - assuming it's globally available or part of dashboard layout */}
                {/* <ThemeToggleButton /> */}
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex mb-4 bg-slate-200 dark:bg-slate-800">
                <TabsTrigger value="all">All ({mockProjects.length})</TabsTrigger>
                <TabsTrigger value="link_pages">Link Pages ({mockProjects.filter(p => p.type === 'Link Page').length})</TabsTrigger>
                <TabsTrigger value="websites">Websites ({mockProjects.filter(p => p.type === 'Website').length})</TabsTrigger>
              </TabsList>

              {['all', 'link_pages', 'websites'].map(tabValue => (
                <TabsContent key={tabValue} value={tabValue}>
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {mockProjects
                      .filter(p => tabValue === 'all' || p.type.toLowerCase().replace(' ', '_') + 's' === tabValue)
                      .map((project) => (
                      <Card key={project.id} className="bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className={`text-lg ${fontHeading} font-semibold text-slate-800 dark:text-slate-100 mb-1`}>
                                <Link href={project.url !== '#' ? project.url : '#'} target={project.url !== '#' ? "_blank" : "_self"} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                  {project.title}
                                </Link>
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant={project.type === 'Link Page' ? 'default' : 'secondary'}
                                  className={project.type === 'Link Page'
                                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 border-sky-200 dark:border-sky-700'
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-700'
                                  }
                                >
                                  {project.type === 'Link Page' ? <Link2Icon className="mr-1 h-3 w-3" /> : <Globe2 className="mr-1 h-3 w-3" />}
                                  {project.type}
                                </Badge>
                                <Badge variant={project.status === 'Published' ? 'outline' : 'destructive'}
                                  className={project.status === 'Published'
                                    ? 'border-green-500/70 text-green-600 dark:border-green-400/50 dark:text-green-400'
                                    : 'border-amber-500/70 text-amber-600 dark:border-amber-400/50 dark:text-amber-400'
                                  }
                                >
                                  {project.status}
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem><Edit3 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                                <DropdownMenuItem><BarChart3 className="mr-2 h-4 w-4" /> View Stats</DropdownMenuItem>
                                <DropdownMenuItem><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/50">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow pt-0">
                          {project.previewImage && (
                            <div className="aspect-video rounded-md overflow-hidden mb-3 border border-slate-200 dark:border-slate-700">
                              <img src={project.previewImage} alt={`Preview of ${project.title}`} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Views: {project.views.toLocaleString()}</span>
                            {project.clicks !== undefined && <span>Clicks: {project.clicks.toLocaleString()}</span>}
                            {project.pages !== undefined && <span>Pages: {project.pages}</span>}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-3 text-xs text-slate-500 dark:text-slate-400">
                          Last updated: {project.lastUpdated}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  {mockProjects.filter(p => tabValue === 'all' || p.type.toLowerCase().replace(' ', '_') + 's' === tabValue).length === 0 && (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                      <LayoutGrid className="mx-auto h-12 w-12 mb-4 text-slate-400 dark:text-slate-500" />
                      <p className={`${fontHeading} text-lg`}>No projects in this category yet.</p>
                      <p className="text-sm">Ready to create your first {tabValue === "link_pages" ? "Link Page" : tabValue === "websites" ? "Website" : "project"}?</p>
                       <Button size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
                         <PlusCircle className="mr-2 h-4 w-4" /> Create New
                       </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
           {/* Footer within main content for last updated time or quick links */}
          <footer className="mt-auto pt-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
            <p>&copy; {new Date().getFullYear()} FlowFolio Inc. All rights reserved.</p>
            <p>Dashboard loaded: {currentDate}, {currentTime} (WAT - Abuja, Nigeria).</p>
          </footer>
        </div> {/* End Page Content */}
      </div> {/* End Main Content Area */}
    </div>
  );
}