// Utility for managing saved content across the application
export interface SavedContentItem {
    id: number
    title: string
    source: string
    type: "article" | "video"
    readTime: string
    savedDate: string
    thumbnail: string
    content?: string
    videoUrl?: string
    isConsumed: boolean
    excerpt?: string
    url?: string
    publishedDate?: string
}

const SAVED_CONTENT_KEY = 'digestly-saved-content'

export class SavedContentManager {
    static getSavedContent(): SavedContentItem[] {
        if (typeof window === 'undefined') return []

        try {
            const saved = localStorage.getItem(SAVED_CONTENT_KEY)
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    }

    static addSavedContent(item: Omit<SavedContentItem, 'savedDate' | 'isConsumed'>): void {
        if (typeof window === 'undefined') return

        const savedContent = this.getSavedContent()
        const newItem: SavedContentItem = {
            ...item,
            savedDate: new Date().toISOString(),
            isConsumed: false
        }

        // Check if already saved
        const exists = savedContent.find(saved => saved.id === item.id)
        if (!exists) {
            savedContent.unshift(newItem)
            localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(savedContent))
        }
    }

    static removeSavedContent(id: number): void {
        if (typeof window === 'undefined') return

        const savedContent = this.getSavedContent()
        const filtered = savedContent.filter(item => item.id !== id)
        localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(filtered))
    }

    static isSaved(id: number): boolean {
        if (typeof window === 'undefined') return false

        const savedContent = this.getSavedContent()
        return savedContent.some(item => item.id === id)
    }

    static updateConsumptionStatus(id: number, isConsumed: boolean): void {
        if (typeof window === 'undefined') return

        const savedContent = this.getSavedContent()
        const updated = savedContent.map(item =>
            item.id === id ? { ...item, isConsumed } : item
        )
        localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(updated))
    }

    // Test method to add sample data for integration testing
    static addTestData(): void {
        if (typeof window === 'undefined') return

        const testItems: SavedContentItem[] = [
            {
                id: 1,
                title: "Understanding React Server Components",
                source: "React Blog",
                type: "article",
                readTime: "8 min read",
                savedDate: new Date().toISOString(),
                thumbnail: "/placeholder.jpg",
                content: "Learn about the latest React Server Components...",
                isConsumed: false,
                excerpt: "A comprehensive guide to React Server Components",
                url: "https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023"
            },
            {
                id: 2,
                title: "Next.js 14 App Router Tutorial",
                source: "Vercel",
                type: "video",
                readTime: "22 min watch",
                savedDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                thumbnail: "/placeholder.jpg",
                videoUrl: "https://www.youtube.com/watch?v=2RWsLmu8yVc&t=4850s",
                isConsumed: false,
                excerpt: "Complete tutorial on Next.js 14 App Router"
            },
            {
                id: 3,
                title: "TypeScript Best Practices 2024",
                source: "TypeScript Weekly",
                type: "article",
                readTime: "6 min read",
                savedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                thumbnail: "/placeholder.jpg",
                isConsumed: true,
                excerpt: "Essential TypeScript patterns for modern development",
                url: "https://www.typescriptlang.org/docs/"
            }
        ]

        localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(testItems))
    }
}
