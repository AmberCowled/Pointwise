"use client";

import BackgroundGlow from "@pointwise/app/components/ui/BackgroundGlow";
import { Card } from "@pointwise/app/components/ui/Card";
import { Pagination } from "@pointwise/app/components/ui/Pagination";
import { useState } from "react";

export default function PaginationShowcasePage() {
  // State for different pagination examples
  const [smallPage, setSmallPage] = useState(1);
  const [largePage, setLargePage] = useState(5);
  const [primaryPage, setPrimaryPage] = useState(1);
  const [secondaryPage, setSecondaryPage] = useState(1);
  const [xsPage, setXsPage] = useState(1);
  const [smPage, setSmPage] = useState(1);
  const [mdPage, setMdPage] = useState(1);
  const [lgPage, setLgPage] = useState(1);
  const [xlPage, setXlPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Mock data for different scenarios
  const smallTotal = 25; // 3 pages with 10 per page
  const largeTotal = 1000; // 100 pages with 10 per page
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <BackgroundGlow />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Pagination Component Showcase
          </h1>
          <p className="text-sm text-zinc-400">
            Display of Pagination component variants, sizes, and use cases
          </p>
        </div>

        {/* Basic Usage */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Basic Usage</h2>
          <p className="text-xs text-zinc-500">
            Default pagination with standard settings (variant: primary, size:
            md)
          </p>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                <p>Small dataset (25 items, 10 per page)</p>
              </div>
              <Pagination
                currentPage={smallPage}
                pageSize={10}
                totalItems={smallTotal}
                onPageChange={setSmallPage}
                showPageSizeSelector={false}
              />
            </div>
          </Card>
        </section>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Variants</h2>
          <p className="text-xs text-zinc-500">
            Different visual styles for pagination
          </p>
          <div className="space-y-6">
            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Primary Variant (Default)
                </h3>
                <Pagination
                  currentPage={primaryPage}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={setPrimaryPage}
                  variant="primary"
                  showPageSizeSelector={false}
                />
              </div>
            </Card>

            <Card variant="secondary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Secondary Variant
                </h3>
                <Pagination
                  currentPage={secondaryPage}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={setSecondaryPage}
                  variant="secondary"
                  showPageSizeSelector={false}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Sizes</h2>
          <p className="text-xs text-zinc-500">
            Different size options for pagination
          </p>
          <div className="space-y-6">
            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Extra Small (xs)
                </h3>
                <Pagination
                  currentPage={xsPage}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={setXsPage}
                  size="xs"
                  showPageSizeSelector={false}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Small (sm)
                </h3>
                <Pagination
                  currentPage={smPage}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={setSmPage}
                  size="sm"
                  showPageSizeSelector={false}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Medium (md) - Default
                </h3>
                <Pagination
                  currentPage={mdPage}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={setMdPage}
                  size="md"
                  showPageSizeSelector={false}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Large (lg)
                </h3>
                <Pagination
                  currentPage={lgPage}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={setLgPage}
                  size="lg"
                  showPageSizeSelector={false}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Extra Large (xl)
                </h3>
                <Pagination
                  currentPage={xlPage}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={setXlPage}
                  size="xl"
                  showPageSizeSelector={false}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* With Page Size Selector */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            With Page Size Selector
          </h2>
          <p className="text-xs text-zinc-500">
            Pagination with page size selector enabled
          </p>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                <p>
                  Current page size:{" "}
                  <span className="font-semibold">{pageSize}</span>
                </p>
              </div>
              <Pagination
                currentPage={largePage}
                pageSize={pageSize}
                totalItems={largeTotal}
                onPageChange={setLargePage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={pageSizeOptions}
                showPageSizeSelector={true}
              />
            </div>
          </Card>
        </section>

        {/* Page Size Selector Only (No Item Count) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Page Size Selector Only
          </h2>
          <p className="text-xs text-zinc-500">
            Hide the item count text and show only the page size selector for a
            minimal layout
          </p>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                <p>
                  Minimal layout with only page size selector (no item count)
                </p>
              </div>
              <Pagination
                currentPage={largePage}
                pageSize={pageSize}
                totalItems={largeTotal}
                onPageChange={setLargePage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={pageSizeOptions}
                showItemCount={false}
                showPageSizeSelector={true}
              />
            </div>
          </Card>
        </section>

        {/* Navigation Only (No Left Side) */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Navigation Only
          </h2>
          <p className="text-xs text-zinc-500">
            Minimal pagination with only page navigation buttons, no item count
            or page size selector
          </p>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                <p>Clean, minimal pagination for space-constrained layouts</p>
              </div>
              <Pagination
                currentPage={largePage}
                pageSize={pageSize}
                totalItems={largeTotal}
                onPageChange={setLargePage}
                showItemCount={false}
                showPageSizeSelector={false}
              />
            </div>
          </Card>
        </section>

        {/* Edge Cases */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">Edge Cases</h2>
          <p className="text-xs text-zinc-500">
            Testing pagination behavior in edge cases
          </p>
          <div className="space-y-6">
            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  First Page (Previous disabled)
                </h3>
                <Pagination
                  currentPage={1}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={() => {}}
                  showPageSizeSelector={false}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Last Page (Next disabled)
                </h3>
                <Pagination
                  currentPage={10}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={() => {}}
                  showPageSizeSelector={false}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Single Page (Both buttons disabled)
                </h3>
                <Pagination
                  currentPage={1}
                  pageSize={20}
                  totalItems={15}
                  onPageChange={() => {}}
                  showPageSizeSelector={false}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Empty State (0 items)
                </h3>
                <Pagination
                  currentPage={1}
                  pageSize={20}
                  totalItems={0}
                  onPageChange={() => {}}
                  showPageSizeSelector={false}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Loading States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Loading States
          </h2>
          <p className="text-xs text-zinc-500">
            Pagination in loading state with disabled controls and spinner
            indicators
          </p>
          <div className="space-y-6">
            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Loading State (Default)
                </h3>
                <p className="text-xs text-zinc-500">
                  All controls are disabled and spinners appear in Previous/Next
                  buttons
                </p>
                <Pagination
                  currentPage={5}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={() => {}}
                  isLoading={true}
                  showPageSizeSelector={true}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Loading State (Minimal - No Item Count)
                </h3>
                <p className="text-xs text-zinc-500">
                  Loading state with page size selector only (no item count)
                </p>
                <Pagination
                  currentPage={5}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={() => {}}
                  isLoading={true}
                  showItemCount={false}
                  showPageSizeSelector={true}
                />
              </div>
            </Card>

            <Card variant="primary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Loading State (Small Size)
                </h3>
                <p className="text-xs text-zinc-500">
                  Loading state with smaller size variant
                </p>
                <Pagination
                  currentPage={5}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={() => {}}
                  isLoading={true}
                  size="sm"
                  showPageSizeSelector={true}
                />
              </div>
            </Card>

            <Card variant="secondary" responsivePadding>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">
                  Loading State (Secondary Variant)
                </h3>
                <p className="text-xs text-zinc-500">
                  Loading state with secondary variant styling
                </p>
                <Pagination
                  currentPage={5}
                  pageSize={20}
                  totalItems={200}
                  onPageChange={() => {}}
                  isLoading={true}
                  variant="secondary"
                  showPageSizeSelector={true}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Full Featured Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Full Featured Example
          </h2>
          <p className="text-xs text-zinc-500">
            All features enabled: page size selector
          </p>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                <p>
                  Page {largePage} of {Math.ceil(largeTotal / pageSize)} | Page
                  size: {pageSize} | Total: {largeTotal} items
                </p>
              </div>
              <Pagination
                currentPage={largePage}
                pageSize={pageSize}
                totalItems={largeTotal}
                onPageChange={setLargePage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={pageSizeOptions}
                showPageSizeSelector={true}
              />
            </div>
          </Card>
        </section>

        {/* Ellipsis Example */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Ellipsis for Large Page Counts
          </h2>
          <p className="text-xs text-zinc-500">
            When there are many pages, ellipsis (…) shows hidden pages. Try
            navigating to see the ellipsis appear.
          </p>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                <p>50 pages total - navigate to see ellipsis behavior</p>
              </div>
              <Pagination
                currentPage={largePage}
                pageSize={20}
                totalItems={1000}
                onPageChange={setLargePage}
                showPageSizeSelector={false}
              />
            </div>
          </Card>
        </section>

        {/* Responsive Behavior */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-200">
            Responsive Behavior
          </h2>
          <p className="text-xs text-zinc-500">
            Pagination adapts to screen size. On mobile, item count and page
            size selector are hidden, and page numbers dynamically fill
            available space. Desktop shows all features and adapts button count
            to container width.
          </p>
          <Card variant="primary" responsivePadding>
            <div className="space-y-4">
              <div className="text-sm text-zinc-300">
                <p>Resize your browser window to see responsive behavior</p>
              </div>
              <Pagination
                currentPage={largePage}
                pageSize={pageSize}
                totalItems={largeTotal}
                onPageChange={setLargePage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={pageSizeOptions}
                showPageSizeSelector={true}
              />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
