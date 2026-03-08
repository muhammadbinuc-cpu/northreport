'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MockIssue } from '@/lib/mockIssues';

interface UseLiveIssuesOptions {
    initialIssues?: MockIssue[];
    injectInterval?: number; // ms between new issues
}

export function useLiveIssues({
    injectInterval = 30000, // Poll every 30s
}: UseLiveIssuesOptions) {
    const [issues, setIssues] = useState<MockIssue[]>([]);
    const [newIssueId, setNewIssueId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Polling ref
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const previousIssuesRef = useRef<string[]>([]);
    const mounted = useRef(true);

    const fetchIssues = useCallback(async () => {
        try {
            // Fetch reports from API (using type=report to get only reports)
            const res = await fetch('/api/feed?limit=20&type=report');
            if (!res.ok) throw new Error('Failed to fetch issues');
            
            const data = await res.json();
            
            // Map API data to UI format
            const mappedIssues: MockIssue[] = data.items.map((item: any) => ({
                id: item.id,
                title: item.caption?.slice(0, 50) + (item.caption?.length > 50 ? '...' : '') || 'Issue Report',
                description: item.caption || '',
                category: 'general', // API doesn't return category yet, default to general
                severity: item.severity || 'medium',
                latitude: item.latitude || 43.2557,
                longitude: item.longitude || -79.9192,
                neighborhood: item.neighborhood || 'downtown-hamilton',
                imageUrl: item.mediaUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&q=80',
                upvotes: item.upvotes || 0,
                comments: [], // Comments not fetched in feed list
                createdAt: item.createdAt,
            }));

            if (!mounted.current) return;

            setIssues(mappedIssues);
            setIsLoading(false);

            // Check for new issues by comparing IDs
            const currentIds = mappedIssues.map(i => i.id);
            const prevIds = previousIssuesRef.current;

            // Detect a just-filed report on first fetch via sessionStorage
            const pendingNewId = sessionStorage.getItem('newReportId');
            if (pendingNewId) {
                sessionStorage.removeItem('newReportId');
                const newIssue = mappedIssues.find(i => i.id === pendingNewId);
                if (newIssue) {
                    setNewIssueId(pendingNewId);
                    setToastMessage('Your report is now live!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 4000);
                    setTimeout(() => setNewIssueId(null), 5000);
                    previousIssuesRef.current = currentIds;
                    return;
                }
            }
            
            if (prevIds.length > 0) {
                const newId = currentIds.find(id => !prevIds.includes(id));
                if (newId) {
                    const newIssue = mappedIssues.find(i => i.id === newId);
                    if (newIssue) {
                        setNewIssueId(newId);
                        setToastMessage(`New report: ${newIssue.title}`);
                        setShowToast(true);
                        
                        // Auto-hide toast
                        setTimeout(() => setShowToast(false), 4000);
                        // Clear highlight
                        setTimeout(() => setNewIssueId(null), 5000);
                    }
                }
            }
            
            previousIssuesRef.current = currentIds;
            
        } catch (error) {
            console.error('Error fetching live issues:', error);
            setIsLoading(false);
        }
    }, []);

    // Initial fetch and polling
    useEffect(() => {
        mounted.current = true;
        fetchIssues();

        intervalRef.current = setInterval(fetchIssues, injectInterval);

        return () => {
            mounted.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchIssues, injectInterval]);

    const dismissToast = useCallback(() => {
        setShowToast(false);
    }, []);

    return {
        issues,
        setIssues,
        newIssueId,
        showToast,
        toastMessage,
        dismissToast,
        isLoading
    };
}
