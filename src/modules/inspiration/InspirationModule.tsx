import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Image as ImageIcon,
  Plus,
  Upload,
  Pin,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Filter,
  ArrowUp,
  ArrowDown,
  Download,
  Info,
  Check,
  Tag,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { InspirationImage } from '../../types'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'

export const InspirationModule: React.FC = () => {
  const {
    inspirationImages,
    addInspirationImages,
    updateInspirationImage,
    deleteInspirationImage,
    togglePinInspirationImage,
    reorderInspirationImages,
  } = useApp()

  // Local UI states
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [columnCount, setColumnCount] = useState<'auto' | '2' | '3' | '4'>('auto')
  const [isDragging, setIsDragging] = useState(false)
  const [showLightboxSidebar, setShowLightboxSidebar] = useState(true)

  // Edit draft state inside lightbox or modal
  const [editDraft, setEditDraft] = useState<{
    title: string
    category: string
    caption: string
    note: string
  }>({
    title: '',
    category: '',
    caption: '',
    note: '',
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dropzoneRef = useRef<HTMLDivElement | null>(null)

  // Derive unique categories from existing images
  const categories = useMemo(() => {
    const set = new Set<string>()
    inspirationImages.forEach((img) => {
      if (img.category && img.category.trim()) {
        set.add(img.category.trim())
      }
    })
    return Array.from(set).sort()
  }, [inspirationImages])

  // Filtered & sorted images: pinned always first, then by order
  const displayedImages = useMemo(() => {
    return inspirationImages
      .filter((img) => {
        // Category filter
        if (selectedCategory !== 'all') {
          if ((img.category || 'General').toLowerCase() !== selectedCategory.toLowerCase()) {
            return false
          }
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchesTitle = img.title?.toLowerCase().includes(q)
          const matchesCategory = img.category?.toLowerCase().includes(q)
          const matchesCaption = img.caption?.toLowerCase().includes(q)
          const matchesNote = img.note?.toLowerCase().includes(q)
          if (!matchesTitle && !matchesCategory && !matchesCaption && !matchesNote) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return a.order - b.order
      })
  }, [inspirationImages, selectedCategory, searchQuery])

  // Active image for lightbox
  const activeImage = useMemo(() => {
    if (!selectedImageId) return null
    return inspirationImages.find((img) => img.id === selectedImageId) || null
  }, [selectedImageId, inspirationImages])

  // Sync edit draft when active image changes
  useEffect(() => {
    if (activeImage) {
      setEditDraft({
        title: activeImage.title || '',
        category: activeImage.category || 'General',
        caption: activeImage.caption || '',
        note: activeImage.note || '',
      })
    }
  }, [activeImage])

  // Active index for lightbox prev/next
  const activeIndex = useMemo(() => {
    if (!activeImage) return -1
    return displayedImages.findIndex((img) => img.id === activeImage.id)
  }, [activeImage, displayedImages])

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setSelectedImageId(displayedImages[activeIndex - 1].id)
    } else if (displayedImages.length > 0) {
      setSelectedImageId(displayedImages[displayedImages.length - 1].id)
    }
  }, [activeIndex, displayedImages])

  const handleNext = useCallback(() => {
    if (activeIndex < displayedImages.length - 1 && activeIndex !== -1) {
      setSelectedImageId(displayedImages[activeIndex + 1].id)
    } else if (displayedImages.length > 0) {
      setSelectedImageId(displayedImages[0].id)
    }
  }, [activeIndex, displayedImages])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImageId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Escape') {
        setSelectedImageId(null)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageId, handlePrev, handleNext])

  // Process uploaded files
  const processFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    const results = await Promise.all(
      imageFiles.map((file) => {
        return new Promise<Omit<InspirationImage, 'id' | 'createdAt' | 'order'>>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            const img = new window.Image()
            img.onload = () => {
              const width = img.naturalWidth || img.width
              const height = img.naturalHeight || img.height
              const aspectRatio = width && height ? width / height : 1
              const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
              const title = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1)
              resolve({
                imageData: dataUrl,
                title,
                category: selectedCategory !== 'all' ? selectedCategory : 'General',
                caption: '',
                note: '',
                pinned: false,
                width,
                height,
                aspectRatio,
              })
            }
            img.onerror = () => {
              resolve({
                imageData: dataUrl,
                title: file.name,
                category: selectedCategory !== 'all' ? selectedCategory : 'General',
                caption: '',
                note: '',
                pinned: false,
              })
            }
            img.src = dataUrl
          }
          reader.readAsDataURL(file)
        })
      })
    )

    if (results.length > 0) {
      await addInspirationImages(results)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files)
    }
  }

  // File picker handler
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files)
      // Reset input value so same files can be re-selected if needed
      e.target.value = ''
    }
  }

  // Save metadata edit
  const handleSaveEdit = async () => {
    if (!activeImage) return
    await updateInspirationImage({
      ...activeImage,
      title: editDraft.title.trim() || undefined,
      category: editDraft.category.trim() || 'General',
      caption: editDraft.caption.trim() || undefined,
      note: editDraft.note.trim() || undefined,
    })
  }

  // Reordering functions
  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = inspirationImages.findIndex((i) => i.id === imageId)
    if (currentIndex === -1) return
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= inspirationImages.length) return

    const newOrder = [...inspirationImages]
    const temp = newOrder[currentIndex]
    newOrder[currentIndex] = newOrder[targetIndex]
    newOrder[targetIndex] = temp

    await reorderInspirationImages(newOrder.map((i) => i.id))
  }

  // Download image
  const handleDownload = (img: InspirationImage) => {
    const link = document.createElement('a')
    link.href = img.imageData
    link.download = `${img.title || 'inspiration'}-${img.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const pinnedCount = inspirationImages.filter((i) => i.pinned).length

  return (
    <div
      className="inspiration-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* ── TOP HEADER ──────────────────────────────────────────────── */}
      <div className="inspiration-header">
        <div className="inspiration-header__title-group">
          <div className="page-meta">Personal Visual Board & Aesthetic Reference</div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon size={22} strokeWidth={2} />
            Inspiration
            {inspirationImages.length > 0 && (
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  background: 'var(--bg-subtle)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid var(--border)',
                }}
              >
                {inspirationImages.length} {inspirationImages.length === 1 ? 'image' : 'images'}
                {pinnedCount > 0 && ` · ${pinnedCount} pinned`}
              </span>
            )}
          </h1>
        </div>

        <div className="inspiration-header__actions">
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Add Image
          </Button>
        </div>
      </div>

      {/* ── DRAG & DROP ZONE (Collapsible or top drop target) ──────────── */}
      {inspirationImages.length === 0 ? (
        <div
          ref={dropzoneRef}
          className={`inspiration-dropzone ${isDragging ? 'inspiration-dropzone--active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
          style={{ minHeight: '340px', padding: '60px 24px' }}
        >
          <div className="inspiration-dropzone__icon">
            <Upload size={22} strokeWidth={2} />
          </div>
          <div className="inspiration-dropzone__title">
            Drag & drop your visual references here, or click to browse
          </div>
          <div className="inspiration-dropzone__subtitle">
            Upload local images from your computer · Aspect ratios preserved · Stored securely on your device
          </div>
          <Button
            variant="secondary"
            style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
          >
            <Plus size={14} /> Select Images from Computer
          </Button>
        </div>
      ) : (
        <>
          {/* Subtle dropzone bar for when images exist */}
          <div
            className={`inspiration-dropzone ${isDragging ? 'inspiration-dropzone--active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '16px 20px', flexDirection: 'row', gap: '16px', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)',
                }}
              >
                <Upload size={14} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Drag & drop more images here
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                  or click to upload from computer
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={12} /> Upload
            </Button>
          </div>

          {/* ── TOOLBAR: Search, Category Chips, Column Switcher ─────────── */}
          <div className="inspiration-toolbar">
            <div className="inspiration-toolbar__left">
              {/* Search input */}
              <div className="inspiration-search">
                <Search size={14} className="inspiration-search__icon" />
                <input
                  type="text"
                  placeholder="Search by title, category, or note..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="inspiration-search__input"
                />
                {searchQuery && (
                  <button
                    className="inspiration-search__clear"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category chips */}
              <div className="inspiration-categories">
                <button
                  className={`inspiration-chip ${selectedCategory === 'all' ? 'inspiration-chip--active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All ({inspirationImages.length})
                </button>
                {categories.map((cat) => {
                  const count = inspirationImages.filter(
                    (img) => (img.category || 'General').toLowerCase() === cat.toLowerCase()
                  ).length
                  return (
                    <button
                      key={cat}
                      className={`inspiration-chip ${
                        selectedCategory.toLowerCase() === cat.toLowerCase()
                          ? 'inspiration-chip--active'
                          : ''
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Column Switcher */}
            <div className="inspiration-toolbar__right">
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginRight: '4px' }}>
                Columns:
              </span>
              <button
                className={`inspiration-col-btn ${columnCount === 'auto' ? 'inspiration-col-btn--active' : ''}`}
                onClick={() => setColumnCount('auto')}
                title="Auto columns"
              >
                Auto
              </button>
              <button
                className={`inspiration-col-btn ${columnCount === '2' ? 'inspiration-col-btn--active' : ''}`}
                onClick={() => setColumnCount('2')}
                title="2 columns"
              >
                2
              </button>
              <button
                className={`inspiration-col-btn ${columnCount === '3' ? 'inspiration-col-btn--active' : ''}`}
                onClick={() => setColumnCount('3')}
                title="3 columns"
              >
                3
              </button>
              <button
                className={`inspiration-col-btn ${columnCount === '4' ? 'inspiration-col-btn--active' : ''}`}
                onClick={() => setColumnCount('4')}
                title="4 columns"
              >
                4
              </button>
            </div>
          </div>

          {/* ── MASONRY GRID ────────────────────────────────────────────── */}
          {displayedImages.length === 0 ? (
            <EmptyState
              title="No matching images found"
              description="Try adjusting your search query or category filter."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            />
          ) : (
            <div className={`inspiration-masonry inspiration-masonry--cols-${columnCount}`}>
              {displayedImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`inspiration-card ${image.pinned ? 'inspiration-card--pinned' : ''}`}
                  onClick={() => setSelectedImageId(image.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${image.title || 'image'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedImageId(image.id)
                    }
                  }}
                >
                  {/* Pin badge if pinned */}
                  {image.pinned && (
                    <div className="inspiration-card__pin-indicator">
                      <Pin size={10} fill="currentColor" /> Pinned
                    </div>
                  )}

                  {/* Image with natural aspect ratio */}
                  <div className="inspiration-card__image-wrap">
                    <img
                      src={image.imageData}
                      alt={image.title || 'Inspiration image'}
                      className="inspiration-card__img"
                      loading="lazy"
                    />

                    {/* Hover Overlay with Action Buttons */}
                    <div className="inspiration-card__overlay" onClick={(e) => e.stopPropagation()}>
                      <div className="inspiration-card__top-actions">
                        <button
                          className={`inspiration-action-btn ${
                            image.pinned ? 'inspiration-action-btn--pinned' : ''
                          }`}
                          onClick={() => togglePinInspirationImage(image.id)}
                          title={image.pinned ? 'Unpin image' : 'Pin image to top'}
                          aria-label={image.pinned ? 'Unpin image' : 'Pin image to top'}
                        >
                          <Pin size={13} fill={image.pinned ? 'currentColor' : 'none'} />
                        </button>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="inspiration-action-btn"
                            onClick={() => setSelectedImageId(image.id)}
                            title="Fullscreen preview"
                            aria-label="Fullscreen preview"
                          >
                            <Maximize2 size={13} />
                          </button>
                          <button
                            className="inspiration-action-btn"
                            onClick={() => deleteInspirationImage(image.id)}
                            title="Delete image"
                            aria-label="Delete image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="inspiration-card__bottom-actions">
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="inspiration-action-btn"
                            onClick={() => handleMoveImage(image.id, 'up')}
                            disabled={index === 0}
                            title="Move earlier"
                            aria-label="Move earlier"
                            style={{ opacity: index === 0 ? 0.4 : 1 }}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            className="inspiration-action-btn"
                            onClick={() => handleMoveImage(image.id, 'down')}
                            disabled={index === displayedImages.length - 1}
                            title="Move later"
                            aria-label="Move later"
                            style={{ opacity: index === displayedImages.length - 1 ? 0.4 : 1 }}
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                        <span
                          style={{
                            fontSize: '10px',
                            color: '#ffffff',
                            fontWeight: 500,
                            background: 'rgba(0, 0, 0, 0.6)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {image.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Info Box (Title, Caption, Category) */}
                  {(image.title || image.caption || image.category) && (
                    <div className="inspiration-card__info">
                      {image.title && <div className="inspiration-card__title">{image.title}</div>}
                      {image.caption && <div className="inspiration-card__caption">{image.caption}</div>}
                      <div className="inspiration-card__meta-bar">
                        <span className="inspiration-card__badge">{image.category || 'General'}</span>
                        {image.note && (
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                            Has notes
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── FULLSCREEN LIGHTBOX MODAL ────────────────────────────────── */}
      {activeImage && (
        <div className="inspiration-lightbox" onClick={() => setSelectedImageId(null)}>
          <div className="inspiration-lightbox__main" onClick={(e) => e.stopPropagation()}>
            {/* Top bar */}
            <div className="inspiration-lightbox__topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className="inspiration-lightbox__counter">
                  {activeIndex + 1} / {displayedImages.length}
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  {activeImage.title || 'Untitled Image'}
                </span>
                {activeImage.category && (
                  <span
                    style={{
                      fontSize: '11px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {activeImage.category}
                  </span>
                )}
              </div>

              <div className="inspiration-lightbox__top-actions">
                <button
                  className="inspiration-lightbox__btn"
                  onClick={() => togglePinInspirationImage(activeImage.id)}
                  title={activeImage.pinned ? 'Unpin image' : 'Pin image'}
                >
                  <Pin size={13} fill={activeImage.pinned ? 'currentColor' : 'none'} />
                  {activeImage.pinned ? 'Pinned' : 'Pin'}
                </button>

                <button
                  className="inspiration-lightbox__btn"
                  onClick={() => handleDownload(activeImage)}
                  title="Download image"
                >
                  <Download size={13} /> Download
                </button>

                <button
                  className="inspiration-lightbox__btn"
                  onClick={() => setShowLightboxSidebar(!showLightboxSidebar)}
                  title="Toggle details"
                >
                  <Info size={13} /> {showLightboxSidebar ? 'Hide Details' : 'Details'}
                </button>

                <button
                  className="inspiration-lightbox__btn"
                  onClick={() => {
                    deleteInspirationImage(activeImage.id)
                    setSelectedImageId(null)
                  }}
                  title="Delete image"
                  style={{ color: '#ff6b6b' }}
                >
                  <Trash2 size={13} />
                </button>

                <button
                  className="inspiration-lightbox__btn"
                  onClick={() => setSelectedImageId(null)}
                  title="Close lightbox (Esc)"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Viewport */}
            <div className="inspiration-lightbox__viewport">
              {displayedImages.length > 1 && (
                <>
                  <button
                    className="inspiration-lightbox__nav-btn inspiration-lightbox__nav-btn--prev"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrev()
                    }}
                    title="Previous image (Left Arrow)"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    className="inspiration-lightbox__nav-btn inspiration-lightbox__nav-btn--next"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNext()
                    }}
                    title="Next image (Right Arrow)"
                    aria-label="Next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              <img
                src={activeImage.imageData}
                alt={activeImage.title || 'Lightbox preview'}
                className="inspiration-lightbox__img"
              />
            </div>
          </div>

          {/* Details Sidebar / Drawer */}
          {showLightboxSidebar && (
            <div
              className="inspiration-lightbox__sidebar"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="inspiration-lightbox__sidebar-title">Image Details</span>
                <Button variant="ghost" size="xs" onClick={() => setShowLightboxSidebar(false)}>
                  <X size={14} />
                </Button>
              </div>

              {/* Title input */}
              <div className="inspiration-field-group">
                <label className="inspiration-label">Title</label>
                <input
                  type="text"
                  className="inspiration-input"
                  value={editDraft.title}
                  placeholder="Optional title..."
                  onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                  onBlur={handleSaveEdit}
                />
              </div>

              {/* Category input */}
              <div className="inspiration-field-group">
                <label className="inspiration-label">Category</label>
                <input
                  type="text"
                  className="inspiration-input"
                  value={editDraft.category}
                  placeholder="e.g. Architecture, Typography, Art..."
                  onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                  onBlur={handleSaveEdit}
                />
                {categories.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {categories.slice(0, 6).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setEditDraft({ ...editDraft, category: c })
                          updateInspirationImage({ ...activeImage, category: c })
                        }}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Caption input */}
              <div className="inspiration-field-group">
                <label className="inspiration-label">Caption / Description</label>
                <input
                  type="text"
                  className="inspiration-input"
                  value={editDraft.caption}
                  placeholder="Short visual description..."
                  onChange={(e) => setEditDraft({ ...editDraft, caption: e.target.value })}
                  onBlur={handleSaveEdit}
                />
              </div>

              {/* Notes textarea */}
              <div className="inspiration-field-group">
                <label className="inspiration-label">Personal Notes & Reflections</label>
                <textarea
                  className="inspiration-textarea"
                  value={editDraft.note}
                  placeholder="Why did you save this image? Color palette, composition idea, styling notes..."
                  onChange={(e) => setEditDraft({ ...editDraft, note: e.target.value })}
                  onBlur={handleSaveEdit}
                />
              </div>

              {/* Quick Save Confirmation */}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Check size={14} /> Save Details
              </Button>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

              {/* Metadata Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {activeImage.width && activeImage.height && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Dimensions</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {activeImage.width} × {activeImage.height} px
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Added</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {new Date(activeImage.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Status</span>
                  <span style={{ color: activeImage.pinned ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {activeImage.pinned ? 'Pinned to top' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
