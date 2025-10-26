// app/tests/dynamic-children/page.tsx
'use client'
import { $Chemical, $use, Undefined } from '@/chemistry';
import React, { useState } from 'react';
import styled from 'styled-components';

// ============================================
// LIBRARY DOMAIN MODEL
// ============================================

export class $Cover extends $Chemical {
    $imageUrl?: string = '';
    $color? = '#4a90e2';
    $title? = 'Untitled';
    $author? = 'Unknown';
    
    protected Container = styled.div<{ $color: string }>`
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, 
            ${props => props.$color}, 
            ${props => this.darken(props.$color || '#4a90e2', 0.3)}
        );
        background-size: cover;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 15px;
        color: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        position: relative;
        overflow: hidden;
        
        &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 12px rgba(0,0,0,0.2);
        }
    `;
    
    protected Spine = styled.div`
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: rgba(0, 0, 0, 0.1);
        box-shadow: inset -1px 0 2px rgba(0, 0, 0, 0.1);
    `;
    
    protected TitleArea = styled.div``;
    
    protected Title = styled.div`
        font-size: 18px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        line-height: 1.2;
        margin-bottom: 8px;
    `;
    
    protected Author = styled.div`
        font-size: 13px;
        opacity: 0.9;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    `;
    
    protected Decoration = styled.div`
        position: absolute;
        bottom: 10px;
        right: 10px;
        opacity: 0.3;
        font-size: 24px;
    `;
    
    view() {
        const Container = this.Container;
        const Spine = this.Spine;
        const TitleArea = this.TitleArea;
        const Title = this.Title;
        const Author = this.Author;
        const Decoration = this.Decoration;
        
        return (
            <Container $color={this.$color!}>
                <Spine />
                <TitleArea>
                    <Title>{this.$title}</Title>
                    <Author>{this.$author}</Author>
                </TitleArea>
                <Decoration>📖</Decoration>
            </Container>
        );
    }
    
    private darken(color: string, amount: number): string {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.max(0, Math.floor(r * (1 - amount)));
        const newG = Math.max(0, Math.floor(g * (1 - amount)));
        const newB = Math.max(0, Math.floor(b * (1 - amount)));
        
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
    }
}

export class $Title extends $Chemical {
    $text = 'Untitled';
    $subtitle?: string;
    
    protected TitleText = styled.div`
        font-weight: bold;
        font-size: 14px;
    `;
    
    protected Subtitle = styled.div`
        font-size: 11px;
        color: #666;
    `;
    
    view() {
        const Title = this.TitleText;
        const Subtitle = this.Subtitle;
        
        return (
            <div>
                <Title>{this.$text}</Title>
                {this.$subtitle && <Subtitle>{this.$subtitle}</Subtitle>}
            </div>
        );
    }
}

export class $Chapter extends $Chemical {
    $number = 1;
    $title = 'Chapter';
    $pages = 10;
    
    protected Container = styled.div<{ $inLibrary: boolean }>`
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${props => props.$inLibrary ? '6px 0' : '8px 12px'};
        background: ${props => props.$inLibrary ? 'transparent' : '#f8f8f8'};
        border-radius: ${props => props.$inLibrary ? '0' : '4px'};
        border-bottom: ${props => props.$inLibrary ? '1px solid #eee' : 'none'};
        font-size: ${props => props.$inLibrary ? '11px' : '13px'};
        transition: background 0.2s;
        cursor: pointer;
        
        &:hover {
            background: ${props => props.$inLibrary ? 'transparent' : '#e8e8e8'};
        }
    `;
    
    protected ChapterInfo = styled.div`
        display: flex;
        align-items: baseline;
        gap: 8px;
    `;
    
    protected Number = styled.span<{ $inLibrary: boolean }>`
        font-weight: bold;
        color: #666;
        min-width: ${props => props.$inLibrary ? '20px' : '30px'};
    `;
    
    protected ChapterTitle = styled.span`
        color: #333;
    `;
    
