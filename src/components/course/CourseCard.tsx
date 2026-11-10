import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, ArrowRight, Clock, Users } from 'lucide-react';
import { Course } from '../../types';
import { Card, Badge, Avatar } from '../ui';
import { getCourseMedia, getInstructorPhoto } from '../../config/media';
import { formatIDR } from '../../config/currency';
import { translateCategory, translateLevel } from '../../config/locale';

export interface CourseCardProps {
  course: Course;
  className?: string;
  showPrice?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className = '',
  showPrice = false,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const mediaItem = getCourseMedia(course.slug);
  const instructorPhoto = getInstructorPhoto(course.instructor.id);

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'technology':
        return 'technology';
      case 'business':
        return 'business';
      case 'design':
        return 'design';
      case 'development':
        return 'development';
      default:
        return 'neutral';
    }
  };

  return (
    <Card hoverable className={`relative flex flex-col overflow-hidden h-full group ${className}`}>
      <Link
        to={`/courses/${course.slug}`}
        aria-label={`Lihat kursus: ${course.title}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2"
      />
      {/* Thumbnail area */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={mediaItem.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top left category badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={getCategoryBadgeVariant(course.category)} size="xs">
            {translateCategory(course.category)}
          </Badge>
        </div>

        {/* Top right bookmark button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsBookmarked(!isBookmarked);
          }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isBookmarked
              ? 'bg-orange text-white'
              : 'bg-white/90 text-slate-600 hover:bg-white hover:text-navy shadow-sm'
          }`}
          aria-label="Simpan kursus"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Instructor row */}
          <div className="flex items-center gap-2 mb-2.5">
            <Avatar src={instructorPhoto} name={course.instructor.name} size="xs" />
            <span className="text-xs font-semibold text-slate-600 truncate">
              {course.instructor.name}
            </span>
          </div>

          {/* 2-line title */}
          <h3 className="text-base font-bold text-text-heading line-clamp-2 mb-2 group-hover:text-blue transition-colors">
            {course.title}
          </h3>

          {/* Meta row: weeks • level • students */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {course.totalDuration}
            </span>
            <span>•</span>
            <span>                        {translateLevel(course.level)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {course.enrolledCount.toLocaleString()} peserta
            </span>
          </div>

          {/* Price if requested */}
          {showPrice && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-extrabold text-text-heading">
                {formatIDR(course.price)}
              </span>
              {course.originalPrice > course.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatIDR(course.originalPrice)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom row: star rating on left, "View Course →" on right */}
        <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-800">{course.rating.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400">({course.reviewCount})</span>
          </div>

          <span className="text-xs font-bold text-navy inline-flex items-center gap-1">
            <span>Lihat Kursus</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Card>
  );
};
