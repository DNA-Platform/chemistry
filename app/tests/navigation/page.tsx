'use client'
import { $Chemical, child } from '@/chemistry';
import { ReactNode } from 'react';

class $Cover extends $Chemical {
    $title: string = "Book Title";
    $author: string = "Author";
    book?: $Book;
    
    view() {
        return (
            <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                background: '#f0f0f0',
                borderRadius: '8px'
            }}>
                <h1>{this.$title}</h1>
                <p style={{ fontSize: '18px', color: '#666' }}>by {this.$author}</p>
                <button 
                    onClick={() => {
                        console.log('Start Reading clicked, book reference:', this.book);
                        this.book?.goToFirstChapter();
                    }}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '20px'
                    }}
                >
                    Start Reading →
                </button>
            </div>
        );
    }
}

class $Chapter extends $Chemical {
    $title: string = "Chapter";
    $content: string = "Content";
    chapterNumber: number = 0;
    chapterIndex: number = 0;
    totalChapters: number = 0;
    book?: $Book;
    
    view() {
        const hasPrevious = this.chapterIndex > 0;
        const hasNext = this.chapterIndex < this.totalChapters - 1;
        
        return (
            <div style={{ padding: '20px' }}>
                <h2>Chapter {this.chapterNumber}: {this.$title}</h2>
                <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '20px 0' }}>
                    {this.$content}
                </p>
                <div style={{ 
                    marginTop: '30px', 
                    display: 'flex', 
                    gap: '10px',
                    justifyContent: 'center'
                }}>
                    <button 
                        onClick={() => this.book?.goToChapter(this.chapterIndex - 1)}
                        disabled={!hasPrevious}
                        style={{
                            padding: '8px 16px',
                            background: hasPrevious ? '#6c757d' : '#e0e0e0',
                            color: hasPrevious ? 'white' : '#999',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: hasPrevious ? 'pointer' : 'not-allowed'
                        }}
                    >
                        ← Previous
                    </button>
                    <button 
                        onClick={() => this.book?.goToCover()}
                        style={{
                            padding: '8px 16px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Cover
                    </button>
                    <button 
                        onClick={() => this.book?.goToChapter(this.chapterIndex + 1)}
                        disabled={!hasNext}
                        style={{
                            padding: '8px 16px',
                            background: hasNext ? '#6c757d' : '#e0e0e0',
                            color: hasNext ? 'white' : '#999',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: hasNext ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Next →
                    </button>
                </div>
            </div>
        );
    }
}

class $Book extends $Chemical {
    @child($Cover)
    cover!: $Cover;
    
    @child($Chapter)
    chapters: $Chapter[] = [];
    
    currentView: 'cover' | number = 'cover';
    
    goToFirstChapter = () => {
        console.log('goToFirstChapter called');
        if (this.chapters.length > 0) {
            this.currentView = 0;
        }
    };
    
    goToCover = () => {
        this.currentView = 'cover';
    };
    
    goToChapter = (index: number) => {
        if (index >= 0 && index < this.chapters.length) {
            this.currentView = index;
        }
    };
    
    view(): ReactNode {
        // Wire up references
        if (this.cover) {
            this.cover.book = this;
        }
        
        this.chapters.forEach((ch, i) => {
            ch.book = this;
            ch.chapterNumber = i + 1;
            ch.totalChapters = this.chapters.length;
            ch.chapterIndex = i;
        });
        
        // Determine what to show
        const currentComponent = this.currentView === 'cover' 
            ? this.cover 
            : this.chapters[this.currentView as number];
        
        return (
            <div>
                <div style={{ 
                    marginBottom: '10px', 
                    padding: '10px',
                    background: '#e3f2fd',
                    borderRadius: '4px'
                }}>
                    <strong>Debug Info:</strong> Current View = {
                        this.currentView === 'cover' ? 'Cover' : `Chapter ${(this.currentView as number) + 1}`
                    }
                </div>
                <div style={{ 
                    border: '2px solid purple', 
                    padding: '20px',
                    borderRadius: '8px'
                }}>
                    {currentComponent?.view()}
                </div>
            </div>
        );
    }
}

export default function NavigationTest() {
    const Cover = new $Cover().Component;
    const Chapter = new $Chapter().Component;
    const Book = new $Book().Component;
    
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Navigation Test</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Tests navigation between Cover and Chapters in a Book component.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Instructions:</h3>
                <ol>
                    <li>Click "Start Reading" on the cover - should go to Chapter 1</li>
                    <li>Click "Next" - should go to Chapter 2</li>
                    <li>Click "Previous" - should go back to Chapter 1</li>
                    <li>Click "Back to Cover" - should return to cover</li>
                </ol>
            </div>
            
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <Book>
                    <Cover title="The Test Book" author="Test Author" />
                    <Chapter title="Introduction" content="Welcome to this test book. This is the first chapter." />
                    <Chapter title="Main Content" content="This is the main content of our test book. You should be able to navigate here." />
                    <Chapter title="Conclusion" content="This is the final chapter. Thanks for testing!" />
                </Book>
            </div>
            
            <div style={{ marginTop: '30px' }}>
                <p style={{ fontSize: '14px', color: '#666' }}>
                    💡 Check the console for debug output when clicking buttons
                </p>
            </div>
        </div>
    );
}