    protected Pages = styled.span<{ $inLibrary: boolean }>`
        color: #999;
        font-size: ${props => props.$inLibrary ? '10px' : '11px'};
        font-style: italic;
    `;
    
    view() {
        const inLibrary = 
            !!this.parent && !!this.parent.parent && 
            this.parent.parent instanceof $Library;
        
        const Container = this.Container;
        const Info = this.ChapterInfo;
        const Number = this.Number;
        const Title = this.ChapterTitle;
        const Pages = this.Pages;
        
        return (
            <Container $inLibrary={inLibrary}>
                <Info>
                    <Number $inLibrary={inLibrary}>{this.$number}.</Number>
                    <Title>{this.$title}</Title>
                </Info>
                <Pages $inLibrary={inLibrary}>{this.$pages} pages</Pages>
            </Container>
        );
    }
}

export class $Book extends $Chemical {
    $author = 'Unknown Author';
    cover?: $Cover;
    title!: $Title;
    chapters: $Chapter[] = [];
    
    protected isOpen = false;
    
    // Styled components that subclasses can override
    protected LibraryBookContainer = styled.div<{ $isOpen: boolean }>`
        width: 180px;
        height: ${props => props.$isOpen ? 'auto' : '240px'};
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
    `;
    
    protected StandaloneContainer = styled.div`
        max-width: 500px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        overflow: hidden;
    `;
    
    protected CoverSection = styled.div`
        height: 300px;
        position: relative;
        overflow: hidden;  /* Add this to contain the cover */
    `;
    
    protected OpenContent = styled.div`
        padding: 15px;
    `;
    
    protected BackButton = styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: #666;
        font-size: 12px;
        cursor: pointer;
    `;
    
    protected TitlePage = styled.div`
        border-bottom: 2px solid #eee;
        padding-bottom: 12px;
        margin-bottom: 12px;
    `;
    
    protected AuthorCredit = styled.div`
        font-size: 11px;
        color: #666;
        font-style: italic;
        margin-top: 4px;
    `;
    
    protected ContentsLabel = styled.div`
        font-size: 11px;
        font-weight: bold;
        color: #888;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    `;
    
    protected StandaloneContent = styled.div`
        padding: 24px;
    `;
    
    protected StandaloneTitleSection = styled.div`
        margin-bottom: 16px;
    `;
    
    protected StandaloneAuthor = styled.div`
        font-size: 14px;
        color: #666;
        margin-top: 8px;
    `;
    
    protected ChaptersSection = styled.div`
        border-top: 1px solid #eee;
        padding-top: 16px;
    `;
    
    protected ChaptersSectionLabel = styled.div`
        font-size: 13px;
        font-weight: bold;
        color: #888;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    `;
    
    protected ChapterList = styled.div`
        display: flex;
        flex-direction: column;
        gap: 6px;
    `;
    
    protected EmptyMessage = styled.div`
        color: #999;
        font-size: 12px;
        font-style: italic;
        text-align: center;
        padding: 20px;
    `;
    
    $Book(cover: $Cover | undefined, title: $Title, ...chapters: $Chapter[]) {
        this.cover = cover;
        this.title = title;
        this.chapters = chapters;
    }
    
    toggleOpen() {
        this.isOpen = !this.isOpen;
    }
    
    view() {
        const inLibrary = this.parent && this.parent.constructor.name === '$Library';
        
        if (inLibrary) {
            return this.renderLibraryView();
        } else {
            return this.renderStandaloneView();
        }
    }
    
