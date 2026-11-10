import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, RotateCcw, Filter, Star, ChevronDown } from 'lucide-react';
import { CourseCard } from '../../components/course/CourseCard';
import { Card, Chip, Button, Pagination } from '../../components/ui';
import { mockCourses } from '../../data/mockData';

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [selectedLevel, setSelectedLevel] = useState<string>(searchParams.get('level') || 'All');
  const [selectedPrice, setSelectedPrice] = useState<string>(searchParams.get('price') || 'all');
  const [selectedRating, setSelectedRating] = useState<number>(Number(searchParams.get('rating')) || 0);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  const ITEMS_PER_PAGE = 12;

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

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSelectedPrice('all');
    setSelectedRating(0);
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(1);
  };

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(q);
        const matchesSub = course.subtitle.toLowerCase().includes(q);
        const matchesInstructor = course.instructor.name.toLowerCase().includes(q);
        const matchesCategory = course.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub && !matchesInstructor && !matchesCategory) return false;
      }

      // Category
      if (selectedCategory !== 'All' && course.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Level
      if (selectedLevel !== 'All' && course.level.toLowerCase() !== selectedLevel.toLowerCase()) {
        return false;
      }

      // Price
      if (selectedPrice === 'free' && course.price > 0) return false;
      if (selectedPrice === 'paid' && course.price === 0) return false;

      // Rating
      if (selectedRating > 0 && course.rating < selectedRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'highest-rated') return b.rating - a.rating;
      if (sortBy === 'most-popular') return b.enrolledCount - a.enrolledCount;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0; // 'newest'
    });
  }, [searchQuery, selectedCategory, selectedLevel, selectedPrice, selectedRating, sortBy]);

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filteredCourses.length);

  return (
    <div className="bg-app min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue block mb-2">
            CATALOG DIRECTORY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-heading tracking-tight mb-3">
            Explore Our Courses
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
            Find the right program to upgrade your skills with industry-curated curriculums and personalized mentorship.
          </p>

          {/* Wide search bar */}
          <div className="relative flex items-center shadow-soft-md rounded-2xl bg-white border border-border overflow-hidden p-1.5 max-w-xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search courses, mentors, technologies, topics..."
              className="w-full px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            <Button
              variant="orange"
              size="md"
              onClick={() => setCurrentPage(1)}
              className="shrink-0 rounded-xl"
            >
              Search
            </Button>
          </div>

          {/* Popular pills */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Popular:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 rounded-full bg-white border border-border text-slate-600 hover:border-blue hover:text-blue hover:bg-soft-blue/30 transition-all font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm">
          <span className="text-sm font-bold text-text-heading">
            {filteredCourses.length} Courses Found
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            leftIcon={<Filter className="w-4 h-4 text-blue" />}
          >
            {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
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
                  <h3 className="text-base font-bold text-text-heading">Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-orange hover:text-orange-dark flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              </div>

              {/* CATEGORIES */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  CATEGORIES
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
                          setCurrentPage(1);
                        }}
                        className="text-blue focus:ring-blue"
                      />
                      <span>All Categories</span>
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
                            setCurrentPage(1);
                          }}
                          className="text-blue focus:ring-blue"
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-slate-400">{cat.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* LEVEL */}
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  LEVEL
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
                          setCurrentPage(1);
                        }}
                        className="text-blue focus:ring-blue"
                      />
                      <span>All Levels</span>
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
                            setCurrentPage(1);
                          }}
                          className="text-blue focus:ring-blue"
                        />
                        <span>{lvl.name}</span>
                      </div>
                      <span className="text-slate-400">{lvl.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* PRICE */}
              <div className="pt-4 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  PRICE
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === 'all'}
                      onChange={() => {
                        setSelectedPrice('all');
                        setCurrentPage(1);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <span>All Courses</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === 'paid'}
                      onChange={() => {
                        setSelectedPrice('paid');
                        setCurrentPage(1);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <span>Paid ($29 - $99)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === 'free'}
                      onChange={() => {
                        setSelectedPrice('free');
                        setCurrentPage(1);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <span>Free</span>
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
                        setCurrentPage(1);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      <span>4.5 & up</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === 4.0}
                      onChange={() => {
                        setSelectedRating(4.0);
                        setCurrentPage(1);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      <span>4.0 & up</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === 0}
                      onChange={() => {
                        setSelectedRating(0);
                        setCurrentPage(1);
                      }}
                      className="text-blue focus:ring-blue"
                    />
                    <span>All Ratings</span>
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
                {filteredCourses.length > 0 ? (
                  <span>
                    Showing <strong className="text-navy">{startIdx}-{endIdx}</strong> of{' '}
                    <strong className="text-navy">{filteredCourses.length}</strong> courses
                  </span>
                ) : (
                  <span>No matching courses found</span>
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
                    {selectedCategory}
                  </Chip>
                )}
                {selectedLevel !== 'All' && (
                  <Chip
                    variant="soft-blue"
                    size="sm"
                    onRemove={() => setSelectedLevel('All')}
                  >
                    {selectedLevel}
                  </Chip>
                )}
                {selectedPrice !== 'all' && (
                  <Chip
                    variant="orange"
                    size="sm"
                    onRemove={() => setSelectedPrice('all')}
                  >
                    {selectedPrice === 'paid' ? 'Paid' : 'Free'}
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
                    <option value="newest">Sort by: Newest</option>
                    <option value="highest-rated">Sort by: Highest Rated</option>
                    <option value="most-popular">Sort by: Most Popular</option>
                    <option value="price-low">Sort by: Price: Low to High</option>
                    <option value="price-high">Sort by: Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3-Column Grid of Course Cards */}
            {paginatedCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                {paginatedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} showPrice />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center my-6">
                <div className="text-slate-400 text-base mb-2 font-bold">No courses match your active criteria</div>
                <p className="text-xs text-slate-500 mb-6">Try clearing some filters or searching for another topic.</p>
                <Button variant="orange" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
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

