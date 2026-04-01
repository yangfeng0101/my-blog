// Firebase 配置 — 由博主替换为自己的项目配置
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
}

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore'

const app = initializeApp(FIREBASE_CONFIG)
const db = getFirestore(app)

// 发布文章
export async function publishPost(post) {
  const docRef = await addDoc(collection(db, 'posts'), {
    title: post.title,
    slug: post.slug || post.title.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, ''),
    summary: post.summary || '',
    content: post.content || '',
    tags: post.tags || [],
    date: new Date().toISOString().split('T')[0],
    createdAt: Date.now(),
  })
  return docRef.id
}

// 获取所有文章
export async function getAllPosts() {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// 获取单篇文章
export async function getPost(id) {
  const snap = await getDoc(doc(db, 'posts', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// 删除文章
export async function deletePost(id) {
  await deleteDoc(doc(db, 'posts', id))
}

// 更新文章
export async function updatePost(id, data) {
  await updateDoc(doc(db, 'posts', id), data)
}