    protected renderLibraryView() {
        const Container = this.LibraryBookContainer;
        const Content = this.OpenContent;
        const Back = this.BackButton;
        const TitlePage = this.TitlePage;
        const Author = this.AuthorCredit;
        const Label = this.ContentsLabel;
        
        // Ensure we have the required components
        if (!this.cover || !this.title) {
            return <Container $isOpen={false}>Missing cover or title</Container>;
        }
        
        const [Cover, coverKey] = $use(this.cover, 'key');
        const [Title, titleKey] = $use(this.title, 'key');
        
        return (
            <Container onClick={this.toggleOpen} $isOpen={this.isOpen}>
                {!this.isOpen ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <Cover key={coverKey} />
                    </div>
                ) : (
                    <Content>
                        <Back>
                            <span>← Back to cover</span>
                        </Back>
                        
                        <TitlePage>
                            <Title key={titleKey} />
                            <Author>by {this.$author}</Author>
                        </TitlePage>
                        
                        <div>
                            <Label>Contents</Label>
                            {this.chapters.map(ch => {
                                const [Chapter, key] = $use(ch, 'key');
                                return <Chapter key={key} />;
                            })}
                        </div>
                    </Content>
                )}
            </Container>
        );
    }
        
    protected renderStandaloneView() {
        const Container = this.StandaloneContainer;
        const CoverSection = this.CoverSection;
        const Content = this.StandaloneContent;
        const TitleSection = this.StandaloneTitleSection;
        const Author = this.StandaloneAuthor;
        const Chapters = this.ChaptersSection;
        const Label = this.ChaptersSectionLabel;
        const ChapterList = this.ChapterList;
        const Empty = this.EmptyMessage;

        const ThisCover = $use(this.cover);
        const [Title, titleKey] = $use(this.title, 'key');
        
        return (
            <Container>
                <CoverSection>
                    <div style={{ width: '100%', height: '100%' }}>
                        {ThisCover ? (
                            <ThisCover />
                        ) : (
                            <Cover 
                                color="#667eea" 
                                title={this.title?.$text || 'Untitled'} 
                                author={this.$author}
                            />
                        )}
                    </div>
                </CoverSection>
                
                <Content>
                    <TitleSection>
                        <Title key={titleKey} />
                        <Author>by {this.$author}</Author>
                    </TitleSection>
                    
                    <Chapters>
                        <Label>Table of Contents</Label>
                        <ChapterList>
                            {this.chapters.map(ch => {
                                const [Chapter, key] = $use(ch, 'key');
                                return <Chapter key={key} />;
                            })}
                        </ChapterList>
                        {this.chapters.length === 0 && (
                            <Empty>No chapters yet</Empty>
                        )}
                    </Chapters>
                </Content>
            </Container>
        );
    }
}

// Example subclass: Glass-style book with overridden styles
export class $GlassBook extends $Book {
    // Override just the styles we want to change
    protected LibraryBookContainer = styled.div<{ $isOpen: boolean }>`
        width: 180px;
        height: ${props => props.$isOpen ? 'auto' : '240px'};
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
        }
    `;
    
    protected StandaloneContainer = styled.div`
        max-width: 500px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 16px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        overflow: hidden;
    `;
}

export class $Reference extends $Chemical {
    book?: $Book;
    $notes = '';
    $category = 'general';
    
    $Reference(book: $Book) {
        this.book = book;
    }
    
    view() {
        if (!this.book) return null;
        
        return (
            <div style={{ 
                padding: '8px',
                background: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
                fontSize: '11px'
            }}>
                <div style={{ fontWeight: 'bold' }}>
                    {this.book.title?.$text || 'Unknown'}
                </div>
                <div style={{ color: '#666', fontSize: '10px' }}>
                    {this.book.$author} • {this.book.chapters.length} chapters
                </div>
                {this.$notes && (
                    <div style={{ 
                        marginTop: '4px', 
                        padding: '4px', 
                        background: '#fff',
                        borderRadius: '2px',
                        fontSize: '10px'
                    }}>
                        📝 {this.$notes}
                    </div>
                )}
                <div style={{ 
                    marginTop: '4px',
                    padding: '2px 6px',
                    background: '#e3f2fd',
                    borderRadius: '2px',
                    display: 'inline-block',
                    fontSize: '9px'
                }}>
                    {this.$category}
                </div>
            </div>
        );
    }
}

export class $Catalogue extends $Chemical {
    references: $Reference[] = [];
    $filterCategory = 'all';
    
    get library() { return this.parent as $Library; }
    
