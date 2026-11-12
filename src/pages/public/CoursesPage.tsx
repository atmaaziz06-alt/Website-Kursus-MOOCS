import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Filter, Star, ChevronDown } from 'lucide-react';
import { CourseCard } from '../../components/course/CourseCard';
import { Alert, Card, Chip, Button, Pagination } from '../../components/ui';
import { translateCategory, translateLevel } from '../../config/locale';
import { getCoursesPage } from '../../services/courseService';
import { Course } from '../../types';

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedLevel = searchParams.get('level') || 'All';
  const selectedPrice = searchParams.get('price') || 'all';
  const selectedRating = Number(searchParams.get('rating')) || 0;
  const sortBy = searchParams.get('sort') || 'newest';
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const ITEMS_PER_PAGE = 12;

  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      return next;
    });
  };
  const setSearchQuery = (value: string) => updateParams({ q: value || null, page: null });
  const setSelectedCategory = (value: string) =>
    updateParams({ category: value === 'All' ? null : value, page: null });
  const setSelectedLevel = (value: string) =>
    updateParams({ level: value === 'All' ? null : value, page: null });
  const setSelectedPrice = (value: string) =>
    updateParams({ price: value === 'all' ? null : value, page: null });
  const setSelectedRating = (value: number) =>
    updateParams({ rating: value ? String(value) : null, page: null });
  const setSortBy = (value: string) => updateParams({ sort: value, page: null });
  const setCurrentPage = (value: number) => updateParams({ page: value > 1 ? String(value) : null });

  const popularTags = ['Web Development', 'Python', 'Figma', 'Digital Marketing', 'Machine Learning'];

  // Categories config with exact counts
  const categoriesList = [
    { name: 'Technology', count: 24 },
    { name: 'Business', count: 18 },
    { name: 'Design', count: 16 },
    { name: 'Development', count: 20 },
    { name: 'Marketing', count: 14 },
    { name: 'Personal Growth', count: 12 },
  ];

  const levelsList = [
    { name: 'Beginner', count: 28 },
    { name: 'Intermediate', count: 15 },
    { name: 'Advanced', count: 5 },
  ];

  const handleResetFilters = () => {
    setSearchParams({});
  };

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setLoadError('');
      void getCoursesPage({
        search: searchQuery,
        category: selectedCategory,
        level: selectedLevel,
        price: selectedPrice as 'all' | 'paid' | 'free',
        minRating: selectedRating,
        sortBy: sortBy as 'newest' | 'highest-rated' | 'most-popular' | 'price-low' | 'price-high',
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      }).then((result) => {
        if (!active) return;
        setCourses(result.courses);
        setTotalCourses(result.total);
      }).catch((error: unknown) => {
        if (!active) return;
        setCourses([]);
        setTotalCourses(0);
        setLoadError(error instanceof Error ? error.message : 'Kursus tidak dapat dimuat.');
      }).finally(() => {
        if (active) setIsLoading(false);
      });
    }, searchQuery ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory, selectedLevel, selectedPrice, selectedRating, sortBy, currentPage, retryCount]);

  const totalPages = Math.ceil(totalCourses / ITEMS_PER_PAGE);
  const paginatedCourses = courses;
  const startIdx = totalCourses === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, totalCourses);

  return (
    <div className="bg-app min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue block mb-2">
            KATALOG KURSUS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-heading tracking-tight mb-3">
            Jelajahi Kursus
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
            Temukan program yang tepat untuk mengembangkan keterampilanmu melalui kurikulum industri dan bimbingan personal.
          </p>

          {/* Wide search bar */}
          <div className="relative flex items-center shadow-soft-md rounded-2xl bg-white border border-border overflow-hidden p-1.5 max-w-xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Cari kursus, mentor, teknologi, atau topik..."
              className="w-full px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            <Button
              variant="orange"
              size="md"
              onClick={() => setCurrentPage(1)}
              className="shrink-0 rounded-xl"
            >
              Cari
            </Button>
          </div>

          {/* Popular pills */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Populer:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                }}
                className="px-3 py-1 rounded-full bg-white border border-border text-slate-600 hover:border-blue hover:text-blue hover:bg-soft-blue/30 transition-all font-medium"
              >
                {{ 'Web Development': 'Pengembangan Web', Python: 'Python', Figma: 'Figma', 'Digital Marketing': 'Pemasaran Digital', 'Machine Learning': 'Pembelajaran Mesin' }[tag]}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
          <span className="text-sm font-bold text-text-heading">
            {isLoading ? 'Memuat kursus...' : `${totalCourses} Kursus Ditemukan`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            leftIcon={<Filter className="w-4 h-4 text-blue" />}
          >
            {isMobileFilterOpen ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </Button>
        </div>

        {/* Main Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sticky Filters Card (4 cols) */}
          <div className={`lg:col-span-4 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue" />
                  <h3 className="text-base font-bold text-text-heading">Filter</h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-orange hover:text-orange-dark flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Atur Ulang</span>
                </button>
              </div>

              {/* CATEGORIES */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  KATEGORI
                </span>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer hover:text-navy">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === 'All'}
                        onChange={() => {
                          setSelectedCategory('All');
                        }}
                        className="text-blue focus:ring-blue"
                      />
                      <span>Semua Kategori</span>
                    </div>
                    <span className="text-slate-400">48</span>
                  </label>
                  {categoriesList.map((cat) => (
                    <label
                      key={cat.name}
                      className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer hover:text-navy"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory.toLowerCase() === cat.name.toLowerCase()}
                          onChange={() => {
                            setSelectedCategory(cat.name);
                          }}
                          className="text-blue focus:ring-blue"
                        />
                        <span>{translateCategory(cat.name)}</span>
                      </div>
                      <span className="text-slate-400">{cat.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* LEVEL */}
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  TINGKAT
                </span>
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer hover:text-navy">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="level"
                        checked={selectedLevel === 'All'}
                        onChange={() => {
                          setSelectedLevel('All');
                        }}
                        className="text-blue focus:ring-blue"
                      />
                      <span>Semua Tingkat</span>
                    </div>
                    <span className="text-slate-400">48</span>
                  </label>
                  {levelsList.map((lvl) => (
                    <label
                      key={lvl.name}
                      className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer hover:text-navy"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="level"
                          checked={selectedLevel.toLowerCase() === lvl.name.toLowerCase()}
                          onChange={() => {
                            setSelectedLevel(lvl.name);
                          }}
                          className="text-blue focus:ring-blue"
                        />
                        <span>{translateLevel(lvl.name)}</span>
                      </div>
                      <span className="text-slate-400">{lvl.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* PRICE */}
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  HARGA
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === 'all'}
                      onChange={() => {
                        setSelectedPrice('all');
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <span>Semua Kursus</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === 'paid'}
                      onChange={() => {
                        setSelectedPrice('paid');
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <span>Berbayar (Rp290.000 - Rp990.000)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === 'free'}
                      onChange={() => {
                        setSelectedPrice('free');
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <span>Gratis</span>
                  </label>
                </div>
              </div>

              {/* RATING */}
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  RATING
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === 4.5}
                      onChange={() => {
                        setSelectedRating(4.5);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      <span>4,5 ke atas</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === 4.0}
                      onChange={() => {
                        setSelectedRating(4.0);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      <span>4,0 ke atas</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === 0}
                      onChange={() => {
                        setSelectedRating(0);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <span>Semua Rating</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Grid and Active Filter Chips (8 cols) */}
          <div className="lg:col-span-8">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-border shadow-sm">
              <div className="text-xs sm:text-sm font-semibold text-slate-700">
                {totalCourses > 0 ? (
                  <span>
                    Menampilkan <strong className="text-navy">{startIdx}-{endIdx}</strong> dari{' '}
                    <strong className="text-navy">{totalCourses}</strong> kursus
                  </span>
                ) : (
                  <span>{isLoading ? 'Memuat daftar kursus...' : 'Kursus yang sesuai tidak ditemukan'}</span>
                )}
              </div>

              {/* Active Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectedCategory !== 'All' && (
                  <Chip
                    variant="soft-blue"
                    size="sm"
                    onRemove={() => setSelectedCategory('All')}
                  >
                    {translateCategory(selectedCategory)}
                  </Chip>
                )}
                {selectedLevel !== 'All' && (
                  <Chip
                    variant="soft-blue"
                    size="sm"
                    onRemove={() => setSelectedLevel('All')}
                  >
                    {translateLevel(selectedLevel)}
                  </Chip>
                )}
                {selectedPrice !== 'all' && (
                  <Chip
                    variant="orange"
                    size="sm"
                    onRemove={() => setSelectedPrice('all')}
                  >
                    {selectedPrice === 'paid' ? 'Berbayar' : 'Gratis'}
                  </Chip>
                )}
                {selectedRating > 0 && (
                  <Chip
                    variant="soft-blue"
                    size="sm"
                    onRemove={() => setSelectedRating(0)}
                  >
                    ★ {selectedRating}+
                  </Chip>
                )}

                {/* Sort by dropdown */}
                <div className="relative inline-block ml-auto sm:ml-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-slate-50 border border-border text-slate-700 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-blue cursor-pointer"
                  >
                    <option value="newest">Urutkan: Terbaru</option>
                    <option value="highest-rated">Urutkan: Rating Tertinggi</option>
                    <option value="most-popular">Urutkan: Terpopuler</option>
                    <option value="price-low">Urutkan: Harga Terendah</option>
                    <option value="price-high">Urutkan: Harga Tertinggi</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3-Column Grid of Course Cards */}
            {loadError ? (
              <Alert type="error" className="my-6">
                <div className="flex flex-col items-start gap-3">
                  <span>{loadError}</span>
                  <Button variant="outline" size="sm" onClick={() => setRetryCount((count) => count + 1)}>
                    Coba lagi
                  </Button>
                </div>
              </Alert>
            ) : isLoading ? (
              <Card className="p-12 text-center my-6">
                <p className="text-sm font-bold text-text-heading">Memuat katalog kursus...</p>
              </Card>
            ) : paginatedCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                {paginatedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} showPrice />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center my-6">
                <div className="text-slate-400 text-base mb-2 font-bold">Tidak ada kursus yang sesuai dengan pilihanmu</div>
                <p className="text-xs text-slate-500 mb-6">Coba hapus beberapa filter atau cari topik lain.</p>
                <Button variant="orange" size="sm" onClick={handleResetFilters}>
                  Hapus Semua Filter
                </Button>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
