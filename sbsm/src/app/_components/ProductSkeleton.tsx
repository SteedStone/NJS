"use client";

export default function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl p-3 sm:p-4 shadow-md h-full animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square w-full bg-gray-200 rounded-lg"></div>

      <div className="flex flex-col gap-2 flex-grow">
        {/* Product name skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        {/* Description skeleton */}
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        
        {/* Types badges skeleton */}
        <div className="flex flex-wrap gap-1 mt-1">
          <div className="h-5 bg-gray-200 rounded-full w-12"></div>
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        </div>
        
        {/* Availability skeleton */}
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        
        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        
        {/* Quantity controls skeleton */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="w-16 h-10 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Add to cart button skeleton */}
        <div className="mt-2">
          <div className="w-full h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}