    $Catalogue() {
        // Dynamically create references from parent library's books
        if (this.library && this.library.books) {
            // Keep existing references for books that still exist
            const existingRefs = new Map(
                this.references.map(ref => [ref.book, ref])
            );
            
            this.references = this.library.books.map(book => {
                // Reuse existing reference if available
                if (existingRefs.has(book)) {
                    return existingRefs.get(book)!;
                }
                // Create new reference
                const ref = new $Reference();
                ref.book = book;
                ref.$category = book.chapters.length > 3 ? 'extensive' : 'brief';
                return ref;
            });
        }
    }
    
    view() {
        const filtered = this.$filterCategory === 'all' 
            ? this.references 
            : this.references.filter(r => r.$category === this.$filterCategory);
        
        return (
            <div style={{ 
                padding: '15px',
                background: '#fff',
                border: '2px solid #2196f3',
                borderRadius: '8px'
            }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                    📚 Reading Catalogue
                </h3>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                    {this.references.length} references from library
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {filtered.map(ref => {
                        const [Ref, key] = $use(ref, 'key');
                        return <Ref key={key} />;
                    })}
                </div>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                        No references match filter
                    </div>
                )}
            </div>
        );
    }
}

export class $Library extends $Chemical {
    books: $Book[] = [];
    catalogue?: $Catalogue;
    
    $Library(...children: ($Book | $Catalogue)[]) {
        this.books = children.filter(c => c instanceof $Book) as $Book[];
        this.catalogue = children.find(c => c instanceof $Catalogue) as $Catalogue;
    }
    
    view() {
        return (
            <div style={{ 
                padding: '30px',
                background: 'linear-gradient(to bottom, #8b7355, #6b5644)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                minHeight: '400px'
            }}>
                {/* Library header */}
                <div style={{ 
                    marginBottom: '25px',
                    borderBottom: '2px solid rgba(255,255,255,0.2)',
                    paddingBottom: '15px'
                }}>
                    <h2 style={{ 
                        margin: '0 0 8px 0',
                        color: '#fff',
                        fontSize: '28px',
                        fontFamily: 'Georgia, serif',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        📚 The Library
                    </h2>
                    <div style={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '14px'
                    }}>
                        {this.books.length} {this.books.length === 1 ? 'volume' : 'volumes'} in collection
                    </div>
                </div>
                
                {/* Bookshelf */}
                <div style={{ 
                    background: 'linear-gradient(to bottom, #5d4a3a, #4a3829)',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '20px',
                        minHeight: '240px',
                        alignItems: 'end'
                    }}>
                        {this.books.map(book => {
                            const [Book, key] = $use(book, 'key');
                            return <Book key={key} />;
                        })}
                        {this.books.length === 0 && (
                            <div style={{ 
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '14px',
                                fontStyle: 'italic',
                                padding: '40px'
                            }}>
                                The shelves are empty...
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Catalogue section */}
                {this.catalogue && (
                    <div style={{ 
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '8px',
                        padding: '20px'
                    }}>
                        {(() => {
                            const [Catalogue, key] = $use(this.catalogue, 'key');
                            return <Catalogue key={key} />;
                        })()}
                    </div>
                )}
            </div>
        );
    }
}

// ============================================
// TEST COMPONENTS
// ============================================

const Cover = new $Cover().Component;
const Title = new $Title().Component;
const Chapter = new $Chapter().Component;
const Book = new $Book().Component;
const Catalogue = new $Catalogue().Component;
const Library = new $Library().Component;

// Test 1: Polymorphic Single Argument
function Test1PolymorphicArg() {
    const [coverColor, setCoverColor] = useState('#e91e63');
    const [useSubtitle, setUseSubtitle] = useState(false);
    
    return (
        <div style={{ border: '2px solid purple', padding: '15px', borderRadius: '8px' }}>
            <h4>Test 1: Book with Dynamic Properties</h4>
            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                Book constructor expects: (cover, title, ...chapters)
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => setCoverColor(coverColor === '#e91e63' ? '#4caf50' : '#e91e63')} style={{ marginRight: '5px', padding: '5px 10px' }}>
                    Toggle Cover Color
                </button>
                <button onClick={() => setUseSubtitle(!useSubtitle)} style={{ padding: '5px 10px' }}>
                    {useSubtitle ? 'Remove' : 'Add'} Subtitle
                </button>
            </div>
            
            <Book author="Test Author">
                <Cover color={coverColor} title="Dynamic Book" author="Test Author" />
                <Title text="Dynamic Book" subtitle={useSubtitle ? "With Subtitle" : undefined} />
                <Chapter number={1} title="Introduction" pages={15} />
                <Chapter number={2} title="Content" pages={20} />
            </Book>
            
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                ✓ Cover color changes dynamically<br/>
                ✓ Subtitle can be toggled<br/>
                ✓ Book maintains state across changes
            </div>
        </div>
    );
}

// Test 2: Dynamic Array Length
function Test2DynamicArrayLength() {
    const [chapterCount, setChapterCount] = useState(3);
    
    return (
        <div style={{ border: '2px solid blue', padding: '15px', borderRadius: '8px' }}>
            <h4>Test 2: Dynamic Array Length</h4>
            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                Constructor receives variable-length chapter array
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => setChapterCount(Math.max(1, chapterCount - 1))} style={{ marginRight: '5px', padding: '5px 10px' }}>
                    Remove Chapter
                </button>
                <button onClick={() => setChapterCount(chapterCount + 1)} style={{ padding: '5px 10px' }}>
                    Add Chapter
                </button>
                <span style={{ marginLeft: '10px', fontSize: '12px' }}>
                    Current: {chapterCount} chapters
                </span>
            </div>
            
            <Book author="Variable Author">
                <Cover color="#4caf50" title="Growing Book" author="Variable Author" />
                <Title text="Growing Book" />
                {Array.from({ length: chapterCount }, (_, i) => (
                    <Chapter 
                        key={i} 
                        number={i + 1} 
                        title={`Chapter ${i + 1}`} 
                        pages={10 + i * 5} 
                    />
                ))}
            </Book>
            
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                ✓ Array length changes dynamically<br/>
                ✓ Constructor handles variable args<br/>
                ✓ Book updates chapter count
            </div>
        </div>
    );
}

