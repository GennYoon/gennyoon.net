import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import LandingPage from '@/pages/LandingPage'

const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'))
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const PostsListPage = lazy(() => import('@/pages/admin/PostsListPage'))
const NewPostPage = lazy(() => import('@/pages/admin/NewPostPage'))
const EditPostPage = lazy(() => import('@/pages/admin/EditPostPage'))

const App: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={null}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="posts" element={<PostsListPage />} />
          <Route path="posts/new" element={<NewPostPage />} />
          <Route path="posts/:id" element={<EditPostPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)

export default App
