'use client';

import { useEffect } from 'react';
import { categoryService } from '@/lib/api/services/category.service';

export default function AdminCategoriesPage() {
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAllCategories();
                console.log("=== DANH SÁCH CATEGORIES TỪ BACKEND ===", data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách categories:", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Admin Categories</h1>
            <p>Giao diện đang được xây dựng...</p>
            <p style={{ color: 'red', fontWeight: 'bold' }}>
                👉 Hãy bấm F12 (hoặc Chuột phải -&gt; Inspect) và mở tab <b>Console</b> để xem dữ liệu `listAllCategories`.
            </p>
        </div>
    );
}