// Test 3: Context-Aware Rendering
function Test3ContextAwareRendering() {
    const [bookInLibrary, setInLibrary] = useState(true);
    
    return (
        <div style={{ border: '2px solid orange', padding: '15px', borderRadius: '8px' }}>
            <h4>Test 3: Context-Aware Rendering</h4>
            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                Book renders differently when inside Library vs standalone
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => setInLibrary(!bookInLibrary)} style={{ padding: '5px 10px' }}>
                    Toggle: {bookInLibrary ? 'In Library' : 'Standalone'}
                </button>
            </div>
            
            {bookInLibrary ? (
                <Library>
                    <Book author="Context Author">
                        <Cover color="#ff9800" title="Context-Aware Book" author="Context Author" />
                        <Title text="Context-Aware Book" subtitle="Renders differently based on parent" />
                        <Chapter number={1} title="Adaptation" pages={12} />
                        <Chapter number={2} title="Context" pages={18} />
                        <Chapter number={3} title="Rendering" pages={15} />
                    </Book>
                    <Book author="Another Author">
                        <Cover color="#9c27b0" title="Second Book" author="Another Author" />
                        <Title text="Second Book" />
                        <Chapter number={1} title="First" pages={10} />
                    </Book>
                </Library>
            ) : (
                <Book author="Context Author">
                    <Cover color="#ff9800" title="Context-Aware Book" author="Context Author" />
                    <Title text="Context-Aware Book" subtitle="Renders differently based on parent" />
                    <Chapter number={1} title="Adaptation" pages={12} />
                    <Chapter number={2} title="Context" pages={18} />
                    <Chapter number={3} title="Rendering" pages={15} />
                </Book>
            )}
            
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                ✓ Book detects parent type<br/>
                ✓ Renders compact in Library<br/>
                ✓ Renders detailed standalone
            </div>
        </div>
    );
}

