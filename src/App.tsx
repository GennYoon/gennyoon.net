import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { usePageTracking } from '@/lib/ga'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import LandingPage from '@/pages/LandingPage'
import BlogPostPage from '@/pages/BlogPostPage'
import CategoryPage from '@/pages/CategoryPage'
import NotFoundPage from '@/pages/NotFoundPage'
import LoginPage from '@/pages/admin/LoginPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import PostsListPage from '@/pages/admin/PostsListPage'
import NewPostPage from '@/pages/admin/NewPostPage'
import EditPostPage from '@/pages/admin/EditPostPage'
import CategoriesPage from '@/pages/admin/CategoriesPage'
import PromptsPage from '@/pages/admin/PromptsPage'

const GA = () => { usePageTracking(); return null; }

export default function App() {
  return (
    <BrowserRouter>
      <GA />
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
        </Route>

        {/* Auth */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin (protected) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="posts" element={<PostsListPage />} />
          <Route path="posts/new" element={<NewPostPage />} />
          <Route path="posts/:id" element={<EditPostPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="prompts" element={<PromptsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
