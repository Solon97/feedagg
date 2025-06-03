// Test script to verify the saved content integration
// This script simulates saving content and verifying the workflow

// Test data that matches the SavedContentItem interface
const testContent = [
    {
        id: 1,
        title: "Test Article: Understanding React Hooks",
        source: "TechBlog",
        type: "article",
        readTime: "5 min read",
        savedDate: new Date().toISOString(),
        thumbnail: "/placeholder.jpg",
        content: "This is a test article about React hooks...",
        isConsumed: false,
        excerpt: "Learn the fundamentals of React hooks",
        url: "https://example.com/react-hooks"
    },
    {
        id: 2,
        title: "Test Video: Next.js Tutorial",
        source: "DevTube",
        type: "video",
        readTime: "15 min watch",
        savedDate: new Date().toISOString(),
        thumbnail: "/placeholder.jpg",
        videoUrl: "https://example.com/nextjs-tutorial",
        isConsumed: false,
        excerpt: "Complete Next.js tutorial for beginners"
    }
];

// Save to localStorage (simulating the SavedContentManager)
const SAVED_CONTENT_KEY = 'digestly-saved-content';
localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(testContent));

console.log('Test content saved to localStorage');
console.log('Saved items:', JSON.parse(localStorage.getItem(SAVED_CONTENT_KEY)));

// Simulate adding a new item
const newItem = {
    id: 3,
    title: "New Test Article",
    source: "NewsSource",
    type: "article",
    readTime: "3 min read",
    savedDate: new Date().toISOString(),
    thumbnail: "/placeholder.jpg",
    isConsumed: false
};

const existing = JSON.parse(localStorage.getItem(SAVED_CONTENT_KEY)) || [];
existing.unshift(newItem);
localStorage.setItem(SAVED_CONTENT_KEY, JSON.stringify(existing));

console.log('New item added. Total items:', existing.length);