// Test 4: Dynamic Object Graph (Catalogue)
function Test4DynamicObjectGraph() {
    const [bookCount, setBookCount] = useState(3);
    const [filterCategory, setFilterCategory] = useState<'all' | 'extensive' | 'brief'>('all');
    
    const books = Array.from({ length: bookCount }, (_, i) => {
        const chapters = i % 2 === 0 ? 5 : 2; // Alternating extensive/brief
        // Generate hex colors instead of HSL
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce', '#85c88a'];
        const color = colors[i % colors.length];
        
        return (
            <Book key={i} author={`Author ${i + 1}`}>
                <Cover 
                    color={color} 
                    title={`Book ${i + 1}`}
                    author={`Author ${i + 1}`}
                />
                <Title text={`Book ${i + 1}`} />
                {Array.from({ length: chapters }, (_, j) => (
                    <Chapter 
                        key={j}
                        number={j + 1} 
                        title={`Ch ${j + 1}`} 
                        pages={10} 
                    />
                ))}
            </Book>
        );
    });
    
    return (
        <div style={{ border: '2px solid green', padding: '15px', borderRadius: '8px' }}>
            <h4>Test 4: Dynamic Object Graph (Catalogue)</h4>
            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                Catalogue dynamically creates references from Library books
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => setBookCount(Math.max(1, bookCount - 1))} style={{ marginRight: '5px', padding: '5px 10px' }}>
                    Remove Book
                </button>
                <button onClick={() => setBookCount(bookCount + 1)} style={{ marginRight: '10px', padding: '5px 10px' }}>
                    Add Book
                </button>
                <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    style={{ padding: '5px' }}
                >
                    <option value="all">All Categories</option>
                    <option value="extensive">Extensive (5+ chapters)</option>
                    <option value="brief">Brief (2 chapters)</option>
                </select>
            </div>
            
            <Library>
                {books}
                <Catalogue filterCategory={filterCategory} />
            </Library>
            
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                ✓ Catalogue accesses parent Library<br/>
                ✓ Creates references dynamically<br/>
                ✓ Updates when books change<br/>
                ✓ Maintains reference state
            </div>
        </div>
    );
}

// Test 5: Mixed Polymorphic Array
function Test5MixedPolymorphicArray() {
    const [mode, setMode] = useState<'minimal' | 'full' | 'mixed'>('mixed');
    
    return (
        <div style={{ border: '2px solid red', padding: '15px', borderRadius: '8px' }}>
            <h4>Test 5: Book Variations</h4>
            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                Books with different chapter counts and styles
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => setMode('minimal')} style={{ marginRight: '5px', padding: '5px 10px' }}>
                    All Minimal
                </button>
                <button onClick={() => setMode('full')} style={{ marginRight: '5px', padding: '5px 10px' }}>
                    All Full
                </button>
                <button onClick={() => setMode('mixed')} style={{ padding: '5px 10px' }}>
                    Mixed
                </button>
            </div>
            
            <Library>
                {[0, 1, 2].map(i => {
                    if (mode === 'minimal') {
                        return (
                            <Book key={i} author={`Author ${i + 1}`}>
                                <Cover color="#cccccc" title={`Minimal Book ${i}`} author={`Author ${i + 1}`} />
                                <Title text={`Minimal Book ${i}`} />
                                <Chapter number={1} title="Only Chapter" pages={10} />
                            </Book>
                        );
                    } else if (mode === 'full') {
                        const colors = ['#e91e63', '#9c27b0', '#2196f3'];
                        return (
                            <Book key={i} author={`Author ${i + 1}`}>
                                <Cover color={colors[i % colors.length]} title={`Full Book ${i}`} author={`Author ${i + 1}`} />
                                <Title text={`Full Book ${i}`} subtitle="Complete Edition" />
                                <Chapter number={1} title="Part 1" pages={15} />
                                <Chapter number={2} title="Part 2" pages={20} />
                                <Chapter number={3} title="Part 3" pages={18} />
                            </Book>
                        );
                    } else {
                        return (
                            <Book key={i} author={`Author ${i + 1}`}>
                                <Cover 
                                    color={i % 2 === 0 ? "#e91e63" : "#9e9e9e"} 
                                    title={i % 2 === 0 ? `Full Book ${i}` : `Minimal Book ${i}`}
                                    author={`Author ${i + 1}`}
                                />
                                <Title text={i % 2 === 0 ? `Full Book ${i}` : `Minimal Book ${i}`} />
                                <Chapter number={1} title="Chapter" pages={i % 2 === 0 ? 15 : 10} />
                                {i % 2 === 0 && <Chapter number={2} title="Bonus" pages={12} />}
                            </Book>
                        );
                    }
                })}
            </Library>
            
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                ✓ All books have cover and title<br/>
                ✓ Different chapter counts<br/>
                ✓ Constructor is predictable<br/>
                ✓ Library displays all correctly
            </div>
        </div>
    );
}

// Test 6: Optional Cover with Default
function Test6OptionalCover() {
    const [showCover, setShowCover] = useState(false);
    const [bookTitle, setBookTitle] = useState('Mystery Book');
    
    return (
        <div style={{ border: '2px solid indigo', padding: '15px', borderRadius: '8px' }}>
            <h4>Test 6: Optional Cover with Default</h4>
            <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                Book constructor handles undefined cover and creates a default
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={() => setShowCover(!showCover)} style={{ marginRight: '5px', padding: '5px 10px' }}>
                    {showCover ? 'Remove' : 'Add'} Custom Cover
                </button>
                <button onClick={() => setBookTitle(bookTitle === 'Mystery Book' ? 'Adventure Book' : 'Mystery Book')} style={{ padding: '5px 10px' }}>
                    Change Title
                </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                    <h5 style={{ marginBottom: '10px' }}>With Custom Cover:</h5>
                    <Book author="Test Author">
                        {showCover ? (
                            <Cover color="#ff5722" title={bookTitle} author="Test Author" />
                        ) : (
                            <Undefined />
                        )}
                        <Title text={bookTitle} />
                        <Chapter number={1} title="Opening" pages={12} />
                        <Chapter number={2} title="Middle" pages={18} />
                        <Chapter number={3} title="Ending" pages={15} />
                    </Book>
                </div>
                
                <div>
                    <h5 style={{ marginBottom: '10px' }}>Always Using Default:</h5>
                    <Book author="Default Author">
                        <Undefined />
                        <Title text="Book with Default Cover" />
                        <Chapter number={1} title="Chapter One" pages={20} />
                        <Chapter number={2} title="Chapter Two" pages={25} />
                    </Book>
                </div>
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                ✓ Undefined component passes undefined to constructor<br/>
                ✓ Book creates default cover when undefined<br/>
                ✓ Default cover uses book's title and author<br/>
                ✓ Can toggle between custom and default cover
            </div>
        </div>
    );
}

// Main test page
export default function DynamicArgTests() {
    return (
        <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
            <h1>Dynamic Children Tests</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Testing dynamic children where constructor arguments change shape, type, and length through user interaction and conditional logic.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <Test1PolymorphicArg />
                <Test2DynamicArrayLength />
                <Test3ContextAwareRendering />
                <Test4DynamicObjectGraph />
                <Test5MixedPolymorphicArray />
                <Test6OptionalCover />
            </div>
            
            <div style={{ 
                marginTop: '40px', 
                padding: '20px', 
                background: '#e8f5e9', 
                borderRadius: '8px',
                border: '2px solid #4caf50'
            }}>
                <h3>🎯 Test Summary</h3>
                <p style={{ margin: '10px 0' }}>These tests demonstrate:</p>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>Polymorphic first arguments (Cover | Title)</li>
                    <li>Dynamic array lengths (add/remove chapters)</li>
                    <li>Context-aware rendering (parent detection)</li>
                    <li>Dynamic object graphs (Catalogue creating References)</li>
                    <li>Mixed polymorphic arrays (varying book structures)</li>
                    <li>State persistence across structural changes</li>
                    <li>Parent-child property access (Library → Books)</li>
                </ul>
            </div>
        </div>
    );
}